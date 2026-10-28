import { create } from 'zustand';

export type MainNavTab = 'landing' | 'home' | 'yoga' | 'daily-rhythm' | 'health' | 'circle';

interface NavigationState {
  rhythmTab: 'habits' | 'mood' | 'journal';
  setRhythmTab: (tab: 'habits' | 'mood' | 'journal') => void;
  currentTab: MainNavTab;
  isSettingsOpen: boolean;
  isSosOpen: boolean;
  isDisclaimerOpen: boolean;
  isAdminOpen: boolean;
  isWorldSelectorOpen: boolean;
  worldSelectorMode: 'worlds' | 'studio';
  isAuthModalOpen: boolean;
  authModalMode: 'login' | 'signup' | 'otp';
  setTab: (tab: MainNavTab) => void;
  openSettings: (open?: boolean) => void;
  openSos: (open?: boolean) => void;
  openDisclaimer: (open?: boolean) => void;
  openAdmin: (open?: boolean) => void;
  openWorldSelector: (open?: boolean, mode?: 'worlds' | 'studio') => void;
  openAuthModal: (open?: boolean, mode?: 'login' | 'signup' | 'otp') => void;
}

export const useNavigationStore = create<NavigationState>((set, get) => ({
  rhythmTab: 'mood',
  setRhythmTab: rhythmTab => set({rhythmTab}),
  currentTab: 'home',
  isSettingsOpen: false,
  isSosOpen: false,
  isDisclaimerOpen: false,
  isAdminOpen: false,
  isWorldSelectorOpen: false,
  worldSelectorMode: 'studio',
  isAuthModalOpen: false,
  authModalMode: 'login',

  setTab: (tab: MainNavTab) => set({ currentTab: tab }),
  openSettings: (open) => set({ isSettingsOpen: open !== undefined ? open : !get().isSettingsOpen }),
  openSos: (open) => set({ isSosOpen: open !== undefined ? open : !get().isSosOpen }),
  openDisclaimer: (open) => set({ isDisclaimerOpen: open !== undefined ? open : !get().isDisclaimerOpen }),
  openAdmin: (open) => set({ isAdminOpen: open !== undefined ? open : !get().isAdminOpen }),
  openWorldSelector: (open, mode = 'studio') => set({ isWorldSelectorOpen: open !== undefined ? open : !get().isWorldSelectorOpen, worldSelectorMode: mode }),
  openAuthModal: (open, mode = 'login') => set({
    isAuthModalOpen: open !== undefined ? open : !get().isAuthModalOpen,
    authModalMode: mode,
  }),
}));
