import { useState } from 'react';
import { Menu, X, LogOut } from 'lucide-react';
import idbLogo from '../assets/idblogo.png';
import '../styles/dashboard.css';

export default function Sidebar({ handleLogout }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [currentPath, setCurrentPath] = useState(window.location.pathname);

  return (
    <aside className={`sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
      <div className='sidebar-header'>
        <div className='idb-logo'>
          <div className='logo-badge'>
            <img src={idbLogo} alt='IDB Logo' className='logo-image' />
          </div>
          {sidebarOpen && <span className='logo-label'>Industrial Development Board of Ceylon</span>}
        </div>
        <button
          className='sidebar-toggle'
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      <nav className='sidebar-nav'>
        <a href='/dashboard' className={`nav-item ${currentPath === '/dashboard' ? 'active' : ''}`}>
          Dashboard
        </a>
        <a href='/programs' className={`nav-item ${currentPath === '/programs' ? 'active' : ''}`}>
          Programs
        </a>
        <a href='/participants' className={`nav-item ${currentPath === '/participants' ? 'active' : ''}`}>
          Participants
        </a>
        <a href='/analytics' className={`nav-item ${currentPath === '/analytics' ? 'active' : ''}`}>
          Analytics
        </a>
        <a href='/diary' className={`nav-item ${currentPath === '/diary' ? 'active' : ''}`}>
          Digital Diary
        </a>
        <a href='/settings' className={`nav-item ${currentPath === '/settings' ? 'active' : ''}`}>
          Settings
        </a>
      </nav>

      <div className='sidebar-footer'>
        <div className='admin-info'>
          <div className='admin-avatar'>I</div>
          <div className='admin-details'>
            <p className='admin-name'>IDB Admin</p>
            <p className='admin-role'>Administrator</p>
          </div>
        </div>
        <button onClick={handleLogout} className='sidebar-logout'>
          <LogOut size={18} /> Log Out
        </button>
      </div>
    </aside>
  );
}