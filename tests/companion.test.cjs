const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');const path=require('node:path');const vm=require('node:vm');const ts=require('typescript');
function harness(failStorage=false,initial=[]){
 const cache=new Map(), saved=new Map(initial);let service;
 const storage={getItem:k=>saved.get(k)||null,setItem:(k,v)=>{if(failStorage)throw Error('blocked');saved.set(k,v);},removeItem:k=>saved.delete(k)};const styles={};const root={dataset:{},style:{setProperty:(k,v)=>styles[k]=v,colorScheme:''}};
 function load(file){file=path.resolve(file);if(cache.has(file))return cache.get(file).exports;const module={exports:{}};cache.set(file,module);
 const source=ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
 const localRequire=id=>{if(id==='zustand/middleware'){const m=require(id);return {...m,persist:(creator,options)=>m.persist(creator,{...options,storage:m.createJSONStorage(()=>storage)})};}if(id==='../services')return {services:{chat:service}};if(id.startsWith('.'))return load(path.resolve(path.dirname(file),id+'.ts'));return require(id);};
 vm.runInNewContext(source,{require:localRequire,module,exports:module.exports,localStorage:storage,crypto:require('node:crypto').webcrypto,setTimeout:fn=>setTimeout(fn,0),clearTimeout,console,document:{documentElement:root,body:{dataset:{}}}},{filename:file});return module.exports;}
 const {MockChatService}=load('src/services/mocks/mockChatService.ts');service=new MockChatService();
 return {load,styles,service,store:()=>load('src/store/useCompanionStore.ts').useCompanionStore,saved};
}
test('context-aware demo responses stream progressively and retain referrals',async()=>{
 const {service}=harness();const replies=[];
 for(const text of ['I feel stressed','I am happy','Help me focus','I feel lonely','What is my heart rate?']){
 let chunks=[],done;await service.sendMessage(text,[],s=>chunks.push(s),m=>done=m);
 assert.ok(chunks.length>4);assert.ok(chunks.every((s,i)=>i===0||s.startsWith(chunks[i-1])));assert.match(done.content,/Demo response/);assert.equal(done.content,chunks.at(-1));replies.push(done.content);
 }assert.equal(new Set(replies).size,5);
});
test('store guards duplicate sends, transitions, persists and restores history',async()=>{
 const h=harness(),store=h.store(),states=[];store.subscribe(s=>states.push(s.moodState));
 const pending=store.getState().sendMessage('I feel stressed');await store.getState().sendMessage('duplicate');await pending;
 assert.equal(store.getState().messages.filter(m=>m.sender==='user').length,1);assert.ok(states.includes('thinking'));assert.ok(states.includes('speaking'));assert.equal(store.getState().moodState,'comforting');assert.equal(store.getState().isStreaming,false);assert.ok(h.saved.get('maitri_demo_conversation').includes('I feel stressed'));assert.ok(store.getState().messages.every(m=>!m.isStreaming));const restored=harness(false,[...h.saved]).store();assert.equal(restored.getState().messages.length,store.getState().messages.length);assert.equal(restored.getState().messages.at(-1).content,store.getState().messages.at(-1).content);
});
test('service failure unlocks composer and storage failure stays usable',async()=>{
 const h=harness(true),store=h.store();await store.getState().sendMessage('hello');assert.match(store.getState().error,/storage/);assert.equal(store.getState().isStreaming,false);
 h.service.sendMessage=async()=>{throw Error('failure');};await store.getState().sendMessage('retry');assert.equal(store.getState().isStreaming,false);assert.equal(store.getState().moodState,'idle');
});

