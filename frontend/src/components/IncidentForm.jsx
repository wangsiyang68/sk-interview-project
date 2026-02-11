import { useState, useEffect } from 'react';
import { createIncident, updateIncident } from '../services/incidentService';

// Dropdown options
const SEVERITY_OPTIONS = ['low', 'medium', 'high', 'critical'];
const STATUS_OPTIONS = ['open', 'investigating', 'resolved', 'closed'];
const TYPE_OPTIONS = ['malware', 'brute_force', 'phishing', 'unauthorized_access', 'data_exfiltration'];

// IP address validation regex (IPv4)
const IP_REGEX = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;

// Format datetime for input (YYYY-MM-DDTHH:MM)
const formatDateTimeForInput = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toISOString().slice(0, 16);
};

// Format datetime for API (YYYY-MM-DD HH:MM:SS)
const formatDateTimeForAPI = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toISOString().slice(0, 19).replace('T', ' ');
};

function IncidentForm({ incident, onClose, onSuccess }) {
  const isEditMode = Boolean(incident);
  
  const [formData, setFormData] = useState({
    timestamp: '',
    source_ip: '',
    severity: 'medium',
    type: 'malware',
    status: 'open',
    description: '',
  });
  
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  // Populate form when editing
  useEffect(() => {
    if (incident) {
      setFormData({
        timestamp: formatDateTimeForInput(incident.timestamp),
        source_ip: incident.source_ip || '',
        severity: incident.severity || 'medium',
        type: incident.type || 'malware',
        status: incident.status || 'open',
        description: incident.description || '',
      });
    }
  }, [incident]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.timestamp) {
      newErrors.timestamp = 'Timestamp is required';
    }

    if (!formData.source_ip) {
      newErrors.source_ip = 'Source IP is required';
    } else if (!IP_REGEX.test(formData.source_ip)) {
      newErrors.source_ip = 'Invalid IP address format (e.g., 192.168.1.1)';
    }

    if (!formData.severity) {
      newErrors.severity = 'Severity is required';
    }

    if (!formData.type) {
      newErrors.type = 'Type is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError(null);

    if (!validate()) {
      return;
    }

    setSubmitting(true);

    try {
      const dataToSubmit = {
        ...formData,
        timestamp: formatDateTimeForAPI(formData.timestamp),
      };

      if (isEditMode) {
        await updateIncident(incident.id, dataToSubmit);
      } else {
        await createIncident(dataToSubmit);
      }

      onSuccess();
      onClose();
    } catch (err) {
      console.error('Error submitting incident:', err);
      setSubmitError(
        err.response?.data?.error || 
        `Failed to ${isEditMode ? 'update' : 'create'} incident`
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <h2 className="text-xl font-semibold text-slate-900">
            {isEditMode ? 'Edit Incident' : 'New Incident'}
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {submitError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm">
              {submitError}
            </div>
          )}

          {/* Timestamp */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Timestamp <span className="text-red-500">*</span>
            </label>
            <input
              type="datetime-local"
              name="timestamp"
              value={formData.timestamp}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.timestamp ? 'border-red-300 bg-red-50' : 'border-slate-300'
              }`}
            />
            {errors.timestamp && (
              <p className="mt-1 text-sm text-red-600">{errors.timestamp}</p>
            )}
          </div>

          {/* Source IP */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Source IP <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="source_ip"
              value={formData.source_ip}
              onChange={handleChange}
              placeholder="192.168.1.100"
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.source_ip ? 'border-red-300 bg-red-50' : 'border-slate-300'
              }`}
            />
            {errors.source_ip && (
              <p className="mt-1 text-sm text-red-600">{errors.source_ip}</p>
            )}
          </div>

          {/* Severity */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Severity <span className="text-red-500">*</span>
            </label>
            <select
              name="severity"
              value={formData.severity}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.severity ? 'border-red-300 bg-red-50' : 'border-slate-300'
              }`}
            >
              {SEVERITY_OPTIONS.map(option => (
                <option key={option} value={option}>
                  {option.charAt(0).toUpperCase() + option.slice(1)}
                </option>
              ))}
            </select>
            {errors.severity && (
              <p className="mt-1 text-sm text-red-600">{errors.severity}</p>
            )}
          </div>

          {/* Type */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Type <span className="text-red-500">*</span>
            </label>
            <select
              name="type"
              value={formData.type}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.type ? 'border-red-300 bg-red-50' : 'border-slate-300'
              }`}
            >
              {TYPE_OPTIONS.map(option => (
                <option key={option} value={option}>
                  {option.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                </option>
              ))}
            </select>
            {errors.type && (
              <p className="mt-1 text-sm text-red-600">{errors.type}</p>
            )}
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Status
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {STATUS_OPTIONS.map(option => (
                <option key={option} value={option}>
                  {option.charAt(0).toUpperCase() + option.slice(1)}
                </option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              placeholder="Incident summary..."
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors"
            >
              {submitting ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Saving...
                </span>
              ) : (
                isEditMode ? 'Update Incident' : 'Create Incident'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default IncidentForm;

