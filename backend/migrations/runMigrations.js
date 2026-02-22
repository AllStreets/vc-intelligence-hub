import fs from 'fs';
import path from 'path';
import pool from '../services/database.js';

async function runMigrations() {
  const migrationsDir = path.dirname(new URL(import.meta.url).pathname);
  const files = fs.readdirSync(migrationsDir)
    .filter(f => f.endsWith('.sql'))
    .sort();

  console.log(`Found ${files.length} migration files`);

  for (const file of files) {
    const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf-8');
    try {
      console.log(`Running migration: ${file}`);
      await pool.query(sql);
      console.log(`✓ Completed: ${file}`);
    } catch (error) {
      console.error(`✗ Failed: ${file}`, error);
      process.exit(1);
    }
  }

  await pool.end();
  console.log('All migrations completed successfully');
}

runMigrations();
