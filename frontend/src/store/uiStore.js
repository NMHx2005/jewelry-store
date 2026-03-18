import { create } from 'zustand';

const useUIStore = create((set) => ({
  loading: false,
  isCartOpen: false,
  isAuthOpen: false,
  authMode: 'login', // 'login' | 'register'
  setLoading: (value) => set({ loading: value }),
  openCart: () => set({ isCartOpen: true }),
  closeCart: () => set({ isCartOpen: false }),
  toggleCart: () => set((state) => ({ isCartOpen: !state.isCartOpen })),
  openAuth: (mode = 'login') => set({ isAuthOpen: true, authMode: mode }),
  closeAuth: () => set({ isAuthOpen: false }),
}));

export default useUIStore;


