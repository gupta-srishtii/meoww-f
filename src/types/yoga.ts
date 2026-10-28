export type PoseDifficulty = 'beginner' | 'intermediate' | 'advanced';

export type PoseType = 'standing' | 'balance' | 'floor';

export interface YogaStep {
  stepId: string;
  name: string;
  instruction: string;
  holdDurationSec: number;
  breathingCue: string;
}

export interface YogaAsana {
  id: string;
  name: string;
  sanskritName: string;
  difficulty: PoseDifficulty;
  poseType: PoseType;
  durationMinutes: number;
  benefits: string[];
  commonMistakes: string[];
  steps: YogaStep[];
  targetAngles?: Record<string, number>;
}

export interface YogaRoutine {
  id: string;
  title: string;
  subtitle: string;
  totalDurationMin: number;
  level: PoseDifficulty;
  asanas: YogaAsana[];
  bannerGradient: string;
}
