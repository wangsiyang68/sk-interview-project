import { useState } from 'react';
import IncidentTable from './components/IncidentTable';
import IncidentForm from './components/IncidentForm';

function App() {
  // State for form modal visibility
  const [showForm, setShowForm] = useState(false);
  
  // State for tracking which incident is being edited (null = create mode)
  const [editingIncident, setEditingIncident] = useState(null);
  
  // State to trigger table refresh after CRUD operations
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Open form for creating new incident
  const handleAddNew = () => {
    setEditingIncident(null);
    setShowForm(true);
  };

  // Open form for editing existing incident
  const handleEdit = (incident) => {
    setEditingIncident(incident);
    setShowForm(true);
  };

  // Close the form modal
  const handleCloseForm = () => {
    setShowForm(false);
    setEditingIncident(null);
  };

  // Refresh table after successful create/update
  const handleSuccess = () => {
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
