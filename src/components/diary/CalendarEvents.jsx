import { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { Calendar, Plus, Edit, Trash2, X } from 'lucide-react';
import { Calendar as RsuiteCalendar } from 'rsuite';
import 'rsuite/Calendar/styles/index.css';
import diaryService from '../../services/diaryService';

const unwrapList = (response) => {
  const body = response?.data;
  if (Array.isArray(body)) return body;
  if (Array.isArray(body?.data)) return body.data;
  return [];
};

const unwrapItem = (response) => response?.data?.data ?? response?.data;

export default function CalendarEvents({ userId }) {
  const [events, setEvents] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedDateEvents, setSelectedDateEvents] = useState([]);
  const [showEventForm, setShowEventForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [openEventId, setOpenEventId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formAttachments, setFormAttachments] = useState([]);

  const { register, handleSubmit, reset, watch } = useForm({
    defaultValues: {
      title: '',
      date: new Date().toISOString().split('T')[0],
      time: '09:00',
      description: '',
      color: '#3B82F6',
    },
  });

  useEffect(() => {
    if (userId) fetchEvents();
  }, [userId]);

  useEffect(() => {
    const dateString = selectedDate.toISOString().split('T')[0];
    const dateEvents = events.filter((e) => {
      const eventDate = e.eventDate?.split('T')[0];
      return eventDate === dateString;
    });
    setSelectedDateEvents(dateEvents);
  }, [selectedDate, events]);

  const fetchEvents = async () => {
    if (!userId) return;
    try {
      setLoading(true);
      setError(null);
      const response = await diaryService.getDiaryEventsByUser(userId);
      setEvents(unwrapList(response));
    } catch (err) {
      console.error('Error fetching events:', err);
      setError(err.response?.data?.message || err.message || 'Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data) => {
    if (!userId) {
      setError('User session not available. Please sign in again.');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const payload = {
        title: data.title,
        description: data.description,
        eventDate: data.date,
        eventTime: data.time,
        color: data.color || '#3B82F6',
        createdById: userId,
      };

      let savedEvent;
      if (editingId) {
        const current = events.find((ev) => ev.id === editingId);
        const response = await diaryService.updateDiaryEvent(editingId, {
          ...payload,
          rowVersion: current?.rowVersion,
        });
        savedEvent = unwrapItem(response);
        // Attach formAttachments to the event
        savedEvent.attachments = formAttachments;
        setEvents((prev) => prev.map((ev) => (ev.id === editingId ? savedEvent : ev)));
        setEditingId(null);
      } else {
        const response = await diaryService.createDiaryEvent(payload);
        savedEvent = unwrapItem(response);
        // Attach formAttachments to the event
        savedEvent.attachments = formAttachments;
        setEvents((prev) => [...prev, savedEvent]);
      }

      setShowEventForm(false);
      setFormAttachments([]);
      reset({
        title: '',
        date: new Date().toISOString().split('T')[0],
        time: '09:00',
        description: '',
        color: '#3B82F6',
      });
    } catch (err) {
      console.error('Error saving event:', err);
      setError(err.response?.data?.message || err.message || 'Failed to save event');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (event) => {
    const eventDate = event.eventDate?.split('T')[0];
    const eventTime = event.eventTime || event.eventDate?.split('T')[1]?.substring(0, 5) || '';

    setEditingId(event.id);
    setFormAttachments(event.attachments || []);
    reset({
      title: event.title,
      date: eventDate,
      time: eventTime,
      description: event.description,
      color: event.color || '#3B82F6',
    });
    setShowEventForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this event?')) return;

    try {
      setLoading(true);
      setError(null);
      await diaryService.deleteDiaryEvent(id);
      setEvents((prev) => prev.filter((ev) => ev.id !== id));
      setOpenEventId(null);
    } catch (err) {
      console.error('Error deleting event:', err);
      setError(err.response?.data?.message || err.message || 'Failed to delete event');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setShowEventForm(false);
    setEditingId(null);
    setFormAttachments([]);
    reset();
  };

  const handleDateSelect = (date) => {
    setSelectedDate(date);
  };

  const renderEventIndicator = (date) => {
    const dateString = date.toISOString().split('T')[0];
    const dateEvents = events.filter((e) => {
      const eventDate = e.eventDate?.split('T')[0];
      return eventDate === dateString;
    });
    if (dateEvents.length > 0) {
      return (
        <div className='event-indicator'>
          <span className='event-count'>{dateEvents.length}</span>
        </div>
      );
    }
    return null;
  };

  return (
    <div className='calendar-events-section'>
      <div className='section-header'>
        <h2>
          <Calendar size={20} /> Calendar & Events
        </h2>
        {!showEventForm && (
          <button
            className='btn-primary'
            onClick={() => setShowEventForm(true)}
          >
            <Plus size={18} /> Add Activity
          </button>
        )}
      </div>

      <div className='calendar-container'>
        <div className='calendar-view'>
          <RsuiteCalendar
            value={selectedDate}
            onChange={handleDateSelect}
            renderCell={renderEventIndicator}
          />
        </div>

        <div className='events-panel'>
          <div className='selected-date-header'>
            <h3>{selectedDate.toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}</h3>
          </div>

          <div className='events-list-container'>
            {openEventId ? (
              <ActivityDetailView
                event={events.find((e) => e.id === openEventId)}
                onBack={() => setOpenEventId(null)}
                onEdit={() => {
                  const event = events.find((e) => e.id === openEventId);
                  handleEdit(event);
                  setOpenEventId(null);
                }}
                onDelete={() => {
                  handleDelete(openEventId);
                  setOpenEventId(null);
                }}
                events={events}
                setEvents={setEvents}
              />
            ) : selectedDateEvents.length === 0 ? (
              <p className='empty-message'>No events scheduled for this date</p>
            ) : (
              <div className='events-for-date'>
                {selectedDateEvents.map((event) => (
                  <div
                    key={event.id}
                    className='event-item'
                    style={{ cursor: 'pointer' }}
                    onClick={() => setOpenEventId(event.id)}
                  >
                    <div className='event-time'>
                      {event.eventTime || ''}
                    </div>
                    <div className='event-details'>
                      <h4>{event.title}</h4>
                      {event.description && (
                        <p className='event-description'>
                          {event.description}
                        </p>
                      )}
                      {event.attachments && event.attachments.length > 0 && (
                        <div style={{
                          marginTop: 8,
                          padding: 6,
                          backgroundColor: '#e8f5e9',
                          borderRadius: 4,
                          fontSize: 12,
                          color: '#2e7d32',
                          fontWeight: 500
                        }}>
                          📎 {event.attachments.length} attachment{event.attachments.length > 1 ? 's' : ''}
                        </div>
                      )}
                    </div>
                    <div
                      className='event-item-actions'
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        className='btn-icon'
                        onClick={() => handleEdit(event)}
                      >
                        <Edit size={20} />
                      </button>
                      <button
                        className='btn-icon btn-danger'
                        onClick={() => handleDelete(event.id)}
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {showEventForm && (
        <div className='event-form-overlay'>
          <div className='event-form-container event-form-with-attachments'>
            <div className='form-header'>
              {editingId && (
                <h2 className='event-edit-title'>{watch('title') || 'Untitled Activity'}</h2>
              )}
              <div className='form-header-top'>
                <h3>{editingId ? 'Edit Event' : 'Create New Activity'}</h3>
                <button className='btn-close' onClick={handleCancel}>
                  <X size={20} />
                </button>
              </div>
            </div>

            {error && (
              <div style={{
                padding: '10px 12px',
                marginBottom: '12px',
                backgroundColor: '#ffebee',
                color: '#c62828',
                borderRadius: '4px',
                fontSize: '14px'
              }}>
                ⚠️ {error}
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className='event-form'>
              <div className='form-group'>
                <label>Title</label>
                <input
                  type='text'
                  {...register('title', {
                    required: 'Event title is required',
                  })}
                  placeholder='Event title'
                  className='form-input'
                />
              </div>

              <div className='form-row'>
                <div className='form-group'>
                  <label>Date</label>
                  <input
                    type='date'
                    {...register('date', {
                      required: 'Date is required',
                    })}
                    className='form-input'
                  />
                </div>
                <div className='form-group'>
                  <label>Time</label>
                  <input
                    type='time'
                    {...register('time')}
                    className='form-input'
                  />
                </div>
              </div>

              <div className='form-group'>
                <label>Field Notes</label>
                <textarea
                  {...register('description')}
                  placeholder='Event description (optional)'
                  className='form-textarea'
                  rows='4'
                />
              </div>

              {/* Attachments Section */}
              <div className='attachments-section'>
                <div className='attachments-header'>
                  <h4>Attachments <span className='optional-label'>(optional)</span></h4>
                </div>

                <FormAttachmentUploader 
                  formAttachments={formAttachments}
                  setFormAttachments={setFormAttachments}
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
                      ? 'Update Event'
                      : 'Create Activity'}
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
        </div>
      )}
    </div>
  );
}

// Activity Detail View Component
function ActivityDetailView({ event, onBack, onEdit, onDelete, events, setEvents }) {
  if (!event) {
    return (
      <div style={{ padding: '1rem', textAlign: 'center', color: '#64748b' }}>
        <p>Activity not found</p>
        <button className='btn-primary' onClick={onBack} style={{ marginTop: '1rem' }}>
          Back to Activity
        </button>
      </div>
    );
  }

  const eventDate = event.eventDate?.split('T')[0] 
    ? new Date(event.eventDate.split('T')[0]).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : 'No date';

  return (
    <div className='activity-detail-view'>
      <div className='detail-header'>
        <button className='btn-primary' onClick={onBack} style={{ marginBottom: '1.5rem' }}>
          ← Back to Activities
        </button>
        <div className='detail-title-section'>
          <h2 className='detail-title'>{event.title}</h2>
          <div className='detail-meta'>
            <span className='detail-date'>📅 {eventDate}</span>
            {event.eventTime && <span className='detail-time'>🕐 {event.eventTime}</span>}
          </div>
        </div>
      </div>

      {event.description && (
        <div className='detail-section'>
          <h4 className='section-label'>Field Notes</h4>
          <p className='detail-description'>{event.description}</p>
        </div>
      )}

      <div className='detail-section'>
        <h4 className='section-label'>Attachments</h4>
        {event.attachments && event.attachments.length > 0 ? (
          <div className='attachments-grid-large'>
            {event.attachments.map((att) => (
              <div key={att.id} className='attachment-card-large'>
                {att.type === 'pdf' ? (
                  <div className='pdf-preview-large'>
                    <div className='pdf-icon-large'>PDF</div>
                    <p className='pdf-name'>{att.name}</p>
                  </div>
                ) : (
                  <div className='image-preview-large'>
                    <img src={att.url} alt={att.name} />
                  </div>
                )}
                <a
                  href={att.url}
                  download={att.name}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='attachment-download-btn'
                >
                  Download
                </a>
              </div>
            ))}
          </div>
        ) : (
          <p style={{ color: '#999', fontSize: '13px', textAlign: 'center', padding: '1.5rem' }}>
            No attachments for this activity
          </p>
        )}
      </div>

      <div className='detail-actions'>
        <button className='btn-primary' onClick={onEdit}>
          ✏️ Edit Activity
        </button>
        <button className='btn-danger-large' onClick={onDelete}>
          🗑️ Delete Activity
        </button>
      </div>
    </div>
  );
}

// Form-integrated attachment uploader (for Create/Edit dialogs)
function FormAttachmentUploader({ formAttachments, setFormAttachments }) {
  const [fileName, setFileName] = useState('');
  const [fileUrl, setFileUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const reader = new FileReader();
    reader.onload = () => {
      setTimeout(() => {
        const fileType = file.type.startsWith('image/') ? 'image' : file.type === 'application/pdf' ? 'pdf' : 'file';
        setFormAttachments((prev) => [
          ...prev,
          {
            id: Date.now(),
            name: file.name,
            url: reader.result,
            type: fileType
          }
        ]);
        setUploading(false);
        e.target.value = '';
      }, 500);
    };
    reader.readAsDataURL(file);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      const input = document.createElement('input');
      input.type = 'file';
      Object.defineProperty(input, 'files', {
        value: e.dataTransfer.files
      });
      handleFileUpload({ target: input });
    }
  };

  const handleUrlUpload = () => {
    if (!fileName || !fileUrl) return;
    setUploading(true);
    setTimeout(() => {
      setFormAttachments((prev) => [
        ...prev,
        { id: Date.now(), name: fileName, url: fileUrl, type: 'image' }
      ]);
      setFileName('');
      setFileUrl('');
      setUploading(false);
    }, 500);
  };

  const handleRemoveAttachment = (attId) => {
    setFormAttachments((prev) => prev.filter((att) => att.id !== attId));
  };

  return (
    <div style={{ marginTop: 16 }}>
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        style={{
          marginBottom: 20,
          padding: 24,
          border: dragActive ? '2px dashed #007bff' : '2px dashed #ddd',
          borderRadius: 8,
          backgroundColor: dragActive ? '#f0f8ff' : '#fafafa',
          textAlign: 'center',
          cursor: 'pointer',
          transition: 'all 0.3s ease'
        }}
      >
        <input
          type='file'
          id='formFileInput'
          accept='image/*,.pdf'
          onChange={handleFileUpload}
          disabled={uploading}
          style={{ display: 'none' }}
        />
        <label
          htmlFor='formFileInput'
          style={{
            cursor: uploading ? 'not-allowed' : 'pointer',
            display: 'block'
          }}
        >
          <div style={{ marginBottom: 12 }}>
            <svg
              width='48'
              height='48'
              viewBox='0 0 24 24'
              fill='none'
              stroke='#007bff'
              strokeWidth='2'
              style={{ margin: '0 auto', display: 'block' }}
            >
              <path d='M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4'></path>
              <polyline points='17 8 12 3 7 8'></polyline>
              <line x1='12' y1='3' x2='12' y2='15'></line>
            </svg>
          </div>
          <p style={{ margin: '8px 0', fontSize: 14, fontWeight: 500, color: '#333' }}>
            {uploading ? 'Uploading...' : 'Drag and drop or click to upload'}
          </p>
          <p style={{ margin: '4px 0', fontSize: 12, color: '#999' }}>
            Supported: PNG, JPG, GIF, WebP, PDF
          </p>
        </label>
      </div>

      <div style={{ marginBottom: 20, padding: 16, backgroundColor: '#f9f9f9', borderRadius: 8, border: '1px solid #e0e0e0' }}>
        <h5 style={{ margin: '0 0 12px 0', fontSize: 14, fontWeight: 600, color: '#333' }}>
          Or add by URL:
        </h5>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <input
            type='text'
            placeholder='File name'
            value={fileName}
            onChange={(e) => setFileName(e.target.value)}
            style={{
              flex: '1 1 150px',
              padding: '10px 12px',
              border: '1px solid #ddd',
              borderRadius: 6,
              fontSize: 13,
              fontFamily: 'inherit'
            }}
          />
          <input
            type='text'
            placeholder='Image URL (https://...)'
            value={fileUrl}
            onChange={(e) => setFileUrl(e.target.value)}
            style={{
              flex: '1 1 150px',
              padding: '10px 12px',
              border: '1px solid #ddd',
              borderRadius: 6,
              fontSize: 13,
              fontFamily: 'inherit'
            }}
          />
          <button
            onClick={handleUrlUpload}
            disabled={uploading}
            type='button'
            style={{
              padding: '10px 20px',
              backgroundColor: uploading ? '#ccc' : '#C8960C',
              color: 'white',
              border: 'none',
              borderRadius: 6,
              cursor: uploading ? 'not-allowed' : 'pointer',
              fontSize: 13,
              fontWeight: 500,
              whiteSpace: 'nowrap',
              transition: 'background-color 0.2s'
            }}
          >
            {uploading ? 'Uploading...' : 'Add URL'}
          </button>
        </div>
      </div>

      <div>
        <h5 style={{ margin: '0 0 12px 0', fontSize: 14, fontWeight: 600, color: '#333' }}>
          Attached Files ({formAttachments?.length || 0}):
        </h5>
        {formAttachments?.length > 0 ? (
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {formAttachments.map((att) => (
              <li
                key={att.id}
                style={{
                  marginBottom: 10,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: 12,
                  backgroundColor: '#fff',
                  borderRadius: 6,
                  border: '1px solid #e0e0e0',
                  transition: 'all 0.2s'
                }}
              >
                {att.type === 'pdf' ? (
                  <div
                    style={{
                      width: 50,
                      height: 50,
                      backgroundColor: '#ff4757',
                      borderRadius: 4,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontWeight: 'bold',
                      fontSize: 12,
                      flexShrink: 0
                    }}
                  >
                    PDF
                  </div>
                ) : (
                  <img
                    src={att.url}
                    alt={att.name}
                    style={{
                      width: 50,
                      height: 50,
                      objectFit: 'cover',
                      borderRadius: 4,
                      border: '1px solid #ddd',
                      flexShrink: 0
                    }}
                  />
                )}
                <div style={{ flex: 1 }}>
                  <span style={{ fontSize: 13, color: '#333', fontWeight: 500, wordBreak: 'break-word', display: 'block' }}>
                    {att.name}
                  </span>
                </div>
                <button
                  onClick={() => handleRemoveAttachment(att.id)}
                  type='button'
                  style={{
                    padding: '6px 12px',
                    backgroundColor: '#ffebee',
                    color: '#c62828',
                    border: 'none',
                    borderRadius: 4,
                    cursor: 'pointer',
                    fontSize: 12,
                    fontWeight: 500,
                    transition: 'background-color 0.2s'
                  }}
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p style={{ color: '#999', fontSize: 13, padding: 12, textAlign: 'center', backgroundColor: '#fafafa', borderRadius: 6 }}>
            No attachments yet
          </p>
        )}
      </div>
    </div>
  );
}

// Mock attachment uploader component (supports images and PDFs)
function MockAttachmentUploader({ eventId, events, setEvents }) {
  const [fileName, setFileName] = useState('');
  const [fileUrl, setFileUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const reader = new FileReader();
    reader.onload = () => {
      setTimeout(() => {
        const fileType = file.type.startsWith('image/') ? 'image' : file.type === 'application/pdf' ? 'pdf' : 'file';
        setEvents((prev) =>
          prev.map((ev) =>
            ev.id === eventId
              ? {
                  ...ev,
                  attachments: [
                    ...(ev.attachments || []),
                    {
                      id: Date.now(),
                      name: file.name,
                      url: reader.result,
                      type: fileType
                    }
                  ]
                }
              : ev
          )
        );
        setUploading(false);
        e.target.value = '';
      }, 500);
    };
    reader.readAsDataURL(file);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      const input = document.createElement('input');
      input.type = 'file';
      Object.defineProperty(input, 'files', {
        value: e.dataTransfer.files
      });
      handleFileUpload({ target: input });
    }
  };

  const handleUrlUpload = () => {
    if (!fileName || !fileUrl) return;
    setUploading(true);
    setTimeout(() => {
      setEvents((prev) =>
        prev.map((ev) =>
          ev.id === eventId
            ? {
                ...ev,
                attachments: [
                  ...(ev.attachments || []),
                  { id: Date.now(), name: fileName, url: fileUrl, type: 'image' }
                ]
              }
            : ev
        )
      );
      setFileName('');
      setFileUrl('');
      setUploading(false);
    }, 500);
  };

  const event = events.find((ev) => ev.id === eventId);

  return (
    <div style={{ marginTop: 16 }}>
      <h4 style={{ marginBottom: 16, fontSize: 16, fontWeight: 600 }}>Attachments (Images & PDFs)</h4>

      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        style={{
          marginBottom: 20,
          padding: 24,
          border: dragActive ? '2px dashed #007bff' : '2px dashed #ddd',
          borderRadius: 8,
          backgroundColor: dragActive ? '#f0f8ff' : '#fafafa',
          textAlign: 'center',
          cursor: 'pointer',
          transition: 'all 0.3s ease'
        }}
      >
        <input
          type='file'
          id='fileInput'
          accept='image/*,.pdf'
          onChange={handleFileUpload}
          disabled={uploading}
          style={{ display: 'none' }}
        />
        <label
          htmlFor='fileInput'
          style={{
            cursor: uploading ? 'not-allowed' : 'pointer',
            display: 'block'
          }}
        >
          <div style={{ marginBottom: 12 }}>
            <svg
              width='48'
              height='48'
              viewBox='0 0 24 24'
              fill='none'
              stroke='#007bff'
              strokeWidth='2'
              style={{ margin: '0 auto', display: 'block' }}
            >
              <path d='M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4'></path>
              <polyline points='17 8 12 3 7 8'></polyline>
              <line x1='12' y1='3' x2='12' y2='15'></line>
            </svg>
          </div>
          <p style={{ margin: '8px 0', fontSize: 14, fontWeight: 500, color: '#333' }}>
            {uploading ? 'Uploading...' : 'Drag and drop or click to upload'}
          </p>
          <p style={{ margin: '4px 0', fontSize: 12, color: '#999' }}>
            Supported: PNG, JPG, GIF, WebP, PDF
          </p>
        </label>
      </div>

      <div style={{ marginBottom: 20, padding: 16, backgroundColor: '#f9f9f9', borderRadius: 8, border: '1px solid #e0e0e0' }}>
        <h5 style={{ margin: '0 0 12px 0', fontSize: 14, fontWeight: 600, color: '#333' }}>
          Or add by URL:
        </h5>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <input
            type='text'
            placeholder='File name'
            value={fileName}
            onChange={(e) => setFileName(e.target.value)}
            style={{
              flex: '1 1 150px',
              padding: '10px 12px',
              border: '1px solid #ddd',
              borderRadius: 6,
              fontSize: 13,
              fontFamily: 'inherit'
            }}
          />
          <input
            type='text'
            placeholder='Image URL (https://...)'
            value={fileUrl}
            onChange={(e) => setFileUrl(e.target.value)}
            style={{
              flex: '1 1 150px',
              padding: '10px 12px',
              border: '1px solid #ddd',
              borderRadius: 6,
              fontSize: 13,
              fontFamily: 'inherit'
            }}
          />
          <button
            onClick={handleUrlUpload}
            disabled={uploading}
            style={{
              padding: '10px 20px',
              backgroundColor: uploading ? '#ccc' : '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: 6,
              cursor: uploading ? 'not-allowed' : 'pointer',
              fontSize: 13,
              fontWeight: 500,
              whiteSpace: 'nowrap',
              transition: 'background-color 0.2s'
            }}
          >
            {uploading ? 'Uploading...' : 'Add URL'}
          </button>
        </div>
      </div>

      <div>
        <h5 style={{ margin: '0 0 12px 0', fontSize: 14, fontWeight: 600, color: '#333' }}>
          Attached Files ({event?.attachments?.length || 0}):
        </h5>
        {event?.attachments?.length > 0 ? (
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {event.attachments.map((att) => (
              <li
                key={att.id}
                style={{
                  marginBottom: 10,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: 12,
                  backgroundColor: '#fff',
                  borderRadius: 6,
                  border: '1px solid #e0e0e0',
                  transition: 'all 0.2s',
                  cursor: 'pointer'
                }}
                onClick={() => {
                  const link = document.createElement('a');
                  link.href = att.url;
                  link.download = att.name;
                  link.target = '_blank';
                  link.click();
                }}
              >
                {att.type === 'pdf' ? (
                  <div
                    style={{
                      width: 50,
                      height: 50,
                      backgroundColor: '#ff4757',
                      borderRadius: 4,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontWeight: 'bold',
                      fontSize: 12,
                      flexShrink: 0
                    }}
                  >
                    PDF
                  </div>
                ) : (
                  <img
                    src={att.url}
                    alt={att.name}
                    style={{
                      width: 50,
                      height: 50,
                      objectFit: 'cover',
                      borderRadius: 4,
                      border: '1px solid #ddd',
                      flexShrink: 0
                    }}
                  />
                )}
                <div style={{ flex: 1 }}>
                  <span style={{ fontSize: 13, color: '#333', fontWeight: 500, wordBreak: 'break-word', display: 'block' }}>
                    {att.name}
                  </span>
                  <span style={{ fontSize: 12, color: '#999' }}>
                    Click to open
                  </span>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p style={{ color: '#999', fontSize: 13, padding: 12, textAlign: 'center', backgroundColor: '#fafafa', borderRadius: 6 }}>
            No attachments yet
          </p>
        )}
      </div>
    </div>
  );
}
