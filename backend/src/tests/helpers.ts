import bcrypt from "bcrypt";
import request from "supertest";
import { app } from "../server.js";
import pool from "../utils/pool.js";

export async function createTestUser(
  username: string,
  password: string,
  role: "manager" | "cashier"
): Promise<void> {
  const hash = await bcrypt.hash(password, 10);
  await pool.query(
    `INSERT INTO users (username, password_hash, role) VALUES ($1, $2, $3)
     ON CONFLICT (username) DO UPDATE SET password_hash = EXCLUDED.password_hash, role = EXCLUDED.role`,
    [username, hash, role]
  );
}

export async function loginAs(
  role: "manager" | "cashier"
): Promise<{ token: string; username: string }> {
  const username = role === "manager" ? "testmanager" : "testcashier";
  const password = "testpass";
  await createTestUser(username, password, role);

  const res = await request(app).post("/api/auth/login").send({
    username,
    password,
  });

  if (!res.body.success) {
    throw new Error(`Test login failed: ${res.body.error}`);
  }

  return { token: res.body.token, username };
}
