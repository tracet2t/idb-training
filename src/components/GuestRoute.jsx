import { Navigate, useLocation, useSearchParams } from 'react-router-dom';
import useAuthStore from '../store/authStore';

export default function GuestRoute({ children }) {
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);
  const location = useLocation();
  const [searchParams] = useSearchParams();

  if (isLoggedIn) {
    const candidate = searchParams.get('redirect') || location.state?.from?.pathname || '/dashboard';
    const redirect = candidate.startsWith('/') && !candidate.startsWith('//') ? candidate : '/dashboard';
    return <Navigate to={redirect} replace />;
  }

  return children;
}
