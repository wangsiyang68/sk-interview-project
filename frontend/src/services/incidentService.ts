import api from './api';
import type { 
  Incident, 
  CreateIncidentData, 
  UpdateIncidentData,
  DeleteResponse 
} from '../types';
import type { AxiosResponse } from 'axios';

/**
 * Fetch all incidents, sorted by ID ascending
 */
export const getAllIncidents = async (): Promise<Incident[]> => {
  const response: AxiosResponse<Incident[]> = await api.get('/incidents');
  return response.data.sort((a, b) => a.id - b.id);
};

/**
 * Fetch a single incident by ID
 */
export const getIncidentById = async (id: number): Promise<Incident> => {
  const response: AxiosResponse<Incident> = await api.get(`/incidents/${id}`);
  return response.data;
};

/**
 * Create a new incident
 */
export const createIncident = async (
  incidentData: CreateIncidentData
): Promise<Incident> => {
  const response: AxiosResponse<Incident> = await api.post('/incidents', incidentData);
  return response.data;
};

/**
 * Update an existing incident
 */
export const updateIncident = async (
  id: number,
  incidentData: UpdateIncidentData
): Promise<Incident> => {
  const response: AxiosResponse<Incident> = await api.put(`/incidents/${id}`, incidentData);
  return response.data;
};

/**
 * Delete an incident
 */
export const deleteIncident = async (id: number): Promise<DeleteResponse> => {
  const response: AxiosResponse<DeleteResponse> = await api.delete(`/incidents/${id}`);
  return response.data;
};