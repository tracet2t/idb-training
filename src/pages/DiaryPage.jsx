import { useState } from 'react';
import { BookOpen } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import CalendarEvents from '../components/diary/CalendarEvents';
import '../styles/diary.css';

export default function DiaryPage() {
  const [activeTab, setActiveTab] = useState('calendar');

  // Demo user ID (replace with actual auth later)
  const userId = '000000000000';

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

        {/* Removed diary-tabs and button for Calendar & Events */}

        <div className='diary-content'>
          <CalendarEvents userId={userId} />
        </div>
      </main>
    </div>
  );
}
