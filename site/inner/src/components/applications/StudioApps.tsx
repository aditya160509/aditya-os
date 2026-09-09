import React, { FormEvent, useEffect, useRef, useState } from 'react';
import Window from '../os/Window';
import Icon from '../general/Icon';
import { playUiSound } from '../../utils/sound';
import { FS_ROOT, FSNode, fsJoin, fsResolve, openApp } from '../../utils/filesystem';
import { unlock } from '../../utils/achievements';
import { PET_SIZE_OPTIONS, PET_SPRITE_OPTIONS, clampPetSize, clampPetSprite, DEFAULT_PET_SIZE, DEFAULT_PET_SPRITE } from '../../utils/pet';
import { announceWallpaper, BUILTIN_COUNT, builtinId, builtinSrc, builtinThumb, clearWallpaper, loadWallpaper, saveBuiltin, saveColor, saveWallpaper, Wallpaper } from '../../utils/wallpaper';

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

/**
 * Portfolio — the personal site itself, served from /portfolio in this same
 * deployment and rendered inside the desktop. "Open full screen" hands the
 * visitor the real URL instead of a copy of it.
 */
export const PortfolioApp: React.FC<Props> = (props) => (
    <ShellWindow
        {...props}
        title="Aditya Balaji — Portfolio"
        icon="portfolio"
        className="site-app"
        status="the live personal site, running inside the desktop"
        width={1120}
        height={720}
        top={10}
        left={24}
    >
        <div className="site-bar">
            <span>aditya-balaji.dev · portfolio</span>
            <button onClick={() => open(`${window.location.origin}/portfolio/`)}>⤢ Open full screen ↗</button>
        </div>
        <iframe
            className="site-frame"
            title="Aditya Balaji — Portfolio"
            src="/portfolio/"
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-downloads"
        />
    </ShellWindow>
);

/**
 * AI desk — a self-contained assistant surface. There is no model behind it and
 * it never leaves the browser: replies are drawn from a small local corpus about
 * this desktop and the work it showcases, streamed a token at a time so the
 * interaction feels real. Open WebUI used to live here as a 66 MB vendored
 * build; this replaces it at a fraction of the weight.
 */
type Turn = {
    id: string;
    role: 'user' | 'assistant';
    text: string;
    feedback?: 'up' | 'down';
};

type AssistantChat = {
    id: string;
    title: string;
    turns: Turn[];
};

type AssistantArtifact = {
    title: string;
    language: string;
    body: string;
};

const turn = (role: Turn['role'], text: string, id: string): Turn => ({ id, role, text });

const SEED_CHATS: AssistantChat[] = [
    {
        id: 'research-seed',
        title: 'The research papers',
        turns: [
            turn('user', 'What research have you published?', 'seed-research-user'),
            turn('assistant', '## Three papers\n\n- **Silence Before the Break** — an attention-density threshold (γ* = 1.5625) above which 23 equity markets start following a shared narrative.\n- **When Realized Outcomes Outweigh Predictive Signals** — 100,801 Fantasy Premier League player-gameweeks on what crowds hold versus what predicts better.\n- **Asymmetric phenological advance** — blueberry flowering has advanced 5.03 days a year while its pollinator has not moved.\n\nOpen the Portfolio app and choose **Research** for the abstracts and PDF links.', 'seed-research-assistant'),
        ],
    },
    {
        id: 'desktop-seed',
        title: 'How the desktop works',
        turns: [
            turn('user', 'How was this desktop built?', 'seed-desktop-user'),
            turn('assistant', 'The outer shell is **Three.js + webpack**: it renders the CRT, the room and the monitor. The inner desktop is a React app painted into the screen, so the windows and games are real DOM.\n\n```text\nThree.js room\n  └─ CRT monitor\n      └─ React desktop iframe\n          ├─ local apps\n          └─ vendored games\n```\n\nNothing typed into the assistant leaves the browser.', 'seed-desktop-assistant'),
        ],
    },
    {
        id: 'blank-seed',
        title: 'A new conversation',
        turns: [],
    },
];

const ASSISTANT_STORAGE = 'aditya-assistant-chats';
const newId = (prefix: string) => `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

const loadChats = (): AssistantChat[] => {
    try {
        const raw = JSON.parse(localStorage.getItem(ASSISTANT_STORAGE) || 'null');
        if (!Array.isArray(raw) || !raw.length) return SEED_CHATS;
        return raw.map((chat: any, chatIndex: number) => ({
            id: String(chat.id || `chat-${chatIndex}`),
            title: String(chat.title || 'New conversation'),
            turns: Array.isArray(chat.turns) ? chat.turns.map((item: any, turnIndex: number) => ({
                id: String(item.id || `turn-${chatIndex}-${turnIndex}`),
                role: item.role === 'user' ? 'user' : 'assistant',
                text: String(item.text || ''),
                ...(item.feedback === 'up' || item.feedback === 'down' ? { feedback: item.feedback } : {}),
            })) : [],
        }));
    } catch {
        return SEED_CHATS;
    }
};

const CANNED: { match: RegExp; reply: string }[] = [
    {
        match: /paper|research|publication|manuscript|journal/i,
        reply: "Three of them, all readable from the Portfolio app under Research.\n\n**Silence Before the Break** — an attention-density threshold (γ* = 1.5625) above which 23 equity markets stop processing information independently and start following a shared narrative. Calibrated on 2015–2020, frozen, and still correct on the 2021–2025 holdout.\n\n**When Realized Outcomes Outweigh Predictive Signals** — 100,801 player-gameweeks of Fantasy Premier League. The crowd's holdings are informative, yet it reallocates far more toward a goal than toward the signal that actually predicts better.\n\n**Asymmetric phenological advance** — blueberry flowering has advanced 5.03 days a year while its pollinator hasn't moved. Overlap probability has collapsed 99.1% since 2016.",
    },
    {
        match: /phenosync|pollinat|bee|climate|blueberr/i,
        reply: "PhenoSync converts effort-biased GBIF citizen-science records into validated annual mismatch estimates. The core trick is an adaptive percentile first-event estimator — a 30× RMSE improvement over taking the naive minimum when observer effort is skewed.\n\nNorth American blueberry–bumblebee comes out as a confirmed trend at 4.57 days/year (p = 0.0003, R² = 0.83), which is 4.7× more than temperature alone explains. Western European rapeseed lands on the watchlist. South Asia is flagged data-limited rather than forced into significance.",
    },
    {
        match: /quant|attention|threshold|market|volatil|liquidit/i,
        reply: "The finding is that markets don't drift into instability, they snap. Below γ* investors weight private signals; above it they coordinate on the public narrative, liquidity providers withdraw depth against one-sided flow, and volatility amplifies.\n\nThe part I find most useful is the Silence Signature: three hours before a crossing, realized volatility sits at 0.62× baseline. Surveillance calibrated to *rising* variance is structurally blind to it, which is why the monitor fires on coordination stress and correctly abstains on credit stress like SVB.",
    },
    {
        match: /how.*(built|made)|stack|three\.?js|webgl|tech/i,
        reply: "Two apps stacked. The outer shell is Three.js + webpack — the CRT, the room, the monitor you're looking through. The inner desktop is a React app rendered to the screen's texture, so every window, the file system and the games are real DOM, not baked geometry.\n\nThe apps inside are genuine upstream builds rather than lookalikes: lichess chessground for the board, js-dos + DOSBox for Doom, OpenCharts for the terminal, and a full VS Code-themed portfolio workspace for the editor.",
    },
    {
        match: /game|doom|chess|tetris|solitaire|minesweeper|wordle/i,
        reply: "All playable, all vendored from their real sources — Doom and Scrabble through js-dos, chess on lichess's chessground with chess.js underneath, Minesweeper from nickarocho, Solitaire from scarolan/klondike, Tetris and Pong from straker's CC0 originals, Wordle from modem7's fork.\n\nThe Konami code does something. So does typing `sudo` in the terminal.",
    },
    {
        match: /wallpaper|background|theme|customi/i,
        reply: "Settings → Wallpaper. There are 88 built-in loops, or you can drop in your own image or video and it'll be downscaled and stored in your browser's IndexedDB — it never uploads anywhere. Each built-in has a download link too, if you want the file itself.",
    },
    {
        match: /hire|contact|email|resume|cv|reach/i,
        reply: "The résumé PDF is in the Portfolio app and in the file system under `/home/aditya/documents`. Contact runs through the form on the portfolio site, which opens a mail compose rather than posting anywhere.",
    },
    {
        match: /who|about|aditya|yourself/i,
        reply: "Aditya Balaji — independent quantitative researcher, currently working across market microstructure, ecological phenology and sports-betting efficiency. Founded a Quant Finance Club, interned at MalkansView.\n\nThe through-line across the three papers is the same question in different clothes: what happens to a system when the agents inside it stop reasoning independently.",
    },
    {
        match: /model|gpt|claude|llm|are you|real ai/i,
        reply: "No model. I'm a few hundred lines of pattern matching and a typing animation, running entirely in your tab — nothing you type is sent anywhere.\n\nThe honest version of an AI app on a static site is one that doesn't pretend to have a backend.",
    },
];

const FALLBACK = [
    "I only know this desktop and the work behind it — try asking about the research papers, the projects, how the 3D shell is built, or the games.",
    "That's outside what I have locally. Ask me about PhenoSync, the attention-threshold paper, the Fantasy Premier League study, or how any of these apps were put together.",
];

const SUGGESTIONS = [
    'What research have you published?',
    'How was this desktop built?',
    'Tell me about PhenoSync',
    'Which games actually work?',
];

const replyFor = (q: string) =>
    CANNED.find((c) => c.match.test(q))?.reply ??
    FALLBACK[Math.floor(Math.random() * FALLBACK.length)];

const artifactFor = (q: string): AssistantArtifact | null => {
    if (/paper|research|quant|market|attention|phenosync|pollinat/i.test(q)) {
        return {
            title: 'research.ts',
            language: 'typescript',
            body: `// GASI — Global Attention Saturation Index.\nexport const gammaStar = 1.5625;\n\nexport const silenceSignature = (\n    attention: number[],\n    volatility: number[],\n) => attention.map((value, i) =>\n    value > gammaStar ? volatility[i] * -1 : volatility[i]\n);`,
        };
    }
    if (/build|made|stack|three|webgl|app/i.test(q)) {
        return {
            title: 'architecture.txt',
            language: 'text',
            body: `THREE.JS ROOM\n  └── CRT MONITOR\n      └── REACT DESKTOP\n          ├── native apps\n          ├── vendored games\n          └── local storage\n\nNo model. No analytics. No networked chat.`,
        };
    }
    if (/game|doom|chess|tetris|solitaire|mine/i.test(q)) {
        return {
            title: 'games.md',
            language: 'markdown',
            body: `| App | Engine |\n| --- | --- |\n| Doom | js-dos + DOSBox |\n| Chess | chess.js + Chessground |\n| Tetris | Basic HTML Games |\n| Minesweeper | vendored React app |`,
        };
    }
    return null;
};

