import {RhythmCalendar,localDateKey} from './RhythmCalendar';
import { useCompanionStore } from '../../store/useCompanionStore';
import React, { useState, useEffect, useRef } from 'react';
import { Sun, Check, Plus, BookOpen, Lock, Unlock, Sparkles, Smile, Frown, Meh, Search, Calendar, Heart } from 'lucide-react';
import { GlassCard } from '../../components/common/GlassCard';
import { services } from '../../services';
import { Habit, MoodCheckIn, JournalEntry, MoodScore } from '../../types/rhythm';
import { useThemeStore } from '../../store/useThemeStore';
import { useNavigationStore } from '../../store/useNavigationStore';

export const DailyRhythmView: React.FC = () => {
  const { activeWorld } = useThemeStore();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [moods, setMoods] = useState<MoodCheckIn[]>([]);
  const [journals, setJournals] = useState<JournalEntry[]>([]);
  const {rhythmTab:activeSubTab,setRhythmTab:setActiveSubTab} = useNavigationStore();

  const [selectedDate,setSelectedDate]=useState<string|null>(null),[saveNotice,setSaveNotice]=useState('');
  const [busy,setBusy]=useState(false);const pending=useRef(false);
  const draftTimer=useRef<ReturnType<typeof setTimeout>|undefined>(undefined),moodTimer=useRef<ReturnType<typeof setTimeout>|undefined>(undefined);
  // Mood Check-in Form State
  const [selectedMood, setSelectedMood] = useState<MoodScore>(4);
  const [selectedTags, setSelectedTags] = useState<string[]>(['calm']);
  const [moodNote, setMoodNote] = useState('');
  const [moodSuccess, setMoodSuccess] = useState(false);

  // Journal State
  const [journalLocked, setJournalLocked] = useState(false);
  const [journalTitle, setJournalTitle] = useState(()=>{try{return JSON.parse(localStorage.getItem('maitri_journal_draft')||'{}').title||'';}catch{return '';}});
  const [journalContent, setJournalContent] = useState(()=>{try{return JSON.parse(localStorage.getItem('maitri_journal_draft')||'{}').content||'';}catch{return '';}});
  const [journalReflection, setJournalReflection] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAiDrafting, setIsAiDrafting] = useState(false);

  // New Habit State
  const [newHabitTitle, setNewHabitTitle] = useState('');

  useEffect(() => {
    services.rhythm.getHabits().then(setHabits).catch(()=>setSaveNotice('Could not load local habits. Check browser storage and try again.'));
    services.rhythm.getMoodCheckIns(7).then(setMoods).catch(()=>setSaveNotice('Could not load local check-ins. Check browser storage and try again.'));
    services.rhythm.getJournalEntries().then(setJournals).catch(()=>setSaveNotice('Could not load local reflections. Check browser storage and try again.'));
    return()=>{clearTimeout(draftTimer.current);clearTimeout(moodTimer.current);};
  }, []);

  useEffect(()=>{try{localStorage.setItem('maitri_journal_draft',JSON.stringify({title:journalTitle,content:journalContent}));}catch{setSaveNotice('Draft cannot be saved in this browser.');}},[journalTitle,journalContent]);
  const save=async(action:()=>Promise<void>)=>{if(pending.current)return;pending.current=true;setBusy(true);setSaveNotice('Saving in this browser…');try{await action();}catch{setSaveNotice('Could not save this change. Your input is still here; check browser storage and try again.');}finally{pending.current=false;setBusy(false);}};
  const handleToggleHabit = async (id: string) => {
    await save(async()=>{
    const updated = await services.rhythm.toggleHabit(id);
    setHabits((prev) => prev.map((h) => (h.id === id ? updated : h)));
    if(updated.completedToday) useCompanionStore.getState().celebrate();
    setSaveNotice('Habit progress saved locally.');});
  };

  const handleAddHabit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHabitTitle.trim()) return;
    await save(async()=>{const created = await services.rhythm.addHabit(newHabitTitle.trim(), 'mindfulness');
    setHabits((prev) => [...prev, created]);
    setNewHabitTitle('');setSaveNotice('New habit saved locally.');});
  };

  const handleSaveMood = async () => {
    await save(async()=>{const created = await services.rhythm.addMoodCheckIn(selectedMood, selectedTags, moodNote, activeWorld);
    setMoods((prev) => [...prev, created]);
    setMoodSuccess(true);
    if(selectedMood<3)useCompanionStore.getState().setMoodState('comforting');else useCompanionStore.getState().celebrate();
    setSaveNotice('Check-in saved locally.');clearTimeout(moodTimer.current);moodTimer.current=setTimeout(() => setMoodSuccess(false), 3000);});
  };

  const handleSaveJournal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!journalTitle.trim() || !journalContent.trim()) return;
    await save(async()=>{const created = await services.rhythm.addJournalEntry(journalTitle.trim(), journalContent.trim(), journalReflection, activeWorld);
    setJournals((prev) => [created, ...prev]);
    setJournalTitle('');
    setJournalContent('');
    setJournalReflection('');setSaveNotice('Reflection saved locally.');useCompanionStore.getState().celebrate();});
  };

  const handleAiAutoDraft = () => {
    setIsAiDrafting(true);
    draftTimer.current=setTimeout(() => {
      setJournalTitle('Afternoon Cognitive Reset');
      setJournalContent('Noticed that my breathing had grown shallow after three continuous sprint tasks. Stepping into the terrarium helped release neck tension.');
      setJournalReflection('Steady rhythm in work prevents erratic evening exhaustion.');
      setIsAiDrafting(false);
    }, 800);
  };

  const moodLevels: { score: MoodScore; label: string; icon: string }[] = [
    { score: 1, label: 'Struggling', icon: '🌧️' },
    { score: 2, label: 'Low', icon: '⛅' },
    { score: 3, label: 'Okay', icon: '🌤️' },
    { score: 4, label: 'Good', icon: '☀️' },
    { score: 5, label: 'Great', icon: '✨' },
  ];

  const availableTags = ['calm', 'focused', 'anxious', 'tired', 'inspired', 'grounded', 'overwhelmed', 'balanced'];

  const filteredJournals = (journalLocked?[]:journals).filter(j=>!selectedDate||localDateKey(new Date(j.createdAt))===selectedDate).filter(
    (j) =>
      j.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      j.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--companion-gold)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Personal Equilibrium
            </span>
            <span className="badge-demo">Saved locally</span>
          </div>
          <h1 style={{ fontSize: '28px', fontWeight: 800, marginTop: '4px' }}>Daily Rhythm</h1>
          <p style={{ fontSize: '13px', color: 'var(--theme-text-muted)' }}>
            Cultivate habit streaks, log emotional weather, and write reflective journal entries.
          </p>
        </div>

        {/* Sub-tab pills */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            className={`btn ${activeSubTab === 'mood' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ fontSize: '12px' }}
            onClick={() => setActiveSubTab('mood')}
          >
            Mood Tracking
          </button>
          <button
            className={`btn ${activeSubTab === 'habits' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ fontSize: '12px' }}
            onClick={() => setActiveSubTab('habits')}
          >
            Daily Habits
          </button>
          <button
            className={`btn ${activeSubTab === 'journal' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ fontSize: '12px' }}
            onClick={() => setActiveSubTab('journal')}
          >
            Reflection Journal
          </button>
        </div>
      </div>

      <RhythmCalendar moods={moods} journals={journalLocked?[]:journals} selected={selectedDate} onSelect={setSelectedDate}/><p role="status" className="quiet-label">{selectedDate?'Showing saved moments for '+selectedDate:'All saved moments'} {saveNotice}</p>
      {/* =========================================================================
          TAB 1: MOOD TRACKING
          ========================================================================= */}
      {activeSubTab === 'mood' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '20px' }}>
          {/* Mood Check-In Canvas */}
          <GlassCard style={{ padding: '28px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 800 }}>Record How You Are Feeling Today</h3>
                <div style={{ fontSize: '12px', color: 'var(--theme-text-muted)' }}>
                  Two-tap confirmation to protect your permanent record.
                </div>
              </div>
              <span className="badge-demo">Safe & Private</span>
            </div>

            {/* 5-Level Radio Choice Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '10px', margin: '20px 0' }}>
              {moodLevels.map((lvl) => {
                const isSelected = selectedMood === lvl.score;
                return (
                  <button type="button" aria-pressed={isSelected} disabled={busy}
                    key={lvl.score}
                    onClick={() => setSelectedMood(lvl.score)}
                    style={{
                      padding: '16px 10px',
                      borderRadius: 'var(--radius-md)',
                      background: isSelected ? 'rgba(250, 204, 21, 0.15)' : 'var(--surface-veil)',
                      border: isSelected ? '2px solid var(--companion-gold)' : '1px solid var(--hairline)',
                      textAlign: 'center',
                      cursor: 'pointer',
                      transition: 'all 150ms ease',
                    }}
                  >
                    <div style={{ fontSize: '24px', marginBottom: '6px' }}>{lvl.icon}</div>
                    <div style={{ fontSize: '12px', fontWeight: 700, color: isSelected ? 'var(--companion-gold-bright)' : 'var(--theme-text-main)' }}>
                      {lvl.label}
                    </div>
                    <div className="text-numeral" style={{ fontSize: '10px', color: 'var(--theme-text-muted)' }}>
                      Level {lvl.score}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Emotional Tags */}
            <div style={{ marginBottom: '18px' }}>
              <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--theme-text-muted)', textTransform: 'uppercase', marginBottom: '8px' }}>
                Emotional Nuance Tags
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {availableTags.map((tag) => {
                  const isChecked = selectedTags.includes(tag);
                  return (
                    <button
                      key={tag}
                      type="button"
                      className="glass-pill"
                      style={{
                        cursor: 'pointer',
                        background: isChecked ? 'var(--theme-accent)' : undefined,
                        color: isChecked ? '#020617' : undefined,
                        fontWeight: isChecked ? 700 : 500,
                      }}
                      onClick={() => {
                        setSelectedTags((prev) =>
                          isChecked ? prev.filter((t) => t !== tag) : [...prev, tag]
                        );
                      }}
                    >
                      {tag}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Optional Personal Note */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--theme-text-muted)', textTransform: 'uppercase' }}>
                Personal Reflection Note (Max 280 chars)
              </label>
              <textarea
                className="input-field"
                rows={3}
                maxLength={280}
                placeholder="What factors contributed to this feeling? (Optional)"
                value={moodNote}
                onChange={(e) => setMoodNote(e.target.value)}
                style={{ marginTop: '6px', resize: 'vertical' }}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '11px', color: 'var(--theme-text-muted)' }}>
                Append-only: entries cannot be overwritten.
              </span>
              <button className="btn btn-primary" disabled={busy} onClick={handleSaveMood}>
                <span>Save Mood Check-In</span>
              </button>
            </div>

            {moodSuccess && (
              <div style={{ marginTop: '12px', padding: '10px', borderRadius: '8px', background: 'rgba(52, 211, 153, 0.15)', border: '1px solid var(--status-vital)', color: 'var(--status-vital)', fontSize: '12px', textAlign: 'center' }}>
                Mood logged successfully into your rhythm history!
              </div>
            )}
          </GlassCard>

          {/* 7-Day History Card */}
          <GlassCard style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: 800, marginBottom: '6px' }}>Seven-Day Rhythm Arc</h3>
              <p style={{ fontSize: '12px', color: 'var(--theme-text-muted)', marginBottom: '20px' }}>
                Tracking your emotional variance across morning and evening sessions.
              </p>

              {/* Simple Visual Bar Chart */}
              <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', height: '140px', padding: '0 10px', borderBottom: '1px solid var(--hairline-strong)', marginBottom: '14px' }}>
                {Array.from({length:7},(_,i)=>{const d=new Date();d.setDate(d.getDate()-6+i);return d;}).map(date => {
                  const day=date.toLocaleDateString(undefined,{weekday:'short'});const entry=[...moods].reverse().find(m=>m.localDate===localDateKey(date));
                  const height = entry ? (entry.mood / 5) * 110 : 20;
                  return (
                    <div key={day} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                      <div
                        style={{
                          width: '28px',
                          height: `${height}px`,
                          borderRadius: '6px 6px 0 0',
                          background: entry ? 'linear-gradient(to top, var(--theme-primary), var(--companion-gold-bright))' : 'var(--surface-veil)',
                          border: '1px solid var(--hairline)',
                          transition: 'height 400ms ease',
                        }}
                      />
                      <span style={{ fontSize: '10px', color: 'var(--theme-text-muted)' }}>{day}</span>
                    </div>
                  );
                })}
              </div>

              {/* List of recent check-ins */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {moods.slice(-3).reverse().map((m) => (
                  <div key={m.id} style={{ padding: '8px 12px', borderRadius: '6px', background: 'var(--surface-veil)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <span style={{ fontWeight: 700, fontSize: '12px' }}>Level {m.mood}</span>
                      <span style={{ fontSize: '11px', color: 'var(--theme-text-muted)', marginLeft: '8px' }}>{m.tags.join(', ')}</span>
                    </div>
                    <span className="mono" style={{ fontSize: '10px', color: 'var(--theme-text-muted)' }}>{m.localDate}</span>
                  </div>
                ))}
              </div>
            </div>
          </GlassCard>
        </div>
      )}

      {/* =========================================================================
          TAB 2: HABITS CHECKLIST
          ========================================================================= */}
      {activeSubTab === 'habits' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '20px' }}>
          <GlassCard style={{ padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 800 }}>Daily Micro-Habits</h3>
                <p style={{ fontSize: '12px', color: 'var(--theme-text-muted)' }}>
                  Small autonomic and ergonomic adjustments that prevent end-of-day fatigue.
                </p>
              </div>

              {/* Quick Add Habit Form */}
              <form onSubmit={handleAddHabit} style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="text" maxLength={150}
                  className="input-field"
                  aria-label="New habit title" placeholder="New habit title…"
                  value={newHabitTitle}
                  onChange={(e) => setNewHabitTitle(e.target.value)}
                  style={{ width: '200px', padding: '6px 12px', fontSize: '12px' }}
                />
                <button type="submit" className="btn btn-primary" disabled={busy||!newHabitTitle.trim()} style={{ padding: '6px 12px', fontSize: '12px' }}>
                  <Plus size={14} />
                  <span>Add</span>
                </button>
              </form>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {habits.map((h) => (
                <button type="button" disabled={busy}
                  key={h.id}
                  aria-pressed={h.completedToday}
                  onClick={() => handleToggleHabit(h.id)}
                  style={{
                    padding: '14px 18px',
                    borderRadius: 'var(--radius-md)',
                    background: h.completedToday ? 'rgba(52, 211, 153, 0.08)' : 'var(--surface-veil)',
                    border: h.completedToday ? '1px solid rgba(52, 211, 153, 0.4)' : '1px solid var(--hairline)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    transition: 'all 150ms ease',
                    textAlign:'left',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div
                      style={{
                        width: '26px',
                        height: '26px',
                        borderRadius: '8px',
                        background: h.completedToday ? 'var(--status-vital)' : 'transparent',
                        border: h.completedToday ? 'none' : '1px solid var(--hairline-strong)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#020617',
                      }}
                    >
                      {h.completedToday && <Check size={16} strokeWidth={3} />}
                    </div>
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: 600, color: h.completedToday ? 'var(--theme-text-muted)' : 'var(--theme-text-main)', textDecoration: h.completedToday ? 'line-through' : 'none' }}>
                        {h.title}
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--theme-text-muted)' }}>
                        Category: {h.category} · Target: {h.target} sessions / day
                      </div>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div className="text-numeral" style={{ fontSize: '14px', fontWeight: 700, color: 'var(--companion-gold-bright)' }}>
                      {h.streak} Day Streak
                    </div>
                    <div className="text-numeral" style={{ fontSize: '11px', color: 'var(--theme-text-muted)' }}>
                      Progress: {h.current} of {h.target}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </GlassCard>

          {/* Habits Strategy Note */}
          <GlassCard style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h4 style={{ fontSize: '15px', fontWeight: 700 }}>Why Micro-Habits Compound</h4>
            <p style={{ fontSize: '12px', color: 'var(--theme-text-muted)', lineHeight: 1.6 }}>
              A short, comfortable pause can make a routine easier to return to. Choose an activity that fits your energy today.
            </p>
            <div style={{ padding: '14px', borderRadius: '8px', background: 'var(--surface-veil)', border: '1px solid var(--hairline)' }}>
              <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--companion-gold)' }}>Recommended Next Habit</div>
              <div style={{ fontSize: '12px', fontWeight: 600, marginTop: '4px' }}>Midday Hydration & Magnesium Check</div>
              <div style={{ fontSize: '11px', color: 'var(--theme-text-muted)', marginTop: '2px' }}>Take a 500ml water pause after 90 minutes of continuous typing.</div>
            </div>
          </GlassCard>
        </div>
      )}

      {/* =========================================================================
          TAB 3: REFLECTION JOURNAL
          ========================================================================= */}
      {activeSubTab === 'journal' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '20px' }}>
          {/* Main Writing Canvas */}
          <GlassCard style={{ padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 800 }}>Sanctuary Reflection Journal</h3>
                <div style={{ fontSize: '12px', color: 'var(--theme-text-muted)' }}>
                  A local notebook. Use the screen cover when you want a little privacy.
                </div>
              </div>

              {/* Private Lock Toggle */}
              <button
                className={`btn ${journalLocked ? 'btn-accent' : 'btn-secondary'}`}
                style={{ fontSize: '12px', padding: '6px 12px' }}
                onClick={() => setJournalLocked(!journalLocked)}
                title="Hide journal contents on this screen" aria-pressed={journalLocked}
              >
                {journalLocked ? <Lock size={14} /> : <Unlock size={14} />}
                <span>{journalLocked ? 'Journal hidden' : 'Hide journal'}</span>
              </button>
            </div>

            {journalLocked ? (
              <div style={{ padding: '40px 20px', textAlign: 'center', background: 'var(--surface-veil)', borderRadius: 'var(--radius-lg)' }}>
                <Lock size={36} style={{ color: 'var(--companion-gold)', margin: '0 auto 12px' }} />
                <h4 style={{ fontSize: '16px', fontWeight: 700 }}>Your reflections are hidden</h4>
                <p style={{ fontSize: '12px', color: 'var(--theme-text-muted)', maxWidth: '380px', margin: '6px auto 16px' }}>
                  This screen cover hides your editor and history. Entries remain in browser storage without encryption.
                </p>
                <button className="btn btn-primary" onClick={() => setJournalLocked(false)}>
                  Show journal
                </button>
              </div>
            ) : (
              <form onSubmit={handleSaveJournal} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <input
                    type="text"
                    className="input-field"
                    aria-label="Reflection title" placeholder="Entry Title (e.g., Noticing the breath amidst deadlines)"
                    value={journalTitle}
                    onChange={(e) => setJournalTitle(e.target.value)}
                    style={{ fontWeight: 700 }}
                  />
                </div>

                <div>
                  <textarea
                    className="input-field"
                    rows={6}
                    aria-label="Reflection text" placeholder="Reflect freely on your mind state, bodily sensations, and learnings from today's work sessions…"
                    value={journalContent}
                    onChange={(e) => setJournalContent(e.target.value)}
                    style={{ resize: 'vertical' }}
                  />
                </div>

                <div>
                  <input
                    type="text"
                    className="input-field"
                    aria-label="Reflection takeaway" placeholder="Synthesized takeaway / Mindful reflection quote"
                    value={journalReflection}
                    onChange={(e) => setJournalReflection(e.target.value)}
                    style={{ fontStyle: 'italic' }}
                  />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '6px' }}>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    style={{ fontSize: '12px' }}
                    onClick={handleAiAutoDraft}
                    disabled={isAiDrafting||busy}
                  >
                    <Sparkles size={13} style={{ color: 'var(--companion-gold)' }} />
                    <span>{isAiDrafting ? 'Drafting…' : 'Insert example reflection'}</span>
                  </button>

                  <button type="submit" className="btn btn-primary" disabled={busy||!journalTitle.trim()||!journalContent.trim()}>
                    Save Reflection
                  </button>
                </div>
              </form>
            )}
          </GlassCard>

          {/* Past Reflections List & Search */}
          <GlassCard style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h4 style={{ fontSize: '15px', fontWeight: 700 }}>Past Entries</h4>
              <span className="mono" style={{ fontSize: '11px', color: 'var(--theme-text-muted)' }}>
                {filteredJournals.length} saved
              </span>
            </div>

            {/* Search */}
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                className="input-field"
                aria-label="Search reflections" placeholder="Search reflections…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ paddingLeft: '32px', fontSize: '12px' }}
              />
              <Search size={14} style={{ position: 'absolute', left: '10px', top: '12px', color: 'var(--theme-text-muted)' }} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '420px', overflowY: 'auto' }}>
              {!filteredJournals.length&&<p className="quiet-label">{journalLocked?'Reflections are covered. Reveal the journal to read them.':'No reflections match this date or search. Try another date, or write your first reflection.'}</p>}
              {filteredJournals.map((j) => (
                <details className="journal-entry"
                  key={j.id}
                  style={{
                    padding: '12px 14px',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--surface-veil)',
                    border: '1px solid var(--hairline)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px',
                  }}
                >
                  <summary style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <div style={{ fontWeight: 700, fontSize: '13px' }}>{j.title}</div>
                    <span className="mono" style={{ fontSize: '10px', color: 'var(--theme-text-muted)' }}>
                      {new Date(j.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                    </span>
                  </summary>
                  <p style={{ fontSize: '11px', color: 'var(--theme-text-muted)', whiteSpace: 'pre-wrap', lineHeight: 1.8 }}>
                    {j.content}
                  </p>
                  {j.reflection && (
                    <div style={{ fontSize: '10px', fontStyle: 'italic', color: 'var(--companion-gold-soft)', marginTop: '2px' }}>
                      "{j.reflection}"
                    </div>
                  )}
                </details>
              ))}
            </div>
          </GlassCard>
        </div>
      )}
    </div>
  );
};
