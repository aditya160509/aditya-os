import React from 'react';
import getIconByName, { IconName } from '../../assets/icons';

export interface IconProps {
    style?: React.CSSProperties;
    icon: IconName;
    size?: number;
}

const Icon: React.FC<IconProps> = ({ icon, style, size }) => {
    const isBrandIcon = [
        'openai', 'claude', 'chrome', 'safari', 'github', 'python',
        'apple', 'google', 'figma', 'microsoft', 'meta', 'amazon', 'slack',
        'swift', 'nodejs', 'cloud', 'trading', 'terminal', 'settings', 'portfolio'
    ].includes(icon);
    const iconStyle = Object.assign(
        {},
        styles.icon,
        isBrandIcon && { imageRendering: 'auto' },
        style,
        size && { width: size, height: size }
    );
    return (
        <img
            style={iconStyle}
            alt={''}
            src={getIconByName(icon) as unknown as string}
        />
    );
};

const styles: StyleSheetCSS = {
    icon: {
        imageRendering: 'pixelated',
        userSelect: 'none',
        WebkitUserSelect: 'none',
        msUserSelect: 'none',
        pointerEvents: 'none',
    },
};

export default Icon;
