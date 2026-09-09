import React, { useEffect, useState } from 'react';
import { Peer, presence, presenceEnabled } from '../../utils/presence';

/** Other visitors' cursors, drawn over the desktop. Off unless a server is set. */
const PresenceLayer: React.FC<{ activeApp?: string | null }> = ({ activeApp = null }) => {
    const [peers, setPeers] = useState<Peer[]>([]);

    useEffect(() => {
        if (!presenceEnabled()) return;
        presence.connect();
        const off = presence.subscribe(setPeers);
        const onMove = (e: MouseEvent) => presence.update(e.clientX, e.clientY, activeApp);
        window.addEventListener('mousemove', onMove);
        return () => {
            window.removeEventListener('mousemove', onMove);
            off();
        };
    }, [activeApp]);

    if (!presenceEnabled() || peers.length === 0) return null;

    return (
        <div className="presence-layer">
            {peers.map((p) => (
                <div
                    key={p.id}
                    className="presence-cursor"
                    style={{
                        transform: `translate3d(${p.x * window.innerWidth}px, ${p.y * window.innerHeight}px, 0)`,
                        color: p.color,
                    }}
                >
                    <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true">
                        <path d="M1 1l5.5 13 2-5 5-2z" fill="currentColor" stroke="#0008" strokeWidth="1" />
                    </svg>
                    {p.app && <span>{p.app}</span>}
                </div>
            ))}
            <div className="presence-count">● {peers.length + 1} here now</div>
        </div>
    );
};

export default PresenceLayer;
