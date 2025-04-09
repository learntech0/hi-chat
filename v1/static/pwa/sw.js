const cacheName = 'static-v1';

const staticAssets = [
    '/',
    '/static/js/index/index.js',
    '/static/js/chat/users.min.js',
    '/static/js/chat/chat.min.js',
    '/static/css/style.min.css',
    '/static/css/users.css',
    '/static/css/chat.css',
    '/static/css/tailwindcss-colors.min.css',
    '/static/images/icons/logo.svg',
    '/static/pwa/sw.js',
    '/static/pwa/script.js',
    '/static/pwa/manifest.json'
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(cacheName).then((cache) => {
            return cache.addAll(staticAssets);
        })
    );
});

self.addEventListener('activate', (event) => {
    console.log('[Service Worker] Activating Service Worker ...', event);
});

self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request).then((response) => {
            return response || fetch(event.request).then((fetchResponse) => {
                // Cache the fetched response for future use
                return caches.open(cacheName).then((cache) => {
                    cache.put(event.request, fetchResponse.clone());
                    return fetchResponse;
                });
            });
        }).catch(() => {
            // Handle errors gracefully
            console.error('Error fetching:', event.request.url);
        })
    );
});
