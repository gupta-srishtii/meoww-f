export type MoodScore = 1 | 2 | 3 | 4 | 5; // 1: Struggling, 2: Low, 3: Okay, 4: Good, 5: Great

export interface MoodCheckIn {
  id: string;
  mood: MoodScore;
  tags: string[];
  note?: string;
  source: 'dashboard' | 'dialogue' | 'prompt';
  world: string;
  localDate: string; // YYYY-MM-DD
  createdAt: string;
}

export interface Habit {
  id: string;
  title: string;
  category: 'mindfulness' | 'body' | 'focus' | 'hydration' | 'rest';
  target: number;
  current: number;
  streak: number;
  completedToday: boolean;
}

export interface JournalEntry {
  id: string;
  title: string;
  content: string;
  reflection?: string;
  world: string;
  createdAt: string;
  tags: string[];
}
