export const adityaOS = {
    id: "adityaos",
    title: "AdityaOS",
    subtitle: "A 3D workstation you can actually use",
    description:
        "This site. A Three.js CRT running a full React desktop \u2014 markets, editor, research, browser, file system and a dozen working games \u2014 plus live cursors and an installable app.",

    longDescription: `
AdityaOS is two applications stacked. The outer shell is Three.js: the room, the desk, the CRT monitor. The inner desktop is a React app painted onto that screen, so every window, game and file is real DOM rather than baked geometry.

The apps inside are genuine upstream builds rather than lookalikes — lichess chessground for the board, js-dos and DOSBox for Doom, OpenCharts for the trading terminal, this IDE for the editor.

It has live cursors over WebSocket, achievements, a desktop pet, 88 wallpapers you can download, and it installs as a real app with its own window.
`,

    type: "Interactive Portfolio / 3D Web Application",
    tech: [
        "Three.js",
        "React",
        "TypeScript",
        "WebGL",
        "Next.js",
        "socket.io",
        "Express",
        "Webpack"
],

    links: {
        "live": "https://adityabalajiportfolio.vercel.app",
        "github": "https://github.com/aditya160509"
},

    architecture: `
[Three.js Shell]  ->  room · desk · CRT
        |
        v
[React Desktop]  (painted to the screen texture)
        |
        +--> Markets · Editor · Browser · Terminal
        +--> Files · Research · Assistant · Settings
        +--> Games (chessground, js-dos, straker)
        |
        v
[socket.io Presence]  ->  live cursors
[Service Worker]      ->  installable app
`
};
