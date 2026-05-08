// src/routes/users,js
import { Router } from "express";
import { pool } from "../database.js";
import bcrypt from "bcrypt";

const router = Router();

// GET /api/users
router.get("/", async (_req, res) => {
  try {
    const [rows] = await pool.execute(
      "SELECT id, name, email, role, region, shift, CASE WHEN password_hash IS NULL OR password_hash = '' THEN '' ELSE '••••••••••••' END AS password_hash, is_active FROM users ORDER BY id DESC"
    );
    res.json(rows);
  } catch (err) {
    console.error("[users] Error fetching users:", err);
    res.status(500).json({ error: "Erro ao obter utilizadores" });
  }
});

// PATCH /api/users/:id
router.patch("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const allowedFields = ["role", "region", "shift"];
    const sets = [];
    const params = [];

    for (const field of allowedFields) {
      if (req.body?.[field] !== undefined) {
        sets.push(`${field} = ?`);
        params.push(req.body[field]);
      }
    }

    if (req.body.password) {
      const hashed = await bcrypt.hash(req.body.password, 10);
      sets.push("password_hash = ?");
      params.push(hashed);
    }

    if (!sets.length) {
      return res
        .status(400)
        .json({ error: "Nenhum campo válido para atualizar." });
    }

    params.push(id);

    const [result] = await pool.execute(
      `UPDATE users SET ${sets.join(", ")}, updated_at = NOW() WHERE id = ?`,
      params
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Utilizador não encontrado." });
    }

    res.json({ success: true });
  } catch (err) {
    console.error("[users] PATCH error:", err);
    res.status(500).json({ error: "Erro ao atualizar utilizador." });
  }

  const { shift, role, region, is_active, password } = req.body;

  if (is_active != null && ![0, 1].includes(Number(is_active))) {
    return res.status(400).json({ error: "is_active inválido (0 ou 1)" });
  }

  if (is_active != null) {
    fields.push("is_active = ?");
    values.push(Number(is_active));
  }
});

// PUT /api/users/:id → atualizar dados de um user (incluindo is_active)
router.put("/:id", async (req, res) => {
  const id = Number(req.params.id);
  const { is_active } = req.body;

  if (!Number.isInteger(id)) {
    return res.status(400).json({ error: "ID inválido" });
  }

  if (typeof is_active !== "number" || ![0, 1].includes(is_active)) {
    return res.status(400).json({ error: "is_active inválido" });
  }

  try {
    const [result] = await pool.execute(
      "UPDATE users SET is_active = ? WHERE id = ?",
      [is_active, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Usuário não encontrado" });
    }

    return res.status(200).json({ message: "Estado atualizado com sucesso" });
  } catch (err) {
    console.error("Erro ao atualizar usuário:", err);
    res.status(500).json({ error: "Erro interno ao atualizar usuário" });
  }
});

export default router;
