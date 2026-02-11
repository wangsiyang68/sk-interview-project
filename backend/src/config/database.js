const mysql = require('mysql2/promise');
const path = require('path');

// Load environment variables based on NODE_ENV
const envFile = process.env.NODE_ENV === 'test' ? '.env.test' : '.env';
require('dotenv').config({ path: path.resolve(__dirname, '../../', envFile) });

// Fallback to .env if .env.test doesn't set values
if (process.env.NODE_ENV === 'test' && !process.env.DB_NAME) {
  require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });
  // Override DB_NAME for test
  process.env.DB_NAME = 'incident_logs_test';
}

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Test the connection with retry logic
async function testConnection(retries = 5, delay = 3000) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const connection = await pool.getConnection();
      console.log(`✅ MySQL connected successfully to database: ${process.env.DB_NAME}`);
      connection.release();
      return true;
    } catch (error) {
      console.error(`❌ MySQL connection attempt ${attempt}/${retries} failed:`, error.message);
      
      if (attempt < retries) {
        console.log(`⏳ Retrying in ${delay / 1000} seconds...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  console.error('❌ All MySQL connection attempts failed');
  return false;
}

module.exports = { pool, testConnection };
