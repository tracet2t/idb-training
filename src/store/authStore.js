import { create } from 'zustand';

const useAuthStore = create((set) => ({
  user: null,
  role: null,
  isLoggedIn: false,
  authChecked: false,

  setAuth: (user, role) => set({
    user,
    role: role ?? user?.role ?? null,
    isLoggedIn: true,
  }),

  clearAuth: () => set({
    user: null,
    role: null,
    isLoggedIn: false,
  }),

  setAuthChecked: (authChecked) => set({ authChecked }),
}));

export default useAuthStore;