const inlineMarkdown = (value: string): React.ReactNode[] => {
    const nodes: React.ReactNode[] = [];
    const tokenPattern = /(\*\*[^*]+\*\*|`[^`]+`|\*[^*]+\*)/g;
    let cursor = 0;
    let match: RegExpExecArray | null;
    while ((match = tokenPattern.exec(value))) {
        if (match.index > cursor) nodes.push(value.slice(cursor, match.index));
        const token = match[0];
        if (token.indexOf('**') === 0) nodes.push(<strong key={`strong-${match.index}`}>{token.slice(2, -2)}</strong>);
        else if (token[0] === '`') nodes.push(<code key={`code-${match.index}`}>{token.slice(1, -1)}</code>);
        else nodes.push(<em key={`em-${match.index}`}>{token.slice(1, -1)}</em>);
        cursor = match.index + token.length;
    }
    if (cursor < value.length) nodes.push(value.slice(cursor));
    return nodes;
};

const highlightCode = (line: string): React.ReactNode[] => {
    const nodes: React.ReactNode[] = [];
    const tokenPattern = /(\/\/.*|#.*|"(?:\\.|[^"])*"|'(?:\\.|[^'])*'|\b(?:const|let|var|export|return|if|else|from|import|function|interface|new|true|false|null)\b|\b\d+(?:\.\d+)?\b)/g;
    let cursor = 0;
    let match: RegExpExecArray | null;
    while ((match = tokenPattern.exec(line))) {
        if (match.index > cursor) nodes.push(line.slice(cursor, match.index));
        const token = match[0];
        const kind = token.indexOf('//') === 0 || token[0] === '#' ? 'comment'
            : token[0] === '"' || token[0] === "'" ? 'string'
                : /^\d/.test(token) ? 'number' : 'keyword';
        nodes.push(<span className={`assistant-code-${kind}`} key={`token-${match.index}`}>{token}</span>);
        cursor = match.index + token.length;
    }
    if (cursor < line.length) nodes.push(line.slice(cursor));
    return nodes;
};

const splitTableRow = (line: string) => line.replace(/^\||\|$/g, '').split('|').map((cell) => cell.trim());

/** A small, safe Markdown renderer for the local corpus (no innerHTML). */
const renderAssistantMarkdown = (source: string): React.ReactNode[] => {
    const lines = source.split('\n');
    const blocks: React.ReactNode[] = [];
    const blockStart = (line: string) => /^(#{1,3}\s|```|\s*[-*]\s+|\s*\d+\.\s+)/.test(line);
    let i = 0;
    while (i < lines.length) {
        const line = lines[i];
        if (!line.trim()) { i += 1; continue; }
        if (line.indexOf('```') === 0) {
            const language = line.slice(3).trim() || 'text';
            const code: string[] = [];
            i += 1;
            while (i < lines.length && lines[i].indexOf('```') !== 0) { code.push(lines[i]); i += 1; }
            if (i < lines.length) i += 1;
            blocks.push(<pre className="assistant-code" key={`code-block-${i}`}><span className="assistant-code-lang">{language}</span><code>{code.map((codeLine, lineIndex) => <span className="assistant-code-line" key={lineIndex}>{highlightCode(codeLine)}{lineIndex < code.length - 1 ? '\n' : ''}</span>)}</code></pre>);
            continue;
        }
        const heading = line.match(/^(#{1,3})\s+(.+)/);
        if (heading) {
            const Tag = heading[1].length === 1 ? 'h2' : heading[1].length === 2 ? 'h3' : 'h4';
            blocks.push(<Tag key={`heading-${i}`}>{inlineMarkdown(heading[2])}</Tag>);
            i += 1;
            continue;
        }
        if (i + 1 < lines.length && line.indexOf('|') !== -1 && /^\s*\|?\s*:?-{2,}/.test(lines[i + 1])) {
            const headers = splitTableRow(line);
            const rows: string[][] = [];
            i += 2;
            while (i < lines.length && lines[i].indexOf('|') !== -1 && lines[i].trim()) { rows.push(splitTableRow(lines[i])); i += 1; }
            blocks.push(
                <div className="assistant-table-wrap" key={`table-${i}`}><table className="assistant-table"><thead><tr>{headers.map((cell, index) => <th key={index}>{inlineMarkdown(cell)}</th>)}</tr></thead><tbody>{rows.map((row, rowIndex) => <tr key={rowIndex}>{row.map((cell, cellIndex) => <td key={cellIndex}>{inlineMarkdown(cell)}</td>)}</tr>)}</tbody></table></div>,
            );
            continue;
        }
        const list = line.match(/^\s*([-*]|\d+\.)\s+(.+)/);
        if (list) {
            const ordered = /\d+\./.test(list[1]);
            const items: string[] = [];
            while (i < lines.length) {
                const item = lines[i].match(/^\s*([-*]|\d+\.)\s+(.+)/);
                if (!item || (/\d+\./.test(item[1]) !== ordered)) break;
                items.push(item[2]); i += 1;
            }
            const List = ordered ? 'ol' : 'ul';
            blocks.push(<List key={`list-${i}`}>{items.map((item, index) => <li key={index}>{inlineMarkdown(item)}</li>)}</List>);
            continue;
        }
        const paragraph: string[] = [line];
        i += 1;
        while (i < lines.length && lines[i].trim() && !blockStart(lines[i])) { paragraph.push(lines[i]); i += 1; }
        blocks.push(<p key={`paragraph-${i}`}>{inlineMarkdown(paragraph.join(' '))}</p>);
    }
    return blocks;
};

export const ClaudeApp: React.FC<Props> = (props) => {
    const [chats, setChats] = useState<AssistantChat[]>(() => loadChats());
    const [activeId, setActiveId] = useState(() => loadChats()[0]?.id || SEED_CHATS[0].id);
    const [draft, setDraft] = useState('');
    const [streaming, setStreaming] = useState(false);
    const [artifact, setArtifact] = useState<AssistantArtifact | null>(null);
    const [copied, setCopied] = useState<string | null>(null);
    const [sessionFilter, setSessionFilter] = useState('');
    const [contextMode, setContextMode] = useState<'everything' | 'research' | 'projects' | 'desktop'>('everything');
    const [contextOpen, setContextOpen] = useState(false);
    const [commandOpen, setCommandOpen] = useState(false);
    const scroller = useRef<HTMLDivElement>(null);
    const timers = useRef<number[]>([]);
    const activeChat = chats.find((chat) => chat.id === activeId) || chats[0] || SEED_CHATS[0];
    const turns = activeChat.turns;
    const visibleChats = chats.filter((chat) => chat.title.toLowerCase().includes(sessionFilter.toLowerCase()));

    useEffect(() => {
        try { localStorage.setItem(ASSISTANT_STORAGE, JSON.stringify(chats)); } catch { /* private mode */ }
    }, [chats]);

    // Drop any in-flight stream when the window closes, so a half-typed reply
    // cannot land on an unmounted component.
    useEffect(() => () => { timers.current.forEach(window.clearTimeout); }, []);

    useEffect(() => {
        const el = scroller.current;
        if (el) el.scrollTop = el.scrollHeight;
    }, [activeId, turns.length, streaming]);

    useEffect(() => {
        const onKey = (event: KeyboardEvent) => {
            if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
                event.preventDefault();
                setCommandOpen(true);
            }
            if (event.key === 'Escape') {
                setCommandOpen(false);
                setContextOpen(false);
            }
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, []);

    const stop = () => {
        timers.current.forEach(window.clearTimeout);
        timers.current = [];
        setStreaming(false);
    };

    const beginReply = (question: string, replaceLastAssistant = false) => {
        const q = question.trim();
        if (!q || streaming) return;
        setDraft('');
        const userTurn = turn('user', q, newId('user'));
        const assistantTurn = turn('assistant', '', newId('assistant'));
        const current = activeChat.turns;
        const nextTurns = replaceLastAssistant && current[current.length - 1]?.role === 'assistant'
            ? [...current.slice(0, -1), assistantTurn]
            : [...current, userTurn, assistantTurn];
        setChats((all) => all.map((chat) => chat.id === activeChat.id ? {
            ...chat,
            title: chat.turns.length ? chat.title : q.slice(0, 34),
            turns: nextTurns,
        } : chat));
        setStreaming(true);
        playUiSound('key');
        unlock('curious');
        setArtifact(artifactFor(q));

        const full = replyFor(q);
        // Stream in word chunks with a short lead-in, which reads closer to a
        // real completion than revealing the whole block at once.
        const words = full.split(' ');
        let shown = 0;
        const step = () => {
            shown += 1 + Math.floor(Math.random() * 2);
            const text = words.slice(0, shown).join(' ');
            setChats((all) => all.map((chat) => chat.id === activeChat.id ? {
                ...chat,
                turns: chat.turns.map((item) => item.id === assistantTurn.id ? { ...item, text } : item),
            } : chat));
            if (shown < words.length) {
                timers.current.push(window.setTimeout(step, 18 + Math.random() * 34));
            } else {
                timers.current = [];
                setStreaming(false);
            }
        };
        timers.current.push(window.setTimeout(step, 320));
    };

    const ask = (question: string) => beginReply(question);

    const newChat = () => {
        stop();
        const id = newId('chat');
        setChats((all) => [{ id, title: 'New conversation', turns: [] }, ...all]);
        setActiveId(id);
        setArtifact(null);
    };

    const regenerate = () => {
        const previous = [...turns].reverse().find((item) => item.role === 'user');
        if (previous) beginReply(previous.text, true);
    };

    const feedback = (id: string, value: 'up' | 'down') => {
        setChats((all) => all.map((chat) => chat.id === activeChat.id ? {
            ...chat,
            turns: chat.turns.map((item) => item.id === id ? { ...item, feedback: item.feedback === value ? undefined : value } : item),
        } : chat));
    };

    const copy = async (item: Turn) => {
        try { await navigator.clipboard?.writeText(item.text); } catch { /* clipboard permission denied */ }
        setCopied(item.id);
        window.setTimeout(() => setCopied((current) => current === item.id ? null : current), 1200);
    };

    return (
        <ShellWindow
            {...props}
            title="Assistant — Aditya"
            icon="claude"
            className="assistant-app"
            status="runs entirely in your browser · no model, no network"
            width={1080}
            height={700}
            top={10}
            left={24}
        >
            <div className="assistant-v2">
                <aside className="assistant-sidebar">
                    <div className="assistant-brand"><span>✳</span><b>Assistant</b></div>
                    <div className="assistant-sidebar-actions">
                        <button type="button" className="assistant-new-chat" onClick={newChat}>＋ <span>New chat</span></button>
                        <button type="button" className="assistant-command-button" onClick={() => setCommandOpen(true)} title="Search chats (⌘K)">⌘K</button>
                    </div>
                    <div className="assistant-sidebar-label">Recent</div>
                    <input
                        className="assistant-session-search"
                        value={sessionFilter}
                        onChange={(event) => setSessionFilter(event.target.value)}
                        placeholder="Search conversations"
                        aria-label="Search conversations"
                    />
                    <div className="assistant-chat-list">
                        {visibleChats.map((chat) => (
                            <button key={chat.id} type="button" className={`assistant-chat${chat.id === activeChat.id ? ' active' : ''}`} onClick={() => { stop(); setActiveId(chat.id); setArtifact(null); }}>
                                <span className="assistant-chat-glyph">◦</span><span>{chat.title}</span>
                            </button>
                        ))}
                        {!visibleChats.length && <span className="assistant-empty-search">No matching chats</span>}
                    </div>
                    <div className="assistant-local-note"><span className="assistant-local-dot" /><span className="assistant-local-copy">Local workspace<small>Nothing leaves this device</small></span></div>
                </aside>
                <main className="assistant-main">
                    <header className="assistant-header">
                        <div className="assistant-header-title"><b>{activeChat.title}</b><small>Assistant · local corpus</small></div>
                        <div className="assistant-header-tools">
                            <span className={`assistant-run-state${streaming ? ' is-busy' : ''}`}><i />{streaming ? 'Working locally' : 'Ready'}</span>
                            <button type="button" className="assistant-header-button" onClick={() => setCommandOpen(true)} title="Open command palette">⌘K</button>
                            <button type="button" className="assistant-header-button" onClick={() => setArtifact((current) => current ? null : artifactFor(turns[turns.length - 1]?.text || 'research'))} title="Toggle workspace artifact">◈</button>
                        </div>
                    </header>
                    <div className="assistant-context-bar">
                        <div className="assistant-context-copy"><span className="assistant-context-dot" />Local workspace context</div>
                        <button type="button" onClick={() => setContextOpen((open) => !open)} aria-expanded={contextOpen}>⌘ {contextMode} <span>⌄</span></button>
                        {contextOpen && (
                            <div className="assistant-context-menu">
                                {(['everything', 'research', 'projects', 'desktop'] as const).map((item) => (
                                    <button key={item} type="button" className={contextMode === item ? 'selected' : ''} onClick={() => { setContextMode(item); setContextOpen(false); }}>
                                        <span>{contextMode === item ? '✓' : '·'}</span>{item === 'everything' ? 'Everything' : item[0].toUpperCase() + item.slice(1)}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                    <div className="assistant-log" ref={scroller}>
                    {turns.length === 0 && (
                        <div className="assistant-intro">
                            <div className="assistant-intro-mark">✳</div>
                            <h2>What can I help with?</h2>
                            <p>
                                Ask about the research, projects, apps, or the way this desktop was built.
                            </p>
                            <div className="assistant-chips">
                                {SUGGESTIONS.map((s) => (
                                    <button key={s} type="button" onClick={() => ask(s)}>{s}</button>
                                ))}
                            </div>
                        </div>
                    )}
                    {turns.map((t, i) => (
                        <article key={t.id} className={`assistant-message is-${t.role}`}>
                            <div className={`assistant-avatar assistant-avatar-${t.role}`}>{t.role === 'user' ? 'AB' : '✳'}</div>
                            <div className="assistant-message-body">
                                <div className="assistant-message-meta"><b>{t.role === 'user' ? 'You' : 'Assistant'}</b><span>just now</span></div>
                                <div className="assistant-text">
                                    {t.text ? renderAssistantMarkdown(t.text) : streaming ? <div className="assistant-thinking"><span /> <span /> <span /> <em>Thinking</em></div> : <span className="assistant-stopped">Response stopped.</span>}
                                    {streaming && i === turns.length - 1 && t.role === 'assistant' && t.text && <span className="assistant-caret" />}
                                </div>
                                {t.role === 'assistant' && t.text && !streaming && (
                                    <details className="assistant-trace">
                                        <summary>Local trace · {contextMode}</summary>
                                        <span>Matched the on-device corpus · no network request · response assembled in this tab.</span>
                                    </details>
                                )}
                                {t.role === 'assistant' && t.text && !streaming && (
                                    <div className="assistant-message-actions">
                                        <button type="button" title="Copy response" onClick={() => copy(t)}>{copied === t.id ? 'Copied' : 'Copy'}</button>
                                        <button type="button" title="Helpful" className={t.feedback === 'up' ? 'selected' : ''} onClick={() => feedback(t.id, 'up')}>↑</button>
                                        <button type="button" title="Not helpful" className={t.feedback === 'down' ? 'selected' : ''} onClick={() => feedback(t.id, 'down')}>↓</button>
                                        {i === turns.length - 1 && <button type="button" title="Regenerate response" onClick={regenerate}>↻</button>}
                                    </div>
                                )}
                            </div>
                        </article>
                    ))}
                    </div>
                    <form className="assistant-composer" onSubmit={(e: FormEvent) => { e.preventDefault(); ask(draft); }}>
                        <div className="assistant-composer-row">
                            <button type="button" className="assistant-attach" title="Choose local context" onClick={() => setContextOpen((open) => !open)}>＋</button>
                            <textarea
                                value={draft}
                                rows={1}
                                maxLength={4000}
                                onChange={(e) => setDraft(e.target.value)}
                                onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); ask(draft); } }}
                                placeholder="Message the local assistant…"
                                aria-label="Message the assistant"
                            />
                            {streaming ? <button type="button" className="assistant-stop" onClick={stop}>Stop</button> : <button type="submit" className="assistant-send" disabled={!draft.trim()}>↑</button>}
                        </div>
                        <div className="assistant-composer-meta"><span>Shift + Enter for a new line</span><span>Local corpus · {draft.length}/4000</span></div>
                    </form>
                    <div className="assistant-disclaimer">The local corpus can be wrong or incomplete. Nothing is sent to a model.</div>
                </main>
                {artifact ? (
                    <aside className="assistant-artifact">
                        <div className="assistant-artifact-header"><span>Artifact</span><button type="button" title="Close artifact" onClick={() => setArtifact(null)}>×</button></div>
                        <div className="assistant-artifact-file"><span>◈</span><b>{artifact.title}</b><small>{artifact.language}</small></div>
                        <pre><code>{artifact.body}</code></pre>
                        <small className="assistant-artifact-note">Generated from the local workspace corpus</small>
                    </aside>
                ) : (
                    <aside className="assistant-inspector">
                        <div className="assistant-inspector-title"><span>Workspace</span><span className="assistant-inspector-live">LIVE</span></div>
                        <div className="assistant-inspector-card"><span className="assistant-inspector-icon">◌</span><div><b>Local corpus</b><small>Research, projects &amp; apps</small></div></div>
                        <div className="assistant-inspector-section">Try asking</div>
                        {[SUGGESTIONS[0], SUGGESTIONS[2], SUGGESTIONS[1]].map((item) => <button key={item} type="button" className="assistant-inspector-prompt" onClick={() => ask(item)}>{item}<span>↗</span></button>)}
                        <div className="assistant-inspector-section">Session notes</div>
                        <p className="assistant-inspector-note">Replies are simulated from bundled text. Your prompts stay inside this browser.</p>
                    </aside>
                )}
                {commandOpen && (
                    <div className="assistant-command-overlay" role="dialog" aria-modal="true" aria-label="Assistant command palette" onMouseDown={() => setCommandOpen(false)}>
                        <div className="assistant-command-palette" onMouseDown={(event) => event.stopPropagation()}>
                            <div className="assistant-command-search"><span>⌘</span><input autoFocus placeholder="Search chats or ask a question" onChange={(event) => setSessionFilter(event.target.value)} /></div>
                            <div className="assistant-command-label">Quick actions</div>
                            <button type="button" onClick={() => { newChat(); setCommandOpen(false); }}>＋ Start a new conversation <kbd>N</kbd></button>
                            {SUGGESTIONS.map((item) => <button key={item} type="button" onClick={() => { ask(item); setCommandOpen(false); }}>{item}<kbd>↵</kbd></button>)}
                            <div className="assistant-command-footer">Esc to close · answers stay on-device</div>
                        </div>
                    </div>
                )}
            </div>
        </ShellWindow>
    );
};

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

type SpotifyTrack = {
    id: string;
    title: string;
    artist: string;
    album: string;
    duration: string;
    url: string;
    art: string;
    image?: string;
};

const SPOTIFY_TRACKS: SpotifyTrack[] = [
    { id: 'mohabbat', title: 'Mujhse Mohabbat Ka Izhaar Karta', artist: 'Satrang Music Official', album: 'Radio rotation · 2025', duration: '4:58', url: '/audio/radio/1.mp3', art: 'linear-gradient(140deg, #a56d4e, #e8c596 45%, #30343d)', image: '/desktop/assets/radio-saloon/cover.jpg' },
    { id: 'night-build', title: 'Night Build', artist: 'Aditya FM', album: 'After hours', duration: '5:42', url: '/audio/radio/2.mp3', art: 'linear-gradient(140deg, #132c4b, #6d9ab5 45%, #e0b16c)' },
    { id: 'deep-work', title: 'Deep Work', artist: 'Aditya FM', album: 'Focus desk', duration: '4:36', url: '/audio/radio/3.mp3', art: 'linear-gradient(140deg, #34221d, #b15b35 48%, #efcf8f)' },
    { id: 'soft-signal', title: 'Soft Signal', artist: 'Open Frequency', album: 'Late Night Code', duration: '3:28', url: '/audio/radio/2.mp3', art: 'linear-gradient(140deg, #22354b, #9a8fc0 52%, #f0b9b2)' },
    { id: 'slow-morning', title: 'Slow Morning', artist: 'Aditya FM', album: 'Daily mix', duration: '4:12', url: '/audio/radio/1.mp3', art: 'linear-gradient(140deg, #42513d, #cfb873 58%, #f5e3b5)' },
];

const SPOTIFY_PLAYLISTS = [
    { id: 'focus', name: 'Deep Focus', detail: 'Instrumental calm for long stretches of work', meta: 'Aditya · 28 tracks', art: 'linear-gradient(135deg, #244c45, #b6d2b1 50%, #e2b16b)', trackIds: ['deep-work', 'soft-signal', 'slow-morning'] },
    { id: 'discover', name: 'Discover Weekly', detail: 'Fresh finds for a curious afternoon', meta: 'Spotify editorial · 30 tracks', art: 'linear-gradient(135deg, #412b63, #d15f92 52%, #f4cb76)', trackIds: ['mohabbat', 'night-build', 'soft-signal'] },
    { id: 'late-night', name: 'Late Night Code', detail: 'Low lights, clean commits, no distractions', meta: 'Aditya · 16 tracks', art: 'linear-gradient(135deg, #0c2238, #34727d 58%, #e69f67)', trackIds: ['night-build', 'deep-work', 'mohabbat'] },
];

const spotifyTime = (seconds: number) => {
    if (!Number.isFinite(seconds) || seconds <= 0) return '0:00';
    return `${Math.floor(seconds / 60)}:${Math.floor(seconds % 60).toString().padStart(2, '0')}`;
};

export const SpotifySpotubeApp: React.FC<Props> = (props) => {
    const audio = useRef<HTMLAudioElement>(null);
    const [view, setView] = useState<'Home' | 'Search' | 'Library'>('Home');
    const [playlist, setPlaylist] = useState('focus');
    const [query, setQuery] = useState('');
    const [currentId, setCurrentId] = useState('deep-work');
    const [playing, setPlaying] = useState(false);
    const [liked, setLiked] = useState<string[]>(['deep-work']);
    const [shuffle, setShuffle] = useState(false);
    const [repeat, setRepeat] = useState(false);
    const [queueOpen, setQueueOpen] = useState(false);
    const [volume, setVolume] = useState(0.72);
    const [elapsed, setElapsed] = useState(0);
    const [duration, setDuration] = useState(0);

    const current = SPOTIFY_TRACKS.find((track) => track.id === currentId) || SPOTIFY_TRACKS[0];
    const selectedPlaylist = SPOTIFY_PLAYLISTS.find((item) => item.id === playlist) || SPOTIFY_PLAYLISTS[0];
    const searchedTracks = SPOTIFY_TRACKS.filter((track) => `${track.title} ${track.artist} ${track.album}`.toLowerCase().includes(query.toLowerCase()));
    const playlistTracks = selectedPlaylist.trackIds.map((id) => SPOTIFY_TRACKS.find((track) => track.id === id)).filter(Boolean) as SpotifyTrack[];

    useEffect(() => {
        if (audio.current) audio.current.volume = volume;
    }, [volume]);

    const playTrack = (id: string) => {
        setCurrentId(id);
        setPlaying(true);
        setElapsed(0);
        window.setTimeout(() => {
            const node = audio.current;
            if (!node) return;
            node.load();
            node.play().catch(() => setPlaying(false));
        }, 50);
    };

    const advance = (direction: 1 | -1) => {
        if (repeat && direction === 1) {
            playTrack(current.id);
            return;
        }
        const pool = playlistTracks.length ? playlistTracks : SPOTIFY_TRACKS;
        const currentIndex = Math.max(0, pool.findIndex((track) => track.id === current.id));
        const nextIndex = shuffle ? Math.floor(Math.random() * pool.length) : (currentIndex + direction + pool.length) % pool.length;
        playTrack(pool[nextIndex].id);
    };

    const togglePlayback = () => {
        const node = audio.current;
        if (!node) return;
        if (playing) {
            node.pause();
            setPlaying(false);
        } else {
            node.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
        }
    };

    const toggleLike = (id: string) => setLiked((items) => items.includes(id) ? items.filter((item) => item !== id) : [...items, id]);
    const showPlaylist = (id: string) => { setPlaylist(id); setView('Home'); };
    const openSearch = () => { setView('Search'); setQuery(''); };
    return (
        <ShellWindow {...props} title="Spotify — Aditya Mix" icon="spotify" className="spotify-app spotify-v2" status="Spotube-style local player · no login required · audio plays in this window" width={980} height={660} top={10} left={34}>
            <aside className="spotify-sidebar">
                <div className="spotify-brand"><Icon icon="spotify" size={28} /><strong>Spotify</strong><span className="spotify-brand-dot">+ local</span></div>
                <nav className="spotify-nav" aria-label="Spotify navigation">
                    <button className={view === 'Home' ? 'active' : ''} onClick={() => setView('Home')}><span>⌂</span> Home</button>
                    <button className={view === 'Search' ? 'active' : ''} onClick={openSearch}><span>⌕</span> Search</button>
                    <button className={view === 'Library' ? 'active' : ''} onClick={() => setView('Library')}><span>▤</span> Your Library</button>
                </nav>
                <div className="spotify-side-heading"><span>YOUR PLAYLISTS</span><button onClick={() => setView('Library')} aria-label="Add playlist">＋</button></div>
                <div className="spotify-playlist-list">
                    {SPOTIFY_PLAYLISTS.map((item) => <button key={item.id} className={playlist === item.id && view === 'Home' ? 'active' : ''} onClick={() => showPlaylist(item.id)}><i style={{ background: item.art }} />{item.name}</button>)}
                    <button className="spotify-liked-link" onClick={() => setView('Library')}><i className="liked-mini">♥</i> Liked Songs <small>{liked.length}</small></button>
                </div>
                <div className="spotify-sidebar-foot"><span className="spotify-local-badge">●</span><div><strong>AdityaOS player</strong><small>Local playback enabled</small></div></div>
            </aside>

            <main className="spotify-content">
                <header className="spotify-topbar">
                    <div className="spotify-history"><button aria-label="Back">‹</button><button aria-label="Forward">›</button></div>
                    <label className="spotify-search"><span>⌕</span><input value={query} onChange={(event) => { setQuery(event.target.value); setView('Search'); }} placeholder="What do you want to play?" aria-label="Search Spotify" /><kbd>⌘ K</kbd></label>
                    <button className="spotify-web-button" onClick={() => open('https://open.spotify.com')}><span>OPEN WEB PLAYER</span> ↗</button>
                </header>

                {view === 'Home' && <div className="spotify-scroll">
                    <section className="spotify-hero-v2" style={{ background: selectedPlaylist.art }}>
                        <div className="spotify-hero-art" style={{ background: selectedPlaylist.art }}><span>{selectedPlaylist.name === 'Deep Focus' ? '◒' : selectedPlaylist.name === 'Discover Weekly' ? '✦' : '◈'}</span></div>
                        <div className="spotify-hero-copy"><p>PLAYLIST · ADITYA'S WORKSTATION</p><h1>{selectedPlaylist.name}</h1><span>{selectedPlaylist.detail}</span><small>{selectedPlaylist.meta} · local player</small><div className="spotify-hero-actions"><button className="spotify-green-button" onClick={() => playTrack(playlistTracks[0]?.id || current.id)}>{playing && playlistTracks.some((track) => track.id === current.id) ? 'Ⅱ' : '▶'} <span>Play</span></button><button className={`spotify-ghost-icon ${liked.includes(current.id) ? 'liked' : ''}`} onClick={() => toggleLike(current.id)} aria-label="Like current track">♥</button><button className="spotify-ghost-icon" onClick={() => setQueueOpen(!queueOpen)} aria-label="Open queue">☷</button><button className="spotify-more" aria-label="More options">•••</button></div></div>
                    </section>
                    <section className="spotify-section"><div className="spotify-section-title"><div><p>CURATED FOR YOU</p><h2>Good evening, Aditya</h2></div><button onClick={() => setView('Library')}>Show all</button></div><div className="spotify-card-row">{SPOTIFY_PLAYLISTS.map((item) => <button key={item.id} className="spotify-playlist-card" onClick={() => showPlaylist(item.id)}><span className="spotify-card-art" style={{ background: item.art }}>{item.name === 'Deep Focus' ? '◒' : item.name === 'Discover Weekly' ? '✦' : '◈'}</span><strong>{item.name}</strong><small>{item.detail}</small></button>)}</div></section>
                    <section className="spotify-section spotify-track-section"><div className="spotify-section-title"><div><p>{selectedPlaylist.name.toUpperCase()}</p><h2>Tracks for your desk</h2></div><button onClick={() => open(`https://open.spotify.com/playlist/${playlist === 'focus' ? '37i9dQZEVXbLZ52XmnySJg' : playlist === 'discover' ? '37i9dQZF1DXcBWIGoYBM5M' : '37i9dQZF1DWZeKCadgRdKQ'}`)}>Open playlist ↗</button></div><div className="spotify-track-list">{playlistTracks.map((track, index) => <button key={track.id} className={`spotify-track-row ${current.id === track.id ? 'current' : ''}`} onDoubleClick={() => playTrack(track.id)} onClick={() => setCurrentId(track.id)}><span className="spotify-track-number">{current.id === track.id && playing ? '♫' : index + 1}</span><span className="spotify-track-art" style={{ background: track.art }}>{track.image ? <img src={track.image} alt="" /> : '♪'}</span><span className="spotify-track-name"><strong>{track.title}</strong><small>{track.artist}</small></span><span className="spotify-track-album">{track.album}</span><span className="spotify-track-like" onClick={(event) => { event.stopPropagation(); toggleLike(track.id); }}>{liked.includes(track.id) ? '♥' : '♡'}</span><span className="spotify-track-duration">{track.duration}</span><span className="spotify-track-more">•••</span></button>)}</div></section>
                </div>}

                {view === 'Search' && <div className="spotify-scroll spotify-search-view"><section className="spotify-search-heading"><p>SEARCH</p><h1>{query ? `Results for “${query}”` : 'Find your next listen'}</h1><span>Search across your local AdityaOS library.</span></section><section className="spotify-section"><div className="spotify-section-title"><div><p>TRACKS</p><h2>{searchedTracks.length} results</h2></div></div><div className="spotify-track-list">{searchedTracks.map((track, index) => <button key={track.id} className={`spotify-track-row ${current.id === track.id ? 'current' : ''}`} onDoubleClick={() => playTrack(track.id)} onClick={() => setCurrentId(track.id)}><span className="spotify-track-number">{index + 1}</span><span className="spotify-track-art" style={{ background: track.art }}>{track.image ? <img src={track.image} alt="" /> : '♪'}</span><span className="spotify-track-name"><strong>{track.title}</strong><small>{track.artist}</small></span><span className="spotify-track-album">{track.album}</span><span className="spotify-track-like" onClick={(event) => { event.stopPropagation(); toggleLike(track.id); }}>{liked.includes(track.id) ? '♥' : '♡'}</span><span className="spotify-track-duration">{track.duration}</span><span className="spotify-track-more">•••</span></button>)}</div></section></div>}

                {view === 'Library' && <div className="spotify-scroll spotify-library-view"><section className="spotify-search-heading"><p>YOUR LIBRARY</p><h1>Saved for later.</h1><span>Playlists and tracks that keep the signal moving.</span></section><div className="spotify-library-grid">{SPOTIFY_PLAYLISTS.map((item) => <button key={item.id} className="spotify-library-card" onClick={() => showPlaylist(item.id)}><span className="spotify-card-art" style={{ background: item.art }}>{item.name === 'Deep Focus' ? '◒' : item.name === 'Discover Weekly' ? '✦' : '◈'}</span><div><strong>{item.name}</strong><small>{item.meta}</small></div><span>›</span></button>)}<button className="spotify-library-card"><span className="spotify-card-art liked-art">♥</span><div><strong>Liked Songs</strong><small>{liked.length} saved tracks</small></div><span>›</span></button></div></div>}

                {queueOpen && <aside className="spotify-queue"><header><strong>Queue</strong><button onClick={() => setQueueOpen(false)}>×</button></header><p>NOW PLAYING</p><div className="spotify-queue-current"><span className="spotify-track-art" style={{ background: current.art }}>{current.image ? <img src={current.image} alt="" /> : '♪'}</span><div><strong>{current.title}</strong><small>{current.artist}</small></div></div><p>NEXT UP</p>{SPOTIFY_TRACKS.filter((track) => track.id !== current.id).slice(0, 3).map((track) => <button className="spotify-queue-row" key={track.id} onClick={() => playTrack(track.id)}><span className="spotify-track-art" style={{ background: track.art }}>♪</span><span><strong>{track.title}</strong><small>{track.artist}</small></span></button>)}</aside>}

                <footer className="spotify-player-v2"><div className="spotify-now-playing"><span className="spotify-player-art" style={{ background: current.art }}>{current.image ? <img src={current.image} alt="" /> : '♪'}</span><div><strong>{current.title}</strong><small>{current.artist}</small></div><button className={liked.includes(current.id) ? 'liked' : ''} onClick={() => toggleLike(current.id)} aria-label="Like track">{liked.includes(current.id) ? '♥' : '♡'}</button></div><div className="spotify-player-controls"><div><button className={shuffle ? 'selected' : ''} onClick={() => setShuffle(!shuffle)} aria-label="Shuffle">⤨</button><button onClick={() => advance(-1)} aria-label="Previous">|◀</button><button className="spotify-player-play" onClick={togglePlayback} aria-label={playing ? 'Pause' : 'Play'}>{playing ? 'Ⅱ' : '▶'}</button><button onClick={() => advance(1)} aria-label="Next">▶|</button><button className={repeat ? 'selected' : ''} onClick={() => setRepeat(!repeat)} aria-label="Repeat">↻</button></div><label className="spotify-player-progress"><span>{spotifyTime(elapsed)}</span><input type="range" min="0" max={duration || 100} value={Math.min(elapsed, duration || 100)} onChange={(event) => { const value = Number(event.target.value); setElapsed(value); if (audio.current) audio.current.currentTime = value; }} aria-label="Track progress" /><span>{duration ? spotifyTime(duration) : current.duration}</span></label></div><div className="spotify-player-tools"><button className={queueOpen ? 'selected' : ''} onClick={() => setQueueOpen(!queueOpen)} aria-label="Queue">☷</button><button aria-label="Lyrics">▤</button><span>🔊</span><input type="range" min="0" max="1" step="0.01" value={volume} onChange={(event) => setVolume(Number(event.target.value))} aria-label="Volume" /></div><audio ref={audio} src={current.url} preload="metadata" onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)} onEnded={() => advance(1)} onTimeUpdate={(event) => setElapsed(event.currentTarget.currentTime)} onLoadedMetadata={(event) => setDuration(event.currentTarget.duration)} /></footer>
            </main>
        </ShellWindow>
    );
};

export const SpotifyApp: React.FC<Props> = (props) => {
    const [theme, setTheme] = useState('Spicetify · Dracula');
    const [playlist, setPlaylist] = useState('37i9dQZEVXbLZ52XmnySJg');
    const themes: Record<string, string> = { 'Spicetify · Dracula': '#bd93f9', 'Spicetify · Nord': '#88c0d0', 'Spicetify · Gruvbox': '#fabd2f', 'Fastpotify · Dark': '#1db954' };
    const accent = themes[theme];
    return (
        <ShellWindow {...props} title="Spotify — Aditya Mix" icon="spotify" className="spotify-app" status={`${theme} · Top 50 India · playback starts on Spotify`}>
            <aside><div className="spotify-logo" style={{ color: accent }}>●))) <b>Spotify</b></div><button>⌂ Home</button><button>⌕ Search</button><button>▤ Your Library</button><p>PLAYLISTS</p><button onClick={() => setPlaylist('37i9dQZEVXbLZ52XmnySJg')}>Top 50 India</button><button onClick={() => setPlaylist('37i9dQZF1DXcBWIGoYBM5M')}>Discover Weekly</button><button onClick={() => setPlaylist('37i9dQZF1DWZeKCadgRdKQ')}>Late Night Code</button><p>THEME (Spicetify)</p>{Object.keys(themes).map((t) => <button key={t} className={theme === t ? 'active' : ''} style={theme === t ? { borderColor: themes[t], color: themes[t] } : {}} onClick={() => setTheme(t)}>{t}</button>)}</aside>
            <main><header><button>‹</button><button>›</button><span style={{ fontSize: 12, opacity: 0.7 }}>{theme}</span><button onClick={() => open('https://open.spotify.com')}>OPEN WEB PLAYER ↗</button></header><section className="spotify-hero"><p>ADITYA'S WORKSTATION</p><h1>Top 50 India</h1><span>Today’s most played tracks in India, ready in the Spotify player below.</span><button style={{ background: accent }} onClick={() => open(`https://open.spotify.com/playlist/${playlist}`)}>▶ PLAY ON SPOTIFY</button></section><iframe title="Spotify Top 50 India player" src={`https://open.spotify.com/embed/playlist/${playlist}?utm_source=generator&theme=0`} width="100%" height="260" frameBorder="0" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy" /><h3>Top 50 India</h3></main>
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
        unlock('shell-user');
        if (/^sudo\b/i.test(raw.trim())) unlock('sudo');
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
            case 'projects': out.push('grade-central  → grade-central.vercel.app', 'phenosync       → github.com/aditya160509/phenosync', 'study-notes     → github.com/aditya160509/study-notes', 'nexus / atlas   → C:\\ADITYA\\Projects (local files)'); break;
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

/**
 * Code Studio — the exact VS Code portfolio application from
 * itsnitinr/vscode-portfolio, exported as a small local page and rendered in
 * this desktop window. Keeping it as its own static app preserves the
 * upstream Explorer, tabs, command palette, themes, terminal, and responsive
 * layout without shipping a browser IDE's language workers.
 */
export const DeveloperApp: React.FC<Props> = (props) => (
    <ShellWindow
        {...props}
        title="Visual Studio Code — aditya-lab"
        icon="vscode"
        className="vscode-host"
        status="VS Code portfolio · local project data · touch ready"
        width={1180}
        height={760}
        top={8}
        left={18}
    >
        <iframe
            className="vscode-frame"
            title="Aditya Balaji Code Studio"
            src="/vscode/"
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-downloads"
        />
    </ShellWindow>
);



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
    pet: string;
    petSize: number;
    petSprite: string;
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
    pet: localStorage.getItem('aditya-pet') || 'hermes',
    petSize: clampPetSize(Number(localStorage.getItem('aditya-pet-size') || DEFAULT_PET_SIZE)),
    petSprite: clampPetSprite(localStorage.getItem('aditya-pet-sprite') || DEFAULT_PET_SPRITE),
});

/**
 * Settings — laid out the way a real system settings app is: a left rail of
 * sections, a searchable index that jumps straight to a control, and grouped
 * cards rather than a wall of rows. The chrome stays period-correct (raised
 * bevels, system greys, no rounded corners) but the structure and the hit
 * targets are modern.
 */
type Tab = 'Appearance' | 'Personalisation' | 'Desktop' | 'Sound' | 'System' | 'About';

const TABS: { id: Tab; glyph: string; blurb: string }[] = [
    { id: 'Appearance', glyph: '▤', blurb: 'Wallpaper, colours, motion' },
    { id: 'Personalisation', glyph: '◧', blurb: 'Start-up, language, defaults' },
    { id: 'Desktop', glyph: '▥', blurb: 'Icons, clock, shortcuts' },
    { id: 'Sound', glyph: '◈', blurb: 'Output and volume' },
    { id: 'System', glyph: '⌘', blurb: 'Shell, storage, performance' },
    { id: 'About', glyph: '☗', blurb: 'Version and credits' },
];

/** Everything the search box can find, so a control is one query away. */
const INDEX: { label: string; tab: Tab; keywords: string }[] = [
    { label: 'Wallpaper', tab: 'Appearance', keywords: 'background picture video loop wallspace image' },
    { label: 'Desktop shading', tab: 'Appearance', keywords: 'dim darken overlay contrast' },
    { label: 'Playback speed', tab: 'Appearance', keywords: 'wallpaper video speed rate' },
    { label: 'Reduce motion', tab: 'Appearance', keywords: 'animation accessibility still' },
    { label: 'Auto-open Portfolio', tab: 'Personalisation', keywords: 'startup boot first window autostart' },
    { label: 'Skip boot animation', tab: 'Personalisation', keywords: 'startup fast boot 3d' },
    { label: 'Language', tab: 'Personalisation', keywords: 'locale region translation' },
    { label: 'Icon size', tab: 'Desktop', keywords: 'shortcut large small scale' },
    { label: 'Desktop pet size', tab: 'Desktop', keywords: 'pet sprite companion tiny small large huge scale' },
    { label: 'Desktop pet sprite', tab: 'Desktop', keywords: 'pet sprite style palette amber mono pixel hermes companion' },
    { label: '24-hour clock', tab: 'Desktop', keywords: 'time format taskbar toolbar' },
    { label: 'Master sound', tab: 'Sound', keywords: 'audio mute ui clicks' },
    { label: 'Volume', tab: 'Sound', keywords: 'audio loudness level' },
    { label: 'Storage', tab: 'System', keywords: 'indexeddb wallpaper cache space clear' },
    { label: 'Reset everything', tab: 'System', keywords: 'clear wipe defaults factory' },
    { label: 'Version', tab: 'About', keywords: 'adityaos build credits github' },
];

/** Raised-bevel switch — the retro equivalent of a modern toggle. */
const Switch = ({ on, onChange, label }: { on: boolean; onChange: () => void; label: string }) => (
    <button
        type="button"
        role="switch"
        aria-checked={on}
        aria-label={label}
        className={`w95-switch${on ? ' on' : ''}`}
        onClick={onChange}
    >
        <span className="w95-switch-track"><span className="w95-switch-knob" /></span>
        <span className="w95-switch-text">{on ? 'On' : 'Off'}</span>
    </button>
);

const Row = ({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) => (
    <div className="w95-row">
        <div className="w95-row-label">
            <span>{title}</span>
            {hint && <small>{hint}</small>}
        </div>
        <div className="w95-row-control">{children}</div>
    </div>
);

const Slider = ({ value, min, max, step, onChange, format }: {
    value: number; min: number; max: number; step: number;
    onChange: (n: number) => void; format: (n: number) => string;
}) => (
    <label className="w95-slider">
        <input
            type="range"
            min={min}
            max={max}
            step={step}
            value={value}
            onChange={(e) => onChange(Number(e.target.value))}
            style={{ ['--fill' as any]: `${((value - min) / (max - min)) * 100}%` }}
        />
        <b>{format(value)}</b>
    </label>
);

export const SettingsApp: React.FC<Props> = (props) => {
    const [tab, setTab] = useState<Tab>('Appearance');
    const [query, setQuery] = useState('');
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
        localStorage.setItem('aditya-pet', next.pet);
        localStorage.setItem('aditya-pet-size', String(clampPetSize(next.petSize)));
        localStorage.setItem('aditya-pet-sprite', clampPetSprite(next.petSprite));
        window.dispatchEvent(new CustomEvent('aditya-wallpaper', { detail: { speed: next.speed, dim: next.dim } }));
        window.dispatchEvent(new CustomEvent('aditya-prefs', { detail: next }));
    };
    const set = <K extends keyof Prefs>(key: K, value: Prefs[K]) => save({ ...p, [key]: value });

    // Wallpaper chooser — the visitor's own image or video, downscaled on the
    // way in and stored in IndexedDB on their machine.
    const [wall, setWall] = useState<Wallpaper | null>(null);
    const [wallErr, setWallErr] = useState('');
    const [busyWall, setBusyWall] = useState(false);
    const previewVideoRef = useRef<HTMLVideoElement>(null);
    const [wallPreviewUrl, setWallPreviewUrl] = useState<string | null>(null);
    const fileRef = useRef<HTMLInputElement>(null);
    useEffect(() => { loadWallpaper().then(setWall); }, []);
    useEffect(() => {
        if (!wall?.blob) {
            setWallPreviewUrl(null);
            return;
        }
        const url = URL.createObjectURL(wall.blob);
        setWallPreviewUrl(url);
        return () => URL.revokeObjectURL(url);
    }, [wall]);
    const applyFile = async (file?: File | null) => {
        if (!file) return;
        setWallErr('');
        setBusyWall(true);
        try {
            setWall(await saveWallpaper(file));
            unlock('decorator');
            announceWallpaper();
        } catch (err: any) {
            setWallErr(err?.message || 'Could not use that file.');
        } finally {
            setBusyWall(false);
        }
    };
    const applyColor = async (color: string) => {
        setWall(await saveColor(color));
        unlock('decorator');
        announceWallpaper();
    };
    const resetWall = async () => {
        await clearWallpaper();
        setWall(null);
        announceWallpaper();
    };
    const pickBuiltin = async (id: string) => {
        setWall(await saveBuiltin(id));
        unlock('decorator');
        announceWallpaper();
    };
    const fullscreenPreview = async () => {
        const video = previewVideoRef.current as (HTMLVideoElement & {
            webkitEnterFullscreen?: () => void;
        }) | null;
        if (!video) return;
        try {
            if (document.fullscreenElement) {
                await document.exitFullscreen();
            } else if (video.requestFullscreen) {
                await video.requestFullscreen();
            } else {
                video.webkitEnterFullscreen?.();
            }
        } catch {
            // Fullscreen can be denied by an embedded browser or an OS gesture
            // policy; the inline controls remain fully usable in that case.
        }
    };
    const WALL_COLORS: [string, string][] = [
        ['Ink', '#0e1116'],
        ['Slate', 'linear-gradient(160deg,#1f2733,#0d1117)'],
        ['Teal', 'linear-gradient(160deg,#06343a,#04161c)'],
        ['Plum', 'linear-gradient(160deg,#2b1533,#120a18)'],
        ['Sand', 'linear-gradient(160deg,#d9cbb3,#8d7f68)'],
    ];

    const hits = query.trim()
        ? INDEX.filter((i) => `${i.label} ${i.keywords}`.toLowerCase().includes(query.trim().toLowerCase()))
        : [];

    const wallSummary = wallErr
        ? wallErr
        : wall
            ? `Your ${wall.kind === 'color' ? 'colour' : wall.kind}${wall.blob ? ` · ${(wall.blob.size / 1024 / 1024).toFixed(1)} MB on this device` : ''}`
            : 'Bundled One Piece loop';

    const previewKind = wall?.kind || 'builtin';
    const previewVideoSrc = wall?.kind === 'builtin'
        ? wall.src
        : wall?.kind === 'video'
            ? wallPreviewUrl
            : 'assets/wallspace-one-piece.mp4';
    const previewLabel = wall
        ? wall.kind === 'builtin'
            ? wall.src?.split('/').pop()?.replace('.mp4', '') || 'selected loop'
            : wall.kind === 'video'
                ? 'your video'
                : wall.kind === 'image'
                    ? 'your image'
                    : 'colour'
        : 'default loop';

    return (
        <ShellWindow
            {...props}
            title="Settings"
            icon="settings"
            className="settings-app w95-settings"
            status="Saved in this browser · nothing leaves your device"
            width={960}
            height={640}
            top={40}
            left={90}
        >
            <aside>
                <div className="w95-user">
                    <span className="w95-avatar">A</span>
                    <div>
                        <b>Aditya Balaji</b>
                        <small>Local account</small>
                    </div>
                </div>

                <div className="w95-search">
                    <span aria-hidden>⌕</span>
                    <input
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Find a setting"
                        aria-label="Find a setting"
                    />
                    {query && <button className="w95-clear" onClick={() => setQuery('')} aria-label="Clear search">×</button>}
                </div>

                {query ? (
                    <div className="w95-hits">
                        {hits.length === 0 && <p className="w95-nohits">No matches.</p>}
                        {hits.map((h) => (
                            <button key={h.label} onClick={() => { setTab(h.tab); setQuery(''); }}>
                                <b>{h.label}</b>
                                <small>{h.tab}</small>
                            </button>
                        ))}
                    </div>
                ) : (
                    <nav>
                        {TABS.map((t) => (
                            <button
                                key={t.id}
                                className={tab === t.id ? 'active' : ''}
                                onClick={() => setTab(t.id)}
                                aria-current={tab === t.id ? 'page' : undefined}
                            >
                                <span className="w95-glyph" aria-hidden>{t.glyph}</span>
                                <span className="w95-navtext">
                                    <b>{t.id}</b>
                                    <small>{t.blurb}</small>
                                </span>
                            </button>
                        ))}
                    </nav>
                )}
            </aside>

            <main>
                <header className="w95-head">
                    <h2>{tab}</h2>
                    <p>{TABS.find((t) => t.id === tab)?.blurb}</p>
                </header>

                <div className="w95-scroll">
                    {tab === 'Appearance' && (
                        <>
                            <section>
                                <div className="wall-preview-heading">
                                    <div>
                                        <h3>Preview</h3>
                                        <p className="w95-note">See the exact wallpaper before applying it. Use the native controls or fullscreen for a closer look.</p>
                                    </div>
                                    <span className="wall-preview-status">{previewLabel}</span>
                                </div>
                                <div className="wall-preview-media">
                                    {previewKind === 'image' && wallPreviewUrl ? (
                                        <img src={wallPreviewUrl} alt="Preview of your wallpaper" />
                                    ) : previewKind === 'color' ? (
                                        <div className="wall-preview-color" style={{ background: wall?.color }} aria-label="Colour wallpaper preview" />
                                    ) : previewVideoSrc ? (
                                        <video
                                            ref={previewVideoRef}
                                            key={previewVideoSrc}
                                            src={previewVideoSrc}
                                            autoPlay
                                            muted
                                            loop
                                            playsInline
                                            controls
                                            preload="metadata"
                                            aria-label={`Preview of ${previewLabel}`}
                                        />
                                    ) : (
                                        <div className="wall-preview-empty">Choose a wallpaper to preview it.</div>
                                    )}
                                </div>
                                <div className="wall-preview-actions">
                                    <span>Selected wallpapers play on the desktop immediately.</span>
                                    <button type="button" onClick={fullscreenPreview} disabled={previewKind !== 'video' && previewKind !== 'builtin'}>
                                        ⛶ Fullscreen video
                                    </button>
                                </div>
                            </section>

                            <section>
                                <h3>Your own background</h3>
                                <p className="w95-note">
                                    Pick a picture or a clip. It is resized in the browser and stored on
                                    this device only — nothing is uploaded.
                                </p>
                                <div className="wall-actions">
                                    <button className="wall-primary" disabled={busyWall} onClick={() => fileRef.current?.click()}>
                                        {busyWall ? 'Optimizing…' : '⬆ Choose image or video…'}
                                    </button>
                                    <button onClick={resetWall} disabled={!wall}>↺ Default</button>
                                    <input
                                        ref={fileRef}
                                        type="file"
                                        accept="image/*,video/mp4,video/webm"
                                        style={{ display: 'none' }}
                                        onChange={(e) => applyFile(e.target.files?.[0])}
                                    />
                                </div>
                                <div className="wall-swatches">
                                    {WALL_COLORS.map(([name, css]) => (
                                        <button key={name} title={name} style={{ background: css }} onClick={() => applyColor(css)} />
                                    ))}
                                </div>
                                <p className={`wall-state${wallErr ? ' is-error' : ''}`}>{wallSummary}</p>
                            </section>

                            <section>
                                <h3>Wallspace library</h3>
                                <p className="w95-note">
                                    {BUILTIN_COUNT} loops. Click one to apply it, or hit ⤓ on the
                                    corner to download the MP4 and keep it.
                                </p>
                                <div className="wall-grid" tabIndex={0} aria-label="Scrollable Wallspace wallpaper gallery">
                                    {Array.from({ length: BUILTIN_COUNT }, (_, i) => builtinId(i + 1)).map((id) => (
                                        <div key={id} className={`wall-cell${wall?.src?.includes(id) ? ' on' : ''}`}>
                                            <button title={`Use ${id}`} aria-label={`Use ${id}`} onClick={() => pickBuiltin(id)}>
                                                <img src={builtinThumb(id)} alt="" decoding="async" />
                                                <span className="wall-number">{id.replace('wall-', '')}</span>
                                            </button>
                                            <a
                                                className="wall-get"
                                                href={builtinSrc(id)}
                                                download={`${id}.mp4`}
                                                title={`Download ${id}.mp4`}
                                                onClick={() => unlock('wallpaper-thief')}
                                            >⤓</a>
                                        </div>
                                    ))}
                                </div>
                            </section>

                            <section>
                                <h3>Rendering</h3>
                                <Row title="Playback speed" hint="How fast a video wallpaper loops">
                                    <Slider value={p.speed} min={0.5} max={2.5} step={0.05}
                                        onChange={(n) => set('speed', n)} format={(n) => `${n.toFixed(2)}×`} />
                                </Row>
                                <Row title="Desktop shading" hint="Darkens the wallpaper so icons stay legible">
                                    <Slider value={p.dim} min={0} max={0.6} step={0.01}
                                        onChange={(n) => set('dim', n)} format={(n) => `${Math.round(n * 100)}%`} />
                                </Row>
                                <Row title="Reduce motion" hint="Pauses ambient animation across the desktop">
                                    <Switch on={p.reduceMotion} label="Reduce motion" onChange={() => set('reduceMotion', !p.reduceMotion)} />
                                </Row>
                            </section>
                        </>
                    )}

                    {tab === 'Personalisation' && (
                        <>
                            <section>
                                <h3>Start-up</h3>
                                <Row title="Auto-open Portfolio" hint="Opens the portfolio window on boot">
                                    <Switch on={p.autostart} label="Auto-open Portfolio" onChange={() => set('autostart', !p.autostart)} />
                                </Row>
                                <Row title="Skip boot animation" hint="Go straight to the desktop on slower machines">
                                    <Switch on={p.skipBoot} label="Skip boot animation" onChange={() => set('skipBoot', !p.skipBoot)} />
                                </Row>
                            </section>
                            <section>
                                <h3>Defaults</h3>
                                <Row title="Open files with" hint="Where a double-clicked file lands">
                                    <span className="w95-static">VS Code</span>
                                </Row>
                                <Row title="Language" hint="Follows your browser">
                                    <span className="w95-static">Auto-detect</span>
                                </Row>
                            </section>
                        </>
                    )}

                    {tab === 'Desktop' && (
                        <>
                            <section>
                                <h3>Icons</h3>
                                <Row title="Icon size" hint="Applies to every desktop shortcut">
                                    <Slider value={p.iconSize} min={64} max={112} step={2}
                                        onChange={(n) => set('iconSize', n)} format={(n) => `${n}px`} />
                                </Row>
                            </section>
                            <section>
                                <h3>Desktop pet</h3>
                                <p className="w95-note">Choose a Hermes/Petdex companion and its footprint. Your choice is saved in this browser.</p>
                                <div className="wall-actions">
                                    <button className={p.pet === 'hermes' ? 'wall-primary' : ''} onClick={() => set('pet', 'hermes')}>Hermes</button>
                                    <button className={p.pet === 'none' ? 'wall-primary' : ''} onClick={() => set('pet', 'none')}>None</button>
                                </div>
                                <Row title="Sprite size" hint="The same crisp sprite, rendered from tiny to showcase scale">
                                    <div className="wall-actions pet-size-actions">
                                        {PET_SIZE_OPTIONS.map((option) => (
                                            <button
                                                key={option.value}
                                                className={p.petSize === option.value ? 'wall-primary' : ''}
                                                onClick={() => set('petSize', option.value)}
                                                aria-pressed={p.petSize === option.value}
                                            >
                                                {option.label} · {option.value}px
                                            </button>
                                        ))}
                                    </div>
                                </Row>
                                <Row title="Sprite style" hint="Hermes artwork with lightweight palette variants">
                                    <div className="wall-actions pet-size-actions pet-sprite-actions">
                                        {PET_SPRITE_OPTIONS.map((option) => (
                                            <button
                                                key={option.value}
                                                className={p.petSprite === option.value ? 'wall-primary' : ''}
                                                onClick={() => set('petSprite', option.value)}
                                                aria-pressed={p.petSprite === option.value}
                                                title={option.note}
                                            >
                                                {option.label}
                                            </button>
                                        ))}
                                    </div>
                                </Row>
                            </section>
                            <section>
                                <h3>Taskbar</h3>
                                <Row title="24-hour clock" hint="Time format in the toolbar">
                                    <Switch on={p.clock24} label="24-hour clock" onChange={() => set('clock24', !p.clock24)} />
                                </Row>
                            </section>
                            <section>
                                <h3>Pinned</h3>
                                <p className="w95-note">
                                    Games (Doom · Oregon Trail · Scrabble · Digger · Wordle · Minesweeper ·
                                    Solitaire · Chess · Tetris · Pong), developer apps (Terminal · Editor ·
                                    Browser) and the portfolio shortcuts stay pinned.
                                </p>
                            </section>
                        </>
                    )}

                    {tab === 'Sound' && (
                        <section>
                            <h3>Audio</h3>
                            <Row title="Master sound" hint="Interface clicks and ambience">
                                <Switch on={p.sound} label="Master sound" onChange={() => set('sound', !p.sound)} />
                            </Row>
                            <Row title="Volume" hint="Applies to every app in the desktop">
                                <Slider value={p.volume} min={0} max={1} step={0.05}
                                    onChange={(n) => set('volume', n)} format={(n) => `${Math.round(n * 100)}%`} />
                            </Row>
                        </section>
                    )}

                    {tab === 'System' && (
                        <>
                            <section>
                                <h3>Shell</h3>
                                <Row title="3D workstation"><span className="w95-static">Enabled</span></Row>
                                <Row title="Motion-optimised MP4"><span className="w95-static">Enabled</span></Row>
                                <Row title="Service worker" hint="Caches the shell for offline use">
                                    <span className="w95-static">
                                        {typeof navigator !== 'undefined' && 'serviceWorker' in navigator ? 'Registered' : 'Unsupported'}
                                    </span>
                                </Row>
                            </section>
                            <section>
                                <h3>Storage</h3>
                                <p className="w95-note">
                                    Your wallpaper, achievements and app state live in this browser. Video
                                    wallpapers and 3D models are streamed, never cached.
                                </p>
                                <Row title="Wallpaper store">
                                    <span className="w95-static">
                                        {wall?.blob ? `${(wall.blob.size / 1024 / 1024).toFixed(1)} MB` : 'Empty'}
                                    </span>
                                </Row>
                            </section>
                            <section className="w95-danger">
                                <h3>Reset</h3>
                                <Row title="Reset everything" hint="Clears preferences, wallpaper and achievements">
                                    <button
                                        className="w95-danger-btn"
                                        onClick={() => { localStorage.clear(); clearWallpaper(); save(loadPrefs()); announceWallpaper(); }}
                                    >↺ Reset</button>
                                </Row>
                            </section>
                        </>
                    )}

                    {tab === 'About' && (
                        <>
                            <section className="w95-about">
                                <div className="w95-badge">A</div>
                                <div>
                                    <h3>AdityaOS 1.0</h3>
                                    <p className="w95-note">
                                        A 3D desk shell running a desktop of working applications — markets,
                                        editor, browser, file system, research and games. Built by Aditya
                                        Balaji: quantitative researcher and engineer, Mumbai.
                                    </p>
                                </div>
                            </section>
                            <section>
                                <h3>Links</h3>
                                <Row title="Portfolio"><button onClick={() => open(`${window.location.origin}/portfolio/`)}>Open ↗</button></Row>
                                <Row title="GitHub"><button onClick={() => open(links.github)}>Open ↗</button></Row>
                                <Row title="LinkedIn"><button onClick={() => open(links.linkedin)}>Open ↗</button></Row>
                            </section>
                            <section>
                                <h3>Built on</h3>
                                <p className="w95-note">
                                    Three.js · React · VS Code portfolio · lichess chessground · js-dos · OpenCharts ·
                                    socket.io. Full credits in CREDITS.md.
                                </p>
                            </section>
                        </>
                    )}
                </div>
            </main>
        </ShellWindow>
    );
};
