import { User, AuthSession, ProfileUpdate } from '../../types/auth';
import { ChatMessage, RiskLevel } from '../../types/companion';
import { Habit, MoodCheckIn, JournalEntry } from '../../types/rhythm';
import { YogaRoutine, YogaAsana } from '../../types/yoga';
import { TelemetryReading, HardwareDevice } from '../../types/health';
import { CirclePost, CircleGroup, PsychologistProfile, ReactionType, Comment, FriendProfile, CircleChallenge } from '../../types/community';

export interface IAuthService {
  login(email: string): Promise<AuthSession>;
  authenticate(email: string, password: string, mode: 'login' | 'signup'): Promise<AuthSession>;
  verifyOtp(email: string, otp: string): Promise<AuthSession>;
  getCurrentUser(): Promise<User | null>;
  logout(): Promise<void>;
  switchRole(role: User['role']): Promise<User>;
  updateProfile(profile: ProfileUpdate): Promise<User>;
}

export interface IChatService {
  sendMessage(
    message: string,
    history: ChatMessage[],
    onChunk: (chunk: string) => void,
    onComplete: (fullMessage: ChatMessage) => void
  ): Promise<void>;
  getStarters(worldId: string): string[];
}

export interface IDailyRhythmService {
  getHabits(): Promise<Habit[]>;
  toggleHabit(id: string): Promise<Habit>;
  addHabit(title: string, category: Habit['category']): Promise<Habit>;
  getMoodCheckIns(days?: number): Promise<MoodCheckIn[]>;
  addMoodCheckIn(mood: 1 | 2 | 3 | 4 | 5, tags: string[], note?: string, world?: string): Promise<MoodCheckIn>;
  getJournalEntries(): Promise<JournalEntry[]>;
  addJournalEntry(title: string, content: string, reflection?: string, world?: string): Promise<JournalEntry>;
}

export interface IYogaService {
  getRoutines(): Promise<YogaRoutine[]>;
  getAsanas(): Promise<YogaAsana[]>;
  saveAsana(asana:YogaAsana):Promise<YogaAsana>;
}

export interface IHealthService {
  getLatestTelemetry(): Promise<TelemetryReading>;
  getDevices(): Promise<HardwareDevice[]>;
  pairDevice(label: string): Promise<HardwareDevice>;
  getHistory(days:number):Promise<TelemetryReading[]>;
}

export interface ICommunityService {
  getPosts(): Promise<CirclePost[]>;
  createPost(content: string, tags: string[], isAnonymous?: boolean): Promise<CirclePost>;
  reactToPost(postId: string, reaction: ReactionType): Promise<CirclePost>;
  getCircles(): Promise<CircleGroup[]>;
  getPsychologists(): Promise<PsychologistProfile[]>;
  bookSession(psychologistId: string, timeSlot: string): Promise<{ success: boolean; sessionRoomId: string }>;
  addComment(postId:string,content:string):Promise<Comment>;
  toggleCircle(id:string):Promise<CircleGroup>;
  getFriends():Promise<FriendProfile[]>;
  toggleFriend(id:string):Promise<FriendProfile>;
  getChallenges():Promise<CircleChallenge[]>;
  updateChallenge(id:string,action:'join'|'progress'):Promise<CircleChallenge>;
}
