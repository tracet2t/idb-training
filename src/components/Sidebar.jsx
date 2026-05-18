import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Menu, X, LogOut, LayoutDashboard, Package, Users, Clipboard, BarChart3, Book, Settings } from 'lucide-react';
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
        <NavLink to='/dashboard' className={navClassName} title='Dashboard'>
          <LayoutDashboard size={18} />
          {sidebarOpen && <span>Dashboard</span>}
        </NavLink>
        <NavLink to='/programs' className={navClassName} title='Programs'>
          <Package size={18} />
          {sidebarOpen && <span>Programs</span>}
        </NavLink>
        <NavLink to='/participants' className={navClassName} title='Participants'>
          <Users size={18} />
          {sidebarOpen && <span>Participants</span>}
        </NavLink>
        <NavLink to='/enrollments' className={navClassName} title='Enrollments'>
          <Clipboard size={18} />
          {sidebarOpen && <span>Enrollments</span>}
        </NavLink>
        <NavLink to='/analytics' className={navClassName} title='Analytics'>
          <BarChart3 size={18} />
          {sidebarOpen && <span>Analytics</span>}
        </NavLink>
        <NavLink to='/diary' className={navClassName} title='Digital Diary'>
          <Book size={18} />
          {sidebarOpen && <span>Digital Diary</span>}
        </NavLink>
        <NavLink to='/settings' className={navClassName} title='Settings'>
          <Settings size={18} />
          {sidebarOpen && <span>Settings</span>}
        </NavLink>
      </nav>

      <div className='sidebar-footer'>
        <button onClick={handleLogout} className='sidebar-logout' title='Log Out'>
          <LogOut size={18} />
          {sidebarOpen && <span>Log Out</span>}
        </button>
      </div>
    </aside>
  );
}
