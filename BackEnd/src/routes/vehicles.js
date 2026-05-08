// src/routes/vehicles.js
import { Router } from "express";
import { pool } from "../database.js";

const router = Router();

/**
 * GET /api/vehicles
 * Query params:
 *  - activeOnly=1  -> só ativos
 *  - region=XYZ    -> só dessa region
 */
router.get("/", async (req, res) => {
  try {
    const { activeOnly, region } = req.query;

    const where = [];
    const params = [];

    // Ajusta o nome da coluna conforme a tua DB:
    // - se for "is_active" -> mantém
    // - se for outro nome, muda aqui
    if (String(activeOnly) === "1") {
      where.push("is_active = 1");
    }

    if (region && String(region).trim() !== "") {
      where.push("region = ?");
      params.push(String(region).trim());
    }

    const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";

    const [rows] = await pool.execute(
      `SELECT
         idvehicle_list AS id,
         plate_number,
         falsec_number,
         brand,
         vehicle_type,
         region,
         is_active,
         created_at,
         reports_count,
         CONCAT(plate_number,' ',brand,' ',vehicle_type) AS label
       FROM accident_report.vehicle_list
       ${whereSql}
       ORDER BY plate_number`,
      params,
    );

    res.json(rows);
  } catch (err) {
    console.error("[vehicles] erro a listar:", err);
    res.status(500).json({ error: "Erro ao buscar veículos." });
  }
});

/**
 * GET /api/vehicles/:id
 */
router.get("/:id", async (req, res) => {
  try {
    const [rows] = await pool.execute(
      `SELECT
         idvehicle_list AS id,
         plate_number,
         falsec_number,
         brand,
         vehicle_type,
         region,
         created_at,
         is_active
       FROM accident_report.vehicle_list
       WHERE idvehicle_list = ?`,
      [req.params.id],
    );

    if (!rows.length) return res.status(404).json({ error: "Não encontrado" });
    res.json(rows[0]);
  } catch (err) {
    console.error("[vehicles] erro a obter:", err);
    res.status(500).json({ error: "Erro ao buscar veículo." });
  }
});

/**
 * POST /api/vehicles
 */
router.post("/", async (req, res) => {
  try {
    const {
      plate_number,
      falsec_number,
      brand,
      vehicle_type,
      region = null,
    } = req.body || {};

    if (!plate_number?.trim())
      return res.status(400).json({ error: "plate_number é obrigatório." });

    const [result] = await pool.execute(
      `INSERT INTO accident_report.vehicle_list
        (plate_number, falsec_number, brand, vehicle_type, region, is_active)
       VALUES (?, ?, ?, ?, ?, 1)`,
      [
        String(plate_number).trim().toUpperCase(),
        String(falsec_number || "")
          .trim()
          .toUpperCase(),
        String(brand || "").trim(),
        String(vehicle_type || "").trim(),
        region === null || region === "" ? null : String(region).trim(),
      ],
    );

    res.status(201).json({ id: result.insertId });
  } catch (err) {
    // erro comum: duplicado da matrícula (uq_vehicle_plate)
    if (String(err?.code) === "ER_DUP_ENTRY") {
      return res.status(409).json({ error: "Matrícula já existe." });
    }
    console.error("[vehicles] erro a criar:", err);
    res.status(500).json({ error: "Erro ao criar veículo." });
  }
});

/**
 * PUT /api/vehicles/:id
 * usado no toggle do admin: { is_active: 0|1 }
 * também permite atualizar campos se precisares
 */
router.put("/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!id) return res.status(400).json({ error: "ID inválido." });

    const allowed = [
      "plate_number",
      "falsec_number",
      "brand",
      "vehicle_type",
      "region",
      "is_active",
    ];

    const sets = [];
    const values = [];

    for (const k of allowed) {
      if (req.body?.[k] === undefined) continue;

      if (k === "plate_number") {
        sets.push(`${k} = ?`);
        values.push(String(req.body[k]).trim().toUpperCase());
        continue;
      }
      if (k === "falsec_number") {
        sets.push(`${k} = ?`);
        values.push(String(req.body[k]).trim().toUpperCase());
        continue;
      }
      if (k === "region") {
        const v = req.body[k];
        sets.push(`${k} = ?`);
        values.push(
          v === null || String(v).trim() === "" ? null : String(v).trim(),
        );
        continue;
      }
      sets.push(`${k} = ?`);
      values.push(req.body[k]);
    }

    if (!sets.length)
      return res.status(400).json({ error: "Nada para atualizar." });

    values.push(id);

    const [r] = await pool.execute(
      `UPDATE accident_report.vehicle_list
       SET ${sets.join(", ")}
       WHERE idvehicle_list = ?`,
      values,
    );

    if (!r.affectedRows)
      return res.status(404).json({ error: "Não encontrado" });

    res.json({ ok: true });
  } catch (err) {
    console.error("[vehicles] erro a atualizar:", err);
    res.status(500).json({ error: "Erro ao atualizar veículo." });
  }
});

// routes/vehicles.js
router.get("/statistics", async (req, res) => {
  try {
    const [statusData] = await db.query(`
      SELECT
        SUM(CASE WHEN is_active = 1 THEN 1 ELSE 0 END) AS ativos,
        SUM(CASE WHEN is_active = 0 THEN 1 ELSE 0 END) AS inativos
      FROM vehicles
    `);

    const [reportsData] = await db.query(`
      SELECT plate_number AS plate, reports
      FROM vehicles
      WHERE reports > 0
    `);

    res.json({
      status: statusData[0],
      reports: reportsData,
    });
  } catch (error) {
    console.error("Erro ao buscar estatísticas:", error);
    res.status(500).json({ error: "Erro ao buscar estatísticas" });
  }
});

export default router;
