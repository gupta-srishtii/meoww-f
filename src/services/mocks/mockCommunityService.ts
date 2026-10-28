import { ICommunityService } from '../contracts';
import { CirclePost, CircleGroup, PsychologistProfile, ReactionType, Comment, FriendProfile, CircleChallenge } from '../../types/community';
import { MockAuthService } from './mockAuthService';

const POSTS_KEY = 'maitri_mock_posts';

const INITIAL_POSTS: CirclePost[] = [
  {
    id: 'post_1',
    authorName: 'Rohan Mehta',
    authorHandle: '@rohan_m',
    authorRole: 'Software Engineer',
    content: 'Just completed a 15-day streak of midday spinal releases. My chronic lower-back tightness from desk sitting is down by 70%. Consistency in the small pauses really compounds.',
    tags: ['ergonomics', 'habits', 'streak'],
    world: 'forest',
    createdAt: '2 hours ago',
    reactions: { support: 14, relate: 21, celebrate: 8 },
    comments: [
      { id: 'c1', authorName: 'Priya Verma', authorHandle: '@priyav', content: 'Incredible progress! Do you do the sequence before or after lunch?', createdAt: '1 hour ago' },
      { id: 'c2', authorName: 'Rohan Mehta', authorHandle: '@rohan_m', content: 'Right before lunch! Clears the mental queue completely.', createdAt: '30 mins ago' },
    ],
  },
  {
    id: 'post_2',
    authorName: 'Anonymous Member',
    authorHandle: '@mindful_visitor',
    authorRole: 'Community Member',
    isAnonymous: true,
    content: 'When the release deadline hit today, my heart rate spiked to 102 bpm on the telemetry widget. Seeing the number prompted me to trigger the 4-6 breath box with MAITRI. Normalized in 4 minutes.',
    tags: ['telemetry', 'biofeedback', 'breath'],
    world: 'medical',
    createdAt: '4 hours ago',
    reactions: { support: 28, relate: 33, celebrate: 12 },
    comments: [],
  },
  {
    id: 'post_3',
    authorName: 'Kavita Sundaram',
    authorHandle: '@kavita_zen',
    authorRole: 'Yoga Practitioner',
    content: 'The Muji Zen Garden ambient soundscape is pure therapy when reading dense architectural papers. Soft cedar rain and quiet stones.',
    tags: ['zen', 'soundscape', 'deepwork'],
    world: 'zen',
    createdAt: 'Yesterday',
    reactions: { support: 9, relate: 15, celebrate: 6 },
    comments: [],
  },
];

const CIRCLES: CircleGroup[] = [
  { id: 'circ_1', name: 'Desk Workers Posture Recovery', description: 'Strategies for developers and analysts reversing screen fatigue and thoracic slouch.', membersCount: 142, tags: ['spine', 'desk', 'ergonomics'], icon: 'Activity', isJoined: true },
  { id: 'circ_2', name: 'Mindful Coders & Builders', description: 'Protecting attention and emotional equilibrium during high-pressure shipping cycles.', membersCount: 208, tags: ['coding', 'focus', 'deepwork'], icon: 'Cpu', isJoined: true },
  { id: 'circ_3', name: 'Daily Breath & Pranayama', description: 'Micro-habits: 4s/6s autonomic nervous balance exercises throughout the workday.', membersCount: 96, tags: ['breath', 'nervous-system'], icon: 'Wind', isJoined: false },
];

