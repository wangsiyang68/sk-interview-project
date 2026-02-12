// Severity levels for incidents
export type Severity = 'low' | 'medium' | 'high' | 'critical';

// Status options for incidents
export type Status = 'open' | 'investigating' | 'resolved' | 'closed';

// Incident type categories
export type IncidentType = 
  | 'malware' 
  | 'brute_force' 
  | 'phishing' 
  | 'unauthorized_access' 
  | 'data_exfiltration';

// Main Incident interface matching the database schema
export interface Incident {
  id: number;
  timestamp: string;
  source_ip: string;
  severity: Severity;
  type: IncidentType;
  status: Status;
  description: string | null;
}

// For creating new incidents (id is auto-generated)
export interface CreateIncidentData {
  timestamp: string;
  source_ip: string;
  severity: Severity;
  type: IncidentType;
  status?: Status;
  description?: string;
}

// For updating incidents
export interface UpdateIncidentData {
  timestamp: string;
  source_ip: string;
  severity: Severity;
  type: IncidentType;
  status: Status;
  description?: string;
}

// Form state (timestamp format differs from API)
export interface IncidentFormData {
  timestamp: string;      // datetime-local format: "YYYY-MM-DDTHH:MM"
  source_ip: string;
  severity: Severity;
  type: IncidentType;
  status: Status;
  description: string;
}

// Form validation errors
export interface FormErrors {
  timestamp?: string;
  source_ip?: string;
  severity?: string;
  type?: string;
  status?: string;
  description?: string;
}

// API response types
export interface ApiError {
  error: string;
}

export interface DeleteResponse {
  message: string;
}