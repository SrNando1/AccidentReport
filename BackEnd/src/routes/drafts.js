// src/routes/drafts.js
import { Router } from "express";
import { pool } from "../database.js";

const router = Router();

/**
 * POST /api/drafts
 * Cria/atualiza rascunho
 */
router.post("/", async (req, res) => {
  try {
    const { reportNumber, user, data } = req.body;
    if (!reportNumber || !user || !data) {
      return res.status(400).json({ error: "Campos obrigatórios em falta" });
    }
    await pool.execute(
      `INSERT INTO report_drafts (report_number, user, data, status)
       VALUES (?, ?, ?, 'draft')
       ON DUPLICATE KEY UPDATE data = VALUES(data), user = VALUES(user), status='draft'`,
      [reportNumber, user, JSON.stringify(data)]
    );
    res.json({ ok: true, reportNumber });
  } catch (err) {
    console.error("[drafts] erro ao salvar:", err);
    res.status(500).json({ error: "Erro ao salvar rascunho" });
  }
});

/**
 * GET /api/drafts/:reportNumber
 * Lê um rascunho específico
 */
router.get("/:reportNumber", async (req, res) => {
  try {
    const [rows] = await pool.execute(
      "SELECT report_number, user, data, status, updated_at FROM report_drafts WHERE report_number = ?",
      [req.params.reportNumber]
    );
    if (!rows.length)
      return res.status(404).json({ error: "Rascunho não encontrado" });
    res.json(rows[0]);
  } catch (err) {
    console.error("[drafts] erro ao ler:", err);
    res.status(500).json({ error: "Erro ao carregar rascunho" });
  }
});

/**
 * GET /api/drafts?user=xxx
 * Lista rascunhos de um utilizador
 */
router.get("/", async (req, res) => {
  try {
    const { user } = req.query;
    const [rows] = await pool.execute(
      `SELECT report_number, user, status, updated_at
       FROM report_drafts
       WHERE (? IS NULL OR user = ?)
         AND status='draft'
       ORDER BY updated_at DESC`,
      [user || null, user || null]
    );
    res.json(rows);
  } catch (err) {
    console.error("[drafts] erro ao listar:", err);
    res.status(500).json({ error: "Erro ao listar rascunhos" });
  }
});

/**
 * POST /api/drafts/:reportNumber/finalize
 */
router.post("/:reportNumber/finalize", async (req, res) => {
  try {
    const [result] = await pool.execute(
      'UPDATE report_drafts SET status="finalized" WHERE report_number = ?',
      [req.params.reportNumber]
    );
    if (result.affectedRows === 0)
      return res.status(404).json({ error: "Não encontrado" });
    res.json({ ok: true });
  } catch (err) {
    console.error("[drafts] erro ao finalizar:", err);
    res.status(500).json({ error: "Erro ao finalizar rascunho" });
  }
});

/**
 * DELETE /api/drafts/:reportNumber
 */
router.delete("/:reportNumber", async (req, res) => {
  try {
    await pool.execute("DELETE FROM report_drafts WHERE report_number = ?", [
      req.params.reportNumber,
    ]);
    res.json({ ok: true });
  } catch (err) {
    console.error("[drafts] erro ao apagar:", err);
    res.status(500).json({ error: "Erro ao apagar rascunho" });
  }
});

export default router;
