import { Navigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';

export default function GuestRoute({ children }) {
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);

  if (isLoggedIn) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
