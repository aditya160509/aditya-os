import React, { FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import Editor, { loader } from '@monaco-editor/react';
import * as LW from 'lightweight-charts';
import Window from '../os/Window';
import { playUiSound } from '../../utils/sound';
import { FS_ROOT, FSNode, fsJoin, fsResolve, openApp } from '../../utils/filesystem';
import { announceWallpaper, BUILTIN_COUNT, builtinId, builtinThumb, clearWallpaper, loadWallpaper, saveBuiltin, saveColor, saveWallpaper, Wallpaper } from '../../utils/wallpaper';

loader.config({ paths: { vs: 'monaco/vs' } });

type Props = WindowAppProps;

const links = {
    github: 'https://github.com/aditya160509',
    linkedin: 'https://www.linkedin.com/in/aditya-balaji-50375237a/',
    gradeCentral: 'https://grade-central.vercel.app/',
    phenosync: 'https://github.com/aditya160509/phenosync',
    notes: 'https://github.com/aditya160509/study-notes',
};

const open = (url: string) => window.open(url, '_blank', 'noopener,noreferrer');

const ShellWindow: React.FC<Props & {
    title: string;
    icon: any;
    className?: string;
    status?: string;
    width?: number;
    height?: number;
    top?: number;
    left?: number;
}> = ({ title, icon, className = '', status, width = 930, height = 620, top = 18, left = 48, children, ...props }) => (
    <Window
        top={top}
        left={left}
        width={Math.min(width, window.innerWidth - 40)}
        height={Math.min(height, window.innerHeight - 52)}
        windowTitle={title}
        windowBarIcon={icon}
        bottomLeftText={status}
        closeWindow={props.onClose}
        onInteract={props.onInteract}
        minimizeWindow={props.onMinimize}
    >
        <div className={`studio-app ${className}`}>{children}</div>
    </Window>
);

export const PortfolioApp: React.FC<Props> = (props) => (
    <ShellWindow {...props} title="Aditya Balaji — Portfolio" icon="portfolio" status="5 objects · AdityaOS">
        <div className="portfolio-panel">
            <aside className="portfolio-rail">
                <div className="portrait-monogram">AB</div>
                <p className="eyebrow">MUMBAI · INDIA</p>
                <h2>Aditya<br/>Balaji</h2>
                <p>Builder, researcher, and student working across software, markets, AI, and science.</p>
                <div className="portfolio-socials">
                    <button onClick={() => open(links.github)}>GitHub</button>
                    <button onClick={() => open(links.linkedin)}>LinkedIn</button>
                    <a href="mailto:aditya160509@gmail.com">Email</a>
                    <a href="files/Aditya_Balaji_Resume.pdf" target="_blank" rel="noreferrer">Resume ↓</a>
                </div>
            </aside>
            <main className="portfolio-main">
                <p className="eyebrow">SELECTED WORK</p>
                <h1>Ideas built into working systems.</h1>
                <div className="project-grid">
                    <button onClick={() => open(links.gradeCentral)}><span>01</span><b>Grade Central</b><small>Academic workflow and grade intelligence.</small></button>
                    <button onClick={() => open(links.phenosync)}><span>02</span><b>PhenoSync</b><small>Research software and experimental tooling.</small></button>
                    <button onClick={() => open(links.notes)}><span>03</span><b>Study Notes</b><small>An open, structured learning archive.</small></button>
                    <button onClick={() => open(links.github)}><span>04</span><b>Code Archive</b><small>More experiments, prototypes, and repositories.</small></button>
                </div>
                <div className="portfolio-note">Double-click any desktop application to explore the rest of the workstation.</div>
            </main>
        </div>
    </ShellWindow>
);

/**
 * AI desk — runs the real Open WebUI frontend (open-webui/open-webui, BSD-3)
 * built from source and vendored into public/openwebui. The Python backend
 * does not exist on a static site, so the outer Express server answers the
 * handful of boot endpoints with canned config: the UI is genuine and fully
 * navigable, there is simply no model attached.
 */
export const ClaudeApp: React.FC<Props> = (props) => (
    <ShellWindow
        {...props}
        title="Open WebUI — Aditya"
        icon="claude"
        className="webui-app"
        status="open-webui frontend (BSD-3) · built from source · no model backend attached"
        width={1120}
        height={720}
        top={10}
        left={24}
    >
        <iframe
            className="webui-frame"
            title="Open WebUI"
            src="openwebui/"
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals"
        />
    </ShellWindow>
);

/**
 * Markets — OpenCharts (dylanpersonguy/OpenCharts), the open-source browser
 * trading terminal, built from source and vendored into public/opencharts.
 * It runs entirely client-side: advanced charting, the full drawing-tool
 * suite, watchlist, depth of market, order panel and a paper-trading engine
 * seeded with real market history. No backend, no keys.
 */
export const TradingApp: React.FC<Props> = (props) => (
    <ShellWindow
        {...props}
        title="Markets — OpenCharts terminal"
        icon="trading"
        className="markets-app"
        status="OpenCharts (MIT) · built from source · paper trading on bundled market history"
        width={1180}
        height={740}
        top={8}
        left={16}
    >
        <iframe
            className="markets-frame"
            title="OpenCharts"
            src="opencharts/index.html"
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-downloads allow-modals"
        />
    </ShellWindow>
);

export const SpotifyApp: React.FC<Props> = (props) => {
    const [theme, setTheme] = useState('Spicetify · Dracula');
    const [playlist, setPlaylist] = useState('37i9dQZEVXbLZ52XmnySJg');
    const themes: Record<string, string> = { 'Spicetify · Dracula': '#bd93f9', 'Spicetify · Nord': '#88c0d0', 'Spicetify · Gruvbox': '#fabd2f', 'Fastpotify · Dark': '#1db954' };
    const accent = themes[theme];
    return (
    <ShellWindow {...props} title="Spotify — Aditya Mix" icon="spotify" className="spotify-app" status={`${theme} · real Spotify embed · playback starts on Spotify`}>
        <aside><div className="spotify-logo" style={{ color: accent }}>●))) <b>Spotify</b></div><button>⌂ Home</button><button>⌕ Search</button><button>▤ Your Library</button><p>PLAYLISTS</p><button onClick={() => setPlaylist('37i9dQZEVXbLZ52XmnySJg')}>Deep Focus</button><button onClick={() => setPlaylist('37i9dQZF1DXcBWIGoYBM5M')}>Discover Weekly</button><button onClick={() => setPlaylist('37i9dQZF1DWZeKCadgRdKQ')}>Late Night Code</button><p>THEME (Spicetify)</p>{Object.keys(themes).map((t) => <button key={t} className={theme === t ? 'active' : ''} style={theme === t ? { borderColor: themes[t], color: themes[t] } : {}} onClick={() => setTheme(t)}>{t}</button>)}<button onClick={() => open('https://spicetify.app/docs/customization/themes')}>Spicetify themes ↗</button><button onClick={() => open('https://fastpotify.rocks/')}>Fastpotify client ↗</button></aside>
        <main><header><button>‹</button><button>›</button><span style={{ fontSize: 12, opacity: 0.7 }}>{theme}</span><button onClick={() => open('https://open.spotify.com')}>OPEN WEB PLAYER ↗</button></header><section className="spotify-hero"><p>ADITYA'S WORKSTATION</p><h1>Focus Mode</h1><span>Real Spotify embed below — press play (requires Spotify login for full playback).</span><button style={{ background: accent }} onClick={() => open(`https://open.spotify.com/playlist/${playlist}`)}>▶ PLAY ON SPOTIFY</button></section><iframe title="Spotify player" src={`https://open.spotify.com/embed/playlist/${playlist}?utm_source=generator&theme=0`} width="100%" height="260" frameBorder="0" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy" /><h3>Recently played</h3><div className="album-grid">{['Deep Focus','Coding Mode','Peaceful Piano','Synthwave'].map((x,i)=><div key={x}><span>{['◒','▧','◉','◇'][i]}</span><b>{x}</b><small>Made for Aditya</small></div>)}</div></main>
        <footer><div>◁　▶　▷</div><span>────────●────────</span><div>▤　🔊</div></footer>
    </ShellWindow>
    );
};

