import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { pool } from "../database.js";
import "dotenv/config";
import { createUser, findUserByEmail } from "../models/userModel.js";

const SALT_ROUNDS = 10;
const JWT_SECRET = process.env.JWT_SECRET;

export async function register(req, res) {
  console.log("[auth.register] body recebido:", req.body);
  try {
    const { name, email, password, role, region, shift, employers_id } =
      req.body;

    // validações básicas
    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ error: "name, email e password são obrigatórios." });
    }

    // podes pôr defaults se quiseres
    const finalRole = role || "AERO";
    const finalRegion = region || "LIS";
    const finalShift = shift || "A";

    // verificar se já existe utilizador com este email
    const [existing] = await pool.execute(
      "SELECT id FROM users WHERE email = ?",
      [email],
    );
    if (existing.length > 0) {
      return res
        .status(400)
        .json({ error: "Já existe um user com este email." });
    }

    // hash da password
    const passwordHash = await bcrypt.hash(password, 10);

    // **IMPORTANTE**: inserir também region e shift
    await pool.execute(
      `INSERT INTO users (name, email, password_hash, role, region, shift, employers_id)
   VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        name,
        email,
        passwordHash,
        finalRole,
        finalRegion,
        finalShift,
        employers_id,
      ],
    );

    return res.status(201).json({ message: "User criado com sucesso." });
  } catch (err) {
    console.error("[auth.register] Erro ao registar user:", err);
    return res.status(500).json({ error: "Erro interno" });
  }
}

export async function login(req, res) {
  try {
    const { email, password } = req.body;

    const [rows] = await pool.execute("SELECT * FROM users WHERE email = ?", [
      email,
    ]);

    const user = rows[0];
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    if (user.is_active === 0) {
      return res
        .status(403)
        .json({ error: "User deactivated. Please contact the administrator." });
    }

    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign({ sub: user.id, email: user.email }, JWT_SECRET, {
      expiresIn: "8h",
    });

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        region: user.region, // <-- ADD
        shift: user.shift, // <-- opcional
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro interno" });
  }
}
