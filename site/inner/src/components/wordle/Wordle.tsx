import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import WORDS from './Words';

type Mark = 'correct' | 'present' | 'absent';

// Standard two-pass scoring — handles duplicate letters correctly.
export function evaluate(guess: string, word: string): Mark[] {
    const marks: Mark[] = Array(guess.length).fill('absent');
    const rest: Record<string, number> = {};
    for (let i = 0; i < word.length; i++) {
        if (guess[i] === word[i]) marks[i] = 'correct';
        else rest[word[i]] = (rest[word[i]] || 0) + 1;
    }
    for (let i = 0; i < guess.length; i++) {
        if (marks[i] === 'correct') continue;
        if (rest[guess[i]] > 0) {
            marks[i] = 'present';
            rest[guess[i]]--;
        }
    }
    return marks;
}

const FIVE = WORDS.map((w) => w.toUpperCase()).filter((w) => w.length === 5);
const SET = new Set(FIVE);

function dailyWord(): string {
    const d = new Date();
    const seed = d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate();
    return FIVE[seed % FIVE.length];
}

type Stats = { played: number; won: number; streak: number; maxStreak: number };
const loadStats = (): Stats => {
    try {
        return JSON.parse(localStorage.getItem('aditya-wordle-stats') || 'null') || { played: 0, won: 0, streak: 0, maxStreak: 0 };
    } catch {
        return { played: 0, won: 0, streak: 0, maxStreak: 0 };
    }
};

