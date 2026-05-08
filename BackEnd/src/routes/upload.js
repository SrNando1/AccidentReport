// src/routes/upload.js
import { Router } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { pool } from "../database.js";

const router = Router();
const BASE_UPLOAD = path.join(process.cwd(), "uploads");

// Multer com destino dinâmico baseado no report_number
const storage = multer.diskStorage({
  destination: (req, _file, cb) => {
    const reportNumber = req.body.report_number;
    if (!reportNumber) {
      return cb(new Error("report_number não enviado"), null);
    }
    // Cria pasta uploads/<reportNumber> se não existir
    const dir = path.join(BASE_UPLOAD, reportNumber);
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (_req, file, cb) => {
    // Prefixa com timestamp para evitar colisões
    const uniqueName = `${Date.now()}_${file.originalname}`;
    cb(null, uniqueName);
  },
});

const upload = multer({ storage });

/**
 * POST /api/upload/file
 * Recebe form-data: user, report_number, file
 * Salva em uploads/<reportNumber>/<timestamp>_nome.ext
 */
router.post("/file", upload.single("file"), async (req, res) => {
  try {
    // logs de diagnóstico
    console.log("[/api/upload/file] body:", req.body);
    console.log(
      "[/api/upload/file] file:",
      req.file && {
        originalname: req.file.originalname,
        filename: req.file.filename,
        path: req.file.path,
        size: req.file.size,
      },
    );

    // validações (evita 'undefined' na query)
    const user = (req.body.user || "").trim();
    const report_number = (req.body.report_number || "").trim();
    const finalState = (req.body.state || "PENDING").toUpperCase();

    if (!user) return res.status(400).json({ error: "user obrigatório" });
    if (!report_number)
      return res.status(400).json({ error: "report_number obrigatório" });
    if (!req.file)
      return res.status(400).json({
        error: "file não enviado (campo form-data deve chamar-se 'file')",
      });

    // normaliza o level (1..25) com fallback para 1
    const rawLevel = Number(req.body.level);
    const safeLevel =
      Number.isInteger(rawLevel) && rawLevel >= 1 && rawLevel <= 25
        ? rawLevel
        : 1;

    // user_id numérico (pode ser NULL se a coluna permitir)
    const rawUserId = Number(req.body.user_id);
    const safeUserId = Number.isInteger(rawUserId) ? rawUserId : null;

    const filePath = `${report_number}/${req.file.filename}`;

    const rawEmployerId = Number(req.body.employer_id);
    const safeEmployerId =
      Number.isInteger(rawEmployerId) && rawEmployerId > 0
        ? rawEmployerId
        : null;

    const rawVehicleId = Number(req.body.vehicle_id);
    const safeVehicleId =
      Number.isInteger(rawVehicleId) && rawVehicleId > 0 ? rawVehicleId : null;

    await pool.execute(
      `INSERT INTO reports_list (
        user,
        report_number,
        route,
        state,
        level,
        user_id,
        employers_id,
        vehicle_id
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        user,
        report_number,
        filePath,
        finalState,
        safeLevel,
        safeUserId,
        safeEmployerId,
        safeVehicleId,
      ],
    );

    return res.status(201).json({
      ok: true,
      reportNumber: report_number,
      state: finalState,
      level: safeLevel,
      user_id: safeUserId,
      filename: req.file.filename,
      path: filePath,
    });
  } catch (err) {
    console.error("[/api/upload/file] erro:", err);
    return res
      .status(500)
      .json({ error: err?.message || "Falha no upload do arquivo" });
  }
});

/**
 * GET /api/upload/download/:reportNumber/:filename
 * Força o download de uploads/<reportNumber>/<filename>
 */
router.get("/download/:reportNumber/:filename", (req, res) => {
  const { reportNumber, filename } = req.params;
  const filePath = path.join(BASE_UPLOAD, reportNumber, filename);

  fs.access(filePath, fs.constants.R_OK, (err) => {
    if (err) {
      console.error("[download] File not found:", filePath);
      return res.status(404).json({ error: "Arquivo não encontrado." });
    }
    res.download(filePath, filename, (downloadErr) => {
      if (downloadErr && !res.headersSent) {
        console.error("[download] Error:", downloadErr);
        res.status(500).json({ error: "Erro ao fazer download." });
      }
    });
  });
});

/**
 * GET /api/upload/list
 * Retorna JSON com report_number, user as customer, route AS filename, created_at AS datetime
 */
router.get("/list", async (_req, res) => {
  try {
    const [rows] = await pool.execute(
      `SELECT
         r.report_number,
         r.\`user\`        AS user,
         r.route         AS filename,
         r.created_at    AS datetime,
         r.user_id,
         r.state,
         r.validate_by,
         r.rejected_why,
         r.validate_stamp,
         r.level,
         r.employers_id,
         e.full_name     AS employer_name, -- ← ADICIONADO
         u.shift         AS Shift,
         COALESCE(v.name, v.email, CAST(v.id AS CHAR)) AS validator_name
        FROM reports_list r
        LEFT JOIN users u ON u.id = r.user_id
        LEFT JOIN users v ON v.id = r.validate_by
        LEFT JOIN employers e ON e.employers_id = r.employers_id -- ← ADICIONADO
        ORDER BY r.created_at DESC`,
    );
    res.json(rows);
  } catch (err) {
    console.error("[upload.list] erro lendo banco:", err);
    res.status(500).json({ error: "Erro ao buscar lista de relatórios." });
  }
});

// --- atualizar o estado de um report ---
const ALLOWED_STATES = new Set(["PENDING", "APPROVED", "REJECTED"]);

/**
 * POST /api/upload/state
 * Body JSON: { report_number: string, state: "PENDING"|"APPROVED"|"REJECTED" }
 */
router.post("/state", async (req, res) => {
  try {
    const { report_number, state, rejected_why, validate_by } = req.body || {};
    if (!report_number || !state) {
      return res
        .status(400)
        .json({ error: "report_number e state são obrigatórios" });
    }
    const next = String(state).toUpperCase();
    if (!ALLOWED_STATES.has(next)) {
      return res.status(400).json({ error: "state inválido" });
    }

    // 1) Buscar dados do report
    const [rows] = await pool.execute(
      `SELECT state, level, employers_id
         FROM reports_list
        WHERE report_number = ?`,
      [report_number],
    );

    console.log("[/api/upload/state] Dados do relatório:", rows[0]);

    if (!rows.length) {
      return res.status(404).json({ error: "report não encontrado" });
    }
    const current = rows[0];

    // 2) Se for aprovação e tiver dados válidos, somar ao sms_score
    if (
      next === "APPROVED" &&
      current.employers_id != null &&
      current.level != null
    ) {
      const delta = Number(current.level);
      if (Number.isFinite(delta) && delta > 0) {
        console.log("[/api/upload/state] Somando ao sms_score:", {
          employers_id: current.employers_id,
          delta,
        });
        await pool.execute(
          `UPDATE employers
             SET sms_score = COALESCE(sms_score, 0) + ?
           WHERE employers_id = ?`,
          [delta, current.employers_id],
        );
      } else {
        console.warn("[/api/upload/state] delta inválido:", delta);
      }
    } else {
      console.warn(
        "[/api/upload/state] Sem employers_id ou level para somar:",
        {
          employers_id: current.employers_id,
          level: current.level,
        },
      );
    }

    // 3) Atualiza estado normalmente
    let sql, params;
    if (next === "REJECTED") {
      const why = String(rejected_why || "").slice(0, 120);
      sql = `UPDATE reports_list
               SET state = ?, rejected_why = ?, validate_by = ?, validate_stamp = NOW()
             WHERE report_number = ?`;
      params = [next, why, validate_by ?? null, report_number];
    } else if (next === "APPROVED") {
      sql = `UPDATE reports_list
               SET state = ?, rejected_why = NULL, validate_by = ?, validate_stamp = NOW()
             WHERE report_number = ?`;
      params = [next, validate_by ?? null, report_number];
    } else {
      sql = `UPDATE reports_list
                SET state = ?, rejected_why = NULL, validate_by = NULL, validate_stamp = NULL
             WHERE report_number = ?`;
      params = [next, report_number];
    }

    const [result] = await pool.execute(sql, params);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "report não encontrado" });
    }

    return res.json({ ok: true, report_number, state: next });
  } catch (e) {
    console.error("[upload.state] erro:", e);
    return res.status(500).json({ error: "falha ao atualizar estado" });
  }
});

/**
 * PUT /api/upload/state?report_number=...&state=...
 * (compatível com o fallback do frontend)
 */
router.put("/state", async (req, res) => {
  req.body = {
    report_number: req.query.report_number,
    state: req.query.state,
  };
  return router.handle(req, res, () => {}, "post");
});

// POST /api/upload/level
// --- gravar o nível de risco (1..25) ---
router.post("/level", async (req, res) => {
  console.log("[/api/upload/level] body:", req.body);
  try {
    const { report_number, level } = req.body || {};
    if (!report_number) {
      return res.status(400).json({ error: "report_number é obrigatório" });
    }
    const n = Number(level);
    if (!Number.isInteger(n) || n < 1 || n > 25) {
      return res
        .status(400)
        .json({ error: "level deve ser inteiro entre 1 e 25" });
    }

    const [r] = await pool.execute(
      "UPDATE reports_list SET level = ? WHERE report_number = ?",
      [n, report_number],
    );
    if (r.affectedRows === 0) {
      return res.status(404).json({ error: "report não encontrado" });
    }
    return res.json({ ok: true, report_number, level: n });
  } catch (e) {
    console.error("[upload.level] erro:", e);
    return res.status(500).json({ error: "falha ao atualizar level" });
  }
});

export default router;
