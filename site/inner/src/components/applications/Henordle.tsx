import React from 'react';
import VendorGame from './VendorGame';

export interface HenordleAppProps extends WindowAppProps {}

// Wordle — modem7/react-wordle (MIT), built from source into public/games/wordle.
const HenordleApp: React.FC<HenordleAppProps> = (props) => (
    <VendorGame
        {...props}
        slug="wordle"
        title="Wordle"
        credit="modem7/react-wordle (MIT) — daily word, stats saved locally"
        width={560}
        height={780}
    />
);

export default HenordleApp;
