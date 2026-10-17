/* COALFORGED 2.4.0 · Workout UX restoration: previous performance, warmup, pinned exercise notes.
   Read-only past performance; no schema migration; no original-program changes. */
(() => {
 'use strict';
 const clean=n=>String(n||'').trim().normalize('NFKC').toLocaleLowerCase('de-DE');
 const escText=t=>esc(String(t??''));
 const enc=t=>b6Enc(String(t??''));
 const dec=t=>b6Dec(String(t??''));
 const savedNotes=()=>state.cfuxPinnedNotes&&typeof state.cfuxPinnedNotes==='object'?state.cfuxPinnedNotes:{};
 const getNote=(name,old='')=>String(savedNotes()[clean(name)]??old??'').trim();
 const asSet=z=>z?.ok?z:null;
 const fmtPast=(set,date)=>{
  if(!set||!(+set.weight>=0)||!(+set.reps>0))return '';
  let result=fmtWeight(+set.weight)+' kg × '+Math.round(+set.reps);
  if(set.rir!==''&&set.rir!=null&&Number.isFinite(+set.rir))result+=' · RIR '+set.rir;
  return result;
 };
 function prevEngine(m,x){
  const histories=[...(m?.plan?.history||[])].reverse();
  for(const h of histories){
   let log=h?.logs?.[x.prescriptionKey];
   if(!log&&h?.uxDay){
    const old=h.uxDay.exercises?.find(e=>e.slot_id===x.ex.slot_id||e.exercise_id===x.exercise_id||clean(e.name)===clean(x.name));
    if(old){const key=old._uxRxKey||Object.keys(h.logs||{}).find(k=>k.includes(old.exercise_id));log=h.logs?.[key]}
   }
   const sets=(log?.sets||[]).filter(asSet);
   if(sets.length){return fmtPast(sets.at(-1));}
  }
  return prevRegistered(x.name);
 }
 function workWeightEngine(m,x){
  for(const h of [...(m?.plan?.history||[])].reverse()){
   let k=x.prescriptionKey;
   if(!h.logs?.[k]&&h.uxDay){const old=h.uxDay.exercises?.find(e=>e.slot_id===x.ex.slot_id||e.exercise_id===x.exercise_id||clean(e.name)===clean(x.name));k=old?._uxRxKey||Object.keys(h.logs||{}).find(v=>v.includes(old?.exercise_id||'__none__'))}
   const sets=h?.logs?.[k]?.sets||[];
   const z=sets.find(a=>a?.ok&&Number.isFinite(+a.weight)&&+a.weight>0);
   if(z)return +z.weight;
  }
  return Number(cfExLastWeight(x.name))||0;
 }
 function prevRegistered(name){
  let p;try{p=cfExRegistry()?.performance?.[cfExerciseId(name)]}catch(_){return ''}
  if(p&&p.lastReps>0&&Number.isFinite(+p.lastWeight))return fmtPast({weight:p.lastWeight,reps:p.lastReps,rir:p.lastRir,ok:true});
  return '';
 }
 function previousHtml(text){return text?'<div class="cfux-prev"><span>Letztes Mal</span><strong>'+escText(text)+'</strong></div>':'<div class="cfux-prev cfux-prev-empty">Noch keine frühere Satzleistung gespeichert</div>'}
 function noteHtml(name,legacy=''){
  const content=getNote(name,legacy),code=enc(name);
  return `<div class="cfux-exnote"><button type="button" aria-label="Notiz für ${escText(name)} bearbeiten" onclick="cfuxTools.openNote('${code}','${enc(legacy)}')">✎</button><span>${content?escText(content):'Notiz hinzufügen'}</span></div>`;
 }
 function openNote(nameCode,legacyCode=''){
  const name=dec(nameCode),old=dec(legacyCode),value=getNote(name,old);
  openSheet(`<div class="cfux-sheet"><h2>Übungsnotiz</h2><p class="cfux-toolhint">${escText(name)} · Angeheftet für zukünftige Workouts, auch in anderen Plänen.</p><textarea id="cfux-pinned-note" maxlength="280" rows="4" placeholder="z. B. Sitzhöhe 4 · enger Griff">${escText(value)}</textarea><button type="button" class="primary" onclick="cfuxTools.saveNote('${enc(name)}')">Notiz speichern</button><button type="button" onclick="closeSheet()">Abbrechen</button></div>`);
 }
 function saveNote(code){
  const name=dec(code),key=clean(name),el=document.getElementById('cfux-pinned-note');if(!key||!el)return;
  state.cfuxPinnedNotes=state.cfuxPinnedNotes&&typeof state.cfuxPinnedNotes==='object'?state.cfuxPinnedNotes:{};
  state.cfuxPinnedNotes[key]=String(el.value||'').trim().slice(0,280);
  save();closeSheet();render();toastMsg('Übungsnotiz für zukünftige Workouts gespeichert ✓');
 }
 function warmup(nameCode,weight){
  const name=dec(nameCode),work=Math.max(0,Number(weight)||Number(cfExLastWeight(name))||0);
  b6WarmCtx={program:'cfux',i:0,ex:name,work,round:v=>b6RoundWarm(v,name,n=>b6RoundGeneric(n,.5)),isolation:b6IsIsolation(name),preset:state.settings?.warmupPreset||'minimal'};
  renderWarmupSheet();
 }
 window.cfuxTools=Object.freeze({getNote,prevEngine,prevRegistered,workWeightEngine,previousHtml,noteHtml,openNote,saveNote,warmup});
})();
