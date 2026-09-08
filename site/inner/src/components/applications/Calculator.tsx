import React, { useMemo, useRef, useState } from 'react';
import Window from '../os/Window';

export interface CalculatorProps extends WindowAppProps {}

/**
 * Qalculate! — the GTK desktop calculator (qalculate-gtk) reproduced as a web
 * app: a free-text expression entry with a live result line, a history stack,
 * unit-aware arithmetic with `to` conversion ("5 km to mi"), functions,
 * constants and the tabbed keypad. Parser is a hand-written recursive-descent
 * evaluator — no eval.
 */

type Val = { n: number; unit: string | null };

const UNITS: Record<string, { base: string; f: number }> = {
    // length (base m)
    m: { base: 'm', f: 1 }, km: { base: 'm', f: 1000 }, cm: { base: 'm', f: 0.01 }, mm: { base: 'm', f: 0.001 },
    mi: { base: 'm', f: 1609.344 }, ft: { base: 'm', f: 0.3048 }, in: { base: 'm', f: 0.0254 }, yd: { base: 'm', f: 0.9144 },
    // mass (base g)
    g: { base: 'g', f: 1 }, kg: { base: 'g', f: 1000 }, mg: { base: 'g', f: 0.001 }, lb: { base: 'g', f: 453.59237 }, oz: { base: 'g', f: 28.349523125 },
    // time (base s)
    s: { base: 's', f: 1 }, min: { base: 's', f: 60 }, h: { base: 's', f: 3600 }, day: { base: 's', f: 86400 }, week: { base: 's', f: 604800 },
    // data (base B)
    B: { base: 'B', f: 1 }, KB: { base: 'B', f: 1024 }, MB: { base: 'B', f: 1048576 }, GB: { base: 'B', f: 1073741824 }, TB: { base: 'B', f: 1099511627776 },
    // temperature is handled separately below
};
const CONSTS: Record<string, number> = { pi: Math.PI, π: Math.PI, e: Math.E, phi: (1 + Math.sqrt(5)) / 2, c: 299792458, g0: 9.80665 };
const FNS: Record<string, (x: number) => number> = {
    sqrt: Math.sqrt, cbrt: Math.cbrt, abs: Math.abs, ln: Math.log, log: Math.log10, log2: Math.log2,
    exp: Math.exp, sin: Math.sin, cos: Math.cos, tan: Math.tan, asin: Math.asin, acos: Math.acos, atan: Math.atan,
    sinh: Math.sinh, cosh: Math.cosh, tanh: Math.tanh, floor: Math.floor, ceil: Math.ceil, round: Math.round,
    fact: (x) => { let r = 1; for (let i = 2; i <= Math.round(x); i++) r *= i; return r; },
};

