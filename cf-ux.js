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
 let selected=new Set();
 function groupControls(m,g){return `<div class="cfux-group"><div class="cfux-flex"><strong>${cfuxEsc(cf232GroupName(g.kind))}</strong><button onclick="cfuxUngroup('${cfuxCode(g.groupId)}')">Gruppe auflösen</button></div><div class="cfux-flex cfux-restinputs"><label>Zwischen Übungen <input type="number" min="0" max="3600" value="${+g.restBetweenExercisesSec||0}" onchange="cfuxGroupRest('${cfuxCode(g.groupId)}','restBetweenExercisesSec',this.value)"> s</label><label>Rundenpause <input type="number" min="0" max="3600" value="${g.restAfterRoundSec??120}" onchange="cfuxGroupRest('${cfuxCode(g.groupId)}','restAfterRoundSec',this.value)"> s</label></div></div>`}
 function exerciseCard(m,x){const g=cf232GroupFor(m.day,x.ex),a=laterality(x.ex);
  return `<article class="cfux-ex" id="cfux-ex-${x.i}"><header><div class="cfux-flex cfux-exhead"><label class="cfux-pick"><input type="checkbox" onchange="cfuxSelect(${x.i},this.checked)" ${selected.has(x.ex.slot_id)?'checked':''} aria-label="Übung für Satzgruppe auswählen"></label><div class="cfux-exname"><h3>${cfuxEsc(x.name)}</h3><small>${cfuxEsc(x.reps)} Wdh. · ${cfuxEsc(x.targetRir)} ${g?' · '+cfuxEsc(cf232GroupName(g.kind)):''}${a?' · links/rechts':''}</small></div><button class="cfux-minibtn" onclick="cfuxActions(${x.i})" aria-label="Übungsaktionen">⋯</button></div></header><div class="cfux-tablehead"><span>Satz</span><span>kg</span><span>Wdh.</span><span>RIR</span><span>✓</span></div>
  ${Array.from({length:x.sets},(_,i)=>a?`<div class="cfux-sidepair"><div class="cfux-side-label">Satz ${i+1} · unilateral</div>${oneRow(m,x,i,'LEFT')}${oneRow(m,x,i,'RIGHT')}</div>`:oneRow(m,x,i)).join('')}
  <div class="cfux-exbottom"><button onclick="cfuxAddSet(${x.i})">＋ Satz</button><button onclick="cfuxMove(${x.i},-1)" ${x.i===0?'disabled':''} aria-label="Nach oben">↑</button><button onclick="cfuxMove(${x.i},1)" ${x.i===m.exercises.length-1?'disabled':''} aria-label="Nach unten">↓</button></div>
  </article>`;
 }
 function workoutScreen(){let o=active();if(!o)return cfuxBaseScreen();let {s,m}=o;const steps=cf232Stages(),done=steps.filter(t=>cf232Done(m,t)).length;
  const all=steps.length>0&&done===steps.length;
  return `<div class="cfux-workout"><section class="cfux-top"><div><div class="cfux-kicker">AKTIVES WORKOUT · ${cfuxEsc(m.dayLabel)}</div><h1>${cfuxEsc(m.title)}</h1><p>${done}/${steps.length} Sätze · Änderungen gelten zunächst nur für dieses Workout</p></div><div class="cfux-duration" id="cf21Clock">${fmtDuration(cf21SessionSeconds())}</div></section>
   <div class="cfux-toolbar"><button onclick="${s.status==='paused'?'cf21Resume()':'cf21Pause()'}">${s.status==='paused'?'▶ Fortsetzen':'Ⅱ Pausieren'}</button><button onclick="cf21SessionMenu()">Workout ⋯</button></div>
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
  const rec=rowRec(o.m,x,si,side||null);if(n===null&&(side?rec.status==='DONE':rec.ok))return toastMsg('Erledigten Satz erst entsperren oder einen gültigen Wert eingeben.');rec[key]=n;store();
 };
 window.cfuxComplete=function(pos,si,side){let o=active(),x=o?.m.exercises[pos];if(!x||o.s.status!=='active')return toastMsg('Workout zuerst fortsetzen.');
  const log=cf224WorkoutLog(o.m.plan,x.prescriptionKey),z=log.sets[si]||(log.sets[si]={ok:false}),r=side?rowRec(o.m,x,si,side):z;
  const was=side?r.status==='DONE':!!r.ok;
  if(was){if(side){r.status='PENDING';z.ok=false;z.status='PARTIAL';}else r.ok=false;store();render();return}
  let v={};for(let key of ['weight','reps','rir']){let inp=document.getElementById(`cfux-${pos}-${si}-${side||'B'}-${key}`);v[key]=inp?.value===''?null:Number(inp?.value);}
  if(v.weight===null||v.weight<0||!Number.isFinite(v.weight)||!Number.isInteger(v.reps)||v.reps<=0||!Number.isInteger(v.rir)||v.rir<0||v.rir>4)return toastMsg('Bitte kg, Wiederholungen und RIR gültig eintragen.');
  Object.assign(r,v);if(side){r.status='DONE';r.recordedAt=new Date().toISOString();z.ok=z.sides?.LEFT?.status==='DONE'&&z.sides?.RIGHT?.status==='DONE';z.status=z.ok?'DONE':'PARTIAL';}else z.ok=true;
  store();if(side&&!z.ok){render();return}
  const steps=cf232Stages(),idx=steps.findIndex(t=>t.position===pos&&t.setIndex===si);if(idx>=0){o.s.cf232Cursor=idx;o.s.position=pos;o.s.setIndex=si;o.s.cf232Side=null;store();cf21AdvanceKpr();}else render();
 };
 window.cfuxAddSet=function(pos){let o=active(),x=o?.m.exercises[pos];if(!x)return; x.ex.sets=Math.min(30,x.sets+1);store();render()};
 window.cfuxRemoveSet=function(pos){let o=active(),x=o?.m.exercises[pos];if(!x||x.sets<=1)return toastMsg('Mindestens ein Satz bleibt erhalten.');let z=cf224WorkoutLog(o.m.plan,x.prescriptionKey,false)?.sets?.[x.sets-1];if((z?.ok||z?.status==='PARTIAL')&&!confirm('Letzten Satz und dessen Eingaben wirklich entfernen?'))return;cf224WorkoutLog(o.m.plan,x.prescriptionKey)?.sets?.splice(x.sets-1,1);x.ex.sets--;store();render()};
 window.cfuxMove=function(pos,dir){let o=active(),a=o?.d.exercises,j=pos+dir;if(!a||j<0||j>=a.length)return;[a[pos],a[j]]=[a[j],a[pos]];store();render()};
 window.cfuxSelect=function(pos,v){let o=active(),x=o?.m.exercises[pos];if(!x)return;v?selected.add(x.ex.slot_id):selected.delete(x.ex.slot_id)};
 window.cfuxGroupSelected=function(){let o=active();if(!o)return;const ids=o.d.exercises.map(e=>e.slot_id).filter(id=>selected.has(id));if(ids.length<2)return toastMsg('Wähle mindestens zwei Übungen über die Auswahlkästchen.');const busy=new Set((o.d.exerciseGroups||[]).flatMap(g=>g.prescriptionIds));if(ids.some(id=>busy.has(id)))return toastMsg('Eine ausgewählte Übung ist bereits in einer Gruppe. Löse diese zuerst auf.');o.d.exerciseGroups=o.d.exerciseGroups||[];o.d.exerciseGroups.push({groupId:'uxg_'+uid(),kind:cf232GroupKind(ids.length,false),prescriptionIds:ids,restBetweenExercisesSec:0,restAfterRoundSec:120});selected.clear();store();render()};
 window.cfuxAllCircuit=function(){let o=active();if(!o||o.d.exercises.length<2)return;const ids=o.d.exercises.map(e=>e.slot_id);if(o.d.exerciseGroups?.length&&!confirm('Bestehende Gruppen für einen gemeinsamen Zirkel auflösen?'))return;o.d.exerciseGroups=[{groupId:'uxg_'+uid(),kind:'CIRCUIT',prescriptionIds:ids,restBetweenExercisesSec:0,restAfterRoundSec:120}];selected.clear();store();render()};
 window.cfuxUngroup=function(code){let o=active();if(!o)return;o.d.exerciseGroups=(o.d.exerciseGroups||[]).filter(g=>g.groupId!==cfuxDecode(code));store();render()};
 window.cfuxGroupRest=function(code,key,val){let o=active(),g=o?.d.exerciseGroups?.find(x=>x.groupId===cfuxDecode(code));if(!g||!['restBetweenExercisesSec','restAfterRoundSec'].includes(key))return;g[key]=Math.min(3600,Math.max(0,+val||0));store()};
 window.cfuxActions=function(pos){let o=active(),x=o?.m.exercises[pos];if(!x)return;openSheet(`<div class="cfux-sheet"><h2>${cfuxEsc(x.name)}</h2><button onclick="cfuxReplaceStart(${pos})">Übung austauschen</button><button onclick="cfuxAddSet(${pos});closeSheet()">＋ Satz hinzufügen</button><button onclick="cfuxRemoveSet(${pos});closeSheet()">Letzten Satz entfernen</button><button onclick="cfuxToggleUnilateral(${pos});closeSheet()">${laterality(x.ex)?'Unilateral deaktivieren':'Unilateral · links/rechts'}</button><button class="danger" onclick="cfuxRemoveExercise(${pos});closeSheet()">Übung entfernen</button><button onclick="closeSheet()">Zurück</button></div>`)};
 window.cfuxToggleUnilateral=function(pos){let o=active(),x=o?.m.exercises[pos];if(!x)return;let L=cf224WorkoutLog(o.m.plan,x.prescriptionKey,false);if((L?.sets||[]).some(z=>z?.ok||z?.sides))return toastMsg('Unilateral-Modus vor dem ersten Satz ändern. Bereits erfasste Daten bleiben geschützt.');x.ex.laterality=laterality(x.ex)?null:{mode:'UNILATERAL_SEQUENTIAL',startSidePolicy:'WEAKER_FIRST',manualFallbackSide:null,restBetweenSidesSec:0,restAfterBothSidesSec:90};if(x.ex.laterality)x.ex._uxConfig={...(x.ex._uxConfig||{}),mode:'FIXED'};store();render()};
 function names(){try{let obj=cfExRegistry()?.items||{};return [...new Set(Object.values(obj).map(x=>x?.name).filter(Boolean))].slice(0,500)}catch(_){return[]}}
 window.cfuxOpenAdd=function(replace=null){window.cfuxReplacing=replace;const choices=names().slice(0,24).map(n=>`<button onclick="cfuxChooseExercise('${cfuxCode(n)}')">${cfuxEsc(n)}</button>`).join('');openSheet(`<div class="cfux-sheet"><h2>${replace==null?'Übung hinzufügen':'Übung austauschen'}</h2><label>Übung suchen oder Name eingeben<input id="cfux-new-name" autocomplete="off" placeholder="z. B. einarmige Curls" oninput="cfuxFilterExercises(this.value)"></label><div id="cfux-suggestions">${choices}</div><button class="primary" onclick="cfuxChooseExerciseName()">${replace==null?'Übung hinzufügen':'Austauschen'}</button><button onclick="closeSheet()">Abbrechen</button></div>`)};
 window.cfuxFilterExercises=function(q){const node=document.getElementById('cfux-suggestions');if(!node)return;node.innerHTML=names().filter(n=>n.toLowerCase().includes(String(q).trim().toLowerCase())).slice(0,35).map(n=>`<button onclick="cfuxChooseExercise('${cfuxCode(n)}')">${cfuxEsc(n)}</button>`).join('')};
 window.cfuxChooseExerciseName=function(){const n=document.getElementById('cfux-new-name')?.value?.trim();if(!n)return toastMsg('Bitte Übungsnamen eingeben.');cfuxChooseExercise(cfuxCode(n))};
 window.cfuxChooseExercise=function(code){let name=cfuxDecode(code).trim(),o=active();if(!o||!name)return;
  const ex={slot_id:'uxslot_'+uid(),exercise_id:'ux_'+uid(),name,role:'Übung',sets:3,reps:'8-12',rir:'2',rest:'90',laterality:null};ex._uxRxKey=`${o.d.day_id}|${ex.exercise_id}|ux_${uid()}`;ex._uxConfig={...cf224DefaultConfig(o.d,ex,o.d.exercises.length),mode:'FIXED'};
  const pos=window.cfuxReplacing;
  if(pos===null||pos===undefined){o.d.exercises.push(ex)}else{let old=o.m.exercises[pos];if(!old)return;const L=cf224WorkoutLog(o.m.plan,old.prescriptionKey,false)?.sets||[],completed=L.reduce((n,z,i)=>z?.ok?Math.max(n,i+1):n,0);if(completed){let remaining=Math.max(1,old.sets-completed);old.ex.sets=completed;ex.sets=remaining;o.d.exercises.splice(pos+1,0,ex)}else{ex.sets=old.sets;const prev=old.ex.slot_id;o.d.exercises[pos]=ex;o.d.exerciseGroups=(o.d.exerciseGroups||[]).map(g=>({...g,prescriptionIds:g.prescriptionIds.map(id=>id===prev?ex.slot_id:id)}));o.w.uxRemoved.push(cf224Clone(old.ex))}}
  window.cfuxReplacing=null;closeSheet();store();render();toastMsg('Übung übernommen – Vorlage unverändert.');
 };
 window.cfuxReplaceStart=function(pos){closeSheet();cfuxOpenAdd(pos)};
 window.cfuxRemoveExercise=function(pos){let o=active(),x=o?.m.exercises[pos];if(!x||o.d.exercises.length<=1)return toastMsg('Mindestens eine Übung erforderlich.');if(!confirm('Übung aus dieser Einheit entfernen? Bereits gespeicherte Sätze bleiben im Session-Archiv.'))return;const e=o.d.exercises.splice(pos,1)[0];o.w.uxRemoved.push(cf224Clone(e));o.d.exerciseGroups=(o.d.exerciseGroups||[]).map(g=>({...g,prescriptionIds:g.prescriptionIds.filter(id=>id!==e.slot_id)})).filter(g=>g.prescriptionIds.length>=2);selected.delete(e.slot_id);store();render()};
 // Explicitly retain snapshot for rich history — without modifying canonical plan version.
 const cfuxFinishBase=cf224FinishEngineWorkout;
 cf224FinishEngineWorkout=function(){let o=active(),p=o?.m.plan,w=o?.w,snapshot=w?.uxDay?cf224Clone(w.uxDay):null,removed=w?.uxRemoved?cf224Clone(w.uxRemoved):[],key=w?.sessionKey;const n=p?.history?.length||0;const baseline=w?.uxBaseline||cf224ActiveVersion(p)?.structure?.days?.find(d=>d.day_id===snapshot?.day_id);const modified=!!snapshot && layoutSignature(snapshot)!==layoutSignature(baseline);const result=cfuxFinishBase();if(!cf21SessionLive())hideTimer();if(snapshot&&p?.history?.length>n){const entry=p.history.at(-1);if(entry?.sessionKey===key){entry.uxDay=snapshot;entry.uxRemoved=removed;entry.uxModified=modified;save();render()}}return result};
 // Physique · fast input, original measurements, 7-day trend (never fabricated interpolation).
 let range='4W';
 function weightPts(){const byDay=new Map();cf23Measurements().slice().sort((a,b)=>String(a.updatedAt).localeCompare(String(b.updatedAt))).forEach(m=>{if(Number(m.bodyWeightKg)>0)byDay.set(m.date,{date:m.date,w:Number(m.bodyWeightKg),id:m.id})});const arr=[...byDay.values()].sort((a,b)=>a.date.localeCompare(b.date));const days=range==='4W'?28:range==='3M'?90:range==='6M'?183:Infinity,cut=Date.now()-days*864e5;const show=arr.filter(p=>days===Infinity||new Date(p.date+'T12:00:00').getTime()>=cut);return show.map(p=>{const ts=new Date(p.date+'T12:00:00').getTime(),prior=arr.filter(x=>{let d=ts-new Date(x.date+'T12:00:00').getTime();return d>=0&&d<7*864e5});return {...p,trend:prior.reduce((s,x)=>s+x.w,0)/prior.length,samples:prior.length}})}
 function graph(pts){if(!pts.length)return '<div class="cfux-empty">Noch keine Gewichtsmessungen. Trage dein erstes Gewicht ein.</div>';if(pts.length===1)return `<div class="cfux-empty">Erster Messpunkt: ${fmt(pts[0].w)} kg · ein Trend braucht weitere Tage.</div>`;
  const min=Math.min(...pts.flatMap(p=>[p.w,p.trend]))-.25,max=Math.max(...pts.flatMap(p=>[p.w,p.trend]))+.25,span=Math.max(.1,max-min),den=Math.max(1,pts.length-1),x=i=>16+i*(318/den),y=v=>137-(v-min)/span*112;
  const trace=k=>pts.map((p,i)=>`${i?'L':'M'}${x(i).toFixed(1)},${y(p[k]).toFixed(1)}`).join(' ');
  return `<svg viewBox="0 0 350 164" role="img" aria-label="Gewichtsmessungen und geglättete Gewichtskurve"><path d="M16 137H335 M16 81H335 M16 25H335" stroke="currentColor" stroke-opacity=".14" fill="none"/><path d="${trace('w')}" fill="none" stroke="var(--muted)" stroke-width="1.7" stroke-dasharray="3 4"/><path d="${trace('trend')}" fill="none" stroke="var(--accent)" stroke-width="3.5" stroke-linejoin="round" stroke-linecap="round"/>${pts.map((p,i)=>`<circle cx="${x(i)}" cy="${y(p.w)}" r="5" fill="var(--card)" stroke="var(--muted)" stroke-width="2" onclick="cfuxWeightEdit('${cfuxCode(p.id)}')"><title>${cfuxEsc(p.date)} · ${fmt(p.w)} kg</title></circle>`).join('')}<text x="17" y="13" fill="var(--muted)" font-size="11">${fmt(max)} kg</text><text x="17" y="158" fill="var(--muted)" font-size="11">${fmt(min)} kg</text></svg>`;
 }
 window.cfuxWeightRange=function(v){if(!['4W','3M','6M','ALL'].includes(v))return;range=v;render()};
 window.cfuxWeightEdit=function(code=''){let m=cf23FindMeasurement(cfuxDecode(code)),d=m?.date||today(),v=m?.bodyWeightKg??'';openSheet(`<div class="cfux-sheet"><h2>${m?'Messung bearbeiten':'Gewicht erfassen'}</h2><label>Datum<input id="cfux-wdate" type="date" value="${cfuxEsc(d)}"></label><label>Gewicht (kg)<input id="cfux-wval" type="number" inputmode="decimal" min="20" max="600" step="0.1" value="${cfuxEsc(v)}"></label><button class="primary" onclick="cfuxWeightSave('${cfuxCode(m?.id||'')}')">Speichern</button><button onclick="closeSheet()">Abbrechen</button></div>`)};
 window.cfuxWeightSave=function(code){const id=cfuxDecode(code),m=id?cf23FindMeasurement(id):null,d=document.getElementById('cfux-wdate')?.value,v=Number(document.getElementById('cfux-wval')?.value);if(!/^\d{4}-\d{2}-\d{2}$/.test(d||'')||!Number.isFinite(v)||v<20||v>600)return toastMsg('Datum und Gewicht prüfen.');if(m&&m.date!==d&&cf23Measurements().some(x=>x.date===d&&x.source==='PHYSIQUE_CHECKIN'))return toastMsg('Für dieses Datum gibt es bereits einen Check-in.');if(m){const prev=m.date;m.date=d;m.bodyWeightKg=v;cf23UpsertMeasurement(m,{persist:false,mirrorLegacy:true});if(prev!==d&&state.body?.entries){/* Historical non-weight measures are preserved; legacy weight stays as an archived reference. */}}else{const existing=cf23Measurements().find(x=>x.date===d);if(existing){existing.bodyWeightKg=v;cf23UpsertMeasurement(existing,{persist:false,mirrorLegacy:true})}else cf23UpsertMeasurement({date:d,bodyWeightKg:v,source:'PHYSIQUE_CHECKIN'},{persist:false,mirrorLegacy:true})}store();closeSheet();render();toastMsg('Gewicht gespeichert ✓')};
 function physique(){let snap=cf23B2CurrentSnapshot(),pts=weightPts(),latest=snap.weight?.value,first=pts[0],last=pts.at(-1),delta=first&&last?last.trend-first.trend:null,comp=snap.composition;
  let ms=cf23Measurements().slice().reverse().slice(0,8);
  const stat=(n,v)=>`<div class="cfux-stat"><small>${n}</small><strong>${v}</strong></div>`;
  return `<div class="cfux-phys"><div class="cfux-flex"><div><div class="cfux-kicker">PHYSIQUE · CURRENT BUILD</div><h1>Dein Körper</h1></div><button class="primary" onclick="cfuxWeightEdit()">＋ Gewicht</button></div><section class="cfux-weight"><small>AKTUELLES GEWICHT</small><div class="cfux-big">${latest==null?'–':fmt(latest)+' kg'}</div><p>${delta==null?'Für die Entwicklung weitere Messungen erfassen':`${delta>0?'+':''}${fmt(delta)} kg · bereinigter Trend im Zeitraum`}</p><div class="cfux-flex"><h2>Gewichtsentwicklung</h2><div class="cfux-period">${[['4W','4W'],['3M','3M'],['6M','6M'],['ALL','Alles']].map(([v,label])=>`<button class="${range===v?'sel':''}" onclick="cfuxWeightRange('${v}')">${label}</button>`).join('')}</div></div>${graph(pts)}<div class="cfux-legend">— Bereinigter 7-Tage-Trend <span>··· Einzelmessungen (antippen zum Bearbeiten)</span></div></section><section class="cfux-statgrid">${stat('KFA',cf23B2BodyFatText(snap.bf?.value||null))}${stat('FFM',comp.available?cf23B2RangeText(comp.ffmLow,comp.ffmHigh,1,' kg'):'–')}${stat('FFMI',comp.available?cf23B2RangeText(comp.ffmiLow,comp.ffmiHigh,1):'–')}${stat('nFFMI',comp.available?cf23B2RangeText(comp.nffmiLow,comp.nffmiHigh,1):'–')}</section><details class="cfux-details"><summary>Alle Körpermaße & Statistiken</summary>${cf23D0Current()}</details><details class="cfux-details"><summary>Messhistorie & ausführlicher Check-in</summary><div class="cfux-meas">${ms.map(m=>`<div class="cfux-flex"><span>${cfuxEsc(m.date)} · ${m.bodyWeightKg==null?'–':fmt(m.bodyWeightKg)+' kg'}</span><button onclick="cfuxWeightEdit('${cfuxCode(m.id)}')">Bearbeiten</button></div>`).join('')}</div><button onclick="cf23B7Open('checkin')">Alle Körperwerte erfassen</button><button onclick="cf23B7Open('history')">Detaillierter Verlauf</button></details></div>`;
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
 // Four destinations; Progress is reachable by weight card and under 'Mehr'.
 renderBottomNav=function(){bottomNav.innerHTML=navButton('home','Heute')+navButton('training','Training')+navButton('nutrition','Ernährung')+navButton('more','Mehr')};
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
 // Old Commitment planning concepts are deliberately not introduced as runtime features.
 window.CFUX_RELEASE=Object.freeze({version:'2.4.0-UX-RC1',planCopyIsolation:true,weightTrend:'trailing-7-calendar-day',currentBuildOnly:true,commitmentEngine:false});
 render();
})();
