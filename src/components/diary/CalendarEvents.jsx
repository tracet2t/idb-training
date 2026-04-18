import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Calendar, Plus, Edit, Trash2, X } from 'lucide-react';
import { Calendar as RsuiteCalendar } from 'rsuite';
import diaryService from '../../services/diaryService';
import 'rsuite/Calendar/styles/index.css';

export default function CalendarEvents({ userId }) {
  const [events, setEvents] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedDateEvents, setSelectedDateEvents] = useState([]);
  const [showEventForm, setShowEventForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, reset, watch } = useForm({
    defaultValues: {
      title: '',
      date: new Date().toISOString().split('T')[0],
      time: '09:00',
      description: '',
    },
  });

  const watchDate = watch('date');

  useEffect(() => {
    if (userId) {
      fetchCalendarEvents();
    }
  }, [userId]);

  // Update selected date events when date changes
  useEffect(() => {
    const dateString = selectedDate.toISOString().split('T')[0];
    const dateEvents = events.filter((e) => e.date === dateString);
    setSelectedDateEvents(dateEvents);
  }, [selectedDate, events]);

  const fetchCalendarEvents = async () => {
    try {
      setLoading(true);
      const month = selectedDate.getMonth() + 1;
      const year = selectedDate.getFullYear();
      const response = await diaryService.getCalendarEvents(
        userId,
        month,
        year
      );
      setEvents(response.data || []);
    } catch (error) {
      console.error('Error fetching calendar events:', error);
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      const payload = {
        ...data,
        userId,
        dateTime: `${data.date}T${data.time}:00`,
      };

      if (editingId) {
        await diaryService.updateCalendarEvent(editingId, payload);
      } else {
        await diaryService.createCalendarEvent(payload);
      }

      reset();
      setShowEventForm(false);
      setEditingId(null);
      fetchCalendarEvents();
    } catch (error) {
      console.error('Error saving event:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (event) => {
    const [date, time] = event.dateTime.split('T');
    const timeOnly = time?.substring(0, 5) || '';
    setEditingId(event.id);
    reset({
      title: event.title,
      date,
      time: timeOnly,
      description: event.description,
    });
    setShowEventForm(true);
  };

  const handleDelete = async (id) => {
    if (confirm('Delete this event?')) {
      try {
        await diaryService.deleteCalendarEvent(id);
        fetchCalendarEvents();
      } catch (error) {
        console.error('Error deleting event:', error);
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
    const dateEvents = events.filter((e) => e.date === dateString);
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
            {selectedDateEvents.length === 0 ? (
              <p className='empty-message'>No events scheduled for this date</p>
            ) : (
              <div className='events-for-date'>
                {selectedDateEvents.map((event) => (
                  <div key={event.id} className='event-item'>
                    <div className='event-time'>
                      {event.dateTime
                        ? event.dateTime.split('T')[1]?.substring(0, 5)
                        : ''}
                    </div>
                    <div className='event-details'>
                      <h4>{event.title}</h4>
                      {event.description && (
                        <p className='event-description'>
                          {event.description}
                        </p>
                      )}
                    </div>
                    <div className='event-item-actions'>
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
