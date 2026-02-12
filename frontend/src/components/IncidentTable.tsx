import { useState, useEffect } from 'react';
import { getAllIncidents, deleteIncident } from '../services/incidentService';
import type { Incident, Severity, Status } from '../types';

// Props interface
interface IncidentTableProps {
  onEdit: (incident: Incident) => void;
  refreshTrigger: number;
}

// Type-safe severity color mapping
const severityColors: Record<Severity, string> = {
  critical: 'bg-red-100 text-red-800 border-red-200',
  high: 'bg-orange-100 text-orange-800 border-orange-200',
  medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  low: 'bg-green-100 text-green-800 border-green-200',
};

// Type-safe status color mapping
const statusColors: Record<Status, string> = {
  open: 'bg-blue-100 text-blue-800',
  investigating: 'bg-purple-100 text-purple-800',
  resolved: 'bg-green-100 text-green-800',
  closed: 'bg-slate-100 text-slate-800',
};

// Format timestamp for display
const formatTimestamp = (timestamp: string): string => {
  return new Date(timestamp).toLocaleString();
};

function IncidentTable({ onEdit, refreshTrigger }: IncidentTableProps) {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch incidents on mount and when refreshTrigger changes
  useEffect(() => {
    fetchIncidents();
  }, [refreshTrigger]);

  const fetchIncidents = async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAllIncidents();
      setIncidents(data);
    } catch (err) {
      setError('Failed to fetch incidents. Is the backend running?');
      console.error('Error fetching incidents:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number): Promise<void> => {
    if (!window.confirm('Are you sure you want to delete this incident?')) {
      return;
    }
    
    try {
      await deleteIncident(id);
      // Remove from local state
      setIncidents(incidents.filter(incident => incident.id !== id));
    } catch (err) {
      alert('Failed to delete incident');
      console.error('Error deleting incident:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900"></div>
        <span className="ml-3 text-slate-600">Loading incidents...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
        <p className="font-medium">Error</p>
        <p>{error}</p>
        <button 
          onClick={fetchIncidents}
          className="mt-2 text-sm underline hover:no-underline"
        >
          Try again
        </button>
      </div>
    );
  }

  if (incidents.length === 0) {
    return (
      <div className="text-center py-12 text-slate-500">
        <p className="text-lg">No incidents found</p>
        <p className="text-sm">Create your first incident to get started</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200">
      <table className="min-w-full divide-y divide-slate-200">
        <thead className="bg-slate-50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
              ID
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
              Timestamp
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
              Source IP
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
              Severity
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
              Type
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
              Status
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
              Description
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-slate-200">
          {incidents.map((incident) => (
            <tr key={incident.id} className="hover:bg-slate-50 transition-colors">
              <td className="px-4 py-3 text-sm text-slate-900 font-mono">
                {incident.id}
              </td>
              <td className="px-4 py-3 text-sm text-slate-600 whitespace-nowrap">
                {formatTimestamp(incident.timestamp)}
              </td>
              <td className="px-4 py-3 text-sm text-slate-900 font-mono">
                {incident.source_ip}
              </td>
              <td className="px-4 py-3">
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${severityColors[incident.severity]}`}>
                  {incident.severity}
                </span>
              </td>
              <td className="px-4 py-3 text-sm text-slate-600">
                {incident.type}
              </td>
              <td className="px-4 py-3">
                <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${statusColors[incident.status]}`}>
                  {incident.status}
                </span>
              </td>
              <td className="px-4 py-3 text-sm text-slate-600 max-w-xs truncate" title={incident.description || undefined}>
                {incident.description || '—'}
              </td>
              <td className="px-4 py-3 text-sm">
                <div className="flex gap-2">
                  <button
                    onClick={() => onEdit(incident)}
                    className="text-blue-600 hover:text-blue-800 font-medium transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(incident.id)}
                    className="text-red-600 hover:text-red-800 font-medium transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default IncidentTable;