// Hosts that allow themselves to be iframed. Everything else opens in a
// real new tab (Google, GitHub, YouTube etc. all send X-Frame-Options).
const FRAMEABLE = ['wikipedia.org', 'wikimedia.org', 'neocities.org', 'example.com', 'openstreetmap.org'];
const GOOGLE_HOSTS = ['google.com', 'www.google.com'];
const frameable = (url: string) => {
    try {
        const h = new URL(url).hostname;
        if (GOOGLE_HOSTS.some((d) => h === d || h.endsWith(`.${d}`))) return true;
        return FRAMEABLE.some((d) => h === d || h.endsWith(`.${d}`));
    } catch {
        return false;
    }
};
// Verified: Google serves search pages without X-Frame-Options when igu=1
// is present — real results + AI Mode render inside the desktop.
const withIgu = (url: string) => {
    try {
        const u = new URL(url);
        if (GOOGLE_HOSTS.some((d) => u.hostname === d || u.hostname.endsWith(`.${d}`))) u.searchParams.set('igu', '1');
        return u.toString();
    } catch {
        return url;
    }
};
const norm = (raw: string): string => {
    const t = raw.trim();
    if (/^aditya:\/\//.test(t)) return t;
    if (/^https?:\/\//i.test(t)) return t;
    if (/^[\w-]+(\.[\w-]+)+(\/\S*)?$/.test(t)) return `https://${t}`;
    return `https://en.wikipedia.org/wiki/Special:Search?search=${encodeURIComponent(t)}`;
};

type BTab = { id: number; url: string; hist: string[]; hi: number };

export const BrowserApp: React.FC<Props & { browser?: 'Chrome' | 'Safari' }> = ({ browser = 'Chrome', ...props }) => {
    const home = browser === 'Chrome' ? 'https://www.google.com/webhp?igu=1' : 'aditya://home';
    const [tabs, setTabs] = useState<BTab[]>([{ id: 1, url: home, hist: [home], hi: 0 }]);
    const [active, setActive] = useState(1);
    const [addr, setAddr] = useState(home);
    const tab = tabs.find((t) => t.id === active)!;

    const internal = (u: string) => u.startsWith('aditya://');
    const shown = (u: string) => u;

    const nav = (url: string) => {
        let u = withIgu(norm(url));
        if (!internal(u) && !frameable(u)) {
            open(u);
            return;
        }
        setTabs((ts) => ts.map((t) => (t.id === active ? { ...t, url: u, hist: [...t.hist.slice(0, t.hi + 1), u], hi: t.hi + 1 } : t)));
        setAddr(shown(u));
    };
    const goForm = (e: FormEvent) => { e.preventDefault(); nav(addr); };
    const step = (d: number) => {
        const ni = tab.hi + d;
        if (ni < 0 || ni >= tab.hist.length) return;
        const u = tab.hist[ni];
        setTabs((ts) => ts.map((t) => (t.id === active ? { ...t, url: u, hi: ni } : t)));
        setAddr(shown(u));
    };
    const short = (u: string) => {
                try {
            const parsed = new URL(u);
            if (GOOGLE_HOSTS.some((d) => parsed.hostname === d || parsed.hostname.endsWith(`.${d}`))) {
                const q = parsed.searchParams.get('q');
                return `🔎 ${q || 'Google'}`.slice(0, 24);
            }
        } catch {}
        return u.startsWith('aditya://') ? u.replace('aditya://', 'Aditya ') : u.replace(/^https?:\/\//, '').slice(0, 22);
    };

    const dials: [string, string][] = [
        ['GitHub', links.github], ['LinkedIn', links.linkedin], ['Grade Central', links.gradeCentral],
        ['Wikipedia', 'https://en.wikipedia.org'], ['Old Google 1998', 'https://oldgoogle.neocities.org/1998/'],
        ['OpenStreetMap', 'https://www.openstreetmap.org/export/embed.html?bbox=77.0%2C28.5%2C77.4%2C28.9&layer=mapnik'],
    ];

    const newTab = () => {
        const id = Math.max(...tabs.map((t) => t.id)) + 1;
        setTabs((ts) => [...ts, { id, url: home, hist: [home], hi: 0 }]);
        setActive(id);
        setAddr(home);
    };
    const closeTab = (id: number) => {
        if (tabs.length === 1) return;
        const rest = tabs.filter((t) => t.id !== id);
        setTabs(rest);
        if (id === active) { setActive(rest[rest.length - 1].id); setAddr(rest[rest.length - 1].url); }
    };

    return <ShellWindow {...props} title={browser} icon={browser === 'Safari' ? 'safari' : 'chrome'} className={`browser-app ${browser.toLowerCase()}`} status={internal(tab.url) || frameable(tab.url) ? 'In-desktop browsing' : 'External pages open in a real browser tab'}>
        <div className="browser-tabstrip">
            {tabs.map((t) => (
                <div key={t.id} className={`btab ${t.id === active ? 'on' : ''}`} onClick={() => { setActive(t.id); setAddr(t.url); }}>
                    <i className="btab-dot" />
                    <span>{short(t.url)}</span>
                    <button className="btab-x" onClick={(e) => { e.stopPropagation(); closeTab(t.id); }}>×</button>
                </div>
            ))}
            <button className="btab-new" onClick={newTab} title="New tab">＋</button>
        </div>
        <form className="browser-toolbar" onSubmit={goForm}>
            <button type="button" className="nav" onClick={() => step(-1)} title="Back">‹</button>
            <button type="button" className="nav" onClick={() => step(1)} title="Forward">›</button>
            <button type="button" className="nav" onClick={() => nav(tab.url)} title="Reload">⟳</button>
            <button type="button" className="nav" title="Home" onClick={() => nav(home)}>⌂</button>
            <label className="omnibox">
                <i>🔒</i>
                <input value={addr} spellCheck={false} onChange={(e) => setAddr(e.target.value)} onFocus={(e) => e.target.select()} />
            </label>
            <button type="button" className="nav" title="Profile">◍</button>
        </form>
        {tab.url === 'aditya://home' ? (
            <main className="browser-start"><div className="search-logo">A<span>・</span></div><h1>Where do you want to go?</h1>
                <form onSubmit={(e) => { e.preventDefault(); nav(addr === 'aditya://home' ? (e.target as any).q.value : addr); }}><input name="q" placeholder="Search Wikipedia or type a URL…" /></form>
                <p className="browser-note">Google, Wikipedia + archive sites load inside. GitHub / YouTube open in a real tab (they block embedding).</p>
                <div className="site-dials">{dials.map(([n, u]) => <button key={n} onClick={() => nav(u)}>{n}</button>)}</div>
            </main>
        ) : tab.url === 'aditya://projects' ? (
            <main className="browser-start"><h1>Aditya's projects</h1>
                <div className="site-dials"><button onClick={() => open(links.gradeCentral)}>Grade Central ↗</button><button onClick={() => open(links.phenosync)}>PhenoSync ↗</button><button onClick={() => open(links.notes)}>Study Notes ↗</button><button onClick={() => open(links.github)}>Code archive ↗</button></div>
            </main>
        ) : (
            <iframe key={tab.url} title="browser" src={tab.url} className="browser-frame" sandbox="allow-scripts allow-same-origin allow-forms allow-popups" />
        )}
    </ShellWindow>;
};

export const ChromeApp: React.FC<Props> = (props) => <BrowserApp {...props} browser="Chrome" />;
export const SafariApp: React.FC<Props> = (props) => <BrowserApp {...props} browser="Safari" />;

export const TerminalApp: React.FC<Props> = (props) => {
    const [input, setInput] = useState('');
    const [cwd, setCwd] = useState('C:\\ADITYA');
    const [lines, setLines] = useState<string[]>(['AdityaOS Developer Console [Version 2.0]', "Type 'help' to begin. Try: ls, cd Projects, cat About\\bio.txt", '']);
    const run = (raw: string) => {
        const [cmd, ...args] = raw.trim().split(/\s+/);
        const c = (cmd || '').toLowerCase();
        const arg = args.join(' ');
        const out: string[] = [`${cwd}> ${raw}`];
        const node = fsResolve(fsJoin(cwd, arg || '.'));
        switch (c) {
            case '': break;
            case 'help':
                out.push('Files: ls [path] · cd <dir> · pwd · cat <file> · tree · open <name>');
                out.push('Info:  about · projects · links · market · stack · contact');
                out.push('Sys:   clear · exit · whoami'); break;
            case 'pwd': out.push(cwd); break;
            case 'whoami': out.push('aditya — builder · researcher · student'); break;
            case 'ls': {
                const n = node;
                if (!n) out.push('Path not found.');
                else if (n.kind !== 'dir') out.push(n.name);
                else (n.children || []).forEach((k) => out.push(`${k.kind === 'dir' ? '<DIR>' : '     '}  ${k.name}${k.desc ? '  — ' + k.desc : ''}`));
                break;
            }
            case 'cd': {
                if (!arg || arg === '~') { setCwd('C:\\ADITYA'); break; }
                const p = fsJoin(cwd, arg);
                const n = fsResolve(p);
                if (n && n.kind === 'dir') setCwd(p.replace(/\//g, '\\'));
                else out.push('Directory not found.');
                break;
            }
            case 'cat': {
                if (!node || (node.kind !== 'text')) out.push('File not found. Try: cat About\\bio.txt');
                else out.push(...(node.content || '').split('\n'));
                break;
            }
            case 'tree': {
                const walk = (n: FSNode, pre: string) => {
                    out.push(`${pre}${n.name}${n.kind === 'dir' ? '\\' : ''}`);
                    if (n.kind === 'dir') (n.children || []).forEach((k) => walk(k, pre + '  '));
                };
                walk(FS_ROOT, '');
                break;
            }
            case 'open': {
                if (!node) { out.push('Nothing matches. Try: open Games'); break; }
                if (node.kind === 'app' && node.appKey) { openApp(node.appKey); out.push(`Opening ${node.name}…`); }
                else if (node.kind === 'link' && node.url) { open(node.url); out.push(`Opening ${node.url} in browser…`); }
                else if (node.kind === 'dir') { setCwd(fsJoin(cwd, arg).replace(/\//g, '\\')); out.push(`Now in ${fsJoin(cwd, arg)}. (ls to browse)`); }
                else if (node.kind === 'text') out.push(...(node.content || '').split('\n'));
                else if (node.kind === 'pdf') { open('files/Aditya_Balaji_Resume.pdf'); out.push('Opening resume.pdf…'); }
                break;
            }
            case 'about': out.push('Aditya Balaji', 'Builder · Researcher · Student', 'Mumbai, India'); break;
            case 'projects': out.push('grade-central  → grade-central.vercel.app', 'phenosync       → github.com/aditya160509/phenosync', 'study-notes     → github.com/aditya160509/study-notes', 'nexus / atlas   → C:\\ADITYA\\Projects (Explorer)'); break;
            case 'links': out.push('github   github.com/aditya160509', 'linkedin linkedin.com/in/aditya-balaji-50375237a'); break;
            case 'contact': out.push('aditya160509@gmail.com'); break;
            case 'market': out.push('Paper terminal live in the Markets app. (open Markets)'); if (args[0] === 'open') openApp('trading'); break;
            case 'stack': out.push('TypeScript  React  Three.js  Python  Node.js  WebGL  TradingView'); break;
            case 'clear': setLines([]); setInput(''); return;
            case 'exit': props.onClose?.(); return;
            default: out.push(`'${c}' is not a recognized command. Try 'help'.`);
        }
        setLines((old) => [...old, ...out, '']);
    };
    const submit = (e: FormEvent) => { e.preventDefault(); playUiSound('key'); const v = input; setInput(''); run(v); };
    return <ShellWindow {...props} title="Terminal" icon="terminal" className="terminal-app" status={`Safe commands · ${cwd}`} width={780} height={520} top={72} left={110}>
        <div className="terminal-output">{lines.map((line,i)=><div key={i}>{line || ' '}</div>)}<form onSubmit={submit}><label>{cwd}&gt;&nbsp;</label><input autoFocus value={input} onChange={(e)=>setInput(e.target.value)} onKeyDown={(e)=>{ if(e.key==='Enter'){ e.preventDefault(); submit(e as any); } }} /></form></div>
    </ShellWindow>;
};

type CodeFile = { name: string; lang: string; icon: string; body: string };

const CODE_FILES: CodeFile[] = [
    {
        name: 'strategy.py', lang: 'python', icon: '\u{1F40D}',
        body: `"""Mean-reversion sleeve from ATLAS (QUANT360).

Ornstein-Uhlenbeck pull on the log valuation gap, sized by
inverse realised volatility and capped per name.
"""
import numpy as np
import pandas as pd


def ou_signal(prices: pd.Series, halflife: int = 12) -> pd.Series:
    log_px = np.log(prices)
    fair = log_px.ewm(halflife=halflife).mean()
    gap = log_px - fair
    return -gap / gap.rolling(60).std()


def size(signal: pd.Series, returns: pd.DataFrame, cap: float = 0.05):
    vol = returns.rolling(20).std() * np.sqrt(252)
    raw = signal.div(vol, axis=0)
    return raw.clip(-cap, cap).div(raw.abs().sum(axis=1), axis=0)
`,
    },
    {
        name: 'server.js', lang: 'javascript', icon: '\u25CF',
        body: `// AdityaOS desktop host — serves the 3D shell, the staged desktop
// and the vendored open-source apps.
const express = require('express');

const app = express();
app.use(express.static('public'));

app.get('/api/health', (_req, res) => res.json({ ok: true, uptime: process.uptime() }));

app.listen(8080, () => console.log('AdityaOS listening on :8080'));
`,
    },
    {
        name: 'research.ts', lang: 'typescript', icon: '\u25C7',
        body: `// GASI — Global Attention Saturation Index.
// Threshold recovered by profile likelihood: gamma* = 1.5625.
export interface MarketPanel {
    market: string;
    attention: number[];
    volatility: number[];
}

export const silenceSignature = (panel: MarketPanel, gamma = 1.5625) =>
    panel.attention.map((a, i) => (a > gamma ? panel.volatility[i] * -1 : panel.volatility[i]));
`,
    },
    {
        name: 'README.md', lang: 'markdown', icon: '\u25A4',
        body: `# aditya-lab

Working notes for the research and engineering stack.

- **ATLAS (QUANT360)** — eight-module quant research platform.
- **NEXUS Exchange** — agent-based market simulator, 10,200 Monte Carlo runs.
- **Glassbox SRE** — autonomous incident response, 86.7% top-1.
- **PhenoSync** — open-data phenological mismatch pipeline.

Everything here runs in the browser; edits autosave locally.
`,
    },
];

export const DeveloperApp: React.FC<Props> = (props) => {
    const [active, setActive] = useState(0);
    const [open, setOpen] = useState<number[]>([0, 1, 2, 3]);
    const [dirty, setDirty] = useState<Record<string, boolean>>({});
    const file = CODE_FILES[active];
    const key = `aditya-code-${file.name}`;
    const [value, setValue] = useState<string>(() => localStorage.getItem(`aditya-code-${CODE_FILES[0].name}`) ?? CODE_FILES[0].body);

    useEffect(() => {
        setValue(localStorage.getItem(key) ?? file.body);
    }, [key, file.body]);

    const onChange = (next?: string) => {
        setValue(next ?? '');
        try { localStorage.setItem(key, next ?? ''); } catch {}
        setDirty((d) => ({ ...d, [file.name]: true }));
    };

    return (
        <ShellWindow {...props} title="VS Code — aditya-lab" icon="vscode" className="developer-app" status="VS Code engine · Monaco editor · autosaves locally" width={980} height={640}>
            <aside>
                <b>EXPLORER</b>
                <p>ADITYA-LAB</p>
                {CODE_FILES.map((f, i) => (
                    <button key={f.name} className={i === active ? 'active' : ''} onClick={() => { setActive(i); setOpen((o) => (o.includes(i) ? o : [...o, i])); }}>
                        {f.icon} {f.name}{dirty[f.name] ? ' •' : ''}
                    </button>
                ))}
            </aside>
            <main>
                <header className="code-tabs">
                    {open.map((i) => (
                        <button key={CODE_FILES[i].name} className={i === active ? 'on' : ''} onClick={() => setActive(i)}>
                            {CODE_FILES[i].name}
                            <i onClick={(e) => { e.stopPropagation(); setOpen((o) => o.filter((x) => x !== i)); }}>×</i>
                        </button>
                    ))}
                </header>
                <div className="code-editor">
                    <Editor
                        height="100%"
                        theme="vs-dark"
                        path={file.name}
                        language={file.lang}
                        value={value}
                        onChange={onChange}
                        options={{
                            fontSize: 13,
                            minimap: { enabled: true },
                            scrollBeyondLastLine: false,
                            smoothScrolling: true,
                            renderLineHighlight: 'all',
                            automaticLayout: true,
                        }}
                    />
                </div>
                <footer>
                    <span>⑂ main{dirty[file.name] ? '*' : ''}</span>
                    <span>◉ 0 errors</span>
                    <span>UTF-8</span>
                    <span>{file.lang === 'python' ? 'Python 3.12' : file.lang === 'typescript' ? 'TypeScript 5.6' : file.lang === 'javascript' ? 'Node 22' : 'Markdown'}</span>
                </footer>
            </main>
        </ShellWindow>
    );
};



type Prefs = {
    speed: number;
    dim: number;
    clock24: boolean;
    autostart: boolean;
    reduceMotion: boolean;
    sound: boolean;
    volume: number;
    skipBoot: boolean;
    iconSize: number;
};

const loadPrefs = (): Prefs => ({
    speed: Number(localStorage.getItem('wallpaperSpeed') || '1.35'),
    dim: Number(localStorage.getItem('wallpaperDim') || '0.16'),
    clock24: localStorage.getItem('clock24') === '1',
    autostart: localStorage.getItem('autostart') !== '0',
    reduceMotion: localStorage.getItem('reduceMotion') === '1',
    sound: localStorage.getItem('soundOn') !== '0',
    volume: Number(localStorage.getItem('volume') || '0.6'),
    skipBoot: localStorage.getItem('skipBoot') === '1',
    iconSize: Number(localStorage.getItem('iconSize') || '88'),
});

export const SettingsApp: React.FC<Props> = (props) => {
    const [tab, setTab] = useState<'General' | 'Appearance' | 'Desktop' | 'Sound' | 'System' | 'About'>('Appearance');
    const [p, setP] = useState<Prefs>(loadPrefs);
    const save = (next: Prefs) => {
        setP(next);
        localStorage.setItem('wallpaperSpeed', String(next.speed));
        localStorage.setItem('wallpaperDim', String(next.dim));
        localStorage.setItem('clock24', next.clock24 ? '1' : '0');
        localStorage.setItem('autostart', next.autostart ? '1' : '0');
        localStorage.setItem('reduceMotion', next.reduceMotion ? '1' : '0');
        localStorage.setItem('soundOn', next.sound ? '1' : '0');
        localStorage.setItem('volume', String(next.volume));
        localStorage.setItem('skipBoot', next.skipBoot ? '1' : '0');
        localStorage.setItem('iconSize', String(next.iconSize));
        window.dispatchEvent(new CustomEvent('aditya-wallpaper', { detail: { speed: next.speed, dim: next.dim } }));
        window.dispatchEvent(new CustomEvent('aditya-prefs', { detail: next }));
    };
    // Wallpaper chooser — the visitor's own image or video, downscaled on the
    // way in and stored in IndexedDB on their machine.
    const [wall, setWall] = useState<Wallpaper | null>(null);
    const [wallErr, setWallErr] = useState('');
    const [busyWall, setBusyWall] = useState(false);
    const fileRef = useRef<HTMLInputElement>(null);
    useEffect(() => { loadWallpaper().then(setWall); }, []);
    const applyFile = async (file?: File | null) => {
        if (!file) return;
        setWallErr('');
        setBusyWall(true);
        try {
            setWall(await saveWallpaper(file));
            announceWallpaper();
        } catch (err: any) {
            setWallErr(err?.message || 'Could not use that file.');
        } finally {
            setBusyWall(false);
        }
    };
    const applyColor = async (color: string) => {
        setWall(await saveColor(color));
        announceWallpaper();
    };
    const resetWall = async () => {
        await clearWallpaper();
        setWall(null);
        announceWallpaper();
    };
    const pickBuiltin = async (id: string) => {
        setWall(await saveBuiltin(id));
        announceWallpaper();
    };
    const WALL_COLORS: [string, string][] = [
        ['Ink', '#0e1116'],
        ['Slate', 'linear-gradient(160deg,#1f2733,#0d1117)'],
        ['Teal', 'linear-gradient(160deg,#06343a,#04161c)'],
        ['Plum', 'linear-gradient(160deg,#2b1533,#120a18)'],
        ['Sand', 'linear-gradient(160deg,#d9cbb3,#8d7f68)'],
    ];

    const T = (key: keyof Prefs, label: string, hint: string) => (
        <div className="setting-row"><span>{label}<small>{hint}</small></span><button className={(p[key] as boolean) ? 'toggle on' : 'toggle'} onClick={() => save({ ...p, [key]: !p[key] })}>{p[key] ? 'ON' : 'OFF'}</button></div>
    );
    return <ShellWindow {...props} title="AdityaOS Settings" icon="settings" className="settings-app full-settings w95-settings" status="Full preferences · saved in this browser" width={860} height={560} top={50} left={110}>
        <aside><p className="section-label">PERSONAL</p>{(['General', 'Appearance', 'Desktop', 'Sound'] as const).map((t) => <button key={t} className={tab === t ? 'active' : ''} onClick={() => setTab(t)}>▣ {t}</button>)}<p className="section-label">SYSTEM</p>{(['System', 'About'] as const).map((t) => <button key={t} className={tab === t ? 'active' : ''} onClick={() => setTab(t)}>{t === 'System' ? '⌘ System' : '♙ About'}</button>)}<button onClick={() => { localStorage.clear(); save(loadPrefs()); }}>↺ Reset all</button></aside><main>
        {tab === 'General' && <><h2>General</h2><section><h3>Permissions</h3>{T('autostart', 'Auto-open Portfolio', 'Open Aditya Portfolio on boot')}{T('skipBoot', 'Skip boot animation', 'Go straight to desktop')}</section><section><h3>General</h3><div className="setting-row"><span>Default file open destination<small>Where files open by default</small></span><b>VS Code ▾</b></div><div className="setting-row"><span>Language<small>App UI language</small></span><b>Auto detect ▾</b></div>{T('reduceMotion', 'Reduce motion', 'Disable ambient animation')}</section></>}
        {tab === 'Appearance' && <><h2>Appearance</h2>
        <section><h3>Background</h3>
            <p>Use your own picture or clip — it is resized and kept on this device only.</p>
            <div className="wall-actions">
                <button className="wall-primary" disabled={busyWall} onClick={() => fileRef.current?.click()}>{busyWall ? 'Optimizing…' : '⬆ Choose image or video…'}</button>
                <button onClick={resetWall} disabled={!wall}>↺ Default wallpaper</button>
                <input ref={fileRef} type="file" accept="image/*,video/mp4,video/webm" style={{ display: 'none' }} onChange={(e) => applyFile(e.target.files?.[0])} />
            </div>
            <div className="wall-swatches">
                {WALL_COLORS.map(([name, css]) => (
                    <button key={name} title={name} style={{ background: css }} onClick={() => applyColor(css)} />
                ))}
            </div>
            <p className="wall-label">Wallspace library · {BUILTIN_COUNT} loops</p>
            <div className="wall-grid">
                {Array.from({ length: BUILTIN_COUNT }, (_, i) => builtinId(i + 1)).map((id) => (
                    <button
                        key={id}
                        className={wall?.src?.includes(id) ? 'on' : ''}
                        title={id}
                        onClick={() => pickBuiltin(id)}
                    >
                        <img src={builtinThumb(id)} alt="" loading="lazy" decoding="async" />
                    </button>
                ))}
            </div>
            <p className="wall-state">{wallErr ? <em>{wallErr}</em> : wall ? `Using your ${wall.kind === 'color' ? 'colour' : wall.kind}${wall.blob ? ` · ${(wall.blob.size / 1024 / 1024).toFixed(1)} MB stored` : ''}` : 'Using the bundled One Piece loop.'}</p>
        </section>
        <section><h3>Live wallpaper</h3><p>Wallspace · One Piece workspace · 10s seamless loop · full video</p><label>Playback speed <b>{p.speed.toFixed(2)}×</b><input type="range" min="0.5" max="2.5" step="0.05" value={p.speed} onChange={(e) => save({ ...p, speed: Number(e.target.value) })} /></label><label>Desktop shading <b>{Math.round(p.dim * 100)}%</b><input type="range" min="0" max="0.6" step="0.01" value={p.dim} onChange={(e) => save({ ...p, dim: Number(e.target.value) })} /></label><label>Icon size <b>{p.iconSize}px</b><input type="range" min="64" max="112" step="2" value={p.iconSize} onChange={(e) => save({ ...p, iconSize: Number(e.target.value) })} /></label></section></>}
        {tab === 'Desktop' && <><h2>Desktop</h2><section><h3>Clock & layout</h3>{T('clock24', '24-hour clock', 'Toolbar time format')}{T('autostart', 'Auto-open Portfolio', 'First window on boot')}</section><section><h3>Shortcuts</h3><p>Games (Doom · Oregon Trail · Scrabble · Digger · Wordle), dev apps (Terminal · Python+Node · Chrome · Safari), and portfolio shortcuts stay pinned.</p></section></>}
        {tab === 'Sound' && <><h2>Sound</h2><section><h3>Audio</h3>{T('sound', 'Master sound', 'UI clicks + ambience')}<label>Volume <b>{Math.round(p.volume * 100)}%</b><input type="range" min="0" max="1" step="0.05" value={p.volume} onChange={(e) => save({ ...p, volume: Number(e.target.value) })} /></label></section></>}
        {tab === 'System' && <><h2>System</h2><section><h3>Shell</h3><div className="setting-row"><span>Original desk camera and audio</span><b>ON</b></div><div className="setting-row"><span>Motion optimized MP4</span><b>ON</b></div><div className="setting-row"><span>AdityaOS desktop</span><b>1.0</b></div>{T('skipBoot', 'Skip 3D boot', 'Faster entry on slow devices')}</section></>}
        {tab === 'About' && <><h2>About</h2><section><h3>AdityaOS 1.0</h3><p>Builder · researcher · student · Mumbai, India. 3D desk by Henry Heffernan source, reskinned with your apps, games, video wallpaper, and paper markets engine.</p><div className="setting-row"><span>GitHub</span><button onClick={() => open(links.github)}>Open ↗</button></div><div className="setting-row"><span>LinkedIn</span><button onClick={() => open(links.linkedin)}>Open ↗</button></div></section></>}
        </main>
    </ShellWindow>;
};


