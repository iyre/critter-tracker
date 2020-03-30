var version = 'v0.8.2';
const staticCacheName = 'critter-tracker-' + version;
const assets = [
  '/critter-tracker/',
  '/critter-tracker/index.html',
  '/critter-tracker/style.css',
  '/critter-tracker/script.js',
  '/critter-tracker/critters.js',
  '/critter-tracker/manifest.json',
  '/critter-tracker/images/favicon.png',
  '/critter-tracker/images/icon-256.png'
];
// install event
self.addEventListener('install', evt => {
  evt.waitUntil(
    caches.open(staticCacheName).then((cache) => {
      console.log('caching assets');
      cache.addAll(assets);
    })
  );
});
//activate event
self.addEventListener('activate', evt => {
  evt.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(keys
        .filter(key => key !== staticCacheName)
        .map(key => caches.delete(key))
      );
    })
  );
});
//fetch event
self.addEventListener('fetch', evt => {
  evt.respondWith(
    caches.match(evt.request).then(cacheRes => {
      return cacheRes || fetch(evt.request);
    })
  );
});