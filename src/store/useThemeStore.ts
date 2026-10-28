import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { WorldId, WORLD_CONFIGS } from '../types/world';
export const THEMES = [
 {id:'ivory',name:'Ivory Bloom',bg:'#F7F3EC',surface:'#FFFDF8',text:'#282A27',accent:'#879A80',highlight:'#D5B67A',dark:false,description:'Warm light. Room to grow.'},
 {id:'velvet',name:'Velvet Cosmos',bg:'#17121F',surface:'#282034',text:'#F4ECFA',accent:'#AE8ED2',highlight:'#E6BD72',dark:true,description:'A little space to dream.'},
 {id:'kyoto',name:'Kyoto Stillness',bg:'#EEE9DF',surface:'#FAF7F0',text:'#39352F',accent:'#89977C',highlight:'#BFA78B',dark:false,description:'Paper, stone and quiet.'},
 {id:'dream',name:'Dreamscape',bg:'#FFF1F1',surface:'#FFF9FC',text:'#483D51',accent:'#B99BD5',highlight:'#F0AD9D',dark:false,description:'Soft edges. Open possibilities.'},
 {id:'aurora',name:'Midnight Aurora',bg:'#0B1020',surface:'#172238',text:'#E8F3F5',accent:'#56C7C0',highlight:'#93B8FF',dark:true,description:'Find your northern light.'},
 {id:'ember',name:'Royal Ember',bg:'#25151E',surface:'#3A2530',text:'#F8EDE5',accent:'#A75C78',highlight:'#D6B47D',dark:true,description:'Rich warmth, quietly held.'},
 {id:'dune',name:'Solar Dune',bg:'#F8EDE0',surface:'#FFF8EE',text:'#49362C',accent:'#C57F62',highlight:'#E8B66C',dark:false,description:'A slower kind of sunshine.'},
 {id:'mono',name:'Monochrome Atelier',bg:'#F3F3F1',surface:'#FFFFFF',text:'#1F2022',accent:'#686B70',highlight:'#B8B8B4',dark:false,description:'Only what matters.'},
] as const;
export type ThemeId = typeof THEMES[number]['id'];
export interface Preferences {
 theme:ThemeId; accent:string; motion:'full'|'gentle'|'none'; backgroundAnimation:boolean; ambientEffects:boolean;
 companionPosition:'left'|'right'; arrangement:'practice'|'reflection'; atmosphere:number; customBackground:WorldId; customFrequency:number;
 cursorFollow:boolean; companionNickname:string; aboutYou:string; voiceOutput:boolean; companionMotion:'gentle'|'expressive'|'still';
 backgroundScope:'viewport'|'companion'|'off'; soundPreset:'world'|'warm'|'clear'; readability:'standard'|'comfortable';
 providerPreference:'local'|'openrouter';
}
export const defaults:Preferences = {
 theme:'ivory',accent:'',motion:'gentle',backgroundAnimation:true,ambientEffects:true,companionPosition:'right',arrangement:'practice',atmosphere:.08,customBackground:'custom',customFrequency:150,
 cursorFollow:true,companionNickname:'Maitri',aboutYou:'',voiceOutput:false,companionMotion:'gentle',backgroundScope:'viewport',soundPreset:'world',readability:'standard',providerPreference:'local',
};
/** Only editable values enter a draft; store actions and transient state never do. */
export function getPreferences(state:Preferences):Preferences {
 return Object.fromEntries(Object.keys(defaults).map(key=>[key,state[key as keyof Preferences]])) as unknown as Preferences;
}
interface ThemeState extends Preferences {
 activeWorld:WorldId; config:typeof WORLD_CONFIGS[WorldId]; soundEnabled:boolean; volume:number; droneFrequency:number; audioStatus:string;
 setWorld:(id:WorldId)=>void; toggleSound:()=>void; setVolume:(n:number)=>void; setDroneFrequency:(n:number)=>void;
 update:(p:Partial<Preferences>)=>void; reset:()=>void;
 preview:{preferences:Preferences;world:WorldId}|null;
 setPreview:(value:{preferences:Preferences;world:WorldId}|null)=>void;
}
export const useThemeStore = create<ThemeState>()(persist((set,get)=>({
 ...defaults,activeWorld:'forest',config:WORLD_CONFIGS.forest,soundEnabled:false,volume:.35,droneFrequency:174,preview:null,audioStatus:'Sound is off.',
 setWorld:(id)=>set({activeWorld:id,config:WORLD_CONFIGS[id],droneFrequency:id==='custom'?get().customFrequency:WORLD_CONFIGS[id].droneFrequencyHz}),
 toggleSound:()=>set({soundEnabled:!get().soundEnabled}),setVolume:(n)=>set({volume:Math.max(0,Math.min(1,n))}),setDroneFrequency:(n)=>set({droneFrequency:n}),
 update:(p)=>set(p),setPreview:preview=>set({preview}),reset:()=>set({...defaults,companionNickname:get().companionNickname,aboutYou:get().aboutYou,providerPreference:get().providerPreference,activeWorld:'forest',config:WORLD_CONFIGS.forest,soundEnabled:false,volume:.35,droneFrequency:174,preview:null}),
}),{name:'maitri-theme-studio',partialize:({soundEnabled,config,preview,audioStatus,...state})=>state,
 merge:(persisted,current)=>{
  const value={...current,...(persisted as Partial<ThemeState>)};
  if(!WORLD_CONFIGS[value.activeWorld])value.activeWorld='forest';
  if(!THEMES.some(t=>t.id===value.theme))value.theme='ivory';
  if(!WORLD_CONFIGS[value.customBackground])value.customBackground='custom';
  value.config=WORLD_CONFIGS[value.activeWorld];value.preview=null;value.soundEnabled=false;value.audioStatus='Sound is off.';
  if(!['full','gentle','none'].includes(value.motion))value.motion='gentle';
  if(!['viewport','companion','off'].includes(value.backgroundScope))value.backgroundScope='viewport';
  if(!['world','warm','clear'].includes(value.soundPreset))value.soundPreset='world';
  if(!['gentle','expressive','still'].includes(value.companionMotion))value.companionMotion='gentle';
  if(!['standard','comfortable'].includes(value.readability))value.readability='standard';
  if(!['local','openrouter'].includes(value.providerPreference))value.providerPreference='local';
  value.companionNickname=typeof value.companionNickname==='string'&&value.companionNickname.trim()?value.companionNickname.slice(0,32):'Maitri';
  value.aboutYou=typeof value.aboutYou==='string'?value.aboutYou.slice(0,600):'';
  value.voiceOutput=value.voiceOutput===true;value.cursorFollow=value.cursorFollow!==false;
  value.volume=Number.isFinite(Number(value.volume))?Math.max(0,Math.min(1,Number(value.volume))):.35;
  value.atmosphere=Number.isFinite(Number(value.atmosphere))?Math.max(0,Math.min(.25,Number(value.atmosphere))):.08;
  return value;
 }}));
