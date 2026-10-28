import React, { useEffect } from 'react';
import { useNavigationStore } from './store/useNavigationStore';
import { useAuthStore } from './store/useAuthStore';
import { useThemeStore, applyTheme } from './store/useThemeStore';
import { AmbientBackdrop } from './components/layout/AmbientBackdrop';
import { TopNavBar } from './components/layout/TopNavBar';
import { CompanionChatDrawer } from './components/companion/CompanionChatDrawer';
import { SOSModal } from './components/safety/SOSModal';
import { WorldSelectorModal } from './components/safety/WorldSelectorModal';
import { AiDisclaimerModal } from './components/safety/AiDisclaimerModal';
import { SettingsModal } from './components/settings/SettingsModal';
import { AdminModal } from './components/settings/AdminModal';
import { AuthModal } from './features/entry/AuthModal';
import { LandingView } from './features/entry/LandingView';
import { HomeView } from './features/home/HomeView';
import { YogaView } from './features/yoga/YogaView';
import { DailyRhythmView } from './features/daily-rhythm/DailyRhythmView';
import { HealthView } from './features/health/HealthView';
import { CircleView } from './features/circle/CircleView';
import { useCompanionStore } from './store/useCompanionStore';

export const App: React.FC = () => {
  const { currentTab } = useNavigationStore();
  const { initSession, isAuthenticated } = useAuthStore();
  const theme = useThemeStore();

  useEffect(() => {
    initSession();

  }, []);

  useEffect(() => { applyTheme(theme.preview?.preferences || theme, theme.preview?.world || theme.activeWorld); }, [theme]);

  // Public storytelling can be long; a new workspace view starts at its heading.
  useEffect(() => { window.scrollTo({top:0, behavior:'instant'}); }, [currentTab, isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated) {
      useCompanionStore.getState().setDrawerOpen(false);
      useNavigationStore.getState().openSettings(false);
      useNavigationStore.getState().openAdmin(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    const nodes = document.querySelectorAll('.landing section, .story-grid article, .sanctuary-workspace-grid>section, .page-circle .glass-card, .journey-item');
    const observer = new IntersectionObserver(entries => entries.forEach(entry => { if(entry.isIntersecting){entry.target.classList.add('revealed');observer.unobserve(entry.target);} }), {threshold:.08});
    nodes.forEach((node,i) => {node.classList.add('scroll-reveal');(node as HTMLElement).style.setProperty('--reveal-delay', (i%3)*60+'ms');observer.observe(node);});
    return () => observer.disconnect();
  }, [currentTab,isAuthenticated]);

  const renderActiveView = () => {
    // If user is not authenticated or visits landing
    if (!isAuthenticated || currentTab === 'landing') {
      return <LandingView />;
    }

    switch (currentTab) {
      case 'home':
        return <HomeView />;
      case 'yoga':
        return <YogaView />;
      case 'daily-rhythm':
        return <DailyRhythmView />;
      case 'health':
        return <HealthView />;
      case 'circle':
        return <CircleView />;
      default:
        return <HomeView />;
    }
  };

  return (
    <div className="app-viewport"><a className="skip-link" href="#main">Skip to content</a>
      {/* Living Atmospheric Terrarium Backdrop */}
      <AmbientBackdrop />

      {/* Top Floating Navigation Shell */}
      <TopNavBar />

      {/* Main Workspace Stage */}
      <main id="main" key={isAuthenticated && currentTab !== 'landing' ? currentTab : "landing"} className={`main-content-stage page-${isAuthenticated && currentTab !== 'landing' ? currentTab : "landing"}`}>
        {renderActiveView()}
      </main>

      {/* Persistent Companion Conversation Drawer */}
      {isAuthenticated && <CompanionChatDrawer />}

      {/* Global Modals & Dialogs */}
      <SOSModal />
      <WorldSelectorModal />
      <AiDisclaimerModal />
      {isAuthenticated && <SettingsModal />}
      {isAuthenticated && <AdminModal />}
      <AuthModal />
    </div>
  );
};

export default App;

