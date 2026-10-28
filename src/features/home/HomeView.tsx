import React, { useEffect, useRef, useState } from 'react';
import { ArrowUpRight, Check, Sun, Cloud, CloudRain, Smile, Sparkles, HeartPulse, BookOpen, Wind, ArrowRight } from 'lucide-react';
import { useWellnessStore } from '../../store/useWellnessStore';
import { WORLD_CONFIGS } from '../../types/world';
import { useAuthStore } from '../../store/useAuthStore';
import { useThemeStore } from '../../store/useThemeStore';
import { useNavigationStore } from '../../store/useNavigationStore';
import { useCompanionStore } from '../../store/useCompanionStore';
import { LivingCompanion } from '../../components/companion/CompanionStage';
import { services } from '../../services';
import { Habit, MoodCheckIn, JournalEntry, MoodScore } from '../../types/rhythm';
import { SanctuaryPractice } from './SanctuaryPractice';
import './home-sanctuary.css';
import { WorldAtmosphere } from '../../components/layout/AmbientBackdrop';

export const HomeView = () => {
  const { user } = useAuthStore();
  const theme = useThemeStore();
  const activeWorld = theme.preview?.world || theme.activeWorld;
  const preferences = theme.preview?.preferences || theme;
  const config = WORLD_CONFIGS[activeWorld === 'custom' ? preferences.customBackground : activeWorld];
  const { setTab, openWorldSelector } = useNavigationStore();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [moods, setMoods] = useState<MoodCheckIn[]>([]);
  const [journal, setJournal] = useState<JournalEntry>();
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [intention, setIntention] = useState(() => { try { return localStorage.getItem('maitri_intention') || ''; } catch { return ''; } });
  const activities = useWellnessStore(s => s.activities);
  const [journeyKind, setJourneyKind] = useState('all');
  const [chosenMood, setChosenMood] = useState<string | null>(null);
  const hero = useRef<HTMLElement>(null);
  const pointerFrame = useRef(0);
  const approvedMoods = moods.filter(m => m.id.startsWith('m_'));
  const needsCalm = approvedMoods.length > 0 && approvedMoods[approvedMoods.length - 1].mood < 3;
  const done = habits.filter(h => h.completedToday).length;
  const shownActivities = activities.filter(a => journeyKind === 'all' || a.kind === journeyKind).slice(0, 6);

  const load = async () => {
    setLoading(true); setMessage('');
    try {
      const [h, m, j] = await Promise.all([services.rhythm.getHabits(), services.rhythm.getMoodCheckIns(7), services.rhythm.getJournalEntries()]);
      setHabits(h); setMoods(m); setJournal(j[0]);
    } catch { setMessage('Could not load your local sanctuary. Please try again.'); }
    finally { setLoading(false); }
  };
  useEffect(() => { void load(); return () => cancelAnimationFrame(pointerFrame.current); }, []);

  const checkIn = async (n: MoodScore) => {
    setBusy(true);
    try {
      const mood = await services.rhythm.addMoodCheckIn(n, [], undefined, activeWorld);
      setMoods(m => [...m, mood]); setMessage('Your check-in is saved. Every feeling has a place here.');
      if (n < 3) useCompanionStore.getState().setMoodState('comforting');
      else useCompanionStore.getState().celebrate();
    } catch { setMessage('Could not save your check-in. Please try again.'); }
    finally { setBusy(false); }
  };
  const toggleHabit = async (id: string) => {
    setBusy(true);
    try {
      const next = await services.rhythm.toggleHabit(id);
      setHabits(a => a.map(h => h.id === id ? next : h));
      if (next.completedToday) { setMessage('One small step. Beautifully done.'); useCompanionStore.getState().celebrate(); }
      else setMessage('Habit marked as open. There is still room in your day.');
    } catch { setMessage('Could not update your habit. Please try again.'); }
    finally { setBusy(false); }
  };
  const moveHero = (event: React.PointerEvent<HTMLElement>) => {
    if (event.pointerType !== 'mouse' || config.id === 'focus' || matchMedia('(max-width: 700px), (pointer: coarse)').matches || (navigator.hardwareConcurrency || 8) <= 4 || preferences.motion === 'none' || !preferences.backgroundAnimation || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - .5;
    const y = (event.clientY - rect.top) / rect.height - .5;
    cancelAnimationFrame(pointerFrame.current);
    pointerFrame.current = requestAnimationFrame(() => { hero.current?.style.setProperty('--hero-x', `${x * 10}px`); hero.current?.style.setProperty('--hero-y', `${y * 8}px`); });
  };
  const pause = () => { const disclosure=document.querySelector<HTMLDetailsElement>('.home-practice-disclosure');if(disclosure)disclosure.open=true;requestAnimationFrame(()=>document.querySelector('.practice-card')?.scrollIntoView({ behavior: preferences.motion === 'none' || matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth', block: 'center' })); };

  return <div className="sanctuary-home home-refined">
    <header className="welcome-heading">
      <div>
        <h1>A little more <em>room to be.</em></h1>
        <p>Welcome back, {user?.preferredName || 'friend'}. </p>
      </div>
    </header>

    <section ref={hero} className="world-hero cinematic-home-hero" data-world-scene={config.id} aria-label="Your sanctuary world" onPointerMove={moveHero} onPointerLeave={() => { cancelAnimationFrame(pointerFrame.current); hero.current?.style.setProperty('--hero-x', '0px'); hero.current?.style.setProperty('--hero-y', '0px'); }}>
      <div className="hero-environment" key={config.backgroundImg} aria-hidden="true" style={{ backgroundImage: `url(${config.backgroundImg})` }} />
      <WorldAtmosphere world={config.id} hero />
      <div className="world-hero-copy"><h2>{needsCalm ? <>A gentler pause.<br /><em>One breath<br className="hero-line" /> at a time.</em></> : <><em>Room to breathe.</em></>}</h2><p>{needsCalm ? 'At your own pace.' : ''}</p><button className="btn btn-primary" onClick={() => needsCalm ? pause() : setTab('yoga')}>{needsCalm ? 'Take a breathing pause' : 'Find your flow'} <ArrowUpRight size={16} /></button></div>
      <LivingCompanion home />
      <button id="home-world-selector-trigger" className="world-caption" aria-label={`Choose sanctuary world, current: ${WORLD_CONFIGS[activeWorld].name}`} onClick={() => openWorldSelector(true, 'worlds')}><span className="world-presence-dot" />{WORLD_CONFIGS[activeWorld].name}<ArrowUpRight size={14} /></button>
    </section>

    <nav className="home-quick-actions" aria-label="Wellness quick actions"><button onClick={pause}><Wind size={16} />Take a breath<ArrowRight size={14} /></button><button onClick={() => {useNavigationStore.getState().setRhythmTab('journal');setTab('daily-rhythm');}}><BookOpen size={16} />Write a reflection<ArrowRight size={14} /></button><button onClick={() => setTab('yoga')}><Sun size={16} />Find some movement<ArrowRight size={14} /></button></nav>

    <div className={'sanctuary-workspace-grid arrangement-' + preferences.arrangement}>
      <section className="mood-card home-mood"><div className="section-heading"><h2>How is your inner weather?</h2></div><div className="mood-options">{[CloudRain, Cloud, Sun, Smile, Sparkles].map((Icon, i) => <button disabled={busy || loading} key={i} aria-pressed={moods[moods.length - 1]?.mood === i + 1} onClick={() => checkIn((i + 1) as MoodScore)}><Icon size={25} /><span>{['Stormy', 'Cloudy', 'Steady', 'Bright', 'Radiant'][i]}</span></button>)}</div><p role="status" className="quiet-label">{loading ? 'Opening your local sanctuary…' : message}</p>{message.startsWith('Could not load') && <button className="text-button" onClick={load}>Try again</button>}</section>

      <section className="habit-card home-habits"><div className="section-heading"><h2>Your daily rhythm</h2><span className="progress-disc" role="img" aria-label={`${done} of ${habits.length} habits complete`} style={{ background: `conic-gradient(var(--theme-accent) ${habits.length ? done / habits.length * 100 : 0}%,var(--surface-veil) 0)` }}><b>{done}/{habits.length}</b></span></div>{habits.slice(0, 4).map(h => <button key={h.id} className={`habit-row ${h.completedToday ? 'done' : ''}`} aria-pressed={h.completedToday} disabled={busy} onClick={() => toggleHabit(h.id)}><span className="check-box">{h.completedToday && <Check size={15} />}</span><span>{h.title}</span></button>)}{!loading && !habits.length && <p className="quiet-label">Your next small habit can begin in Daily Rhythm.</p>}<button className="text-button" onClick={() => setTab('daily-rhythm')}>Find your rhythm <ArrowUpRight size={15} /></button></section>

      <section className="reflection-card home-intention"><label className="section-subheading" htmlFor="daily-intention">Today's intention</label><input id="daily-intention" className="intention-input" value={intention} maxLength={180} placeholder="Today, I want to make room for…" onChange={e => { setIntention(e.target.value); try { localStorage.setItem('maitri_intention', e.target.value); } catch { setMessage('Your intention will last for this visit; storage is unavailable.'); } }} /></section>


      <section className="reflection-card home-journal"><BookOpen size={20} /><h2>{journal?.title || 'What stayed with you today?'}</h2><p>{journal?.content?.slice(0, 90) || ''}</p><button className="text-button" onClick={() => {useNavigationStore.getState().setRhythmTab('journal');setTab('daily-rhythm');}}>Open your journal <ArrowUpRight size={15} /></button></section>

    </div>

    <details className="home-practice-disclosure"><summary>Breathing &amp; focus <ArrowUpRight size={16}/></summary><SanctuaryPractice completed={done}/></details>
    <section className="wellness-journey"><div className="section-heading"><div><h2>Wellness Journey</h2></div><label>Show <select aria-label="Filter wellness journey" value={journeyKind} onChange={e => setJourneyKind(e.target.value)}><option value="all">All moments</option><option value="habit">Habits</option><option value="journal">Reflections</option><option value="focus">Focus</option><option value="yoga">Movement</option><option value="breath">Breathing</option><option value="meditation">Meditation</option><option value="mood">Check-ins</option></select></label></div><ol className="journey-list">{shownActivities.map(a => <li key={a.id} className="journey-item"><span className="journey-dot" /><time dateTime={a.createdAt}>{new Date(a.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</time><strong>{a.title}</strong><span>{a.durationSeconds ? Math.round(a.durationSeconds / 60) + ' min' : a.kind}</span></li>)}</ol>{!shownActivities.length && <p>{activities.length ? 'No saved moments in this view yet.' : 'Your first saved check-in, reflection or completed practice starts your journey.'}</p>}</section>
  </div>;
};
