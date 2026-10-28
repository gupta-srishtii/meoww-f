import React, {lazy, Suspense, useCallback, useEffect, useRef, useState} from 'react';
import {ArrowDown, ArrowRight, ArrowUpRight, BookOpen, Check, HeartPulse, MessageCircle, Pause, Play, Shield, Sparkles, Users, Wind, X} from 'lucide-react';
import {useNavigationStore} from '../../store/useNavigationStore';
import {useAuthStore} from '../../store/useAuthStore';
import {useThemeStore} from '../../store/useThemeStore';
import {WORLD_CONFIGS, WorldId} from '../../types/world';
import {useDialog} from '../../components/common/useDialog';
import './entry.css';

const SanctuaryIntroScene = lazy(() => import('./SanctuaryIntroScene'));
const loop = [
  {name:'Sense',word:'Start by noticing.',copy:'Choose a mood check-in. In this frontend, your own words and choices are the starting point.',detail:'Camera-based emotion, posture and voice-tone sensing belong to the original product architecture. They are not running in this demo.',Icon:HeartPulse},
  {name:'Adapt',word:'Make the space yours.',copy:'Choose a world, an interface palette and the amount of movement that feels comfortable.',detail:'Six working worlds and eight separate interface themes. No emotional state is inferred or used to change your space without your choice.',Icon:Sparkles},
  {name:'Guide',word:'Find a gentler rhythm.',copy:'Take a breathing pause, settle into a focus session or follow a guided yoga routine.',detail:'Timers and guided steps work here. The illustrated yoga guide is a reference, not a live posture assessment.',Icon:Wind},
  {name:'Record',word:'Notice the small things.',copy:'Save a reflection, mark a habit or look back on the moments you chose to keep.',detail:'Your reflections, check-ins and practice milestones stay in this browser. Health trends are clearly marked sample data.',Icon:BookOpen},
];
const experiences = [
  {id:'companion',title:'AI Companion',label:'A little company',copy:'A conversation when you want one. Type, try browser dictation, or read a demo reply aloud.',Icon:MessageCircle},
  {id:'yoga',title:'Yoga Studio',label:'Room to move',copy:'Choose a routine, rotate the illustrated pose guide and follow a timed sequence at your pace.',Icon:Wind},
  {id:'rhythm',title:'Daily Rhythm',label:'Small steps count',copy:'A check-in, a habit, a page of reflection. Keep what is useful and leave the rest.',Icon:BookOpen},
  {id:'health',title:'Health',label:'See the bigger picture',copy:'Explore sample trends and a simulated ECG. No real biosensor is connected in this frontend.',Icon:HeartPulse},
  {id:'circle',title:'Maitri Circle',label:'A sense of connection',copy:'Explore local demo conversations, circles and challenges. Nothing is posted to a real community.',Icon:Users},
  {id:'sanctuary',title:'Wellness Sanctuary',label:'A pause that belongs to you',copy:'Breathing, focus and a garden of moments you complete. No streak penalties, no rush.',Icon:Sparkles},
];

