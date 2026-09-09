/*
 * AdityaOS service worker.
 *
 * The 3D scene and the wallpaper library are far too large to precache, so this
 * only takes the app shell offline and then caches what a visitor actually
 * touches, capped so the cache cannot grow without limit. Media (video, models,
 * textures) is deliberately never cached — it streams with range requests.
 */
const SHELL = 'adityaos-shell-v3';
const RUNTIME = 'adityaos-runtime-v3';
const RUNTIME_MAX = 60;

const SHELL_URLS = [
    '/',
    '/desktop/index.html',
    '/portfolio/index.html',
    '/manifest.webmanifest',
    '/offline.html',
    '/images/android-chrome-192x192.png',
];

self.addEventListener('install', (event) => {
    // One missing URL would reject the whole addAll and leave the worker
    // uninstalled, so each entry is cached independently.
    event.waitUntil(
        caches.open(SHELL)
            .then((c) => Promise.all(SHELL_URLS.map((u) => c.add(u).catch(() => {}))))
            .then(() => self.skipWaiting())
    );
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        // Lets the browser start the network request in parallel with booting
        // this worker, so a warm navigation is not held up by SW start-up.
        (self.registration.navigationPreload
            ? self.registration.navigationPreload.enable().catch(() => {})
            : Promise.resolve())
        .then(() => caches.keys())
        .then((keys) => Promise.all(keys.filter((k) => k !== SHELL && k !== RUNTIME).map((k) => caches.delete(k))))
        .then(() => self.clients.claim())
    );
});

const isMedia = (url) => /\.(mp4|webm|glb|gltf|wasm|jsdos|mp3|ogg|hdr)$/i.test(url.pathname)
    || url.pathname.startsWith('/wallpapers/')
    || url.pathname.startsWith('/models/')
    || url.pathname.startsWith('/textures/');

const trim = async () => {
    const cache = await caches.open(RUNTIME);
    const keys = await cache.keys();
    if (keys.length > RUNTIME_MAX) await Promise.all(keys.slice(0, keys.length - RUNTIME_MAX).map((k) => cache.delete(k)));
};

self.addEventListener('fetch', (event) => {
    const { request } = event;
    if (request.method !== 'GET') return;
    const url = new URL(request.url);
    if (url.origin !== self.location.origin) return;
    if (url.pathname.startsWith('/api/') || isMedia(url)) return;

    // Navigations: network first, fall back to the cached shell when offline.
    if (request.mode === 'navigate') {
        event.respondWith((async () => {
            try {
                const preloaded = await event.preloadResponse;
                const res = preloaded || await fetch(request);
                const copy = res.clone();
                caches.open(SHELL).then((c) => c.put(request, copy));
                return res;
            } catch {
                return (await caches.match(request))
                    || (await caches.match('/'))
                    || (await caches.match('/offline.html'))
                    || Response.error();
            }
        })());
        return;
    }

    // Everything else: serve from cache, refresh in the background.
    event.respondWith(
        caches.match(request).then((hit) => {
            const fetched = fetch(request)
                .then((res) => {
                    if (res.ok) {
                        const copy = res.clone();
                        caches.open(RUNTIME).then((c) => c.put(request, copy).then(trim));
                    }
                    return res;
                })
                .catch(() => hit);
            return hit || fetched;
        })
    );
});
