import React, { useRef, useState } from 'react';
import Window from '../os/Window';

export interface PaintProps extends WindowAppProps {}

// Pattern copied from 1j01/jspaint (MIT) — canvas, tools, palette, undo.
const COLORS = [
    '#000000', '#ffffff', '#c0c0c0', '#808080', '#800000', '#ff0000',
    '#808000', '#ffff00', '#008000', '#00ff00', '#008080', '#00ffff',
    '#000080', '#0000ff', '#800080', '#ff00ff',
];

type Tool = 'pencil' | 'brush' | 'eraser' | 'line' | 'rect' | 'circle' | 'fill';

const Paint: React.FC<PaintProps> = (props) => {
    const canvas = useRef<HTMLCanvasElement>(null);
    const [tool, setTool] = useState<Tool>('pencil');
    const [color, setColor] = useState('#000000');
    const [size, setSize] = useState(3);
    const [drawing, setDrawing] = useState(false);
    const [start, setStart] = useState<[number, number]>([0, 0]);
    const history = useRef<string[]>([]);

    const ctx = () => canvas.current?.getContext('2d');
    const pos = (e: React.PointerEvent) => {
        const r = canvas.current!.getBoundingClientRect();
        return [
            ((e.clientX - r.left) / r.width) * canvas.current!.width,
            ((e.clientY - r.top) / r.height) * canvas.current!.height,
        ] as [number, number];
    };
    const snapshot = () => {
        if (!canvas.current) return;
        history.current.push(canvas.current.toDataURL());
        if (history.current.length > 20) history.current.shift();
    };
    const undo = () => {
        const prev = history.current.pop();
        const c = ctx();
        if (!c || !prev) return;
        const img = new Image();
        img.onload = () => {
            c.clearRect(0, 0, canvas.current!.width, canvas.current!.height);
            c.drawImage(img, 0, 0);
        };
        img.src = prev;
    };

    const down = (e: React.PointerEvent) => {
        (e.target as HTMLElement).setPointerCapture(e.pointerId);
        snapshot();
        const c = ctx();
        if (!c) return;
        const [x, y] = pos(e);
        setStart([x, y]);
        setDrawing(true);
        c.fillStyle = color;
        c.strokeStyle = tool === 'eraser' ? '#ffffff' : color;
        c.lineWidth = tool === 'brush' ? size * 3 : tool === 'eraser' ? size * 4 : size;
        c.lineCap = 'round';
        if (tool === 'pencil' || tool === 'brush' || tool === 'eraser') {
            c.beginPath();
            c.arc(x, y, c.lineWidth / 2, 0, 7);
            c.fill();
            c.beginPath();
            c.moveTo(x, y);
        } else if (tool === 'fill') {
            c.fillStyle = color;
            c.fillRect(0, 0, canvas.current!.width, canvas.current!.height);
            setDrawing(false);
        }
    };
    const move = (e: React.PointerEvent) => {
        if (!drawing) return;
        const c = ctx();
        if (!c) return;
        const [x, y] = pos(e);
        if (tool === 'pencil' || tool === 'brush' || tool === 'eraser') {
            c.lineTo(x, y);
            c.stroke();
        }
    };
    const up = (e: React.PointerEvent) => {
        if (!drawing) return;
        const c = ctx();
        setDrawing(false);
        if (!c) return;
        const [x, y] = pos(e);
        const [sx, sy] = start;
        c.strokeStyle = color;
        c.lineWidth = size;
        if (tool === 'line') {
            c.beginPath(); c.moveTo(sx, sy); c.lineTo(x, y); c.stroke();
        } else if (tool === 'rect') {
            c.strokeRect(sx, sy, x - sx, y - sy);
        } else if (tool === 'circle') {
            c.beginPath();
            c.ellipse(sx, sy, Math.abs(x - sx), Math.abs(y - sy), 0, 0, 7);
            c.stroke();
        }
    };

    const save = () => {
        const a = document.createElement('a');
        a.download = 'aditya-paint.png';
        a.href = canvas.current!.toDataURL();
        a.click();
    };

    return (
        <Window
            top={40}
            left={80}
            width={680}
            height={560}
            windowTitle="Paint"
            windowBarIcon="showcaseIcon"
            bottomLeftText={`${tool} · ${color} · ${size}px`}
            closeWindow={props.onClose}
            onInteract={props.onInteract}
            minimizeWindow={props.onMinimize}
        >
            <div className="paint-app">
                <div className="paint-toolbar">
                    {(['pencil', 'brush', 'eraser', 'line', 'rect', 'circle', 'fill'] as Tool[]).map((t) => (
                        <button key={t} className={tool === t ? 'active' : ''} onClick={() => setTool(t)}>{t}</button>
                    ))}
                    <button onClick={undo}>undo</button>
                    <button onClick={() => { snapshot(); ctx()?.clearRect(0, 0, 640, 400); }}>clear</button>
                    <button onClick={save}>save</button>
                    <label>size <input type="range" min={1} max={20} value={size} onChange={(e) => setSize(Number(e.target.value))} /></label>
                </div>
                <canvas
                    ref={canvas}
                    width={640}
                    height={400}
                    className="paint-canvas"
                    onPointerDown={down}
                    onPointerMove={move}
                    onPointerUp={up}
                />
                <div className="paint-palette">
                    {COLORS.map((c) => (
                        <button key={c} style={{ background: c }} className={color === c ? 'active' : ''} onClick={() => setColor(c)} />
                    ))}
                </div>
            </div>
        </Window>
    );
};

export default Paint;
