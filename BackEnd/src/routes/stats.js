// src/routes/stats.js
import { Router } from "express";
import { pool } from "../database.js";

const router = Router();

// GET /api/stats/overview?days=30  (cards do topo)
router.get("/overview", async (req, res) => {
  const days = Math.max(1, Math.min(365, Number(req.query.days) || 30));
  try {
    const [rows] = await pool.execute(
      `
      SELECT
        (SELECT COUNT(*) FROM reports_list
          WHERE created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)) AS reports_last_days,

        (SELECT COUNT(*) FROM reports_list
          WHERE state='PENDING') AS pending_now,

        (SELECT COUNT(*) FROM reports_list
          WHERE state='PENDING' AND level BETWEEN 15 AND 25) AS critical_pending_now,

        (SELECT ROUND(
            SUM(state='APPROVED') / NULLIF(SUM(state IN ('APPROVED','REJECTED')), 0),
          3)
         FROM reports_list
         WHERE created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
        ) AS approval_rate_last_days,

        (SELECT ROUND(AVG(TIMESTAMPDIFF(HOUR, created_at, validate_stamp)), 1)
         FROM reports_list
         WHERE state IN ('APPROVED','REJECTED')
           AND validate_stamp IS NOT NULL
           AND created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
        ) AS avg_validation_hours_last_days
      `,
      [days, days, days],
    );

    res.json({ days, ...rows[0] });
  } catch (e) {
    console.error("[stats/overview]", e);
    res.status(500).json({ error: "Erro ao obter overview" });
  }
});

// GET /api/stats/reports/by-day?days=30
router.get("/reports/by-day", async (req, res) => {
  const days = Math.max(1, Math.min(365, Number(req.query.days) || 30));
  try {
    const [rows] = await pool.execute(
      `
      SELECT DATE(created_at) AS day, COUNT(*) AS total
      FROM reports_list
      WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
      GROUP BY DATE(created_at)
      ORDER BY day
      `,
      [days],
    );
    res.json(rows);
  } catch (e) {
    console.error("[stats/reports/by-day]", e);
    res.status(500).json({ error: "Erro ao obter reports por dia" });
  }
});

// GET /api/stats/reports/by-day-state?days=30  (barras empilhadas)
router.get("/reports/by-day-state", async (req, res) => {
  const days = Math.max(1, Math.min(365, Number(req.query.days) || 30));
  try {
    const [rows] = await pool.execute(
      `
      SELECT DATE(created_at) AS day,
             SUM(state='PENDING')  AS pending,
             SUM(state='APPROVED') AS approved,
             SUM(state='REJECTED') AS rejected
      FROM reports_list
      WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
      GROUP BY DATE(created_at)
      ORDER BY day
      `,
      [days],
    );
    res.json(rows);
  } catch (e) {
    console.error("[stats/reports/by-day-state]", e);
    res.status(500).json({ error: "Erro ao obter reports por estado/dia" });
  }
});

// GET /api/stats/reports/level-bins?days=90
router.get("/reports/level-bins", async (req, res) => {
  const days = Math.max(1, Math.min(365, Number(req.query.days) || 90));
  try {
    const [rows] = await pool.execute(
      `
      SELECT
        CASE
          WHEN level BETWEEN  1 AND  5 THEN '1-5'
          WHEN level BETWEEN  6 AND 10 THEN '6-10'
          WHEN level BETWEEN 11 AND 15 THEN '11-15'
          WHEN level BETWEEN 16 AND 20 THEN '16-20'
          ELSE '21-25'
        END AS level_bin,
        COUNT(*) AS total
      FROM reports_list
      WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
      GROUP BY level_bin
      ORDER BY FIELD(level_bin,'1-5','6-10','11-15','16-20','21-25')
      `,
      [days],
    );
    res.json(rows);
  } catch (e) {
    console.error("[stats/reports/level-bins]", e);
    res.status(500).json({ error: "Erro ao obter distribuição de level" });
  }
});

// GET /api/stats/reports/rejection-reasons?days=180
router.get("/reports/rejection-reasons", async (req, res) => {
  const days = Math.max(1, Math.min(365, Number(req.query.days) || 180));
  try {
    const [rows] = await pool.execute(
      `
      SELECT rejected_why AS reason, COUNT(*) AS total
      FROM reports_list
      WHERE state='REJECTED'
        AND created_at >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
        AND rejected_why IS NOT NULL AND rejected_why <> ''
      GROUP BY rejected_why
      ORDER BY total DESC
      LIMIT 10
      `,
      [days],
    );
    res.json(rows);
  } catch (e) {
    console.error("[stats/reports/rejection-reasons]", e);
    res.status(500).json({ error: "Erro ao obter motivos de rejeição" });
  }
});

// GET /api/stats/reports/validators?days=180
router.get("/reports/validators", async (req, res) => {
  const days = Math.max(1, Math.min(365, Number(req.query.days) || 180));
  try {
    const [rows] = await pool.execute(
      `
      SELECT validate_by,
             COUNT(*) AS total_validated,
             SUM(state='APPROVED') AS approved,
             SUM(state='REJECTED') AS rejected
      FROM reports_list
      WHERE state IN ('APPROVED','REJECTED')
        AND validate_by IS NOT NULL
        AND created_at >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
      GROUP BY validate_by
      ORDER BY total_validated DESC
      `,
      [days],
    );
    res.json(rows);
  } catch (e) {
    console.error("[stats/reports/validators]", e);
    res.status(500).json({ error: "Erro ao obter stats por validador" });
  }
});

