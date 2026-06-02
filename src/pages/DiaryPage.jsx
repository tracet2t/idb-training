import { BookOpen } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import CalendarEvents from '../components/diary/CalendarEvents';
import useAuthStore from '../store/authStore';
import '../styles/diary.css';

export default function DiaryPage() {
  const userId = useAuthStore((state) => state.user?.sub);

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
          {userId ? (
            <CalendarEvents userId={userId} />
          ) : (
            <p style={{ padding: '1rem', color: '#64748b' }}>
              Unable to load diary — user session not available.
            </p>
          )}
        </div>
      </main>
    </div>
  );
}
