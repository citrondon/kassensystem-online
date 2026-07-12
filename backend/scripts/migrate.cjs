const dotenv = require("dotenv");
const path = require("path");
const { execSync } = require("child_process");

dotenv.config({ path: path.resolve(process.cwd(), ".env") });

const user = process.env.DB_USER;
const password = process.env.DB_PASSWORD;
const host = process.env.DB_HOST;
const port = process.env.DB_PORT;
const database = process.env.DB_NAME;

if (!user || !password || !host || !port || !database) {
  console.error("Database connection parameters missing in .env");
  process.exit(1);
}

const databaseUrl = `postgres://${user}:${password}@${host}:${port}/${database}`;
const direction = process.argv[2] || "up";

execSync(
  `npx node-pg-migrate --migrations-dir ./migrations ${direction}`,
  {
    env: { ...process.env, DATABASE_URL: databaseUrl },
    stdio: "inherit",
  }
);
