const dotenv = require("dotenv");
const path = require("path");

dotenv.config({ path: path.resolve(process.cwd(), ".env") });

const user = process.env.DB_USER;
const password = process.env.DB_PASSWORD;
const host = process.env.DB_HOST;
const port = process.env.DB_PORT;
const database = process.env.DB_NAME;

if (!user || !password || !host || !port || !database) {
  throw new Error("Database connection parameters missing in .env");
}

module.exports = {
  databaseUrl: `postgres://${user}:${password}@${host}:${port}/${database}`,
  dir: "./migrations",
  migrationsTable: "pgmigrations",
};
