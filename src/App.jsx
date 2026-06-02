import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import SettingsPage from './pages/SettingsPage';
import Programs from './pages/Programs';
import Participants from './pages/Participants';
import Analytics from './pages/Analytics';

import ProgramEnrollments from './pages/ProgramEnrollments'

import DiaryPage from './pages/DiaryPage';
import ProtectedRoute from './components/ProtectedRoute';
import GuestRoute from './components/GuestRoute';
import { getProfile } from './services/authService';
import useAuthStore from './store/authStore';

export default function App() {
  const authChecked = useAuthStore((state) => state.authChecked);
  const setAuth = useAuthStore((state) => state.setAuth);
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const setAuthChecked = useAuthStore((state) => state.setAuthChecked);

  useEffect(() => {
    if (authChecked) return;

    getProfile()
      .then((user) => setAuth(user, user?.role))
      .catch(() => clearAuth())
      .finally(() => setAuthChecked(true));
  }, [authChecked, setAuth, clearAuth, setAuthChecked]);

  if (!authChecked) {
    return null;
  }

  return (
    <Router>
      <Routes>

        <Route 
          path="/enrollments" 
          element={
            <ProtectedRoute>
             <ProgramEnrollments />
            </ProtectedRoute>
           
            } 
        />

        <Route
          path="/login"
          element={
            <GuestRoute>
              <LoginPage />
            </GuestRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/programs"
          element={
            <ProtectedRoute>
              <Programs />
            </ProtectedRoute>
          }
        />
        <Route
          path="/participants"
          element={
            <ProtectedRoute>
              <Participants />
            </ProtectedRoute>
          }
        />
        <Route
          path="/analytics"
          element={
            <ProtectedRoute>
              <Analytics />
            </ProtectedRoute>
          }
        />
        <Route
          path="/diary"
          element={
            <ProtectedRoute>
              <DiaryPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <SettingsPage />
            </ProtectedRoute>
          }
        />
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}
