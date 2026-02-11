/**
 * Database Setup Script
 * 
 * Creates the database and schema. Can be used for both development and test databases.
 * 
 * Usage:
 *   node db/setup.js                           # Schema only (no seed data)
 *   node db/setup.js --seed                    # Schema + seed data
 *   npm run db:setup                           # Development: schema + seed
 *   npm run db:setup:test                      # Test: schema only (tests use fixtures)
 */

const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
require('dotenv').config();

const DB_NAME = process.env.DB_NAME || 'incident_logs';
const SHOULD_SEED = process.argv.includes('--seed');

async function setupDatabase() {
  console.log(`\n📦 Setting up database: ${DB_NAME}\n`);

  // Connect without specifying a database first
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    multipleStatements: true
  });

  try {
    // Create database if it doesn't exist
    console.log(`1️⃣  Creating database "${DB_NAME}" if not exists...`);
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\``);
    
    // Switch to the database
    console.log(`2️⃣  Switching to database "${DB_NAME}"...`);
    await connection.query(`USE \`${DB_NAME}\``);

    // Read and execute schema.sql
    console.log(`3️⃣  Running schema.sql...`);
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    await connection.query(schema);

    // Optionally run seed.sql
    if (SHOULD_SEED) {
      console.log(`4️⃣  Running seed.sql...`);
      const seedPath = path.join(__dirname, 'seed.sql');
      let seed = fs.readFileSync(seedPath, 'utf8');

      await connection.query(seed);
      console.log(`   ✅ Sample data inserted`);
    } else {
      console.log(`4️⃣  Skipping seed.sql (use --seed flag to populate data)`);
    }

    console.log(`\n✅ Database "${DB_NAME}" setup completed successfully!\n`);
    
    // Show table info
    const [tables] = await connection.query('SHOW TABLES');
    console.log('📋 Tables created:');
    tables.forEach(table => {
      const tableName = Object.values(table)[0];
      console.log(`   - ${tableName}`);
    });

    // Show row count if seeded
    if (SHOULD_SEED) {
      const [rows] = await connection.query('SELECT COUNT(*) as count FROM incidents');
      console.log(`\n📊 Incidents seeded: ${rows[0].count}`);
    }

  } catch (error) {
    console.error('\n❌ Database setup failed:', error.message);
    process.exit(1);
  } finally {
    await connection.end();
  }
}

// Run if called directly
setupDatabase();