export function contrastRatio(a:string,b:string) {
 const luminance=(hex:string)=>{const rgb=hex.replace('#','').match(/.{2}/g)!.map(n=>parseInt(n,16)/255).map(n=>n<=.04045?n/12.92:((n+.055)/1.055)**2.4);return rgb[0]*.2126+rgb[1]*.7152+rgb[2]*.0722;};
 const x=luminance(a),y=luminance(b);return (Math.max(x,y)+.05)/(Math.min(x,y)+.05);
}
export function applyTheme(p:Preferences, world:WorldId) {
 const t=THEMES.find(t=>t.id===p.theme)||THEMES[0]; const root=document.documentElement;
 const accent=/^#[0-9a-f]{6}$/i.test(p.accent)?p.accent:t.accent;
 const action=contrastRatio(accent,t.surface)>=4.5?accent:t.dark?'#E6D5EE':'#69546D';
 const vars:Record<string,string>={'--theme-bg-from':t.bg,'--theme-bg-to':t.bg,'--theme-panel-bg':t.surface,'--theme-panel-card':t.surface,'--theme-text-main':t.text,'--theme-text-muted':t.dark?'#CEC7D6':'#625B65','--theme-accent':accent,'--theme-primary':accent,'--highlight':t.highlight,'--action':action,'--action-text':contrastRatio(action,'#FFFFFF')>=4.5?'#FFFFFF':'#17121F','--accent-text':contrastRatio(accent,t.surface)>=4.5?accent:t.text,'--on-accent':contrastRatio(accent,'#FFFFFF')>=4.5?'#FFFFFF':'#17121F','--world-accent':WORLD_CONFIGS[world].accentColor,'--atmosphere-opacity':String(p.atmosphere),'--status-vital':t.dark?'#89DAB7':'#23664D','--status-caution':t.dark?'#E6BD72':'#805B19','--status-alert':t.dark?'#FF9AA9':'#AA2944'};
 Object.entries(vars).forEach(([k,v])=>root.style.setProperty(k,v));
 root.dataset.motion=p.motion;root.dataset.background=String(p.backgroundAnimation);root.dataset.effects=String(p.ambientEffects);root.dataset.theme=p.theme;
 root.dataset.backgroundScope=p.backgroundScope;root.dataset.readability=p.readability;root.dataset.companionMotion=p.companionMotion;
 root.style.colorScheme=t.dark?'dark':'light';document.body.dataset.world=world;
}