const TOP = ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'];
const MID = ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'];
const BOT = ['RET', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', 'DEL'];

const COLORS: Record<Mark | 'empty', string> = {
    correct: '#6aaa64',
    present: '#c9b458',
    absent: '#787c7e',
    empty: '#ffffff',
};

const Wordle: React.FC = () => {
    const word = useMemo(dailyWord, []);
    const [guesses, setGuesses] = useState<string[]>([]);
    const [marks, setMarks] = useState<Mark[][]>([]);
    const [current, setCurrent] = useState('');
    const [over, setOver] = useState(false);
    const [won, setWon] = useState(false);
    const [stats, setStats] = useState<Stats>(loadStats);
    const [msg, setMsg] = useState('');
    const [shake, setShake] = useState(0);

    const keyState = useMemo(() => {
        const m: Record<string, Mark> = {};
        const rank: Record<Mark, number> = { absent: 0, present: 1, correct: 2 };
        guesses.forEach((g, gi) =>
            g.split('').forEach((ch, i) => {
                const mk = marks[gi]?.[i];
                if (mk && rank[mk] >= (rank[m[ch]] ?? -1)) m[ch] = mk;
            })
        );
        return m;
    }, [guesses, marks]);

    const flash = (t: string) => {
        setMsg(t);
        setTimeout(() => setMsg(''), 1400);
    };

    const submit = (cur: string, hist: string[]) => {
        if (cur.length !== 5) {
            flash('Not enough letters');
            setShake((s) => s + 1);
            return;
        }
        if (!SET.has(cur)) {
            flash('Not in word list');
            setShake((s) => s + 1);
            return;
        }
        const mk = evaluate(cur, word);
        const ng = [...hist, cur];
        const nm = [...marks, mk];
        setGuesses(ng);
        setMarks(nm);
        setCurrent('');
        if (cur === word) {
            setWon(true);
            setOver(true);
            setStats((s) => {
                const n = { played: s.played + 1, won: s.won + 1, streak: s.streak + 1, maxStreak: Math.max(s.maxStreak, s.streak + 1) };
                localStorage.setItem('aditya-wordle-stats', JSON.stringify(n));
                return n;
            });
        } else if (ng.length === 6) {
            setOver(true);
            setStats((s) => {
                const n = { ...s, played: s.played + 1, streak: 0 };
                localStorage.setItem('aditya-wordle-stats', JSON.stringify(n));
                return n;
            });
        }
    };

    useEffect(() => {
        const h = (e: KeyboardEvent) => {
            if (over) return;
            if (e.key === 'Backspace') setCurrent((c) => c.slice(0, -1));
            else if (e.key === 'Enter') submit(current, guesses);
            else if (/^[a-zA-Z]$/.test(e.key) && current.length < 5)
                setCurrent((c) => c + e.key.toUpperCase());
        };
        window.addEventListener('keydown', h);
        return () => window.removeEventListener('keydown', h);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [current, guesses, over, word]);

    const press = (k: string) => {
        if (over) return;
        if (k === 'DEL') setCurrent((c) => c.slice(0, -1));
        else if (k === 'RET') submit(current, guesses);
        else if (current.length < 5) setCurrent((c) => c + k);
    };

    const restart = () => {
        setGuesses([]);
        setMarks([]);
        setCurrent('');
        setOver(false);
        setWon(false);
    };

    const share = () => {
        const grid = marks
            .map((row) => row.map((m) => (m === 'correct' ? '🟩' : m === 'present' ? '🟨' : '⬛')).join(''))
            .join('\n');
        const text = `Aditya Wordle ${won ? guesses.length : 'X'}/6\n\n${grid}`;
        navigator.clipboard?.writeText(text).then(() => flash('Copied to clipboard!')).catch(() => flash(word));
    };

    const rows = Array.from({ length: 6 }).map((_, i) => {
        const g = guesses[i] ?? (i === guesses.length ? current : '');
        const mk = marks[i];
        return { g, mk };
    });

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <h2>Aditya Wordle</h2>
                <p>New word every day · {stats.streak}🔥 streak · {stats.won}/{stats.played} won</p>
            </div>
            {msg && <div style={styles.msg}>{msg}</div>}
            <motion.div key={shake} animate={shake ? { x: [0, -8, 8, -4, 4, 0] } : {}} style={styles.playArea}>
                {rows.map((r, i) => (
                    <div key={i} style={styles.row}>
                        {Array.from({ length: 5 }).map((_, j) => {
                            const ch = r.g[j] || '';
                            const m = r.mk?.[j];
                            return (
                                <div
                                    key={j}
                                    style={{
                                        ...styles.tile,
                                        backgroundColor: m ? COLORS[m] : COLORS.empty,
                                        color: m ? '#fff' : '#000',
                                        borderColor: ch ? '#333' : '#bbb',
                                    }}
                                >
                                    <b>{ch}</b>
                                </div>
                            );
                        })}
                    </div>
                ))}
            </motion.div>
            <div style={styles.keyboard}>
                {[TOP, MID, BOT].map((row, i) => (
                    <div key={i} style={styles.row}>
                        {row.map((k) => (
                            <button
                                key={k}
                                onClick={() => press(k)}
                                style={{
                                    ...styles.key,
                                    backgroundColor: keyState[k] ? COLORS[keyState[k]] : '#d3d6da',
                                    color: keyState[k] ? '#fff' : '#000',
                                }}
                            >
                                <b style={{ fontSize: k.length > 1 ? 11 : 14 }}>{k}</b>
                            </button>
                        ))}
                    </div>
                ))}
            </div>
            {over && (
                <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} style={styles.over}>
                    <h2>{won ? 'You win! 🎉' : `The word was ${word}`}</h2>
                    <div style={styles.overBtns}>
                        <button className="site-button" style={styles.btn} onClick={share}>Share</button>
                        <button className="site-button" style={styles.btn} onClick={restart}>Practice again</button>
                    </div>
                </motion.div>
            )}
        </div>
    );
};

const styles: StyleSheetCSS = {
    container: { flex: 1, flexDirection: 'column', alignItems: 'center', overflowY: 'auto', paddingBottom: 24 },
    header: { flexDirection: 'column', alignItems: 'center', paddingTop: 20 },
    msg: { background: '#000', color: '#fff', padding: '6px 14px', marginTop: 8, fontSize: 14 },
    playArea: { flexDirection: 'column', marginTop: 12, marginBottom: 12 },
    row: { justifyContent: 'center' },
    tile: { width: 56, height: 56, border: '2px solid', justifyContent: 'center', alignItems: 'center', margin: 3, fontSize: 24 },
    keyboard: { flexDirection: 'column', alignItems: 'center', gap: 6 },
    key: { minWidth: 40, height: 52, border: 0, borderRadius: 4, justifyContent: 'center', alignItems: 'center', margin: 2, padding: '0 8px', cursor: 'pointer' },
    over: { flexDirection: 'column', alignItems: 'center', marginTop: 12 },
    overBtns: { gap: 8, marginTop: 8 },
    btn: { padding: '8px 16px', cursor: 'pointer' },
};

export default Wordle;
