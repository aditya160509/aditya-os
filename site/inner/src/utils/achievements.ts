// Achievements — small OS-style unlocks, kept entirely on the visitor's device.
// Nothing is sent anywhere; clearing site data resets the lot.

export type Achievement = {
    id: string;
    name: string;
    hint: string;
    secret?: boolean;
};

export const ACHIEVEMENTS: Achievement[] = [
    { id: 'first-boot', name: 'First boot', hint: 'Arrive at the desktop.' },
    { id: 'window-shopper', name: 'Window shopper', hint: 'Open five different applications.' },
    { id: 'completionist', name: 'Completionist', hint: 'Open every application at least once.' },
    { id: 'paper-trader', name: 'Paper trader', hint: 'Open the markets terminal.' },
    { id: 'dj', name: 'Resident DJ', hint: 'Start the radio.' },
    { id: 'shell-user', name: 'Shell user', hint: 'Run a command in the terminal.' },
    { id: 'decorator', name: 'Interior decorator', hint: 'Change the wallpaper.' },
    { id: 'researcher', name: 'Read the papers', hint: 'Open a research note in the file system.' },
    { id: 'curious', name: 'Curious', hint: 'Ask the assistant something.' },
    { id: 'wallpaper-thief', name: 'Take it with you', hint: 'Download a wallpaper.' },
    { id: 'installer', name: 'Taken home', hint: 'Install AdityaOS as an app.' },
    { id: 'konami', name: 'Up, up, down, down…', hint: 'Some codes never expire.', secret: true },
    { id: 'sudo', name: 'Root access', hint: 'Ask the terminal for what it will not give you.', secret: true },
    { id: 'night-owl', name: 'Night owl', hint: 'Visit between 1am and 5am.', secret: true },
    { id: 'pet-friend', name: 'Good company', hint: 'Give the desktop pet some attention.', secret: true },
];

const KEY = 'aditya-achievements';

export const unlockedIds = (): string[] => {
    try {
        return JSON.parse(localStorage.getItem(KEY) || '[]');
    } catch {
        return [];
    }
};

export const isUnlocked = (id: string) => unlockedIds().includes(id);

/** Unlock an achievement once; re-unlocking is a no-op (and shows no toast). */
export const unlock = (id: string) => {
    const found = ACHIEVEMENTS.find((a) => a.id === id);
    if (!found || isUnlocked(id)) return;
    const next = [...unlockedIds(), id];
    try { localStorage.setItem(KEY, JSON.stringify(next)); } catch {}
    window.dispatchEvent(new CustomEvent('aditya-achievement', { detail: found }));
};

export const resetAchievements = () => {
    try { localStorage.removeItem(KEY); } catch {}
    window.dispatchEvent(new CustomEvent('aditya-achievement-reset'));
};

const OPENED = 'aditya-apps-opened';
/** Track which apps have been opened, for the counting achievements. */
export const noteAppOpened = (key: string, total: number) => {
    let seen: string[] = [];
    try { seen = JSON.parse(localStorage.getItem(OPENED) || '[]'); } catch {}
    if (!seen.includes(key)) {
        seen = [...seen, key];
        try { localStorage.setItem(OPENED, JSON.stringify(seen)); } catch {}
    }
    if (seen.length >= 5) unlock('window-shopper');
    if (seen.length >= total) unlock('completionist');
    if (key === 'trading') unlock('paper-trader');
    if (key === 'radio') unlock('dj');
};
