// Presence relay: a tiny broadcast server for the desktop's live cursors.
//
//   node scripts/presence-server.mjs        # ws://localhost:8090
//
// It keeps nothing: each message is forwarded to the other clients in the room
// and then forgotten, and a disconnect tells everyone to drop that cursor.
// Point the desktop at it with REACT_APP_PRESENCE_URL before building.
import { WebSocketServer } from 'ws';

const port = Number(process.env.PORT || 8090);
const wss = new WebSocketServer({ port });
const ids = new WeakMap();

wss.on('connection', (socket) => {
    socket.on('message', (raw) => {
        let msg;
        try { msg = JSON.parse(raw.toString()); } catch { return; }
        if (!msg || msg.type !== 'presence' || typeof msg.id !== 'string') return;
        ids.set(socket, msg.id);
        const payload = JSON.stringify({
            type: 'presence',
            id: msg.id,
            color: typeof msg.color === 'string' ? msg.color.slice(0, 9) : '#7dd3fc',
            x: Number(msg.x) || 0,
            y: Number(msg.y) || 0,
            app: typeof msg.app === 'string' ? msg.app.slice(0, 24) : null,
        });
        for (const client of wss.clients) {
            if (client !== socket && client.readyState === 1) client.send(payload);
        }
    });

    socket.on('close', () => {
        const id = ids.get(socket);
        if (!id) return;
        const bye = JSON.stringify({ type: 'leave', id });
        for (const client of wss.clients) {
            if (client.readyState === 1) client.send(bye);
        }
    });
});

console.log(`Presence relay listening on ws://localhost:${port}`);
