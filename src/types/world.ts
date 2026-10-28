export type WorldId = 'forest' | 'space' | 'zen' | 'medical' | 'focus' | 'custom';

export interface WorldConfig {
  id: WorldId;
  name: string;
  tagline: string;
  primaryColor: string;
  accentColor: string;
  characterVideo: string;
  backgroundImg: string;
  isLightMode?: boolean;
  droneFrequencyHz: number;
}

export const WORLD_CONFIGS: Record<WorldId, WorldConfig> = {
  forest: {
    id: 'forest',
    name: 'Ghibli Forest',
    tagline: 'Lush botanical sanctuary beneath sunlit canopy',
    primaryColor: '#2E7D32',
    accentColor: '#facc15',
    characterVideo: '/assets/character.mp4',
    backgroundImg: '/assets/forest_background.webp',
    droneFrequencyHz: 174,
  },
  space: {
    id: 'space',
    name: 'Space Station',
    tagline: 'Quiet orbital deck overlooking starlit Earth',
    primaryColor: '#1A73E8',
    accentColor: '#00F2FE',
    characterVideo: '/assets/character_space.mp4',
    backgroundImg: '/assets/space_background.webp',
    droneFrequencyHz: 108,
  },
  zen: {
    id: 'zen',
    name: 'Muji Zen Garden',
    tagline: 'Minimalist stones, raked gravel and cedar rain',
    primaryColor: '#722F37',
    accentColor: '#BA0C2F',
    characterVideo: '/assets/character_zen.mp4',
    backgroundImg: '/assets/Zen_background.webp',
    droneFrequencyHz: 432,
  },
  medical: {
    id: 'medical',
    name: 'Medical Sanctuary',
    tagline: 'Airy light, soft translucence and space to recover',
    primaryColor: '#0EA5E9',
    accentColor: '#0284C7',
    characterVideo: '/assets/character_medical.mp4',
    backgroundImg: '/assets/healing-light.svg',
    isLightMode: true,
    droneFrequencyHz: 528,
  },
  focus: {
    id: 'focus',
    name: 'Deep Focus',
    tagline: 'Quiet architecture, warm light and room to concentrate',
    primaryColor: '#EF6C00',
    accentColor: '#FFB300',
    characterVideo: '/assets/character.mp4',
    backgroundImg: '/assets/Focus_background.webp',
    droneFrequencyHz: 256,
  },
  custom: {
    id: 'custom',
    name: 'Custom Domain',
    tagline: 'Your chosen setting, light and ambient tone',
    primaryColor: '#8A2BE2',
    accentColor: '#FF1493',
    characterVideo: '/assets/character.mp4',
    backgroundImg: '/assets/Custom_background.webp',
    droneFrequencyHz: 150,
  },
};

/** Quiet synthesized textures, not therapeutic frequency claims or field recordings. */
export const WORLD_SOUNDS:Record<WorldId,{cutoff:number;texture:number}>={
 forest:{cutoff:850,texture:.018}, space:{cutoff:160,texture:.009},
 zen:{cutoff:1400,texture:.012}, medical:{cutoff:430,texture:.006},
 focus:{cutoff:260,texture:.008}, custom:{cutoff:620,texture:.01},
};
