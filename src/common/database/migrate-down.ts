import 'dotenv/config';
import * as path from 'path';
import { promises as fs } from 'fs';
import { Pool } from 'pg';
import {
  Kysely,
  Migrator,
  PostgresDialect,
  FileMigrationProvider,
} from 'kysely';

async function migrateDown() {
  const db = new Kysely<any>({
    dialect: new PostgresDialect({
      pool: new Pool({
        connectionString: process.env.DATABASE_URL,
      }),
    }),
  });

  const migrator = new Migrator({
    db,
    provider: new FileMigrationProvider({
      fs,
      path,
      migrationFolder: path.join(__dirname, './migrations'),
    }),
    allowUnorderedMigrations: true,
  });

  console.log('Rolling back migrations...');

  // Rollback ONE migration (most recent)
  const { error, results } = await migrator.migrateDown();

  // Or rollback ALL migrations (uncomment if needed)
  // const { error, results } = await migrator.migrateTo(0);

  results?.forEach((it) => {
    if (it.status === 'Success') {
      console.log(`Rolled back migration "${it.migrationName}" successfully`);
    } else if (it.status === 'Error') {
      console.error(`Failed to rollback migration "${it.migrationName}"`);
    }
  });

  if (error) {
    console.error('Failed to rollback');
    console.error(error);
    process.exit(1);
  }

  await db.destroy();
}

migrateDown();
