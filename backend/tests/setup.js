const fs = require('fs');
const path = require('path');
const { pool } = require('../src/config/database');
const { testIncidents } = require('./fixtures/incidents');

// Schema for creating/recreating the incidents table
const createTableSQL = `
  CREATE TABLE IF NOT EXISTS incidents (
    id INT AUTO_INCREMENT PRIMARY KEY,
    timestamp DATETIME NOT NULL,
    source_ip VARCHAR(45) NOT NULL,
    severity ENUM('low', 'medium', 'high', 'critical') NOT NULL,
    type VARCHAR(50) NOT NULL,
    status ENUM('open', 'investigating', 'resolved', 'closed') NOT NULL DEFAULT 'open',
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  )
`;

// Setup before all tests run
beforeAll(async () => {
  try {
    // Ensure table exists
    await pool.query(createTableSQL);
    console.log('✅ Test database table ready');
  } catch (error) {
    console.error('❌ Failed to setup test database:', error.message);
    throw error;
  }
});

// Reset data before each test
beforeEach(async () => {
  try {
    // Clear all data
    await pool.query('TRUNCATE TABLE incidents');
    
    // Insert test fixtures
    for (const incident of testIncidents) {
      await pool.query(
        `INSERT INTO incidents (timestamp, source_ip, severity, type, status, description)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [incident.timestamp, incident.source_ip, incident.severity, incident.type, incident.status, incident.description]
      );
    }
  } catch (error) {
    console.error('❌ Failed to reset test data:', error.message);
    throw error;
  }
});

// Cleanup after all tests
afterAll(async () => {
  try {
    await pool.end();
    console.log('✅ Database connection closed');
  } catch (error) {
    console.error('❌ Failed to close database connection:', error.message);
  }
});

