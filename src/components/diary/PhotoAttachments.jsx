import { useState, useEffect } from 'react';
import { Upload, Trash2, X } from 'lucide-react';
import diaryService from '../../services/diaryService';

export default function PhotoAttachments({ eventId, noteId }) {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const attachmentId = eventId ?? noteId;

  useEffect(() => {
    if (attachmentId) {
      fetchPhotos();
    }
  }, [attachmentId]);

  const fetchPhotos = async () => {
    try {
      setLoading(true);
      const response = await diaryService.getPhotos(attachmentId);
      setPhotos(response.data || []);
    } catch (error) {
      console.error('Error fetching photos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !attachmentId) return;

    try {
      setUploading(true);
      await diaryService.uploadPhoto(file, attachmentId);
      setPreviewUrl(null);
      fetchPhotos();
    } catch (error) {
      console.error('Error uploading photo:', error);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (photoId) => {
    if (confirm('Delete this photo?')) {
      try {
        await diaryService.deletePhoto(photoId, attachmentId);
        fetchPhotos();
      } catch (error) {
        console.error('Error deleting photo:', error);
      }
    }
  };

  if (!attachmentId) {
    return (
      <div className='photo-attachments-section'>
        <div className='upload-area upload-area-disabled'>
          <label className='upload-button upload-button-disabled'>
            <Upload size={20} />
            Attach PNG image
            <input
              type='file'
              accept='image/png'
              disabled
              style={{ display: 'none' }}
            />
          </label>
          <p className='upload-hint'>Save the event first to enable uploads.</p>
        </div>
      </div>
    );
  }

  return (
    <div className='photo-attachments-section'>
      <div className='section-header'>
        <h3>Photo Attachments</h3>
      </div>

      <div className='upload-area'>
        <label className='upload-button'>
          <Upload size={20} />
          {uploading ? 'Uploading...' : 'Attach photo'}
          <input
            type='file'
            accept='image/png'
            onChange={handleUpload}
            disabled={uploading}
            style={{ display: 'none' }}
          />
        </label>
        <p className='upload-hint'>PNG only. One image per upload.</p>
      </div>

      {previewUrl && (
        <div className='preview-container'>
          <div className='preview-image'>
            <img src={previewUrl} alt='Preview' />
            <button
              className='btn-remove'
              onClick={() => setPreviewUrl(null)}
            >
              <X size={16} />
            </button>
          </div>
        </div>
      )}

      <div className='photos-grid'>
        {loading ? (
          <p className='loading-text'>Loading photos...</p>
        ) : photos.length === 0 ? (
          <p className='empty-message'>No photos yet</p>
        ) : (
          photos.map((photo) => (
            <div key={photo.id} className='photo-card'>
              <img src={photo.url} alt='Photo' />
              <button
                className='btn-delete'
                onClick={() => handleDelete(photo.id)}
                title='Delete'
              >
                <Trash2 size={14} />
              </button>
              {photo.uploadedAt && (
                <p className='photo-date'>
                  {new Date(photo.uploadedAt).toLocaleDateString()}
                </p>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
