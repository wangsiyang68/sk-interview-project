// Test fixture data for incidents
const testIncidents = [
  {
    timestamp: '2026-02-11 08:00:00',
    source_ip: '192.168.1.100',
    severity: 'critical',
    type: 'malware',
    status: 'open',
    description: 'Test critical malware incident'
  },
  {
    timestamp: '2026-02-11 09:00:00',
    source_ip: '10.0.0.50',
    severity: 'high',
    type: 'brute_force',
    status: 'investigating',
    description: 'Test high severity brute force attack'
  },
  {
    timestamp: '2026-02-11 10:00:00',
    source_ip: '172.16.0.25',
    severity: 'medium',
    type: 'phishing',
    status: 'resolved',
    description: 'Test medium phishing attempt'
  },
  {
    timestamp: '2026-02-11 11:00:00',
    source_ip: '192.168.2.200',
    severity: 'low',
    type: 'unauthorized_access',
    status: 'closed',
    description: 'Test low severity access attempt'
  }
];

// Sample valid incident for creating new records
const validNewIncident = {
  timestamp: '2026-02-11 12:00:00',
  source_ip: '10.10.10.10',
  severity: 'high',
  type: 'data_exfiltration',
  status: 'open',
  description: 'Newly created test incident'
};

// Sample update data
const updateData = {
  timestamp: '2026-02-11 13:00:00',
  source_ip: '192.168.1.100',
  severity: 'critical',
  type: 'malware',
  status: 'resolved',
  description: 'Updated: Incident has been resolved'
};

module.exports = {
  testIncidents,
  validNewIncident,
  updateData
};

