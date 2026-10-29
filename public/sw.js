/*
 * RackAtlas service worker.
 *
 * Only static, fingerprinted build assets and the offline page are cached. Pages and API
 * responses are never stored, so nothing from a logged-in session ends up in the cache.
 */
const VERSION = 'v1';
const ASSETS = `rackatlas-assets-${VERSION}`;
const OFFLINE_URL = '/offline.html';

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches
            .open(ASSETS)
            .then((cache) => cache.addAll([OFFLINE_URL, '/icons/icon-192.png']))
            .then(() => self.skipWaiting()),
    );
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches
            .keys()
            .then((keys) =>
                Promise.all(
                    keys
                        .filter((key) => key.startsWith('rackatlas-') && key !== ASSETS)
                        .map((key) => caches.delete(key)),
                ),
            )
            .then(() => self.clients.claim()),
    );
});

self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);

    if (request.method !== 'GET' || url.origin !== self.location.origin) {
        return;
    }

    if (request.mode === 'navigate') {
        event.respondWith(
            fetch(request).catch(() => caches.match(OFFLINE_URL)),
        );

        return;
    }

    if (url.pathname.startsWith('/build/') || url.pathname.startsWith('/icons/')) {
        event.respondWith(
            caches.open(ASSETS).then((cache) =>
                cache.match(request).then(
                    (cached) =>
                        cached ||
                        fetch(request).then((response) => {
                            if (response.ok) {
                                cache.put(request, response.clone());
                            }

                            return response;
                        }),
                ),
            ),
        );
    }
});
