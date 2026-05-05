import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Menu, X, LogOut } from 'lucide-react';
import idbLogo from '../assets/idblogo.png';
import '../styles/dashboard.css';

export default function Sidebar({ handleLogout }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const navClassName = ({ isActive }) => `nav-item ${isActive ? 'active' : ''}`;

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
        <NavLink to='/dashboard' className={navClassName}>
          Dashboard
        </NavLink>
        <NavLink to='/programs' className={navClassName}>
          Programs
        </NavLink>
        <NavLink to='/participants' className={navClassName}>
          Participants
        </NavLink>
        <NavLink to='/analytics' className={navClassName}>
          Analytics
        </NavLink>
        <NavLink to='/diary' className={navClassName}>
          Digital Diary
        </NavLink>
        <NavLink to='/settings' className={navClassName}>
          Settings
        </NavLink>
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