// GET /api/stats/drafts/aging  (drafts por “idade”)
router.get("/drafts/aging", async (_req, res) => {
  try {
    const [rows] = await pool.execute(
      `
      SELECT
        SUM(TIMESTAMPDIFF(DAY, updated_at, NOW()) <= 7) AS d0_7,
        SUM(TIMESTAMPDIFF(DAY, updated_at, NOW()) BETWEEN 8 AND 14) AS d8_14,
        SUM(TIMESTAMPDIFF(DAY, updated_at, NOW()) BETWEEN 15 AND 30) AS d15_30,
        SUM(TIMESTAMPDIFF(DAY, updated_at, NOW()) > 30) AS d30_plus
      FROM report_drafts
      WHERE status='draft'
      `,
    );
    res.json(rows[0]);
  } catch (e) {
    console.error("[stats/drafts/aging]", e);
    res.status(500).json({ error: "Erro ao obter aging de drafts" });
  }
});

// GET /api/stats/employers/sms/top?limit=10
router.get("/employers/sms/top", async (req, res) => {
  const limit = Math.max(1, Math.min(50, Number(req.query.limit) || 10));
  try {
    const [rows] = await pool.execute(
      `
      SELECT employers_id, full_name, employee_number, company, region, shift, sms_score
      FROM employers
      ORDER BY COALESCE(sms_score,0) DESC
      LIMIT ?
      `,
      [limit],
    );
    res.json(rows);
  } catch (e) {
    console.error("[stats/employers/sms/top]", e);
    res.status(500).json({ error: "Erro ao obter top sms_score" });
  }
});

// GET /api/stats/employers/sms/by?group=region|company|shift|employee_function
router.get("/employers/sms/by", async (req, res) => {
  const group = String(req.query.group || "region");
  const allowed = new Set(["region", "company", "shift", "employee_function"]);
  if (!allowed.has(group)) {
    return res.status(400).json({ error: "group inválido" });
  }
  try {
    const [rows] = await pool.execute(
      `
      SELECT ${group} AS label,
             SUM(COALESCE(sms_score,0)) AS total_sms,
             AVG(COALESCE(sms_score,0)) AS avg_sms
      FROM employers
      GROUP BY ${group}
      ORDER BY total_sms DESC
      `,
    );
    res.json(rows);
  } catch (e) {
    console.error("[stats/employers/sms/by]", e);
    res.status(500).json({ error: "Erro ao obter sms_score agrupado" });
  }
});

router.get("/statistics", async (req, res) => {
  try {
    // CORREÇÃO 1: Usar 'pool' (importado no topo) em vez de req.app.get("db")

    // 1. Contagem de veículos ativos vs inativos
    const [statusRows] = await pool.query(`
      SELECT
        SUM(CASE WHEN is_active = 1 THEN 1 ELSE 0 END) AS ativos,
        SUM(CASE WHEN is_active = 0 THEN 1 ELSE 0 END) AS inativos
      FROM vehicles
    `);

    // 2. Relatórios por veículo (CORREÇÃO 2: Query completa com LEFT JOIN)
    // O LEFT JOIN garante que trazemos o veículo mesmo que tenha 0 relatórios
    // 'label' e 'value' são nomes padrão que facilitam no frontend
    const [vehicleRows] = await pool.query(`
      SELECT 
        v.license_plate AS label, 
        COUNT(r.id) AS value
      FROM vehicles v
      LEFT JOIN reports_list r ON v.id = r.vehicle_id
      GROUP BY v.id, v.license_plate
      ORDER BY value DESC
      LIMIT 5
    `);

    // Retornamos um objeto estruturado
    res.json({
      pieChart: statusRows[0], // { ativos: X, inativos: Y }
      barChart: vehicleRows, //Array de { label: 'AA-00-00', value: 5 }
    });
  } catch (e) {
    console.error("[stats/statistics]", e);
    res.status(500).json({ error: "Erro ao obter estatísticas gerais" });
  }
});

// GET /api/stats/vehicles/statistics
router.get("/vehicles/statistics", async (_req, res) => {
  try {
    const [statusRows] = await pool.query(`
      SELECT
        SUM(CASE WHEN is_active = 1 THEN 1 ELSE 0 END) AS ativos,
        SUM(CASE WHEN is_active = 0 THEN 1 ELSE 0 END) AS inativos
      FROM vehicle_list
    `);

    const [vehicleRows] = await pool.query(`
      SELECT 
        v.plate_number AS label, 
        COUNT(r.id) AS value
      FROM vehicle_list v
      LEFT JOIN reports_list r ON v.idvehicle_list = r.vehicle_id
      GROUP BY v.idvehicle_list, v.plate_number
      ORDER BY value DESC
      LIMIT 5
    `);

    res.json({
      status: statusRows[0],
      reports: vehicleRows.map((r) => ({
        plate: r.label,
        reports: Number(r.value || 0),
      })),
    });
  } catch (e) {
    console.error("[stats/vehicles/statistics]", e);
    res.status(500).json({ error: "Erro ao obter estatísticas de veículos" });
  }
});

export default router;
