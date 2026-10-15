'use strict';
const fs=require('fs'),vm=require('vm'),assert=require('node:assert/strict'),path=require('path');
const html=fs.readFileSync(path.join(__dirname,'index.html'),'utf8');
let passed=0,failed=[];
async function test(name,fn){try{await fn();passed++;console.log('PASS '+name)}catch(e){failed.push({name,error:e.message});console.log('FAIL '+name+': '+e.message)}}
const exact=(start,end)=>{const i=html.indexOf(start),j=html.indexOf(end,i+start.length);assert(i>=0&&j>i,`cannot extract ${start}`);return html.slice(i,j)};
const funcs=exact('function cf23B8ValidateImportRaw','importData=function(file)');
function makeStorage(seed={}){const db=new Map(Object.entries(seed));return{getItem:k=>db.has(k)?db.get(k):null,setItem:(k,v)=>{db.set(k,String(v))},removeItem:k=>db.delete(k),read:()=>Object.fromEntries(db)}}
function setup({saveFails=false,migrateFails=false,backupFails=false}={}){
 const old={version:10,kilo:{runs:[{id:'old'}]},nutrition:{days:{'2026-10-13':{foods:[{id:'f1'}]}}},physique:{measurements:[{id:'measure-old'}],targetBuild:{activeVersionId:'archived-target'}},planLibrary:{plans:[{plan_id:'protected'}]},trainingSession:{status:'paused',programKey:'plan:protected'}};
 const storage=makeStorage({'janTrainingUnifiedV1':JSON.stringify(old)});
 if(backupFails){const set=storage.setItem;storage.setItem=(k,v)=>{if(k==='janTrainingUnifiedV1_before_import_2_3_0')throw Error('quota');set(k,v)}}
 const ctx={state:structuredClone(old),localStorage:storage,STORAGE:'janTrainingUnifiedV1',CF23_B8_RELEASE_SCHEMA:10,CF23_B8_IMPORT_BACKUP:'janTrainingUnifiedV1_before_import_2_3_0',cf227PostMigrate:()=>{},cf23MigrateState:x=>{if(migrateFails)throw Error('failed migrate');return x},rebuildExerciseWeights:()=>{},save:()=>{if(saveFails)return false;storage.setItem('janTrainingUnifiedV1',JSON.stringify(ctx.state));return true}};
 vm.createContext(ctx);vm.runInContext(funcs,ctx);return{ctx,storage,old};
}
(async()=>{
 const u=setup().ctx;
 await test('Import: ungültige Eingabe abweisen',()=>assert(u.cf23B8ValidateImportRaw(null)));
 await test('Import: leere Objekte abweisen',()=>assert(u.cf23B8ValidateImportRaw({})));
 await test('Import: künftiges Schema v11 abweisen',()=>assert(u.cf23B8ValidateImportRaw({version:11,kilo:{runs:[]}})));
 await test('Import: aktives Schema v10 akzeptieren',()=>assert.equal(u.cf23B8ValidateImportRaw({version:10,kilo:{runs:[{id:'ok'}]}}),''));
 await test('Import: Legacy-runs akzeptieren',()=>assert.equal(u.cf23B8ValidateImportRaw({runs:[{phase:1}]}),''));
 await test('Import: verschachteltes staatliches Backup akzeptieren',()=>assert.equal(u.cf23B8ValidateImportRaw({state:{version:10,power:{runs:[]}}}),''));
 await test('Import: vollständiges Altbackup vor Überschreiben sichern',()=>{const {ctx,storage,old}=setup();const incoming={version:10,kilo:{runs:[{id:'new'}]},nutrition:old.nutrition,physique:old.physique,planLibrary:old.planLibrary,trainingSession:old.trainingSession};assert(ctx.cf23B8ApplyCandidate(incoming));assert.deepEqual(JSON.parse(storage.getItem('janTrainingUnifiedV1_before_import_2_3_0')),old);assert.deepEqual(JSON.parse(storage.getItem('janTrainingUnifiedV1')),incoming)});
 await test('Import: Abbruch falls Sicherheitskopie nicht möglich',()=>{const {ctx,storage,old}=setup({backupFails:true});assert.throws(()=>ctx.cf23B8ApplyCandidate({version:10,kilo:{}}),/Sicherheitskopie/);assert.deepEqual(JSON.parse(storage.getItem('janTrainingUnifiedV1')),old)});
 await test('Import: Rollback falls Migration scheitert',()=>{const {ctx,storage,old}=setup({migrateFails:true});assert.throws(()=>ctx.cf23B8ApplyCandidate({version:10,kilo:{}}),/failed migrate/);assert.deepEqual(JSON.parse(storage.getItem('janTrainingUnifiedV1')),old);assert.deepEqual(JSON.parse(JSON.stringify(ctx.state)),old)});
 await test('Import: Rollback falls Speichern scheitert',()=>{const {ctx,storage,old}=setup({saveFails:true});assert.throws(()=>ctx.cf23B8ApplyCandidate({version:10,kilo:{}}),/Speichern fehlgeschlagen/);assert.deepEqual(JSON.parse(storage.getItem('janTrainingUnifiedV1')),old)});
 await test('App: Speicher-Key und Schema bleiben v10',()=>{assert(html.includes("const STORAGE='janTrainingUnifiedV1'"));assert(html.includes('const CF23_STATE_VERSION=10;'))});
 await test('App: Versionskennung steht auf RC1',()=>{assert(html.includes("const APP_VERSION='2.3.3-rc1';"));assert(html.includes('<title>COALFORGED 2.3.3 · Release Candidate 1</title>'))});
 await test('App: Generator-/KI-Aufrufe bleiben entfernt',()=>{assert(!html.includes('Coach AI 2.5'));assert(!html.includes('Nutrition AI 2.6'));assert(!html.includes('function cf23TDEGenerateActivePlan'))});
 const worker=fs.readFileSync(path.join(__dirname,'sw.js'),'utf8');let events={},cacheDb=new Map(),fetchMode='online',fetches=[];
 const cache=(k)=>({addAll:async l=>{let c=cacheDb.get(k)||new Map();for(const item of l)c.set(item,{ok:true,text:()=>Promise.resolve('cached:'+item)});cacheDb.set(k,c)},put:async(r,res)=>{let c=cacheDb.get(k)||new Map();c.set(String(r),res);cacheDb.set(k,c)}});
 const swctx={self:{location:{origin:'https://app.example'},addEventListener:(t,cb)=>events[t]=cb,skipWaiting:async()=>{},clients:{claim:async()=>{}}},caches:{open:async key=>cache(key),keys:async()=>[...cacheDb.keys()],delete:async key=>cacheDb.delete(key),match:async req=>{for(const c of cacheDb.values())if(c.has(String(req)))return c.get(String(req));return null}},fetch:async req=>{fetches.push(req);if(fetchMode==='offline')throw Error('offline');return{ok:true,clone(){return this},text:async()=> 'online:'+req}},URL,console};
 vm.createContext(swctx);vm.runInContext(worker,swctx,{filename:'sw.js'});
 const wait=async(handler)=>{let promised=[];handler({waitUntil:x=>promised.push(x)});await Promise.all(promised)};
 await test('PWA: install registriert',()=>assert.equal(typeof events.install,'function'));
 await test('PWA: Cachekennung RC1',()=>assert(worker.includes("const CACHE='coalforged-v2.3.3-rc1';")));
 await test('PWA: Installations-Cache enthält Offline-Kern',async()=>{await wait(events.install);const c=cacheDb.get('coalforged-v2.3.3-rc1');for(const n of ['./index.html','./manifest.json','./icon-192.png','./icon-512.png'])assert(c.has(n))});
 await test('PWA: Cache-Wechsel löscht alte coalforged-Versionen, bewahrt Fremd-Cache',async()=>{cacheDb.set('coalforged-v2.3.3-b5',new Map());cacheDb.set('jan-training-bls-v4.0-2025',new Map());await wait(events.activate);assert(!cacheDb.has('coalforged-v2.3.3-b5'));assert(cacheDb.has('jan-training-bls-v4.0-2025'));assert(cacheDb.has('coalforged-v2.3.3-rc1'))});
 await test('PWA: Navigation online bevorzugt Netzwerk',async()=>{fetchMode='online';const work=[];let response;events.fetch({request:{method:'GET',mode:'navigate',url:'https://app.example/index.html',toString:()=> 'https://app.example/index.html'},respondWith:p=>{response=p},waitUntil:p=>work.push(p)});assert.equal((await response).ok,true);await Promise.all(work)});
 await test('PWA: Offline-Navigation liefert lokalen Fallback',async()=>{fetchMode='offline';let response;events.fetch({request:{method:'GET',mode:'navigate',url:'https://app.example/index.html'},respondWith:p=>response=p,waitUntil:()=>{}});const cached=await response;assert(cached!=null);assert.equal(cached.ok,true)});
 await test('PWA: kein Intercept für POST und fremde Domain',()=>{let intercepted=false;events.fetch({request:{method:'POST',mode:'cors',url:'https://app.example/a'},respondWith:()=>intercepted=true});events.fetch({request:{method:'GET',mode:'cors',url:'https://other.example/a'},respondWith:()=>intercepted=true});assert.equal(intercepted,false)});
 console.log(`\n${passed} passed, ${failed.length} failed`);
 if(failed.length){console.error(JSON.stringify(failed,null,2));process.exitCode=1}
})().catch(e=>{console.error(e);process.exitCode=1});
