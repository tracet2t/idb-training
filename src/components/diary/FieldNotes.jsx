import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Plus, Edit, Trash2, X } from 'lucide-react';
import diaryService from '../../services/diaryService';

export default function FieldNotes({ userId }) {
  const [notes, setNotes] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, reset, watch } = useForm({
    defaultValues: {
      title: '',
      content: '',
      tags: '',
      date: new Date().toISOString().split('T')[0],
    },
  });

  const tagsValue = watch('tags');

  // Fetch notes on component mount
  useEffect(() => {
    if (userId) {
      fetchNotes();
    }
  }, [userId]);

  const fetchNotes = async () => {
    try {
      setLoading(true);
      const response = await diaryService.getFieldNotes(userId);
      setNotes(response.data || []);
    } catch (error) {
      console.error('Error fetching notes:', error);
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
        tags: data.tags.split(',').map((tag) => tag.trim()),
      };

      if (editingId) {
        await diaryService.updateFieldNote(editingId, payload);
      } else {
        await diaryService.createFieldNote(payload);
      }

      reset();
      setShowForm(false);
      setEditingId(null);
      fetchNotes();
    } catch (error) {
      console.error('Error saving note:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (note) => {
    setEditingId(note.id);
    reset({
      title: note.title,
      content: note.content,
      tags: note.tags.join(', '),
      date: note.date || new Date().toISOString().split('T')[0],
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this note?')) {
      try {
        await diaryService.deleteFieldNote(id);
        fetchNotes();
      } catch (error) {
        console.error('Error deleting note:', error);
      }
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
    reset();
  };

  return (
    <div className='field-notes-section'>
      <div className='section-header'>
        <h2>Field Notes</h2>
        {!showForm && (
          <button
            className='btn-primary'
            onClick={() => setShowForm(true)}
          >
            <Plus size={18} /> New Note
          </button>
        )}
      </div>

      {showForm && (
        <div className='note-form-container'>
          <form onSubmit={handleSubmit(onSubmit)} className='note-form'>
            <div className='form-group'>
              <label>Title</label>
              <input
                type='text'
                {...register('title', { required: 'Title is required' })}
                placeholder='Enter note title'
                className='form-input'
              />
            </div>

            <div className='form-row'>
              <div className='form-group'>
                <label>Date</label>
                <input
                  type='date'
                  {...register('date')}
                  className='form-input'
                />
              </div>
              <div className='form-group'>
                <label>Tags (comma-separated)</label>
                <input
                  type='text'
                  {...register('tags')}
                  placeholder='e.g., work, important, urgent'
                  className='form-input'
                />
              </div>
            </div>

            <div className='form-group'>
              <label>Content</label>
              <textarea
                {...register('content', { required: 'Content is required' })}
                placeholder='Write your note here...'
                className='form-textarea'
                rows='6'
              />
            </div>

            <div className='form-actions'>
              <button
                type='submit'
                className='btn-primary'
                disabled={loading}
              >
                {loading ? 'Saving...' : editingId ? 'Update Note' : 'Save Note'}
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

      <div className='notes-list'>
        {loading && !showForm ? (
          <p className='loading-text'>Loading notes...</p>
        ) : notes.length === 0 ? (
          <p className='empty-message'>No field notes yet. Create your first note!</p>
        ) : (
          notes.map((note) => (
            <div key={note.id} className='note-card'>
              <div className='note-header'>
                <div>
                  <h3>{note.title}</h3>
                  <p className='note-date'>
                    {new Date(note.date).toLocaleDateString()}
                  </p>
                </div>
                <div className='note-actions'>
                  <button
                    className='btn-icon'
                    onClick={() => handleEdit(note)}
                    title='Edit'
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    className='btn-icon btn-danger'
                    onClick={() => handleDelete(note.id)}
                    title='Delete'
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              {note.tags && note.tags.length > 0 && (
                <div className='note-tags'>
                  {note.tags.map((tag, idx) => (
                    <span key={idx} className='tag'>
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              <div className='note-content'>
                {note.content.substring(0, 150)}
                {note.content.length > 150 ? '...' : ''}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
