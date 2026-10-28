import React, {useEffect, useState} from 'react';
import {X, Check, RotateCcw, Volume2, ArrowUpRight} from 'lucide-react';
import {useThemeStore, THEMES, Preferences, ThemeId, getPreferences} from '../../store/useThemeStore';
import {useNavigationStore} from '../../store/useNavigationStore';
import {WORLD_CONFIGS, WorldId} from '../../types/world';
import {useCompanionStore} from '../../store/useCompanionStore';
import {useDialog} from '../common/useDialog';
import '../settings/settings.css';

/** Shared by Settings, the compact selector and Theme Studio. */
export function WorldChoices({value, onChange, compact=false}:{value:WorldId;onChange:(id:WorldId)=>void;compact?:boolean}) {
 return <div className={'world-grid sanctuary-world-choices'+(compact?' compact-world-choices':'')}>
  {Object.values(WORLD_CONFIGS).map(world=><button type="button" key={world.id} className={'world-choice '+(value===world.id?'selected':'')} aria-pressed={value===world.id} onClick={()=>onChange(world.id)}>
   <span className="world-image-wrap"><img src={world.backgroundImg} alt="" loading="lazy"/>{value===world.id&&<span className="world-selected-mark"><Check size={14}/><span className="sr-only">Selected</span></span>}</span>
   <strong>{world.id==='focus'?'Deep Focus Workspace':world.name}</strong><small>{world.tagline}</small>
  </button>)}
 </div>;
}

export function ThemeChoices({value,onChange}:{value:ThemeId;onChange:(id:ThemeId)=>void}) {
 return <div className="theme-grid">{THEMES.map(theme=><button type="button" key={theme.id} aria-pressed={value===theme.id} className={'theme-choice '+(value===theme.id?'selected':'')} onClick={()=>onChange(theme.id)}>
  <div className="palette-preview" style={{background:theme.bg,color:theme.text}}><span style={{background:theme.surface}}>Aa</span><i style={{background:theme.accent}}/><i style={{background:theme.highlight}}/>{value===theme.id&&<Check size={16}/>}</div>
  <strong>{theme.name}</strong><small>{theme.description}</small>
 </button>)}</div>;
}

export const WorldSelectorModal=()=>{
 const {isWorldSelectorOpen,worldSelectorMode}=useNavigationStore();
 if(!isWorldSelectorOpen)return null;
 return worldSelectorMode==='worlds'?<WorldPopover/>:<ThemeStudio/>;
};

function WorldPopover(){
 const saved=useThemeStore();const {activeWorld,setWorld}=saved;
 const [previewMode,setPreviewMode]=useState(false);const [candidate,setCandidate]=useState(activeWorld);
 useEffect(()=>{saved.setPreview(previewMode?{preferences:getPreferences(saved),world:candidate}:null);},[candidate,previewMode]);
 useEffect(()=>()=>useThemeStore.getState().setPreview(null),[]);
 const [error,setError]=useState('');
 const close=()=>useNavigationStore.getState().openWorldSelector(false,'worlds');
 const dialog=useDialog(true,close);
 return <div className="world-popover-backdrop" onClick={close}>
  <div ref={dialog} role="dialog" aria-modal="true" aria-labelledby="world-popover-title" id="world-popover" className="world-popover" onClick={event=>event.stopPropagation()} onKeyDown={event=>{
   if(!['ArrowRight','ArrowLeft','ArrowDown','ArrowUp','Home','End'].includes(event.key))return;
   const buttons=Array.from(event.currentTarget.querySelectorAll<HTMLButtonElement>('.world-choice'));const index=buttons.indexOf(document.activeElement as HTMLButtonElement);if(index<0)return;
   event.preventDefault();const delta=event.key==='ArrowLeft'?-1:event.key==='ArrowUp'?-2:event.key==='ArrowDown'?2:1;
   buttons[event.key==='Home'?0:event.key==='End'?buttons.length-1:(index+delta+buttons.length)%buttons.length]?.focus();
  }}>
   <header><div><h2 id="world-popover-title">Choose your world</h2></div><button className="btn btn-icon btn-secondary" aria-label="Close world selector" onClick={close}><X size={18}/></button></header>
   <p>Keep your palette. Change the atmosphere.</p>
   <WorldChoices value={previewMode?candidate:activeWorld} compact onChange={id=>{if(previewMode){setCandidate(id);return;}try{setWorld(id);useCompanionStore.getState().celebrate();close();}catch{setError('The world changed for this visit, but browser storage is unavailable.');}}}/>
   <div className="world-preview-actions"><label><input type="checkbox" checked={previewMode} onChange={event=>{setCandidate(activeWorld);setPreviewMode(event.target.checked);}}/> Preview before applying</label>{previewMode&&<><p role="status">Previewing {WORLD_CONFIGS[candidate].name}. Your saved world is unchanged.</p><button className="btn btn-primary" onClick={()=>{try{setWorld(candidate);saved.setPreview(null);close();}catch{setError('Applied for this visit; browser storage is unavailable.');}}}>Apply world</button><button className="btn btn-secondary" onClick={close}>Cancel preview</button></>}</div>
   {error&&<p role="status">{error}</p>}
  </div>
 </div>;
}

