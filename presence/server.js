/**
 * Presence relay for the portfolio's live cursors and visitor chat.
 *
 * Everything lives in memory: a roster of connected sockets, a rolling window
 * of the most recent messages, and reaction counts. Nothing is written to disk
 * or to a database, so a restart wipes the room clean — which is the intended
 * lifetime for a chat that exists only while people are looking at the page.
 *
 * No account, email, IP or history is stored against a visitor. A session id is
 * a random string the browser keeps in its own localStorage; the server only
 * uses it to reunite a reconnecting tab with its chosen display name.
 */
import { createServer } from 'node:http';
import { randomUUID } from 'node:crypto';
import { Server } from 'socket.io';

const PORT = process.env.PORT || 8090;

// Browsers allowed to open a socket. Anything else is refused at the handshake.
const ORIGINS = (process.env.ALLOWED_ORIGINS ||
    'http://localhost:3000,http://localhost:8080').split(',').map((o) => o.trim());

const MAX_HISTORY = 200;     // messages held in memory, oldest dropped
const PAGE_SIZE = 50;        // messages returned per history fetch
const MAX_MESSAGE = 500;     // characters accepted in one message
const MSG_WINDOW_MS = 10_000;
const MSG_BURST = 8;         // messages per window before we start dropping

const ADJECTIVES = ['Quiet', 'Amber', 'Rapid', 'Hollow', 'Bright', 'Distant', 'Velvet', 'Iron', 'Lucid', 'Copper'];
const NOUNS = ['Heron', 'Comet', 'Lantern', 'Falcon', 'Cipher', 'Meridian', 'Ember', 'Harbor', 'Quartz', 'Wren'];
const COLORS = ['#f97316', '#22d3ee', '#a78bfa', '#f472b6', '#4ade80', '#facc15', '#60a5fa', '#fb7185'];

const pick = (list, seed) => list[Math.abs(hash(seed)) % list.length];
const hash = (s) => [...String(s)].reduce((a, c) => ((a << 5) - a + c.charCodeAt(0)) | 0, 0);

/** A stable, anonymous identity derived from the session id alone. */
const identityFor = (sessionId) => ({
    name: `${pick(ADJECTIVES, sessionId)} ${pick(NOUNS, sessionId + 'n')}`,
    color: pick(COLORS, sessionId + 'c'),
    avatar: '',
});

const clean = (s, max) => String(s ?? '').replace(/\s+/g, ' ').trim().slice(0, max);

const http = createServer((req, res) => {
    // Health endpoint — also what the keep-alive cron pings so the free tier
    // does not idle the service out between visitors.
    if (req.url === '/healthz' || req.url === '/') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ ok: true, online: users.size, uptime: process.uptime() }));
    }
    res.writeHead(404).end();
});

const io = new Server(http, {
    cors: { origin: ORIGINS, credentials: true },
    // Free instances sleep; a generous timeout keeps a waking tab from
    // thrashing reconnects.
    pingTimeout: 30_000,
});

/** socketId -> user record broadcast to everyone. */
const users = new Map();
/** sessionId -> profile, so a reconnecting tab keeps the name it chose. */
const profiles = new Map();
/** sessionId -> timestamps of recent messages, for rate limiting. */
const recent = new Map();

let messages = [];
const reactions = new Map(); // messageId -> Map<emoji, Set<sessionId>>

const roster = () => [...users.values()];
const broadcastUsers = () => io.emit('users-updated', roster());

const reactionsFor = (ids) => {
    const out = {};
    for (const id of ids) {
        const byEmoji = reactions.get(id);
        if (!byEmoji) continue;
        out[id] = [...byEmoji.entries()].map(([emoji, who]) => ({ emoji, sessionIds: [...who] }));
    }
    return out;
};

const rateLimited = (sessionId) => {
    const now = Date.now();
    const stamps = (recent.get(sessionId) || []).filter((t) => now - t < MSG_WINDOW_MS);
    stamps.push(now);
    recent.set(sessionId, stamps);
    return stamps.length > MSG_BURST;
};

