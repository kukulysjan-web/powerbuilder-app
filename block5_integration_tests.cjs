const fs=require('fs'), vm=require('vm'), assert=require('assert');
const html=fs.readFileSync(__dirname+'/index.html','utf8');
const script=id=>{let r=new RegExp(`<script id="${id}">([\\s\\S]*?)<\\/script>`);let m=html.match(r);assert(m,`Script ${id}`);return m[1]};
let failures=[],n=0;
function test(label,fn){try{fn();n++;console.log('PASS',label)}catch(e){failures.push({label,message:e.message});console.log('FAIL',label,e.message)}}
const clone=x=>JSON.parse(JSON.stringify(x));
const groups=(members,between=0,round=120)=>({groupId:'grp01',kind:members.length>=4?'GIANT_SET':members.length===3?'TRISET':'SUPERSET',prescriptionIds:members.map(x=>'s'+x),restBetweenExercisesSec:between,restAfterRoundSec:round});
const defEx=(i,sets=2,unilat=false)=>({slot_id:'s'+i,exercise_id:'e'+i,name:'Ex '+i,sets,reps:'8-12',rir:'2',rest:'90',laterality:unilat?{mode:'UNILATERAL_SEQUENTIAL',startSidePolicy:'WEAKER_FIRST',manualFallbackSide:'LEFT',restBetweenSidesSec:0,restAfterBothSidesSec:90}:null});
let day={day_id:'D1',name:'Upper',exercises:[defEx(0,2),defEx(1,2,true),defEx(2,1),defEx(3,2)],exerciseGroups:[groups([0,1,2])]};
let version={version:1,structure:{days:[day]}},plan={plan_id:'P',name:'Test',history:[],progression:{},runtime:{dayIndex:0,workout:{sessionKey:'SESSION-1',version:1,dayId:'D1',logs:{},technique:{},steadyLocks:{},adaptiveNotes:{}}}};
let time=1_800_000_000_000, timerEnd=0,timerPaused=false,timerRemain=0,timerOn=false,timerStarts=[],lastToast='',saved=0,renderCount=0,historySheet='';const inputs={cf21Weight:{value:'12.5'},cf21Reps:{value:'10'}};
let ctx={
 console, CF21_SESSION_SCHEMA:1, Date:class extends Date {constructor(...a){super(...(a.length?a:[time]))}static now(){return time}},window:{scrollTo:()=>{}},document:{getElementById:(id)=>inputs[id]||null},
 state:{settings:{autoRest:true},trainingSession:{programKey:'plan:P',sessionKey:'SESSION-1',status:'active',cf232Cursor:0,position:0,setIndex:0,rirDrafts:{},activeMs:0},cf232SidePreferences:{}},
 save:()=>saved++,render:()=>renderCount++,toastMsg:(s)=>lastToast=s,closeSheet:()=>{},esc:x=>String(x),openSheet:x=>{historySheet=x},b6Enc:x=>x,b6Dec:x=>x,
 uid:()=>String(++saved),cf224Now:()=>new Date(time).toISOString(),cf224Clone:clone,cf224IsEngineKey:k=>String(k).startsWith('plan:'),
 cf21SessionEnsure:()=>ctx.state.trainingSession,cf21SessionAccumulate:()=>{},releaseWake:()=>{},cf224PlanById:id=>id===plan.plan_id?plan:null,cf224Plan:k=>k==='plan:P'?plan:null,cf224Version:(p,n)=>n===1?version:null,cf224PlanHtml:()=>'<div class="cf224-plan"><div class="cf224-dayrail"></div></div>',
 cf223State:()=>({structure:{days:[day]}}),cf223DayHtml:()=>'',cf223ExerciseHtml:()=>'',cf223RemoveExercise:()=>{},cf223Check:()=>[],cf223Touch:()=>{},
 cf224DefaultConfig:()=>({mode:'FIXED'}),cf224SetupErrors:()=>[],cf224Setup:()=>({structure:{days:[]},config:{}}),cf224PrescriptionKey:(d,e,i)=>'rx'+i,
 cf21SyncPosition:()=>{},cf21Jump:()=>{},cf21RirKey:()=> 'RIR',
 cf224WorkoutLog:(p,key,create=true)=>{let logs=p?.runtime?.workout?.logs;if(!logs)return null;if(!logs[key]&&create)logs[key]={sets:[]};return logs[key]||null},
 cf224Model:()=>{let exercises=day.exercises.map((ex,i)=>{let key='rx'+i,logs=plan.runtime.workout?.logs?.[key]?.sets||[];return {i,sourceIndex:i,name:ex.name,prescriptionKey:key,ex,sets:ex.sets,rest:90,reps:'8-12',config:{mode:'FIXED'},done:logs.filter(z=>z?.ok).length}});return{exercises,day,version,plan,title:plan.name,programKey:'plan:P',dayLabel:day.name}},
 cf224CurrentSetData:()=>({weight:12.5,reps:10,rir:2,target:'8-12'}),cf224SetField:()=>{},
 cf21AdvanceKpr:()=>{},cf224SaveSet:()=>{},cf224FixedDecision:()=>({outcome:'fixed'}),
 cf21AllDone:()=>false,cf21GuidedScreen:()=>'<div class="cf21-session"><section class="cf21-exhero"><button onclick="startTimer(90)">Pausentimer</button></section><div class="cf21-settop"></div><button>Satz speichern</button></div>',
 cf21Pause:function(){let s=ctx.state.trainingSession;s.status='paused';ctx.hideTimer();ctx.save();ctx.render()},
 cf21Resume:function(){let s=ctx.state.trainingSession;s.status='active';ctx.save();ctx.render()},
 cf21ResumeActive:()=>{},cf224RepRange:s=>({exact:null}),cf224ProgressState:(p,v,key)=>(p.progression[key]||(p.progression[key]={steady:{lockedWeight:0},sideHistory:{LEFT:[],RIGHT:[]},events:[]})),
 cfExRemember:()=>{},fmtWeight:v=>String(v),
 startTimer:function(n){timerOn=true;timerEnd=time+n*1000;timerPaused=false;timerStarts.push(n)},
 hideTimer:function(){timerOn=false},
 toggleTimer:function(){if(!timerPaused){timerRemain=Math.ceil((timerEnd-time)/1000);timerPaused=true}else{timerEnd=time+timerRemain*1000;timerPaused=false}},
 addTime:function(n){if(timerPaused)timerRemain+=n;else timerEnd+=n*1000},
};
Object.defineProperties(ctx,{timerPaused:{get:()=>timerPaused,set:v=>{timerPaused=v}},timerRemain:{get:()=>timerRemain,set:v=>{timerRemain=v}},timerEnd:{get:()=>timerEnd,set:v=>{timerEnd=v}}});ctx.cf21Model=ctx.cf224Model;const vctx=vm.createContext(ctx);vm.runInContext(script('cf232-implementation'),vctx,{filename:'cf232.js'});vm.runInContext(script('cf233-block5-workout-player'),vctx,{filename:'block5.js'});ctx.CF233_BLOCK5_AUDIT=ctx.window.CF233_BLOCK5_AUDIT;
const evaluate=x=>vm.runInContext(x,vctx);
const stat=()=>ctx.state.trainingSession;
const step=()=>{const m=ctx.cf224Model();return ctx.CF233_BLOCK5_AUDIT.schedule(m.day,m)};
const saveSide=(w='12.5',reps='10',rir=2)=>{inputs.cf21Weight.value=w;inputs.cf21Reps.value=reps;stat().rirDrafts[ctx.cf21RirKey()]=rir;ctx.cf224SaveSet()};
// SCHEDULE: group order, differing set counts, isolated solo sets
let stages=step();
test('Trisatz and uneven sets: A1 → A2 → A3 → A1 → A2 → solo ×2',()=>assert.deepStrictEqual(Array.from(stages,q=>[q.position,q.setIndex]),[[0,0],[1,0],[2,0],[0,1],[1,1],[3,0],[3,1]]));
test('4-exercise giant set / full-day circuit sequence',()=>{const d={exercises:[defEx(0,2),defEx(1,1),defEx(2,2),defEx(3,1)],exerciseGroups:[{...groups([0,1,2,3]),kind:'CIRCUIT'}]};let q=ctx.CF233_BLOCK5_AUDIT.schedule(d);assert.deepStrictEqual(Array.from(q,x=>x.position),[0,1,2,3,0,2])});
test('effective model set counts override raw prescription',()=>{const m=ctx.cf224Model();m.exercises[0].sets=3;let q=ctx.CF233_BLOCK5_AUDIT.schedule(day,m);assert.strictEqual(q.filter(x=>x.position===0).length,3)});
test('rest between exercises 0 s and after group round 120 s',()=>{const m=ctx.cf224Model();assert.strictEqual(ctx.CF233_BLOCK5_AUDIT.rest(m,stages[0],stages[1]).seconds,0);assert.strictEqual(ctx.CF233_BLOCK5_AUDIT.rest(m,stages[2],stages[3]).seconds,120)});
test('bilateral set persists and automatically jumps to A2',()=>{saveSide();assert.strictEqual(stat().position,1);assert.strictEqual(plan.runtime.workout.logs.rx0.sets[0].ok,true)});
test('bilateral between-exercise rest has no phantom timer',()=>assert.strictEqual(timerStarts.length,0));
test('unilateral LEFT saves as incomplete, navigates to RIGHT without changing exercise',()=>{saveSide('12','10');assert.strictEqual(stat().position,1);assert.strictEqual(stat().cf232Side,'RIGHT');assert.strictEqual(plan.runtime.workout.logs.rx1.sets[0].ok,false);assert.strictEqual(timerStarts.length,0)});
test('partial unilateral set survives serialized session reload',()=>{let json=JSON.stringify(stat()),snapshot=JSON.stringify(plan.runtime.workout);ctx.state.trainingSession=JSON.parse(json);plan.runtime.workout=JSON.parse(snapshot);ctx.cf21SyncPosition();assert.strictEqual(stat().position,1);assert.strictEqual(stat().cf232Side,'RIGHT');assert.strictEqual(plan.runtime.workout.logs.rx1.sets[0].sides.LEFT.reps,10)});
test('right-side input starts separately (no leaked left-side RIR)',()=>{let d=ctx.cf224CurrentSetData();assert.strictEqual(d.side,'RIGHT');assert.strictEqual(d.rir,null)});
test('unilateral RIGHT completes one work set then jumps to A3',()=>{saveSide('12','11');assert.strictEqual(stat().position,2);assert.strictEqual(plan.runtime.workout.logs.rx1.sets[0].ok,true);assert.strictEqual(plan.runtime.workout.logs.rx1.sets[0].sides.RIGHT.reps,11)});
test('finishing A3 starts exactly one 120-second round timer',()=>{saveSide();assert.strictEqual(stat().position,0);assert.strictEqual(stat().setIndex,1);assert.deepStrictEqual(timerStarts,[120]);assert.strictEqual(stat().cf232Rest.cause,'GROUP_ROUND')});
test('rest countdown remains persisted after 10 seconds and hydration/reload',()=>{time+=10_000;let remaining=Math.ceil((stat().cf232Rest.deadline-time)/1000);ctx.state.trainingSession=JSON.parse(JSON.stringify(stat()));evaluate("cf232TimerHydrated=''");ctx.CF233_BLOCK5_AUDIT.stages();evaluate('cf232HydrateRest()');assert.strictEqual(remaining,110);assert.strictEqual(timerStarts.at(-1),110)});
test('workout pause freezes timer and resume restores remaining duration',()=>{time+=15_000;ctx.cf21Pause();assert.strictEqual(stat().status,'paused');assert.strictEqual(stat().cf232Rest.pausedRemain,95);time+=60_000;ctx.cf21Resume();assert.strictEqual(stat().status,'active');assert.strictEqual(stat().cf232Rest.deadline,time+95000)});
test('user timer adjustment syncs deadline to persisted workout',()=>{ctx.addTime(15);assert.strictEqual(stat().cf232Rest.deadline,time+110000)});
test('user can skip rest timer without losing workout',()=>{ctx.hideTimer();assert.strictEqual(stat().cf232Rest,null);assert.strictEqual(stat().position,0)});
test('second round bilateral / unilateral do not repeat A3',()=>{saveSide();assert.strictEqual(stat().position,1);saveSide('13','8');saveSide('13','9');assert.strictEqual(stat().position,3);assert.strictEqual(stat().setIndex,0)});
test('solo non-group pause is 90 seconds and no duplicate timer',()=>{saveSide();assert.strictEqual(stat().position,3);assert.strictEqual(stat().setIndex,1);assert.strictEqual(stat().cf232Rest.seconds,90);assert.strictEqual(timerStarts.at(-1),90)});
test('finishing final solo set closes without another timer',()=>{saveSide();assert.strictEqual(ctx.cf21AllDone(),true);assert.strictEqual(stat().cf232Rest,null);assert.strictEqual(plan.runtime.workout.logs.rx3.sets[1].ok,true)});
test('all complete while individual side history is intact',()=>{const z=plan.runtime.workout.logs.rx1.sets;assert.strictEqual(z.length,2);assert.deepStrictEqual(Array.from(z,v=>v.sides.LEFT.reps),[10,8]);assert.deepStrictEqual(Array.from(z,v=>v.sides.RIGHT.reps),[11,9])});
test('full workout player exposes next-step status and timer action',()=>{const s=ctx.cf21GuidedScreen();assert(s.includes('Workout-Ablauf'));assert(s.includes('cf233B5ManualRest(90)'))});
// Additional fresh trial for manually resolved partials to validate completeness and history.
test('explicit unilateral partial resolves navigation without counting complete',()=>{const alt=ctx.cf224Model(),x=alt.exercises[1];plan.runtime.workout.logs.rx1.sets[0]={sides:{LEFT:{status:'DONE',weight:12,reps:6,rir:2}},status:'PARTIAL',resolved:true,ok:false};assert(ctx.CF233_BLOCK5_AUDIT.done(ctx.cf224Model(),{position:1,setIndex:0}));assert.strictEqual(ctx.cf224Model().exercises[1].done,1)}); // second complete still counted only once
// Drop the partial when testing progression; only complete sets are passed to decision.
plan.runtime.workout.logs.rx1.sets[0]={sides:{LEFT:{status:'DONE',weight:12,reps:10,rir:2},RIGHT:{status:'DONE',weight:12,reps:11,rir:2}},status:'DONE',ok:true};
test('unilateral progression records all sets per side separately',()=>{let m=ctx.cf224Model(),x=m.exercises[1],sets=plan.runtime.workout.logs.rx1.sets;ctx.cf224FixedDecision(plan,version,x,sets,'NOW');assert.strictEqual(plan.progression.rx1.sideHistory.LEFT.length,2);assert.strictEqual(plan.progression.rx1.sideHistory.RIGHT.length,2);assert.strictEqual(plan.progression.rx1.sideHistory.LEFT[1].reps,8);assert.strictEqual(plan.progression.rx1.sideHistory.RIGHT[1].reps,9)});

