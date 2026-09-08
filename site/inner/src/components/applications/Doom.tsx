import React, { useState } from 'react';
import DosPlayer from '../dos/DosPlayer';
import Window from '../os/Window';

export interface DoomAppProps extends WindowAppProps {}

const DoomApp: React.FC<DoomAppProps> = (props) => {
    const [width, setWidth] = useState(980);
    const [height, setHeight] = useState(670);

    return (
        <Window
            top={10}
            left={10}
            width={width}
            height={height}
            windowTitle="Doom"
            windowBarColor="#1C1C1C"
            windowBarIcon="windowGameIcon"
            bottomLeftText={'Click the game once, then use keyboard · arrows + Enter · Powered by JSDOS'}
            closeWindow={props.onClose}
            onInteract={props.onInteract}
            minimizeWindow={props.onMinimize}
            onWidthChange={setWidth}
            onHeightChange={setHeight}
        >
            <div
                style={{ width: '100%', height: '100%', position: 'relative' }}
                onMouseDown={(e) => {
                    const c = (e.currentTarget as HTMLElement).querySelector('canvas');
                    (c as HTMLElement | null)?.focus?.();
                }}
            >
                <DosPlayer width={width} height={height} bundleUrl="doom.jsdos" />
            </div>
        </Window>
    );
};

export default DoomApp;