function ThemeStudio(){
 const saved=useThemeStore();
 const close=()=>useNavigationStore.getState().openWorldSelector(false);
 const [draft,setDraft]=useState<Preferences>(()=>getPreferences(saved));
 const [world,setWorld]=useState<WorldId>(saved.activeWorld);
 const [preview,setPreview]=useState(false);const [notice,setNotice]=useState('');
 const dialog=useDialog(true,close);
 useEffect(()=>{saved.setPreview(preview?{preferences:draft,world}:null);},[draft,world,preview]);
 useEffect(()=>()=>useThemeStore.getState().setPreview(null),[]);
 const patch=(value:Partial<Preferences>)=>setDraft(previous=>({...previous,...value}));
 return <div className="modal-backdrop" onClick={close}><div ref={dialog} role="dialog" aria-modal="true" aria-labelledby="studio-title" className="modal-dialog theme-studio" onClick={event=>event.stopPropagation()}>
  <header className="studio-header"><div><span className="eyebrow">MAKE YOURSELF AT HOME</span><h2 id="studio-title">Theme Studio</h2><p>Your world. Your atmosphere. Your pace.</p></div><button className="btn btn-icon btn-secondary" aria-label="Close Theme Studio" onClick={close}><X size={20}/></button></header>
  <div className="studio-body"><h3>01 / Choose your palette</h3><p>Interface themes stay independent of your world.</p><ThemeChoices value={draft.theme} onChange={theme=>patch({theme,accent:''})}/>
   <h3>02 / Step into a world</h3><WorldChoices value={world} onChange={setWorld}/>
   <h3>03 / Find your balance</h3><div className="preference-grid">
    <label>Custom accent<input type="color" value={draft.accent||THEMES.find(theme=>theme.id===draft.theme)!.accent} onChange={event=>patch({accent:event.target.value})}/></label>
    <label>Motion intensity<select value={draft.motion} onChange={event=>patch({motion:event.target.value as Preferences['motion']})}><option value="none">Still</option><option value="gentle">Gentle</option><option value="full">Expressive</option></select></label>
    <label>Dashboard arrangement<select value={draft.arrangement} onChange={event=>patch({arrangement:event.target.value as Preferences['arrangement']})}><option value="practice">Practice first</option><option value="reflection">Reflection first</option></select></label>
    <label>Atmosphere strength<input aria-label="Atmosphere strength" type="range" min="0" max=".25" step=".01" value={draft.atmosphere} onChange={event=>patch({atmosphere:Number(event.target.value)})}/></label>
    <label>World background<select value={draft.backgroundScope} onChange={event=>patch({backgroundScope:event.target.value as Preferences['backgroundScope']})}><option value="viewport">Full viewport atmosphere</option><option value="companion">Focused companion glow</option><option value="off">Plain background</option></select></label>
    {world==='custom'&&<><label>Custom background<select value={draft.customBackground} onChange={event=>patch({customBackground:event.target.value as WorldId})}>{Object.values(WORLD_CONFIGS).map(config=><option key={config.id} value={config.id}>{config.name}</option>)}</select></label><label>Custom tone frequency (Hz)<input type="range" min="80" max="600" step="1" value={draft.customFrequency} onChange={event=>patch({customFrequency:Number(event.target.value)})}/><output>{draft.customFrequency}</output></label></>}
    <label>Background movement<input type="checkbox" checked={draft.backgroundAnimation} onChange={event=>patch({backgroundAnimation:event.target.checked})}/></label>
    <label>Ambient details<input type="checkbox" checked={draft.ambientEffects} onChange={event=>patch({ambientEffects:event.target.checked})}/></label>
    <label><Volume2 size={16}/> Ambient tone (live)<input type="checkbox" checked={saved.soundEnabled} onChange={saved.toggleSound}/></label>
    <label>Sound volume<input aria-label="Sound volume" type="range" min="0" max="1" step=".05" value={saved.volume} onChange={event=>saved.setVolume(Number(event.target.value))}/></label>
   </div><p className="settings-note">Preview changes are temporary until you apply. Audio controls take effect immediately; playback starts only after you choose it.</p>
   <p role="status" className="settings-status">{notice}</p>
  </div>
  <footer className="studio-footer"><button className="btn btn-secondary" onClick={()=>{try{saved.reset();setDraft(getPreferences(useThemeStore.getState()));setWorld('forest');setPreview(false);setNotice('Default preferences restored.');}catch{setNotice('Defaults restored for this visit; browser storage is unavailable.');}}}><RotateCcw size={14}/>Reset</button><label><input type="checkbox" checked={preview} onChange={event=>setPreview(event.target.checked)}/> Preview on page</label><button className="btn btn-primary" onClick={()=>{try{saved.update(draft);saved.setWorld(world);useCompanionStore.getState().celebrate();saved.setPreview(null);close();}catch{setNotice('Your changes apply for this visit, but could not be saved to this browser.');}}}>Apply sanctuary</button></footer>
 </div></div>;
}
