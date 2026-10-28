export type ReactionType = 'support' | 'relate' | 'celebrate';

export interface Comment {
  id: string;
  authorName: string;
  authorHandle: string;
  content: string;
  createdAt: string;
}

export interface CirclePost {
  id: string;
  authorName: string;
  authorHandle: string;
  authorRole: string;
  isAnonymous?: boolean;
  content: string;
  tags: string[];
  world: string;
  createdAt: string;
  reactions: Record<ReactionType, number>;
  userReaction?: ReactionType;
  comments: Comment[];
}

export interface CircleGroup {
  id: string;
  name: string;
  description: string;
  membersCount: number;
  tags: string[];
  icon: string;
  isJoined?: boolean;
}

export interface PsychologistProfile {
  id: string;
  name: string;
  title: string;
  credentials: string;
  specialties: string[];
  verificationLevel: 'junior' | 'experienced' | 'senior' | 'specialist';
  isVerified: boolean;
  rating: number;
  availableSlots: string[];
  bio: string;
}

export interface FriendProfile {
  id:string; name:string; maitriId:string; bio:string; interests:string[]; isFriend:boolean;
}
export interface CircleChallenge {
  id:string; title:string; description:string; goal:number; progress:number; joined:boolean;
}
