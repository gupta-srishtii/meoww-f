import React, {useEffect, useRef, useState} from 'react';
import {X, Check, ChevronDown, Globe2, UserRound, Cpu, Volume2, Palette, Accessibility, Shield, LogOut, RefreshCw, ArrowUpRight, Mic, Sparkles} from 'lucide-react';
import {useDialog} from '../common/useDialog';
import {useNavigationStore} from '../../store/useNavigationStore';
import {useAuthStore} from '../../store/useAuthStore';
import {useThemeStore, Preferences} from '../../store/useThemeStore';
import {WorldChoices, ThemeChoices} from '../safety/WorldSelectorModal';
import {WORLD_CONFIGS} from '../../types/world';
import {UserRole} from '../../types/auth';
import './settings.css';

type SectionId='world'|'profile'|'model'|'audio'|'themes'|'accessibility'|'privacy';
function SettingsSection({id,title,description,icon:Icon,open,onToggle,children}:{id:SectionId;title:string;description:string;icon:typeof Globe2;open:boolean;onToggle:()=>void;children:React.ReactNode}) {
 return <section className={'settings-section '+(open?'is-expanded':'')}>
  <h3><button className="settings-section-toggle" id={'settings-heading-'+id} aria-expanded={open} aria-controls={'settings-section-'+id} onClick={onToggle}><span className="settings-section-icon"><Icon size={20}/></span><span><strong>{title}</strong><small>{description}</small></span><ChevronDown size={19} className="settings-chevron"/></button></h3>
  <div className="settings-expansion" aria-hidden={!open} inert={!open}><div><div id={'settings-section-'+id} role="region" aria-labelledby={'settings-heading-'+id} className="settings-section-content">{children}</div></div></div>
 </section>;
}

