-- Create database (run this separately if needed)
CREATE DATABASE IF NOT EXISTS incident_logs;
USE incident_logs;

-- Drop table if exists (for clean setup)
DROP TABLE IF EXISTS incidents;

-- Create incidents table
CREATE TABLE incidents (
    id INT AUTO_INCREMENT PRIMARY KEY,
    timestamp DATETIME NOT NULL,
    source_ip VARCHAR(45) NOT NULL,
    severity ENUM('low', 'medium', 'high', 'critical') NOT NULL,
    type VARCHAR(50) NOT NULL,
    status ENUM('open', 'investigating', 'resolved', 'closed') NOT NULL DEFAULT 'open',
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create indexes for common queries
CREATE INDEX idx_timestamp ON incidents(timestamp);
CREATE INDEX idx_severity ON incidents(severity);
CREATE INDEX idx_status ON incidents(status);
CREATE INDEX idx_source_ip ON incidents(source_ip);
CREATE INDEX idx_type ON incidents(type);


