import React, { useCallback, useEffect, useRef, useState } from 'react';
import Colors from '../../constants/colors';
import Doom from '../applications/Doom';
import OregonTrail from '../applications/OregonTrail';
import ShutdownSequence from './ShutdownSequence';
// import ThisComputer from '../applications/ThisComputer';
import Henordle from '../applications/Henordle';
import Toolbar from './Toolbar';
import DesktopShortcut, { DesktopShortcutProps } from './DesktopShortcut';
import { Game2048App, MinesweeperApp, PongApp, SolitaireApp, TetrisApp } from '../applications/VendorGame';
import Notepad from '../applications/Notepad';
import Paint from '../applications/Paint';
import Radio from '../applications/Radio';
import Calculator from '../applications/Calculator';
import TaskLog from '../applications/TaskLog';
import Explorer from '../applications/Explorer';
import Snake from '../applications/Snake';
import ChessGame from '../applications/ChessGame';
import ThisComputer from '../applications/ThisComputer';
import Scrabble from '../applications/Scrabble';
import { IconName } from '../../assets/icons';
import { playUiSound } from '../../utils/sound';
import { loadWallpaper, Wallpaper } from '../../utils/wallpaper';
import Credits from '../applications/Credits';
import Digger from '../applications/Digger';
import {
    ChromeApp, ClaudeApp, DeveloperApp, PortfolioApp,
    SafariApp, SettingsApp, SpotifyApp, TerminalApp, TradingApp,
} from '../applications/StudioApps';

export interface DesktopProps {}

type ExtendedWindowAppProps<T> = T & WindowAppProps;

const APPLICATIONS: {
    [key in string]: {
        key: string;
        name: string;
        shortcutIcon: IconName;
        component: React.FC<ExtendedWindowAppProps<any>>;
    };
} = {
    // computer: {
    //     key: 'computer',
    //     name: 'This Computer',
    //     shortcutIcon: 'computerBig',
    //     component: ThisComputer,
    // },
    portfolio: {
        key: 'portfolio',
        name: 'Aditya Portfolio',
        shortcutIcon: 'portfolio',
        component: PortfolioApp,
    },
    claude: {
        key: 'claude', name: 'Claude', shortcutIcon: 'claude', component: ClaudeApp,
    },
    trading: {
        key: 'trading', name: 'Markets', shortcutIcon: 'trading', component: TradingApp,
    },
    spotify: {
        key: 'spotify', name: 'Spotify', shortcutIcon: 'spotify', component: SpotifyApp,
    },
    chrome: {
        key: 'chrome', name: 'Chrome', shortcutIcon: 'chrome', component: ChromeApp,
    },
    terminal: {
        key: 'terminal', name: 'Terminal', shortcutIcon: 'terminal', component: TerminalApp,
    },
    developer: {
        key: 'developer', name: 'VS Code', shortcutIcon: 'vscode', component: DeveloperApp,
    },
    settings: {
        key: 'settings', name: 'Settings', shortcutIcon: 'settings', component: SettingsApp,
    },
    trail: {
        key: 'trail',
        name: 'The Oregon Trail',
        shortcutIcon: 'trailIcon',
        component: OregonTrail,
    },
    doom: {
        key: 'doom',
        name: 'Doom',
        shortcutIcon: 'doomIcon',
        component: Doom,
    },
    scrabble: {
        key: 'scrabble',
        name: 'Scrabble',
        shortcutIcon: 'scrabbleIcon',
        component: Scrabble,
    },
    henordle: {
        key: 'henordle',
        name: 'Aditya Wordle',
        shortcutIcon: 'henordleIcon',
        component: Henordle,
    },
    digger: {
        key: 'digger',
        name: 'Digger',
        shortcutIcon: 'windowGameIcon',
        component: Digger,
    },
    radio: {
        key: 'radio',
        name: 'Radio',
        shortcutIcon: 'volumeOn',
        component: Radio,
    },
    paint: {
        key: 'paint',
        name: 'Paint',
        shortcutIcon: 'showcaseIcon',
        component: Paint,
    },
    notepad: {
        key: 'notepad',
        name: 'Notepad',
        shortcutIcon: 'windowExplorerIcon',
        component: Notepad,
    },
    minesweeper: {
        key: 'minesweeper',
        name: 'Minesweeper',
        shortcutIcon: 'windowGameIcon',
        component: MinesweeperApp,
    },
    calculator: {
        key: 'calculator',
        name: 'Calculator',
        shortcutIcon: 'computerSmall',
        component: Calculator,
    },
    computer: {
        key: 'computer',
        name: 'Time Machine',
        shortcutIcon: 'computerBig',
        component: ThisComputer,
    },
    tasklog: {
        key: 'tasklog',
        name: 'Task Log',
        shortcutIcon: 'credits',
        component: TaskLog,
    },
    explorer: {
        key: 'explorer',
        name: 'Explorer',
        shortcutIcon: 'myComputer',
        component: Explorer,
    },
    snake: { key: 'snake', name: 'Snake', shortcutIcon: 'snake', component: Snake },
    game2048: { key: 'game2048', name: '2048', shortcutIcon: 'game2048', component: Game2048App },
    pong: { key: 'pong', name: 'Pong', shortcutIcon: 'pong', component: PongApp },
    tetris: { key: 'tetris', name: 'Tetris', shortcutIcon: 'tetris', component: TetrisApp },
    chess: { key: 'chess', name: 'Chess', shortcutIcon: 'chess', component: ChessGame },
    solitaire: { key: 'solitaire', name: 'Solitaire', shortcutIcon: 'solitaire', component: SolitaireApp },
    credits: {
        key: 'credits',
        name: 'Credits',
        shortcutIcon: 'credits',
        component: Credits,
    },
};

