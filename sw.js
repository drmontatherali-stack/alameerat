const CACHE_NAME = 'salaf-almoqawleen-v1';
const APP_SHELL = [
  './',
  './index.html',
  './manifest.json',
  './firebase-config.js',
  './icons/icon-192.png',
  './icons/icon-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// شبكة أولاً لصفحة التطبيق نفسها (تحديثات فورية لو موجود نت)، وتخزين احتياطي بدون نت
self.addEventListener('fetch', (event) => {
  const req = event.request;

  // لا نتدخل بطلبات Firestore/Firebase (تدير هي أوفلاين بنفسها)
  if (req.url.includes('firestore.googleapis.com') || req.url.includes('firebaseapp.com')) {
    return;
  }

  event.respondWith(
    fetch(req)
      .then((res) => {
        const resClone = res.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(req, resClone));
        return res;
      })
      .catch(() => caches.match(req).then((cached) => cached || caches.match('./index.html')))
  );
});
