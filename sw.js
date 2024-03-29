var version = 'v1.2';
const staticCacheName = 'critter-tracker-' + version;
const assets = [
  '/critter-tracker/',
  '/critter-tracker/index.html',
  '/critter-tracker/style.css',
  '/critter-tracker/script.js',
  '/critter-tracker/critters.js',
  '/critter-tracker/manifest.json',
  '/critter-tracker/images/favicon.png',
  '/critter-tracker/images/icon-512.png',
  '/critter-tracker/images/sprites/fish.png',
  '/critter-tracker/images/sprites/bugs.png',
  '/critter-tracker/images/sprites/creatures.png',
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