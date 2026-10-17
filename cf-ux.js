/* COALFORGED UX Rebuild 2.4.0-RC1 — session-first, non-destructive.
   No user-data migration. Never mutates source plan versions during an active workout. */
(() => {
 'use strict';
 const cfuxEsc = s => esc(String(s??''));
 const cfuxCode = x => b6Enc(String(x??''));
 const cfuxDecode = x => b6Dec(x);
 const fmt = (v,dec=1) => Number.isFinite(+v)?Number(v).toLocaleString('de-DE',{maximumFractionDigits:dec}):'–';
 const laterality = e => !!cf232Laterality(e);
 const cfuxSession = () => {const s=cf21SessionEnsure();return cf21SessionLive()&&cf224IsEngineKey(s.programKey)?s:null};
 function ensureDay(p, v, original, sourceExercises) {
  const w=p?.runtime?.workout;
  if(!w || !original)return original;
  if(!w.uxDay){
   w.uxDay=cf224Clone(original);
   w.uxDay.exercises.forEach((e,i)=>{e.sets=sourceExercises?.[i]?.sets??e.sets;e._uxRxKey=cf224PrescriptionKey(original,e,i);e._uxConfig=cf224Clone(cf224ConfigFor(v,original,e,i));});
   w.uxRemoved=[];
   w.uxBaseline=cf224Clone(w.uxDay);
   save();
  }
  return w.uxDay;
 }
 const cfuxBaseModel=cf224Model;
 cf224Model=function(key){
  const m=cfuxBaseModel(key),s=cf21SessionEnsure();
  if(!m?.plan?.runtime?.workout || !cfuxSession() || s.programKey!==key)return m;
  const d=ensureDay(m.plan,m.version,m.day,m.exercises),w=m.plan.runtime.workout;
  const exs=(d.exercises||[]).map((e,i)=>{
   const k=e._uxRxKey||(e._uxRxKey=cf224PrescriptionKey(d,e,i));
   const c=e._uxConfig||cf224ConfigFor(m.version,d,e,i);
   const sets=Math.max(1,Math.min(30,Number(e.sets)||1));
   const log=w.logs?.[k],done=(log?.sets||[]).slice(0,sets).filter(z=>z?.ok).length;
   return {i,sourceIndex:i,prescriptionKey:k,exercise_id:e.exercise_id,name:e.name,
    role:e.role||'Übung',sets,reps:String(e.reps||'8–12'),targetRir:e.rir?`RIR ${e.rir}`:'RIR frei',
    rest:cf224RestSeconds(e.rest),done,ex:e,config:c,day:d,version:m.version};
  });
  return {...m,exercises:exs,day:d,dayLabel:d.name};
 };
 function uxModel(){const s=cfuxSession();return s?cf224Model(s.programKey):null}
 function active(){let s=cfuxSession();if(!s)return null;let m=uxModel();return m?{s,m,w:m.plan.runtime.workout,d:m.day}:null}
 function store(){save()}
 // Bounded session-only undo history. Performance changes are never accidentally
 // replayed after logging a new set; snapshots contain NO timer state.
 function recordUndo(o,label){
  if(!o?.w?.uxDay)return;
  const h=Array.isArray(o.w.uxUndoHistory)?o.w.uxUndoHistory:[];
  h.push({label,day:cf224Clone(o.w.uxDay),logs:cf224Clone(o.w.logs||{}),removed:cf224Clone(o.w.uxRemoved||[]),deferred:cf224Clone(o.w.uxDeferredSlots||[]),focus:{slot:o.d.exercises[o.s.position]?.slot_id,set:o.s.setIndex,side:o.s.cf232Side}});
  o.w.uxUndoHistory=h.slice(-5);
  deleteUndo=null;
  delete o.w.uxLastDeleteUndo;
 }
 // An uncommitted set deletion stays reversible, even after closing the PWA.
 function pendingDelete(o){const u=o?.w?.uxLastDeleteUndo;return u?.sessionId===o?.s?.id?u:(deleteUndo?.sessionId===o?.s?.id?deleteUndo:null)}
 function clearUndo(){const o=active();if(o?.w){o.w.uxUndoHistory=[];delete o.w.uxLastDeleteUndo;}deleteUndo=null}
 window.cfuxUndo=function(){
  const o=active();if(!o)return false;
  if(pendingDelete(o))return window.cfuxUndoDelete();
  const h=o.w.uxUndoHistory||[],u=h.pop();if(!u)return false;
  o.w.uxDay=cf224Clone(u.day);o.w.uxRemoved=cf224Clone(u.removed);o.w.logs=cf224Clone(u.logs);o.w.uxDeferredSlots=cf224Clone(u.deferred);
  const es=o.w.uxDay.exercises||[],pos=es.findIndex(e=>e.slot_id===u.focus.slot);
  o.s.position=pos>=0?pos:0;o.s.setIndex=Math.max(0,+u.focus.set||0);o.s.cf232Side=u.focus.side||null;
  const steps=cf232Stages();const idx=steps.findIndex(t=>t.position===o.s.position&&t.setIndex===o.s.setIndex);
  if(idx>=0)o.s.cf232Cursor=idx;else if(steps.length){o.s.cf232Cursor=0;o.s.position=steps[0].position;o.s.setIndex=steps[0].setIndex}
  selected.clear();swipeOpen=null;const y=window.scrollY;store();render();requestAnimationFrame(()=>window.scrollTo({top:y,left:0,behavior:'instant'}));
  toastMsg(u.label+' rückgängig gemacht.');return true;
 };
 function deferred(o){return Array.isArray(o?.w?.uxDeferredSlots)?o.w.uxDeferredSlots:[]}
 function hasDeferred(o,slot){return deferred(o).includes(slot)}
 function focusFirstOpen(o,preferredSlot=null){
  const m=cf224Model(o.s.programKey),steps=cf232Stages();
  const available=steps.filter(t=>!cf232Done(m,t)),picked=available.find(t=>preferredSlot&&m.exercises[t.position]?.ex.slot_id===preferredSlot)
    ||available.find(t=>!hasDeferred(o,m.exercises[t.position]?.ex.slot_id))||available[0];
  if(!picked)return;
  const i=steps.indexOf(picked);o.s.cf232Cursor=i;o.s.position=picked.position;o.s.setIndex=picked.setIndex;o.s.cf232Side=null;
 }
 window.cfuxDefer=function(pos){
  const o=active(),x=o?.m.exercises[pos];if(!x||o.s.status!=='active')return false;
  if(cf232GroupFor(o.d,x.ex))return toastMsg('Für diese Übung zuerst die Satzgruppe auflösen, damit der Supersatz korrekt bleibt.');
  if(hasDeferred(o,x.ex.slot_id))return window.cfuxResumeDeferred(pos);
  if(x.done>=x.sets)return toastMsg('Übung bereits abgeschlossen.');
  recordUndo(o,'Später');const slot=x.ex.slot_id;
  const [e]=o.d.exercises.splice(pos,1);o.d.exercises.push(e);
  o.w.uxDeferredSlots=[...deferred(o),slot];focusFirstOpen(o);
  const y=window.scrollY;store();render();requestAnimationFrame(()=>window.scrollTo({top:y,left:0,behavior:'instant'}));toastMsg('Übung für später vorgemerkt.');return true;
 };
 window.cfuxResumeDeferred=function(pos){
  const o=active(),x=o?.m.exercises[pos];if(!x||!hasDeferred(o,x.ex.slot_id))return false;
  recordUndo(o,'Fortsetzen');o.w.uxDeferredSlots=deferred(o).filter(k=>k!==x.ex.slot_id);
  focusFirstOpen(o,x.ex.slot_id);store();render();
  requestAnimationFrame(()=>document.getElementById('cfux-ex-'+pos)?.scrollIntoView({block:'center',behavior:'smooth'}));
  return true;
 };
 // A layout signature intentionally excludes the logged kg/reps/RIR: those belong to history, never to the plan.
 function layoutSignature(day){if(!day)return "";const slim={exercises:(day.exercises||[]).map(e=>({slot:e.slot_id,name:e.name,exercise:e.exercise_id,sets:+e.sets||0,reps:String(e.reps||""),rir:String(e.rir||""),rest:String(e.rest||""),laterality:e.laterality||null})),groups:(day.exerciseGroups||[]).map(g=>({kind:g.kind,members:g.prescriptionIds,between:+g.restBetweenExercisesSec||0,after:+g.restAfterRoundSec||0}))};return JSON.stringify(slim)}
 function rowRec(m,x,si,side){let L=cf224WorkoutLog(m.plan,x.prescriptionKey);let z=L.sets[si]||(L.sets[si]={ok:false});if(side){z.sides=z.sides||{};z.sides[side]=z.sides[side]||{status:'PENDING'};return z.sides[side]}return z}
 function values(m,x,si,side){
  const log=cf224WorkoutLog(m.plan,x.prescriptionKey,false),z=log?.sets?.[si];let a=side?z?.sides?.[side]:z;
  const prev=side?log?.sets?.[si-1]?.sides?.[side]:log?.sets?.[si-1];
  return {weight:a?.weight??prev?.weight??cf224ExpectedWeight(x)??'',reps:a?.reps??prev?.reps??(String(x.reps).match(/^\d+$/)?.[0]||''),rir:a?.rir??prev?.rir??2,done:side?a?.status==='DONE':!!z?.ok};
 }
 function fieldInput(x,si,side,k,v){const target=`${x.i}-${si}-${side||'B'}-${k}`;return `<input id="cfux-${target}" aria-label="${cfuxEsc(k)}" inputmode="decimal" type="number" min="0" ${k==='rir'?'max="4" step="1"':k==='reps'?'step="1"':'step="0.5"'} value="${cfuxEsc(v)}" onchange="cfuxEdit(${x.i},${si},'${side||''}','${k}',this.value)">`}
 function oneRow(m,x,si,side=null){const v=values(m,x,si,side),id=`${x.i}-${si}-${side||'B'}`;
  return `<div class="cfux-setrow ${v.done?'cfux-done':''}" data-ux-id="${id}">
   <span class="cfux-setnum">${side?(side==='LEFT'?'L':'R'):(si+1)}</span>
   ${fieldInput(x,si,side,'weight',v.weight)}${fieldInput(x,si,side,'reps',v.reps)}${fieldInput(x,si,side,'rir',v.rir)}
   <button type="button" class="cfux-check ${v.done?'yes':''}" aria-label="${v.done?'Satzabschluss zurücknehmen':'Satz abschließen'}" onclick="cfuxComplete(${x.i},${si},'${side||''}')">${v.done?'✓':'○'}</button>
  </div>`;
 }
 let swipeOpen=null,deleteUndo=null;
 function swipeWrap(x,si,content,unilateral=false){
  const key=`${x.i}:${si}`;
  return `<div class="cfux-swipe ${unilateral?'cfux-sidepair ':''}${swipeOpen===key?'cfux-swipe-open':''}" data-cfux-swipe="${key}" aria-label="Satz ${si+1} nach links wischen, um Löschen anzuzeigen">
   <button type="button" class="cfux-swipe-delete" onclick="cfuxDeleteSet(${x.i},${si})" aria-label="Satz ${si+1} löschen">Löschen</button>
   <div class="cfux-swipe-content">${content}</div>
  </div>`;
 }
 let selected=new Set();
 function groupControls(m,g){return `<div class="cfux-group"><div class="cfux-flex"><strong>${cfuxEsc(cf232GroupName(g.kind))}</strong><button onclick="cfuxUngroup('${cfuxCode(g.groupId)}')">Gruppe auflösen</button></div><div class="cfux-flex cfux-restinputs"><label>Zwischen Übungen <input type="number" min="0" max="3600" value="${+g.restBetweenExercisesSec||0}" onchange="cfuxGroupRest('${cfuxCode(g.groupId)}','restBetweenExercisesSec',this.value)"> s</label><label>Rundenpause <input type="number" min="0" max="3600" value="${g.restAfterRoundSec??120}" onchange="cfuxGroupRest('${cfuxCode(g.groupId)}','restAfterRoundSec',this.value)"> s</label></div></div>`}
 function exerciseCard(m,x){const g=cf232GroupFor(m.day,x.ex),a=laterality(x.ex),isLater=hasDeferred(active(),x.ex.slot_id);
  return `<article class="cfux-ex ${isLater?'cfux-deferred':''}" id="cfux-ex-${x.i}" data-cfux-index="${x.i}"><header><div class="cfux-flex cfux-exhead"><button type="button" class="cfux-draghandle" data-cfux-drag-handle="${x.i}" aria-label="${cfuxEsc(x.name)} verschieben" title="Gedrückt halten und verschieben">⠿</button><label class="cfux-pick"><input type="checkbox" onchange="cfuxSelect(${x.i},this.checked)" ${selected.has(x.ex.slot_id)?'checked':''} aria-label="Übung für Satzgruppe auswählen"></label><div class="cfux-exname"><h3>${cfuxEsc(x.name)}</h3><small>${cfuxEsc(x.reps)} Wdh. · ${cfuxEsc(x.targetRir)} ${g?' · '+cfuxEsc(cf232GroupName(g.kind)):''}${a?' · links/rechts':''}${isLater?' · ⏳ Später':''}</small></div><button class="cfux-minibtn" onclick="cfuxActions(${x.i})" aria-label="Übungsaktionen">⋯</button></div></header>${cfuxTools.previousHtml(cfuxTools.prevEngine(m,x))}${cfuxTools.noteHtml(x.name,x.ex.cue||x.ex.note||'')}<div class="cfux-tablehead"><span>Satz</span><span>kg</span><span>Wdh.</span><span>RIR</span><span>✓</span></div>
  ${Array.from({length:x.sets},(_,i)=>a?swipeWrap(x,i,`<div class="cfux-side-label">Satz ${i+1} · unilateral</div>${oneRow(m,x,i,'LEFT')}${oneRow(m,x,i,'RIGHT')}`,true):swipeWrap(x,i,oneRow(m,x,i))).join('')}
  <div class="cfux-exbottom"><button type="button" onclick="cfuxDefer(${x.i})" ${g?'disabled title="Satzgruppe zuerst auflösen"':''}>${isLater?'▶ Jetzt machen':'⏳ Später'}</button><button onclick="cfuxAddSet(${x.i})">＋ Satz</button><button type="button" class="cfux-warmbtn" onclick="cfuxTools.warmup('${cfuxCode(x.name)}',${cf224ExpectedWeight(x)||cfuxTools.workWeightEngine(m,x)})">Aufwärmen</button><button onclick="cfuxMove(${x.i},-1)" ${x.i===0?'disabled':''} aria-label="Nach oben">↑</button><button onclick="cfuxMove(${x.i},1)" ${x.i===m.exercises.length-1?'disabled':''} aria-label="Nach unten">↓</button></div>
  </article>`;
 }
 function workoutScreen(){let o=active();if(!o)return cfuxBaseScreen();let {s,m}=o;const steps=cf232Stages(),done=steps.filter(t=>cf232Done(m,t)).length,deleted=pendingDelete(o);
  const all=steps.length>0&&done===steps.length;
  return `<div class="cfux-workout"><section class="cfux-top"><div><div class="cfux-kicker">AKTIVES WORKOUT · ${cfuxEsc(m.dayLabel)}</div><h1>${cfuxEsc(m.title)}</h1><p>${done}/${steps.length} Sätze · Änderungen gelten zunächst nur für dieses Workout</p><p class="cfux-swipe-hint">Satz nach links wischen → löschen</p></div><div class="cfux-duration" id="cf21Clock">${fmtDuration(cf21SessionSeconds())}</div></section>
   ${deleted?`<div class="cfux-undo cfux-undo-delete" role="status" aria-live="polite"><span>✓ Satz ${deleted.index+1} gelöscht</span><button type="button" onclick="cfuxUndo()" aria-label="Gelöschten Satz wiederherstellen">↶ Rückgängig</button></div>`:(o.w.uxUndoHistory?.length?`<div class="cfux-undo" role="status"><span>${cfuxEsc(o.w.uxUndoHistory.at(-1).label)}</span><button type="button" onclick="cfuxUndo()">↶ Rückgängig</button></div>`:'')}
   <div class="cfux-toolbar"><button onclick="${s.status==='paused'?'cf21Resume()':'cf21Pause()'}">${s.status==='paused'?'▶ Fortsetzen':'Ⅱ Pausieren'}</button><button type="button" onclick="cfuxManualRest()">⏱ Pausentimer</button><button onclick="cf21SessionMenu()">Workout ⋯</button></div>
   ${state.settings?.autoRest===false?'<p class="cfux-rest-disabled">Hinweis: Auto-Pausentimer ist in den Einstellungen ausgeschaltet. Manuell über „Pausentimer“ starten.</p>':''}
   ${s.status==='paused'?'<div class="cfux-paused">Workout pausiert – deine Einträge bleiben erhalten.</div>':''}
   ${m.day.exerciseGroups?.map(g=>groupControls(m,g)).join('')||''}
   ${m.exercises.map(x=>exerciseCard(m,x)).join('')}
   <div class="cfux-floating"><button class="primary" onclick="cfuxOpenAdd()">＋ Übung hinzufügen</button><button onclick="cfuxGroupSelected()">Supersatz / Gruppe (${selected.size})</button><button onclick="cfuxAllCircuit()">Alle als Zirkel</button></div>
   <button class="cfux-finish ${all?'primary':''}" onclick="cf21Finish()" ${!all?'disabled':''}>Workout abschließen ${all?'✓':`· noch ${steps.length-done} Sätze`}</button>
   </div>`;
 }
 const cfuxBaseScreen=cf21GuidedScreen;
 cf21GuidedScreen=function(){return cfuxSession()?workoutScreen():cfuxBaseScreen()};
 // No forced top-of-screen jump after a logged set: preserve user's place in the exercise list.
 const cfuxBaseAdvance=cf21AdvanceKpr;
 cf21AdvanceKpr=function(){const is=!!cfuxSession(),y=is?window.scrollY:0;const out=cfuxBaseAdvance();if(is)requestAnimationFrame(()=>window.scrollTo({top:y,left:0,behavior:'instant'}));return out};
 window.cfuxEdit=function(pos,si,side,key,value){let o=active(),x=o?.m.exercises[pos];if(!x||!['weight','reps','rir'].includes(key))return;
  const n=value===''?null:Number(value);if(n!==null&&(!Number.isFinite(n)||n<0||(key==='rir'&&n>4)||(key==='reps'&&!Number.isInteger(n))))return toastMsg('Ungültiger Wert');
  const rec=rowRec(o.m,x,si,side||null);if(n===null&&(side?rec.status==='DONE':rec.ok))return toastMsg('Erledigten Satz erst entsperren oder einen gültigen Wert eingeben.');rec[key]=n;clearUndo();store();
 };
 window.cfuxManualRest=function(){
  const o=active();if(!o||o.s.status!=='active')return toastMsg('Workout zuerst fortsetzen.');
  const x=o.m.exercises[o.s.position]||o.m.exercises[0];
  const secs=laterality(x?.ex)?Number(cf232Laterality(x.ex)?.restAfterBothSidesSec)||90:Number(x?.rest)||90;
  cf233B5ManualRest(secs);
 };
 window.cfuxComplete=function(pos,si,side){let o=active(),x=o?.m.exercises[pos];if(!x||o.s.status!=='active')return toastMsg('Workout zuerst fortsetzen.');
  const log=cf224WorkoutLog(o.m.plan,x.prescriptionKey),z=log.sets[si]||(log.sets[si]={ok:false}),r=side?rowRec(o.m,x,si,side):z;
  const was=side?r.status==='DONE':!!r.ok;
  if(was){clearUndo();if(side){r.status='PENDING';z.ok=false;z.status='PARTIAL';}else r.ok=false;store();render();return}
  let v={};for(let key of ['weight','reps','rir']){let inp=document.getElementById(`cfux-${pos}-${si}-${side||'B'}-${key}`);v[key]=inp?.value===''?null:Number(inp?.value);}
  if(v.weight===null||v.weight<0||!Number.isFinite(v.weight)||!Number.isInteger(v.reps)||v.reps<=0||!Number.isInteger(v.rir)||v.rir<0||v.rir>4)return toastMsg('Bitte kg, Wiederholungen und RIR gültig eintragen.');
  clearUndo();if(hasDeferred(o,x.ex.slot_id))o.w.uxDeferredSlots=deferred(o).filter(k=>k!==x.ex.slot_id);Object.assign(r,v);if(side){r.status='DONE';r.recordedAt=new Date().toISOString();z.ok=z.sides?.LEFT?.status==='DONE'&&z.sides?.RIGHT?.status==='DONE';z.status=z.ok?'DONE':'PARTIAL';}else z.ok=true;
  store();if(side&&!z.ok){render();return}
  const steps=cf232Stages(),idx=steps.findIndex(t=>t.position===pos&&t.setIndex===si);
  if(idx>=0){
   o.s.cf232Cursor=idx;o.s.position=pos;o.s.setIndex=si;o.s.cf232Side=null;store();cf21AdvanceKpr();
   // The legacy scheduler intentionally returns 0 at solo exercise boundaries.
   // In the all-sets player a completed solo set should start its prescribed
   // rest if another set remains. Preserve zero-second transitions inside groups.
   if(!cf232GroupFor(o.d,x.ex)&&!o.s.cf232Rest&&state.settings?.autoRest!==false&&o.s.status==='active'){
    const current=cf224Model(o.s.programKey),remaining=cf232Stages().some(t=>!cf232Done(current,t));
    if(remaining){
     const secs=laterality(x.ex)?Number(cf232Laterality(x.ex)?.restAfterBothSidesSec)||90:Number(x.rest)||90;
     if(secs>0)cf232StartRest(secs,'NEXT_EXERCISE');
    }
   }
  }else render();
 };
 window.cfuxAddSet=function(pos){let o=active(),x=o?.m.exercises[pos];if(!x)return; if(x.sets>=30)return toastMsg('Maximal 30 Sätze.');recordUndo(o,'Satz hinzufügen');x.ex.sets=Math.min(30,x.sets+1);swipeOpen=null;store();render()};
 // Swipe only reveals an explicit red Delete button. Tapping it deletes the set
 // (including completed ones) but saves an immediate, persistent session-only undo.
 // A second native confirm was confusing: "Abbrechen" is NOT "Rückgängig".
 window.cfuxDeleteSet=function(pos,si){
  const o=active(),x=o?.m.exercises[pos];
  if(!x||!Number.isInteger(si)||si<0||si>=x.sets)return false;
  if(x.sets<=1){toastMsg('Mindestens ein Satz muss bleiben.');return false}
  const log=cf224WorkoutLog(o.m.plan,x.prescriptionKey);
  const rec=log?.sets?.[si];
  const oldCount=x.sets;
  const removed=cf224Clone(rec??null);
  const currentSlot=o.d.exercises[o.s.position]?.slot_id;
  const previousFocus=cf224Clone({position:o.s.position,setIndex:o.s.setIndex,side:o.s.cf232Side,cursor:o.s.cf232Cursor});
  log.sets.splice(si,1);
  x.ex.sets=oldCount-1;
  // Keep the current exercise selected and shift the focused set index when
  // an earlier row is removed. No completion/timer callback is invoked.
  if(currentSlot===x.ex.slot_id){
   o.s.setIndex=Math.max(0,Math.min(x.ex.sets-1,o.s.setIndex>si?o.s.setIndex-1:o.s.setIndex));
  }
  const steps=cf232Stages();
  const ix=steps.findIndex(t=>t.position===o.s.position&&t.setIndex===o.s.setIndex);
  if(ix>=0)o.s.cf232Cursor=ix;
  else if(steps.length){o.s.cf232Cursor=0;o.s.position=steps[0].position;o.s.setIndex=steps[0].setIndex}
  deleteUndo={sessionId:o.s.id,key:x.prescriptionKey,slot:x.ex.slot_id,index:si,record:removed,focus:previousFocus};
  o.w.uxLastDeleteUndo=cf224Clone(deleteUndo);
  swipeOpen=null;
  const y=window.scrollY;
  store();render();requestAnimationFrame(()=>{
   window.scrollTo({top:y,left:0,behavior:'instant'});
   document.querySelector('.cfux-undo-delete button')?.focus({preventScroll:true});
  });
  return true;
 };
 window.cfuxUndoDelete=function(){
  const o=active(),u=pendingDelete(o);
  if(!o||!u)return false;
  const pos=o.d.exercises.findIndex(e=>e.slot_id===u.slot);
  const x=o.m.exercises[pos];
  if(!x||x.prescriptionKey!==u.key||x.sets>=30){deleteUndo=null;delete o.w.uxLastDeleteUndo;store();render();return false}
  const log=cf224WorkoutLog(o.m.plan,u.key);
  log.sets.splice(u.index,0,cf224Clone(u.record));
  x.ex.sets++;
  // Restore the position within the same workout; never overwrite later logs.
  if(o.s.position===pos){o.s.setIndex=Math.min(x.ex.sets-1,o.s.setIndex>=u.index?o.s.setIndex+1:o.s.setIndex)}
  if(u.focus.position===pos){o.s.setIndex=u.focus.setIndex;o.s.cf232Side=u.focus.side}
  const steps=cf232Stages();const ix=steps.findIndex(t=>t.position===o.s.position&&t.setIndex===o.s.setIndex);
  if(ix>=0)o.s.cf232Cursor=ix;
  deleteUndo=null;delete o.w.uxLastDeleteUndo;swipeOpen=null;
  const y=window.scrollY;store();render();requestAnimationFrame(()=>window.scrollTo({top:y,left:0,behavior:'instant'}));
  return true;
 };
 window.cfuxRemoveSet=function(pos){let o=active(),x=o?.m.exercises[pos];if(!x)return;return window.cfuxDeleteSet(pos,x.sets-1)};
 // Android / touch gesture: horizontal only, leaves vertical scrolling, numeric
 // fields and the separate exercise drag handle untouched.
 let swipeGesture=null;
 function setSwipeOpen(key){
  swipeOpen=key;
  document.querySelectorAll('.cfux-workout .cfux-swipe').forEach(el=>{
   el.classList.toggle('cfux-swipe-open',el.dataset.cfuxSwipe===key);
   el.classList.remove('cfux-swiping');
   const inner=el.querySelector('.cfux-swipe-content');if(inner)inner.style.transform='';
  });
 }
 document.addEventListener('pointerdown',event=>{
  const el=event.target?.closest?.('.cfux-workout .cfux-swipe');
  if(!el||!active()||event.button!==0||event.target?.closest?.('.cfux-swipe-delete'))return;
  swipeGesture={id:event.pointerId,el,startX:event.clientX,startY:event.clientY,dx:0,armed:false,wasOpen:el.dataset.cfuxSwipe===swipeOpen};
 });
 document.addEventListener('pointermove',event=>{
  const g=swipeGesture;if(!g||g.id!==event.pointerId)return;
  const dx=event.clientX-g.startX,dy=event.clientY-g.startY;
  if(!g.armed){
   if(Math.abs(dy)>12&&Math.abs(dy)>Math.abs(dx)){swipeGesture=null;return}
   if(Math.abs(dx)<12||Math.abs(dx)<Math.abs(dy)*1.3)return;
   if((!g.wasOpen&&dx>=0)||(g.wasOpen&&dx<=0))return;
   g.armed=true;g.el.classList.add('cfux-swiping');
   try{g.el.setPointerCapture(event.pointerId)}catch(_){}
  }
  g.dx=dx;
  const offset=Math.max(0,Math.min(102,(g.wasOpen?102:0)-dx));
  const content=g.el.querySelector('.cfux-swipe-content');
  if(content)content.style.transform=`translate3d(${-offset}px,0,0)`;
  event.preventDefault();
 });
 document.addEventListener('pointerup',event=>{
  const g=swipeGesture;if(!g||g.id!==event.pointerId)return;
  swipeGesture=null;
  if(g.armed){
   setSwipeOpen((g.wasOpen?g.dx<45:g.dx< -55)?g.el.dataset.cfuxSwipe:null);
   event.preventDefault();
  }else if(swipeOpen!==null&&!event.target?.closest?.('.cfux-swipe-delete'))setSwipeOpen(null);
 });
 document.addEventListener('pointercancel',event=>{if(swipeGesture?.id===event.pointerId){swipeGesture=null;setSwipeOpen(swipeOpen)}});
 // Rearrange only the *active manual-plan session*. Each exercise keeps its stable
 // slot/prescription key, history log and unilateral sides. Never reorder a template.
 window.cfuxDragReorder=function(from,to){
  swipeOpen=null;deleteUndo=null;
  const o=active(),es=o?.d.exercises;
  if(!es||!Number.isInteger(from)||!Number.isInteger(to)||from<0||to<0||from>=es.length||to>=es.length||from===to)return false;
  const s=o.s,focusedSlot=es[s.position]?.slot_id,focusedSet=s.setIndex;
  recordUndo(o,'Reihenfolge');const [moved]=es.splice(from,1);es.splice(to,0,moved);
  // Preserve group membership; its exercise sequence follows the new card order.
  for(const g of o.d.exerciseGroups||[]){
   const members=new Set(g.prescriptionIds||[]);
   g.prescriptionIds=es.map(e=>e.slot_id).filter(id=>members.has(id));
  }
  // The guided cursor is an *index*. Rebase it to the same exercise and set,
  // without completing a set or altering a rest timer.
  if(focusedSlot){
   const position=es.findIndex(e=>e.slot_id===focusedSlot);
   if(position>=0){
    s.position=position;s.setIndex=focusedSet;
    const steps=cf232Stages();
    const index=steps.findIndex(t=>t.position===position&&t.setIndex===focusedSet);
    if(index>=0)s.cf232Cursor=index;
    else if(steps.length){
     const first=steps.findIndex(t=>!cf232Done(cf224Model(s.programKey),t));
     const k=first>=0?first:0;
     s.cf232Cursor=k;s.position=steps[k].position;s.setIndex=steps[k].setIndex;
    }
   }
  }
  const scrollY=window.scrollY;
  store();render();
  requestAnimationFrame(()=>window.scrollTo({top:scrollY,left:0,behavior:'instant'}));
  return true;
 };
 window.cfuxMove=function(pos,dir){return window.cfuxDragReorder(pos,pos+dir)};
 // Pointer Events work on Android touch as well as mouse/stylus. Listeners are
 // delegated because the workout is re-rendered after every logged set.
 let drag=null,dragFrame=0;
 function clearDrag(){
  if(drag?.preview)drag.preview.remove();
  document.querySelectorAll('.cfux-dragging,.cfux-drop-before,.cfux-drop-after').forEach(el=>el.classList.remove('cfux-dragging','cfux-drop-before','cfux-drop-after'));
  if(drag?.handle?.hasPointerCapture?.(drag.id))try{drag.handle.releasePointerCapture(drag.id)}catch(_){}
  drag=null;
  if(dragFrame){cancelAnimationFrame(dragFrame);dragFrame=0}
 }
 function dragTarget(){
  if(!drag?.started)return;
  document.querySelectorAll('.cfux-drop-before,.cfux-drop-after').forEach(el=>el.classList.remove('cfux-drop-before','cfux-drop-after'));
  const hit=document.elementFromPoint(drag.x,drag.y)?.closest('.cfux-workout .cfux-ex');
  drag.destination=null;
  if(!hit)return;
  const ix=Number(hit.dataset.cfuxIndex);
  if(!Number.isInteger(ix))return;
  const rect=hit.getBoundingClientRect(),after=drag.y>rect.top+rect.height/2;
  const count=active()?.d.exercises?.length||0;
  let destination=ix+(after?1:0);
  if(drag.from<destination)destination--;
  destination=Math.max(0,Math.min(count-1,destination));
  if(destination===drag.from)return;
  drag.destination=destination;
  hit.classList.add(after?'cfux-drop-after':'cfux-drop-before');
 }
 function dragAutoScroll(){
  dragFrame=0;
  if(!drag?.started)return;
  const h=window.innerHeight,top=85,bottom=h-110;
  if(drag.y<top)window.scrollBy(0,-Math.min(15,Math.max(0,(top-drag.y)*.22)));
  else if(drag.y>bottom)window.scrollBy(0,Math.min(15,Math.max(0,(drag.y-bottom)*.22)));
  dragTarget();
  dragFrame=requestAnimationFrame(dragAutoScroll);
 }
 document.addEventListener('pointerdown',event=>{
  const handle=event.target?.closest?.('.cfux-workout .cfux-draghandle');
  if(!handle||event.button!==0||drag||!active())return;
  const from=Number(handle.dataset.cfuxDragHandle);
  if(!Number.isInteger(from))return;
  drag={id:event.pointerId,handle,from,x:event.clientX,y:event.clientY,startX:event.clientX,startY:event.clientY,started:false,destination:null,preview:null};
  try{handle.setPointerCapture(event.pointerId)}catch(_){}
  event.preventDefault();
 });
 document.addEventListener('pointermove',event=>{
  if(!drag||event.pointerId!==drag.id)return;
  drag.x=event.clientX;drag.y=event.clientY;
  if(!drag.started&&Math.hypot(event.clientX-drag.startX,event.clientY-drag.startY)<7)return;
  if(!drag.started){
   drag.started=true;
   const card=document.querySelector(`.cfux-workout .cfux-ex[data-cfux-index="${drag.from}"]`);
   card?.classList.add('cfux-dragging');
   const preview=document.createElement('div');preview.className='cfux-drag-preview';
   preview.textContent='⠿  '+(card?.querySelector('.cfux-exname h3')?.textContent||'Übung');
   document.body.appendChild(preview);drag.preview=preview;
   dragFrame=requestAnimationFrame(dragAutoScroll);
  }
  drag.preview.style.left=Math.max(8,Math.min(window.innerWidth-258,event.clientX-45))+'px';
  drag.preview.style.top=Math.max(8,event.clientY-26)+'px';
  dragTarget();event.preventDefault();
 });
 document.addEventListener('pointerup',event=>{
  if(!drag||event.pointerId!==drag.id)return;
  const {started,from,destination}=drag;
  clearDrag();
  if(started&&destination!==null)window.cfuxDragReorder(from,destination);
 });
 document.addEventListener('pointercancel',event=>{if(drag&&event.pointerId===drag.id)clearDrag()});
 window.addEventListener('blur',clearDrag);
 document.addEventListener('keydown',event=>{
  const handle=event.target?.closest?.('.cfux-workout .cfux-draghandle');
  if(!handle||!['ArrowUp','ArrowDown'].includes(event.key))return;
  event.preventDefault();
  const from=Number(handle.dataset.cfuxDragHandle),to=from+(event.key==='ArrowUp'?-1:1);
  window.cfuxDragReorder(from,to);
  requestAnimationFrame(()=>document.querySelector(`.cfux-workout .cfux-draghandle[data-cfux-drag-handle="${to}"]`)?.focus());
 });
 window.cfuxSelect=function(pos,v){let o=active(),x=o?.m.exercises[pos];if(!x)return;v?selected.add(x.ex.slot_id):selected.delete(x.ex.slot_id)};
 window.cfuxGroupSelected=function(){let o=active();if(!o)return;const ids=o.d.exercises.map(e=>e.slot_id).filter(id=>selected.has(id));if(ids.length<2)return toastMsg('Wähle mindestens zwei Übungen über die Auswahlkästchen.');const busy=new Set((o.d.exerciseGroups||[]).flatMap(g=>g.prescriptionIds));if(ids.some(id=>busy.has(id)))return toastMsg('Eine ausgewählte Übung ist bereits in einer Gruppe. Löse diese zuerst auf.');recordUndo(o,'Satzgruppe');o.d.exerciseGroups=o.d.exerciseGroups||[];o.d.exerciseGroups.push({groupId:'uxg_'+uid(),kind:cf232GroupKind(ids.length,false),prescriptionIds:ids,restBetweenExercisesSec:0,restAfterRoundSec:120});selected.clear();store();render()};
 window.cfuxAllCircuit=function(){let o=active();if(!o||o.d.exercises.length<2)return;const ids=o.d.exercises.map(e=>e.slot_id);if(o.d.exerciseGroups?.length&&!confirm('Bestehende Gruppen für einen gemeinsamen Zirkel auflösen?'))return;recordUndo(o,'Zirkel');o.d.exerciseGroups=[{groupId:'uxg_'+uid(),kind:'CIRCUIT',prescriptionIds:ids,restBetweenExercisesSec:0,restAfterRoundSec:120}];selected.clear();store();render()};
 window.cfuxUngroup=function(code){let o=active();if(!o)return;recordUndo(o,'Satzgruppe auflösen');o.d.exerciseGroups=(o.d.exerciseGroups||[]).filter(g=>g.groupId!==cfuxDecode(code));store();render()};
 window.cfuxGroupRest=function(code,key,val){let o=active(),g=o?.d.exerciseGroups?.find(x=>x.groupId===cfuxDecode(code));if(!g||!['restBetweenExercisesSec','restAfterRoundSec'].includes(key))return;recordUndo(o,'Gruppenpause');g[key]=Math.min(3600,Math.max(0,+val||0));store()};
 window.cfuxActions=function(pos){let o=active(),x=o?.m.exercises[pos];if(!x)return;openSheet(`<div class="cfux-sheet"><h2>${cfuxEsc(x.name)}</h2><button onclick="cfuxTools.openNote('${cfuxCode(x.name)}','${cfuxCode(x.ex.cue||x.ex.note||'')}')">✎ Übungsnotiz</button><button onclick="cfuxTools.warmup('${cfuxCode(x.name)}',${cf224ExpectedWeight(x)||cfuxTools.workWeightEngine(o.m,x)})">Aufwärm-Rechner</button><button onclick="cfuxReplaceStart(${pos})">Übung austauschen</button><button onclick="cfuxAddSet(${pos});closeSheet()">＋ Satz hinzufügen</button><button onclick="cfuxRemoveSet(${pos});closeSheet()">Letzten Satz entfernen</button><button onclick="cfuxToggleUnilateral(${pos});closeSheet()">${laterality(x.ex)?'Unilateral deaktivieren':'Unilateral · links/rechts'}</button><button class="danger" onclick="cfuxRemoveExercise(${pos});closeSheet()">Übung entfernen</button><button onclick="closeSheet()">Zurück</button></div>`)};
 window.cfuxToggleUnilateral=function(pos){let o=active(),x=o?.m.exercises[pos];if(!x)return;let L=cf224WorkoutLog(o.m.plan,x.prescriptionKey,false);if((L?.sets||[]).some(z=>z?.ok||z?.sides))return toastMsg('Unilateral-Modus vor dem ersten Satz ändern. Bereits erfasste Daten bleiben geschützt.');recordUndo(o,'Seitenmodus');x.ex.laterality=laterality(x.ex)?null:{mode:'UNILATERAL_SEQUENTIAL',startSidePolicy:'WEAKER_FIRST',manualFallbackSide:null,restBetweenSidesSec:0,restAfterBothSidesSec:90};if(x.ex.laterality)x.ex._uxConfig={...(x.ex._uxConfig||{}),mode:'FIXED'};store();render()};
 function names(){try{let obj=cfExRegistry()?.items||{};return [...new Set(Object.values(obj).map(x=>x?.name).filter(Boolean))].slice(0,500)}catch(_){return[]}}
 window.cfuxOpenAdd=function(replace=null){window.cfuxReplacing=replace;const choices=names().slice(0,24).map(n=>`<button onclick="cfuxChooseExercise('${cfuxCode(n)}')">${cfuxEsc(n)}</button>`).join('');openSheet(`<div class="cfux-sheet"><h2>${replace==null?'Übung hinzufügen':'Übung austauschen'}</h2><label>Übung suchen oder Name eingeben<input id="cfux-new-name" autocomplete="off" placeholder="z. B. einarmige Curls" oninput="cfuxFilterExercises(this.value)"></label><div id="cfux-suggestions">${choices}</div><button class="primary" onclick="cfuxChooseExerciseName()">${replace==null?'Übung hinzufügen':'Austauschen'}</button><button onclick="closeSheet()">Abbrechen</button></div>`)};
 window.cfuxFilterExercises=function(q){const node=document.getElementById('cfux-suggestions');if(!node)return;node.innerHTML=names().filter(n=>n.toLowerCase().includes(String(q).trim().toLowerCase())).slice(0,35).map(n=>`<button onclick="cfuxChooseExercise('${cfuxCode(n)}')">${cfuxEsc(n)}</button>`).join('')};
 window.cfuxChooseExerciseName=function(){const n=document.getElementById('cfux-new-name')?.value?.trim();if(!n)return toastMsg('Bitte Übungsnamen eingeben.');cfuxChooseExercise(cfuxCode(n))};
 window.cfuxChooseExercise=function(code){let name=cfuxDecode(code).trim(),o=active();if(!o||!name)return;
  const ex={slot_id:'uxslot_'+uid(),exercise_id:'ux_'+uid(),name,role:'Übung',sets:3,reps:'8-12',rir:'2',rest:'90',laterality:null};ex._uxRxKey=`${o.d.day_id}|${ex.exercise_id}|ux_${uid()}`;ex._uxConfig={...cf224DefaultConfig(o.d,ex,o.d.exercises.length),mode:'FIXED'};
  const pos=window.cfuxReplacing;recordUndo(o,pos==null?'Übung hinzufügen':'Übung austauschen');
   if(pos===null||pos===undefined){o.d.exercises.push(ex)}else{let old=o.m.exercises[pos];if(!old)return;const L=cf224WorkoutLog(o.m.plan,old.prescriptionKey,false)?.sets||[],completed=L.reduce((n,z,i)=>z?.ok?Math.max(n,i+1):n,0);if(completed){let remaining=Math.max(1,old.sets-completed);old.ex.sets=completed;ex.sets=remaining;o.d.exercises.splice(pos+1,0,ex)}else{ex.sets=old.sets;const prev=old.ex.slot_id;o.d.exercises[pos]=ex;o.d.exerciseGroups=(o.d.exerciseGroups||[]).map(g=>({...g,prescriptionIds:g.prescriptionIds.map(id=>id===prev?ex.slot_id:id)}));o.w.uxRemoved.push(cf224Clone(old.ex))}}
  window.cfuxReplacing=null;closeSheet();store();render();toastMsg('Übung übernommen – Vorlage unverändert.');
 };
 window.cfuxReplaceStart=function(pos){closeSheet();cfuxOpenAdd(pos)};
 window.cfuxRemoveExercise=function(pos){let o=active(),x=o?.m.exercises[pos];if(!x||o.d.exercises.length<=1)return toastMsg('Mindestens eine Übung erforderlich.');if(!confirm('Übung aus dieser Einheit entfernen? Bereits gespeicherte Sätze bleiben im Session-Archiv.'))return;recordUndo(o,'Übung entfernen');const e=o.d.exercises.splice(pos,1)[0];o.w.uxRemoved.push(cf224Clone(e));o.d.exerciseGroups=(o.d.exerciseGroups||[]).map(g=>({...g,prescriptionIds:g.prescriptionIds.filter(id=>id!==e.slot_id)})).filter(g=>g.prescriptionIds.length>=2);selected.delete(e.slot_id);store();render()};
 // Explicitly retain snapshot for rich history — without modifying canonical plan version.
 const cfuxFinishBase=cf224FinishEngineWorkout;
 cf224FinishEngineWorkout=function(){let o=active(),p=o?.m.plan,w=o?.w,snapshot=w?.uxDay?cf224Clone(w.uxDay):null,removed=w?.uxRemoved?cf224Clone(w.uxRemoved):[],key=w?.sessionKey;const n=p?.history?.length||0;const baseline=w?.uxBaseline||cf224ActiveVersion(p)?.structure?.days?.find(d=>d.day_id===snapshot?.day_id);const modified=!!snapshot && layoutSignature(snapshot)!==layoutSignature(baseline);const result=cfuxFinishBase();if(!cf21SessionLive())hideTimer();if(snapshot&&p?.history?.length>n){const entry=p.history.at(-1);if(entry?.sessionKey===key){entry.uxDay=snapshot;entry.uxRemoved=removed;entry.uxModified=modified;save();render()}}return result};
 // Physique · fast input, original measurements, 7-day trend (never fabricated interpolation).
 let range='4W';
 function weightPts(){const byDay=new Map();cf23Measurements().slice().sort((a,b)=>String(a.updatedAt).localeCompare(String(b.updatedAt))).forEach(m=>{if(Number(m.bodyWeightKg)>0)byDay.set(m.date,{date:m.date,w:Number(m.bodyWeightKg),id:m.id})});const arr=[...byDay.values()].sort((a,b)=>a.date.localeCompare(b.date));const days=range==='4W'?28:range==='3M'?90:range==='6M'?183:Infinity,cut=Date.now()-days*864e5;const show=arr.filter(p=>days===Infinity||new Date(p.date+'T12:00:00').getTime()>=cut);return show.map(p=>{const ts=new Date(p.date+'T12:00:00').getTime(),prior=arr.filter(x=>{let d=ts-new Date(x.date+'T12:00:00').getTime();return d>=0&&d<7*864e5});return {...p,trend:prior.reduce((s,x)=>s+x.w,0)/prior.length,samples:prior.length}})}
 function graph(pts){
  if(!pts.length)return '<div class="cfux-empty">Noch keine Gewichtsmessungen. Trage dein erstes Gewicht ein.</div>';
  if(pts.length===1)return `<div class="cfux-empty">Erster Messpunkt: ${fmt(pts[0].w)} kg · ein Trend braucht weitere Tage.</div>`;
  const min=Math.min(...pts.flatMap(p=>[p.w,p.trend]))-.25,max=Math.max(...pts.flatMap(p=>[p.w,p.trend]))+.25,span=Math.max(.1,max-min);
  // True calendar spacing: 2 days must not look as long as 2 months.
  const firstDay=Date.parse(pts[0].date+'T12:00:00'),lastDay=Date.parse(pts.at(-1).date+'T12:00:00');
  const elapsed=Math.max(1,lastDay-firstDay),x=i=>16+318*((Date.parse(pts[i].date+'T12:00:00')-firstDay)/elapsed);
  const y=v=>137-(v-min)/span*112;
  const trace=k=>pts.map((p,i)=>`${i?'L':'M'}${x(i).toFixed(1)},${y(p[k]).toFixed(1)}`).join(' ');
  const points=pts.map((p,i)=>{
   const label=cfuxEsc(`${p.date}: ${fmt(p.w)} kg. Messung bearbeiten`),code=cfuxCode(p.id),cx=x(i).toFixed(1),cy=y(p.w).toFixed(1);
   return `<g><circle cx="${cx}" cy="${cy}" r="5" fill="var(--card)" stroke="var(--muted)" stroke-width="2" pointer-events="none"/>
   <circle class="cfux-weight-hit" cx="${cx}" cy="${cy}" r="15" fill="transparent" tabindex="0" role="button" aria-label="${label}" onclick="cfuxWeightEdit('${code}')" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();cfuxWeightEdit('${code}')}"/><title>${cfuxEsc(p.date)} · ${fmt(p.w)} kg</title></g>`;
  }).join('');
  return `<svg viewBox="0 0 350 164" role="group" aria-label="Gewichtsmessungen nach tatsächlichem Datum und bereinigter 7-Tage-Trend"><path d="M16 137H335 M16 81H335 M16 25H335" stroke="currentColor" stroke-opacity=".14" fill="none"/>
   <path d="${trace('w')}" fill="none" stroke="var(--muted)" stroke-width="1.7" stroke-dasharray="3 4"/>
   <path d="${trace('trend')}" fill="none" stroke="var(--accent)" stroke-width="3.5" stroke-linejoin="round" stroke-linecap="round"/>
   ${points}<text x="17" y="13" fill="var(--muted)" font-size="11">${fmt(max)} kg</text><text x="17" y="158" fill="var(--muted)" font-size="10">${cfuxEsc(pts[0].date.slice(5))}</text><text x="334" y="158" text-anchor="end" fill="var(--muted)" font-size="10">${cfuxEsc(pts.at(-1).date.slice(5))}</text></svg>`;
 }
 window.cfuxWeightRange=function(v){if(!['4W','3M','6M','ALL'].includes(v))return;range=v;render()};
 window.cfuxWeightEdit=function(code=''){let m=cf23FindMeasurement(cfuxDecode(code)),d=m?.date||today(),v=m?.bodyWeightKg??'';openSheet(`<div class="cfux-sheet"><h2>${m?'Messung bearbeiten':'Gewicht erfassen'}</h2><label>Datum<input id="cfux-wdate" type="date" value="${cfuxEsc(d)}"></label><label>Gewicht (kg)<input id="cfux-wval" type="number" inputmode="decimal" min="20" max="600" step="0.1" value="${cfuxEsc(v)}"></label><button class="primary" onclick="cfuxWeightSave('${cfuxCode(m?.id||'')}')">Speichern</button><button onclick="closeSheet()">Abbrechen</button></div>`)};
 window.cfuxWeightSave=function(code){const id=cfuxDecode(code),m=id?cf23FindMeasurement(id):null,d=document.getElementById('cfux-wdate')?.value,v=Number(document.getElementById('cfux-wval')?.value);if(!/^\d{4}-\d{2}-\d{2}$/.test(d||'')||!Number.isFinite(v)||v<20||v>600)return toastMsg('Datum und Gewicht prüfen.');if(m&&m.date!==d&&cf23Measurements().some(x=>x.date===d&&x.source==='PHYSIQUE_CHECKIN'))return toastMsg('Für dieses Datum gibt es bereits einen Check-in.');if(m){const prev=m.date;m.date=d;m.bodyWeightKg=v;cf23UpsertMeasurement(m,{persist:false,mirrorLegacy:true});if(prev!==d&&state.body?.entries){/* Historical non-weight measures are preserved; legacy weight stays as an archived reference. */}}else{const existing=cf23Measurements().find(x=>x.date===d);if(existing){existing.bodyWeightKg=v;cf23UpsertMeasurement(existing,{persist:false,mirrorLegacy:true})}else cf23UpsertMeasurement({date:d,bodyWeightKg:v,source:'PHYSIQUE_CHECKIN'},{persist:false,mirrorLegacy:true})}store();closeSheet();render();toastMsg('Gewicht gespeichert ✓')};
 function physique(){let snap=cf23B2CurrentSnapshot(),pts=weightPts(),latest=snap.weight?.value,first=pts[0],last=pts.at(-1),delta=first&&last?last.trend-first.trend:null,comp=snap.composition;
  let ms=cf23Measurements().slice().reverse().slice(0,8);
  const stat=(n,v)=>`<div class="cfux-stat"><small>${n}</small><strong>${v}</strong></div>`;
  return `<div class="cfux-phys"><div class="cfux-flex"><div><div class="cfux-kicker">PHYSIQUE · CURRENT BUILD</div><h1>Dein Körper</h1></div><button class="primary" onclick="cfuxWeightEdit()">＋ Gewicht</button></div><section class="cfux-weight"><small>AKTUELLES GEWICHT</small><div class="cfux-big">${latest==null?'–':fmt(latest)+' kg'}</div><p>${delta==null?'Für die Entwicklung weitere Messungen erfassen':`${delta>0?'+':''}${fmt(delta)} kg · Trend seit erster Messung im Zeitraum`}</p><div class="cfux-flex"><h2>Gewichtsentwicklung</h2><div class="cfux-period">${[['4W','4W'],['3M','3M'],['6M','6M'],['ALL','Alles']].map(([v,label])=>`<button class="${range===v?'sel':''}" onclick="cfuxWeightRange('${v}')">${label}</button>`).join('')}</div></div>${graph(pts)}<div class="cfux-legend">— Bereinigter 7-Tage-Trend <span>··· Einzelmessungen (antippen zum Bearbeiten)</span></div></section><section class="cfux-statgrid">${stat('KFA',cf23B2BodyFatText(snap.bf?.value||null))}${stat('FFM',comp.available?cf23B2RangeText(comp.ffmLow,comp.ffmHigh,1,' kg'):'–')}${stat('FFMI',comp.available?cf23B2RangeText(comp.ffmiLow,comp.ffmiHigh,1):'–')}${stat('nFFMI',comp.available?cf23B2RangeText(comp.nffmiLow,comp.nffmiHigh,1):'–')}</section><details class="cfux-details"><summary>Alle Körpermaße & Statistiken</summary>${cf23D0Current()}</details><details class="cfux-details"><summary>Messhistorie & ausführlicher Check-in</summary><div class="cfux-meas">${ms.map(m=>`<div class="cfux-flex"><span>${cfuxEsc(m.date)} · ${m.bodyWeightKg==null?'–':fmt(m.bodyWeightKg)+' kg'}</span><button onclick="cfuxWeightEdit('${cfuxCode(m.id)}')">Bearbeiten</button></div>`).join('')}</div><button onclick="cf23B7Open('checkin')">Alle Körperwerte erfassen</button><button onclick="cf23B7Open('history')">Detaillierter Verlauf</button></details></div>`;
 }
 const cfuxOldPhysique=cf23D0Render;
 cf23D0Render=function(){return cf23D0Screen==='checkin'||cf23D0Screen==='history'?cfuxOldPhysique():physique()};
 // Open simplified Physique directly instead of a second 'gateway' page.
 const cfuxOldProgress=renderProgressHubV2;
 renderProgressHubV2=function(){if((state.progressSub||'body')==='strength')return strength();return physique()};
 // Kraftansicht: three direct questions — aktuelle Kraft, Bestleistung, Verlauf.
 const cfuxAdvancedProgress=renderProgress;
 function strength(){
  let pts=allProgressPoints(),keys=['squat','bench','deadlift','ohp'],cards=keys.map(k=>{
   let arr=pts.filter(x=>x.lift===k&&Number(x.e1rm)>0),last=arr.at(-1),best=Math.max(0,...arr.map(x=>Number(x.e1rm)||0));
   return `<div class="cfux-stat"><small>${cfuxEsc(liftLabel(k))}</small><strong>${last?fmt(last.e1rm)+' kg':'–'}</strong><small>Bestwert ${best?fmt(best)+' kg':'–'}</small></div>`;
  }).join('');
  return `<div class="cfux-phys"><div class="cfux-kicker">TRAININGSFORTSCHRITT</div><h1>Deine Kraft</h1><p class="muted">Geschätzte Maximalkraft (e1RM) und persönliche Bestwerte – aus deinen protokollierten Sätzen.</p><div class="cfux-statgrid">${cards}</div><details class="cfux-details"><summary>Alle Kraftstatistiken & Diagramme</summary>${cfuxAdvancedProgress()}</details></div>`;
 }
 // Five destinations: Physique is a direct main navigation destination.
 // Reuse the existing Current Build screen and stored measurements; no new state model.
 window.cfuxOpenPhysiqueTab=function(){
   state.progressSub='body';
   cf23B7Open('current');
 };
 renderBottomNav=function(){
   const physiqueButton=navButton('progress','Physique').replace("onclick=\"setView('progress')\"","onclick=\"cfuxOpenPhysiqueTab()\"");
   bottomNav.innerHTML=navButton('home','Heute')+navButton('training','Training')+navButton('nutrition','Ernährung')+physiqueButton+navButton('more','Mehr');
 };
 const cfuxHomeBase=renderHome;
 renderHome=function(){let key=cf218CurrentPlanKey(),session=cf21SessionEnsure(),is=cf21SessionLive(),name=cf217ProgramName(key),date=today(),sum=nutritionTotals(date),goal=state.nutrition?.cycle?.calories||0,pts=weightPts(),p=pts.at(-1);
  return `<div class="cfux-home"><div class="cfux-kicker">HEUTE</div><h1>Bereit fürs Training?</h1><section class="cfux-homehero"><small>${is?'LAUFENDES WORKOUT':'DEIN TRAINING'}</small><h2>${cfuxEsc(is?cf217ProgramName(session.programKey):name)}</h2><button class="primary" onclick="${is?'cf21ResumeActive()':`setView('training')`}">${is?'▶ Workout fortsetzen':'Training öffnen →'}</button></section><div class="cfux-homegrid"><button onclick="setView('nutrition')"><small>ERNÄHRUNG</small><strong>${Math.round(sum.calories||0)} ${goal?'/ '+Math.round(goal):''} kcal</strong><span>Lebensmittel erfassen →</span></button><button onclick="state.progressSub='body';cf23B7Open('current')"><small>KÖRPER</small><strong>${p?fmt(p.w)+' kg':'Noch kein Gewicht'}</strong><span>Gewichtskurve öffnen →</span></button></div><div class="cfux-homemore"><button onclick="setView('training')">Meine Pläne</button><button onclick="setView('more')">Mehr & Einstellungen</button></div></div>`;
 };
 const cfuxNutritionBase=renderNutrition;
 renderNutrition=function(){const base=cfuxNutritionBase();return `<div class="cfux-fast"><strong>Schnell erfassen</strong><div><button class="primary" onclick="openFoodSheet()">＋ Lebensmittel</button><button onclick="openDailyMacroSheet()">Tageswerte</button></div></div>${base}`};
 const cfuxMoreBase=renderMore;
 renderMore=function(){return `<div class="cfux-morelinks"><button onclick="state.progressSub='body';cf23B7Open('current')">⚖ Physique & Gewichtskurve →</button><button onclick="state.progressSub='strength';setView('progress')">↗ Kraftfortschritt →</button></div>${cfuxMoreBase()}`};
 // Hide implementation jargon in ordinary plan view; all versioned data remains intact.
 const cfuxPlanBase=cf224PlanHtml;
 cf224PlanHtml=function(key){let html=cfuxPlanBase(key);return html.replaceAll('Neue Version konfigurieren','Plan bearbeiten').replaceAll('Logic Owner COALFORGED','Eigener Trainingsplan')};
 const cfuxPlansBase=cf206tHubPlans;
 cf206tHubPlans=function(){return cfuxPlansBase().replaceAll('PROGRAM · quellentreue Programmlogik','Trainingsprogramme').replaceAll('COALFORGED Engine','Eigener Plan')};
 // Existing sessions and their original prescriptions remain immutable. Adopting a
 // completed session's layout always creates a NEW plan version after confirmation.
 function uxLatestHistory(){let p=cf224PlanById(state.cf21Finish?.programKey?.replace(/^engine:/,''));if(!p)return null;let h=p.history?.at(-1);return h?.uxDay?{p,h}:null}
 window.cfuxKeepSessionOnly=function(){
  // Results are already committed; only decline changing the template.
  if(state.cf21Finish)state.cf21Finish.uxPlanDecision='SESSION_ONLY';
  state.cf21Finish=null;save();setView('training');
 };
 window.cfuxAdoptLastSession=function(){
  let obj=uxLatestHistory();if(!obj||!obj.h.uxModified)return toastMsg('Keine Planänderung zu übernehmen.');
  const {p,h}=obj;
  if(cf21SessionLive())return toastMsg('Zuerst laufendes Workout abschließen.');
  if(!confirm('Geänderten Trainingsablauf für zukünftige Einheiten als NEUE Planversion speichern? Dein ursprünglicher Plan und alle historischen Einheiten bleiben erhalten.'))return;
  let prior=cf224ActiveVersion(p),target=cf224Clone(prior),ix=target.structure.days.findIndex(d=>d.day_id===h.day_id);if(ix<0)return toastMsg('Trainingstag in Vorlage nicht gefunden.');
  const clean=cf224Clone(h.uxDay);
  const groupIds=new Set(clean.exercises.map(x=>x.slot_id));
  clean.exerciseGroups=(clean.exerciseGroups||[]).map(g=>({...g,prescriptionIds:(g.prescriptionIds||[]).filter(id=>groupIds.has(id))})).filter(g=>g.prescriptionIds.length>=2);
  const configs={};
  target.structure.days[ix]=clean;
  for(const d of target.structure.days)for(const [i,e] of d.exercises.entries()){
   const dest=cf224PrescriptionKey(d,e,i),old=e._uxRxKey;
   configs[dest]={...(e._uxConfig||prior.progressionConfig?.[old]||prior.progressionConfig?.[dest]||cf224DefaultConfig(d,e,i)),key:dest};
   delete e._uxRxKey;delete e._uxConfig;
  }
  // Validate before changing any plan data; malformed edits must never corrupt a version.
  const issues=cf224StructureIssues(cf221SanitizeStructure(target.structure));
  if(issues.length)return toastMsg('Planübernahme nicht möglich: '+issues[0]);
  const n=Math.max(0,...p.versions.map(v=>+v.version||0))+1;
  target.version=n;target.createdAt=new Date().toISOString();target.parentVersion=prior.version;target.progressionConfig=configs;
  p.versions.push(target);p.activeVersion=n;p.progression[String(n)]={};p.updatedAt=new Date().toISOString();
  h.uxPlanDecision='ADOPTED';state.cf21Finish=null;save();setView('training');toastMsg('Neue Planversion '+n+' gespeichert ✓');
 };
 const uxFinishScreenBase=cf224VersionFinishScreen;
 cf224VersionFinishScreen=function(f){let html=uxFinishScreenBase(f),obj=uxLatestHistory();if(!obj||!obj.h.uxModified||obj.p.plan_id!==f.programKey?.replace(/^engine:/,''))return html;
  const prompt=`<section class="cfux-finishplan" aria-labelledby="cfux-finish-question"><strong id="cfux-finish-question">Änderungen am Trainingsplan speichern?</strong><p>Der Trainingsabschluss und deine Satzwerte sind bereits gespeichert. Ohne Bestätigung bleibt die bisherige Planvorlage unverändert.</p><button type="button" class="primary" onclick="cfuxKeepSessionOnly()">Nur für dieses Workout <span aria-hidden="true">✓</span></button><button type="button" onclick="cfuxAdoptLastSession()">Änderungen in Trainingsplan übernehmen</button></section>`;
  return html.replace(/<button class="cf206t-primary" onclick="state\.cf21Finish=null;save\(\);setView\('training'\)">Zur Trainingsübersicht<\/button>/,prompt);
 };
 // Show additions/exchanges in the session snapshot rather than reconstructing
 // the history solely from the original, unchanged plan template.
 const uxHistorySheetBase=cf233B5HistorySheet;
 cf233B5HistorySheet=function(id){
  let p=cf224PlanById(cfuxDecode(id));if(!p?.history?.some(h=>h.uxDay))return uxHistorySheetBase(id);
  let items=p.history.slice(-20).reverse().map(h=>{
   let d=h.uxDay||cf224Version(p,h.version)?.structure?.days?.find(x=>x.day_id===h.day_id);
   let rows=(d?.exercises||[]).map((e,i)=>{
    let k=e._uxRxKey||cf224PrescriptionKey(d,e,i),list=h.logs?.[k]?.sets||[];
    if(!list.length)return '';
    let sets=list.map((z,j)=>{
     if(z.sides)return `Satz ${j+1}: ${['LEFT','RIGHT'].map(side=>{let v=z.sides?.[side];return `${side==='LEFT'?'L':'R'} ${v?.status==='DONE'?`${cfuxEsc(fmt(v.weight))} kg × ${cfuxEsc(v.reps)} · RIR ${cfuxEsc(v.rir)}`:'–'}`}).join(' · ')}`;
     return `Satz ${j+1}: ${cfuxEsc(fmt(z.weight))} kg × ${cfuxEsc(z.reps??'–')} · RIR ${cfuxEsc(z.rir??'–')}`;
    }).join('<br>');return `<div class="cfux-historyrow"><strong>${cfuxEsc(e.name)}</strong><p>${sets}</p></div>`;
   }).join('');
   let dt=h.completedAt?new Date(h.completedAt).toLocaleDateString('de-DE'):'–';
   return `<details class="cfux-historyrow"><summary>${cfuxEsc(dt)} · ${cfuxEsc(h.dayName||d?.name||'Workout')} · Version ${h.version}</summary>${rows||'Keine erfassten Sätze'}</details>`;
  }).join('');
  openSheet(`<div class="cfux-sheet"><h2>${cfuxEsc(p.name)} · Workout-Historie</h2>${items}<button onclick="closeSheet()">Schließen</button></div>`);
 };
 // Same builder data and validation, much smaller editing surface. Advanced
 // prescription/groups remain available without forcing technical screens on users.
 const cfuxBuilderBase=cf223BuilderHtml;
 cf223BuilderHtml=function(){
  const b=cf223State(),issues=cf223Check();
  const days=b.structure.days.map((d,di)=>`<article class="cfux-ex cfux-simpleday"><div class="cfux-simpledayhead"><span>TAG ${di+1}</span><input aria-label="Trainingstag" value="${cfuxEsc(d.name)}" onchange="cf223SetDayName(${di},this.value)"><button onclick="cf223RemoveDay(${di})" aria-label="Tag entfernen">−</button></div>
  ${(d.exercises||[]).map((e,ei)=>`<div class="cfux-builderex"><div class="cfux-flex"><button class="cfux-buildername" onclick="cf223OpenPicker(${di},${ei})">${cfuxEsc(e.name)} <small>✎ Tauschen</small></button><div><button onclick="cf223MoveExercise(${di},${ei},-1)" ${ei===0?'disabled':''}>↑</button><button onclick="cf223MoveExercise(${di},${ei},1)" ${ei===d.exercises.length-1?'disabled':''}>↓</button><button onclick="cf223RemoveExercise(${di},${ei})" class="danger">×</button></div></div><div class="cfux-builderfields"><label>Sätze<input type="number" min="1" max="12" value="${+e.sets||3}" onchange="cf223SetEx(${di},${ei},'sets',this.value)"></label><label>Wdh.<input value="${cfuxEsc(e.reps||'8-12')}" onchange="cf223SetEx(${di},${ei},'reps',this.value)"></label><label>RIR<input value="${cfuxEsc(e.rir??'2')}" onchange="cf223SetEx(${di},${ei},'rir',this.value)"></label><label>Pause<input value="${cfuxEsc(e.rest||'90')}" onchange="cf223SetEx(${di},${ei},'rest',this.value)"></label></div><label class="cfux-builderuni"><input type="checkbox" ${laterality(e)?'checked':''} onchange="cf232SetLaterality(${di},${ei},this.checked)"> Unilateral</label></div>`).join('')||'<p class="muted">Noch keine Übungen – füge eine hinzu.</p>'}
  <button class="cfux-builderadd" onclick="cf223OpenPicker(${di})">＋ Übung hinzufügen</button><details class="cfux-details"><summary>Supersätze, Zirkel und Einstellungen</summary>${cf232GroupEditor(d,di)}${d.exercises.map((e,ei)=>`<label class="cfux-builderuni"><input type="checkbox" onchange="cf232Pick(${di},'${cfuxEsc(e.slot_id)}',this.checked)"> ${cfuxEsc(e.name)} für Satzgruppe auswählen</label>`).join('')}</details></article>`).join('');
  return `<div class="cfux-phys cfux-simplebuilder"><div class="cfux-flex"><div><div class="cfux-kicker">MANUELLER SPLITBUILDER</div><h1>Trainingsplan bearbeiten</h1></div><button onclick="cf223Close()">← Zurück</button></div><label class="cfux-builderplanname">Planname<input value="${cfuxEsc(b.name)}" oninput="cf223SetName(this.value)"></label>${days}<button class="cfux-builderadd" onclick="cf223AddDay()">＋ Trainingstag hinzufügen</button><div class="cfux-builderactions"><button onclick="cf223Save(false)">Entwurf speichern</button><button onclick="cf223Save(true)">Als Vorlage speichern</button><button class="primary" ${issues.length?'disabled':''} onclick="cf224OpenEngineSetupFromBuilder()">Trainingsplan erstellen ${issues.length?'('+issues.length+' Angaben fehlen)':''}</button><details class="cfux-details"><summary>Mehr Einstellungen</summary><div class="cfux-advancedbuilder">${cfuxBuilderBase()}</div></details></div></div>`;
 };
 // UX Lab 8: FatSecret-inspired diary. Presentation layer only; no new nutrition schema.
 // Existing authoritative meal logging, search, recipes, favorites and trend engines are reused.
 let cfuxNView='today';
 const cfuxNNum=x=>Math.max(0,Number(x)||0);
 const cfuxNInt=x=>Math.round(cfuxNNum(x)).toLocaleString('de-DE');
 const cfuxNDateLabel=d=>new Date(d+'T12:00:00').toLocaleDateString('de-DE',{weekday:'short',day:'2-digit',month:'long'});
 const cfuxNIcons={breakfast:'☀',lunch:'◒',dinner:'☾',snack:'◇'};
 function cfuxNMacro(label,eaten,goal){
  const hasGoal=cfuxNNum(goal)>0,p=hasGoal?Math.min(100,Math.max(0,cfuxNNum(eaten)/cfuxNNum(goal)*100)):0;
  return `<div class="cfuxn-macro"><div class="cfuxn-macrohead"><span>${label}</span><strong>${cfuxNInt(eaten)}${hasGoal?' / '+cfuxNInt(goal):''} g</strong></div><div class="cfuxn-track"><i style="width:${p}%"></i></div></div>`;
 }
 function cfuxNMealRow(date,meal){
  let rows=b10MealEntries(date,meal.id),total=b10SumEntries(rows),previous=cfuxNPrevMeal(date,meal.id);
  return `<section class="cfuxn-meal" aria-label="${cfuxEsc(meal.label)}">
   <div class="cfuxn-mealhead"><button class="cfuxn-mealtitle" onclick="cfB6OpenMealSheet('${meal.id}')" aria-label="${cfuxEsc(meal.label)} öffnen"><span class="cfuxn-mealicon">${cfuxNIcons[meal.id]||'◇'}</span><span><strong>${cfuxEsc(meal.label)}</strong><small>${rows.length?`${rows.length} ${rows.length===1?'Lebensmittel':'Lebensmittel'} · ${cfuxNInt(total.protein)} g Protein`:'Noch nichts eingetragen'}</small></span></button><strong class="cfuxn-mealkcal">${rows.length?cfuxNInt(total.calories)+' kcal':'–'}</strong><button class="cfuxn-plus" onclick="openFoodSheet('${meal.id}')" aria-label="Zu ${cfuxEsc(meal.label)} hinzufügen">＋</button></div>
   ${rows.map(({entry})=>`<button class="cfuxn-food" onclick="b10OpenEntrySheet('${cfuxEsc(entry.id||'')}')"><span><strong>${cfuxEsc(entry.name||'Lebensmittel')}</strong><small>${cfuxEsc(fmtWeight(entry.amount||0))} ${cfuxEsc(entry.unit||'g')} · P ${cfuxNInt(entry.protein)} · KH ${cfuxNInt(entry.carbs)} · F ${cfuxNInt(entry.fat)}</small></span><span class="cfuxn-foodkcal">${cfuxNInt(entry.calories)} kcal <span aria-hidden="true">›</span></span></button>`).join('')}
   ${rows.length===0&&previous?`<button class="cfuxn-repeat" onclick="cfuxNRepeatMeal('${meal.id}')">↻ Letzte ${cfuxEsc(meal.label.toLowerCase())} übernehmen <span>${cfuxNInt(previous.tot.calories)} kcal</span></button>`:''}
  </section>`;
 }
 function cfuxNPrevMeal(date,key){
  const dates=Object.keys(state.nutrition?.days||{}).filter(d=>d<date).sort().reverse();
  for(const d of dates){let rows=b10MealEntries(d,key);if(rows.length)return {date:d,rows,tot:b10SumEntries(rows)}}
  return null;
 }
 window.cfuxNRepeatMeal=function(key){
  key=b10ValidMealKey(key);const date=nutritionDate(),prev=cfuxNPrevMeal(date,key);
  if(!prev?.rows.length)return toastMsg('Keine frühere Mahlzeit vorhanden.');
  if(!confirm(`Die ${b9MealLabel(key)} vom ${new Date(prev.date+'T12:00:00').toLocaleDateString('de-DE')} mit ${prev.rows.length} Einträgen für heute übernehmen?`))return;
  const mode=b10EnsureDayModes()[date];
  if(mode==='summary'&&!((state.nutrition.days?.[date]||[]).length)&&!confirm('Für diesen Tag bestehen manuelle Tageswerte. Beim Erfassen einzelner Lebensmittel ersetzen diese die manuelle Tagesbilanz. Fortfahren?'))return;
  const list=nutritionDay(date);
  for(const {entry} of prev.rows){const row=JSON.parse(JSON.stringify(entry));row.id=uid();row.mealKey=key;row.meal=b9MealLabel(key);list.push(row);if(row.foodId)b10TouchUsage(row.foodId,date)}
  b10SetDayMode(date,'items');syncNutritionToBody(date);save();render();toastMsg('Mahlzeit übernommen ✓');
 };
 window.cfuxNShiftDate=function(delta){
  const dt=new Date(nutritionDate()+'T12:00:00');if(Number.isNaN(dt.getTime()))return;
  dt.setDate(dt.getDate()+delta);
  setNutritionDate([dt.getFullYear(),String(dt.getMonth()+1).padStart(2,'0'),String(dt.getDate()).padStart(2,'0')].join('-'));
 };
 window.cfuxNReport=function(tab){if(!['today','week','analysis'].includes(tab))return;cfuxNView=tab;render()};
 function cfuxNToday(date,t,c,configured){
  const goal=cfuxNNum(c.calories),hasGoal=goal>0,remaining=Math.round(goal-cfuxNNum(t.calories)),isOver=remaining<0;
  let manual=b10ManualSummaryNotice(date,state.nutrition.days?.[date]||[]);
  return `<section class="cfuxn-energy"><div class="cfuxn-eyebrow">TAGESBILANZ ${configured?'· '+cfuxEsc(phaseLabel(c.mode).toUpperCase()):''}</div>
   <div class="cfuxn-energytop"><div class="cfuxn-main"><strong>${cfuxNInt(t.calories)} <small>kcal</small></strong><span>gegessen ${hasGoal?'von '+cfuxNInt(goal)+' kcal':''}</span></div><div class="cfuxn-remainder"><strong class="${isOver?'over':''}">${hasGoal?cfuxNInt(Math.abs(remaining)):'—'}</strong><span>${hasGoal?(isOver?'über dem Ziel':'kcal übrig'):'Ziel offen'}</span></div></div>
   ${hasGoal?`<div class="cfuxn-caltrack" role="progressbar" aria-valuemin="0" aria-valuenow="${Math.round(cfuxNNum(t.calories))}" aria-valuemax="${Math.round(goal)}"><i style="width:${Math.min(100,cfuxNNum(t.calories)/goal*100)}%"></i></div>`:`<button class="cfuxn-setgoal" onclick="openCycleSheet()">Kalorien- und Makroziele festlegen →</button>`}
   <div class="cfuxn-macros">${cfuxNMacro('Protein',t.protein,c.protein)}${cfuxNMacro('Kohlenhydrate',t.carbs,c.carbs)}${cfuxNMacro('Fett',t.fat,c.fat)}</div>
   </section>
   <div class="cfuxn-primaryactions"><button class="cfuxn-mainadd" onclick="openFoodSheet('snack')">＋ Lebensmittel suchen</button><button class="cfuxn-secondaryadd" onclick="openDailyMacroSheet()">Tageswerte</button></div>
   ${manual?`<div class="cfuxn-summary-note">${manual}</div>`:''}
   <div class="cfuxn-sectionhead"><h2>Mein Ernährungstagebuch</h2><span>${cfuxEsc(cfuxNDateLabel(date))}</span></div>
   <div class="cfuxn-meals">${B9_MEALS.slice().sort((a,b)=>a.order-b.order).map(m=>cfuxNMealRow(date,m)).join('')}</div>
   <details class="cfuxn-advanced"><summary>Weitere Ernährungseinstellungen und Auswertungen <span>⌄</span></summary><div class="cfuxn-advancedbuttons"><button onclick="cfuxNReport('week')">7-Tage-Verlauf</button><button onclick="cfuxNReport('analysis')">Analyse</button><button onclick="openCycleSheet()">Ernährungsziel</button><button onclick="openStepTargetSheet()">Schrittziel</button><button onclick="b14OpenFitSheet()">Passende Lebensmittel</button></div><p>Rezepte, Vorlagen, Favoriten und Lebensmittel-Datenbank findest du über „Lebensmittel suchen“.</p></details>`;
 }
 renderNutrition=function(){
  const date=nutritionDate(),t=nutritionTotals(date),c=state.nutrition.cycle||{},configured=cfuxNNum(c.calories)>0&&cfuxNNum(c.protein)>0&&cfuxNNum(c.fat)>0;
  let view=cfuxNView;
  return `<main class="cfuxn-page"><header class="cfuxn-top"><div><div class="cfux-kicker">COALFORGED · NUTRITION</div><h1>Ernährung</h1><p>Eintragen. Überblick behalten. Weitertrainieren.</p></div><button class="cfuxn-topbutton" onclick="openCycleSheet()" aria-label="Ernährungsziele bearbeiten">⚙</button></header>
   <div class="cfuxn-datebar"><button onclick="cfuxNShiftDate(-1)" aria-label="Vortag">‹</button><label><span>${cfuxEsc(cfuxNDateLabel(date))}</span><input type="date" aria-label="Datum wählen" value="${cfuxEsc(date)}" onchange="setNutritionDate(this.value)"></label><button onclick="cfuxNShiftDate(1)" aria-label="Nächster Tag">›</button></div>
   ${view==='today'?cfuxNToday(date,t,c,configured):`<div class="cfuxn-reporthead"><button onclick="cfuxNReport('today')">‹ Tagebuch</button><h2>${view==='week'?'7-Tage-Verlauf':'Ernährungsanalyse'}</h2></div><div class="cfuxn-existingreport">${view==='week'?cf206nWeek(t,c,configured):cf206nAnalysis(date,t,c,configured,cfuxNNum(bodyEntry(date).steps))}</div>`}
   </main>`;
 };

 // Old Commitment planning concepts are deliberately not introduced as runtime features.
 window.CFUX_RELEASE=Object.freeze({version:'2.4.0-UX-LAB8-NUTRITION',planCopyIsolation:true,weightTrend:'trailing-7-calendar-day',currentBuildOnly:true,commitmentEngine:false});
 render();
})();
