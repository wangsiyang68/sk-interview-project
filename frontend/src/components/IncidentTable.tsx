import { useState, useEffect, useMemo } from 'react';
import { getAllIncidents, deleteIncident } from '../services/incidentService';
import type { Incident, Severity, Status } from '../types';
import IncidentCard from './IncidentCard';

// Props interface
interface IncidentTableProps {
  onEdit: (incident: Incident) => void;
  refreshTrigger: number;
}

// Sortable columns type
type SortableColumn = 'timestamp' | 'severity';
type SortDirection = 'asc' | 'desc';

interface SortKey {
  column: SortableColumn;
  direction: SortDirection;
}

// Severity ranking for sorting (higher = more severe)
const severityRank: Record<Severity, number> = {
  low: 1,
  medium: 2,
  high: 3,
  critical: 4,
};

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

// Sort indicator component
interface SortIndicatorProps {
  priority: number | null;
  direction: SortDirection | null;
}

function SortIndicator({ priority, direction }: SortIndicatorProps) {
  if (priority === null || direction === null) {
    // Show subtle indicator that column is sortable
    return (
      <span className="text-slate-300 group-hover:text-slate-400 transition-colors">
        ⇅
      </span>
    );
  }

  const arrow = direction === 'asc' ? '▲' : '▼';
  const isPrimary = priority === 1;

  return (
    <span className={`flex items-center gap-0.5 ${isPrimary ? 'text-slate-900' : 'text-slate-400'}`}>
      <span className="text-xs">{arrow}</span>
      <span className="text-[10px] font-normal">{priority}</span>
    </span>
  );
}

// Pagination options
const ITEMS_PER_PAGE_OPTIONS = [5, 10, 25, 50] as const;
type ItemsPerPage = typeof ITEMS_PER_PAGE_OPTIONS[number];

