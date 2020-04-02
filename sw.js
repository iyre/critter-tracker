var version = 'v0.9.2';
const staticCacheName = 'critter-tracker-' + version;
const assets = [
  '/critter-tracker/',
  '/critter-tracker/index.html',
  '/critter-tracker/style.css',
  '/critter-tracker/settings.css',
  '/critter-tracker/script.js',
  '/critter-tracker/settings.js',
  '/critter-tracker/critters.js',
  '/critter-tracker/manifest.json',
  '/critter-tracker/images/favicon.png',
  '/critter-tracker/images/icon-256.png',
  '/critter-tracker/images/sprites/fish.png',
  '/critter-tracker/images/sprites/bugs.png',
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