test('all eight palettes and arbitrary accents produce accessible actions',()=>{
 const {load,styles}=harness();const {THEMES,contrastRatio,applyTheme,defaults}=load('src/store/useThemeStore.ts');assert.equal(THEMES.length,8);
 for(const t of THEMES){assert.ok(contrastRatio(t.text,t.surface)>=4.5,t.name);assert.ok(contrastRatio(t.text,t.bg)>=4.5,t.name);for(const accent of ['#ffffff','#000000','#ffff00','#ff00ff']){applyTheme({...defaults,theme:t.id,accent},'forest');assert.ok(contrastRatio(styles['--action'],styles['--action-text'])>=4.5,t.name);assert.ok(contrastRatio(styles['--theme-text-main'],styles['--theme-panel-bg'])>=4.5,t.name);}}
});
test('community comments, membership, connections, challenges and bookings persist',async()=>{
 const h=harness(),{MockCommunityService}=h.load('src/services/mocks/mockCommunityService.ts'),service=new MockCommunityService();
 const posts=await service.getPosts();await service.addComment(posts[0].id,'A kind thought');assert.equal((await service.getPosts())[0].comments.at(-1).content,'A kind thought');
 const c=(await service.getCircles())[0];await service.toggleCircle(c.id);assert.equal((await service.getCircles())[0].isJoined,!c.isJoined);
 const f=(await service.getFriends())[0];await service.toggleFriend(f.id);assert.equal((await service.getFriends())[0].isFriend,true);
 const challenge=(await service.getChallenges())[0];await service.updateChallenge(challenge.id,'join');for(let i=0;i<5;i++)await service.updateChallenge(challenge.id,'progress');assert.equal((await service.getChallenges())[0].progress,challenge.goal);
 await service.bookSession('psy_1','demo slot');await assert.rejects(service.bookSession('psy_1','demo slot'));
});
test('wellness events deduplicate and health history stays explicitly simulated',async()=>{
 const h=harness(),{useWellnessStore}=h.load('src/store/useWellnessStore.ts');useWellnessStore.getState().record('habit','A kind pause',undefined,'same');useWellnessStore.getState().record('habit','A kind pause',undefined,'same');assert.equal(useWellnessStore.getState().activities.length,1);
 const {MockDailyRhythmService}=h.load('src/services/mocks/mockDailyRhythmService.ts'),rhythm=new MockDailyRhythmService();await rhythm.addMoodCheckIn(4,['calm']);await rhythm.addJournalEntry('Title','Body');assert.equal(useWellnessStore.getState().activities.filter(a=>a.kind==='mood').length,1);assert.equal(useWellnessStore.getState().activities.filter(a=>a.kind==='journal').length,1);
 const {MockHealthService}=h.load('src/services/mocks/mockHealthService.ts'),history=await new MockHealthService().getHistory(30);assert.equal(history.length,30);assert.ok(history.every(r=>r.source==='simulated'));assert.equal(new Set(history.map(r=>r.timestamp)).size,30);
});
test('fresh visitors see public entry; demo auth discards passwords and sign-out survives reload',async()=>{
 const h=harness(),{MockAuthService}=h.load('src/services/mocks/mockAuthService.ts'),service=new MockAuthService();assert.equal(await service.getCurrentUser(),null);
 await assert.rejects(service.authenticate('invalid','made-up-password','login'));await assert.rejects(service.authenticate('test@example.com','short','signup'));assert.equal(await service.getCurrentUser(),null);
 const session=await service.authenticate('test@example.com','made-up-password','signup');assert.equal(session.user.username,'test');assert.equal(session.user.email,'test@example.com');assert.ok(!JSON.stringify([...h.saved]).includes('made-up-password'));assert.ok(await service.getCurrentUser());
 await service.logout();assert.equal(await service.getCurrentUser(),null);await assert.rejects(service.verifyOtp('test@example.com','a'));await service.verifyOtp('test@example.com','123456');assert.ok(await service.getCurrentUser());
});

test('clear conversation guards active responses and removes persisted history',async()=>{
 const h=harness(),store=h.store();const pending=store.getState().sendMessage('A private reflection');assert.equal(store.getState().clearConversation(),false);await pending;assert.ok(h.saved.has('maitri_demo_conversation'));assert.equal(store.getState().clearConversation(),true);assert.equal(h.saved.has('maitri_demo_conversation'),false);assert.equal(store.getState().messages.length,1);assert.equal(store.getState().messages[0].id,'welcome');
});

