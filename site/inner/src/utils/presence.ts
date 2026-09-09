// Live presence — see other visitors' cursors and which app they have open.
//
// The wire format follows the pattern used by Naresh-Khatri/3d-portfolio's
// socket context: an anonymous session id, a colour, a cursor position and the
// current room. Nothing identifying is sent — no name, no IP, no history — and
// a peer disappears from the room as soon as their socket closes.
//
// The server URL comes from REACT_APP_PRESENCE_URL. With no URL configured the
// module stays dormant, so the desktop works exactly as before.

export type Peer = {
    id: string;
    x: number;
    y: number;
    app: string | null;
    color: string;
    at: number;
};

const COLORS = ['#7dd3fc', '#fca5a5', '#86efac', '#fcd34d', '#c4b5fd', '#f9a8d4', '#5eead4'];
const PRESENCE_URL = process.env.REACT_APP_PRESENCE_URL || '';
const STALE_MS = 12000;

export const presenceEnabled = () => Boolean(PRESENCE_URL);

export class Presence {
    private socket: WebSocket | null = null;
    private peers = new Map<string, Peer>();
    private listeners = new Set<(peers: Peer[]) => void>();
    private sendTimer: any = null;
    private reapTimer: any = null;
    private pending: { x: number; y: number; app: string | null } | null = null;

    readonly id = Math.random().toString(36).slice(2, 10);
    readonly color = COLORS[Math.floor(Math.random() * COLORS.length)];

    connect() {
        if (!PRESENCE_URL || this.socket) return;
        try {
            this.socket = new WebSocket(PRESENCE_URL);
        } catch {
            this.socket = null;
            return;
        }
        this.socket.onopen = () => this.flush();
        this.socket.onmessage = (ev) => {
            try {
                const msg = JSON.parse(ev.data);
                if (msg.type === 'presence' && msg.id !== this.id) {
                    this.peers.set(msg.id, { ...msg, at: Date.now() });
                    this.emit();
                }
                if (msg.type === 'leave') {
                    this.peers.delete(msg.id);
                    this.emit();
                }
            } catch {}
        };
        this.socket.onclose = () => {
            this.socket = null;
            this.peers.clear();
            this.emit();
            setTimeout(() => this.connect(), 4000);
        };

        // Cursor updates are throttled to 12/second and stale peers are dropped,
        // so a tab left open in the background never accumulates ghosts.
        this.sendTimer = setInterval(() => this.flush(), 80);
        this.reapTimer = setInterval(() => {
            const cut = Date.now() - STALE_MS;
            let changed = false;
            this.peers.forEach((p, id) => {
                if (p.at < cut) { this.peers.delete(id); changed = true; }
            });
            if (changed) this.emit();
        }, 4000);
    }

    disconnect() {
        clearInterval(this.sendTimer);
        clearInterval(this.reapTimer);
        this.socket?.close();
        this.socket = null;
    }

    /** Queue the local cursor; the interval above does the sending. */
    update(x: number, y: number, app: string | null) {
        this.pending = { x, y, app };
    }

    private flush() {
        if (!this.pending || this.socket?.readyState !== WebSocket.OPEN) return;
        const { x, y, app } = this.pending;
        this.pending = null;
        this.socket.send(JSON.stringify({
            type: 'presence',
            id: this.id,
            color: this.color,
            // relative coordinates so peers land in the right place on any screen
            x: +(x / window.innerWidth).toFixed(4),
            y: +(y / window.innerHeight).toFixed(4),
            app,
        }));
    }

    subscribe(fn: (peers: Peer[]) => void) {
        this.listeners.add(fn);
        return () => this.listeners.delete(fn);
    }

    private emit() {
        const list = Array.from(this.peers.values());
        this.listeners.forEach((fn) => fn(list));
    }
}

export const presence = new Presence();
