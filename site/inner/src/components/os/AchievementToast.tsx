import React, { useEffect, useRef, useState } from 'react';
import { Achievement, ACHIEVEMENTS, unlock, unlockedIds } from '../../utils/achievements';

const KONAMI = [
    'ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown',
    'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a',
];

/**
 * Unlock notifications, plus the two ambient easter eggs: the Konami code and
 * the small-hours visit. Everything else is unlocked by the app that earns it.
 */
const AchievementToast: React.FC = () => {
    const [queue, setQueue] = useState<Achievement[]>([]);
    const [open, setOpen] = useState(false);
    const progress = useRef<number>(0);

    useEffect(() => {
        const onUnlock = (e: Event) => {
            const a = (e as CustomEvent).detail as Achievement;
            setQueue((q) => [...q, a]);
            setTimeout(() => setQueue((q) => q.slice(1)), 5200);
        };
        window.addEventListener('aditya-achievement', onUnlock);

        const hour = new Date().getHours();
        if (hour >= 1 && hour < 5) unlock('night-owl');

        const onKey = (e: KeyboardEvent) => {
            const want = KONAMI[progress.current];
            const got = e.key.length === 1 ? e.key.toLowerCase() : e.key;
            progress.current = got === want ? progress.current + 1 : (got === KONAMI[0] ? 1 : 0);
            if (progress.current === KONAMI.length) {
                progress.current = 0;
                unlock('konami');
                document.body.classList.add('konami-flip');
                setTimeout(() => document.body.classList.remove('konami-flip'), 4000);
            }
        };
        window.addEventListener('keydown', onKey);
        return () => {
            window.removeEventListener('aditya-achievement', onUnlock);
            window.removeEventListener('keydown', onKey);
        };
    }, []);

    const done = unlockedIds();
    const current = queue[0];

    return (
        <>
            {current && (
                <div className="ach-toast" key={current.id}>
                    <span className="ach-badge">★</span>
                    <div>
                        <b>Achievement unlocked</b>
                        <p>{current.name}</p>
                    </div>
                </div>
            )}
            <button className="ach-tray" title="Achievements" onClick={() => setOpen((o) => !o)}>
                ★ {done.length}/{ACHIEVEMENTS.length}
            </button>
            {open && (
                <div className="ach-panel">
                    <header>Achievements <button onClick={() => setOpen(false)}>×</button></header>
                    {ACHIEVEMENTS.map((a) => {
                        const got = done.includes(a.id);
                        return (
                            <div key={a.id} className={got ? 'ach-row got' : 'ach-row'}>
                                <span>{got ? '★' : a.secret ? '?' : '☆'}</span>
                                <div>
                                    <b>{got || !a.secret ? a.name : 'Hidden'}</b>
                                    <small>{got || !a.secret ? a.hint : 'Keep exploring.'}</small>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </>
    );
};

export default AchievementToast;