const PSYCHOLOGISTS: PsychologistProfile[] = [
  {
    id: 'psy_1',
    name: 'Dr. Ananya Sen',
    title: 'Consultant Clinical Psychologist',
    credentials: 'PhD (NIMHANS), RCI Verified #CRR-A1829',
    specialties: ['Workplace Burnout', 'Anxiety & Panic Recovery', 'Mindfulness-Based CBT'],
    verificationLevel: 'specialist',
    isVerified: true,
    rating: 4.9,
    availableSlots: ['Tomorrow, 10:00 AM', 'Tomorrow, 4:30 PM', 'Thursday, 2:00 PM'],
    bio: '12+ years experience helping knowledge workers navigate acute stress, existential burnout, and autonomic dysregulation.',
  },
  {
    id: 'psy_2',
    name: 'Vikramaditya Rao',
    title: 'Cognitive Behavioural Specialist',
    credentials: 'M.Phil Clinical Psychology, IACP Certified',
    specialties: ['Attention Management', 'Somatic Grounding', 'Performance Anxiety'],
    verificationLevel: 'senior',
    isVerified: true,
    rating: 4.8,
    availableSlots: ['Today, 6:00 PM', 'Friday, 11:00 AM'],
    bio: 'Grounds cognitive therapy into daily tactile rituals and sensory awareness.',
  },
  {
    id: 'psy_3',
    name: 'Meera Krishnan',
    title: 'Mindfulness & Movement Therapist',
    credentials: 'M.Sc Counseling Psychology, YIC Certified',
    specialties: ['Somatic Experiencing', 'Compassion-Focused Therapy'],
    verificationLevel: 'experienced',
    isVerified: true,
    rating: 4.9,
    availableSlots: ['Wednesday, 3:00 PM', 'Friday, 5:00 PM'],
    bio: 'Bridging contemplative yogic traditions with evidence-backed psychological stabilization.',
  },
];

export class MockCommunityService implements ICommunityService {
  async getPosts(): Promise<CirclePost[]> {
    const raw = localStorage.getItem(POSTS_KEY);
    if (!raw) {
      localStorage.setItem(POSTS_KEY, JSON.stringify(INITIAL_POSTS));
      return INITIAL_POSTS;
    }
    return JSON.parse(raw);
  }

  async createPost(content: string, tags: string[], isAnonymous = false): Promise<CirclePost> {
    if(!content.trim())throw Error('Write a thought before sharing.');
    const posts = await this.getPosts();
    const user=await new MockAuthService().getCurrentUser();
    const newPost: CirclePost = {
      id: 'post_' + crypto.randomUUID(),
      authorName: isAnonymous ? 'Anonymous Member' : user?.name||'You',
      authorHandle: isAnonymous ? '@mindful_visitor' : user?.username?'@'+user.username:'@you',
      authorRole: isAnonymous ? 'Community Member' : 'Demo member',
      isAnonymous,
      content:content.trim().slice(0,4000),
      tags: tags.length ? tags : ['mindfulness'],
      world: 'forest',
      createdAt: 'Just now',
      reactions: { support: 0, relate: 0, celebrate: 0 },
      comments: [],
    };
    posts.unshift(newPost);
    localStorage.setItem(POSTS_KEY, JSON.stringify(posts));
    return newPost;
  }

  async reactToPost(postId: string, reaction: ReactionType): Promise<CirclePost> {
    const posts = await this.getPosts();
    const post = posts.find((p) => p.id === postId);
    if (!post) throw new Error('Post not found');

    if (post.userReaction === reaction) {
      post.reactions[reaction] = Math.max(0, post.reactions[reaction] - 1);
      post.userReaction = undefined;
    } else {
      if (post.userReaction) {
        post.reactions[post.userReaction] = Math.max(0, post.reactions[post.userReaction] - 1);
      }
      post.reactions[reaction] += 1;
      post.userReaction = reaction;
    }

    localStorage.setItem(POSTS_KEY, JSON.stringify(posts));
    return post;
  }

  async getCircles(): Promise<CircleGroup[]> {
    return JSON.parse(localStorage.getItem('maitri_mock_circles') || JSON.stringify(CIRCLES));
  }

  async getPsychologists(): Promise<PsychologistProfile[]> {
    const bookings: {psychologistId:string;timeSlot:string}[]=JSON.parse(localStorage.getItem('maitri_mock_bookings')||'[]');
    return PSYCHOLOGISTS.map(profile=>({...profile,availableSlots:profile.availableSlots.filter(slot=>!bookings.some(booking=>booking.psychologistId===profile.id&&booking.timeSlot===slot))}));
  }

