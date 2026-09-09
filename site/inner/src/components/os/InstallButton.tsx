import React, { useEffect, useState } from 'react';

/**
 * Install prompt. Chromium fires beforeinstallprompt and we save it for a
 * click; iOS never does, so Safari visitors get the Add to Home Screen hint
 * instead. Hidden entirely once the app is already installed.
 */
const InstallButton: React.FC = () => {
    const [prompt, setPrompt] = useState<any>(null);
    const [ios, setIos] = useState(false);
    const [hint, setHint] = useState(false);

    useEffect(() => {
        const standalone = window.matchMedia('(display-mode: standalone)').matches
            || (window.navigator as any).standalone === true;
        if (standalone) return;

        const onPrompt = (e: Event) => {
            e.preventDefault();
            setPrompt(e);
        };
        window.addEventListener('beforeinstallprompt', onPrompt);

        const isIos = /iphone|ipad|ipod/i.test(navigator.userAgent);
        if (isIos) setIos(true);
        return () => window.removeEventListener('beforeinstallprompt', onPrompt);
    }, []);

    if (!prompt && !ios) return null;

    return (
        <>
            <button
                className="install-btn"
                title="Install AdityaOS"
                onClick={async () => {
                    if (prompt) {
                        prompt.prompt();
                        const { outcome } = await prompt.userChoice;
                        if (outcome === 'accepted') setPrompt(null);
                    } else setHint((h) => !h);
                }}
            >
                ⤓ Install
            </button>
            {hint && (
                <div className="install-hint">
                    On iPhone: tap <b>Share</b>, then <b>Add to Home Screen</b>.
                    <button onClick={() => setHint(false)}>ok</button>
                </div>
            )}
        </>
    );
};

export default InstallButton;
