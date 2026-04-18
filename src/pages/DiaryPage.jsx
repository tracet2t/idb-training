import { useState } from 'react';
import { BookOpen } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import FieldNotes from '../components/diary/FieldNotes';
import ServiceReports from '../components/diary/ServiceReports';
import CalendarEvents from '../components/diary/CalendarEvents';
import '../styles/diary.css';

export default function DiaryPage() {
  const [activeTab, setActiveTab] = useState('field-notes');

  // Mock user ID for UI development (replace with actual auth later)
  const userId = 'user-demo-123';

  const handleLogout = () => {
    window.location.href = '/login';
  };

  return (
    <div className='diary-page-wrapper'>
      <Sidebar handleLogout={handleLogout} />
      
      <main className='diary-main-content'>
        <div className='diary-header'>
          <div className='header-content'>
            <BookOpen size={28} className='header-icon' />
            <div>
              <h1>Digital Diary</h1>
              <p>Your personal digital diary with notes, photos, reports, and events</p>
            </div>
          </div>
        </div>

        <div className='diary-tabs'>
          <button
            className={`tab-button ${activeTab === 'field-notes' ? 'active' : ''}`}
            onClick={() => setActiveTab('field-notes')}
          >
            Field Notes
          </button>
          <button
            className={`tab-button ${activeTab === 'service-reports' ? 'active' : ''}`}
            onClick={() => setActiveTab('service-reports')}
          >
            Service Reports
          </button>
          <button
            className={`tab-button ${activeTab === 'calendar' ? 'active' : ''}`}
            onClick={() => setActiveTab('calendar')}
          >
            Calendar & Events
          </button>
        </div>

        <div className='diary-content'>
          {activeTab === 'field-notes' && (
            <FieldNotes userId={userId} />
          )}
          
          {activeTab === 'service-reports' && (
            <ServiceReports userId={userId} />
          )}
          
          {activeTab === 'calendar' && (
            <CalendarEvents userId={userId} />
          )}
        </div>
      </main>
    </div>
  );
}