const parse = (src: string, ans: number, deg: boolean): Val => {
    let i = 0;
    const ws = () => { while (src[i] === ' ') i++; };
    const word = (): string | null => {
        ws();
        const m = /^[A-Za-zπ°]+[0-9]?/.exec(src.slice(i));
        return m ? m[0] : null;
    };
    const angleIn = (x: number) => (deg ? (x * Math.PI) / 180 : x);
    const angleOut = (x: number) => (deg ? (x * 180) / Math.PI : x);

    const primary = (): Val => {
        ws();
        if (src[i] === '(') { i++; const v = sum(); ws(); if (src[i] !== ')') throw new Error('missing )'); i++; return v; }
        if (src[i] === '-') { i++; const v = primary(); return { ...v, n: -v.n }; }
        if (src[i] === '+') { i++; return primary(); }
        const w = word();
        if (w) {
            i += w.length;
            const lw = w.toLowerCase();
            if (FNS[lw]) {
                ws();
                if (src[i] !== '(') throw new Error(`${w}() needs an argument`);
                i++;
                const arg = sum();
                ws();
                if (src[i] !== ')') throw new Error('missing )');
                i++;
                const trig = ['sin', 'cos', 'tan'].includes(lw);
                const invTrig = ['asin', 'acos', 'atan'].includes(lw);
                const x = trig ? angleIn(arg.n) : arg.n;
                const r = FNS[lw](x);
                return { n: invTrig ? angleOut(r) : r, unit: null };
            }
            if (lw === 'ans') return { n: ans, unit: null };
            if (CONSTS[w] !== undefined) return { n: CONSTS[w], unit: null };
            if (CONSTS[lw] !== undefined) return { n: CONSTS[lw], unit: null };
            throw new Error(`unknown: ${w}`);
        }
        const m = /^([0-9]+(\.[0-9]+)?|\.[0-9]+)([eE][-+]?[0-9]+)?/.exec(src.slice(i));
        if (!m) throw new Error('expected a number');
        i += m[0].length;
        let unit: string | null = null;
        const u = word();
        if (u && (UNITS[u] || UNITS[u.toLowerCase()] || u === 'C' || u === 'F' || u === 'K')) { i += u.length; unit = UNITS[u] ? u : (UNITS[u.toLowerCase()] ? u.toLowerCase() : u); }
        return { n: parseFloat(m[0]), unit };
    };
    const power = (): Val => {
        const base = primary();
        ws();
        if (src[i] === '^') { i++; const ex = power(); return { n: Math.pow(base.n, ex.n), unit: base.unit }; }
        return base;
    };
    const product = (): Val => {
        let v = power();
        for (;;) {
            ws();
            const op = src[i];
            if (op === '*' || op === '×') { i++; const r = power(); v = { n: v.n * r.n, unit: v.unit || r.unit }; }
            else if (op === '/' || op === '÷') { i++; const r = power(); if (!r.n) throw new Error('division by zero'); v = { n: v.n / r.n, unit: v.unit }; }
            else if (op === '%') { i++; const r = power(); v = { n: v.n % r.n, unit: v.unit }; }
            else return v;
        }
    };
    const sum = (): Val => {
        let v = product();
        for (;;) {
            ws();
            if (src[i] === '+') { i++; const r = product(); v = { n: v.n + convertTo(r, v.unit).n, unit: v.unit || r.unit }; }
            else if (src[i] === '-') { i++; const r = product(); v = { n: v.n - convertTo(r, v.unit).n, unit: v.unit || r.unit }; }
            else return v;
        }
    };
    const v = sum();
    ws();
    if (i !== src.length) throw new Error(`unexpected “${src.slice(i)}”`);
    return v;
};

const tempTo = (n: number, from: string, to: string): number => {
    const k = from === 'C' ? n + 273.15 : from === 'F' ? (n - 32) / 1.8 + 273.15 : n;
    return to === 'C' ? k - 273.15 : to === 'F' ? (k - 273.15) * 1.8 + 32 : k;
};
const convertTo = (v: Val, unit: string | null): Val => {
    if (!unit || !v.unit || v.unit === unit) return v;
    if (['C', 'F', 'K'].includes(v.unit) && ['C', 'F', 'K'].includes(unit)) return { n: tempTo(v.n, v.unit, unit), unit };
    const a = UNITS[v.unit];
    const b = UNITS[unit];
    if (!a || !b || a.base !== b.base) throw new Error(`cannot convert ${v.unit} to ${unit}`);
    return { n: (v.n * a.f) / b.f, unit };
};

const fmt = (v: Val, decimals: number): string => {
    const n = v.n;
    if (!isFinite(n)) return String(n);
    const abs = Math.abs(n);
    const s = abs !== 0 && (abs >= 1e12 || abs < 1e-6)
        ? n.toExponential(Math.min(decimals, 8))
        : String(Number(n.toFixed(decimals)));
    return v.unit ? `${s} ${v.unit}` : s;
};

const evaluate = (raw: string, ans: number, deg: boolean, decimals: number): string => {
    const src = raw.trim();
    if (!src) return '';
    const conv = /\s(?:to|in|→)\s+([A-Za-z°]+)\s*$/.exec(src);
    let expr = src;
    let target: string | null = null;
    if (conv) { target = conv[1]; expr = src.slice(0, conv.index); }
    let v = parse(expr, ans, deg);
    if (target) {
        const t = UNITS[target] ? target : UNITS[target.toLowerCase()] ? target.toLowerCase() : target;
        if (!v.unit) throw new Error(`nothing to convert to ${target}`);
        v = convertTo(v, t);
    }
    return fmt(v, decimals);
};

