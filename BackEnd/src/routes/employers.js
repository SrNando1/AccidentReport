// src/routes/employers.js
import { Router } from "express";
import { pool } from "../database.js";

const router = Router();

// GET /api/employers
router.get("/", async (_req, res) => {
  console.log("➡️ CHEGOU AO POST /api/employers");
  try {
    const [rows] = await pool.execute(`
       SELECT
        e.employers_id,
        e.full_name,
        e.employee_number,
        e.employee_function,
        e.shift,
        e.license_number_ana,
        e.validity_ana,
        e.category_ana,
        e.civil_license_number,
        e.validity_civil,
        e.category_civil,
        e.formation,
        e.region,
        e.company,
        e.birth_date,
        e.contract_date,
        e.sms_score,
        CASE
          WHEN COALESCE(rc.report_count, 0) > 0
            THEN ROUND(COALESCE(e.sms_score, 0) / rc.report_count, 2)
          ELSE 0
        END AS sms_average,
        e.created_at,
        e.updated_at
      FROM employers e
      LEFT JOIN (
        SELECT employers_id, COUNT(*) AS report_count
        FROM reports_list
        WHERE employers_id IS NOT NULL
        GROUP BY employers_id
      ) rc ON rc.employers_id = e.employers_id
      ORDER BY e.employers_id DESC
    `);

    res.json(rows);
  } catch (err) {
    console.error("[employers] Error fetching employers:", err);
    res.status(500).json({ error: "Erro ao obter employers" });
  }
});

// PATCH /api/employers/:id/sms/add  => body: { delta: number }
router.patch("/:id/sms/add", async (req, res) => {
  const { id } = req.params;
  const { delta } = req.body || {};
  const n = Number(delta);
  if (!Number.isFinite(n)) {
    return res.status(400).json({ error: "delta inválido" });
  }
  try {
    // soma com COALESCE para evitar null
    const [result] = await pool.execute(
      `UPDATE employers
         SET sms_score = COALESCE(sms_score, 0) + ?
       WHERE employers_id = ?`,
      [n, id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Employer não encontrado" });
    }
    // retorna o novo valor
    const [rows] = await pool.execute(
      `SELECT employers_id, sms_score FROM employers WHERE employers_id = ?`,
      [id]
    );
    res.json(rows[0]);
  } catch (err) {
    console.error("[employers] Error updating sms_score:", err);
    res.status(500).json({ error: "Erro ao atualizar sms_score" });
  }
});

router.post("/", async (req, res) => {
  try {
    const {
      full_name,
      employee_number,
      employee_function,
      shift,
      license_number_ana,
      validity_ana,
      category_ana,
      civil_license_number,
      validity_civil,
      category_civil,
      formation,
      region,
      company,
      birth_date,
      contract_date,
    } = req.body;

    const [result] = await pool.execute(
      `INSERT INTO employers (
    full_name,
    employee_number,
    employee_function,
    shift,
    license_number_ana,
    validity_ana,
    category_ana,
    civil_license_number,
    validity_civil,
    category_civil,
    formation,
    region,
    company,
    birth_date,
    contract_date
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        full_name,
        employee_number,
        employee_function,
        shift,
        license_number_ana,
        validity_ana,
        category_ana,
        civil_license_number,
        validity_civil,
        category_civil,
        formation,
        region,
        company,
        birth_date,
        contract_date,
      ]
    );

    // ✅ Aqui sim:
    console.log("Resultado do INSERT:", result);

    res
      .status(201)
      .json({ message: "Employer criado com sucesso", id: result.insertId });
  } catch (err) {
    console.error("Erro real:", err.message, err.stack);
    console.error("[employers] Erro ao criar employer:", err);
    res.status(500).json({ error: "Erro ao criar employer" });
  }
});

//api/employers/unassigned

router.get("/unassigned", async (req, res) => {
  try {
    const [rows] = await pool.execute(`
      SELECT e.employers_id, e.full_name
      FROM employers e
      LEFT JOIN users u ON e.employers_id = u.employers_id
      WHERE u.employers_id IS NULL
    `);

    res.json(rows);
  } catch (err) {
    console.error("Erro ao obter employers não atribuídos:", err);
    res.status(500).json({ error: "Erro interno" });
  }
});

export default router;
