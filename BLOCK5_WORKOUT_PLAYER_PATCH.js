/* COALFORGED 2.3.3 / Block 5 — Workout Player hardening.
 * Only affects manual Program Engine workouts. Original protected programs remain untouched.
 * No storage-key or user-data migration. All changes are runtime adapters.
 */
const CF233_B5_VERSION='2.3.3-b5';

// Use the *effective* exercise set count (including plan configuration), not the raw
// source prescription. Preserve the authored order within each exercise group.
cf232Schedule=function(day, model=null){
  const es=day?.exercises||[], groups=cf232DayGroups(day), bySlot=new Map(), stages=[];
  const setsAt=i=>Math.max(0,Math.floor(Number(model?.exercises?.[i]?.sets ?? es[i]?.sets)||0));
  for(const g of groups){
    for(const id of g.prescriptionIds||[])if(!bySlot.has(id))bySlot.set(id,g);
  }
  const grouped=new Set();
  for(let i=0;i<es.length;i++){
    const e=es[i],g=bySlot.get(cf232ExerciseSlot(e));
    if(!g){for(let r=0;r<setsAt(i);r++)stages.push({position:i,setIndex:r,groupId:null,round:r});continue}
    if(grouped.has(g.groupId))continue;
    grouped.add(g.groupId);
    const slots=(g.prescriptionIds||[]).map(id=>es.findIndex(x=>cf232ExerciseSlot(x)===id)).filter(n=>n>=0);
    const total=Math.max(0,...slots.map(setsAt));
    for(let round=0;round<total;round++)for(const pos of slots){
      if(round<setsAt(pos))stages.push({position:pos,setIndex:round,groupId:g.groupId,round});
    }
  }
  return stages;
};
cf232Stages=function(){let m=cf232Model();return m?cf232Schedule(m.day,m):[]};

// A completed side is NOT yet a completed work set. Explicitly resolved partial
// sets remain distinguishable from valid two-sided sets in history and progression.
cf232Done=function(m,step){
  let x=m?.exercises?.[step.position],z=m?.plan?.runtime?.workout?.logs?.[x?.prescriptionKey]?.sets?.[step.setIndex];
  if(!z)return false;
  if(z.resolved&&z.status==='PARTIAL')return true;
  if(cf232Laterality(x?.ex)&&z.sides)return !!(z.ok&&z.sides.LEFT?.status==='DONE'&&z.sides.RIGHT?.status==='DONE');
  return !!z.ok;
};

// Eliminate the legacy timer call only for a bilateral set. The old implementation
// suppressed startTimer globally, inadvertently suppressing the new *group* timer too.
const cf233B5UnilateralSave=cf224SaveSet;
cf224SaveSet=function(){
  let s=cf21SessionEnsure();if(!cf224IsEngineKey(s.programKey))return cf233B5UnilateralSave();
  let m=cf232Model(),x=m?.exercises?.[s.position];
  if(!x||s.status!=='active')return;
  if(cf232Laterality(x.ex))return cf233B5UnilateralSave();
  const w=document.getElementById('cf21Weight')?.value,
        r=document.getElementById('cf21Reps')?.value,
        data=cf224CurrentSetData(),rir=data?.rir;
  if(w===''||w==null||!Number.isFinite(+w)||+w<0)return toastMsg('Bitte ein gültiges Gewicht eintragen.');
  if(r===''||r==null||!Number.isFinite(+r)||+r<=0)return toastMsg('Bitte Wiederholungen eintragen.');
  if(rir==null||!Number.isFinite(+rir)||rir<0||rir>4)return toastMsg('Bitte RIR 4–0 auswählen.');
  const ps=cf224ProgressState(m.plan,m.version.version,x.prescriptionKey);
  if(x.config.mode==='STEADY'){
    let lock=m.plan.runtime.workout.steadyLocks?.[x.prescriptionKey]??ps.steady.lockedWeight;
    if(+lock>0&&Math.abs(+w-(+lock))>.001)return toastMsg(`Steady State: Gewicht bleibt in diesem Block bei ${fmtWeight(lock)} kg.`);
    m.plan.runtime.workout.steadyLocks=m.plan.runtime.workout.steadyLocks||{};
    if(!(+m.plan.runtime.workout.steadyLocks[x.prescriptionKey]>0))m.plan.runtime.workout.steadyLocks[x.prescriptionKey]=+w;
  }
  let L=cf224WorkoutLog(m.plan,x.prescriptionKey);
  let z={weight:Math.round(+w*100)/100,reps:Math.round(+r),rir:+rir,ok:true};
  L.sets[s.setIndex]=z;
  try{cfExRemember(x.name,z,'engine')}catch(_){}
  delete s.rirDrafts[cf21RirKey()];
  save();
  cf21AdvanceKpr(); // one scheduler-owned contextual timer, never an extra exercise timer
};

