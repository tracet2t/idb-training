import { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { Calendar, Plus, Edit, Trash2, X } from 'lucide-react';
import { Calendar as RsuiteCalendar } from 'rsuite';
import 'rsuite/Calendar/styles/index.css';

const API_BASE_URL = 'http://localhost:3000/api';
const DEFAULT_USER_ID = '000000000000'; // Demo user

export default function CalendarEvents({ userId = DEFAULT_USER_ID }) {
  const [events, setEvents] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedDateEvents, setSelectedDateEvents] = useState([]);
  const [showEventForm, setShowEventForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [openEventId, setOpenEventId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const { register, handleSubmit, reset, watch } = useForm({
    defaultValues: {
      title: '',
      date: new Date().toISOString().split('T')[0],
      time: '09:00',
      description: '',
      color: '#3B82F6',
    },
  });

  const watchDate = watch('date');

  // Fetch events from backend on component mount
  useEffect(() => {
    fetchEvents();
  }, [userId]);

  // Update selected date events when date changes
  useEffect(() => {
    const dateString = selectedDate.toISOString().split('T')[0];
    const dateEvents = events.filter((e) => {
      const eventDate = e.eventDate?.split('T')[0];
      return eventDate === dateString;
    });
    setSelectedDateEvents(dateEvents);
  }, [selectedDate, events]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${API_BASE_URL}/diary-events/user/${userId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch events');
      }
      const data = await response.json();
      setEvents(data || []);
    } catch (err) {
      console.error('Error fetching events:', err);
      setError('Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      setError(null);

      // Format data for backend
      const payload = {
        title: data.title,
        description: data.description,
        eventDate: `${data.date}T${data.time}:00Z`,
        eventTime: data.time,
        color: data.color || '#3B82F6',
        createdById: userId
      };

      let url = `${API_BASE_URL}/diary-events`;
      let method = 'POST';

      if (editingId) {
        // Update existing event
        url += `/${editingId}`;
        method = 'PUT';
      }

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save event');
      }

      const savedEvent = await response.json();
      
      if (editingId) {
        setEvents((prev) =>
          prev.map((ev) => (ev.id === editingId ? savedEvent : ev))
        );
        setEditingId(null);
      } else {
        setEvents((prev) => [...prev, savedEvent]);
        setOpenEventId(savedEvent.id);
      }

      setShowEventForm(false);
      reset({
        title: '',
        date: new Date().toISOString().split('T')[0],
        time: '09:00',
        description: '',
        color: '#3B82F6',
      });
    } catch (err) {
      console.error('Error saving event:', err);
      setError(err.message || 'Failed to save event');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (event) => {
    const eventDate = event.eventDate?.split('T')[0];
    const eventTime = event.eventTime || event.eventDate?.split('T')[1]?.substring(0, 5) || '';
    
    setEditingId(event.id);
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
    if (confirm('Delete this event?')) {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(`${API_BASE_URL}/diary-events/${id}`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          throw new Error('Failed to delete event');
        }

        setEvents((prev) => prev.filter((ev) => ev.id !== id));
        setOpenEventId(null);
      } catch (err) {
        console.error('Error deleting event:', err);
        setError('Failed to delete event');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleCancel = () => {
    setShowEventForm(false);
    setEditingId(null);
    reset();
  };

  const handleDateSelect = (date) => {
    setSelectedDate(date);
  };

  // Function to render event indicators on calendar dates
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
            <Plus size={18} /> New Event
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
              <div className='event-attachments-dynamic'>
                <button
                  className='btn-primary'
                  onClick={() => setOpenEventId(null)}
                  style={{ marginBottom: 12 }}
                >
                  Back to Events
                </button>
                <MockAttachmentUploader
                  eventId={openEventId}
                  events={events}
                  setEvents={setEvents}
                />
              </div>
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
                          📎 {event.attachments.length} attachment{event.attachments.length > 1 ? 's' : ''} - Click to view
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
                        <Edit size={14} />
                      </button>
                      <button
                        className='btn-icon btn-danger'
                        onClick={() => handleDelete(event.id)}
                      >
                        <Trash2 size={14} />
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
          <div className='event-form-container'>
            <div className='form-header'>
              <h3>{editingId ? 'Edit Event' : 'Create New Event'}</h3>
              <button className='btn-close' onClick={handleCancel}>
                <X size={20} />
              </button>
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
                <label>Event Title</label>
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
                <label>Description</label>
                <textarea
                  {...register('description')}
                  placeholder='Event description (optional)'
                  className='form-textarea'
                  rows='4'
                />
              </div>

              <div className='form-group'>
                <label>Color</label>
                <input
                  type='color'
                  {...register('color')}
                  className='form-input'
                  style={{ height: '40px', cursor: 'pointer' }}
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
                      : 'Create Event'}
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

// Mock attachment uploader component (supports images and PDFs)
function MockAttachmentUploader({ eventId, events, setEvents }) {
  const [fileName, setFileName] = useState('');
  const [fileUrl, setFileUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

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
        e.target.value = ''; // Reset file input
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
      
      {/* Drag and Drop File Upload Section */}
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

      {/* URL Upload Section */}
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
            onMouseEnter={(e) => !uploading && (e.target.style.backgroundColor = '#218838')}
            onMouseLeave={(e) => !uploading && (e.target.style.backgroundColor = '#28a745')}
          >
            {uploading ? 'Uploading...' : 'Add URL'}
          </button>
        </div>
      </div>

      {/* Attachments List */}
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
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
                  e.currentTarget.style.backgroundColor = '#f5f5f5';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = 'none';
                  e.currentTarget.style.backgroundColor = '#fff';
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
