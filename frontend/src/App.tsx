import { useState } from 'react';
import IncidentTable from './components/IncidentTable';
import IncidentForm from './components/IncidentForm';
import type { Incident } from './types';

function App(): React.ReactNode {
  const [showForm, setShowForm] = useState<boolean>(false);
  const [editingIncident, setEditingIncident] = useState<Incident | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState<number>(0);

  const handleAddNew = (): void => {
    setEditingIncident(null);
    setShowForm(true);
  };

  const handleEdit = (incident: Incident): void => {
    setEditingIncident(incident);
    setShowForm(true);
  };

  const handleCloseForm = (): void => {
    setShowForm(false);
    setEditingIncident(null);
  };

  const handleSuccess = (): void => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-slate-900 text-white py-4 px-6 shadow-lg">
        <div className="container mx-auto flex items-center justify-between">
          <h1 className="text-2xl font-bold">Endpoint Incident Log</h1>
          <button
            onClick={handleAddNew}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-colors flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Incident
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <IncidentTable 
          onEdit={handleEdit} 
          refreshTrigger={refreshTrigger} 
        />
      </main>

      {/* Form Modal */}
      {showForm && (
        <IncidentForm
          incident={editingIncident}
          onClose={handleCloseForm}
          onSuccess={handleSuccess}
        />
      )}
    </div>
  );
}

export default App;
