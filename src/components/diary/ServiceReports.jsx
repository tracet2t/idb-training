import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Plus, Edit, Trash2 } from 'lucide-react';
import diaryService from '../../services/diaryService';

export default function ServiceReports({ userId }) {
  const [reports, setReports] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, reset } = useForm({
    defaultValues: {
      date: new Date().toISOString().split('T')[0],
      location: '',
      summary: '',
      outcome: '',
    },
  });

  useEffect(() => {
    if (userId) {
      fetchReports();
    }
  }, [userId]);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const response = await diaryService.getServiceReports(userId);
      setReports(response.data || []);
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      const payload = { ...data, userId };

      if (editingId) {
        await diaryService.updateServiceReport(editingId, payload);
      } else {
        await diaryService.createServiceReport(payload);
      }

      reset();
      setShowForm(false);
      setEditingId(null);
      fetchReports();
    } catch (error) {
      console.error('Error saving report:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (report) => {
    setEditingId(report.id);
    reset({
      date: report.date,
      location: report.location,
      summary: report.summary,
      outcome: report.outcome,
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this report?')) {
      try {
        await diaryService.deleteServiceReport(id);
        fetchReports();
      } catch (error) {
        console.error('Error deleting report:', error);
      }
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
    reset();
  };

  return (
    <div className='service-reports-section'>
      <div className='section-header'>
        <h2>Service Reports</h2>
        {!showForm && (
          <button className='btn-primary' onClick={() => setShowForm(true)}>
            <Plus size={18} /> New Report
          </button>
        )}
      </div>

      {showForm && (
        <div className='report-form-container'>
          <form onSubmit={handleSubmit(onSubmit)} className='report-form'>
            <div className='form-row'>
              <div className='form-group'>
                <label>Date</label>
                <input
                  type='date'
                  {...register('date', { required: 'Date is required' })}
                  className='form-input'
                />
              </div>
              <div className='form-group'>
                <label>Location</label>
                <input
                  type='text'
                  {...register('location', {
                    required: 'Location is required',
                  })}
                  placeholder='Service location'
                  className='form-input'
                />
              </div>
            </div>

            <div className='form-group'>
              <label>Summary</label>
              <textarea
                {...register('summary', {
                  required: 'Summary is required',
                })}
                placeholder='Brief summary of service provided'
                className='form-textarea'
                rows='4'
              />
            </div>

            <div className='form-group'>
              <label>Outcome</label>
              <textarea
                {...register('outcome', {
                  required: 'Outcome is required',
                })}
                placeholder='What was the outcome of this service?'
                className='form-textarea'
                rows='4'
              />
            </div>

            <div className='form-actions'>
              <button
                type='submit'
                className='btn-primary'
                disabled={loading}
              >
                {loading
                  ? 'Saving...'
                  : editingId
                    ? 'Update Report'
                    : 'Save Report'}
              </button>
              <button
                type='button'
                className='btn-secondary'
                onClick={handleCancel}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className='reports-list'>
        {loading && !showForm ? (
          <p className='loading-text'>Loading reports...</p>
        ) : reports.length === 0 ? (
          <p className='empty-message'>
            No service reports yet. Create your first report!
          </p>
        ) : (
          reports.map((report) => (
            <div key={report.id} className='report-card'>
              <div className='report-header'>
                <div>
                  <h3>{report.location}</h3>
                  <p className='report-date'>
                    {new Date(report.date).toLocaleDateString()}
                  </p>
                </div>
                <div className='report-actions'>
                  <button
                    className='btn-icon'
                    onClick={() => handleEdit(report)}
                    title='Edit'
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    className='btn-icon btn-danger'
                    onClick={() => handleDelete(report.id)}
                    title='Delete'
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              <div className='report-content'>
                <div className='report-section'>
                  <strong>Summary:</strong>
                  <p>{report.summary}</p>
                </div>
                <div className='report-section'>
                  <strong>Outcome:</strong>
                  <p>{report.outcome}</p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
