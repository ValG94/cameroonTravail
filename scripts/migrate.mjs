import postgres from "postgres";
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import { config } from "dotenv";

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, "../.env") });

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error("DATABASE_URL is required");
  process.exit(1);
}

const sql = postgres(databaseUrl, { ssl: "require", max: 1 });
const migrationFile = resolve(__dirname, "../drizzle/0000_red_ultragirl.sql");
const migration = readFileSync(migrationFile, "utf-8");
const statements = migration
  .split("--> statement-breakpoint")
  .map((s) => s.trim())
  .filter(Boolean);

console.log(`Applying ${statements.length} statements...\n`);

let applied = 0;
let skipped = 0;

for (const stmt of statements) {
  const preview = stmt.substring(0, 70).replace(/\n/g, " ");
  try {
    await sql.unsafe(stmt);
    console.log(`✓ ${preview}`);
    applied++;
  } catch (err) {
    // 42P07 = relation already exists, 42710 = type already exists, 42P06 = schema already exists
    if (["42P07", "42710", "42P06"].includes(err.code)) {
      console.log(`⚠ Already exists (skip): ${preview}`);
      skipped++;
    } else {
      console.error(`✗ Failed: ${err.message}\n  Statement: ${preview}`);
      await sql.end();
      process.exit(1);
    }
  }
}

await sql.end();
console.log(`\nDone — ${applied} applied, ${skipped} skipped.`);
