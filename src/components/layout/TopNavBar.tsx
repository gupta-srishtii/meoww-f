import React, {useEffect, useLayoutEffect, useRef, useState} from 'react';
import {Home, Compass, Sun, HeartPulse, Users, ShieldAlert, Settings, ShieldCheck, Volume2, VolumeX, Play, Pause, X} from 'lucide-react';
import {useNavigationStore, MainNavTab} from '../../store/useNavigationStore';
import {useThemeStore} from '../../store/useThemeStore';
import {useAuthStore} from '../../store/useAuthStore';
import './navigation.css';

export const TopNavBar: React.FC = () => {
  const {currentTab, setTab, openSettings, openSos, openWorldSelector, openAdmin, openAuthModal} = useNavigationStore();
  const {config, motion, soundEnabled, toggleSound, volume, setVolume, soundPreset, update, audioStatus} = useThemeStore();
  const {user, isAuthenticated} = useAuthStore();
  const navRef = useRef<HTMLElement>(null);
  const audioPanelRef = useRef<HTMLDivElement>(null);
  const audioTriggerRef = useRef<HTMLButtonElement>(null);
  const [indicator, setIndicator] = useState({left:5,width:80});
  const [audioOpen, setAudioOpen] = useState(false);

  useLayoutEffect(() => {
    const nav = navRef.current;
    if (!nav) return;
    const measure = () => {
      const active = nav.querySelector<HTMLElement>('[aria-current="page"]');
      if (active) setIndicator({left:active.offsetLeft,width:active.offsetWidth});
      else setIndicator({left:0, width:0});
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(nav);
    return () => observer.disconnect();
  }, [currentTab, isAuthenticated]);

  useEffect(() => {
    if (!audioOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        setAudioOpen(false);
        audioTriggerRef.current?.focus();
      }
    };
    const handleClick = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        audioPanelRef.current &&
        !audioPanelRef.current.contains(target) &&
        audioTriggerRef.current &&
        !audioTriggerRef.current.contains(target)
      ) {
        setAudioOpen(false);
      }
    };
    document.addEventListener('keydown', handleKey);
    document.addEventListener('mousedown', handleClick);
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.removeEventListener('mousedown', handleClick);
    };
  }, [audioOpen]);

  const navItems: {id:MainNavTab; label:string; icon:React.ReactNode}[] = [
    {id:'home', label:'Home', icon:<Home size={15}/>},
    {id:'yoga', label:'Wellness Studio', icon:<Compass size={15}/>},
    {id:'daily-rhythm', label:'Daily Rhythm', icon:<Sun size={15}/>},
    {id:'health', label:'Health', icon:<HeartPulse size={15}/>},
    {id:'circle', label:'Circle', icon:<Users size={15}/>},
  ];

  const goIntro = () => {
    setTab('landing');
    window.scrollTo({top:0, behavior:motion === 'none' ? 'instant' : 'smooth'});
  };

  return <header className={`nav-floating-container ${isAuthenticated ? 'workspace-nav' : 'public-nav'}`}>
    <button className="brand-icon" aria-label="MAITRI introduction" onClick={goIntro}>
      <img src="/assets/logo.png" alt="MAITRI" className="brand-logo-img" />
      <span className="brand-tooltip" role="tooltip">MAITRI</span>
    </button>
    {isAuthenticated ? <>
      <nav ref={navRef} className="nav-floating-shell" aria-label="Main Navigation">
        <span className="nav-indicator" aria-hidden="true" style={{width:indicator.width,transform:`translateX(${indicator.left}px)`}}/>
        {navItems.map(item => <button key={item.id} aria-current={currentTab === item.id ? 'page' : undefined} className={`nav-item-btn ${currentTab === item.id ? 'active' : ''}`} onClick={() => setTab(item.id)}>{item.icon}<span>{item.label}</span></button>)}
      </nav>
      <div className="workspace-controls">
        <button
          ref={audioTriggerRef}
          id="ambient-audio-trigger"
          className={`btn btn-icon audio-trigger ${soundEnabled ? 'is-active' : ''}`}
          aria-label={soundEnabled ? "Ambient soundscape (playing)" : "Ambient soundscape (off)"}
          title="Ambient soundscape"
          aria-haspopup="dialog"
          aria-expanded={audioOpen}
          onClick={() => setAudioOpen(!audioOpen)}
        >
          {soundEnabled ? <Volume2 size={19} /> : <VolumeX size={19} />}
          {soundEnabled && <span className="audio-live-dot" aria-hidden="true" />}
        </button>

        {audioOpen && (
          <div ref={audioPanelRef} className="ambient-audio-popover" role="dialog" aria-modal="false" aria-label="Ambient soundscape panel">
            <header className="ambient-audio-header">
              <div>
                <strong>Ambient Soundscape</strong>
                <small>Synthesized atmospheric tones</small>
              </div>
              <button className="btn btn-icon btn-secondary audio-close-btn" aria-label="Close ambient panel" onClick={() => setAudioOpen(false)}>
                <X size={16} />
              </button>
            </header>
            <div className="ambient-audio-body">
              <div className="audio-toggle-row">
                <button
                  className={`btn ${soundEnabled ? 'btn-primary' : 'btn-secondary'} audio-play-btn`}
                  onClick={toggleSound}
                >
                  {soundEnabled ? <Pause size={15} /> : <Play size={15} />}
                  <span>{soundEnabled ? 'Pause Ambience' : 'Play Ambience'}</span>
                </button>
                <span className={`audio-status-pill ${soundEnabled ? 'running' : ''}`} role="status">
                  {soundEnabled ? (audioStatus.includes('running') ? 'Playing' : 'Active') : 'Paused'}
                </span>
              </div>
              <label className="audio-control-label">
                <span className="audio-control-title">
                  Volume <output>{Math.round(volume * 100)}%</output>
                </span>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={volume}
                  onChange={(e) => setVolume(Number(e.target.value))}
                  aria-label="Ambient sound volume"
                />
              </label>
              <label className="audio-control-label">
                <span className="audio-control-title">Tone atmosphere</span>
                <select
                  value={soundPreset}
                  onChange={(e) => update({ soundPreset: e.target.value as 'world' | 'warm' | 'clear' })}
                  aria-label="Select ambient tone preset"
                >
                  <option value="world">World tone ({config.name})</option>
                  <option value="warm">Warm hum (110 Hz)</option>
                  <option value="clear">Clear tone (440 Hz)</option>
                </select>
              </label>
              <p className="audio-disclaimer">
                Synthesized atmospheric tones generated locally. Playback starts only with your interaction.
              </p>
            </div>
          </div>
        )}

        {/* World selection stays separate from interface themes */}
        <button
          id="world-selector-trigger"
          className="btn btn-icon world-trigger"
          aria-label={`Choose sanctuary world, current: ${config.name}`}
          onClick={() => openWorldSelector(true, 'worlds')}
        >
          <Compass size={19}/>
        </button>

        <button className="btn btn-icon safety-trigger" aria-label="Safety and support" title="Safety and support" onClick={() => openSos(true)}><ShieldAlert size={18}/></button>
        {user?.role && ['admin','superadmin'].includes(user.role) && <button className="btn btn-icon" aria-label="Demo admin console" title="Demo admin console" onClick={() => openAdmin(true)}><ShieldCheck size={18}/></button>}
        <button className="btn btn-icon" aria-label="Settings & Profile" title="Settings & Profile" onClick={() => openSettings(true)}><Settings size={18}/></button>
      </div>
    </> : <nav className="public-nav-links" aria-label="Public Navigation">
      <a href="#about-maitri">About MAITRI</a><a href="#explore-worlds">Explore</a>
      <button className="btn btn-secondary" onClick={() => openAuthModal(true,'login')}>Log In</button>
      <button className="btn btn-primary" onClick={() => openAuthModal(true,'signup')}>Sign Up</button>
    </nav>}
  </header>;
};

