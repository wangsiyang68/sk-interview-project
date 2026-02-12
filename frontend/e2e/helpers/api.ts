// e2e/helpers/api.ts

// Import types from your existing types folder
import type { 
    Incident, 
    CreateIncidentData,
    Severity,
    IncidentType,
    Status 
  } from '../../src/types';
  
  const API_BASE_URL = 'http://localhost:3001/api';
  
  /**
   * Fetch all incidents from the API
   */
  export async function getAllIncidents(): Promise<Incident[]> {
    const response = await fetch(`${API_BASE_URL}/incidents`);
    if (!response.ok) throw new Error('Failed to fetch incidents');
    return response.json();
  }
  
  /**
   * Create a new incident via API
   */
  export async function createIncident(data: CreateIncidentData): Promise<Incident> {
    const response = await fetch(`${API_BASE_URL}/incidents`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to create incident');
    return response.json();
  }
  
  /**
   * Delete an incident via API
   */
  export async function deleteIncident(id: number): Promise<{ message: string }> {
    const response = await fetch(`${API_BASE_URL}/incidents/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete incident');
    return response.json();
  }
  
  /**
   * Delete all incidents from the database
   */
  export async function clearAllIncidents(): Promise<void> {
    const incidents = await getAllIncidents();
    for (const incident of incidents) {
      await deleteIncident(incident.id);
    }
  }
  
  // Define the test incident type (matches CreateIncidentData but all required)
  interface TestIncidentData {
    timestamp: string;
    source_ip: string;
    severity: Severity;
    type: IncidentType;
    status: Status;
    description: string;
  }
  
  /**
   * Seed the database with test incidents
   */
  export async function seedTestData(): Promise<Incident[]> {
    const testIncidents: TestIncidentData[] = [
      {
        timestamp: '2026-01-15 10:30:00',
        source_ip: '192.168.1.100',
        severity: 'critical',
        type: 'malware',
        status: 'open',
        description: 'Critical malware detected on endpoint',
      },
      {
        timestamp: '2026-01-14 14:45:00',
        source_ip: '10.0.0.50',
        severity: 'high',
        type: 'brute_force',
        status: 'investigating',
        description: 'Multiple failed login attempts detected',
      },
      {
        timestamp: '2026-01-13 09:15:00',
        source_ip: '172.16.0.25',
        severity: 'medium',
        type: 'phishing',
        status: 'resolved',
        description: 'Phishing email reported by user',
      },
      {
        timestamp: '2026-01-12 16:00:00',
        source_ip: '192.168.2.200',
        severity: 'low',
        type: 'unauthorized_access',
        status: 'closed',
        description: 'Minor policy violation - resolved',
      },
    ];
  
    const created: Incident[] = [];
    for (const incident of testIncidents) {
      const result = await createIncident(incident);
      created.push(result);
    }
    return created;
  }
  
  /**
   * Reset database to a known state with test data
   */
  export async function resetDatabase(): Promise<Incident[]> {
    await clearAllIncidents();
    return await seedTestData();
  }