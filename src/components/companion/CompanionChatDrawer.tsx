import React, {useEffect,useRef,useState} from 'react';
import {Send,X,Mic,Volume2,Square,MessageCircle,Trash2,Maximize2} from 'lucide-react';
import {useCompanionStore} from '../../store/useCompanionStore';
import {useThemeStore} from '../../store/useThemeStore';
import {useNavigationStore} from '../../store/useNavigationStore';
import {LivingCompanion} from './CompanionStage';
import {services} from '../../services';
import './chat.css';

interface Recognition {
 lang:string; interimResults:boolean; continuous:boolean;
 onresult:((e:{results:ArrayLike<ArrayLike<{transcript:string}>>})=>void)|null;
 onerror:((e:{error:string})=>void)|null; onend:(()=>void)|null;
 start:()=>void; abort:()=>void;
}
type SpeechWindow=Window & {SpeechRecognition?:new()=>Recognition;webkitSpeechRecognition?:new()=>Recognition};
export const CompanionChatDrawer:React.FC=()=>{
 const {messages,isStreaming,drawerOpen,setDrawerOpen,sendMessage,setMoodState,error,clearConversation}=useCompanionStore();
 const {activeWorld:world,voiceOutput:voiceEnabled,companionNickname,update}=useThemeStore();
 const nav=useNavigationStore();const {currentTab,setTab,openSos}=nav;
 const [input,setInput]=useState('');const [notice,setNotice]=useState('');const [listening,setListening]=useState(false);const [speaking,setSpeaking]=useState<string|null>(null);
 const [confirmClear,setConfirmClear]=useState(false);const [size,setSize]=useState(75);const [unread,setUnread]=useState(false);
 const recognition=useRef<Recognition|null>(null);const end=useRef<HTMLDivElement>(null);const panel=useRef<HTMLElement>(null);const composer=useRef<HTMLTextAreaElement>(null);const launcher=useRef<HTMLButtonElement>(null);const stickToEnd=useRef(true);const wasStreaming=useRef(false);
 const stop=()=>{const r=recognition.current;recognition.current=null;if(r){r.onend=null;r.onresult=null;r.onerror=null;r.abort();}window.speechSynthesis?.cancel();setListening(false);setSpeaking(null);if(!useCompanionStore.getState().isStreaming)setMoodState('idle');};
 useEffect(()=>{stop();setConfirmClear(false);return stop;},[currentTab,drawerOpen]);
 useEffect(()=>{if(!voiceEnabled)stop();},[voiceEnabled]);
 useEffect(()=>{if(nav.isSettingsOpen||nav.isWorldSelectorOpen||nav.isSosOpen||nav.isAdminOpen||nav.isDisclaimerOpen)setDrawerOpen(false);},[nav.isSettingsOpen,nav.isWorldSelectorOpen,nav.isSosOpen,nav.isAdminOpen,nav.isDisclaimerOpen]);
 useEffect(()=>{
  if(!drawerOpen)return;
  setUnread(false);stickToEnd.current=true;
  const previous=document.activeElement as HTMLElement;
  composer.current?.focus();
  return()=>{if(previous?.isConnected)previous.focus();else launcher.current?.focus();};
 },[drawerOpen]);
 useEffect(()=>{
  if(stickToEnd.current)end.current?.scrollIntoView({behavior:'instant',block:'end'});
  if(wasStreaming.current&&!isStreaming&&!drawerOpen)setUnread(true);
  wasStreaming.current=isStreaming;
 },[messages,isStreaming,drawerOpen]);
 const listen=()=>{
  if(listening){stop();return;}
  const C=(window as SpeechWindow).SpeechRecognition||(window as SpeechWindow).webkitSpeechRecognition;
  if(!C){setNotice('Speech recognition is not supported in this browser. You can type your message below.');return;}
  stop();const r=new C();recognition.current=r;r.lang=navigator.language;r.continuous=false;r.interimResults=false;
  r.onresult=e=>{const text=Array.from(e.results).map(result=>result[0].transcript).join(' ');setInput(v=>(v+' '+text).trim().slice(0,4000));setNotice('Voice captured. Review or edit your text before sending.');};
  r.onerror=e=>{setNotice(e.error==='not-allowed'?'Microphone permission was denied. You can type instead.':'Voice input ended: '+e.error+'. Please try again or type.');};
  r.onend=()=>{setListening(false);recognition.current=null;if(!useCompanionStore.getState().isStreaming)setMoodState('idle');};
  try{r.start();setListening(true);setMoodState('listening');setNotice('Listening. Your browser may process speech online.');}catch{stop();setNotice('Voice input could not start. Please type or try again.');}
 };
 const read=(id:string,text:string)=>{
  if(!window.speechSynthesis){setNotice('Read aloud is not supported in this browser.');return;}
  stop();const utterance=new SpeechSynthesisUtterance(text);
  utterance.onstart=()=>{setSpeaking(id);setMoodState('speaking');};
  const finish=()=>{setSpeaking(null);if(!useCompanionStore.getState().isStreaming)setMoodState('idle');};
  utterance.onend=finish;utterance.onerror=()=>{finish();setNotice('Playback ended or could not start.');};
  window.speechSynthesis.speak(utterance);
 };
 const submit=()=>{if(!input.trim()||isStreaming||listening)return;stop();stickToEnd.current=true;setNotice('');void sendMessage(input);setInput('');};
 if(!drawerOpen)return <button ref={launcher} className="chat-launcher" aria-label="Open companion chat" aria-haspopup="dialog" aria-expanded="false" onClick={()=>setDrawerOpen(true)}>
  <MessageCircle size={24}/>{unread&&<span className="chat-unread" aria-label="New demo reply"/>}<span className="chat-launcher-tip">{unread?'A new reply is here':'A moment with '+(companionNickname||'MAITRI')}</span>
 </button>;
 return <aside ref={panel} className="companion-drawer floating-chat" style={{'--chat-height':size+'dvh'} as React.CSSProperties} role="dialog" aria-modal="false" aria-labelledby="chat-title" onKeyDown={e=>{if(e.key==='Escape'){e.stopPropagation();setDrawerOpen(false);}}}>
  <header className="chat-header"><LivingCompanion compact/><div><h2 id="chat-title">{companionNickname||'MAITRI'}</h2><small>Demo companion · saved in this browser</small></div><button className="chat-action chat-resize" aria-label="Resize chat" title={size+'% viewport height; click to resize'} onClick={()=>setSize(v=>v===75?90:v===90?60:75)}><Maximize2 size={16}/></button><button className="btn btn-icon btn-secondary" aria-label="Close chat" onClick={()=>setDrawerOpen(false)}><X size={18}/></button></header>
  <div className="chat-messages" role="log" aria-label="Conversation" aria-live={isStreaming?'off':'polite'} aria-busy={isStreaming} onScroll={e=>{const el=e.currentTarget;stickToEnd.current=el.scrollHeight-el.scrollTop-el.clientHeight<60;}}>
   {messages.map(m=><div key={m.id} className={'chat-message '+m.sender}><small>{m.sender==='user'?'You':'Demo companion'}</small><p>{m.content}</p>
    {m.sender==='companion'&&!m.isStreaming&&voiceEnabled&&<button className="chat-action" disabled={isStreaming||listening} onClick={()=>speaking===m.id?stop():read(m.id,m.content)}>{speaking===m.id?<Square size={13}/>:<Volume2 size={13}/>} {speaking===m.id?'Stop playback':'Read aloud'}</button>}
    {m.suggestedAction&&<button className="chat-action" onClick={()=>{setDrawerOpen(false);setTab(m.suggestedAction==='journal'?'daily-rhythm':m.suggestedAction==='talk_to_someone'?'circle':'yoga');}}>{m.suggestedAction==='journal'?'Open journal':m.suggestedAction==='talk_to_someone'?'Explore support':'Explore a practice'} →</button>}
   </div>)}<div ref={end}/>
  </div>
  <div className="chat-status" role="status">{listening?'Listening…':speaking?'Reading aloud…':isStreaming?'Preparing a demo response…':notice||error||'A supportive conversation, not medical advice.'}</div>
  <div className="chat-starters">{services.chat.getStarters(world).slice(0,2).map(s=><button key={s} disabled={isStreaming||listening} onClick={()=>{stop();stickToEnd.current=true;setNotice('');void sendMessage(s);}}>{s}</button>)}</div>
  <form className="chat-composer" onSubmit={e=>{e.preventDefault();submit();}}><label className="sr-only" htmlFor="chat-input">Your message</label><textarea ref={composer} id="chat-input" className="input-field" rows={2} maxLength={4000} placeholder="Share what is on your mind…" value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>{if(e.key==='Enter'&&!e.shiftKey&&!e.nativeEvent.isComposing){e.preventDefault();submit();}}}/><div className="chat-controls"><button type="button" className="btn btn-secondary" disabled={isStreaming} onClick={listen}><Mic size={16}/>{listening?'Stop listening':'Voice input'}</button><button className="btn btn-primary" disabled={!input.trim()||isStreaming||listening} aria-label="Send message"><Send size={16}/></button></div></form>
  <footer className="chat-footer"><label><input type="checkbox" checked={voiceEnabled} onChange={e=>{try{update({voiceOutput:e.target.checked});}catch{setNotice('Voice preference changed for this visit; storage is unavailable.');}}}/> Read aloud</label><button className="chat-action" disabled={isStreaming} onClick={()=>setConfirmClear(true)} aria-label="Clear conversation"><Trash2 size={14}/></button><button className="chat-action" onClick={()=>openSos(true)}>Need help now?</button></footer>
  {confirmClear&&<div className="chat-clear-confirm" role="alert"><p>Remove this conversation from this browser? This cannot be undone.</p><button className="btn btn-secondary" autoFocus onClick={()=>setConfirmClear(false)}>Keep conversation</button><button className="btn btn-destructive" onClick={()=>{stop();if(clearConversation()){setConfirmClear(false);setNotice('Conversation cleared.');composer.current?.focus();}}}>Clear history</button></div>}
 </aside>;
};

