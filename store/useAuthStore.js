import { create } from 'zustand';

const useAuthStore = create((set) => ({
  user:          null,
  isLoggedIn:    false,
  isLoading:     true,

  setUser:       (user)  => set({ user, isLoggedIn: !!user }),
  setLoading:    (val)   => set({ isLoading: val }),
  logout:        ()      => set({ user: null, isLoggedIn: false }),
}));

export default useAuthStore;
