import React, { useEffect, useState } from 'react';

type InstallPromptEvent = Event & {
    prompt: () => Promise<void>;
    userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
};

const INSTALL_SEEN = 'aditya-install-seen';

/**
 * A discoverable PWA install affordance. Chromium's native prompt is kept for
 * supported browsers; Safari gets the correct Add to Home Screen instructions.
 * The small callout appears once after a minute, and can always be reopened
 * from Start → Install AdityaOS.
 */
const InstallButton: React.FC = () => {
    const [prompt, setPrompt] = useState<InstallPromptEvent | null>(null);
    const [ios, setIos] = useState(false);
    const [installed, setInstalled] = useState(false);
    const [hint, setHint] = useState(false);
    const [callout, setCallout] = useState(false);

    const isStandalone = () => window.matchMedia('(display-mode: standalone)').matches
        || (window.navigator as any).standalone === true;

    useEffect(() => {
        if (isStandalone()) {
            setInstalled(true);
            return;
        }

        const onPrompt = (event: Event) => {
            event.preventDefault();
            setPrompt(event as InstallPromptEvent);
        };
        const onInstalled = () => {
            setInstalled(true);
            setPrompt(null);
            setHint(false);
            setCallout(false);
        };
        setIos(/iphone|ipad|ipod/i.test(navigator.userAgent));
        window.addEventListener('beforeinstallprompt', onPrompt);
        window.addEventListener('appinstalled', onInstalled);

        const timer = window.setTimeout(() => {
            if (!localStorage.getItem(INSTALL_SEEN) && !isStandalone()) {
                localStorage.setItem(INSTALL_SEEN, '1');
                setCallout(true);
            }
        }, 60_000);

        return () => {
            window.removeEventListener('beforeinstallprompt', onPrompt);
            window.removeEventListener('appinstalled', onInstalled);
            window.clearTimeout(timer);
        };
    }, []);

    const install = async () => {
        setCallout(false);
        if (prompt) {
            await prompt.prompt();
            const { outcome } = await prompt.userChoice;
            if (outcome === 'accepted') setInstalled(true);
            setPrompt(null);
        } else {
            setHint((value) => !value);
        }
    };

    useEffect(() => {
        const onStartInstall = () => install();
        window.addEventListener('aditya-install-open', onStartInstall);
        return () => window.removeEventListener('aditya-install-open', onStartInstall);
    });

    if (installed) return null;

    return (
        <>
            <button className="install-btn" title="Install AdityaOS" onClick={install}>
                ⤓ Install
            </button>
            {callout && (
                <div className="install-callout" role="status">
                    <b>Take AdityaOS with you</b>
                    <span>Install it in its own window with a quick offline shell and no browser chrome.</span>
                    <div>
                        <button onClick={install}>Install</button>
                        <button className="install-dismiss" onClick={() => setCallout(false)}>Later</button>
                    </div>
                </div>
            )}
            {hint && (
                <div className="install-hint">
                    {ios ? (
                        <>On iPhone: tap <b>Share</b>, then <b>Add to Home Screen</b>.</>
                    ) : (
                        <>Use your browser&apos;s menu and choose <b>Install AdityaOS</b> or <b>Add to Home Screen</b>.</>
                    )}
                    <button onClick={() => setHint(false)}>ok</button>
                </div>
            )}
        </>
    );
};

export default InstallButton;
