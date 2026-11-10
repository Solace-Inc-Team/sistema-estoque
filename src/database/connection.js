import Database from 'better-sqlite3';
import { mkdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { env } from '../config/env.js';

/**
 * Abre (e cria, se necessário) o banco SQLite e aplica o schema.
 * Use ':memory:' nos testes.
 */
export function createDatabase(dbPath = env.dbPath) {
  if (dbPath !== ':memory:') {
    mkdirSync(path.dirname(dbPath), { recursive: true });
  }

  const db = new Database(dbPath);
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');

  const schema = readFileSync(new URL('./schema.sql', import.meta.url), 'utf8');
  db.exec(schema);

  return db;
}
