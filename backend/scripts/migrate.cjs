const dotenv = require("dotenv");
const path = require("path");
const { execSync } = require("child_process");

dotenv.config({ path: path.resolve(process.cwd(), ".env") });

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  const user = process.env.DB_USER;
  const password = process.env.DB_PASSWORD;
  const host = process.env.DB_HOST;
  const port = process.env.DB_PORT;
  const database = process.env.DB_NAME;

  if (!user || !password || !host || !port || !database) {
    console.error("Database connection parameters missing. Set DATABASE_URL or DB_* vars.");
    process.exit(1);
  }

  process.env.DATABASE_URL = `postgres://${user}:${password}@${host}:${port}/${database}`;
}

const direction = process.argv[2] || "up";

execSync(
  `npx node-pg-migrate --migrations-dir ./migrations ${direction}`,
  {
    env: { ...process.env, DATABASE_URL: process.env.DATABASE_URL },
    stdio: "inherit",
  }
);
