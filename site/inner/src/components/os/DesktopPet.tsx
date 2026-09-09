import React, { useEffect, useRef, useState } from 'react';
import { unlock } from '../../utils/achievements';

/**
 * The desktop pet — sprite frames from Hermes Agent (NousResearch/hermes-agent,
 * MIT), downscaled and vendored. It wanders the desktop, naps, and follows the
 * cursor when you get close enough to bother it.
 */
const FRAMES = 8;
const SPEED = 46; // px per second
const SIZE = 74;

type Mode = 'idle' | 'walk' | 'follow';

const DesktopPet: React.FC = () => {
    const [pos, setPos] = useState({ x: 120, y: 260 });
    const [flip, setFlip] = useState(false);
    const [frame, setFrame] = useState(0);
    const [mode, setMode] = useState<Mode>('walk');
    const [says, setSays] = useState<string | null>(null);
    const target = useRef({ x: 400, y: 300 });
    const cursor = useRef({ x: -999, y: -999 });
    const last = useRef(performance.now());
    const raf = useRef(0);

    useEffect(() => {
        const onMove = (e: MouseEvent) => { cursor.current = { x: e.clientX, y: e.clientY }; };
        window.addEventListener('mousemove', onMove);
        return () => window.removeEventListener('mousemove', onMove);
    }, []);

    // Pick a new destination now and then; nap in between.
    useEffect(() => {
        const wander = () => {
            const pad = 90;
            target.current = {
                x: pad + Math.random() * Math.max(1, window.innerWidth - pad * 2),
                y: pad + Math.random() * Math.max(1, window.innerHeight - pad * 2 - 40),
            };
            setMode(Math.random() < 0.25 ? 'idle' : 'walk');
        };
        wander();
        const id = setInterval(wander, 6500);
        return () => clearInterval(id);
    }, []);

    useEffect(() => {
        const step = (now: number) => {
            raf.current = requestAnimationFrame(step);
            const dt = Math.min(0.05, (now - last.current) / 1000);
            last.current = now;

            setPos((p) => {
                const near = Math.hypot(cursor.current.x - p.x, cursor.current.y - p.y) < 170;
                const goal = near ? cursor.current : target.current;
                if (near && mode !== 'follow') setMode('follow');
                const dx = goal.x - p.x;
                const dy = goal.y - p.y;
                const dist = Math.hypot(dx, dy);
                if (dist < 6 || (mode === 'idle' && !near)) return p;
                const v = (near ? SPEED * 1.5 : SPEED) * dt;
                if (Math.abs(dx) > 4) setFlip(dx < 0);
                return { x: p.x + (dx / dist) * v, y: p.y + (dy / dist) * v };
            });
        };
        raf.current = requestAnimationFrame(step);
        return () => cancelAnimationFrame(raf.current);
    }, [mode]);

    // Walk cycle only animates while moving.
    useEffect(() => {
        if (mode === 'idle') return;
        const id = setInterval(() => setFrame((f) => (f + 1) % FRAMES), 130);
        return () => clearInterval(id);
    }, [mode]);

    const LINES = [
        'the markets window is only paper, relax',
        'try the konami code',
        'press ? in the terminal',
        'those wallpapers took a while to encode',
        'I live in localStorage now',
    ];

    return (
        <div
            className="desk-pet"
            style={{ transform: `translate3d(${pos.x}px, ${pos.y}px, 0) scaleX(${flip ? -1 : 1})`, width: SIZE }}
            onClick={() => {
                unlock('pet-friend');
                setSays(LINES[Math.floor(Math.random() * LINES.length)]);
                setTimeout(() => setSays(null), 3200);
            }}
            title="hello"
        >
            {says && <span className="pet-bubble" style={{ transform: `scaleX(${flip ? -1 : 1})` }}>{says}</span>}
            <img src={`assets/pet/pet-${frame}.png`} alt="" draggable={false} />
        </div>
    );
};

export default DesktopPet;
