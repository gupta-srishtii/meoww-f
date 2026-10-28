export type UserRole = 'user' | 'beta_tester' | 'instructor' | 'psychologist' | 'admin' | 'superadmin';

export type SubscriptionPlan = 'basic' | 'starter' | 'pro' | 'enterprise';

export interface User {
  id: string;
  email: string;
  name: string;
  username: string;
  role: UserRole;
  subscriptionPlan: SubscriptionPlan;
  avatarUrl?: string;
  isVerified: boolean;
  createdAt: string;
  bio?: string;
  preferredName?: string;
}

export interface AuthSession {
  user: User | null;
  isAuthenticated: boolean;
  token?: string;
}

export type ProfileUpdate = Pick<User, 'name' | 'username' | 'avatarUrl' | 'bio'>;
