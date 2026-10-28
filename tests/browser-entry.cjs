// Public-entry regression checks, in an isolated browser context (no user's data).
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
 const base=process.env.MAITRI_QA_URL||'http://127.0.0.1:5173';
 const version=await(await fetch('http://127.0.0.1:9223/json/version')).json();
 const browser=await connect(version.webSocketDebuggerUrl);
 const {browserContextId}=await browser.send('Target.createBrowserContext');let page;
 try {
  const {targetId}=await browser.send('Target.createTarget',{url:'about:blank',browserContextId});
  const target=(await(await fetch('http://127.0.0.1:9223/json')).json()).find(item=>item.id===targetId);
  page=await connect(target.webSocketDebuggerUrl);const {send}=page;
  const run=async expression=>{const result=await send('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});if(result.exceptionDetails)throw Error(result.exceptionDetails.exception?.description||expression);return result.result.value;};
  const wait=async expression=>{for(let i=0;i<150;i++){if(await run(expression))return;await pause(100);}throw Error('Timed out: '+expression);};
  const click=async selector=>{await wait(`!!document.querySelector(${JSON.stringify(selector)})`);await run(`document.querySelector(${JSON.stringify(selector)}).scrollIntoView({block:'center',behavior:'instant'})`);await pause(350);const point=await run(`(()=>{const r=document.querySelector(${JSON.stringify(selector)}).getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2}})()`);await send('Input.dispatchMouseEvent',{type:'mousePressed',button:'left',clickCount:1,...point});await send('Input.dispatchMouseEvent',{type:'mouseReleased',button:'left',clickCount:1,...point});await pause();};
  const set=async(selector,value)=>{await run(`(()=>{const e=document.querySelector(${JSON.stringify(selector)});Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set.call(e,${JSON.stringify(value)});e.dispatchEvent(new Event('input',{bubbles:true}));})()`);await pause();};
  const key=async key=>{await send('Input.dispatchKeyEvent',{type:'keyDown',key,code:key,windowsVirtualKeyCode:key==='Escape'?27:9});await send('Input.dispatchKeyEvent',{type:'keyUp',key,code:key});await pause();};
  const screenshot=async name=>{await pause(400);const result=await send('Page.captureScreenshot',{format:'png'});const file=path.join(os.tmpdir(),name);fs.writeFileSync(file,Buffer.from(result.data,'base64'));console.log(file);};
  await send('Runtime.enable');await send('Page.enable');await send('Emulation.setDeviceMetricsOverride',{width:1440,height:1000,deviceScaleFactor:1,mobile:false});
  await send('Page.navigate',{url:base});await wait('!!document.querySelector(".intro-skip")');await click('.intro-skip');
  assert.equal(await run('document.querySelector(".cinematic-landing").dataset.introComplete'),'true');
  await wait('!!document.querySelector(".intro-universe canvas")');
  assert.equal(await run('document.querySelectorAll(".chat-launcher,.workspace-controls").length'),0);
  await run('window.scrollTo(0,0)');await pause(700);await screenshot('maitri-phase1-desktop.png');
  await click('.public-nav-links a[href="#about-maitri"]');assert.equal(await run('location.hash'),'#about-maitri');
  await click('.public-nav-links a[href="#explore-worlds"]');assert.equal(await run('location.hash'),'#explore-worlds');
  for(let i=1;i<=6;i++){await click(`.public-world-card:nth-child(${i})`);await wait('!!document.querySelector(".public-world-preview")');assert.ok(await run('document.querySelector("#public-world-title").textContent.length>0'));await key('Escape');assert.equal(await run('!!document.querySelector(".public-world-preview")'),false);}
  await click('#loop-tab-0');await send('Input.dispatchKeyEvent',{type:'keyDown',key:'ArrowRight',code:'ArrowRight',windowsVirtualKeyCode:39});await pause();assert.equal(await run('document.querySelector("#loop-tab-1").getAttribute("aria-selected")'),'true');
  await click('.public-privacy .text-button');await wait('!!document.querySelector(".modal-dialog[aria-label^=AI]")');await key('Escape');
  // Signup from the bottom CTA must enter Home at the top, never at the old scroll offset.
  await click('.begin-journey .btn-primary');await set('#auth-email','entry@example.com');await set('#auth-password','demo-only-password');await click('[aria-label="Show password"]');assert.equal(await run('document.querySelector("#auth-password").type'),'text');await click('[aria-label="Hide password"]');
  await key('Tab');assert.equal(await run('document.querySelector(".auth-screen").contains(document.activeElement)'),true);
  assert.equal(await run('getComputedStyle(document.querySelector(".auth-editorial h2")).color'),'rgb(244, 241, 231)');await screenshot('maitri-phase1-signup.png');await click('.auth-submit');await wait('!!document.querySelector(".modal-dialog[aria-label^=AI]")');await click('[aria-label="AI safety and privacy"] .btn-primary');await wait('!!document.querySelector(".sanctuary-home")');assert.equal(await run('scrollY'),0);
  assert.equal(await run('Object.values(localStorage).join("").includes("demo-only-password")'),false);
  await click('[aria-label="Settings & Profile"]');await run('[...document.querySelectorAll(".settings-footer button")].find(button=>button.textContent.includes("Sign Out")).click()');await wait('!!document.querySelector(".cinematic-landing")');
  await click('.public-nav-links .btn-secondary');await set('#auth-email','entry@example.com');await set('#auth-password','short');await run('document.querySelector(".auth-form").dispatchEvent(new Event("submit",{bubbles:true,cancelable:true}))');await wait('!!document.querySelector(".auth-error")');assert.match(await run('document.querySelector(".auth-error").textContent'),/8 characters/);
  await set('#auth-password','demo-only-password');await click('.auth-submit');await wait('!!document.querySelector(".modal-dialog[aria-label^=AI]")');await key('Escape');await wait('!!document.querySelector(".sanctuary-home")');
  await send('Page.reload');await wait('!!document.querySelector(".sanctuary-home")');
  await click('[aria-label="Settings & Profile"]');await run('[...document.querySelectorAll(".settings-footer button")].find(button=>button.textContent.includes("Sign Out")).click()');await wait('!!document.querySelector(".cinematic-landing")');
  for(const width of [375,390,768]){
   await send('Emulation.setDeviceMetricsOverride',{width,height:900,deviceScaleFactor:1,mobile:true});await run('window.scrollTo(0,0)');await pause(400);
   assert.equal(await run('document.documentElement.scrollWidth<=innerWidth'),true,'Public overflow '+width);
   assert.equal(await run('(()=>{const n=document.querySelector(".public-nav").getBoundingClientRect(),h=document.querySelector(".intro-symbol").getBoundingClientRect();return n.bottom<=h.top})()'),true,'Nav overlaps intro at '+width);
   await wait('document.querySelector(".cinematic-landing").dataset.introComplete==="true"');await pause(350);await screenshot('maitri-phase1-public-'+width+'.png');await click('.public-nav-links .btn-primary');assert.equal(await run('document.querySelector(".auth-screen").scrollWidth<=innerWidth'),true,'Auth overflow '+width);await screenshot('maitri-phase1-auth-'+width+'.png');await click('.auth-back');
  }
  await send('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'reduce'}]});await pause();assert.equal(await run('document.querySelectorAll(".intro-universe canvas").length'),0);assert.equal(await run('getComputedStyle(document.querySelector(".intro-mascot")).animationName'),'none');
  await send('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'no-preference'}]});
  // Simulate unavailable WebGL before the page loads; public navigation must remain usable.
  const {identifier}=await send('Page.addScriptToEvaluateOnNewDocument',{source:'const getContext=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(type,...args){return String(type).includes("webgl")?null:getContext.call(this,type,...args)};'});
  await send('Page.reload');await wait('!!document.querySelector(".intro-portal-fallback p")');assert.equal(await run('document.querySelectorAll(".intro-universe canvas").length'),0);await click('.public-nav-links .btn-secondary');await wait('!!document.querySelector(".auth-form")');await click('.auth-back');await send('Page.removeScriptToEvaluateOnNewDocument',{identifier});
  assert.deepEqual(page.errors,[]);console.log(JSON.stringify({publicIntro:'passed',signup:'passed',passwordLogin:'passed',homeNavigation:'passed',worldPreviews:6,mobileWidths:[375,390,768],keyboard:'passed',reducedMotion:'passed',webglFallback:'passed',runtimeErrors:page.errors}));
 } finally {page?.close();await browser.send('Target.disposeBrowserContext',{browserContextId});browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
