import api from './api';

/**
 * Fetch all incidents, sorted by ID ascending
 * @returns {Promise<Array>} Array of incident objects sorted by ID
 */
export const getAllIncidents = async () => {
  const response = await api.get('/incidents');
  return response.data.sort((a, b) => a.id - b.id);
};

/**
 * Fetch a single incident by ID
 * @param {number} id - Incident ID
 * @returns {Promise<Object>} Incident object
 */
export const getIncidentById = async (id) => {
  const response = await api.get(`/incidents/${id}`);
  return response.data;
};

/**
 * Create a new incident
 * @param {Object} incidentData - Incident data
 * @param {string} incidentData.timestamp - When the incident occurred
 * @param {string} incidentData.source_ip - Origin IP address
 * @param {string} incidentData.severity - low, medium, high, or critical
 * @param {string} incidentData.type - e.g., malware, brute_force, phishing
 * @param {string} [incidentData.status] - open, investigating, resolved, closed (defaults to 'open')
 * @param {string} [incidentData.description] - Incident summary
 * @returns {Promise<Object>} Created incident object
 */
export const createIncident = async (incidentData) => {
  const response = await api.post('/incidents', incidentData);
  return response.data;
};

/**
 * Update an existing incident
 * @param {number} id - Incident ID
 * @param {Object} incidentData - Updated incident data
 * @returns {Promise<Object>} Updated incident object
 */
export const updateIncident = async (id, incidentData) => {
  const response = await api.put(`/incidents/${id}`, incidentData);
  return response.data;
};

/**
 * Delete an incident
 * @param {number} id - Incident ID
 * @returns {Promise<Object>} Deletion confirmation message
 */
export const deleteIncident = async (id) => {
  const response = await api.delete(`/incidents/${id}`);
  return response.data;
};

