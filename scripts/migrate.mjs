import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import pg from "pg";

const { Client } = pg;

const url = process.env.POSTGRES_URL_NON_POOLING;
if (!url) {
  console.error("POSTGRES_URL_NON_POOLING is not set");
  process.exit(1);
}

const migrationsDir = join(import.meta.dirname, "..", "supabase", "migrations");
const files = (await readdir(migrationsDir))
  .filter((f) => f.endsWith(".sql"))
  .sort();

if (files.length === 0) {
  console.error("No migrations found");
  process.exit(1);
}

const client = new Client({
  connectionString: url.replace(/[?&]sslmode=[^&]*/g, ""),
  ssl: { rejectUnauthorized: false },
});

try {
  await client.connect();
  if (process.argv.includes("--reset")) {
    await client.query(
      "delete from public.checks; delete from public.incident_updates; delete from public.incident_monitors; delete from public.incidents; delete from public.monitors;"
    );
    console.log("Reset: cleared checks/incidents/monitors");
  }
  for (const file of files) {
    const sql = await readFile(join(migrationsDir, file), "utf8");
    await client.query(sql);
    console.log(`Applied ${file}`);
  }
  console.log("Migrations applied successfully");
} catch (err) {
  console.error("Migration failed:", err.message);
  process.exitCode = 1;
} finally {
  await client.end();
}
