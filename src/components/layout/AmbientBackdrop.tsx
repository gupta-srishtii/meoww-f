import React, {useEffect, useRef, useState} from 'react';
import {useThemeStore} from '../../store/useThemeStore';
import {WORLD_CONFIGS, WORLD_SOUNDS, WorldId} from '../../types/world';
const audioUpdate=(state:{audioStatus:string;soundEnabled?:boolean})=>{try{useThemeStore.setState(state);}catch{/* Audio status still applies in memory when persistence is unavailable. */}};
export const AmbientBackdrop: React.FC = () => {
 const theme=useThemeStore();const world=theme.preview?.world||theme.activeWorld;const preferences=theme.preview?.preferences||theme;const config=WORLD_CONFIGS[world==='custom'?preferences.customBackground:world];
 const textureRef=useRef<{source:AudioBufferSourceNode;filter:BiquadFilterNode;gain:GainNode}|null>(null);
 const [layers,setLayers]=useState([config.backgroundImg]);const ctxRef=useRef<AudioContext|null>(null);const voiceRef=useRef<OscillatorNode|null>(null);const gainRef=useRef<GainNode|null>(null);
 useEffect(()=>{setLayers(previous=>[previous[previous.length-1],config.backgroundImg]);const timeout=setTimeout(()=>setLayers([config.backgroundImg]),1000);return()=>clearTimeout(timeout);},[config.backgroundImg]);
 useEffect(()=>{
  if(!theme.soundEnabled)return;
  let active=true;
  let osc:OscillatorNode|undefined,gain:GainNode|undefined;
  try{const ctx=ctxRef.current?.state!=='closed'&&ctxRef.current?ctxRef.current:new AudioContext();ctxRef.current=ctx;
   audioUpdate({audioStatus:ctx.state==='running'?'Browser audio is running.':'Waiting for browser audio permission. Turn sound off and on to retry.'});
   void ctx.resume().then(()=>{if(active)audioUpdate({audioStatus:ctx.state==='running'?'Browser audio is running.':'Audio is suspended. Turn sound off and on to retry.'});}).catch(()=>{if(active)audioUpdate({soundEnabled:false,audioStatus:'Playback was blocked. Turn sound on to retry.'});});
   osc=ctx.createOscillator();gain=ctx.createGain();voiceRef.current=osc;gainRef.current=gain;osc.type=theme.soundPreset==='warm'||world==='space'?'triangle':'sine';osc.frequency.value=theme.soundPreset==='warm'?110:theme.soundPreset==='clear'?440:theme.droneFrequency;
   gain.gain.value=0;gain.gain.setValueAtTime(0,ctx.currentTime);gain.gain.linearRampToValueAtTime(theme.volume*.035,ctx.currentTime+.8);osc.connect(gain);gain.connect(ctx.destination);osc.start();
   const source=ctx.createBufferSource(),filter=ctx.createBiquadFilter(),textureGain=ctx.createGain();
   const buffer=ctx.createBuffer(1,ctx.sampleRate*3,ctx.sampleRate),samples=buffer.getChannelData(0);let seed=47,last=0;
   for(let i=0;i<samples.length;i++){seed=(seed*1664525+1013904223)>>>0;last=(last+.02*(seed/4294967296*2-1))/1.02;samples[i]=last*3.5;}
   source.buffer=buffer;source.loop=true;filter.type='lowpass';filter.Q.value=.5;filter.frequency.value=WORLD_SOUNDS[config.id].cutoff;textureGain.gain.value=0;
   source.connect(filter);filter.connect(textureGain);textureGain.connect(ctx.destination);source.start();textureRef.current={source,filter,gain:textureGain};
  }catch{audioUpdate({soundEnabled:false,audioStatus:'Browser audio is unavailable. Sound remains off.'});}
  return()=>{active=false;const texture=textureRef.current;textureRef.current=null;if(texture){texture.source.stop();texture.source.disconnect();texture.filter.disconnect();texture.gain.disconnect();}voiceRef.current=null;gainRef.current=null;const ctx=ctxRef.current;if(!ctx||ctx.state==='closed'||!osc||!gain)return;const voice=osc,level=gain;level.gain.cancelScheduledValues(ctx.currentTime);level.gain.setValueAtTime(level.gain.value,ctx.currentTime);level.gain.linearRampToValueAtTime(0,ctx.currentTime+.08);voice.stop(ctx.currentTime+.1);voice.onended=()=>{voice.disconnect();level.disconnect();};};
 },[theme.soundEnabled]);
 useEffect(()=>{const ctx=ctxRef.current,voice=voiceRef.current,level=gainRef.current;if(!ctx||!voice||!level)return;voice.type=theme.soundPreset==='warm'||(theme.soundPreset==='world'&&world==='space')?'triangle':'sine';const frequency=theme.soundPreset==='warm'?110:theme.soundPreset==='clear'?440:world==='custom'?preferences.customFrequency:config.droneFrequencyHz;voice.frequency.setTargetAtTime(frequency,ctx.currentTime,.25);const currentGain=level.gain.value;level.gain.cancelScheduledValues(ctx.currentTime);level.gain.setValueAtTime(currentGain,ctx.currentTime);level.gain.setTargetAtTime(theme.volume*.035,ctx.currentTime,.08);const texture=textureRef.current;if(texture){texture.filter.frequency.setTargetAtTime(WORLD_SOUNDS[config.id].cutoff,ctx.currentTime,.8);texture.gain.gain.setTargetAtTime(theme.soundPreset==='world'?theme.volume*WORLD_SOUNDS[config.id].texture:0,ctx.currentTime,.4);}},[theme.volume,theme.soundPreset,world,theme.soundEnabled,preferences.customFrequency,config.droneFrequencyHz,config.id]);
 useEffect(()=>()=>{void ctxRef.current?.close();},[]);
 return <div className="ambient-backdrop-container" data-environment={world} aria-hidden="true">
  {layers.map((src,i)=><div key={src+i} className={'ambient-backdrop-image '+(i===1?'world-arrival':'')} style={{backgroundImage:'url('+src+')'}}/>)}
  <WorldAtmosphere world={config.id}/>
 </div>;
};