export const LandingView = () => {
  const {openAuthModal,openDisclaimer,isAuthModalOpen,setTab} = useNavigationStore();
  const {isAuthenticated} = useAuthStore();
  const motion = useThemeStore(s => s.motion);
  const setWorld = useThemeStore(s => s.setWorld);
  const [reduced,setReduced] = useState(() => matchMedia('(prefers-reduced-motion: reduce)').matches);
  const [introDone,setIntroDone] = useState(false);
  const [sceneReady,setSceneReady] = useState(false);
  const [visible,setVisible] = useState(true);
  const [pageVisible,setPageVisible] = useState(!document.hidden);
  const [loopStep,setLoopStep] = useState(0);
  const [experience,setExperience] = useState(0);
  const [preview,setPreview] = useState<WorldId|null>(null);
  const [previewStatus,setPreviewStatus] = useState('');
  const [demoMood,setDemoMood] = useState('Steady');
  const [breathing,setBreathing] = useState(false);
  const [seconds,setSeconds] = useState(0);
  const hero = useRef<HTMLElement>(null);
  const cta = useRef<HTMLButtonElement>(null);
  const dialog = useDialog(!!preview, () => setPreview(null));
  const still = reduced || motion === 'none';
  const ready = useCallback(() => setSceneReady(true), []);
  useEffect(() => {
    const query = matchMedia('(prefers-reduced-motion: reduce)');
    const change = () => setReduced(query.matches); query.addEventListener('change',change);
    const visibility = () => setPageVisible(!document.hidden); document.addEventListener('visibilitychange',visibility);
    const observer = new IntersectionObserver(entries => setVisible(entries[0]?.isIntersecting ?? true));
    if (hero.current) observer.observe(hero.current);
    return () => {query.removeEventListener('change',change);document.removeEventListener('visibilitychange',visibility);observer.disconnect();};
  },[]);
  useEffect(() => {const timer = setTimeout(() => setIntroDone(true),2400);return () => clearTimeout(timer);},[]);
  useEffect(() => {
    if (!breathing) return;
    const start = Date.now() - seconds * 1000;
    const timer = setInterval(() => {const elapsed = Math.min(30,Math.floor((Date.now()-start)/1000));setSeconds(elapsed);if (elapsed >= 30) setBreathing(false);},200);
    return () => clearInterval(timer);
  },[breathing]);
  const current = experiences[experience];
  const stage = loop[loopStep];
  const expandedWorld = preview ? WORLD_CONFIGS[preview] : null;

  return <div className="landing cinematic-landing" data-intro-complete={introDone || still}>
    <section ref={hero} className="cinematic-intro" aria-labelledby="intro-title">
      <div className="intro-atmosphere" aria-hidden="true"/>
      <div className="intro-copy">
        <div className="intro-symbol"><img src="/assets/logo.png" alt="MAITRI" className="intro-logo-png"/><span>MAITRI</span></div>
        <span className="eyebrow intro-kicker">A SANCTUARY FOR YOUR EVERYDAY</span>
        <h1 id="intro-title"><span>Your space to feel,</span><span>reflect, and</span><em>begin again.</em></h1>
        <p className="intro-support">A thoughtful companion. A moment of movement. A place for your words. Build a wellness workspace around the way you feel today.</p>
        <div className="intro-actions"><button ref={cta} className="btn btn-primary" onClick={() => isAuthenticated ? setTab('home') : openAuthModal(true,'signup')}>{isAuthenticated ? 'Enter Sanctuary' : 'Find your sanctuary'} <ArrowUpRight size={18}/></button><a className="text-button" href="#about-maitri">Meet MAITRI <ArrowDown size={15}/></a></div>
        <span className="intro-caption">An interactive frontend demo. Your pace, always.</span>
      </div>
      <div className="intro-universe" role="img" aria-label="A luminous three-dimensional sanctuary portal surrounding the original MAITRI companion">
        {still ? <div className="intro-portal-fallback"><span/><span/></div> : <Suspense fallback={<div className="intro-portal-fallback"><span/><span/></div>}><SanctuaryIntroScene active={visible && pageVisible && !preview && !isAuthModalOpen} onReady={ready}/></Suspense>}
        <img className="intro-mascot" src="/assets/companion-avatar.webp" alt="" draggable={false}/>
        <span className="universe-caption">A LITTLE LIGHT. A LITTLE COMPANY.</span>
        {!sceneReady && !still && <span className="sr-only" role="status">Preparing the sanctuary scene.</span>}
      </div>
      {!introDone && !still && <button className="intro-skip" onClick={() => {setIntroDone(true);cta.current?.focus();}}>Skip introduction <ArrowRight size={14}/></button>}
      <a className="intro-scroll" href="#about-maitri" aria-label="Explore the MAITRI story"><ArrowDown size={17}/></a>
    </section>

    <section id="about-maitri" className="meet-maitri">
      <div className="meet-illustration" aria-hidden="true"><div className="meet-rings"/><img src="/assets/companion-avatar.webp" alt=""/><span>Always at your pace.</span></div>
      <div><span className="eyebrow">01 / MEET MAITRI</span><h2>A little more space<br/>for <em>being human.</em></h2><p>MAITRI is an adaptive wellness workspace, built around the moments between deep work and daily life. Your companion, your surroundings and your practices share one quiet purpose: helping you make space to notice how you are doing.</p><p>Here, you can try guided movement, keep a reflection and explore a supportive companion conversation. The companion replies are scripted demos, not a connected AI service or professional care.</p><button className="text-button" onClick={() => {setExperience(0);document.getElementById('wellness-workspace')?.scrollIntoView({behavior:still?'instant':'smooth'});}}>See what a moment here looks like <ArrowUpRight size={16}/></button></div>
    </section>

    <section className="product-loop" aria-labelledby="loop-title"><div className="section-heading"><div><span className="eyebrow">02 / HOW MAITRI WORKS</span><h2 id="loop-title">A rhythm to return to.</h2></div><p>Four connected ideas.<br/>One gentle, ongoing practice.</p></div>
      <div className="loop-navigation" role="tablist" aria-label="The MAITRI product loop">{loop.map(({name,Icon},i) => <button role="tab" id={'loop-tab-'+i} aria-controls="loop-panel" aria-selected={i===loopStep} tabIndex={i===loopStep?0:-1} key={name} onClick={() => setLoopStep(i)} onKeyDown={event => {if (event.key==='ArrowRight'||event.key==='ArrowLeft') {event.preventDefault();const next=(i+(event.key==='ArrowRight'?1:3))%4;setLoopStep(next);document.getElementById('loop-tab-'+next)?.focus();}}}><span>0{i+1}</span><Icon size={23}/><strong>{name}</strong>{i<3&&<ArrowRight className="loop-arrow" size={16}/>}</button>)}</div>
      <div id="loop-panel" role="tabpanel" aria-labelledby={'loop-tab-'+loopStep} className="loop-panel" key={loopStep}><stage.Icon size={32}/><div><h3>{stage.word}</h3><p>{stage.copy}</p><small>{stage.detail}</small></div></div>
    </section>

    <section id="explore-worlds" className="landing-worlds public-worlds"><div className="section-heading"><div><span className="eyebrow">03 / EXPLORE YOUR WORLDS</span><h2>Somewhere you can exhale.</h2></div><p>Six atmospheres, open to explore.<br/>Interface themes are a separate choice.</p></div><div className="public-world-grid">{Object.values(WORLD_CONFIGS).map((world,i) => <button key={world.id} className="public-world-card" onClick={() => {setPreview(world.id);setPreviewStatus('');}} aria-label={'Preview '+world.name}><img src={world.backgroundImg} alt="" loading="lazy"/><span className="world-card-number">0{i+1}</span><div><strong>{world.name}</strong><p>{world.tagline}</p><span>Step inside <ArrowUpRight size={15}/></span></div></button>)}</div></section>

    <section id="wellness-workspace" className="workspace-showcase"><div className="section-heading"><div><span className="eyebrow">04 / YOUR WELLNESS WORKSPACE</span><h2>Make a little room.</h2></div><p>Explore the things that feel useful to you.<br/>There is no perfect way to begin.</p></div><div className="showcase-layout"><div className="showcase-tabs" role="tablist" aria-label="Wellness experiences">{experiences.map(({title,Icon},i) => <button role="tab" aria-selected={experience===i} aria-controls="experience-demo" id={'experience-tab-'+i} key={title} tabIndex={i===experience?0:-1} onClick={() => setExperience(i)} onKeyDown={event => {if (event.key==='ArrowDown'||event.key==='ArrowUp') {event.preventDefault();const next=(i+(event.key==='ArrowDown'?1:5))%6;setExperience(next);document.getElementById('experience-tab-'+next)?.focus();}}}><Icon size={20}/>{title}<ArrowUpRight size={15}/></button>)}</div><div className="showcase-stage" id="experience-demo" role="tabpanel" aria-labelledby={'experience-tab-'+experience}>
        <span className="eyebrow">{current.label}</span><h3>{current.title}</h3><p>{current.copy}</p>
        {experience===0&&<div className="conversation-preview"><span>Illustrative conversation</span><p className="preview-user">There is a lot on my mind today.</p><p className="preview-companion">We can take one small thing at a time. Would a quiet pause or a few words in your journal feel useful?</p></div>}
        {experience===1&&<div className="movement-preview"><Wind size={46}/><div><strong>Mountain pose</strong><p>Stand comfortably. Let your arms rest. Take a steady breath.</p><small>Illustrated guidance and timed steps in the workspace.</small></div></div>}
        {experience===2&&<div className="public-mood-demo"><span>Try a check-in preview</span><div>{['Cloudy','Steady','Bright'].map(mood => <button key={mood} aria-pressed={demoMood===mood} onClick={() => setDemoMood(mood)}>{demoMood===mood&&<Check size={14}/>} {mood}</button>)}</div><p role="status">{demoMood}. Every feeling has a place here. This preview is not saved.</p></div>}
        {experience===3&&<div className="telemetry-preview"><span>SIMULATED PATTERN / NOT A MEASUREMENT</span><svg viewBox="0 0 420 95" role="img" aria-label="Illustrative ECG waveform"><path d="M0 58 H45 L52 46 59 58 H88 L95 67 102 18 109 80 116 58 H155 L162 46 169 58 H198 L205 67 212 18 219 80 226 58 H265 L272 46 279 58 H308 L315 67 322 18 329 80 336 58 H420"/></svg></div>}
        {experience===4&&<div className="circle-preview"><Users size={32}/><p>â€œA small walk between meetings. That was enough for today.â€</p><small>A fictional example from the local community demo.</small></div>}
        {experience===5&&<div className="public-breath-demo"><div className="public-breath-orb" data-breathing={breathing}>{seconds>=30?'A moment for you':!breathing?'Take a breath':seconds%10<4?'Breathe in':'Breathe out'}</div><div><strong>{seconds>=30?'Your pause is complete.':`${30-seconds} seconds of space`}</strong><button className="btn btn-secondary" onClick={() => {if(seconds>=30)setSeconds(0);setBreathing(!breathing);}}>{breathing?<Pause size={15}/>:<Play size={15}/>} {breathing?'Pause':seconds>=30?'Begin again':seconds?'Continue':'Try a breathing pause'}</button><small>Follow your own comfortable rhythm. This public preview is not saved.</small></div></div>}
        <button className="text-button" onClick={() => isAuthenticated ? setTab('home') : openAuthModal(true,'signup')}>{isAuthenticated ? 'Return to sanctuary' : 'Explore in your sanctuary'} <ArrowUpRight size={16}/></button>
      </div></div></section>

    <section className="public-privacy"><div><Shield size={30}/><span className="eyebrow">05 / PRIVACY, SAFETY & TRANSPARENCY</span><h2>Your boundaries<br/>belong to you.</h2><button className="text-button" onClick={() => openDisclaimer(true)}>Read the AI safety note <ArrowUpRight size={16}/></button></div><div className="privacy-facts"><article><h3>Company, with clear limits.</h3><p>The companion is not a human or licensed medical professional. AI responses can be inaccurate; this demo uses scripted responses and is not emergency support.</p></article><article><h3>Permission comes first.</h3><p>Camera preview and local camera recording start only when you choose. This frontend does not run emotion detection, pose scoring or passive microphone sensing. Browser dictation may use your browser providerâ€™s online speech service.</p></article><article><h3>A transparent local demo.</h3><p>Reflections and preferences are stored in this browser, without journal encryption. Health readings, community profiles and appointments are simulations. No original MAITRI backend or production service is connected.</p></article></div></section>
    <section className="begin-journey"><span className="eyebrow">06 / BEGIN YOUR JOURNEY</span><h2>You do not have to do it all.<br/><em>Just begin where you are.</em></h2><p>One breath. One small step. A space that is yours.</p><div>{isAuthenticated ? <button className="btn btn-primary" onClick={() => setTab('home')}>Return to Sanctuary <ArrowUpRight size={17}/></button> : <><button className="btn btn-primary" onClick={() => openAuthModal(true,'signup')}>Sign Up for the demo <ArrowUpRight size={17}/></button><button className="btn btn-secondary" onClick={() => openAuthModal(true,'login')}>Log In</button></>}</div></section>
    <footer className="landing-footer">MAITRI <span>A little space for you.</span></footer>

    {expandedWorld&&<div className="modal-backdrop public-preview-backdrop" onClick={() => setPreview(null)}><div className="public-world-preview" ref={dialog} role="dialog" aria-modal="true" aria-labelledby="public-world-title" onClick={event => event.stopPropagation()}><div className="public-preview-image" style={{backgroundImage:`url(${expandedWorld.backgroundImg})`}}><button className="btn btn-icon" onClick={() => setPreview(null)} aria-label="Close world preview"><X size={19}/></button></div><div className="public-preview-copy"><span className="eyebrow">A PLACE TO MAKE YOUR OWN</span><h2 id="public-world-title">{expandedWorld.name}</h2><p>{expandedWorld.tagline}. Preview this atmosphere now, then choose a separate interface theme when you enter your workspace.</p><div><button className="btn btn-primary" onClick={() => {try {setWorld(expandedWorld.id);setPreviewStatus(expandedWorld.name+' is now your selected world.');} catch {setPreviewStatus('World changed for this visit. Browser storage is unavailable, so it could not be saved.');}}}><Check size={16}/> Use this world</button><button className="btn btn-secondary" onClick={() => setPreview(null)}>Keep exploring</button></div><p role="status">{previewStatus}</p></div></div></div>}
  </div>;
};