const PADS: Record<string, string[]> = {
    General: ['7', '8', '9', '(', ')', '4', '5', '6', '*', '/', '1', '2', '3', '+', '-', '0', '.', 'E', '^', '%'],
    Functions: ['sqrt(', 'cbrt(', 'abs(', 'ln(', 'log(', 'exp(', 'sin(', 'cos(', 'tan(', 'asin(', 'acos(', 'atan(', 'floor(', 'ceil(', 'round(', 'fact(', 'log2(', 'sinh(', 'cosh(', 'tanh('],
    Units: ['m', 'km', 'cm', 'mi', 'ft', 'in', 'kg', 'g', 'lb', 'oz', 's', 'min', 'h', 'day', 'KB', 'MB', 'GB', 'C', 'F', ' to '],
    Constants: ['pi', 'e', 'phi', 'c', 'g0', 'ans'],
};

const Calculator: React.FC<CalculatorProps> = (props) => {
    const [expr, setExpr] = useState('');
    const [history, setHistory] = useState<[string, string][]>([]);
    const [ans, setAns] = useState(0);
    const [deg, setDeg] = useState(false);
    const [decimals, setDecimals] = useState(6);
    const [pad, setPad] = useState<keyof typeof PADS>('General');
    const inputRef = useRef<HTMLInputElement>(null);

    // live preview, exactly like qalculate's result line under the entry
    const preview = useMemo(() => {
        try { return evaluate(expr, ans, deg, decimals); } catch (err: any) { return expr.trim() ? `· ${err.message}` : ''; }
    }, [expr, ans, deg, decimals]);

    const commit = () => {
        if (!expr.trim()) return;
        try {
            const out = evaluate(expr, ans, deg, decimals);
            setHistory((h) => [...h.slice(-40), [expr, out]]);
            setAns(parseFloat(out));
            setExpr('');
        } catch (err: any) {
            setHistory((h) => [...h.slice(-40), [expr, `error: ${err.message}`]]);
        }
        inputRef.current?.focus();
    };
    const type = (t: string) => { setExpr((e) => e + t); inputRef.current?.focus(); };

    return (
        <Window
            top={70} left={190} width={430} height={560} windowTitle="Qalculate — Aditya Desktop"
            windowBarIcon="computerSmall"
            bottomLeftText={`${deg ? 'degrees' : 'radians'} · ${decimals} decimals · type “5 km to mi”`}
            closeWindow={props.onClose} onInteract={props.onInteract} minimizeWindow={props.onMinimize}
        >
            <div className="qalc-app">
                <div className="qalc-history">
                    {history.length === 0 && <p className="qalc-hint">Qalculate-style entry: <code>2^10</code>, <code>sqrt(144)</code>, <code>5 km to mi</code>, <code>100 F to C</code>, <code>3 GB to MB</code>, <code>ans*2</code></p>}
                    {history.map(([q, a], i) => (
                        <div key={i} className="qalc-row" onClick={() => setExpr(q)}>
                            <span>{q}</span>
                            <b className={a.startsWith('error') ? 'err' : ''}>{a}</b>
                        </div>
                    ))}
                </div>
                <div className="qalc-entry">
                    <input
                        ref={inputRef} value={expr} spellCheck={false} placeholder="expression…"
                        onChange={(e) => setExpr(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); commit(); } }}
                    />
                    <div className="qalc-preview">{preview && <span className={preview.startsWith('·') ? 'err' : ''}>{preview.startsWith('·') ? preview : `= ${preview}`}</span>}</div>
                </div>
                <div className="qalc-bar">
                    <button className={deg ? 'on' : ''} onClick={() => setDeg((d) => !d)}>{deg ? 'DEG' : 'RAD'}</button>
                    <button onClick={() => setDecimals((d) => (d >= 10 ? 2 : d + 2))}>{decimals} dp</button>
                    <button onClick={() => setExpr((e) => e.slice(0, -1))}>⌫</button>
                    <button onClick={() => setExpr('')}>C</button>
                    <button onClick={() => setHistory([])}>clear log</button>
                    <button className="eq" onClick={commit}>=</button>
                </div>
                <div className="qalc-tabs">
                    {(Object.keys(PADS) as (keyof typeof PADS)[]).map((t) => (
                        <button key={t} className={pad === t ? 'on' : ''} onClick={() => setPad(t)}>{t}</button>
                    ))}
                </div>
                <div className={`qalc-pad ${pad === 'General' ? 'g5' : 'g4'}`}>
                    {PADS[pad].map((k) => <button key={k} onClick={() => type(k)}>{k.replace('(', '')}</button>)}
                </div>
            </div>
        </Window>
    );
};

export default Calculator;