  async bookSession(psychologistId: string, timeSlot: string): Promise<{ success: boolean; sessionRoomId: string }> {
    const bookings=JSON.parse(localStorage.getItem('maitri_mock_bookings')||'[]');
    if(bookings.some((b:{psychologistId:string;timeSlot:string})=>b.psychologistId===psychologistId&&b.timeSlot===timeSlot))throw Error('This demo slot is already reserved on this device.');
    bookings.push({psychologistId,timeSlot});localStorage.setItem('maitri_mock_bookings',JSON.stringify(bookings));
    await new Promise((r) => setTimeout(r, 600));
    return {
      success: true,
      sessionRoomId: `room_${psychologistId}_${Date.now().toString(36)}`,
    };
  }

  async addComment(postId:string,content:string):Promise<Comment>{
    if(!content.trim())throw Error('Write a comment first.');
    const posts=await this.getPosts();const post=posts.find(p=>p.id===postId);if(!post)throw Error('Post not found');
    const user=await new MockAuthService().getCurrentUser();
    const comment:Comment={id:crypto.randomUUID(),authorName:user?.name||'You',authorHandle:user?.username?'@'+user.username:'@you',content:content.trim().slice(0,1000),createdAt:'Just now'};
    post.comments.push(comment);localStorage.setItem(POSTS_KEY,JSON.stringify(posts));return comment;
  }
  async toggleCircle(id:string):Promise<CircleGroup>{
    const circles=await this.getCircles();const group=circles.find(c=>c.id===id);if(!group)throw Error('Circle not found');
    group.isJoined=!group.isJoined;group.membersCount+=group.isJoined?1:-1;localStorage.setItem('maitri_mock_circles',JSON.stringify(circles));return group;
  }
  async getFriends():Promise<FriendProfile[]>{
    return JSON.parse(localStorage.getItem('maitri_mock_friends')||JSON.stringify([
      {id:'friend_rohan',name:'Rohan Mehta',maitriId:'rohan.mindful',bio:'Finding small moments of movement between lines of code.',interests:['Movement','Mindful coding'],isFriend:false},
      {id:'friend_priya',name:'Priya Verma',maitriId:'priya.grows',bio:'A journal, a cup of tea and a slower morning.',interests:['Journaling','Breathing'],isFriend:false},
      {id:'friend_kavita',name:'Kavita Sundaram',maitriId:'kavita.zen',bio:'A little more space for reading and quiet.',interests:['Yoga','Focus'],isFriend:false}
    ]));
  }
  async toggleFriend(id:string):Promise<FriendProfile>{
    const friends=await this.getFriends();const friend=friends.find(f=>f.id===id);if(!friend)throw Error('Profile not found');
    friend.isFriend=!friend.isFriend;localStorage.setItem('maitri_mock_friends',JSON.stringify(friends));return friend;
  }
  async getChallenges():Promise<CircleChallenge[]>{
    return JSON.parse(localStorage.getItem('maitri_mock_challenges')||JSON.stringify([
      {id:'challenge_pause',title:'Three kind pauses',description:'Notice a moment to stop and breathe. Log it when you choose.',goal:3,progress:0,joined:false},
      {id:'challenge_reflect',title:'A week of small noticing',description:'Record five moments of noticing, without a daily deadline.',goal:5,progress:0,joined:false}
    ]));
  }
  async updateChallenge(id:string,action:'join'|'progress'):Promise<CircleChallenge>{
    const challenges=await this.getChallenges();const challenge=challenges.find(c=>c.id===id);if(!challenge)throw Error('Challenge not found');
    if(action==='join')challenge.joined=!challenge.joined;else if(challenge.joined)challenge.progress=Math.min(challenge.goal,challenge.progress+1);
    localStorage.setItem('maitri_mock_challenges',JSON.stringify(challenges));return challenge;
  }
}
