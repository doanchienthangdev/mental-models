#!/usr/bin/env node
import fs from "fs";
import path from "path";
import { Client } from "pg";
import dotenv from "dotenv";

// Load env from .env.local or .env if present
const localEnvPath = path.resolve(process.cwd(), ".env.local");
const envPath = fs.existsSync(localEnvPath) ? localEnvPath : path.resolve(process.cwd(), ".env");
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
}

const [, , fileArg] = process.argv;
if (!fileArg) {
  console.error("Usage: node scripts/run-sql.js <path-to-sql>");
  process.exit(1);
}

const dbUrl = process.env.SUPABASE_DB_URL;
if (!dbUrl) {
  console.error("Missing SUPABASE_DB_URL env");
  process.exit(1);
}

const sqlPath = path.resolve(process.cwd(), fileArg);
if (!fs.existsSync(sqlPath)) {
  console.error(`SQL file not found: ${sqlPath}`);
  process.exit(1);
}

const sql = fs.readFileSync(sqlPath, "utf8");

async function run() {
  const client = new Client({ connectionString: dbUrl, ssl: { rejectUnauthorized: false } });
  await client.connect();
  try {
    await client.query(sql);
    console.log(`Executed SQL from ${fileArg}`);
  } finally {
    await client.end();
  }
}

run().catch((err) => {
  console.error("SQL execution failed:", err);
  process.exit(1);
});
