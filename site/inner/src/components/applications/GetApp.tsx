import React, { useEffect, useState } from 'react';
import Window from '../os/Window';
import { unlock } from '../../utils/achievements';
import './GetApp.css';

/**
 * Get AdityaOS — the install surface.
 *
 * The browser only offers its own install affordance from a menu most visitors
 * never open, and Safari offers none at all, so installing was effectively
 * hidden. This makes it an application: it explains what installing gets you,
 * fires the saved `beforeinstallprompt` where one exists, and gives per-platform
 * instructions where it does not.
 */
type Props = WindowAppProps;

type Platform = 'installable' | 'installed' | 'ios' | 'firefox' | 'other';

const detect = (): Platform => {
    if (typeof window === 'undefined') return 'other';
    const standalone = window.matchMedia?.('(display-mode: standalone)').matches
        || (window.navigator as any).standalone === true;
    if (standalone) return 'installed';
    const ua = navigator.userAgent;
    if (/iPad|iPhone|iPod/.test(ua) || (navigator.platform === 'MacIntel' && (navigator as any).maxTouchPoints > 1)) return 'ios';
    if (/Firefox/.test(ua)) return 'firefox';
    return 'other';
};

const STEPS: Record<Exclude<Platform, 'installed' | 'installable'>, { title: string; steps: string[] }> = {
    ios: {
        title: 'iPhone or iPad — Safari',
        steps: [
            'Tap the Share button at the bottom of Safari.',
            'Scroll down and choose "Add to Home Screen".',
            'Tap Add. AdityaOS appears as an app icon.',
        ],
    },
    firefox: {
        title: 'Firefox',
        steps: [
            'Firefox on the desktop does not install web apps.',
            'Open this page in Chrome, Edge or Brave to install it,',
            'or on Android use Menu → Install.',
        ],
    },
    other: {
        title: 'Chrome, Edge or Brave',
        steps: [
            'Open the browser menu (⋮ at the top right).',
            'Choose "Install AdityaOS…" or "Cast, save and share → Install page as app".',
            'Confirm. It opens in its own window from then on.',
        ],
    },
};

const GetApp: React.FC<Props> = (props) => {
    const [platform, setPlatform] = useState<Platform>('other');
    const [prompt, setPrompt] = useState<any>(null);
    const [outcome, setOutcome] = useState('');

    useEffect(() => {
        setPlatform(detect());
        // The event fires once, early; the desktop stashes it on window so this
        // app can still offer a real install button when opened later.
        const saved = (window as any).__adityaInstallPrompt;
        if (saved) { setPrompt(saved); setPlatform('installable'); }

        const onPrompt = (e: any) => {
            e.preventDefault();
            (window as any).__adityaInstallPrompt = e;
            setPrompt(e);
            setPlatform('installable');
        };
        const onInstalled = () => { setPlatform('installed'); setOutcome('Installed. Look for AdityaOS in your dock or app list.'); };
        window.addEventListener('beforeinstallprompt', onPrompt);
        window.addEventListener('appinstalled', onInstalled);
        return () => {
            window.removeEventListener('beforeinstallprompt', onPrompt);
            window.removeEventListener('appinstalled', onInstalled);
        };
    }, []);

    const install = async () => {
        if (!prompt) return;
        unlock('installer');
        prompt.prompt();
        const { outcome: res } = await prompt.userChoice;
        setOutcome(res === 'accepted' ? 'Installing…' : 'Not this time — the button stays here.');
        if (res === 'accepted') (window as any).__adityaInstallPrompt = null;
    };

    const guide = platform === 'installable' || platform === 'installed' ? null : STEPS[platform];

    return (
        <Window
            top={40}
            left={80}
            width={640}
            height={560}
            windowBarIcon="computerBig"
            windowTitle="Get AdityaOS"
            closeWindow={props.onClose}
            onInteract={props.onInteract}
            minimizeWindow={props.onMinimize}
            bottomLeftText="Installs from this page · no store, no account"
        >
            <div className="getapp">
                <header className="getapp-hero">
                    <div className="getapp-icon">A</div>
                    <div>
                        <h1>Take AdityaOS with you</h1>
                        <p>
                            Install it and the desktop opens in its own window — no address bar,
                            no tabs, its own icon. The shell works offline.
                        </p>
                    </div>
                </header>

                {platform === 'installed' ? (
                    <div className="getapp-done">
                        <b>✓ Already installed</b>
                        <span>You are running the installed app right now.</span>
                    </div>
                ) : platform === 'installable' ? (
                    <>
                        <button className="getapp-cta" onClick={install}>Install AdityaOS</button>
                        {outcome && <p className="getapp-outcome">{outcome}</p>}
                    </>
                ) : (
                    <section className="getapp-guide">
                        <h2>{guide!.title}</h2>
                        <ol>{guide!.steps.map((s) => <li key={s}>{s}</li>)}</ol>
                    </section>
                )}

                <section className="getapp-facts">
                    <h2>What you get</h2>
                    <ul>
                        <li><b>Its own window</b> — no browser chrome around the desktop.</li>
                        <li><b>Works offline</b> — the shell, apps and editor are cached.</li>
                        <li><b>Stays small</b> — wallpaper video and 3D models stream, so installing does not pull hundreds of megabytes.</li>
                        <li><b>Keeps your setup</b> — wallpaper and achievements persist between launches.</li>
                    </ul>
                </section>

                <section className="getapp-facts">
                    <h2>What it is not</h2>
                    <ul>
                        <li>Not an App Store or Play Store download — it installs straight from this page.</li>
                        <li>Not a native application: it is this web app, given its own window.</li>
                        <li>Nothing is sent anywhere. Everything you do here stays in this browser.</li>
                    </ul>
                </section>
            </div>
        </Window>
    );
};

export default GetApp;
