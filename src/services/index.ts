import { IAuthService, IChatService, IDailyRhythmService, IYogaService, IHealthService, ICommunityService } from './contracts';
import { MockAuthService } from './mocks/mockAuthService';
import { MockChatService } from './mocks/mockChatService';
import { MockDailyRhythmService } from './mocks/mockDailyRhythmService';
import { MockYogaService } from './mocks/mockYogaService';
import { MockHealthService } from './mocks/mockHealthService';
import { MockCommunityService } from './mocks/mockCommunityService';

// Read configuration flag (defaults to true for standalone frontend development)
const USE_MOCKS = import.meta.env.VITE_USE_MOCKS !== 'false';

class ServiceRegistry {
  public auth: IAuthService;
  public chat: IChatService;
  public rhythm: IDailyRhythmService;
  public yoga: IYogaService;
  public health: IHealthService;
  public community: ICommunityService;

  constructor() {
    if (USE_MOCKS) {
      this.auth = new MockAuthService();
      this.chat = new MockChatService();
      this.rhythm = new MockDailyRhythmService();
      this.yoga = new MockYogaService();
      this.health = new MockHealthService();
      this.community = new MockCommunityService();
    } else {
      // In Phase 7: Real Axios/Fetch HTTP & WS Clients will be wired here without changing any UI code
      this.auth = new MockAuthService();
      this.chat = new MockChatService();
      this.rhythm = new MockDailyRhythmService();
      this.yoga = new MockYogaService();
      this.health = new MockHealthService();
      this.community = new MockCommunityService();
    }
  }
}

export const services = new ServiceRegistry();