// A rest period belongs to the active workout, not to a transient DOM timer.
// Keep its absolute deadline across reloads; freeze remaining time on workout pause.
cf232StartRest=function(seconds,cause){
  let s=cf21SessionEnsure(),v=cf232ClampRest(seconds);
  cf232HideTimerBase(); // only hides UI; does not delete the newly persisted context
  cf232TimerHydrated='';
  s.cf232Rest=null;
  if(v>0&&(state.settings?.autoRest!==false||cause==='MANUAL')&&s.status==='active'){
    let deadline=Date.now()+v*1000;
    s.cf232Rest={seconds:v,cause,deadline};
    startTimer(v);
    cf232TimerHydrated=s.sessionKey+'|'+deadline+'|';
  }
  save();
};
cf232HydrateRest=function(){
  let s=cf21SessionEnsure(),r=s.cf232Rest;
  if(!cf224IsEngineKey(s.programKey)||!r||s.status!=='active')return;
  let rem=r.pausedRemain!=null?Math.ceil(+r.pausedRemain):Math.ceil((+r.deadline-Date.now())/1000);
  if(!(rem>0)||(state.settings?.autoRest===false&&r.cause!=='MANUAL')){
    s.cf232Rest=null;cf232TimerHydrated='';cf232HideTimerBase();save();return;
  }
  let token=s.sessionKey+'|'+r.deadline+'|'+(r.pausedRemain??'');
  if(token===cf232TimerHydrated)return;
  cf232TimerHydrated=token;
  startTimer(rem);
  if(r.pausedRemain!=null)toggleTimer(); // preserve user's manually paused rest on reload
};
const cf233B5PauseBase=cf21Pause;
cf21Pause=function(){
  let s=cf21SessionEnsure();
  if(!cf224IsEngineKey(s.programKey)||s.status!=='active')return cf233B5PauseBase();
  let rest=s.cf232Rest?{...s.cf232Rest}:null;
  if(rest){rest.workoutWasHeld=rest.pausedRemain!=null||timerPaused;rest.pausedRemain=rest.pausedRemain!=null?+rest.pausedRemain:Math.max(0,Math.ceil((+rest.deadline-Date.now())/1000));rest.deadline=null}
  cf233B5PauseBase(); // existing workout pause and active-time accounting
  if(rest){s.cf232Rest=rest;cf232TimerHydrated='';save()}
};
const cf233B5ResumeBase=cf21Resume;
cf21Resume=function(){
  let s=cf21SessionEnsure();
  if(!cf224IsEngineKey(s.programKey)||s.status!=='paused')return cf233B5ResumeBase();
  let r=s.cf232Rest;
  if(r?.pausedRemain!=null){
    let remaining=Math.max(0,Math.ceil(+r.pausedRemain));
    if(remaining>0){
      if(r.workoutWasHeld){r.deadline=null;r.pausedRemain=remaining}
      else {r.deadline=Date.now()+remaining*1000;r.pausedRemain=null}
      delete r.workoutWasHeld;
    } else s.cf232Rest=null;
    cf232TimerHydrated='';
  }
  return cf233B5ResumeBase();
};

// User-triggered rest button is also persisted (and remains skippable / adjustable).
function cf233B5ManualRest(seconds){
  let s=cf21SessionEnsure();
  if(!cf224IsEngineKey(s.programKey))return startTimer(seconds);
  return cf232StartRest(seconds,'MANUAL');
}

// Preserve separate *every-set* per-side history. Fixed progression must never
// misread unilateral records as bilateral load values.
const cf233B5FixedBase=cf224FixedDecision;
cf224FixedDecision=function(p,v,x,sets,at){
  if(!cf232Laterality(x?.ex))return cf233B5FixedBase(p,v,x,sets,at);
  let ps=cf224ProgressState(p,v.version,x.prescriptionKey);
  ps.sideHistory=ps.sideHistory||{LEFT:[],RIGHT:[]};
  for(const side of CF232_SIDE){
    ps.sideHistory[side]=Array.isArray(ps.sideHistory[side])?ps.sideHistory[side]:[];
    for(const [idx,set] of sets.entries()){
      const z=set?.sides?.[side];
      if(z?.status==='DONE')ps.sideHistory[side].push({at,setIndex:idx,weight:z.weight,reps:z.reps,rir:z.rir});
    }
    ps.sideHistory[side]=ps.sideHistory[side].slice(-100);
  }
  ps.events.push({type:'unilateral-fixed',at,completeSets:sets.length});
  return {exercise:x.name,outcome:'fixed',text:'Unilateral · linke und rechte Seite separat gespeichert',nextWeight:null};
};

