import React, { useCallback, useEffect, useRef, useState } from 'react';
import Window from '../os/Window';
import { Chess } from 'chess.js';
import { Chessground } from 'chessground';
import type { Api as CgApi } from 'chessground/api';
import 'chessground/assets/chessground.base.css';
import 'chessground/assets/chessground.brown.css';
import 'chessground/assets/chessground.cburnett.css';

export interface ChessGameProps extends WindowAppProps {}

// Board: lichess Chessground (lichess-org/chessground, GPL-3.0) with the
// cburnett pieces and brown theme — real drag & drop, legal-move dots,
// last-move and check highlights. Rules and the CPU run on chess.js (MIT).
const GLYPH: Record<string, string> = { k: '♚', q: '♛', r: '♜', b: '♝', n: '♞', p: '♟' };
const VAL: Record<string, number> = { p: 1, n: 3, b: 3, r: 5, q: 9, k: 0 };

const ChessGame: React.FC<ChessGameProps> = (props) => {
    const [game] = useState(() => new Chess());
    const [level, setLevel] = useState<'Easy' | 'Normal' | 'Hard'>('Normal');
    const [flip, setFlip] = useState(false);
    const [lastMove, setLastMove] = useState<[string, string] | null>(null);
    const boardEl = useRef<HTMLDivElement>(null);
    const cg = useRef<CgApi | null>(null);

    // legal destinations for chessground, straight out of chess.js
    const dests = useCallback(() => {
        const map = new Map<any, any[]>();
        game.moves({ verbose: true }).forEach((m: any) => {
            map.set(m.from, [...(map.get(m.from) || []), m.to]);
        });
        return map;
    }, [game]) as any;

    // Chessground holds the board; this only nudges React to redraw the panels.
    const [, redraw] = useState(0);
    const sync = () => redraw((n) => n + 1);

    const paint = useCallback((lm: [string, string] | null) => {
        const api = cg.current;
        if (!api) return;
        api.set({
            fen: game.fen(),
            turnColor: game.turn() === 'w' ? 'white' : 'black',
            lastMove: lm ? [lm[0] as any, lm[1] as any] : undefined,
            check: game.isCheck(),
            movable: { color: 'white', dests: dests(), free: false },
        });
    }, [game, dests]);

    const cpuReply = () => {
        setTimeout(() => {
            if (game.isGameOver()) {
                sync();
                return;
            }
            const all = game.moves({ verbose: true });
            let pick = all[Math.floor(Math.random() * all.length)];
            if (level !== 'Easy') {
                // Greedy 1-ply: best capture, else random (Normal). Hard adds check bonus.
                let best = -1;
                for (const m of all) {
                    const g = new Chess(game.fen());
                    g.move(m.san);
                    let score = m.captured ? VAL[m.captured] - VAL[m.piece] / 10 : 0;
                    if (level === 'Hard' && g.isCheck()) score += 0.5;
                    if (level === 'Hard' && m.promotion) score += 8;
                    if (score > best) {
                        best = score;
                        pick = m;
                    }
                }
            }
            setLastMove([pick.from, pick.to]);
            game.move(pick.san);
            sync();
            paint([pick.from, pick.to]);
        }, 350);
    };

    const userMove = (from: string, to: string) => {
        const legal = game.moves({ verbose: true }).some((m: any) => m.from === from && m.to === to);
        if (!legal) { paint(lastMove); return; }
        game.move({ from, to, promotion: 'q' });
        setLastMove([from, to]);
        sync();
        paint([from, to]);
        cpuReply();
    };

    useEffect(() => {
        if (!boardEl.current || cg.current) return;
        cg.current = Chessground(boardEl.current, {
            fen: game.fen(),
            orientation: 'white',
            movable: { color: 'white', free: false, dests: dests(), showDests: true },
            highlight: { lastMove: true, check: true },
            animation: { enabled: true, duration: 180 },
            draggable: { showGhost: true },
            events: { move: (orig: any, dest: any) => userMove(orig, dest) },
        });
        return () => { cg.current?.destroy(); cg.current = null; };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => { cg.current?.set({ orientation: flip ? 'black' : 'white' }); }, [flip]);

    const history = game.history();
    const captured = { w: [] as string[], b: [] as string[] };
    const startCount: Record<string, number> = { p: 8, n: 2, b: 2, r: 2, q: 1 };
    (['w', 'b'] as const).forEach((color) => {
        const onBoard: Record<string, number> = { p: 0, n: 0, b: 0, r: 0, q: 0 };
        game.board().flat().forEach((sq) => {
            if (sq && sq.color === color && sq.type !== 'k') onBoard[sq.type]++;
        });
        Object.keys(startCount).forEach((t) => {
            for (let i = 0; i < startCount[t] - onBoard[t]; i++) captured[color].push(t);
        });
    });

    const status = game.isCheckmate()
        ? `Checkmate — ${game.turn() === 'w' ? 'Black' : 'White'} wins`
        : game.isDraw()
          ? 'Draw'
          : game.isCheck()
            ? `Check! ${game.turn() === 'w' ? 'White' : 'Black'} to move`
            : `${game.turn() === 'w' ? 'White (you)' : 'Black (cpu)'} to move`;

    return (
        <Window
            top={50} left={150} width={560} height={600} windowTitle={`Chess — ${level} CPU`}
            windowBarIcon="chess"
            bottomLeftText={status}
            closeWindow={props.onClose} onInteract={props.onInteract} minimizeWindow={props.onMinimize}
        >
            <div className="chess-app">
                <div className="chess-top">
                    {(['Easy', 'Normal', 'Hard'] as const).map((l) => (
                        <button key={l} className={level === l ? 'on' : ''} onClick={() => setLevel(l)}>{l}</button>
                    ))}
                    <button onClick={() => setFlip((f) => !f)}>⇅ flip</button>
                    <button onClick={() => { game.reset(); setLastMove(null); sync(); paint(null); }}>↺ new</button>
                </div>
                <div className="chess-mid">
                    <div className="chess-board cg-host" ref={boardEl} />
                    <div className="chess-side">
                        <small>YOU CAPTURED</small>
                        <div className="captured">{captured.b.map((t, i) => <span key={i}>{GLYPH[t]}</span>)}</div>
                        <small>CPU CAPTURED</small>
                        <div className="captured">{captured.w.map((t, i) => <span key={i}>{GLYPH[t]}</span>)}</div>
                        <small>MOVES</small>
                        <div className="movelist">
                            {history.map((m, i) => (i % 2 === 0 ? <span key={i}><b>{i / 2 + 1}.</b> {m} {history[i + 1] || ''}</span> : null))}
                        </div>
                    </div>
                </div>
                <small>{status}</small>
            </div>
        </Window>
    );
};

export default ChessGame;