io.on('connection', (socket) => {
    const sessionId = clean(socket.handshake.auth?.sessionId, 64) || randomUUID();
    const profile = profiles.get(sessionId) || identityFor(sessionId);
    profiles.set(sessionId, profile);

    // Tell the tab which session it is, so it can persist and reuse it.
    socket.emit('session', { sessionId });

    users.set(socket.id, {
        id: sessionId,
        socketId: socket.id,
        name: profile.name,
        avatar: profile.avatar,
        color: profile.color,
        isOnline: true,
        // Deliberately not resolved from the connection: no geolocation here.
        location: '',
        flag: '',
        lastSeen: new Date().toISOString(),
        createdAt: new Date().toISOString(),
    });
    broadcastUsers();

    socket.on('update-user', (data = {}) => {
        const u = users.get(socket.id);
        if (!u) return;
        const name = clean(data.name, 24);
        if (name) u.name = name;
        if (typeof data.color === 'string' && /^#[0-9a-f]{6}$/i.test(data.color)) u.color = data.color;
        if (typeof data.avatar === 'string') u.avatar = clean(data.avatar, 200);
        profiles.set(sessionId, { name: u.name, color: u.color, avatar: u.avatar });
        broadcastUsers();
    });

    // Cursors are relayed, never retained.
    socket.on('cursor-change', (pos = {}) => {
        const x = Number(pos.x);
        const y = Number(pos.y);
        if (!Number.isFinite(x) || !Number.isFinite(y)) return;
        socket.broadcast.emit('cursor-changed', { pos: { x, y }, socketId: socket.id });
    });

    socket.on('typing-send', (data = {}) => {
        socket.broadcast.emit('typing-receive', {
            socketId: socket.id,
            username: clean(data.username, 24) || 'Anonymous',
        });
    });

    socket.on('msgs-fetch-init', () => {
        const slice = messages.slice(-PAGE_SIZE);
        socket.emit('msgs-receive-init', slice);
        socket.emit('reactions-init', reactionsFor(slice.map((m) => m.id)));
    });

    socket.on('msgs-fetch-history', ({ before } = {}) => {
        const idx = messages.findIndex((m) => m.id === before);
        const end = idx === -1 ? Math.max(0, messages.length - PAGE_SIZE) : idx;
        const start = Math.max(0, end - PAGE_SIZE);
        const slice = messages.slice(start, end);
        socket.emit('msgs-receive-history', {
            messages: slice,
            hasMore: start > 0,
            reactions: reactionsFor(slice.map((m) => m.id)),
        });
    });

    socket.on('msg-send', (data = {}) => {
        const content = clean(data.content, MAX_MESSAGE);
        if (!content) return;
        if (rateLimited(sessionId)) {
            return socket.emit('warning', { message: 'Slow down a little — messages are rate limited.' });
        }
        const u = users.get(socket.id);
        const msg = {
            id: randomUUID(),
            sessionId,
            username: u?.name || 'Anonymous',
            avatar: u?.avatar || '',
            color: u?.color,
            country: '',
            flag: '',
            content,
            createdAt: new Date().toISOString(),
            ...(data.replyTo?.id
                ? {
                    replyTo: {
                        id: String(data.replyTo.id),
                        username: clean(data.replyTo.username, 24),
                        content: clean(data.replyTo.content, 140),
                    },
                }
                : {}),
        };
        messages.push(msg);
        if (messages.length > MAX_HISTORY) {
            const dropped = messages.splice(0, messages.length - MAX_HISTORY);
            for (const d of dropped) reactions.delete(d.id);
        }
        io.emit('msg-receive', msg);
    });

    // A message can only be edited or removed by the session that wrote it.
    socket.on('msg-edit', ({ id, content } = {}) => {
        const msg = messages.find((m) => m.id === id);
        if (!msg || msg.sessionId !== sessionId) return;
        const next = clean(content, MAX_MESSAGE);
        if (!next) return;
        msg.content = next;
        msg.editedAt = new Date().toISOString();
        io.emit('msg-update', { id: msg.id, content: msg.content, editedAt: msg.editedAt });
    });

    socket.on('msg-delete', ({ id } = {}) => {
        const msg = messages.find((m) => m.id === id);
        if (!msg || msg.sessionId !== sessionId) return;
        messages = messages.filter((m) => m.id !== id);
        reactions.delete(id);
        io.emit('msg-delete', { id });
    });

    socket.on('reaction-toggle', ({ messageId, emoji } = {}) => {
        const e = clean(emoji, 8);
        if (!e || !messages.some((m) => m.id === messageId)) return;
        const byEmoji = reactions.get(messageId) || new Map();
        const who = byEmoji.get(e) || new Set();
        if (who.has(sessionId)) who.delete(sessionId);
        else who.add(sessionId);
        if (who.size) byEmoji.set(e, who);
        else byEmoji.delete(e);
        if (byEmoji.size) reactions.set(messageId, byEmoji);
        else reactions.delete(messageId);
        io.emit('reaction-update', {
            messageId,
            reactions: [...byEmoji.entries()].map(([k, v]) => ({ emoji: k, sessionIds: [...v] })),
        });
    });

    // There is no admin surface on this relay; always refuse.
    socket.on('admin-auth', () => socket.emit('warning', { message: 'No admin mode on this server.' }));

    socket.on('disconnect', () => {
        users.delete(socket.id);
        // The pointer must go with the visitor, or it hangs where they left it.
        socket.broadcast.emit('cursor-changed', { pos: null, socketId: socket.id });
        broadcastUsers();
    });
});

http.listen(PORT, () => {
    console.log(`presence relay on :${PORT} — origins ${ORIGINS.join(', ')}`);
});
