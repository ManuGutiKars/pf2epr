// Service worker del Grimorio — permite abrir la app sin conexión.
// Sube la version cada vez que reemplaces index.html o los JSON para forzar la actualizacion.
const CACHE_NAME = 'grimorio-cache-v4';
const ASSETS = [
  './',
  './index.html',
  './spells.json',
  './focus.json',
  './rituals.json',
  './feats.json',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  './icon-512-maskable.png'
];

self.addEventListener('install', function(event){
  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache){
      return cache.addAll(ASSETS);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', function(event){
  event.waitUntil(
    caches.keys().then(function(keys){
      return Promise.all(
        keys.filter(function(k){ return k !== CACHE_NAME; })
            .map(function(k){ return caches.delete(k); })
      );
    })
  );
  self.clients.claim();
});

// Estrategia: intenta la red primero (para coger actualizaciones), y si falla usa la cache.
self.addEventListener('fetch', function(event){
  if(event.request.method !== 'GET') return;
  event.respondWith(
    fetch(event.request)
      .then(function(response){
        var copy = response.clone();
        caches.open(CACHE_NAME).then(function(cache){ cache.put(event.request, copy); });
        return response;
      })
      .catch(function(){
        return caches.match(event.request).then(function(cached){
          return cached || caches.match('./index.html');
        });
      })
  );
});
