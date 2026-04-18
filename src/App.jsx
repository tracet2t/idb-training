import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import SettingsPage from './pages/SettingsPage';
import DiaryPage from './pages/DiaryPage';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path='/login' element={<LoginPage />} />
        <Route path='/dashboard' element={<DashboardPage />} />
        <Route path='/settings' element={<SettingsPage />} />
        <Route path='/diary' element={<DiaryPage />} />
        <Route path='/' element={<Navigate to='/dashboard' replace />} />
      </Routes>
    </Router>
  );
}