const Desktop: React.FC<DesktopProps> = (props) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [wallpaperDim, setWallpaperDim] = useState(Number(localStorage.getItem('wallpaperDim') || '0.16'));
    const [windows, setWindows] = useState<DesktopWindows>({});

    const [shortcuts, setShortcuts] = useState<DesktopShortcutProps[]>([]);

    const [shutdown, setShutdown] = useState(false);
    const [wallpaper, setWallpaper] = useState<Wallpaper | null>(null);
    const [wallpaperUrl, setWallpaperUrl] = useState<string | null>(null);
    const [numShutdowns, setNumShutdowns] = useState(1);

    useEffect(() => {
        const updateWallpaper = (event: Event) => {
            const detail = (event as CustomEvent).detail;
            if (videoRef.current) videoRef.current.playbackRate = detail.speed;
            setWallpaperDim(detail.dim);
        };
        if (videoRef.current) videoRef.current.playbackRate = Number(localStorage.getItem('wallpaperSpeed') || '1.35');
        window.addEventListener('aditya-wallpaper', updateWallpaper);
        return () => window.removeEventListener('aditya-wallpaper', updateWallpaper);
    }, []);

    // Visitor-chosen background (IndexedDB). The object URL is revoked on every
    // swap so a replaced wallpaper is not kept in memory.
    useEffect(() => {
        let url: string | null = null;
        const refresh = async () => {
            const w = await loadWallpaper();
            setWallpaper(w);
            if (url) URL.revokeObjectURL(url);
            url = w?.blob ? URL.createObjectURL(w.blob) : null;
            setWallpaperUrl(url);
        };
        refresh();
        window.addEventListener('aditya-wallpaper-source', refresh);
        return () => {
            window.removeEventListener('aditya-wallpaper-source', refresh);
            if (url) URL.revokeObjectURL(url);
        };
    }, []);

    // Decoding a looping video in a background tab burns memory and battery for
    // nothing, so pause it whenever the page is hidden.
    useEffect(() => {
        const onVisibility = () => {
            const v = videoRef.current;
            if (!v) return;
            if (document.hidden) v.pause();
            else v.play().catch(() => {});
        };
        // Respect the OS "reduce motion" setting too: no looping video at all.
        if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            videoRef.current?.pause();
        }
        document.addEventListener('visibilitychange', onVisibility);
        return () => document.removeEventListener('visibilitychange', onVisibility);
    }, []);

    useEffect(() => {
        if (shutdown === true) {
            rebootDesktop();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [shutdown]);

    useEffect(() => {
        const opener = (event: Event) => {
            const key = (event as CustomEvent).detail?.key;
            const app = key && APPLICATIONS[key];
            if (!app) return;
            playUiSound('open');
            setWindows((prev) => {
                const max = Math.max(0, ...Object.keys(prev).map((k) => prev[k]?.zIndex || 0));
                return {
                    ...prev,
                    [app.key]: {
                        zIndex: max + 1,
                        minimized: false,
                        component: (
                            <app.component
                                onInteract={() => onWindowInteract(app.key)}
                                onMinimize={() => minimizeWindow(app.key)}
                                onClose={() => removeWindow(app.key)}
                                key={`${app.key}-${Date.now()}`}
                            />
                        ),
                        name: app.name,
                        icon: app.shortcutIcon,
                    },
                };
            });
        };
        window.addEventListener('aditya-open-app', opener);
        return () => window.removeEventListener('aditya-open-app', opener);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        const newShortcuts: DesktopShortcutProps[] = [];
        Object.keys(APPLICATIONS).forEach((key) => {
            const app = APPLICATIONS[key];
            newShortcuts.push({
                shortcutName: app.name,
                icon: app.shortcutIcon,
                onOpen: () => {
                    playUiSound('open');
                    addWindow(
                        app.key,
                        <app.component
                            onInteract={() => onWindowInteract(app.key)}
                            onMinimize={() => minimizeWindow(app.key)}
                            onClose={() => removeWindow(app.key)}
                            key={app.key}
                        />
                    );
                },
            });
        });

        newShortcuts.forEach((shortcut) => {
            if (shortcut.shortcutName === 'Aditya Portfolio' && localStorage.getItem('autostart') !== '0') {
                shortcut.onOpen();
            }
        });

        setShortcuts(newShortcuts);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const rebootDesktop = useCallback(() => {
        setWindows({});
    }, []);

    const removeWindow = useCallback((key: string) => {
        playUiSound('close');
        // Absolute hack and a half
        setTimeout(() => {
            setWindows((prevWindows) => {
                const newWindows = { ...prevWindows };
                delete newWindows[key];
                return newWindows;
            });
        }, 100);
    }, []);

    const minimizeWindow = useCallback((key: string) => {
        playUiSound('minimize');
        setWindows((prevWindows) => {
            const newWindows = { ...prevWindows };
            newWindows[key].minimized = true;
            return newWindows;
        });
    }, []);

    const getHighestZIndex = useCallback((): number => {
        let highestZIndex = 10;
        Object.keys(windows).forEach((key) => {
            const window = windows[key];
            if (window) {
                if (window.zIndex > highestZIndex)
                    highestZIndex = window.zIndex;
            }
        });
        return highestZIndex;
    }, [windows]);

    const toggleMinimize = useCallback(
        (key: string) => {
            const newWindows = { ...windows };
            const highestIndex = getHighestZIndex();
            if (
                newWindows[key].minimized ||
                newWindows[key].zIndex === highestIndex
            ) {
                newWindows[key].minimized = !newWindows[key].minimized;
            }
            newWindows[key].zIndex = getHighestZIndex() + 1;
            setWindows(newWindows);
        },
        [windows, getHighestZIndex]
    );

    const onWindowInteract = useCallback(
        (key: string) => {
            setWindows((prevWindows) => ({
                ...prevWindows,
                [key]: {
                    ...prevWindows[key],
                    zIndex: 1 + getHighestZIndex(),
                },
            }));
        },
        [setWindows, getHighestZIndex]
    );

    const startShutdown = useCallback(() => {
        playUiSound('shutdown');
        setTimeout(() => {
            setShutdown(true);
            setNumShutdowns(numShutdowns + 1);
        }, 600);
    }, [numShutdowns]);

    const addWindow = useCallback(
        (key: string, element: JSX.Element) => {
            setWindows((prevState) => ({
                ...prevState,
                [key]: {
                    zIndex: getHighestZIndex() + 1,
                    minimized: false,
                    component: element,
                    name: APPLICATIONS[key].name,
                    icon: APPLICATIONS[key].shortcutIcon,
                },
            }));
        },
        [getHighestZIndex]
    );

    return !shutdown ? (
        <div style={styles.desktop}>
            {wallpaper?.kind === 'image' && wallpaperUrl ? (
                <div className="desktop-wallpaper-image" style={{ backgroundImage: `url(${wallpaperUrl})` }} />
            ) : wallpaper?.kind === 'video' && wallpaperUrl ? (
                <video ref={videoRef} className="desktop-wallpaper-video" src={wallpaperUrl} autoPlay muted loop playsInline />
            ) : wallpaper?.kind === 'builtin' && wallpaper.src ? (
                <video ref={videoRef} className="desktop-wallpaper-video" src={wallpaper.src} autoPlay muted loop playsInline preload="auto" disablePictureInPicture />
            ) : wallpaper?.kind === 'color' ? (
                <div className="desktop-wallpaper-image" style={{ background: wallpaper.color }} />
            ) : (
                <video ref={videoRef} className="desktop-wallpaper-video" autoPlay muted loop playsInline preload="auto">
                    <source src="assets/wallspace-one-piece.mp4" type="video/mp4" />
                </video>
            )}
            <div className="desktop-wallpaper-shade" style={{ backgroundColor: `rgba(0,0,0,${wallpaperDim})` }} />
            {/* For each window in windows, loop over and render  */}
            {Object.keys(windows).map((key) => {
                const element = windows[key].component;
                if (!element) return <div key={`win-${key}`}></div>;
                return (
                    <div
                        key={`win-${key}`}
                        style={Object.assign(
                            {},
                            { zIndex: windows[key].zIndex },
                            windows[key].minimized && styles.minimized
                        )}
                    >
                        {React.cloneElement(element, {
                            key,
                            onInteract: () => onWindowInteract(key),
                            onClose: () => removeWindow(key),
                        })}
                    </div>
                );
            })}
            <div style={styles.shortcuts}>
                {shortcuts.map((shortcut, i) => {
                    return (
                        <div
                            style={Object.assign({}, styles.shortcutContainer, {
                                top: (i % 8) * 92,
                                left: Math.floor(i / 8) * 96,
                            })}
                            key={shortcut.shortcutName}
                        >
                            <DesktopShortcut
                                icon={shortcut.icon}
                                shortcutName={shortcut.shortcutName}
                                onOpen={shortcut.onOpen}
                            />
                        </div>
                    );
                })}
            </div>
            <Toolbar
                windows={windows}
                toggleMinimize={toggleMinimize}
                shutdown={startShutdown}
            />
        </div>
    ) : (
        <ShutdownSequence
            setShutdown={setShutdown}
            numShutdowns={numShutdowns}
        />
    );
};

const styles: StyleSheetCSS = {
    desktop: {
        minHeight: '100%',
        flex: 1,
        backgroundColor: Colors.turquoise,
        position: 'relative',
        overflow: 'hidden',
    },
    shutdown: {
        minHeight: '100%',
        flex: 1,
        backgroundColor: '#1d2e2f',
    },
    shortcutContainer: {
        position: 'absolute',
    },
    shortcuts: {
        position: 'absolute',
        top: 16,
        left: 6,
        zIndex: 2,
    },
    minimized: {
        // display:none instead of opacity:0 — a hidden window then costs no
        // layout, paint or compositing, and the browser throttles the iframes
        // inside it (Open WebUI and OpenCharts are not cheap to keep painting).
        display: 'none',
    },
};

export default Desktop;
