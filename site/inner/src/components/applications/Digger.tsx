import React, { useState } from 'react';
import DosPlayer from '../dos/DosPlayer';
import Window from '../os/Window';

const DiggerApp: React.FC<WindowAppProps> = (props) => {
    const [width, setWidth] = useState(820);
    const [height, setHeight] = useState(610);
    return (
        <Window top={20} left={50} width={width} height={height}
            windowTitle="Digger" windowBarColor="#1C1C1C" windowBarIcon="windowGameIcon"
            bottomLeftText="Powered by JSDOS & DOSBox"
            closeWindow={props.onClose} onInteract={props.onInteract} minimizeWindow={props.onMinimize}
            onWidthChange={setWidth} onHeightChange={setHeight}>
            <DosPlayer width={width} height={height} bundleUrl="digger.jsdos" />
        </Window>
    );
};

export default DiggerApp;
