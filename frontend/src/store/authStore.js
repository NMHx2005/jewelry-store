import { create } from 'zustand';

const initialToken = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
const initialUser = initialToken && typeof window !== 'undefined'
  ? JSON.parse(localStorage.getItem('user') || 'null')
  : null;

const useAuthStore = create((set) => ({
  user: initialUser,
  token: initialToken,
  setAuth: (data) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
    }
    set({ user: data.user, token: data.token });
  },
  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
    set({ user: null, token: null });
  },
}));

export default useAuthStore;


