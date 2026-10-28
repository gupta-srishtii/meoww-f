import { create } from 'zustand';
import { ChatMessage, CompanionMoodState } from '../types/companion';
import { services } from '../services';
interface CompanionState {
 messages: ChatMessage[]; moodState: CompanionMoodState; isStreaming: boolean; drawerOpen: boolean; error: string;
 sendMessage: (text: string) => Promise<void>; toggleDrawer: () => void; setDrawerOpen: (open: boolean) => void;
 setMoodState: (state: CompanionMoodState) => void; celebrate: () => void;
 clearConversation: () => boolean;
}
const key = 'maitri_demo_conversation';
const welcome: ChatMessage[] = [{id:'welcome',sender:'companion',content:'A little room to pause. This is a simulated conversation. What is on your mind?',timestamp:''}];
function restore(): ChatMessage[] {
 try { const v = JSON.parse(localStorage.getItem(key) || 'null'); return Array.isArray(v) && v.every(m => typeof m.content === 'string' && typeof m.id === 'string' && ['user','companion','system'].includes(m.sender)) ? v.map(m => ({...m,isStreaming:false})).slice(-100) : welcome; } catch { return welcome; }
}
let celebration: ReturnType<typeof setTimeout>;
export const useCompanionStore = create<CompanionState>((set,get) => ({
 messages:restore(),moodState:'idle',isStreaming:false,drawerOpen:false,error:'',
 toggleDrawer:()=>set({drawerOpen:!get().drawerOpen}),setDrawerOpen:drawerOpen=>set({drawerOpen}),setMoodState:moodState=>set({moodState}),
 clearConversation:()=>{
  if(get().isStreaming)return false;
  try{localStorage.removeItem(key);set({messages:welcome,error:'',moodState:'idle'});return true;}
  catch{set({error:'Conversation could not be removed from browser storage. Please try again.'});return false;}
 },
 celebrate:()=>{if(get().isStreaming || get().moodState==='listening')return;clearTimeout(celebration);set({moodState:'happy'});celebration=setTimeout(()=>{if(get().moodState==='happy')set({moodState:'idle'});},2500);},
 sendMessage:async text=>{
  text=text.trim();if(!text || get().isStreaming)return;
  const timestamp=()=>new Date().toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'});
  const id=crypto.randomUUID();const history=get().messages;
  set({messages:[...history,{id:crypto.randomUUID(),sender:'user' as const,content:text,timestamp:timestamp()}].slice(-100),isStreaming:true,moodState:'thinking',error:''});
  try {await services.chat.sendMessage(text,history,content=>{
   const messages=get().messages;set({moodState:'speaking',messages:messages.some(m=>m.id===id)?messages.map(m=>m.id===id?{...m,content}:m):[...messages,{id,sender:'companion',content,timestamp:timestamp(),isStreaming:true}]});
  },completed=>set({messages:get().messages.map(m=>m.id===id?{...completed,id,isStreaming:false}:m),moodState:completed.riskLevel==='elevated'||completed.riskLevel==='acute'?'comforting':'idle'}));}
  catch {set({error:'The demo response could not finish. Please try again.',moodState:'idle'});}
  finally {set({isStreaming:false,messages:get().messages.map(m=>({...m,isStreaming:false}))});try{localStorage.setItem(key,JSON.stringify(get().messages));}catch{set({error:'Browser storage is unavailable. History lasts only for this visit.'});}}
 }
}));