test('manual workout timer works even when automatic rest is disabled',()=>{
 const old=ctx.state.settings.autoRest;ctx.state.settings.autoRest=false;
 ctx.CF233_BLOCK5_AUDIT.manualRest(45);
 assert.strictEqual(stat().cf232Rest.seconds,45);
 assert.strictEqual(timerStarts.at(-1),45);
 ctx.hideTimer();ctx.state.settings.autoRest=old;
});
test('manually paused timer remains paused through workout pause and resume',()=>{
 ctx.CF233_BLOCK5_AUDIT.manualRest(50);ctx.toggleTimer();
 assert.strictEqual(timerPaused,true);assert.strictEqual(stat().cf232Rest.pausedRemain,50);
 ctx.cf21Pause();time+=30000;ctx.cf21Resume();
 assert.strictEqual(stat().cf232Rest.pausedRemain,50);
 assert.strictEqual(stat().cf232Rest.deadline,null);
 ctx.hideTimer();
});
test('plan screen shows workout history access',()=>{
 assert(ctx.cf224PlanHtml('plan:P').includes('Workout-Verlauf'));
});
// Run real code for canonical engine completion/history persistence, not a mocked finish.
const finishCore=html.match(/function cf224FinishEngineWorkout\(\)[\s\S]*?(?=\nfunction cf224ResetLogs)/)?.[0];
assert(finishCore,'Canonical engine workout finalizer is available');
vm.runInContext(finishCore,vctx,{filename:'cf224-finish.js'});
test('engine finalizer archives both sides and all group sets in versioned workout history',()=>{
 assert(ctx.cf21AllDone());ctx.cf224FinishEngineWorkout();
 assert.strictEqual(plan.history.length,1);
 assert.strictEqual(plan.runtime.workout,null);
 assert.strictEqual(stat().status,'idle');
 assert.strictEqual(plan.history[0].logs.rx1.sets[0].sides.LEFT.reps,10);
 assert.strictEqual(plan.history[0].logs.rx1.sets[1].sides.RIGHT.reps,9);
 assert.strictEqual(plan.history[0].version,1);
});
test('historical workout UI distinguishes LEFT/RIGHT and displays actual values',()=>{
 ctx.cf233B5HistorySheet('P');
 assert(historySheet.includes('L: 12 kg × 10'));
 assert(historySheet.includes('R: 12 kg × 11'));
 assert(historySheet.includes('Verlauf'));
});
test('legacy protected programs do not enter Block 5 engine',()=>{let s=stat();let old=s.programKey;s.programKey='kilo';try{assert.strictEqual(ctx.CF233_BLOCK5_AUDIT.stages().length,7)}finally{s.programKey=old}});
console.log(`\n${n} passed, ${failures.length} failed`);if(failures.length){console.error(failures);process.exit(1)}
