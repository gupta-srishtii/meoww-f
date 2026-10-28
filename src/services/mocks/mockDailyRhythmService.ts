import {useWellnessStore} from '../../store/useWellnessStore';
import { IDailyRhythmService } from '../contracts';
import { Habit, MoodCheckIn, JournalEntry, MoodScore } from '../../types/rhythm';

const HABITS_KEY = 'maitri_mock_habits';
const MOOD_KEY = 'maitri_mock_mood_checkins';
const JOURNAL_KEY = 'maitri_mock_journal';

const INITIAL_HABITS: Habit[] = [
  { id: 'h1', title: 'Deep Mindful Breathing (4-6 cadence)', category: 'mindfulness', target: 2, current: 1, streak: 5, completedToday: false },
  { id: 'h2', title: 'Spinal Alignment & Neck Reset', category: 'body', target: 3, current: 3, streak: 8, completedToday: true },
  { id: 'h3', title: 'Hydration & Mineral Intake', category: 'hydration', target: 4, current: 2, streak: 12, completedToday: false },
  { id: 'h4', title: 'Midday Visual Rest (20-20-20 rule)', category: 'rest', target: 2, current: 2, streak: 3, completedToday: true },
];

const INITIAL_MOODS: MoodCheckIn[] = [
  { id: 'm1', mood: 4, tags: ['calm', 'focused'], note: 'Morning clarity after light stretch', source: 'dashboard', world: 'forest', localDate: '2026-10-25', createdAt: '2026-10-25T08:30:00Z' },
  { id: 'm2', mood: 3, tags: ['busy', 'steady'], note: 'Long review block, shoulders held tension', source: 'dashboard', world: 'space', localDate: '2026-10-26', createdAt: '2026-10-26T14:15:00Z' },
  { id: 'm3', mood: 4, tags: ['balanced', 'grounded'], note: 'Practiced morning Awakening yoga routine', source: 'dashboard', world: 'forest', localDate: '2026-10-27', createdAt: '2026-10-27T09:00:00Z' },
];

const INITIAL_JOURNAL: JournalEntry[] = [
  {
    id: 'j1',
    title: 'Noticing the breath amidst the queue',
    content: 'Today was filled with rapid design iterations. I noticed my breath becoming shallow around 2 PM. MAITRI suggested the 4-in 6-out pacing, and just three minutes altered my entire focus state.',
    reflection: 'Awareness is the first step toward releasing unnecessary tension.',
    world: 'forest',
    createdAt: '2026-10-26T18:45:00Z',
    tags: ['mindfulness', 'workplace', 'pacing'],
  },
  {
    id: 'j2',
    title: 'Grounding in the Terrarium',
    content: 'Switching to the Zen world in the evening brought an immediate sense of stillness. The cedar and rain ambience helped me detach from the keyboard.',
    reflection: 'Transitions between work and rest need dedicated physical space.',
    world: 'zen',
    createdAt: '2026-10-25T20:10:00Z',
    tags: ['evening', 'zen', 'rest'],
  },
];

export class MockDailyRhythmService implements IDailyRhythmService {
  async getHabits(): Promise<Habit[]> {
    const raw = localStorage.getItem(HABITS_KEY);
    if (!raw) {
      localStorage.setItem(HABITS_KEY, JSON.stringify(INITIAL_HABITS));
      return INITIAL_HABITS;
    }
    return JSON.parse(raw);
  }

  async toggleHabit(id: string): Promise<Habit> {
    const habits = await this.getHabits();
    const habit = habits.find((h) => h.id === id);
    if (!habit) throw new Error('Habit not found');

    if (habit.current < habit.target) {
      habit.current += 1;
      if (habit.current >= habit.target) {
        habit.completedToday = true;
        habit.streak += 1;
      }
    } else {
      habit.current = 0;
      habit.completedToday = false;
      habit.streak = Math.max(0, habit.streak - 1);
    }

    localStorage.setItem(HABITS_KEY, JSON.stringify(habits));
    if(habit.completedToday)useWellnessStore.getState().record('habit',habit.title,undefined,'habit_'+habit.id+'_'+new Date().toLocaleDateString('en-CA'));
    return habit;
  }

  async addHabit(title: string, category: Habit['category']): Promise<Habit> {
    const habits = await this.getHabits();
    const newHabit: Habit = {
      id: 'h_' + Date.now(),
      title,
      category,
      target: 2,
      current: 0,
      streak: 1,
      completedToday: false,
    };
    habits.push(newHabit);
    localStorage.setItem(HABITS_KEY, JSON.stringify(habits));
    return newHabit;
  }

  async getMoodCheckIns(_days = 7): Promise<MoodCheckIn[]> {
    const raw = localStorage.getItem(MOOD_KEY);
    if (!raw) {
      localStorage.setItem(MOOD_KEY, JSON.stringify(INITIAL_MOODS));
      return INITIAL_MOODS;
    }
    return JSON.parse(raw);
  }

  async addMoodCheckIn(mood: MoodScore, tags: string[], note = '', world = 'forest'): Promise<MoodCheckIn> {
    const moods = await this.getMoodCheckIns();
    const todayStr = new Date().toLocaleDateString('en-CA');
    const newEntry: MoodCheckIn = {
      id: 'm_' + Date.now(),
      mood,
      tags,
      note,
      source: 'dashboard',
      world,
      localDate: todayStr,
      createdAt: new Date().toISOString(),
    };
    // Append-only contract!
    moods.push(newEntry);
    localStorage.setItem(MOOD_KEY, JSON.stringify(moods));
    useWellnessStore.getState().record('mood','A moment to check in',undefined,newEntry.id);
    return newEntry;
  }

  async getJournalEntries(): Promise<JournalEntry[]> {
    const raw = localStorage.getItem(JOURNAL_KEY);
    if (!raw) {
      localStorage.setItem(JOURNAL_KEY, JSON.stringify(INITIAL_JOURNAL));
      return INITIAL_JOURNAL;
    }
    return JSON.parse(raw);
  }

  async addJournalEntry(title: string, content: string, reflection = '', world = 'forest'): Promise<JournalEntry> {
    const entries = await this.getJournalEntries();
    const newEntry: JournalEntry = {
      id: 'j_' + Date.now(),
      title,
      content,
      reflection,
      world,
      createdAt: new Date().toISOString(),
      tags: ['reflection', world],
    };
    entries.unshift(newEntry);
    localStorage.setItem(JOURNAL_KEY, JSON.stringify(entries));
    useWellnessStore.getState().record('journal','Saved a personal reflection',undefined,newEntry.id);
    return newEntry;
  }
}
