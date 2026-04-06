import { create } from 'zustand';

const useAuthStore = create((set) => ({
  // stored values
  user: null,
  role: null,
  isLoggedIn: false,

  // call this after successful login
  setAuth: (user, role) => set({
    user,
    role,
    isLoggedIn: true,
  }),

  // call this after logout
  clearAuth: () => set({
    user: null,
    role: null,
    isLoggedIn: false,
  }),
}));

export default useAuthStore;