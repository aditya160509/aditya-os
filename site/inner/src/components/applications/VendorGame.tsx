import React from 'react';
import Window from '../os/Window';

/**
 * Runs a vendored open-source game straight from public/games/<slug>/.
 * The upstream projects are copied in unmodified (see each folder's readme
 * and licence) and served inside the desktop window.
 */
const VendorGame: React.FC<WindowAppProps & {
    slug: string;
    title: string;
    credit: string;
    width?: number;
    height?: number;
}> = ({ slug, title, credit, width = 760, height = 640, ...props }) => (
    <Window
        top={40} left={140}
        width={Math.min(width, window.innerWidth - 40)}
        height={Math.min(height, window.innerHeight - 52)}
        windowTitle={title}
        windowBarIcon="windowGameIcon"
        bottomLeftText={credit}
        closeWindow={props.onClose}
        onInteract={props.onInteract}
        minimizeWindow={props.onMinimize}
    >
        <iframe
            className="vendor-game"
            title={title}
            src={`games/${slug}/index.html`}
            sandbox="allow-scripts allow-same-origin allow-popups"
        />
    </Window>
);

export const MinesweeperApp: React.FC<WindowAppProps> = (p) => (
    <VendorGame {...p} slug="minesweeper" title="Minesweeper" credit="nickarocho/minesweeper — vanilla JS Win95 clone" width={700} height={720} />
);
export const SolitaireApp: React.FC<WindowAppProps> = (p) => (
    <VendorGame {...p} slug="klondike" title="Klondike Solitaire" credit="scarolan/klondike (MIT) — drag & drop klondike" width={1000} height={680} />
);
export const TetrisApp: React.FC<WindowAppProps> = (p) => (
    <VendorGame {...p} slug="tetris" title="Tetris" credit="straker basic-html-games (CC0) — arrows to move, ↑ rotate" width={420} height={720} />
);
export const PongApp: React.FC<WindowAppProps> = (p) => (
    <VendorGame {...p} slug="pong" title="Pong" credit="straker basic-html-games (CC0) — W/S vs ↑/↓" width={820} height={660} />
);

export const Game2048App: React.FC<WindowAppProps> = (p) => (
    <VendorGame {...p} slug="2048" title="2048" credit="gabrielecirulli/2048 (MIT) — arrows or swipe" width={560} height={720} />
);

export default VendorGame;
