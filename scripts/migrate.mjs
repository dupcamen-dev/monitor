import { readFile } from "node:fs/promises";
import pg from "pg";

const { Client } = pg;

const url = process.env.POSTGRES_URL_NON_POOLING;
if (!url) {
  console.error("POSTGRES_URL_NON_POOLING is not set");
  process.exit(1);
}

const sql = await readFile(new URL("../supabase/migrations/0001_init.sql", import.meta.url), "utf8");

const client = new Client({
  connectionString: url.replace(/[?&]sslmode=[^&]*/g, ""),
  ssl: { rejectUnauthorized: false },
});

try {
  await client.connect();
  if (process.argv.includes("--reset")) {
    await client.query(
      "delete from public.checks; delete from public.incident_monitors; delete from public.incidents; delete from public.monitors;"
    );
    console.log("Reset: cleared checks/incidents/monitors");
  }
  await client.query(sql);
  console.log("Migration applied successfully");
} catch (err) {
  console.error("Migration failed:", err.message);
  process.exitCode = 1;
} finally {
  await client.end();
}