export const SettingsModal:React.FC=()=>{
 const {isSettingsOpen,openSettings,openAdmin,openWorldSelector,setTab}=useNavigationStore();
 const {user,switchRole,logout,updateProfile}=useAuthStore();const theme=useThemeStore();
 const dialog=useDialog(isSettingsOpen,()=>openSettings(false));
 const [expanded,setExpanded]=useState<Set<SectionId>>(()=>new Set(['world']));
 const [nickname,setNickname]=useState(theme.companionNickname);const [about,setAbout]=useState(theme.aboutYou);
 const [displayName,setDisplayName]=useState(user?.name||'');const [maitriId,setMaitriId]=useState(user?.username||'');const [avatar,setAvatar]=useState(user?.avatarUrl||'/assets/companion-avatar.webp');
 const [savingProfile,setSavingProfile]=useState(false);const [loadingAvatar,setLoadingAvatar]=useState(false);const avatarRequest=useRef(0);const saving=useRef(false);
 const [profileNotice,setProfileNotice]=useState('');const [notice,setNotice]=useState('');const [busy,setBusy]=useState(false);const [confirmReset,setConfirmReset]=useState(false);
 const [micPermission,setMicPermission]=useState('Not checked');
 const [permissionRefresh,setPermissionRefresh]=useState(0);
 useEffect(()=>{if(isSettingsOpen){setNickname(theme.companionNickname);setAbout(theme.aboutYou);setDisplayName(user?.name||'');setMaitriId(user?.username||'');setAvatar(user?.avatarUrl||'/assets/companion-avatar.webp');setProfileNotice('');setNotice('');setConfirmReset(false);setLoadingAvatar(false);}return()=>{avatarRequest.current++;};},[isSettingsOpen]);
 const uploadAvatar=async(file?:File)=>{
  if(!file)return;
  const request=++avatarRequest.current;setLoadingAvatar(true);
  try{
   if(!['image/png','image/jpeg','image/webp'].includes(file.type)||file.size>2*1024*1024)throw Error('Choose a PNG, JPEG or WebP image under 2 MB.');
   const bitmap=await createImageBitmap(file);
   try{const canvas=document.createElement('canvas');canvas.width=canvas.height=160;const ctx=canvas.getContext('2d');if(!ctx)throw Error('Image processing is unavailable in this browser.');const side=Math.min(bitmap.width,bitmap.height);ctx.drawImage(bitmap,(bitmap.width-side)/2,(bitmap.height-side)/2,side,side,0,0,160,160);if(request===avatarRequest.current){setAvatar(canvas.toDataURL('image/webp',.85));setProfileNotice('Avatar preview ready. Save profile preferences to keep it.');}}
   finally{bitmap.close();}
  }catch(error){if(request===avatarRequest.current)setProfileNotice(error instanceof Error?error.message:'Could not read this image. Please choose another.');}
  finally{if(request===avatarRequest.current)setLoadingAvatar(false);}
 };
 const saveProfile=async(event:React.FormEvent)=>{
  event.preventDefault();if(saving.current||loadingAvatar)return;
  if(!nickname.trim()||nickname.trim().length>32){setProfileNotice('Choose a companion nickname between 1 and 32 characters.');return;}
  saving.current=true;setSavingProfile(true);setProfileNotice('Saving your local profile…');
  let accountSaved=false;
  try{await updateProfile({name:displayName,username:maitriId,avatarUrl:avatar,bio:about});accountSaved=true;theme.update({companionNickname:nickname.trim(),aboutYou:about.trim()});setNickname(nickname.trim());setDisplayName(displayName.trim());setMaitriId(maitriId.trim().replace(/^@/,''));setProfileNotice('Profile preferences saved in this browser.');}
  catch(error){setProfileNotice(accountSaved?'Account identity saved, but companion preferences could not be persisted. Please try saving again.':error instanceof Error?error.message:'Could not save your profile. Your edits are still here.');}
  finally{saving.current=false;setSavingProfile(false);}
 };
 useEffect(()=>{
  if(!isSettingsOpen)return;
  let active=true;let status:PermissionStatus|undefined;
  const update=()=>{if(active&&status)setMicPermission(status.state==='granted'?'Allowed by this browser':status.state==='denied'?'Blocked in browser permissions':'Ask when you choose Voice input');};
  if(!navigator.permissions){setMicPermission('Permission status is unavailable in this browser');return;}
  void navigator.permissions.query({name:'microphone' as PermissionName}).then(result=>{if(!active)return;status=result;update();result.addEventListener('change',update);}).catch(()=>{if(active)setMicPermission('Permission status is unavailable; check browser settings');});
  return()=>{active=false;status?.removeEventListener('change',update);};
 },[isSettingsOpen,permissionRefresh]);
 if(!isSettingsOpen)return null;
 const toggle=(id:SectionId)=>setExpanded(previous=>{const next=new Set(previous);if(next.has(id))next.delete(id);else next.add(id);return next;});
 const change=(value:Partial<Preferences>)=>{try{theme.update(value);setNotice('Preferences saved in this browser.');}catch{setNotice('Changes apply for this visit. Browser storage is unavailable, so they could not be saved.');}};
 const greetingName=displayName.trim()||'friend';
 const roles:{value:UserRole;label:string}[]=[{value:'user',label:'Standard member'},{value:'beta_tester',label:'Beta tester'},{value:'instructor',label:'Yoga instructor'},{value:'psychologist',label:'Psychologist demo'},{value:'admin',label:'Administrator'},{value:'superadmin',label:'Super administrator'}];
 const section=(id:SectionId,title:string,description:string,icon:typeof Globe2,children:React.ReactNode)=><SettingsSection id={id} title={title} description={description} icon={icon} open={expanded.has(id)} onToggle={()=>toggle(id)}>{children}</SettingsSection>;
 return <div className="modal-backdrop settings-backdrop" onClick={()=>openSettings(false)}><div ref={dialog} role="dialog" aria-modal="true" aria-labelledby="settings-title" className="modal-dialog settings-dialog" onClick={event=>event.stopPropagation()}>
  <header className="settings-header"><div><span className="eyebrow">YOUR SPACE, YOUR CHOICE</span><h2 id="settings-title">Settings &amp; Profile</h2><p>A sanctuary that feels like you.</p></div><button className="btn btn-icon btn-secondary" aria-label="Close Settings" onClick={()=>openSettings(false)}><X size={20}/></button></header>
  <div className="settings-scroll">
   {section('world','Active Sanctuary World Space','Six environments. One place to return to.',Globe2,<><p className="settings-note">Choose a world to change the atmosphere throughout your workspace. Your interface theme stays independent.</p><WorldChoices value={theme.activeWorld} onChange={id=>{try{theme.setWorld(id);setNotice(WORLD_CONFIGS[id].name+' is now your active world.');}catch{setNotice('The world changed for this visit, but could not be saved.');}}}/></>)}
   {section('profile','Sanctuary Profile Identity','Your account, and a little context for your companion.',UserRound,<>
    <div className="settings-identity"><img src={avatar} alt="Your profile avatar preview"/><div><h4>{user?.name||'Demo member'}</h4><p>{user?.username?'@'+user.username:user?.id||'No active account'}</p>{user?.email&&<small>{user.email}</small>}<div className="settings-badges">{user?.subscriptionPlan&&<span>{user.subscriptionPlan} plan · demo</span>}{user?.role&&<span>{user.role.replace('_',' ')} role</span>}</div></div></div>
    <form className="settings-profile-form" onSubmit={saveProfile}>
     <div className="profile-edit-grid"><label htmlFor="profile-display-name">Display name<input id="profile-display-name" className="input-field" value={displayName} required maxLength={60} disabled={savingProfile} onChange={event=>{setDisplayName(event.target.value);setProfileNotice('Unsaved changes');}}/></label><label htmlFor="profile-maitri-id">MAITRI ID<input id="profile-maitri-id" className="input-field" value={maitriId} required maxLength={30} disabled={savingProfile} onChange={event=>{setMaitriId(event.target.value);setProfileNotice('Unsaved changes');}} aria-describedby="profile-id-note"/></label></div><small id="profile-id-note" className="settings-note">Your local demo handle. Availability is not checked against a server; your internal account ID stays unchanged.</small>
     <fieldset className="avatar-editor" disabled={savingProfile||loadingAvatar}><legend>Profile avatar</legend><div className="avatar-options">{['/assets/companion-avatar.webp','/assets/favicon.png'].map((src,index)=><button type="button" key={src} aria-label={index?'Use MAITRI symbol avatar':'Use companion avatar'} aria-pressed={avatar===src} onClick={()=>{setAvatar(src);setProfileNotice('Unsaved avatar change');}}><img src={src} alt=""/></button>)}</div><label htmlFor="profile-avatar-file">Upload a photo<input id="profile-avatar-file" type="file" accept="image/png,image/jpeg,image/webp" onChange={event=>{void uploadAvatar(event.target.files?.[0]);event.target.value='';}}/></label><small>PNG, JPEG or WebP, up to 2 MB. Cropped and resized on this device, then saved in this browser only.</small></fieldset>
     <label htmlFor="companion-nickname">Companion nickname<input id="companion-nickname" disabled={savingProfile} className="input-field" value={nickname} maxLength={32} onChange={event=>{setNickname(event.target.value);setProfileNotice('Unsaved changes');}} required aria-describedby="nickname-hint"/></label><small id="nickname-hint" className="settings-note">This is what you call your companion, separate from your display name.</small>
     <div className="greeting-preview" aria-live="polite"><Sparkles size={19}/><div><span className="eyebrow">LIVE GREETING PREVIEW</span><p>Hello, {greetingName}. I'm {nickname.trim()||'your companion'}. What would feel helpful today?</p></div></div>
     <label htmlFor="profile-about">About you<textarea id="profile-about" disabled={savingProfile} className="input-field" value={about} maxLength={600} rows={3} placeholder="For example: I spend long days at a desk and enjoy a quiet breathing pause." onChange={event=>{setAbout(event.target.value);setProfileNotice('Unsaved changes');}} aria-describedby="profile-context-note"/></label>
     <small id="profile-context-note" className="settings-note">Optional wellness context, stored only in this browser. It is not sent to a model or used for medical advice in this demo. {about.length}/600</small>
     <div className="settings-form-actions"><button className="btn btn-primary" type="submit" disabled={savingProfile||loadingAvatar}><Check size={15}/>{savingProfile?'Saving profile...':'Save profile preferences'}</button><span role="status" className="settings-note">{profileNotice}</span></div>
    </form>
   </>)}
   {section('model','AI Companion Intelligence Model','Choose a future provider; explore safely in demo mode.',Cpu,<>
    <div className="provider-options">{([{id:'local',name:'Local GPU',detail:'A privately hosted model through an authorized backend.'},{id:'openrouter',name:'OpenRouter',detail:'Provider routing through a securely configured backend.'}] as const).map(provider=><button key={provider.id} className={'provider-choice '+(theme.providerPreference===provider.id?'selected':'')} aria-pressed={theme.providerPreference===provider.id} onClick={()=>change({providerPreference:provider.id})}><span className="provider-heading"><Cpu size={21}/><strong>{provider.name}</strong>{theme.providerPreference===provider.id&&<Check size={17}/>}</span><span>{provider.detail}</span><small>{theme.providerPreference===provider.id?'Preferred provider · ':' '}Not connected</small></button>)}</div>
    <div className="settings-info"><strong>Current response engine: local scripted demo</strong><p>{theme.providerPreference==='local'?'Local GPU setup needs an authorized server connection and a verified model endpoint.':'OpenRouter setup needs server-side credential storage and a verified provider connection.'} This frontend has neither connection. No API keys are requested, stored or displayed here.</p></div>
   </>)}
   {section('audio','Workspace Theme & Audio Mixer','Shape the light, the background and the sound.',Volume2,<>
    <div className="audio-preview" style={{backgroundImage:`linear-gradient(90deg,rgba(17,23,24,.85),rgba(17,23,24,.2)),url(${WORLD_CONFIGS[theme.activeWorld==='custom'?theme.customBackground:theme.activeWorld].backgroundImg})`}}><span className="eyebrow">LIVE WORKSPACE PREFERENCES</span><strong>{WORLD_CONFIGS[theme.activeWorld].name}</strong><span>{theme.backgroundScope==='viewport'?'Full viewport atmosphere':theme.backgroundScope==='companion'?'A focused glow around your companion':'Plain workspace background'} · {theme.soundEnabled?'Ambient tone on':'Sound off'}</span></div>
    <div className="settings-controls"><label className="settings-toggle">Ambient sound<input type="checkbox" checked={theme.soundEnabled} onChange={()=>{try{theme.toggleSound();setNotice(useThemeStore.getState().soundEnabled?'Ambient tone requested. Playback status appears below.':'Ambient sound is off.');}catch{setNotice('Sound preference could not be saved. Please try again.');}}}/></label>
     <label>Ambient volume <output>{Math.round(theme.volume*100)}%</output><input aria-label="Ambient volume" type="range" min="0" max="1" step=".01" value={theme.volume} onChange={event=>{try{theme.setVolume(Number(event.target.value));}catch{setNotice('Volume changed for this visit; storage is unavailable.');}}}/></label>
     <label>Sound menu<select value={theme.soundPreset} onChange={event=>change({soundPreset:event.target.value as Preferences['soundPreset']})}><option value="world">World tone</option><option value="warm">Warm hum</option><option value="clear">Clear tone</option></select></label>
     <label>World background display<select value={theme.backgroundScope} onChange={event=>change({backgroundScope:event.target.value as Preferences['backgroundScope']})}><option value="viewport">Full viewport atmosphere</option><option value="companion">Focused companion background</option><option value="off">Plain background</option></select></label>
     <label>Atmosphere strength <output>{Math.round(theme.atmosphere*400)}%</output><input aria-label="Settings atmosphere strength" type="range" min="0" max=".25" step=".01" value={theme.atmosphere} onChange={event=>change({atmosphere:Number(event.target.value)})}/></label>
    </div><p className="settings-note" role="status">{theme.soundEnabled?theme.audioStatus==='Browser audio is running.'&&theme.volume===0?'Audio is running at zero volume.':theme.audioStatus:theme.audioStatus.includes('blocked')||theme.audioStatus.includes('unavailable')?theme.audioStatus:'Sound is off.'}</p><p className="settings-note">These are synthesized ambient tones, not nature recordings or therapeutic frequencies. Volume and sound choice are remembered; playback starts only when you turn it on.</p>
   </>)}
   {section('themes','Theme Studio','Eight interface palettes, separate from your six worlds.',Palette,<>
    <ThemeChoices value={theme.theme} onChange={id=>change({theme:id,accent:''})}/><div className="settings-form-actions"><p className="settings-note">Select a palette for an immediate, saved change. Open the full studio to preview accents, motion and custom world choices before applying.</p><button className="btn btn-secondary" onClick={()=>{openSettings(false);openWorldSelector(true,'studio');}}>Open Theme Studio <ArrowUpRight size={16}/></button></div>
   </>)}
   {section('accessibility','Companion & Accessibility Preferences','Comfortable motion. Clear text. Voice only by choice.',Accessibility,<>
    <div className="settings-controls"><label className="settings-toggle">Offer read-aloud controls<input type="checkbox" checked={theme.voiceOutput} onChange={event=>change({voiceOutput:event.target.checked})}/></label>
     <label>Companion animation intensity<select value={theme.companionMotion} onChange={event=>change({companionMotion:event.target.value as Preferences['companionMotion']})}><option value="still">Still</option><option value="gentle">Gentle</option><option value="expressive">Expressive</option></select></label>
     <label>Interface motion<select value={theme.motion} onChange={event=>change({motion:event.target.value as Preferences['motion']})}><option value="none">Reduced motion / still</option><option value="gentle">Gentle</option><option value="full">Expressive</option></select></label>
     <label className="settings-toggle">Ambient animation<input type="checkbox" checked={theme.backgroundAnimation} onChange={event=>change({backgroundAnimation:event.target.checked})}/></label>
     <label className="settings-toggle">Ambient light and particles<input type="checkbox" checked={theme.ambientEffects} onChange={event=>change({ambientEffects:event.target.checked})}/></label>
     <label>Text readability<select value={theme.readability} onChange={event=>change({readability:event.target.value as Preferences['readability']})}><option value="standard">Standard</option><option value="comfortable">Larger, more comfortable text</option></select></label>
    <label className="settings-toggle">Follow cursor on Home<input aria-label="Follow cursor on Home" type="checkbox" checked={theme.cursorFollow} onChange={event=>change({cursorFollow:event.target.checked})}/></label></div><div className="settings-info microphone-status"><Mic size={19}/><div><strong>Microphone permission</strong><p role="status">{micPermission}</p><small>Voice input is requested from chat only when you choose it. Browser speech recognition may use an online provider.</small></div><button className="btn btn-secondary" onClick={()=>setPermissionRefresh(value=>value+1)}>Check status</button></div>
    <p className="settings-note">Your operating system's reduced-motion preference always takes priority. All themes use readable text and action colors; custom accents receive a contrast-safe action color.</p>
   </>)}
   {section('privacy','Privacy & Account','Understand this browser demo and manage your session.',Shield,<>
    <div className="settings-info"><strong>Your demo stays in this browser</strong><p>Reflections, conversation history and preferences use local browser storage. They are not encrypted. The journal's on-screen cover hides its contents from view; it is not a password lock.</p><p>Camera preview needs consent. No emotion or posture inference runs here. Clinical, community, appointment and device data are demonstrations.</p></div>
    <div className="settings-account-actions"><button className="btn btn-secondary" onClick={()=>{openSettings(false);useNavigationStore.getState().setRhythmTab('journal');setTab('daily-rhythm');}}>Journal & on-screen cover <ArrowUpRight size={15}/></button><button className="btn btn-secondary" onClick={()=>{openSettings(false);useNavigationStore.getState().openDisclaimer(true);}}>AI safety & transparency <ArrowUpRight size={15}/></button></div>
    <label className="settings-role-label">Inspect a demo role<select value={user?.role||'user'} disabled={busy} onChange={async event=>{setBusy(true);try{await switchRole(event.target.value as UserRole);setNotice('Demo role changed. This does not grant real account privileges.');}catch{setNotice('Could not change your demo role. Please try again.');}finally{setBusy(false);}}}>{roles.map(role=><option key={role.value} value={role.value}>{role.label}</option>)}</select></label>
    <p className="settings-note">Instructor and administrator roles expose the local pose authoring tools. These are frontend inspection states, not verified professional accounts.</p>
    {(user?.role==='admin'||user?.role==='superadmin')&&<button className="btn btn-secondary" onClick={()=>{openSettings(false);openAdmin(true);}}>Open sample diagnostics <ArrowUpRight size={15}/></button>}
    <div className="settings-reset"><div><strong>Reset this browser demo</strong><p>Removes saved reflections, conversations, habits, preferences and the local session.</p></div>{!confirmReset?<button className="btn btn-secondary" onClick={()=>setConfirmReset(true)}><RefreshCw size={14}/>Reset demo data</button>:<div className="reset-confirmation" role="group" aria-label="Confirm demo data reset"><strong>This cannot be undone.</strong><button className="btn btn-destructive" onClick={()=>{try{Object.keys(localStorage).filter(key=>key.startsWith('maitri')).forEach(key=>localStorage.removeItem(key));window.location.reload();}catch{setNotice('Browser storage could not be cleared. Check browser permissions and try again.');}}}>Delete local demo data</button><button className="btn btn-secondary" onClick={()=>setConfirmReset(false)}>Cancel</button></div>}</div>
   </>)}
  </div>
  <footer className="settings-footer"><p role="status">{notice||'Changes stay in this browser. No production services are connected.'}</p><div><button className="btn btn-secondary" disabled={busy} onClick={async()=>{setBusy(true);try{await logout();openSettings(false);}catch{setNotice('Could not sign out. Please try again.');}finally{setBusy(false);}}}><LogOut size={15}/>Sign Out (Demo)</button><button className="btn btn-primary" onClick={()=>openSettings(false)}>Done</button></div></footer>
 </div></div>;
};
