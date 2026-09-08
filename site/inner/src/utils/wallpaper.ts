// Wallpaper store — the desktop background the visitor chooses.
//
// Images are downscaled and re-encoded before they are kept, so a 12 MB phone
// photo becomes a ~300 KB WebP: the desktop stays smooth and nothing large is
// held in memory. Videos are kept as-is but capped, since re-encoding video in
// the browser is not worth the cost. Everything lives in IndexedDB on the
// visitor's own machine and never leaves it.

export type WallpaperKind = 'default' | 'image' | 'video' | 'color' | 'builtin';
export type Wallpaper = { kind: WallpaperKind; blob?: Blob; color?: string; src?: string };

/** The bundled Wallspace library — encoded to 720p H.264 and served on demand. */
export const BUILTIN_COUNT = 88;
export const builtinId = (i: number) => `wall-${String(i).padStart(2, '0')}`;
// Served from the outer shell's static root so the library is stored once,
// not copied into the desktop bundle and the staged build as well.
export const builtinSrc = (id: string) => `/wallpapers/${id}.mp4`;
export const builtinThumb = (id: string) => `/wallpapers/thumbs/${id}.webp`;

const DB = 'aditya-os';
const STORE = 'wallpaper';
const KEY = 'current';
export const MAX_VIDEO_BYTES = 40 * 1024 * 1024;
const MAX_EDGE = 2560;

const open = (): Promise<IDBDatabase> =>
    new Promise((resolve, reject) => {
        const req = indexedDB.open(DB, 1);
        req.onupgradeneeded = () => {
            if (!req.result.objectStoreNames.contains(STORE)) req.result.createObjectStore(STORE);
        };
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
    });

const tx = async <T,>(mode: IDBTransactionMode, run: (s: IDBObjectStore) => IDBRequest): Promise<T> => {
    const db = await open();
    return new Promise<T>((resolve, reject) => {
        const req = run(db.transaction(STORE, mode).objectStore(STORE));
        req.onsuccess = () => resolve(req.result as T);
        req.onerror = () => reject(req.error);
    });
};

/** Downscale + re-encode an image so a huge upload never reaches the canvas. */
const shrink = (file: File): Promise<Blob> =>
    new Promise((resolve, reject) => {
        const url = URL.createObjectURL(file);
        const img = new Image();
        img.onload = () => {
            const scale = Math.min(1, MAX_EDGE / Math.max(img.width, img.height));
            const w = Math.round(img.width * scale);
            const h = Math.round(img.height * scale);
            const canvas = document.createElement('canvas');
            canvas.width = w;
            canvas.height = h;
            const ctx = canvas.getContext('2d');
            if (!ctx) { URL.revokeObjectURL(url); reject(new Error('canvas unavailable')); return; }
            ctx.drawImage(img, 0, 0, w, h);
            canvas.toBlob(
                (blob) => {
                    URL.revokeObjectURL(url);
                    blob ? resolve(blob) : reject(new Error('encode failed'));
                },
                'image/webp',
                0.82
            );
        };
        img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('not an image')); };
        img.src = url;
    });

export async function saveWallpaper(file: File): Promise<Wallpaper> {
    if (file.type.startsWith('video/')) {
        if (file.size > MAX_VIDEO_BYTES) throw new Error('Video is over 40 MB — pick a shorter clip.');
        const w: Wallpaper = { kind: 'video', blob: file };
        await tx('readwrite', (s) => s.put(w, KEY));
        return w;
    }
    if (!file.type.startsWith('image/')) throw new Error('Pick an image or a video file.');
    const blob = await shrink(file);
    const w: Wallpaper = { kind: 'image', blob };
    await tx('readwrite', (s) => s.put(w, KEY));
    return w;
}

export async function saveBuiltin(id: string): Promise<Wallpaper> {
    const w: Wallpaper = { kind: 'builtin', src: builtinSrc(id) };
    await tx('readwrite', (s) => s.put(w, KEY));
    return w;
}

export async function saveColor(color: string): Promise<Wallpaper> {
    const w: Wallpaper = { kind: 'color', color };
    await tx('readwrite', (s) => s.put(w, KEY));
    return w;
}

export async function clearWallpaper(): Promise<void> {
    await tx('readwrite', (s) => s.delete(KEY));
}

export async function loadWallpaper(): Promise<Wallpaper | null> {
    try {
        return (await tx<Wallpaper | undefined>('readonly', (s) => s.get(KEY))) ?? null;
    } catch {
        return null;
    }
}

export const announceWallpaper = () => window.dispatchEvent(new CustomEvent('aditya-wallpaper-source'));