// Surface the *current and next* item in the real player. Avoid a second state
// machine: this display is derived exclusively from the canonical scheduler.
const cf233B5ScreenBase=cf21GuidedScreen;
cf21GuidedScreen=function(){
  let s=cf21SessionEnsure();
  if(!cf224IsEngineKey(s.programKey))return cf233B5ScreenBase();
  let html=cf233B5ScreenBase(),m=cf232Model(),steps=cf232Stages(),at=steps.findIndex((q,i)=>i===s.cf232Cursor),next=at>=0?cf232ScheduleNext(m,steps,at):-1;
  const total=steps.length,completed=steps.filter(z=>cf232Done(m,z)).length;
  const following=next<0?'Letzter Satz – Workout abschließen':`${m.exercises[steps[next].position]?.name||'Übung'} · Satz ${steps[next].setIndex+1}`;
  const partial=steps.filter(q=>m.plan.runtime.workout?.logs?.[m.exercises[q.position]?.prescriptionKey]?.sets?.[q.setIndex]?.status==='PARTIAL'&&cf232Done(m,q)).length;
  const status=`<div class="cf233-b5-journey" role="status" aria-live="polite"><strong>Workout-Ablauf · ${completed}/${total} Sätze erfasst</strong><span>Nächster Schritt: ${esc(following)}</span>${partial?`<span>${partial} bewusst als Teilsatz markiert · nicht als vollständiger Arbeitssatz gewertet</span>`:''}</div>`;
  html=html.replace('<section class="cf21-exhero">',status+'<section class="cf21-exhero">');
  return html.replace(/onclick="startTimer\((\d+)\)"(?=>Pausentimer)/g,'onclick="cf233B5ManualRest($1)"');
};
window.CF233_BLOCK5_AUDIT=Object.freeze({version:CF233_B5_VERSION,schedule:cf232Schedule,rest:cf232RestSeconds,done:cf232Done,stages:cf232Stages,manualRest:cf233B5ManualRest});

// Make already persisted manual-plan workout history accessible in the Plan screen.
// Historical versions, unilateral sides and resolved partials are read-only.
function cf233B5HistorySheet(encodedId){
  const id=b6Dec(encodedId),p=cf224PlanById(id);
  if(!p)return;
  const items=(p.history||[]).slice(-20).reverse();
  const entries=items.map(h=>{
    const v=cf224Version(p,h.version),d=v?.structure?.days?.find(x=>x.day_id===h.day_id),exercises=d?.exercises||[];
    const rows=exercises.map((e,i)=>{
      const key=cf224PrescriptionKey(d,e,i),records=h.logs?.[key]?.sets||[];
      if(!records.length)return '';
      const sets=records.map((z,j)=>{
        if(z?.sides){
          const part=CF232_SIDE.map(side=>{
            let rec=z.sides[side];return`${side==='LEFT'?'L':'R'}: ${rec?.status==='DONE'?`${esc(fmtWeight(+rec.weight||0))} kg × ${esc(rec.reps)} · RIR ${esc(rec.rir)}`:'–'}`;
          }).join(' | ');
          return`<li>Satz ${j+1}: ${part}${z.ok?'':z.resolved?' · Teilsatz':' · unvollständig'}</li>`;
        }
        return`<li>Satz ${j+1}: ${esc(fmtWeight(+z.weight||0))} kg × ${esc(z.reps??'–')} · RIR ${esc(z.rir??'–')}${z.ok?'':' · unvollständig'}</li>`;
      }).join('');
      return`<div class="cf233-b5-history-ex"><strong>${esc(e.name||'Übung')}</strong><ul>${sets}</ul></div>`;
    }).filter(Boolean).join('');
    const date=h.completedAt?new Date(h.completedAt).toLocaleDateString('de-DE'):'Datum unbekannt';
    return`<details class="cf233-b5-history-item"><summary>${esc(date)} · ${esc(h.dayName||d?.name||'Training')} · v${esc(h.version)} (${Math.max(0,Math.round((+h.duration||0)/60))} Min.)</summary>${rows||'<p>Keine Satzdetails vorhanden.</p>'}</details>`;
  }).join('');
  openSheet(`<div class="row"><div><div class="meta">GESPEICHERTE WORKOUTS</div><h2 style="margin:2px 0">${esc(p.name)} · Verlauf</h2></div><button onclick="closeSheet()">×</button></div><p class="cf233-b5-hint">Ansicht nur lesend. Einseitige Teilsätze zählen nicht als vollständige Arbeitssätze.</p>${entries||'<div class="cf206t-empty">Noch keine abgeschlossenen Workouts für diesen Plan.</div>'}`);
}
const cf233B5PlanBase=cf224PlanHtml;
cf224PlanHtml=function(key){
  let html=cf233B5PlanBase(key),p=cf224IsEngineKey(key)?cf224Plan(key):null;
  if(!p||!html)return html;
  let bar=`<div class="cf233-b5-historybar"><button onclick="cf233B5HistorySheet('${b6Enc(p.plan_id)}')">Workout-Verlauf · ${(p.history||[]).length} Einheiten</button></div>`;
  return html.replace('<div class="cf224-dayrail">',bar+'<div class="cf224-dayrail">');
};
