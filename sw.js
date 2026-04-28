const CACHE_NAME = 'siddhu-portfolio-v1';
const ASSETS = [
  './',
  './index.html',
  './main.css',
  './chatbot.css',
  './script.js',
  './chatbot.js',
  './assets/data/portfolio.json',
  './assets/images/siddhu.jpeg',
  './assets/images/sarathi-logo.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(ASSETS);
    })
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );
});