/** One decorative environment renderer shared by Home and the workspace. */
export function WorldAtmosphere({world,hero=false}:{world:WorldId;hero?:boolean}) {
 const root=useRef<HTMLDivElement>(null);
 const theme=useThemeStore();const p=theme.preview?.preferences||theme;
 const [limited,setLimited]=useState(false);
 const [paused,setPaused]=useState(false);
 useEffect(()=>{
  const media=matchMedia('(prefers-reduced-motion: reduce), (max-width: 700px), (pointer: coarse)');
  const nav=navigator as Navigator & {deviceMemory?:number;connection?:{saveData?:boolean}};
  const update=()=>setLimited(media.matches||!!nav.connection?.saveData||(nav.hardwareConcurrency||8)<=4||(nav.deviceMemory||8)<=4);
  update();media.addEventListener('change',update);return()=>media.removeEventListener('change',update);
 },[]);
 useEffect(()=>{
  const node=root.current;if(!node)return;
  let visible=true;const update=()=>setPaused(document.hidden||!visible);
  const observer=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;update();});observer.observe(node);
  document.addEventListener('visibilitychange',update);update();
  return()=>{observer.disconnect();document.removeEventListener('visibilitychange',update);};
 },[]);
 useEffect(()=>{
  const node=root.current;if(!node)return;
  node.style.setProperty('--env-x','0px');node.style.setProperty('--env-y','0px');
  if(limited||paused||p.motion==='none'||!p.backgroundAnimation||!p.ambientEffects||world==='focus')return;
  let frame=0;
  const move=(event:PointerEvent)=>{if(event.pointerType!=='mouse')return;cancelAnimationFrame(frame);frame=requestAnimationFrame(()=>{node.style.setProperty('--env-x',((event.clientX/innerWidth-.5)*12)+'px');node.style.setProperty('--env-y',((event.clientY/innerHeight-.5)*8)+'px');});};
  const reset=()=>{node.style.setProperty('--env-x','0px');node.style.setProperty('--env-y','0px');};
  window.addEventListener('pointermove',move,{passive:true});document.documentElement.addEventListener('pointerleave',reset);
  return()=>{cancelAnimationFrame(frame);window.removeEventListener('pointermove',move);document.documentElement.removeEventListener('pointerleave',reset);};
 },[limited,paused,p.motion,p.backgroundAnimation,p.ambientEffects,world]);
 return <div ref={root} className={'world-atmosphere '+(hero?'world-atmosphere-hero':'world-atmosphere-page')} data-scene={world} data-limited={limited} data-paused={paused} aria-hidden="true">
  <div className="environment-light"/><div className="environment-depth"/><div className="environment-detail"/>
  <div className="environment-motes">{Array.from({length:limited?5:16},(_,i)=><i key={i} style={{'--seed':i,left:((i*37+13)%100)+'%',top:((i*19+7)%100)+'%',animationDelay:(-i*2.3)+'s'} as React.CSSProperties}/>)}</div>
 </div>;
}
