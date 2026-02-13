import type { Incident, Severity, Status } from '../types';

interface IncidentCardProps {
  incident: Incident;
  onEdit: (incident: Incident) => void;
  onDelete: (id: number) => void;
}

// Severity color mapping (same as table)
const severityColors: Record<Severity, string> = {
  critical: 'bg-red-100 text-red-800 border-red-300',
  high: 'bg-orange-100 text-orange-800 border-orange-300',
  medium: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  low: 'bg-green-100 text-green-800 border-green-300',
};

// Severity border accent colors
const severityBorderColors: Record<Severity, string> = {
  critical: 'border-l-red-500',
  high: 'border-l-orange-500',
  medium: 'border-l-yellow-500',
  low: 'border-l-green-500',
};

// Status color mapping (same as table)
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

// Format incident type for display
const formatType = (type: string): string => {
  return type.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
};

function IncidentCard({ incident, onEdit, onDelete }: IncidentCardProps) {
  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this incident?')) {
      onDelete(incident.id);
    }
  };

  return (
    <div 
      className={`bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden border-l-4 ${severityBorderColors[incident.severity]}`}
      data-testid="incident-card"
    >
      {/* Card Header */}
      <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          {/* Severity Badge */}
          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${severityColors[incident.severity]}`}>
            {incident.severity}
          </span>
          {/* ID */}
          <span className="text-sm text-slate-500 font-mono">#{incident.id}</span>
        </div>
        {/* Status Badge */}
        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${statusColors[incident.status]}`}>
          {incident.status}
        </span>
      </div>

      {/* Card Body */}
      <div className="px-4 py-3 space-y-2">
        {/* Timestamp */}
        <div className="flex items-start gap-2">
          <span className="text-xs text-slate-500 uppercase tracking-wide w-20 flex-shrink-0 pt-0.5">Time</span>
          <span className="text-sm text-slate-700">{formatTimestamp(incident.timestamp)}</span>
        </div>

        {/* Source IP */}
        <div className="flex items-start gap-2">
          <span className="text-xs text-slate-500 uppercase tracking-wide w-20 flex-shrink-0 pt-0.5">Source IP</span>
          <span className="text-sm text-slate-900 font-mono">{incident.source_ip}</span>
        </div>

        {/* Type */}
        <div className="flex items-start gap-2">
          <span className="text-xs text-slate-500 uppercase tracking-wide w-20 flex-shrink-0 pt-0.5">Type</span>
          <span className="text-sm text-slate-700">{formatType(incident.type)}</span>
        </div>

        {/* Description (if exists) */}
        {incident.description && (
          <div className="flex items-start gap-2">
            <span className="text-xs text-slate-500 uppercase tracking-wide w-20 flex-shrink-0 pt-0.5">Details</span>
            <span className="text-sm text-slate-600 line-clamp-2">{incident.description}</span>
          </div>
        )}
      </div>

      {/* Card Actions */}
      <div className="px-4 py-3 bg-slate-50 border-t border-slate-200 flex gap-2">
        <button
          onClick={() => onEdit(incident)}
          className="flex-1 px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
        >
          Edit
        </button>
        <button
          onClick={handleDelete}
          className="flex-1 px-4 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
        >
          Delete
        </button>
      </div>
    </div>
  );
}

export default IncidentCard;

