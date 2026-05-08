// src/routes/reports.js
import { Router } from "express";
import { pool } from "../database.js";

const router = Router();

/**
 * GET /api/reports/last
 * Retorna o último report_number criado na tabela reports_list
 * Exemplo de resposta: { report_number: 'RPT-012' }
 */
router.get("/last", async (req, res) => {
  try {
    const [rows] = await pool.execute(
      `SELECT report_number
       FROM reports_list
       ORDER BY id DESC
       LIMIT 1`
    );
    if (rows.length === 0) {
      return res.json({ report_number: "RPT-000" });
    }
    return res.json({ report_number: rows[0].report_number });
  } catch (err) {
    console.error("[reports] Error fetching last report number:", err);
    return res
      .status(500)
      .json({ error: "Erro ao obter último report_number" });
  }
});

export default router;

// ------------------------- DRAFTS -------------------------

/**
 * POST /api/reports/draft
 * body: { reportNumber, user, data }
 * cria/atualiza rascunho
 */
router.post("/draft", async (req, res) => {
  try {
    const { reportNumber, user, data } = req.body;
    if (!reportNumber || !user || !data) {
      return res
        .status(400)
        .json({ error: "reportNumber, user e data são obrigatórios" });
    }
    await pool.execute(
      `INSERT INTO report_drafts (report_number, user, data, status)
       VALUES (?, ?, ?, 'draft')
       ON DUPLICATE KEY UPDATE data=VALUES(data), user=VALUES(user), status='draft'`,
      [reportNumber, user, JSON.stringify(data)]
    );
    res.json({ ok: true, reportNumber });
  } catch (err) {
    console.error("[reports/draft] erro ao salvar:", err);
    res.status(500).json({ error: "Erro ao salvar rascunho" });
  }
});

/**
 * GET /api/reports/draft/:reportNumber
 * devolve rascunho por número
 */
router.get("/draft/:reportNumber", async (req, res) => {
  try {
    const { reportNumber } = req.params;
    const [rows] = await pool.execute(
      "SELECT report_number, user, data, status, updated_at FROM report_drafts WHERE report_number = ?",
      [reportNumber]
    );
    if (!rows.length)
      return res.status(404).json({ error: "Rascunho não encontrado" });
    res.json(rows[0]);
  } catch (err) {
    console.error("[reports/draft] erro ao obter:", err);
    res.status(500).json({ error: "Erro ao carregar rascunho" });
  }
});

/**
 * GET /api/reports/drafts?user=foo
 * lista rascunhos do utilizador
 */
router.get("/drafts", async (req, res) => {
  try {
    const { user } = req.query;
    const [rows] = await pool.execute(
      `SELECT report_number, user, status, updated_at
         FROM report_drafts
        WHERE status='draft' AND (? IS NULL OR user = ?)
        ORDER BY updated_at DESC`,
      [user || null, user || null]
    );
    res.json(rows);
  } catch (err) {
    console.error("[reports/drafts] erro ao listar:", err);
    res.status(500).json({ error: "Erro ao listar rascunhos" });
  }
});

/**
 * POST /api/reports/draft/:reportNumber/finalize
 * marca rascunho como finalizado
 */
router.post("/draft/:reportNumber/finalize", async (req, res) => {
  try {
    const { reportNumber } = req.params;
    const [r] = await pool.execute(
      'UPDATE report_drafts SET status="finalized" WHERE report_number = ?',
      [reportNumber]
    );
    if (r.affectedRows === 0)
      return res.status(404).json({ error: "Rascunho não encontrado" });
    res.json({ ok: true, reportNumber, status: "finalized" });
  } catch (err) {
    console.error("[reports/draft] erro ao finalizar:", err);
    res.status(500).json({ error: "Erro ao finalizar rascunho" });
  }
});

/**
 * DELETE /api/reports/draft/:reportNumber
 * remove rascunho
 */
router.delete("/draft/:reportNumber", async (req, res) => {
  try {
    const { reportNumber } = req.params;
    await pool.execute("DELETE FROM report_drafts WHERE report_number = ?", [
      reportNumber,
    ]);
    res.json({ ok: true });
  } catch (err) {
    console.error("[reports/draft] erro ao apagar:", err);
    res.status(500).json({ error: "Erro ao apagar rascunho" });
  }
});

// GET /api/reports/next
router.get("/next", async (_req, res) => {
  try {
    const [rows] = await pool.execute(`
      SELECT CONCAT('RPT-', LPAD(CAST(max_num + 1 AS CHAR), max_len, '0')) AS report_number
      FROM (
        SELECT
          COALESCE(MAX(CAST(REGEXP_SUBSTR(report_number, '[0-9]+') AS UNSIGNED)), 0) AS max_num,
          COALESCE(MAX(CHAR_LENGTH(REGEXP_SUBSTR(report_number, '[0-9]+'))), 3) AS max_len
        FROM (
          SELECT report_number FROM reports_list
          UNION ALL
          SELECT report_number FROM report_drafts
        ) u
      ) x
    `);
    res.json({ report_number: rows[0].report_number });
  } catch (err) {
    console.error("[reports/next] erro:", err);
    // fallback simples caso REGEXP_SUBSTR não exista: começa em RPT-001
    res.json({ report_number: "RPT-001" });
  }
});

router.delete("/draft/:reportNumber", async (req, res) => {
  try {
    const { reportNumber } = req.params;
    const [r] = await pool.execute(
      "DELETE FROM report_drafts WHERE report_number = ?",
      [reportNumber]
    );
    if (r.affectedRows === 0)
      return res.status(404).json({ error: "Rascunho não encontrado" });
    res.json({ ok: true });
  } catch (err) {
    console.error("[reports/draft] erro ao apagar:", err);
    res.status(500).json({ error: "Erro ao apagar rascunho" });
  }
});
