import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import SettingsPage from './pages/SettingsPage';
import DiaryPage from './pages/DiaryPage';
import Programs from './pages/Programs';
import Participants from './pages/Participants';
import Analytics from './pages/Analytics';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path='/login' element={<LoginPage />} />
        <Route path='/dashboard' element={<DashboardPage />} />
        <Route path='/settings' element={<SettingsPage />} />
        <Route path='/diary' element={<DiaryPage />} />
        <Route path='/programs' element={<Programs />} />
        <Route path='/participants' element={<Participants />} />
        <Route path='/analytics' element={<Analytics />} />
        <Route path='/' element={<Navigate to='/dashboard' replace />} />
      </Routes>
    </Router>
  );
}