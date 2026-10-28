import { IAuthService } from '../contracts';
import { User, AuthSession, ProfileUpdate } from '../../types/auth';

const STORAGE_KEY = 'maitri_mock_user';

const DEFAULT_DEMO_USER: User = {
  id: 'usr_demo_01',
  email: 'demo@maitri.ai',
  name: 'Aria Sharma',
  username: 'ariasharma',
  preferredName: 'Aria',
  role: 'user',
  subscriptionPlan: 'pro',
  avatarUrl: '/assets/companion-avatar.webp',
  isVerified: true,
  createdAt: '2026-08-15T09:00:00Z',
  bio: 'Product designer focusing on mindful interfaces and gentle daily rhythms.',
};

export class MockAuthService implements IAuthService {
  private getUser(): User {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        // Fallback
      }
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_DEMO_USER));
    return DEFAULT_DEMO_USER;
  }

  async login(email: string): Promise<AuthSession> {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) throw Error('Enter a valid email address.');
    await new Promise((r) => setTimeout(r, 600)); // Simulated network latency
    localStorage.removeItem('maitri_signed_out');
    const user = this.getUser();
    user.email = email || user.email;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    return { user, isAuthenticated: true, token: 'mock_jwt_token_safe' };
  }

  /** Validation-only demo. The password is never retained, logged or sent anywhere. */
  async authenticate(email: string, password: string, mode: 'login' | 'signup'): Promise<AuthSession> {
    if (password.length < 8) throw Error('Use at least 8 characters for your made-up demo password.');
    const session = await this.login(email.trim());
    if (mode === 'signup' && session.user) {
      const username = email.split('@')[0].replace(/[^a-zA-Z0-9_.-]/g, '').slice(0, 30) || 'friend';
      session.user = {...session.user, name: username, preferredName: username, username, role: 'user', subscriptionPlan: 'basic', bio: '', createdAt: new Date().toISOString()};
      localStorage.setItem(STORAGE_KEY, JSON.stringify(session.user));
    }
    return session;
  }

  async verifyOtp(email: string, otp: string): Promise<AuthSession> {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) throw Error('Enter a valid email address.');
    if(!/^\d{6}$/.test(otp))throw Error('Enter a six-digit demo code.');
    await new Promise((r) => setTimeout(r, 500));
    localStorage.removeItem('maitri_signed_out');
    const user = this.getUser();
    user.email = email || user.email;
    user.isVerified = true;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    return { user, isAuthenticated: true, token: 'mock_jwt_token_safe' };
  }

  async getCurrentUser(): Promise<User | null> {
    if(localStorage.getItem('maitri_signed_out'))return null;
    // A fresh visitor sees the public introduction. A demo session starts only after consent.
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;
    try { const user = JSON.parse(stored); return user?.id && user?.email ? user : null; } catch { return null; }
  }

  async logout(): Promise<void> {
    localStorage.setItem('maitri_signed_out','true');
    await new Promise((r) => setTimeout(r, 300));
  }

  async switchRole(role: User['role']): Promise<User> {
    const user = this.getUser();
    user.role = role;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    return user;
  }

  async updateProfile(profile: ProfileUpdate): Promise<User> {
    const current = await this.getCurrentUser();
    if (!current) throw Error('Sign in to a demo session before editing your profile.');
    const name = profile.name.trim();
    const username = profile.username.trim().replace(/^@/, '');
    if (!name || name.length > 60) throw Error('Display name must contain 1–60 characters.');
    if (username !== current.username && !/^[a-zA-Z0-9][a-zA-Z0-9_.-]{2,29}$/.test(username)) throw Error('MAITRI ID must be 3–30 letters, numbers, dots, underscores or hyphens, starting with a letter or number.');
    if ((profile.bio || '').length > 600) throw Error('Keep About You under 600 characters.');
    const avatarUrl = profile.avatarUrl || '/assets/companion-avatar.webp';
    if (!['/assets/companion-avatar.webp', '/assets/favicon.png'].includes(avatarUrl) && !/^data:image\/(png|jpeg|webp);base64,[a-zA-Z0-9+/=]+$/.test(avatarUrl)) throw Error('Choose a local PNG, JPEG or WebP avatar.');
    if (avatarUrl.length > 180000) throw Error('This avatar is too large to save. Choose a smaller image.');
    const user = {...current, name, preferredName:name, username, avatarUrl, bio:(profile.bio || '').trim()};
    // Commit only validated editable fields; role, email and internal account ID remain intact.
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    return user;
  }
}
