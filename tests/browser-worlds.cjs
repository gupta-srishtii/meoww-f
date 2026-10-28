// World ecosystem regression checks in an isolated context; no existing browser data is touched.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const pause = (ms=150) => new Promise(resolve=>setTimeout(resolve,ms));
async function connect(url) {
 const socket=new WebSocket(url);await new Promise(resolve=>socket.addEventListener('open',resolve,{once:true}));
 let id=0;const pending=new Map();const errors=[];
 socket.addEventListener('message',event=>{const message=JSON.parse(event.data);if(message.id){const handler=pending.get(message.id);pending.delete(message.id);message.error?handler.reject(message.error):handler.resolve(message.result);}if(message.method==='Runtime.exceptionThrown')errors.push(message.params.exceptionDetails.exception?.description||message.params.exceptionDetails.text);});
 return {errors,close:()=>socket.close(),send:(method,params={})=>new Promise((resolve,reject)=>{pending.set(++id,{resolve,reject});socket.send(JSON.stringify({id,method,params}));})};
}
(async()=>{
 const base=process.env.MAITRI_QA_URL||'http://127.0.0.1:5173';const version=await(await fetch('http://127.0.0.1:9223/json/version')).json();const browser=await connect(version.webSocketDebuggerUrl);const {browserContextId}=await browser.send('Target.createBrowserContext');let page;
 try{
  const {targetId}=await browser.send('Target.createTarget',{url:'about:blank',browserContextId});const target=(await(await fetch('http://127.0.0.1:9223/json')).json()).find(t=>t.id===targetId);page=await connect(target.webSocketDebuggerUrl);const {send}=page;
  const run=async expression=>{const r=await send('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});if(r.exceptionDetails)throw Error(r.exceptionDetails.exception?.description||expression);return r.result.value;};
  const wait=async expression=>{for(let i=0;i<120;i++){if(await run(expression))return;await pause(100);}throw Error('Timed out: '+expression);};
  const click=async selector=>{await run(`document.querySelector(${JSON.stringify(selector)}).click()`);await pause();};
  const set=async(selector,value)=>{await run(`(()=>{const e=document.querySelector(${JSON.stringify(selector)});Object.getOwnPropertyDescriptor(e.tagName==='SELECT'?HTMLSelectElement.prototype:e.tagName==='TEXTAREA'?HTMLTextAreaElement.prototype:HTMLInputElement.prototype,'value').set.call(e,${JSON.stringify(value)});e.dispatchEvent(new Event(e.tagName==='SELECT'?'change':'input',{bubbles:true}));})()`);await pause();};
  const toggle=async key=>{await click('#settings-heading-'+key);await pause(450);};
  const key=async value=>{await send('Input.dispatchKeyEvent',{type:'keyDown',key:value,code:value,windowsVirtualKeyCode:value==='Escape'?27:9});await send('Input.dispatchKeyEvent',{type:'keyUp',key:value,code:value});await pause();};
  const shot=async name=>{await pause(500);const {data}=await send('Page.captureScreenshot',{format:'png'});const file=path.join(os.tmpdir(),name);fs.writeFileSync(file,Buffer.from(data,'base64'));console.log(file);};
  const open=async()=>{await click('[aria-label="Settings & Profile"]');await wait('!!document.querySelector(".settings-dialog")');};
  await send('Runtime.enable');await send('Page.enable');await send('Page.bringToFront');await send('Emulation.setDeviceMetricsOverride',{width:1440,height:1000,deviceScaleFactor:1,mobile:false});await send('Page.navigate',{url:base});await wait('!!document.querySelector(".public-nav-links")');
  await click('.public-nav-links .btn-primary');await set('#auth-email','settings@example.com');await set('#auth-password','made-up-settings');await click('.auth-submit');await wait('!!document.querySelector(".modal-dialog[aria-label^=AI]")');await click('.modal-dialog[aria-label^=AI] .btn-primary');

  await run("import(performance.getEntriesByType('resource').find(e=>new URL(e.name).pathname==='/src/store/useThemeStore.ts').name).then(module=>{window.worldStore=module.useThemeStore})");
  const worlds=['forest','space','zen','medical','focus','custom'];const themes=['ivory','velvet','kyoto','dream','aurora','ember','dune','mono'];
  let combinations=0;
  for(const width of [1440,390]){
   await send('Emulation.setDeviceMetricsOverride',{width,height:1000,deviceScaleFactor:1,mobile:width<800});
   for(const world of worlds){
    await run('worldStore.getState().setWorld('+JSON.stringify(world)+')');
    for(const theme of themes){
     await run('worldStore.getState().update({theme:'+JSON.stringify(theme)+'})');await wait('document.documentElement.dataset.theme==='+JSON.stringify(theme)+'&&document.body.dataset.world==='+JSON.stringify(world));
     assert.equal(await run('document.body.dataset.world'),world);assert.equal(await run('document.documentElement.dataset.theme'),theme);
     assert.equal(await run('document.querySelector(".cinematic-home-hero .world-atmosphere").dataset.scene'),world);
     assert.ok(await run('document.documentElement.scrollWidth<=innerWidth'));if(width<800)assert.ok(await run('[...document.querySelectorAll(".sanctuary-workspace-grid>section")].every(e=>e.getBoundingClientRect().width>300)'));
     assert.equal(await run('getComputedStyle(document.querySelector(".world-hero-copy h2")).opacity'),'1');
     assert.equal(await run('document.querySelectorAll("canvas").length'),0);combinations++;
    }
    await run('worldStore.getState().update({theme:'+JSON.stringify(width===1440?'ivory':'velvet')+'})');await shot('maitri-world-'+world+'-'+width+'.png');
   }
  }
  // Inspect the real sound graph: world changes reuse one bounded texture source.
  await send('Emulation.setDeviceMetricsOverride',{width:1440,height:1000,deviceScaleFactor:1,mobile:false});
  await run('window.qaFilters=[];window.qaSources=[];window.qaGains=[];for(const [method,key] of [["createBiquadFilter","qaFilters"],["createBufferSource","qaSources"],["createGain","qaGains"]]){const original=AudioContext.prototype[method];AudioContext.prototype[method]=function(){const node=original.call(this);window[key].push(node);return node}}');
  await click('#ambient-audio-trigger');const point=await run('(()=>{const r=document.querySelector(".audio-play-btn").getBoundingClientRect();return{x:r.x+r.width/2,y:r.y+r.height/2}})()');await send('Input.dispatchMouseEvent',{type:'mousePressed',button:'left',clickCount:1,...point});await send('Input.dispatchMouseEvent',{type:'mouseReleased',button:'left',clickCount:1,...point});await wait('window.qaFilters.length===1&&window.qaFilters[0].context.state==="running"');
  for(const [world,cutoff] of Object.entries({forest:850,space:160,zen:1400,medical:430,focus:260,custom:620})){await run('worldStore.getState().setWorld('+JSON.stringify(world)+')');await pause(4000);assert.ok(await run('Math.abs(window.qaFilters[0].frequency.value-'+cutoff+')<12'));}
  assert.equal(await run('window.qaSources.length'),1);assert.ok(await run('window.qaSources[0].buffer.duration===3&&window.qaSources[0].loop'));await run('worldStore.getState().setVolume(0)');await pause(2000);assert.ok(await run('window.qaGains.every(g=>g.gain.value<.001)'));await click('.audio-play-btn');await click('[aria-label="Close ambient panel"]');
  // Preview updates the environment without changing the saved world; Escape restores it.
  await send('Emulation.setDeviceMetricsOverride',{width:1440,height:1000,deviceScaleFactor:1,mobile:false});
  await run('worldStore.getState().setWorld("forest")');await click('#world-selector-trigger');await click('.world-preview-actions input');await click('.world-popover .world-choice:nth-child(2)');
  assert.equal(await run('document.body.dataset.world'),'space');assert.equal(await run('JSON.parse(localStorage.getItem("maitri-theme-studio")).state.activeWorld'),'forest');
  await key('Escape');assert.equal(await run('document.body.dataset.world'),'forest');
  await click('#world-selector-trigger');await click('.world-preview-actions input');await click('.world-popover .world-choice:nth-child(3)');await click('.world-preview-actions .btn-primary');assert.equal(await run('worldStore.getState().activeWorld'),'zen');
  // Custom draft is coherent across Home and page, then survives apply/reload.
  await run("import(performance.getEntriesByType('resource').find(e=>new URL(e.name).pathname==='/src/store/useNavigationStore.ts').name).then(module=>module.useNavigationStore.getState().openWorldSelector(true,'studio'))");await wait('!!document.querySelector(".theme-studio")');await click('.theme-studio .world-choice:nth-child(6)');
  await run('(()=>{const labels=[...document.querySelectorAll(".preference-grid label")];labels.find(l=>l.textContent.startsWith("Custom background")).querySelector("select").setAttribute("data-custom-background","");labels.find(l=>l.textContent.startsWith("Custom tone")).querySelector("input").setAttribute("data-custom-frequency","");})()');
  await set('[data-custom-background]','space');await set('[data-custom-frequency]','220');await click('.studio-footer input');assert.equal(await run('document.querySelector(".cinematic-home-hero .world-atmosphere").dataset.scene'),'space');assert.match(await run('document.querySelector("#home-world-selector-trigger").textContent'),/Custom Domain/);await click('.studio-footer .btn-primary');await send('Page.reload');await wait('!!document.querySelector(".sanctuary-home")');await run("import(performance.getEntriesByType('resource').find(e=>new URL(e.name).pathname==='/src/store/useThemeStore.ts').name).then(module=>{window.worldStore=module.useThemeStore})");assert.equal(await run('worldStore.getState().customFrequency'),220);assert.equal(await run('worldStore.getState().customBackground'),'space');
  // OS and explicit reduced motion stop every environmental animation.
  await send('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'reduce'}]});
  for(const world of worlds){await run('worldStore.getState().setWorld('+JSON.stringify(world)+')');await pause();assert.ok(await run('[...document.querySelectorAll(".world-atmosphere *")].every(e=>getComputedStyle(e).animationName==="none")'));}
  await send('Emulation.setEmulatedMedia',{features:[]});await run('worldStore.getState().update({motion:"none"})');await pause();assert.ok(await run('[...document.querySelectorAll(".world-atmosphere *")].every(e=>getComputedStyle(e).animationName==="none")'));
  await run('worldStore.getState().update({motion:"gentle",backgroundAnimation:false})');await pause();assert.ok(await run('[...document.querySelectorAll(".world-atmosphere *")].every(e=>getComputedStyle(e).animationName==="none")'));
  await run('worldStore.getState().update({backgroundAnimation:true,ambientEffects:false})');await pause();assert.equal(await run('getComputedStyle(document.querySelector(".world-atmosphere")).display'),'none');
  await run('worldStore.getState().update({ambientEffects:true});worldStore.getState().setWorld("forest")');await send('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:true});await pause(300);assert.ok(await run('[...document.querySelectorAll(".world-atmosphere")].every(e=>e.dataset.limited==="true"&&e.querySelectorAll(".environment-motes i").length<=5)'));
  await send('Emulation.setDeviceMetricsOverride',{width:1440,height:1000,deviceScaleFactor:1,mobile:false});await pause(200);await run('window.scrollTo(0,document.body.scrollHeight)');await pause(400);assert.equal(await run('document.querySelector(".world-atmosphere-hero").dataset.paused'),'true');
  await send('Emulation.setCPUThrottlingRate',{rate:4});await send('Page.addScriptToEvaluateOnNewDocument',{source:'Object.defineProperty(navigator,"hardwareConcurrency",{get:()=>2})'});await send('Page.reload');await pause(2500);await wait('!!document.querySelector(".world-atmosphere-hero[data-limited=true]")');assert.equal(await run('document.querySelectorAll(".world-atmosphere-hero .environment-motes i").length'),5);await send('Emulation.setCPUThrottlingRate',{rate:1});console.log('Low-performance fallback verified');
  assert.deepEqual(page.errors,[]);console.log(JSON.stringify({worldThemeLayoutCombinations:combinations,previewCancelApply:'passed',customPersistence:'passed',reducedMotion:'passed',mobileEffectBudget:'5 motes per layer',offscreenPause:'passed',newWebGLCanvases:0,audioTextures:'six cutoff transitions, mute and source reuse verified',lowPerformance:'2-core simulation at 4x CPU throttling passed',runtimeErrors:page.errors}));
 }finally{page?.close();await browser.send('Target.disposeBrowserContext',{browserContextId});browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
