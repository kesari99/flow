// This script runs database migrations using the Sequelize CLI

import { db } from '../src/models/index.js';

async function migrate() {
  try {
    console.log('Starting migration...');

    // Sync all models without force to preserve existing data
    await db.sequelize.sync();

    console.log('Migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

migrate();
