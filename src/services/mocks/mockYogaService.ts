import { IYogaService } from '../contracts';
import { YogaRoutine, YogaAsana } from '../../types/yoga';

const ASANAS: YogaAsana[] = [
  {
    id: 'tadasana',
    name: 'Mountain Pose',
    sanskritName: 'Tadasana',
    difficulty: 'beginner',
    poseType: 'standing',
    durationMinutes: 2,
    benefits: ['Improves spinal posture', 'Grounds nervous system', 'Distributes body weight evenly'],
    commonMistakes: ['Locking knees back', 'Arching lumbar spine', 'Tensing shoulders up toward ears'],
    steps: [
      { stepId: 'tad_1', name: 'Root through four corners of feet', instruction: 'Stand tall with big toes touching, lift arches, engage quadriceps gently.', holdDurationSec: 30, breathingCue: 'Slow steady inhalation' },
      { stepId: 'tad_2', name: 'Lengthen spine and soften shoulders', instruction: 'Draw shoulder blades softly down the back, palms facing gently forward.', holdDurationSec: 45, breathingCue: 'Exhale tension down into the floor' },
    ],
  },
  {
    id: 'vrikshasana',
    name: 'Tree Pose',
    sanskritName: 'Vrikshasana',
    difficulty: 'intermediate',
    poseType: 'balance',
    durationMinutes: 3,
    benefits: ['Cultivates neuro-muscular balance', 'Strengthens ankles and calves', 'Enhances mental focus'],
    commonMistakes: ['Placing foot directly on side of knee joint', 'Tilting hips to the side'],
    steps: [
      { stepId: 'vrik_1', name: 'Establish grounding on left leg', instruction: 'Shift weight to left foot, bring right sole to left inner thigh or calf.', holdDurationSec: 30, breathingCue: 'Fix eyes on a still focal point' },
      { stepId: 'vrik_2', name: 'Anjali Mudra at heart center', instruction: 'Press palms together, elevate spine tall, breathe evenly.', holdDurationSec: 45, breathingCue: 'Inhale lift, exhale stability' },
    ],
  },
  {
    id: 'virabhadrasana2',
    name: 'Warrior II',
    sanskritName: 'Virabhadrasana II',
    difficulty: 'beginner',
    poseType: 'standing',
    durationMinutes: 3,
    benefits: ['Opens hips and chest', 'Builds stamina and determination', 'Relieves desk backaches'],
    commonMistakes: ['Front knee collapsing inward', 'Leaning torso forward past pelvis'],
    steps: [
      { stepId: 'vira_1', name: 'Step wide and align heels', instruction: 'Turn front toes forward, back foot 90 degrees, bend front knee over ankle.', holdDurationSec: 30, breathingCue: 'Deep thoracic expansion' },
      { stepId: 'vira_2', name: 'Extend arms parallel to floor', instruction: 'Gaze softly over front fingertips, relax neck, feel strength.', holdDurationSec: 45, breathingCue: 'Long grounded exhalations' },
    ],
  },
  {
    id: 'balasana',
    name: "Child's Pose",
    sanskritName: 'Balasana',
    difficulty: 'beginner',
    poseType: 'floor',
    durationMinutes: 3,
    benefits: ['Calms sympathetic nervous fight-or-flight system', 'Gently stretches hips and spine'],
    commonMistakes: ['Forcing hips to heels when knees protest', 'Holding breath'],
    steps: [
      { stepId: 'bala_1', name: 'Rest hips back over heels', instruction: 'Knees wide or together, drape torso forward between thighs, rest forehead on mat.', holdDurationSec: 60, breathingCue: 'Breathe into back ribs' },
    ],
  },
];

const ROUTINES: YogaRoutine[] = [
  {
    id: 'routine_morning',
    title: 'Morning Awakening Flow',
    subtitle: '15-minute gentle solar activation for spine and alert posture',
    totalDurationMin: 15,
    level: 'beginner',
    asanas: ASANAS.slice(0, 3),
    bannerGradient: 'linear-gradient(135deg, #facc15 0%, #f59e0b 100%)',
  },
  {
    id: 'routine_stress',
    title: 'Stress & Anxiety Release',
    subtitle: '20-minute parasympathetic restorative sequence with deep holds',
    totalDurationMin: 20,
    level: 'beginner',
    asanas: [ASANAS[0], ASANAS[3], ASANAS[1]],
    bannerGradient: 'linear-gradient(135deg, #0ea5e9 0%, #38bdf8 100%)',
  },
  {
    id: 'routine_desk',
    title: 'Office & Upper Back Reset',
    subtitle: '10-minute targeted release for forward-head posture and thoracic slump',
    totalDurationMin: 10,
    level: 'beginner',
    asanas: [ASANAS[0], ASANAS[2], ASANAS[3]],
    bannerGradient: 'linear-gradient(135deg, #2e7d32 0%, #81b29a 100%)',
  },
];

export class MockYogaService implements IYogaService {
  async getRoutines(): Promise<YogaRoutine[]> {
    return ROUTINES;
  }

  async getAsanas(): Promise<YogaAsana[]> {
    return [...ASANAS,...JSON.parse(localStorage.getItem('maitri_mock_asanas')||'[]')];
  }
  async saveAsana(asana:YogaAsana):Promise<YogaAsana>{
    const drafts=JSON.parse(localStorage.getItem('maitri_mock_asanas')||'[]');
    drafts.push(asana);localStorage.setItem('maitri_mock_asanas',JSON.stringify(drafts));return asana;
  }
}
