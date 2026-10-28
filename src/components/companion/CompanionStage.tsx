import React, {useEffect,useRef,useState} from 'react';
import {createPortal} from 'react-dom';
import {useCompanionStore} from '../../store/useCompanionStore';
import {useThemeStore} from '../../store/useThemeStore';
import {useNavigationStore} from '../../store/useNavigationStore';
import './companion-motion.css';

/** A single original mascot: Home following is presentation-only, never sensor tracking. */
export const LivingCompanion:React.FC<{compact?:boolean;home?:boolean}>=({compact=false,home=false})=>{
 const {moodState,setMoodState,setDrawerOpen,drawerOpen}=useCompanionStore();const theme=useThemeStore();const nav=useNavigationStore();
 const anchor=useRef<HTMLDivElement>(null),floating=useRef<HTMLDivElement>(null);
 const point=useRef({x:0,y:0,tx:0,ty:0,vx:0,vy:0,ready:false});
 const [fine,setFine]=useState(false),[reduced,setReduced]=useState(false),[quiet,setQuiet]=useState(false),[modal,setModal]=useState(false),[escaped,setEscaped]=useState(false),[visible,setVisible]=useState(true);
 const paused=reduced||theme.motion==='none'||theme.companionMotion==='still';
 const blocked=drawerOpen||nav.currentTab!=='home'||nav.isSettingsOpen||nav.isWorldSelectorOpen||nav.isSosOpen||nav.isAuthModalOpen||nav.isAdminOpen||nav.isDisclaimerOpen||modal;
 const following=home&&fine&&theme.cursorFollow&&!paused&&!blocked&&!quiet&&!escaped;
 useEffect(()=>{const mouse=matchMedia('(hover: hover) and (pointer: fine)'),motion=matchMedia('(prefers-reduced-motion: reduce)');const update=()=>{setFine(mouse.matches);setReduced(motion.matches);};update();mouse.addEventListener('change',update);motion.addEventListener('change',update);return()=>{mouse.removeEventListener('change',update);motion.removeEventListener('change',update);};},[]);
 useEffect(()=>{if(theme.cursorFollow)setEscaped(false);},[theme.cursorFollow]);
 useEffect(()=>{
  const update=()=>{setQuiet(document.hidden||!!document.activeElement?.closest('input,textarea,select,[contenteditable="true"]'));setModal(!!document.querySelector('[role="dialog"]')||document.documentElement.dataset.focus==='true');};
  const escape=(e:KeyboardEvent)=>{if(e.key==='Escape')setEscaped(true);};
  const observer=new MutationObserver(update);observer.observe(document.body,{childList:true,subtree:true});observer.observe(document.documentElement,{attributes:true,attributeFilter:['data-focus']});
  document.addEventListener('focusin',update);document.addEventListener('focusout',update);document.addEventListener('visibilitychange',update);document.addEventListener('keydown',escape);update();
  return()=>{observer.disconnect();document.removeEventListener('focusin',update);document.removeEventListener('focusout',update);document.removeEventListener('visibilitychange',update);document.removeEventListener('keydown',escape);};
 },[]);
 useEffect(()=>{
  if(!home)return;let frame=0,previous=0,pointerFrame=0;const size=82;
  const clamp=(x:number,y:number)=>({x:Math.max(10,Math.min(innerWidth-size-10,x)),y:Math.max(100,Math.min(innerHeight-size-12,y))});
  const paint=()=>{const p=point.current;if(floating.current)floating.current.style.transform=`translate3d(${p.x}px,${p.y}px,0) rotate(${following?Math.max(-5,Math.min(5,p.vx*.3)):0}deg)`;};
  const animate=(time:number)=>{const dt=Math.min(2,(time-previous)/16.67||1);previous=time;const p=point.current;p.vx=(p.vx+(p.tx-p.x)*.035*dt)*Math.pow(.76,dt);p.vy=(p.vy+(p.ty-p.y)*.035*dt)*Math.pow(.76,dt);const next=clamp(p.x+p.vx*dt,p.y+p.vy*dt);p.x=next.x;p.y=next.y;paint();if(Math.abs(p.tx-p.x)+Math.abs(p.ty-p.y)+Math.abs(p.vx)+Math.abs(p.vy)>.4)frame=requestAnimationFrame(animate);else{frame=0;p.x=p.tx;p.y=p.ty;paint();}};
  const start=()=>{if(!frame){previous=0;frame=requestAnimationFrame(animate);}};
  const rest=()=>{const r=anchor.current?.getBoundingClientRect();if(!r)return;setVisible(r.top>=90&&r.bottom<innerHeight+10);const next=clamp(r.left,r.top);Object.assign(point.current,{tx:next.x,ty:next.y});if(!point.current.ready||paused||quiet||blocked){Object.assign(point.current,{x:next.x,y:next.y,vx:0,vy:0,ready:true});paint();}else start();};
  const move=(e:PointerEvent)=>{if(!following||e.pointerType!=='mouse')return;cancelAnimationFrame(pointerFrame);pointerFrame=requestAnimationFrame(()=>{
   const obstacles=[...document.querySelectorAll('nav,button,a,input,textarea,select,[role="dialog"],.world-hero-copy,h1,h2')].filter(n=>!n.closest('.home-floating-companion')).map(n=>n.getBoundingClientRect()).filter(r=>r.width&&r.height&&r.bottom>0&&r.top<innerHeight);
   const candidates=[[e.clientX+42,e.clientY+34],[e.clientX-size-42,e.clientY+34],[e.clientX+42,e.clientY-size-34],[e.clientX-size-42,e.clientY-size-34]].map(([x,y])=>clamp(x,y));
   const next=candidates.find(c=>!obstacles.some(r=>c.x<r.right+8&&c.x+size>r.left-8&&c.y<r.bottom+8&&c.y+size>r.top-8));
   if(next){point.current.tx=next.x;point.current.ty=next.y;setVisible(true);start();}else rest();
  });};
  rest();window.addEventListener('pointermove',move,{passive:true});window.addEventListener('resize',rest);window.addEventListener('scroll',rest,{passive:true});document.documentElement.addEventListener('pointerleave',rest);const observer=new ResizeObserver(rest);if(anchor.current)observer.observe(anchor.current);
  return()=>{cancelAnimationFrame(frame);cancelAnimationFrame(pointerFrame);observer.disconnect();window.removeEventListener('pointermove',move);window.removeEventListener('resize',rest);window.removeEventListener('scroll',rest);document.documentElement.removeEventListener('pointerleave',rest);};
 },[home,following,paused,quiet,blocked]);
 const state=(quiet||paused)&&['idle','curious','wandering'].includes(moodState)?'resting':moodState;
 const avatar=<button className="companion-character" aria-label={`Chat with ${theme.companionNickname||'MAITRI'}`} tabIndex={home&&(!visible||blocked)?-1:0} onClick={()=>{useCompanionStore.getState().celebrate();setDrawerOpen(true);}} onPointerEnter={()=>{if(moodState==='idle')setMoodState('curious');}} onPointerLeave={()=>{if(moodState==='curious')setMoodState('idle');}}><img src="/assets/companion-avatar.webp" alt="" draggable={false}/></button>;
 if(!home)return <div className={'living-companion '+(compact?'compact':'')} data-state={state} data-paused={paused||quiet}>{avatar}</div>;
 return <><div ref={anchor} className="home-companion-anchor" aria-hidden="true"/>{createPortal(<div ref={floating} className="living-companion home-floating-companion" data-state={state} data-following={following} data-paused={paused||quiet||blocked} data-visible={visible&&!blocked} data-aura={theme.backgroundScope==='companion'}>{avatar}</div>,document.body)}</>;
};
