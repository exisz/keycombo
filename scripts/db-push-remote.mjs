#!/usr/bin/env node
/**
 * Push Prisma migration SQL to remote Turso database.
 *
 * Usage:
 *   node scripts/db-push-remote.mjs <migration-folder>
 *
 * Example:
 *   pnpm db:migrate --name init
 *   node scripts/db-push-remote.mjs 20260326_init
 *
 * Requires: TURSO_DATABASE_URL and TURSO_AUTH_TOKEN in .env.local
 * (run `vercel env pull .env.local` first)
 */

import { createClient } from "@libsql/client";
import { readFileSync, readdirSync } from "fs";
import { join } from "path";

const migrationsDir = "prisma/migrations";

// Find the migration folder
const folderArg = process.argv[2];
let migrationFolder;

if (folderArg) {
  // Partial match: find folder containing the argument
  const folders = readdirSync(migrationsDir).filter((f) =>
    f.includes(folderArg)
  );
  if (folders.length === 0) {
    console.error(`No migration folder matching "${folderArg}"`);
    process.exit(1);
  }
  migrationFolder = folders[0];
} else {
  // No arg: use the latest migration
  const folders = readdirSync(migrationsDir)
    .filter((f) => !f.startsWith(".") && f !== "migration_lock.toml")
    .sort();
  if (folders.length === 0) {
    console.error("No migrations found in prisma/migrations/");
    process.exit(1);
  }
  migrationFolder = folders[folders.length - 1];
}

const sqlPath = join(migrationsDir, migrationFolder, "migration.sql");
const sql = readFileSync(sqlPath, "utf-8");

// Connect to Turso
const url = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

if (!url || !authToken) {
  console.error(
    "Missing TURSO_DATABASE_URL or TURSO_AUTH_TOKEN. Run: vercel env pull .env.local"
  );
  process.exit(1);
}

const client = createClient({ url, authToken });

console.log(`Pushing migration: ${migrationFolder}`);
console.log(`SQL file: ${sqlPath}`);
console.log(`Target: ${url}`);

// Execute each statement separately (SQLite doesn't support multi-statement)
const statements = sql
  .split(";")
  .map((s) => s.trim())
  .filter((s) => s.length > 0);

for (const stmt of statements) {
  try {
    await client.execute(stmt);
    console.log(`✓ ${stmt.substring(0, 60)}...`);
  } catch (err) {
    console.error(`✗ Failed: ${stmt.substring(0, 60)}...`);
    console.error(`  Error: ${err.message}`);
    // Continue on "already exists" errors
    if (!err.message.includes("already exists")) {
      process.exit(1);
    }
  }
}

console.log(`\n✅ Migration ${migrationFolder} pushed to Turso successfully.`);
