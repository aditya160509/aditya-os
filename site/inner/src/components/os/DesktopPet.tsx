import React, { useCallback, useEffect, useRef, useState } from 'react';
import { unlock } from '../../utils/achievements';
import { clampPetSize, clampPetSprite, DEFAULT_PET_SIZE, DEFAULT_PET_SPRITE, PET_SPRITE_OPTIONS, PetSprite } from '../../utils/pet';

/**
 * The desktop pet — the compact eight-frame Hermes set from
 * NousResearch/hermes-agent (MIT), downscaled and vendored. The motion loop is
 * deliberately DOM-driven: React only repaints when the pose or sprite choice
 * changes, so the companion can roam without adding a render on every frame.
 */
const FRAMES = 8;
const SPEED = 46;
type Mode = 'idle' | 'walk' | 'follow';
type Point = { x: number; y: number };

const DesktopPet: React.FC = () => {
    const [enabled, setEnabled] = useState(() => localStorage.getItem('aditya-pet') !== 'none');
    const [size, setSize] = useState(() => clampPetSize(Number(localStorage.getItem('aditya-pet-size') || DEFAULT_PET_SIZE)));
    const [sprite, setSprite] = useState<PetSprite>(() => clampPetSprite(localStorage.getItem('aditya-pet-sprite') || DEFAULT_PET_SPRITE));
    const [frame, setFrame] = useState(0);
    const [mode, setMode] = useState<Mode>('idle');
    const [says, setSays] = useState<string | null>(null);

    const petRef = useRef<HTMLDivElement>(null);
    const position = useRef<Point>({ x: 120, y: 260 });
    const target = useRef<Point>({ x: 400, y: 300 });
    const cursor = useRef<Point>({ x: -999, y: -999 });
    const modeRef = useRef<Mode>('idle');
    const flipRef = useRef(false);
    const last = useRef(performance.now());
    const raf = useRef(0);
    const speechTimer = useRef<number | null>(null);

    const changeMode = useCallback((next: Mode) => {
        if (modeRef.current === next) return;
        modeRef.current = next;
        setMode(next);
    }, []);

    const pickTarget = useCallback(() => {
        const pad = Math.max(24, Math.min(90, size));
        target.current = {
            x: pad + Math.random() * Math.max(1, window.innerWidth - pad * 2 - size),
            y: pad + Math.random() * Math.max(1, window.innerHeight - pad * 2 - size - 46),
        };
        // Rest is the common beat: it reads as a little character with a
        // rhythm, not a cursor-shaped screensaver.
        changeMode(Math.random() < 0.58 ? 'idle' : 'walk');
    }, [changeMode, size]);

    useEffect(() => {
        const onMove = (e: MouseEvent) => { cursor.current = { x: e.clientX, y: e.clientY }; };
        const onResize = () => {
            position.current.x = Math.min(position.current.x, Math.max(8, window.innerWidth - size - 8));
            position.current.y = Math.min(position.current.y, Math.max(8, window.innerHeight - size - 52));
        };
        const onPrefs = (e: Event) => {
            const next = (e as CustomEvent).detail || {};
            setEnabled(next.pet !== 'none');
            if (typeof next.petSize === 'number') setSize(clampPetSize(next.petSize));
            if (typeof next.petSprite === 'string') setSprite(clampPetSprite(next.petSprite));
        };
        window.addEventListener('mousemove', onMove);
        window.addEventListener('resize', onResize);
        window.addEventListener('aditya-prefs', onPrefs);
        return () => {
            window.removeEventListener('mousemove', onMove);
            window.removeEventListener('resize', onResize);
            window.removeEventListener('aditya-prefs', onPrefs);
        };
    }, [size]);

    useEffect(() => {
        if (!enabled) return undefined;
        pickTarget();
        const id = window.setInterval(pickTarget, 6500);
        return () => window.clearInterval(id);
    }, [enabled, pickTarget]);

    useEffect(() => {
        const step = (now: number) => {
            raf.current = window.requestAnimationFrame(step);
            const dt = Math.min(0.05, (now - last.current) / 1000);
            last.current = now;
            const el = petRef.current;
            if (!el || !enabled) return;

            const p = position.current;
            const followRadius = Math.max(180, Math.min(440, Math.max(window.innerWidth, window.innerHeight) * 0.28));
            const cursorVisible = cursor.current.x > -100 && cursor.current.y > -100;
            const cursorDistance = Math.hypot(cursor.current.x - p.x, cursor.current.y - p.y);
            const follows = cursorVisible && cursorDistance < followRadius;
            if (follows && modeRef.current !== 'follow') changeMode('follow');
            if (!follows && modeRef.current === 'follow') changeMode('walk');

            if (modeRef.current === 'idle' && !follows) return;

            const goal = follows
                ? { x: cursor.current.x - size * 0.42, y: cursor.current.y - size * 0.72 }
                : target.current;
            const dx = goal.x - p.x;
            const dy = goal.y - p.y;
            const distance = Math.hypot(dx, dy);
            if (distance < 5) {
                if (follows) changeMode('follow');
                else changeMode('idle');
                return;
            }

            const velocity = (follows ? SPEED * 1.35 : SPEED) * dt;
            p.x += (dx / distance) * Math.min(velocity, distance);
            p.y += (dy / distance) * Math.min(velocity, distance);
            p.x = Math.max(8, Math.min(p.x, Math.max(8, window.innerWidth - size - 8)));
            p.y = Math.max(8, Math.min(p.y, Math.max(8, window.innerHeight - size - 52)));
            if (Math.abs(dx) > 2) flipRef.current = dx < 0;
            el.style.transform = `translate3d(${p.x}px, ${p.y}px, 0) scaleX(${flipRef.current ? -1 : 1})`;
        };

        raf.current = window.requestAnimationFrame(step);
        return () => window.cancelAnimationFrame(raf.current);
    }, [changeMode, enabled, size]);

    // Keep the sprite breathing while it walks or follows, but let it settle
    // on the first frame during a rest beat.
    useEffect(() => {
        const id = window.setInterval(() => {
            setFrame((current) => modeRef.current === 'idle' ? 0 : (current + 1) % FRAMES);
        }, 130);
        return () => window.clearInterval(id);
    }, []);

    useEffect(() => () => {
        if (speechTimer.current) window.clearTimeout(speechTimer.current);
    }, []);

    const selectedSprite = PET_SPRITE_OPTIONS.find((option) => option.value === sprite) || PET_SPRITE_OPTIONS[0];
    const say = () => {
        unlock('pet-friend');
        const lines = [
            'the markets window is only paper, relax',
            'try the konami code',
            'press ? in the terminal',
            'those wallpapers took a while to encode',
            'I live in localStorage now',
        ];
        setSays(lines[Math.floor(Math.random() * lines.length)]);
        if (speechTimer.current) window.clearTimeout(speechTimer.current);
        speechTimer.current = window.setTimeout(() => setSays(null), 3200);
    };

    if (!enabled) return null;

    return (
        <div
            ref={petRef}
            className={`desk-pet desk-pet-${sprite}`}
            style={{ width: size, transform: `translate3d(${position.current.x}px, ${position.current.y}px, 0)` }}
            onClick={say}
            onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); say(); } }}
            role="button"
            tabIndex={0}
            aria-label={`Desktop pet, ${selectedSprite.label} style, currently ${mode}`}
            title={`${selectedSprite.label} pet · click to talk`}
        >
            {says && <span className="pet-bubble" style={{ transform: `scaleX(${flipRef.current ? -1 : 1})` }}>{says}</span>}
            <img
                src={`assets/pet/pet-${frame}.png`}
                alt=""
                draggable={false}
                style={{ filter: selectedSprite.filter, imageRendering: selectedSprite.pixelated ? 'pixelated' : 'auto' }}
            />
        </div>
    );
};

export default DesktopPet;
