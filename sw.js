/* COALFORGED 2.3.0 · scoped offline-first shell, network-first navigation */
const CACHE='coalforged-v2.3.1';
const PERSISTENT_CACHES=['jan-training-bls-v4.0-2025'];
const CORE=['./','./index.html','./manifest.json','./icon-192.png','./icon-512.png','./coalforged-mark.svg','./cf-home-athlete.webp','./cf-home-plates.webp','./cf-forge-texture.webp','./cf-mountain.webp','./cf-training-athlete.webp','./cf-training-plates.webp','./cf-meal-dinner.webp','./cf-meal-lunch.webp','./cf-meal-breakfast.webp','./cf-nutrition-hero.webp','./cf-archetype-dense.webp','./cf-archetype-silver.webp','./cf-archetype-athlete.webp'];
self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(CORE)).then(()=>self.skipWaiting())));
self.addEventListener('activate',event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('coalforged-')&&k!==CACHE&&!PERSISTENT_CACHES.includes(k)).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('message',event=>{if(event.data?.type==='SKIP_WAITING')self.skipWaiting()});
self.addEventListener('fetch',event=>{
 if(event.request.method!=='GET')return;
 const url=new URL(event.request.url);if(url.origin!==self.location.origin)return;
 if(event.request.mode==='navigate'){
   event.respondWith(fetch(event.request).then(response=>{
      if(response.ok){const copy=response.clone();event.waitUntil(caches.open(CACHE).then(c=>c.put('./index.html',copy)))}return response
   }).catch(()=>caches.match('./index.html')));return;
 }
 event.respondWith(caches.match(event.request).then(cached=>cached||fetch(event.request).then(response=>{
    if(response.ok){const copy=response.clone();event.waitUntil(caches.open(CACHE).then(c=>c.put(event.request,copy)))}return response;
 })));
});
