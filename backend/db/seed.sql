-- Clear existing data
TRUNCATE TABLE incidents;

-- Insert sample incident data
INSERT INTO incidents (timestamp, source_ip, severity, type, status, description) VALUES
-- Critical incidents
('2026-02-11 08:23:15', '192.168.1.105', 'critical', 'malware', 'open', 'Ransomware detected on endpoint. Emotet variant identified. Immediate isolation recommended.'),
('2026-02-10 14:45:00', '10.0.0.50', 'critical', 'data_exfiltration', 'investigating', 'Large data transfer detected to external IP. 2.5GB uploaded to unknown server in 30 minutes.'),
('2026-02-09 03:12:33', '172.16.0.22', 'critical', 'unauthorized_access', 'resolved', 'Admin account compromised. Attacker gained domain admin privileges. Password reset completed.'),

-- High severity incidents
('2026-02-11 06:30:00', '192.168.1.87', 'high', 'brute_force', 'open', 'Multiple failed SSH login attempts detected. 500+ attempts from single IP in last hour.'),
('2026-02-10 22:15:45', '10.0.0.101', 'high', 'malware', 'investigating', 'Trojan detected in downloaded executable. File quarantined pending analysis.'),
('2026-02-10 11:00:00', '192.168.2.45', 'high', 'phishing', 'resolved', 'User clicked phishing link. Credentials potentially compromised. Account locked and reset.'),
('2026-02-09 16:30:22', '172.16.1.15', 'high', 'unauthorized_access', 'closed', 'Unauthorized VPN connection from foreign IP. Connection terminated and user notified.'),

-- Medium severity incidents
('2026-02-11 09:00:00', '192.168.1.200', 'medium', 'brute_force', 'open', 'Repeated failed login attempts on web application. Rate limiting triggered.'),
('2026-02-10 13:22:10', '10.0.0.75', 'medium', 'phishing', 'open', 'Suspicious email reported by user. Contains malicious attachment. Email quarantined.'),
('2026-02-10 08:45:00', '192.168.3.30', 'medium', 'malware', 'investigating', 'Potentially unwanted program (PUP) detected. Adware behavior observed.'),
('2026-02-09 20:10:55', '172.16.2.88', 'medium', 'unauthorized_access', 'resolved', 'After-hours access to restricted file share. Verified as legitimate overtime work.'),
('2026-02-09 12:00:00', '10.0.1.42', 'medium', 'data_exfiltration', 'closed', 'Unusual USB activity detected. Employee copying files to personal drive. HR notified.'),

-- Low severity incidents
('2026-02-11 07:15:30', '192.168.1.55', 'low', 'brute_force', 'open', 'Single failed login attempt from unknown IP. Monitoring for additional activity.'),
('2026-02-10 16:40:00', '10.0.0.33', 'low', 'phishing', 'resolved', 'User reported spam email. No malicious content detected. Marked as false positive.'),
('2026-02-10 10:30:00', '192.168.2.100', 'low', 'malware', 'closed', 'Outdated antivirus signature triggered false positive. Definitions updated.'),
('2026-02-09 14:20:00', '172.16.0.95', 'low', 'unauthorized_access', 'closed', 'User attempted to access restricted folder. Access denied as expected. No escalation needed.'),
('2026-02-08 09:00:00', '10.0.2.10', 'low', 'brute_force', 'closed', 'Automated scanner detected probing port 22. IP blocked at firewall.'),
('2026-02-08 11:30:00', '192.168.4.77', 'low', 'phishing', 'closed', 'Marketing email incorrectly flagged as phishing. Whitelist updated.'),
('2026-02-07 15:45:00', '172.16.3.25', 'low', 'malware', 'closed', 'Cookie tracker detected. Browser extension removed. User educated on safe browsing.'),
('2026-02-07 08:00:00', '10.0.0.5', 'low', 'data_exfiltration', 'closed', 'Large email attachment sent externally. Verified as approved project documentation.');

-- Verify the data
SELECT 
    severity,
    COUNT(*) as count
FROM incidents
GROUP BY severity
ORDER BY FIELD(severity, 'critical', 'high', 'medium', 'low');