function IncidentTable({ onEdit, refreshTrigger }: IncidentTableProps) {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [sortKeys, setSortKeys] = useState<SortKey[]>([]);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<ItemsPerPage>(10);

  // Fetch incidents on mount and when refreshTrigger changes
  useEffect(() => {
    fetchIncidents();
  }, [refreshTrigger]);

  // Handle sort column click
  const handleSortClick = (column: SortableColumn): void => {
    setSortKeys((prevKeys): SortKey[] => {
      const existingIndex = prevKeys.findIndex((k) => k.column === column);
      
      if (existingIndex === 0) {
        // Column is already primary - toggle direction or remove on 3rd state
        const currentDirection = prevKeys[0].direction;
        if (currentDirection === 'asc') {
          // asc -> desc
          return [{ column, direction: 'desc' as const }, ...prevKeys.slice(1)];
        } else {
          // desc -> remove from sort
          return prevKeys.slice(1);
        }
      } else if (existingIndex > 0) {
        // Column is secondary - promote to primary
        const promoted = prevKeys[existingIndex];
        return [{ ...promoted, direction: 'asc' as const }, ...prevKeys.filter((_, i) => i !== existingIndex)];
      } else {
        // Column not in sort - add as primary (max 2 sort keys)
        return [{ column, direction: 'asc' as const }, ...prevKeys].slice(0, 2);
      }
    });
  };

  // Get sort state for a column
  const getSortState = (column: SortableColumn): { priority: number | null; direction: SortDirection | null } => {
    const index = sortKeys.findIndex((k) => k.column === column);
    if (index === -1) return { priority: null, direction: null };
    return { priority: index + 1, direction: sortKeys[index].direction };
  };

  // Sort incidents based on current sort keys
  const sortedIncidents = useMemo(() => {
    if (sortKeys.length === 0) return incidents;

    return [...incidents].sort((a, b) => {
      for (const { column, direction } of sortKeys) {
        let comparison = 0;

        if (column === 'timestamp') {
          comparison = new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
        } else if (column === 'severity') {
          comparison = severityRank[a.severity] - severityRank[b.severity];
        }

        if (comparison !== 0) {
          return direction === 'asc' ? comparison : -comparison;
        }
      }
      return 0;
    });
  }, [incidents, sortKeys]);

  // Pagination calculations
  const totalItems = sortedIncidents.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  
  // Paginated incidents
  const paginatedIncidents = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return sortedIncidents.slice(startIndex, endIndex);
  }, [sortedIncidents, currentPage, itemsPerPage]);

  // Reset to page 1 only when items per page changes
  useEffect(() => {
    setCurrentPage(1);
  }, [itemsPerPage]);

  // Ensure current page is valid (e.g., after deleting the last item on the last page)
  // This runs when totalPages changes due to data deletion
  useEffect(() => {
    if (totalPages > 0 && currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  // Pagination handlers
  const goToFirstPage = (): void => setCurrentPage(1);
  const goToLastPage = (): void => setCurrentPage(totalPages);
  const goToPreviousPage = (): void => setCurrentPage(prev => Math.max(1, prev - 1));
  const goToNextPage = (): void => setCurrentPage(prev => Math.min(totalPages, prev + 1));
  
  const handleItemsPerPageChange = (newValue: ItemsPerPage): void => {
    setItemsPerPage(newValue);
  };

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

  // Delete handler - shared by table and cards
  const handleDelete = async (id: number): Promise<void> => {
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
    <div>
      {/* Desktop Table View - Hidden on mobile */}
      <div className="hidden md:block overflow-x-auto rounded-lg border border-slate-200">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                ID
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                <button
                  onClick={() => handleSortClick('timestamp')}
                  className="flex items-center gap-1 hover:text-slate-900 transition-colors group"
                >
                  <span>Timestamp</span>
                  <SortIndicator {...getSortState('timestamp')} />
                </button>
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                Source IP
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                <button
                  onClick={() => handleSortClick('severity')}
                  className="flex items-center gap-1 hover:text-slate-900 transition-colors group"
                >
                  <span>Severity</span>
                  <SortIndicator {...getSortState('severity')} />
                </button>
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
            {paginatedIncidents.map((incident) => (
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
                      onClick={() => {
                        if (window.confirm('Are you sure you want to delete this incident?')) {
                          handleDelete(incident.id);
                        }
                      }}
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

      {/* Mobile Card View - Hidden on desktop */}
      <div className="block md:hidden space-y-3">
        {/* Mobile Sort Controls */}
        <div className="flex items-center gap-2 px-1 pb-2 border-b border-slate-200">
          <span className="text-xs text-slate-500 uppercase tracking-wide">Sort by:</span>
          <button
            onClick={() => handleSortClick('timestamp')}
            className={`flex items-center gap-1 px-2 py-1 text-xs rounded-md transition-colors ${
              getSortState('timestamp').priority !== null
                ? 'bg-slate-200 text-slate-900'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <span>Time</span>
            <SortIndicator {...getSortState('timestamp')} />
          </button>
          <button
            onClick={() => handleSortClick('severity')}
            className={`flex items-center gap-1 px-2 py-1 text-xs rounded-md transition-colors ${
              getSortState('severity').priority !== null
                ? 'bg-slate-200 text-slate-900'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <span>Severity</span>
            <SortIndicator {...getSortState('severity')} />
          </button>
        </div>

        {/* Card List */}
        {paginatedIncidents.map((incident) => (
          <IncidentCard
            key={incident.id}
            incident={incident}
            onEdit={onEdit}
            onDelete={handleDelete}
          />
        ))}
      </div>

      {/* Pagination Controls - Shared between desktop and mobile */}
      <div className="bg-slate-50 px-4 py-3 mt-4 md:mt-0 md:border-t border border-slate-200 md:rounded-none rounded-lg flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Items per page selector */}
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <label htmlFor="itemsPerPage" className="whitespace-nowrap">
            Rows per page:
          </label>
          <select
            id="itemsPerPage"
            value={itemsPerPage}
            onChange={(e) => handleItemsPerPageChange(Number(e.target.value) as ItemsPerPage)}
            className="px-2 py-1 border border-slate-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {ITEMS_PER_PAGE_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>

        {/* Page info and navigation */}
        <div className="flex items-center gap-2">
          {/* Page info */}
          <span className="text-sm text-slate-600 whitespace-nowrap" data-testid="pagination-range">
            {totalItems === 0 ? (
              '0 items'
            ) : (
              <>
                {(currentPage - 1) * itemsPerPage + 1}–{Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems}
              </>
            )}
          </span>

          {/* Navigation buttons */}
          <div className="flex items-center gap-1">
            {/* First page */}
            <button
              onClick={goToFirstPage}
              disabled={currentPage === 1}
              className="p-1.5 rounded-md text-slate-600 hover:bg-slate-200 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent transition-colors"
              title="First page"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
              </svg>
            </button>

            {/* Previous page */}
            <button
              onClick={goToPreviousPage}
              disabled={currentPage === 1}
              className="p-1.5 rounded-md text-slate-600 hover:bg-slate-200 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent transition-colors"
              title="Previous page"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            {/* Page indicator */}
            <span className="px-3 py-1 text-sm font-medium text-slate-700" data-testid="page-indicator">
              {currentPage} / {totalPages || 1}
            </span>

            {/* Next page */}
            <button
              onClick={goToNextPage}
              disabled={currentPage === totalPages || totalPages === 0}
              className="p-1.5 rounded-md text-slate-600 hover:bg-slate-200 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent transition-colors"
              title="Next page"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>

            {/* Last page */}
            <button
              onClick={goToLastPage}
              disabled={currentPage === totalPages || totalPages === 0}
              className="p-1.5 rounded-md text-slate-600 hover:bg-slate-200 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent transition-colors"
              title="Last page"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default IncidentTable;

