import React, { useEffect, useRef, useState } from 'react';
import Window from '../os/Window';

export interface SnakeProps extends WindowAppProps {}

const N = 20;
type P = [number, number];

const Snake: React.FC<SnakeProps> = (props) => {
    const box = useRef<HTMLDivElement>(null);
    const [snake, setSnake] = useState<P[]>([[10, 10], [9, 10], [8, 10]]);
    const [food, setFood] = useState<P>([14, 10]);
    const [score, setScore] = useState(0);
    const [dead, setDead] = useState(false);
    const [paused, setPaused] = useState(false);
    const [started, setStarted] = useState(false);
    const [speed, setSpeed] = useState(110);
    const [wrap, setWrap] = useState(false);
    const [best, setBest] = useState(() => Number(localStorage.getItem('aditya-snake-best') || 0));
    const dir = useRef<P>([1, 0]);
    // queued turns: prevents a double keypress inside one tick from reversing
    const queue = useRef<P[]>([]);

    const reset = () => {
        setSnake([[10, 10], [9, 10], [8, 10]]);
        setFood([14, 10]);
        dir.current = [1, 0];
        queue.current = [];
        setScore(0); setDead(false); setPaused(false); setStarted(true);
        setTimeout(() => box.current?.focus(), 0);
    };

    const onKey = (e: React.KeyboardEvent) => {
        const k = e.key;
        if (k === ' ' || k.startsWith('Arrow')) e.preventDefault();
        if (k === ' ') { if (!started || dead) reset(); else setPaused((p) => !p); return; }
        const last = queue.current.length ? queue.current[queue.current.length - 1] : dir.current;
        const want: Record<string, P> = { ArrowUp: [0, -1], w: [0, -1], ArrowDown: [0, 1], s: [0, 1], ArrowLeft: [-1, 0], a: [-1, 0], ArrowRight: [1, 0], d: [1, 0] };
        const nd = want[k] || want[k.toLowerCase()];
        if (!nd) return;
        if (nd[0] === -last[0] && nd[1] === -last[1]) return;
        if (nd[0] === last[0] && nd[1] === last[1]) return;
        if (queue.current.length < 2) queue.current.push(nd);
    };

    useEffect(() => {
        if (!started || dead || paused) return;
        const id = setInterval(() => {
            if (queue.current.length) dir.current = queue.current.shift()!;
            setSnake((s) => {
                const [dx, dy] = dir.current;
                let hx = s[0][0] + dx;
                let hy = s[0][1] + dy;
                if (wrap) { hx = (hx + N) % N; hy = (hy + N) % N; }
                else if (hx < 0 || hy < 0 || hx >= N || hy >= N) { setDead(true); return s; }
                const ate = hx === food[0] && hy === food[1];
                const body = ate ? s : s.slice(0, -1);
                if (body.some(([x, y]) => x === hx && y === hy)) { setDead(true); return s; }
                if (ate) {
                    setScore((v) => {
                        const n = v + 10;
                        setBest((b) => { if (n > b) { localStorage.setItem('aditya-snake-best', String(n)); return n; } return b; });
                        return n;
                    });
                    const free: P[] = [];
                    for (let y = 0; y < N; y++)
                        for (let x = 0; x < N; x++)
                            if (!s.some((c) => c[0] === x && c[1] === y)) free.push([x, y]);
                    if (free.length) setFood(free[Math.floor(Math.random() * free.length)]);
                }
                return [[hx, hy], ...body];
            });
        }, speed);
        return () => clearInterval(id);
    }, [started, dead, paused, food, speed, wrap]);

    return (
        <Window
            top={80} left={160} width={440} height={560} windowTitle="Snake"
            windowBarIcon="windowGameIcon"
            bottomLeftText={dead ? `GAME OVER · ${score} pts · space to retry` : `score ${score} · best ${best} · arrows/WASD · space pauses`}
            closeWindow={props.onClose} onInteract={props.onInteract} minimizeWindow={props.onMinimize}
        >
            <div className="snake-app" tabIndex={0} ref={box} onKeyDown={onKey} onMouseEnter={() => box.current?.focus()}>
                <div className="snake-hud"><b>{score}</b><span>best {best}</span>
                    <div className="snake-speed">
                        {([[160, 'chill'], [110, 'normal'], [70, 'fast']] as [number, string][]).map(([v, n]) => (
                            <button key={n} className={speed === v ? 'on' : ''} onClick={() => setSpeed(v)}>{n}</button>
                        ))}
                        <button className={wrap ? 'on' : ''} onClick={() => setWrap((w) => !w)}>wrap</button>
                    </div>
                </div>
                <div className="snake-board">
                    {Array.from({ length: N * N }).map((_, i) => {
                        const x = i % N;
                        const y = Math.floor(i / N);
                        const si = snake.findIndex(([sx, sy]) => sx === x && sy === y);
                        const isFood = food[0] === x && food[1] === y;
                        return <span key={i} className={si === 0 ? 'head' : si > 0 ? 'body' : isFood ? 'food' : ''} />;
                    })}
                    {(!started || dead || paused) && (
                        <div className="snake-overlay">
                            <b>{dead ? 'GAME OVER' : paused ? 'PAUSED' : 'SNAKE'}</b>
                            {dead && <span>{score} pts</span>}
                            <button className="site-button" onClick={paused ? () => { setPaused(false); box.current?.focus(); } : reset}>
                                {paused ? 'Resume' : dead ? '↺ Play again' : '▶ Start'}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </Window>
    );
};

export default Snake;
