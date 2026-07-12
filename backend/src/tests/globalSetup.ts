import dotenv from "dotenv";
import path from "path";
import { execSync } from "child_process";
import { Client } from "pg";

dotenv.config({ path: path.resolve(process.cwd(), ".env.test") });

const TEST_DB = process.env.DB_NAME!;
const ADMIN_DB = "postgres";

async function createTestDatabase(): Promise<void> {
  const adminClient = new Client({
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    database: ADMIN_DB,
  });

  await adminClient.connect();
  await adminClient.query(`DROP DATABASE IF EXISTS ${TEST_DB}`);
  await adminClient.query(`CREATE DATABASE ${TEST_DB}`);
  await adminClient.end();
}

async function runMigrations(): Promise<void> {
  const user = process.env.DB_USER;
  const password = process.env.DB_PASSWORD;
  const host = process.env.DB_HOST;
  const port = process.env.DB_PORT;
  const database = process.env.DB_NAME;

  if (!user || !password || !host || !port || !database) {
    throw new Error("Database connection parameters missing in .env.test");
  }

  const databaseUrl = `postgres://${user}:${password}@${host}:${port}/${database}`;

  execSync("npx node-pg-migrate --migrations-dir ./migrations up", {
    env: { ...process.env, DATABASE_URL: databaseUrl },
    stdio: "inherit",
  });
}

async function dropTestDatabase(): Promise<void> {
  const adminClient = new Client({
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    database: ADMIN_DB,
  });

  await adminClient.connect();
  await adminClient.query(`DROP DATABASE IF EXISTS ${TEST_DB}`);
  await adminClient.end();
}

export default async function (): Promise<() => Promise<void>> {
  await createTestDatabase();
  await runMigrations();
  return async () => {
    await dropTestDatabase();
  };
}
