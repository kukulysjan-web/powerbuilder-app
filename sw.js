const CACHE='coalforged-v2.0.5';
const PERSISTENT_CACHES=['jan-training-bls-v4.0-2025'];
const CORE=['./','./index.html','./manifest.json','./icon-192.png','./icon-512.png','./coalforged-mark.svg','./assets/cf-home-athlete.webp','./assets/cf-home-plates.webp','./assets/cf-forge-texture.webp','./assets/cf-mountain.webp','./assets/cf-training-athlete.webp','./assets/cf-training-plates.webp','./assets/cf-meal-dinner.webp','./assets/cf-meal-lunch.webp','./assets/cf-meal-breakfast.webp','./assets/cf-nutrition-hero.webp'];

self.addEventListener('install',event=>{
  event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(CORE)).then(()=>self.skipWaiting()));
});

self.addEventListener('activate',event=>{
  event.waitUntil(
    caches.keys()
      .then(keys=>Promise.all(keys.filter(key=>key!==CACHE&&!PERSISTENT_CACHES.includes(key)).map(key=>caches.delete(key))))
      .then(()=>self.clients.claim())
  );
});

self.addEventListener('message',event=>{
  if(event.data?.type==='SKIP_WAITING') self.skipWaiting();
});

self.addEventListener('fetch',event=>{
  if(event.request.method!=='GET') return;
  const url=new URL(event.request.url);
  if(url.origin!==self.location.origin) return;

  if(event.request.mode==='navigate'){
    event.respondWith(
      fetch(event.request)
        .then(response=>{
          const copy=response.clone();
          caches.open(CACHE).then(cache=>cache.put('./index.html',copy));
          return response;
        })
        .catch(()=>caches.match('./index.html'))
    );
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then(response=>{
        const copy=response.clone();
        caches.open(CACHE).then(cache=>cache.put(event.request,copy));
        return response;
      })
      .catch(()=>caches.match(event.request))
  );
});
