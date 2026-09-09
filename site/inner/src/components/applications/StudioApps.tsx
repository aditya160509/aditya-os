import React, { FormEvent, useEffect, useRef, useState } from 'react';
import Editor, { loader } from '@monaco-editor/react';
import Window from '../os/Window';
import Icon from '../general/Icon';
import { playUiSound } from '../../utils/sound';
import { FS_ROOT, FSNode, fsJoin, fsResolve, openApp } from '../../utils/filesystem';
import { unlock } from '../../utils/achievements';
import { announceWallpaper, BUILTIN_COUNT, builtinId, builtinSrc, builtinThumb, clearWallpaper, loadWallpaper, saveBuiltin, saveColor, saveWallpaper, Wallpaper } from '../../utils/wallpaper';

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
type Turn = { role: 'user' | 'assistant'; text: string };

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
        reply: "Two apps stacked. The outer shell is Three.js + webpack — the CRT, the room, the monitor you're looking through. The inner desktop is a React app rendered to the screen's texture, so every window, the file system and the games are real DOM, not baked geometry.\n\nThe apps inside are genuine upstream builds rather than lookalikes: lichess chessground for the board, js-dos + DOSBox for Doom, OpenCharts for the terminal, Monaco for the editor.",
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

export const ClaudeApp: React.FC<Props> = (props) => {
    const [turns, setTurns] = useState<Turn[]>([]);
    const [draft, setDraft] = useState('');
    const [streaming, setStreaming] = useState(false);
    const scroller = useRef<HTMLDivElement>(null);
    const timers = useRef<number[]>([]);

    // Drop any in-flight stream when the window closes, so a half-typed reply
    // cannot land on an unmounted component.
    useEffect(() => () => { timers.current.forEach(clearTimeout); }, []);

    useEffect(() => {
        const el = scroller.current;
        if (el) el.scrollTop = el.scrollHeight;
    }, [turns, streaming]);

    const ask = (question: string) => {
        const q = question.trim();
        if (!q || streaming) return;
        setDraft('');
        setTurns((t) => [...t, { role: 'user', text: q }, { role: 'assistant', text: '' }]);
        setStreaming(true);
        playUiSound('key');
        unlock('curious');

        const full = replyFor(q);
        // Stream in word chunks with a short lead-in, which reads closer to a
        // real completion than revealing the whole block at once.
        const words = full.split(' ');
        let shown = 0;
        const step = () => {
            shown += 1 + Math.floor(Math.random() * 2);
            const text = words.slice(0, shown).join(' ');
            setTurns((t) => [...t.slice(0, -1), { role: 'assistant', text }]);
            if (shown < words.length) {
                timers.current.push(window.setTimeout(step, 18 + Math.random() * 34));
            } else {
                setStreaming(false);
            }
        };
        timers.current.push(window.setTimeout(step, 320));
    };

    return (
        <ShellWindow
            {...props}
            title="Assistant — Aditya"
            icon="claude"
            className="assistant-app"
            status="runs entirely in your browser · no model, no network"
            width={860}
            height={640}
            top={10}
            left={24}
        >
            <div className="assistant">
                <div className="assistant-log" ref={scroller}>
                    {turns.length === 0 && (
                        <div className="assistant-intro">
                            <h2>Ask about the work</h2>
                            <p>
                                No model sits behind this — replies come from a local corpus and
                                nothing you type leaves the page.
                            </p>
                            <div className="assistant-chips">
                                {SUGGESTIONS.map((s) => (
                                    <button key={s} type="button" onClick={() => ask(s)}>{s}</button>
                                ))}
                            </div>
                        </div>
                    )}
                    {turns.map((t, i) => (
                        <div key={i} className={`assistant-turn is-${t.role}`}>
                            <div className="assistant-who">{t.role === 'user' ? 'You' : 'Assistant'}</div>
                            <div className="assistant-text">
                                {t.text.split('\n').map((line, j) => (
                                    <p key={j} dangerouslySetInnerHTML={{
                                        __html: line.replace(
                                            /\*\*(.+?)\*\*/g, '<strong>$1</strong>',
                                        ).replace(/`(.+?)`/g, '<code>$1</code>'),
                                    }} />
                                ))}
                                {streaming && i === turns.length - 1 && <span className="assistant-caret" />}
                            </div>
                        </div>
                    ))}
                </div>
                <form
                    className="assistant-composer"
                    onSubmit={(e: FormEvent) => { e.preventDefault(); ask(draft); }}
                >
                    <input
                        value={draft}
                        onChange={(e) => setDraft(e.target.value)}
                        placeholder="Ask about the research, the projects, or this desktop…"
                        aria-label="Message the assistant"
                    />
                    <button type="submit" disabled={!draft.trim() || streaming}>Send</button>
                </form>
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
    { id: 'mohabbat', title: 'Mujhse Mohabbat Ka Izhaar Karta', artist: 'Satrang Music Official', album: 'Radio rotation · 2025', duration: '4:58', url: 'audio/radio/1.mp3', art: 'linear-gradient(140deg, #a56d4e, #e8c596 45%, #30343d)', image: '/desktop/assets/radio-saloon/cover.jpg' },
    { id: 'night-build', title: 'Night Build', artist: 'Aditya FM', album: 'After hours', duration: '5:42', url: 'audio/radio/2.mp3', art: 'linear-gradient(140deg, #132c4b, #6d9ab5 45%, #e0b16c)' },
    { id: 'deep-work', title: 'Deep Work', artist: 'Aditya FM', album: 'Focus desk', duration: '4:36', url: 'audio/radio/3.mp3', art: 'linear-gradient(140deg, #34221d, #b15b35 48%, #efcf8f)' },
    { id: 'soft-signal', title: 'Soft Signal', artist: 'Open Frequency', album: 'Late Night Code', duration: '3:28', url: 'audio/radio/2.mp3', art: 'linear-gradient(140deg, #22354b, #9a8fc0 52%, #f0b9b2)' },
    { id: 'slow-morning', title: 'Slow Morning', artist: 'Aditya FM', album: 'Daily mix', duration: '4:12', url: 'audio/radio/1.mp3', art: 'linear-gradient(140deg, #42513d, #cfb873 58%, #f5e3b5)' },
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
        window.dispatchEvent(new CustomEvent('aditya-wallpaper', { detail: { speed: next.speed, dim: next.dim } }));
        window.dispatchEvent(new CustomEvent('aditya-prefs', { detail: next }));
    };
    const set = <K extends keyof Prefs>(key: K, value: Prefs[K]) => save({ ...p, [key]: value });

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
                                <div className="wall-grid">
                                    {Array.from({ length: BUILTIN_COUNT }, (_, i) => builtinId(i + 1)).map((id) => (
                                        <div key={id} className={`wall-cell${wall?.src?.includes(id) ? ' on' : ''}`}>
                                            <button title={`Use ${id}`} onClick={() => pickBuiltin(id)}>
                                                <img src={builtinThumb(id)} alt="" loading="lazy" decoding="async" />
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
                                    Three.js · React · Monaco · lichess chessground · js-dos · OpenCharts ·
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