test('Settings persists independent world/theme and nonsecret profile preferences',()=>{
 const h=harness(),{useThemeStore,getPreferences}=h.load('src/store/useThemeStore.ts');const s=useThemeStore.getState();s.update({theme:'velvet',companionNickname:'Aster',aboutYou:'More quiet time',voiceOutput:true,backgroundScope:'companion',soundPreset:'warm',readability:'comfortable'});s.setWorld('space');s.setVolume(.6);s.toggleSound();
 const restored=harness(false,[...h.saved]).load('src/store/useThemeStore.ts').useThemeStore.getState();assert.equal(restored.activeWorld,'space');assert.equal(restored.theme,'velvet');assert.equal(restored.companionNickname,'Aster');assert.equal(restored.backgroundScope,'companion');assert.equal(restored.volume,.6);assert.equal(restored.soundEnabled,false);assert.equal(restored.voiceOutput,true);assert.ok(!Object.values(getPreferences(restored)).some(v=>typeof v==='function'));
});

test('local profile editing validates identity and avatar, preserves privileges, and survives reload',async()=>{
 const h=harness(),{MockAuthService}=h.load('src/services/mocks/mockAuthService.ts'),service=new MockAuthService();await service.authenticate('profile@example.com','demo-password','signup');const before=await service.getCurrentUser();
 const profile={name:'  Casey River  ',username:'casey.river',avatarUrl:'/assets/favicon.png',bio:'Quiet focus breaks'};
 const updated=await service.updateProfile({...profile,role:'superadmin',email:'changed@example.com',id:'changed'});assert.equal(updated.name,'Casey River');assert.equal(updated.preferredName,'Casey River');assert.equal(updated.username,'casey.river');assert.equal(updated.role,before.role);assert.equal(updated.email,before.email);assert.equal(updated.id,before.id);
 const restored=harness(false,[...h.saved]).load('src/services/mocks/mockAuthService.ts');assert.equal((await new restored.MockAuthService().getCurrentUser()).avatarUrl,'/assets/favicon.png');
 for(const invalid of [{name:' '},{username:'bad id'},{avatarUrl:'https://example.com/track.png'},{avatarUrl:'data:image/svg+xml;base64,PHN2Zz4='},{bio:'x'.repeat(601)}])await assert.rejects(service.updateProfile({...profile,...invalid}));
 assert.equal((await service.getCurrentUser()).name,'Casey River');
 const denied=harness(true,[...h.saved]).load('src/services/mocks/mockAuthService.ts');await assert.rejects(new denied.MockAuthService().updateProfile({...profile,name:'Should not save'}));assert.equal((await new denied.MockAuthService().getCurrentUser()).name,'Casey River');
 await service.logout();await assert.rejects(service.updateProfile(profile));
});

test('legacy demo handles remain editable without changing the handle',async()=>{
 const h=harness(),{MockAuthService}=h.load('src/services/mocks/mockAuthService.ts'),service=new MockAuthService();await service.authenticate('qa@example.com','demo-password','signup');const current=await service.getCurrentUser();const updated=await service.updateProfile({name:'QA member',username:current.username,avatarUrl:current.avatarUrl,bio:''});assert.equal(updated.username,'qa');assert.equal(updated.name,'QA member');await assert.rejects(service.updateProfile({name:'QA',username:'xy',bio:''}));
});

test('Home follow preference defaults on, persists opt-out and stays independent of worlds',()=>{
 const h=harness(),{useThemeStore}=h.load('src/store/useThemeStore.ts');assert.equal(useThemeStore.getState().cursorFollow,true);useThemeStore.getState().update({cursorFollow:false});useThemeStore.getState().setWorld('space');const restored=harness(false,[...h.saved]).load('src/store/useThemeStore.ts').useThemeStore.getState();assert.equal(restored.cursorFollow,false);assert.equal(restored.activeWorld,'space');
});
test('meditation progress deduplicates completion and survives browser storage reload',()=>{
 const h=harness(),{useWellnessStore}=h.load('src/store/useWellnessStore.ts');useWellnessStore.getState().record('meditation','A moment of quiet',60,'session-1');useWellnessStore.getState().record('meditation','A moment of quiet',60,'session-1');const restored=harness(false,[...h.saved]).load('src/store/useWellnessStore.ts').useWellnessStore.getState();assert.equal(restored.activities.length,1);assert.equal(restored.activities[0].kind,'meditation');assert.equal(restored.activities[0].durationSeconds,60);
});
