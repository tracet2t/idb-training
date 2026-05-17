import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:3000',
  withCredentials: true,
});

// Do not redirect or clear auth on resource 401s — the session cookie may still
// be valid (e.g. /auth/profile works but /users returns 401 for permissions).
// Session expiry is handled on app load via getProfile() in App.jsx.
api.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(error)
);

export default api;
