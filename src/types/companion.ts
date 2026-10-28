export type CompanionMoodState = 'idle' | 'wandering' | 'curious' | 'listening' | 'thinking' | 'speaking' | 'happy' | 'comforting' | 'resting';

export type RiskLevel = 'none' | 'elevated' | 'acute';

export type SuggestedAction = 'breathing' | 'grounding' | 'meditation' | 'journal' | 'talk_to_someone' | null;

export interface ChatMessage {
  id: string;
  sender: 'user' | 'companion' | 'system';
  content: string;
  timestamp: string;
  riskLevel?: RiskLevel;
  suggestedAction?: SuggestedAction;
  isStreaming?: boolean;
}

export interface CompanionPerceptionState {
  cameraActive: boolean;
  micActive: boolean;
  detectedEmotion?: string;
  postureStatus?: 'good' | 'slouched' | 'strained';
  permissionGranted: boolean;
}
