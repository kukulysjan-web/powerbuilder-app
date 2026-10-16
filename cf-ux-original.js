/* COALFORGED original-program workout list bridge — 2.4.0 UX RC2.
   Native program prescriptions, exposure commits and progression MUST remain the source of truth.
   Supplemental session exercises and sets are tracked separately from native plan logs. */
(() => {
  'use strict';
  const TYPES=['kilo','power','revenge','bennett'];
  const escO=s=>esc(String(s??''));
  const session=()=>cf21SessionEnsure();
  const supported=()=>cf21SessionLive() && (TYPES.includes(session().programKey)||String(session().programKey).startsWith('fsdp:'));
  let paintModel=null;
  const model=()=>paintModel||cf21Model(session().programKey);
  function context(){if(!supported())return null;const s=session();if(!s.cfuxOriginal || s.cfuxOriginal.sessionId!==s.id){s.cfuxOriginal={sessionId:s.id,extras:[],addedSets:{},groups:[],overrides:{},selected:[],current:null};save()}return s.cfuxOriginal}
  function ref(i){return 'p'+i}
  function extraRef(id){return 'e'+id}
  function exFor(r,m=model(),ctx=context()) {if(r[0]==='p')return m?.exercises?.[Number(r.slice(1))]||null;return ctx?.extras.find(e=>extraRef(e.id)===r)||null}
  function baseLog(x){const k=session().programKey,i=x.sourceIndex;
   if(k==='kilo')return kEnsure(kRun().day,i);
   if(k==='power')return pEnsure(i);
   if(k==='revenge')return rEnsure(i);
   if(k==='bennett') {const run=cfBennettRun(),day=cf21BennettCurrentDay(run),l=cfBennettSessionLog(run,run.week,day.key);return l.slots[i]||(l.slots[i]={exercise:x.name,exerciseId:cfBennettCurrentExercise(run,day.key,i).exerciseId,sets:[]})}
   if(k.startsWith('fsdp:'))return cfFsdpLogFor(k.slice(5),cfFsdpRun(k.slice(5)),i);
   return null;
  }
  function record(r,i,create=false){const x=exFor(r),ctx=context();if(!x)return null;
   if(r[0]==='e') {if(!x.records)x.records=[];if(create&&!x.records[i])x.records[i]={};return x.records[i]||null}
   const n=x.sets,extras=ctx.addedSets[r]||[];
   if(i>=n){let j=i-n;if(create&&!extras[j])extras[j]={};if(create)ctx.addedSets[r]=extras;return extras[j]||null}
   const L=baseLog(x);if(!L)return null;L.sets=L.sets||[];if(create&&!L.sets[i])L.sets[i]={};return L.sets[i]||null;
  }
  function data(r,si){const x=exFor(r),z=record(r,si),ctx=context(),k=session().programKey;
   if(!x)return null;
   const isProg=r[0]==='p'&&si<x.sets;
   if(!isProg) {let p=record(r,si-1);return {weight:z?.weight??p?.weight??'',reps:z?.reps??p?.reps??'',rir:z?.rir??p?.rir??2,ok:!!z?.ok};}
   const i=x.sourceIndex;
   if(TYPES.slice(0,3).includes(k)){let p=cf21KprSetData(k,x,si);return {weight:z?.weight??p.weight,reps:z?.reps??p.reps,rir:z?.rir??p.rir??2,ok:!!z?.ok};}
   if(k==='bennett'){let st=cfBennettSlotState(cfBennettRun(),cf21BennettCurrentDay(cfBennettRun()).key,i);let v=st?.pendingSetback?.nextLoad??st?.lastPerformance?.weight??cfExLastWeight(x.name)??'';return {weight:z?.weight??(si?record(r,si-1)?.weight:v),reps:z?.reps??'',rir:z?.rir??x.rirSequence?.[Math.min(si,x.rirSequence.length-1)]??2,ok:!!z?.ok}}
   if(k.startsWith('fsdp:')){const id=k.slice(5),run=cfFsdpRun(id);let p=cfFsdpPrefill(id,run,i,si);return {weight:z?.weight??p.weight,reps:z?.reps??p.reps,rir:z?.rir??p.rir??2,ok:!!z?.ok}}
   return {weight:'',reps:'',rir:2,ok:false};
  }
  function numSets(r,m=model(),ctx=context()){const x=exFor(r,m,ctx);return r[0]==='p'?(x?.sets||0)+(ctx.addedSets[r]?.length||0):Math.max(0,x?.sets||0)}
  function refs(m=model(),ctx=context()){return [...(m?.exercises||[]).map((_,i)=>ref(i)),...(ctx?.extras||[]).map(x=>extraRef(x.id))]}
  function schedule(m=model(),ctx=context()){
   const all=refs(m,ctx),owner=new Map(),result=[];
   (ctx.groups||[]).forEach(g=>(g.members||[]).forEach(r=>owner.set(r,g)));
   for(const r of all){const g=owner.get(r);if(!g){for(let i=0;i<numSets(r,m,ctx);i++)result.push({r,si:i,group:null,round:i});continue}
    if(result.some(t=>t.group===g.id))continue;
    const members=g.members.filter(a=>all.includes(a)),max=Math.max(0,...members.map(a=>numSets(a,m,ctx)));
    for(let i=0;i<max;i++)for(const a of members)if(i<numSets(a,m,ctx))result.push({r:a,si:i,group:g.id,round:i});
   }
   return result;
  }
  function canEdit(){return supported()&&session().status==='active'}
  function val(d,k){return d?.[k]===undefined||d?.[k]===null?'':String(d[k])}
  function row(r,si){const d=data(r,si),x=exFor(r),key=r+'_'+si,pro=r[0]==='p'&&si<x.sets;
   return `<div class="cfux-setrow ${d?.ok?'cfux-done':''}" data-uxo-row="${escO(key)}"><span class="cfux-setnum">${si+1}${pro?'':'+'}</span>${['weight','reps','rir'].map(field=>`<input aria-label="${field} Satz ${si+1}" id="cfuxo-${key}-${field}" type="number" min="0" ${field==='rir'?'max="6" step="1"':field==='reps'?'step="1"':'step="0.5"'} value="${escO(val(d,field))}" onchange="cfuxoEdit('${r}',${si},'${field}',this.value)">`).join('')}<button class="cfux-check ${d?.ok?'yes':''}" onclick="cfuxoToggle('${r}',${si})" aria-label="${d?.ok?'Satz korrigieren':'Satz abschließen'}">${d?.ok?'✓':'○'}</button></div>`;
  }
  function card(r,ctx=context()){const x=exFor(r),isOriginal=r[0]==='p',count=numSets(r);if(!x)return '';
   return `<article class="cfux-ex" id="cfuxo-${r}"><header><div class="cfux-flex cfux-exhead"><label class="cfux-pick"><input type="checkbox" aria-label="Für Satzgruppe wählen" ${ctx.selected.includes(r)?'checked':''} onchange="cfuxoSelect('${r}',this.checked)"></label><div class="cfux-exname"><h3>${escO(x.name)}</h3><small>${isOriginal?'Originalprogramm · '+escO(x.reps)+' Wdh.':'Zusatzübung · nur diese Einheit'}${ctx.groups.some(g=>g.members.includes(r))?' · Satzgruppe':''}</small></div><button class="cfux-minibtn" onclick="cfuxoActions('${r}')">⋯</button></div></header><div class="cfux-tablehead"><span>Satz</span><span>kg</span><span>Wdh.</span><span>RIR</span><span>✓</span></div>${Array.from({length:count},(_,i)=>row(r,i)).join('')}<div class="cfux-exbottom"><button onclick="cfuxoAddSet('${r}')">＋ Satz</button><button onclick="cfuxoMove('${r}',-1)" aria-label="Nach oben">↑</button><button onclick="cfuxoMove('${r}',1)" aria-label="Nach unten">↓</button></div></article>`;
  }
  function groupPane(ctx=context()){return ctx.groups.map(g=>`<div class="cfux-group"><div class="cfux-flex"><strong>${g.members.length===2?'Supersatz':g.members.length===3?'Trisatz':g.members.length===ctx.extras.length+model().exercises.length?'Zirkel':'Giant Set'} · ${g.members.length} Übungen</strong><button onclick="cfuxoUngroup('${g.id}')">Auflösen</button></div><div class="cfux-flex cfux-restinputs"><label>Zwischen <input type="number" min="0" max="3600" value="${g.between}" onchange="cfuxoRest('${g.id}','between',this.value)"> s</label><label>Rundenpause <input type="number" min="0" max="3600" value="${g.after}" onchange="cfuxoRest('${g.id}','after',this.value)"> s</label></div></div>`).join('')}
  function progress(steps){return steps.filter(t=>record(t.r,t.si)?.ok).length}
  function screen(){paintModel=null;const s=session(),ctx=context(),m=cf21Model(s.programKey);paintModel=m;if(!m?.exercises?.length)return `<div class="cfux-empty">Keine Übungen für die aktive Einheit.</div>`;
   let a=schedule(m,ctx),done=progress(a),nativeDone=m.exercises.every(x=>x.done>=x.sets),extraDone=a.every(t=>record(t.r,t.si)?.ok);
   const current=ctx.current||a.find(t=>!record(t.r,t.si)?.ok)?.r;
   return `<div class="cfux-workout cfux-original-workout"><section class="cfux-top"><div><div class="cfux-kicker">ORIGINALPROGRAMM · AKTIVES WORKOUT</div><h1>${escO(m.dayLabel)}</h1><p>${done}/${a.length} Sätze · Originalvorgaben bleiben geschützt</p></div><div class="cfux-duration" id="cf21Clock">${fmtDuration(cf21SessionSeconds())}</div></section><div class="cfux-toolbar"><button onclick="${s.status==='paused'?'cf21Resume()':'cf21Pause()'}">${s.status==='paused'?'▶ Fortsetzen':'Ⅱ Pausieren'}</button><button onclick="cf21SessionMenu()">Workout ⋯</button></div>${s.status==='paused'?'<div class="cfux-paused">Workout pausiert</div>':''}<p class="cfux-info">Programm-Sätze zählen nach den unveränderten Originalregeln. Zusätzliche Sätze und Übungen werden separat für diese Einheit dokumentiert.</p>${groupPane(ctx)}${refs(m,ctx).map(r=>card(r,ctx)).join('')}<div class="cfux-floating"><button class="primary" onclick="cfuxoAddExercise()">＋ Übung hinzufügen</button><button onclick="cfuxoMakeGroup()">Supersatz / Gruppe (${ctx.selected.length})</button><button onclick="cfuxoCircuit()">Alle als Zirkel</button></div>${String(s.programKey).startsWith('fsdp:')&&cfFsdpRun(s.programKey.slice(5))?.workout?.awaitingOptional?'<button class="primary" onclick="cfuxoOptional(true)">Optionalen Programmsatz hinzufügen</button><button onclick="cfuxoOptional(false)">Ohne optionalen Satz fortfahren</button>':''}<button class="cfux-finish ${nativeDone&&extraDone?'primary':''}" ${nativeDone?'':'disabled'} onclick="cf21Finish()">Workout abschließen ${nativeDone?'✓':'· Original-Sätze offen'}</button></div>`;
  }
  function refresh(){requestAnimationFrame(()=>{const el=document.querySelector('.cfux-original-workout');if(!el){render();return;}const y=window.scrollY;el.outerHTML=screen();window.scrollTo({top:y,left:0,behavior:'instant'});});}
  const baseScreen=cf21GuidedScreen;
  cf21GuidedScreen=function(){return supported()?screen():baseScreen()};
  window.cfuxoEdit=function(r,si,field,v){if(!supported()||!['weight','reps','rir'].includes(field))return;const n=v===''?null:Number(v),max=field==='rir'&&String(session().programKey).startsWith('fsdp:')?6:4;
   if(n!==null&&(!Number.isFinite(n)||n<0||(field==='reps'&&!Number.isInteger(n))||(field==='rir'&&(!Number.isInteger(n)||n>max))))return toastMsg('Ungültiger Wert');
   const z=record(r,si,true);if(!z)return;z[field]=n===null?'':n;if(z.ok && r[0]==='p' && session().programKey==='kilo')try{const day=kRun().day,idx=exFor(r).sourceIndex;kInvalidateProgress(day,idx);kEvaluateProgress(day,idx)}catch(_){/* keep row correction */}save();
  };
  function validated(r,si){const key=r+'_'+si,existing=data(r,si),out={};for(const f of ['weight','reps','rir']){const el=document.getElementById(`cfuxo-${key}-${f}`),v=el?el.value:val(existing,f);out[f]=v===''?NaN:Number(v)}return Number.isFinite(out.weight)&&out.weight>=0&&Number.isInteger(out.reps)&&out.reps>0&&Number.isInteger(out.rir)&&out.rir>=0&&out.rir<=(String(session().programKey).startsWith('fsdp:')?6:4)?out:null}
  function nativeComplete(r,si,v){const k=session().programKey,x=exFor(r),i=x.sourceIndex;
   if(k==='kilo'||k==='power'||k==='revenge'){
    if(k==='kilo'){kSetVal(kRun().day,i,si,'weight',v.weight);kSetVal(kRun().day,i,si,'reps',v.reps)}
    else if(k==='power'){pSetVal(i,si,'weight',v.weight);pSetVal(i,si,'reps',v.reps)}
    else {rSetVal(i,si,'weight',v.weight);rSetVal(i,si,'reps',v.reps)}
    if(k==='kilo')kCompleteByRir(kRun().day,i,si,v.rir);else if(k==='power')pCompleteByRir(i,si,v.rir);else rCompleteByRir(i,si,v.rir);
   }else if(k==='bennett'){
    const z=record(r,si,true);Object.assign(z,v,{ok:true});cfExRemember(x.name,z,'bennett');save();
   }else if(k.startsWith('fsdp:')){
    const id=k.slice(5),run=cfFsdpRun(id);run.workout.exerciseIndex=i;run.workout.setIndex=si;
    const draft=cfFsdpWorkoutDraft(run,i,si);Object.assign(draft,v);
    // Native optional-set and FSDP progression flow, without confusing old screen inputs.
    cfFsdpSaveSet(id);
   }
  }
  function afterSet(r,si){paintModel=null;let m=model(),ctx=context(),stages=schedule(m,ctx),idx=stages.findIndex(t=>t.r===r&&t.si===si),now=stages[idx],next=stages.slice(idx+1).find(t=>!record(t.r,t.si)?.ok)||stages.find(t=>!record(t.r,t.si)?.ok);
   if(next)ctx.current=next.r;
   const g=ctx.groups.find(x=>x.id===now?.group);
   let rest=g?(next?.group===g.id&&next.round===now.round?g.between:g.after):(+exFor(r)?.rest||90);
   if(next && next.r===r && next.si===si)rest=0;
   save();if(rest>0&&state.settings?.autoRest&&session().status==='active')startTimer(rest);
   render();
  }
  window.cfuxoToggle=function(r,si){if(!canEdit())return toastMsg('Workout zuerst fortsetzen.');const z=record(r,si,true),was=!!z?.ok;
   if(was){z.ok=false;if(r[0]==='p'&&session().programKey==='kilo')try{kInvalidateProgress(kRun().day,exFor(r).sourceIndex)}catch(_){ }save();refresh();return}
   const values=validated(r,si);if(!values)return toastMsg('Bitte gültige kg, Wiederholungen und RIR eintragen.');
   if(r[0]==='p'&&si<exFor(r).sets){
    const prior=state.settings?.autoRest; if(state.settings)state.settings.autoRest=false;
    try{const nativeRender=render;try{render=()=>{};nativeComplete(r,si,values)}finally{render=nativeRender}}finally{if(state.settings)state.settings.autoRest=prior}
   }else Object.assign(z,values,{ok:true});
   afterSet(r,si);
  };
  window.cfuxoAddSet=function(r){const ctx=context(),x=exFor(r);if(!x)return;
   if(r[0]==='p'){const xs=ctx.addedSets[r]||[];if(xs.length>=12)return toastMsg('Maximal 12 zusätzliche Sätze');xs.push({});ctx.addedSets[r]=xs}
   else x.sets=Math.min(30,x.sets+1);
   save();refresh();
  };
  window.cfuxoRemoveSet=function(r){const ctx=context(),x=exFor(r);if(!x)return;
   if(r[0]==='p'){const xs=ctx.addedSets[r]||[];if(!xs.length)return toastMsg('Original-Programmsätze können nicht gelöscht werden.');if(xs.at(-1)?.ok&&!confirm('Abgeschlossenen Zusatzsatz löschen?'))return;xs.pop();ctx.addedSets[r]=xs}
   else {if(x.sets<=1)return toastMsg('Eine Satzzeile bleibt bestehen');if(x.records?.[x.sets-1]?.ok&&!confirm('Abgeschlossenen Satz löschen?'))return;x.records?.splice(x.sets-1,1);x.sets--}
   save();refresh();
  };
  window.cfuxoActions=function(r){const x=exFor(r);if(!x)return;openSheet(`<div class="cfux-sheet"><h2>${escO(x.name)}</h2><button onclick="closeSheet();cfuxoAddSet('${r}')">＋ Satz hinzufügen</button><button onclick="closeSheet();cfuxoRemoveSet('${r}')">− Letzten Zusatzsatz entfernen</button>${r[0]==='e'?`<button onclick="closeSheet();cfuxoReplace('${r}')">Übung austauschen</button><button class="danger" onclick="closeSheet();cfuxoRemove('${r}')">Zusatzübung entfernen</button>`:`<p class="source-note">Die Übung gehört zum Originalprogramm. Ein spontaner Austausch würde dessen Progressionszuordnung verändern und ist hier bewusst gesperrt. Du kannst stattdessen eine eigene Übung ergänzen.</p>`}<button onclick="closeSheet()">Schließen</button></div>`)};
  window.cfuxoSelect=function(r,checked){const ctx=context();ctx.selected=ctx.selected.filter(x=>x!==r);if(checked)ctx.selected.push(r);save()};
  window.cfuxoMakeGroup=function(){const ctx=context(),picked=refs().filter(r=>ctx.selected.includes(r));if(picked.length<2)return toastMsg('Mindestens zwei Übungen auswählen.');ctx.groups=ctx.groups.map(g=>({...g,members:g.members.filter(r=>!picked.includes(r))})).filter(g=>g.members.length>=2);ctx.groups.push({id:uid(),members:picked,between:0,after:120});ctx.selected=[];save();refresh()};
  window.cfuxoCircuit=function(){const ctx=context(),all=refs();if(all.length<2)return toastMsg('Mindestens zwei Übungen nötig');ctx.selected=all;cfuxoMakeGroup()};
  window.cfuxoUngroup=function(id){const ctx=context();ctx.groups=ctx.groups.filter(g=>g.id!==id);save();refresh()};
  window.cfuxoRest=function(id,f,v){const ctx=context(),g=ctx.groups.find(z=>z.id===id);if(!g||!['between','after'].includes(f))return;let n=Number(v);if(!Number.isInteger(n)||n<0||n>3600)return toastMsg('Pause 0–3600 s');g[f]=n;save()};
  window.cfuxoAddExercise=function(){openSheet(`<div class="cfux-sheet"><h2>Übung ergänzen</h2><p class="muted">Zusatzübung nur für dieses Training. Originalprogramm und Progression bleiben unverändert.</p><label>Übung<input id="cfuxo-extra-name" placeholder="Übungsname" maxlength="120"></label><button class="primary" onclick="cfuxoSaveExercise()">＋ Übung hinzufügen</button><button onclick="closeSheet()">Abbrechen</button></div>`)};
  window.cfuxoSaveExercise=function(id){const input=document.getElementById('cfuxo-extra-name'),name=input?.value?.trim();if(!name)return toastMsg('Übungsnamen eingeben');const ctx=context(),x=ctx.extras.find(e=>e.id===id);if(x)x.name=name;else ctx.extras.push({id:uid(),name,sets:3,records:[]});save();closeSheet();refresh()};
  window.cfuxoReplace=function(r){let x=exFor(r);if(!x||r[0]!=='e')return;openSheet(`<div class="cfux-sheet"><h2>Zusatzübung austauschen</h2><label>Übung<input id="cfuxo-extra-name" value="${escO(x.name)}" maxlength="120"></label><button class="primary" onclick="cfuxoSaveExercise('${x.id}')">Speichern</button><button onclick="closeSheet()">Abbrechen</button></div>`)};
  window.cfuxoRemove=function(r){if(r[0]!=='e')return;const ctx=context(),x=exFor(r);if(x?.records?.some(z=>z?.ok)&&!confirm('Zusatzübung und erfasste Sätze löschen?'))return;ctx.extras=ctx.extras.filter(e=>extraRef(e.id)!==r);ctx.groups=ctx.groups.map(g=>({...g,members:g.members.filter(a=>a!==r)})).filter(g=>g.members.length>=2);ctx.selected=ctx.selected.filter(a=>a!==r);save();refresh()};
  window.cfuxoMove=function(r,dir){const ctx=context();if(r[0]!=='e')return toastMsg('Originalreihenfolge bleibt erhalten. Zusatzübungen können untereinander verschoben werden.');let ix=ctx.extras.findIndex(x=>extraRef(x.id)===r),t=ix+dir;if(t<0||t>=ctx.extras.length)return;[ctx.extras[ix],ctx.extras[t]]=[ctx.extras[t],ctx.extras[ix]];save();refresh()};
  window.cfuxoOptional=function(add){if(!supported()||!String(session().programKey).startsWith('fsdp:'))return;cf21FsdpOptional(add);save();refresh()};
  // The native finish function remains responsible for every program commit.
  const nativeFinish=cf21Finish;
  cf21Finish=function(){if(!supported())return nativeFinish();const key=session().programKey,ctx=context(),pending=schedule().filter(t=>!record(t.r,t.si)?.ok),nativeReady=model()?.exercises.every(x=>x.done>=x.sets);
   if(!nativeReady)return toastMsg('Original-Programmsätze fehlen noch.');
   if(pending.length&&!confirm(`${pending.length} Zusatz-/Gruppensätze sind noch offen. Workout trotzdem abschließen?`))return;
   const changed=ctx.extras.length>0||Object.values(ctx.addedSets).some(a=>a.length>0)||ctx.groups.length>0;
   const snap=JSON.parse(JSON.stringify({extras:ctx.extras,addedSets:ctx.addedSets,groups:ctx.groups,recordedAt:new Date().toISOString(),changed}));
   // Build a standalone, manual-plan proposal without modifying native program prescriptions.
   let proposedDay=null;
   if(changed){const m=model(),refs=[...(m.exercises||[]).map((_,i)=>'p'+i),...ctx.extras.map(e=>'e'+e.id)],slots={};
    const exs=refs.map((r,i)=>{const x=exFor(r,m,ctx),slot='uxcopy_'+uid();slots[r]=slot;const original=r[0]==='p';return {slot_id:slot,exercise_id:String(x.exercise_id||'uxcopy_'+uid()),name:x.name,role:x.role||'Übung',order:i+1,sets:original?Math.max(1,x.sets+(ctx.addedSets[r]?.length||0)):Math.max(1,x.sets||1),reps:String(x.reps||'8–12'),rir:'2',rest:String(x.rest||'90'),laterality:null}});
    const groups=ctx.groups.map(g=>({groupId:'uxcopy_'+uid(),kind:g.members.length===2?'SUPERSET':g.members.length===3?'TRISET':g.members.length===refs.length?'CIRCUIT':'GIANT_SET',prescriptionIds:g.members.map(r=>slots[r]).filter(Boolean),restBetweenExercisesSec:g.between,restAfterRoundSec:g.after})).filter(g=>g.prescriptionIds.length>=2);
    proposedDay={day_id:'D1',name:m.dayLabel||'Training',exercises:exs,exerciseGroups:groups};
   }
   const run=cf21RunFor(key),oldCount=run?.completed?.length||0;
   const ret=nativeFinish();
   if(!cf21SessionLive()&&state.cf21Finish?.programKey===key){state.cf21Finish.uxSupplemental=snap;state.cf21Finish.uxPlanProposal=proposedDay;
    if(run?.completed?.length>oldCount)run.completed.at(-1).uxSupplemental=snap;
    save();refresh();}
   return ret;
  };
  const nativeReset=cf21ResetLogs;
  cf21ResetLogs=function(){if(supported()){session().cfuxOriginal=null;save()}return nativeReset()};
  // Default is always session-only. A copy of an original program is explicitly opt-in.
  window.cfuxoKeepSessionOnly=function(){if(state.cf21Finish)state.cf21Finish.uxPlanDecision='SESSION_ONLY';state.cf21Finish=null;save();setView('training')};
  window.cfuxoCopyPlan=function(){
   const f=state.cf21Finish,day=f?.uxPlanProposal;
   if(!f?.uxSupplemental?.changed||!day)return toastMsg('Kein geänderter Ablauf vorhanden.');
   if(cf21SessionLive())return toastMsg('Workout zuerst beenden.');
   if(!confirm('Den geänderten Ablauf als NEUEN eigenen Trainingsplan speichern? Das Originalprogramm und dessen Progression bleiben unverändert.'))return;
   const structure=cf221SanitizeStructure({cycleLabel:'Eigene Variante',days:[day]});
   const issues=cf224StructureIssues(structure);if(issues.length)return toastMsg('Plan kann nicht erstellt werden: '+issues[0]);
   const setup={structure,config:cf224SetupConfig(structure),sourceType:'CUSTOM',sourceId:'ux-session-'+uid(),sourceName:'Workout-Kopie',sourceLibraryId:'',parentVersion:null};
   const now=new Date().toISOString(),id='cfe_'+uid(),v=cf224BuildVersion(setup,1,null);
   const p={plan_id:id,name:String(f.title||f.dayLabel||'Training')+' · Eigene Variante',description:'Aus einem abgeschlossenen Workout übernommen. Originalprogramm bleibt unverändert.',sourceType:'CUSTOM',sourceId:setup.sourceId,sourceName:'Workout-Kopie',sourceLibraryId:'',sourceRef:'snapshot:'+uid(),logicOwner:'COALFORGED',status:'draft',activeVersion:1,versions:[v],runtime:{dayIndex:0,workout:null},history:[],progression:{'1':{}},createdAt:now,updatedAt:now};
   cf224Plans().push(p);cf224Store().ui.viewKey=cf224Key(id);state.cf21Finish=null;save();setView('training');toastMsg('Eigener Trainingsplan gespeichert ✓');
  };
  const cfuxoBaseFinishScreen=cf21FinishScreen;
  cf21FinishScreen=function(){const html=cfuxoBaseFinishScreen(),f=state.cf21Finish;
   if(!f?.uxSupplemental?.changed||!f.uxPlanProposal||cf224IsEngineKey(f.programKey))return html;
   const prompt=`<section class="cfux-finishplan" aria-labelledby="cfuxo-finish-question"><strong id="cfuxo-finish-question">Änderungen für zukünftige Workouts sichern?</strong><p>Dein Training ist gespeichert. Das Originalprogramm und seine Progression dürfen nicht überschrieben werden; du kannst stattdessen einen eigenen Plan aus diesem Ablauf erstellen.</p><button type="button" class="primary" onclick="cfuxoKeepSessionOnly()">Nur für dieses Workout <span aria-hidden="true">✓</span></button><button type="button" onclick="cfuxoCopyPlan()">Als eigenen Trainingsplan speichern</button></section>`;
   return html.replace(/<button class="cf206t-primary" onclick="state\.cf21Finish=null;save\(\);setView\('training'\)">Zur Trainingsübersicht<\/button>/,prompt);
  };
  window.CFUX_ORIGINAL_BRIDGE=Object.freeze({version:'2.4.0-UX-RC2',programs:['kilo','power','revenge','bennett','fsdp:*'],nativeProgressionPreserved:true,additionalExerciseTracking:true,canonicalExerciseSwap:false});
})();
