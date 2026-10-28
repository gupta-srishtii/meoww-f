import { create } from 'zustand';
import { User, ProfileUpdate } from '../types/auth';
import { services } from '../services';

function readDisclaimerPreference() {
  try {return localStorage.getItem('maitri_disclaimer_accepted') === 'true';}
  catch {return false;}
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  disclaimerAccepted: boolean;
  login: (email: string) => Promise<void>;
  authenticate: (email: string, password: string, mode: 'login' | 'signup') => Promise<void>;
  verifyOtp: (email: string, otp: string) => Promise<void>;
  logout: () => Promise<void>;
  switchRole: (role: User['role']) => Promise<void>;
  updateProfile: (profile: ProfileUpdate) => Promise<void>;
  acceptDisclaimer: () => void;
  initSession: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  disclaimerAccepted: readDisclaimerPreference(),

  initSession: async () => {
    try { const user = await services.auth.getCurrentUser(); set({ user, isAuthenticated: !!user }); }
    catch { set({ user: null, isAuthenticated: false }); }
  },

  authenticate: async (email, password, mode) => {
    set({isLoading: true});
    try { const session = await services.auth.authenticate(email, password, mode); set({user: session.user, isAuthenticated: session.isAuthenticated}); }
    finally { set({isLoading: false}); }
  },

  login: async (email: string) => {
    set({ isLoading: true });
    try{const session = await services.auth.login(email);
    set({ user: session.user, isAuthenticated: true });}finally{set({isLoading:false});}
  },

  verifyOtp: async (email: string, otp: string) => {
    set({ isLoading: true });
    try{const session = await services.auth.verifyOtp(email, otp);
    set({ user: session.user, isAuthenticated: true });}finally{set({isLoading:false});}
  },

  logout: async () => {
    await services.auth.logout();
    set({ user: null, isAuthenticated: false });
  },

  switchRole: async (role: User['role']) => {
    const user = await services.auth.switchRole(role);
    set({ user });
  },

  updateProfile: async (profile) => {
    const user = await services.auth.updateProfile(profile);
    set({user});
  },

  acceptDisclaimer: () => {
    try {localStorage.setItem('maitri_disclaimer_accepted','true');} catch { /* Keep consent for this visit if storage is unavailable. */ }
    set({ disclaimerAccepted: true });
  },
}));
