import React, { useState } from 'react';
import Window from '../os/Window';
import { FS_ROOT, FSNode, fsJoin, fsParent, fsResolve, openApp } from '../../utils/filesystem';
import { unlock } from '../../utils/achievements';

export interface ExplorerProps extends WindowAppProps {}

const iconFor = (n: FSNode) =>
    n.kind === 'dir' ? '📁' : n.kind === 'link' ? '🌐' : n.kind === 'app' ? '🎮' : n.kind === 'pdf' ? '📕' : '📄';
const typeFor = (n: FSNode) =>
    n.kind === 'dir' ? 'File folder' : n.kind === 'link' ? 'Internet shortcut' : n.kind === 'app' ? 'Application' : n.kind === 'pdf' ? 'PDF document' : 'Text document';
const sizeFor = (n: FSNode) =>
    n.kind === 'dir' ? '—' : n.kind === 'text' ? `${((n.content || '').length / 1024).toFixed(1)} KB` : '1 KB';
// Fixed demo dates keep the listing stable (like a real disk snapshot).
const dateFor = (n: FSNode) => {
    let h = 0;
    for (const c of n.name) h = (h * 31 + c.charCodeAt(0)) % 365;
    const d = new Date(2026, 0, 1 + h);
    return `${d.getMonth() + 1}/${d.getDate()}/2026`;
};

const Explorer: React.FC<ExplorerProps> = (props) => {
    const [path, setPath] = useState('C:\\ADITYA');
    const [hist, setHist] = useState<string[]>(['C:\\ADITYA']);
    const [hi, setHi] = useState(0);
    const [sel, setSel] = useState<string | null>(null);
    const [filter, setFilter] = useState('');
    const [view, setView] = useState<'details' | 'icons'>('details');
    const [sort, setSort] = useState<'name' | 'type' | 'date'>('name');
    const [preview, setPreview] = useState(true);
    const node = fsResolve(path) || FS_ROOT;
    const kids = (node.kind === 'dir' ? node.children || [] : []).filter((k) =>
        k.name.toLowerCase().includes(filter.toLowerCase())
    );
    kids.sort((a, b) => {
        if (a.kind === 'dir' && b.kind !== 'dir') return -1;
        if (b.kind === 'dir' && a.kind !== 'dir') return 1;
        if (sort === 'type') return typeFor(a).localeCompare(typeFor(b)) || a.name.localeCompare(b.name);
        if (sort === 'date') return dateFor(a).localeCompare(dateFor(b));
        return a.name.localeCompare(b.name);
    });
    const selected = kids.find((k) => k.name === sel) || null;

    const go = (p: string) => {
        setPath(p);
        setSel(null);
        setFilter('');
        setHist((h) => [...h.slice(0, hi + 1), p]);
        setHi((i) => i + 1);
    };
    const back = () => {
        if (hi > 0) {
            setPath(hist[hi - 1]);
            setHi(hi - 1);
            setSel(null);
        }
    };
    const crumbs = path.split('\\').filter(Boolean);

    const activate = (n: FSNode) => {
        if (n.kind === 'text' && path.includes('Research')) unlock('researcher');
        if (n.kind === 'dir') go(fsJoin(path, n.name));
        else if (n.kind === 'link' && n.url) window.open(n.url, '_blank', 'noopener,noreferrer');
        else if (n.kind === 'app' && n.appKey) openApp(n.appKey);
        else if (n.kind === 'pdf') window.open('files/Aditya_Balaji_Resume.pdf', '_blank', 'noopener,noreferrer');
    };

    const quick: [string, string][] = [
        ['⭐ Quick access', 'C:\\ADITYA'],
        ['📁 Projects', 'C:\\ADITYA\\Projects'],
        ['👤 About', 'C:\\ADITYA\\About'],
        ['🎮 Games', 'C:\\ADITYA\\Games'],
        ['📄 Documents', 'C:\\ADITYA\\Documents'],
        ['⬇ Downloads', 'C:\\ADITYA\\Downloads'],
        ['💻 This PC', 'C:\\ADITYA'],
    ];

    return (
        <Window
            top={30}
            left={70}
            width={860}
            height={540}
            windowTitle="Explorer — This PC"
            windowBarIcon="myComputer"
            bottomLeftText={`${kids.length} item(s)${selected ? ` · ${selected.name}` : ''}`}
            closeWindow={props.onClose}
            onInteract={props.onInteract}
            minimizeWindow={props.onMinimize}
        >
            <div className="explorer-app w10">
                <div className="explorer-bar">
                    <button onClick={back}>←</button>
                    <button onClick={() => go(fsParent(path))}>↑</button>
                    <div className="explorer-addr">
                        {crumbs.map((c, i) => (
                            <span key={i}>
                                {i > 0 && ' › '}
                                <button onClick={() => go('C:\\' + crumbs.slice(1, i + 1).join('\\'))}>{c}</button>
                            </span>
                        ))}
                    </div>
                    <input className="explorer-search" placeholder={`Search ${node.name}`} value={filter} onChange={(e) => setFilter(e.target.value)} />
                </div>
                <div className="explorer-ribbon">
                    <div className="rib-group">
                        <button onClick={() => selected && activate(selected)} disabled={!selected}>▶ Open</button>
                        <button onClick={() => go('C:\\ADITYA')}>⌂ Home</button>
                    </div>
                    <div className="rib-group">
                        <span>Sort</span>
                        {(['name', 'type', 'date'] as const).map((sKey) => (
                            <button key={sKey} className={sort === sKey ? 'on' : ''} onClick={() => setSort(sKey)}>{sKey}</button>
                        ))}
                    </div>
                    <div className="rib-group">
                        <span>View</span>
                        <button className={view === 'details' ? 'on' : ''} onClick={() => setView('details')}>▤ Details</button>
                        <button className={view === 'icons' ? 'on' : ''} onClick={() => setView('icons')}>▦ Icons</button>
                        <button className={preview ? 'on' : ''} onClick={() => setPreview((v) => !v)}>▥ Preview</button>
                    </div>
                </div>
                <div className="explorer-body">
                    <div className="explorer-tree">
                        {quick.map(([label, p]) => (
                            <button key={label} className={path === p ? 'cur' : ''} onClick={() => go(p)}>{label}</button>
                        ))}
                    </div>
                    <div className={`explorer-details ${view}`}>
                        {view === 'details' && <div className="explorer-cols"><span>Name</span><span>Date modified</span><span>Type</span><span>Size</span></div>}
                        {kids.map((k) => (
                            <button
                                key={k.name}
                                className={`explorer-row${sel === k.name ? ' sel' : ''}`}
                                onClick={() => setSel(k.name)}
                                onDoubleClick={() => activate(k)}
                            >
                                <span>{iconFor(k)} {k.name}</span>
                                <span>{dateFor(k)}</span>
                                <span>{typeFor(k)}</span>
                                <span>{sizeFor(k)}</span>
                            </button>
                        ))}
                        {!kids.length && <small className="explorer-empty">No items match.</small>}
                    </div>
                    {preview && (
                        <div className="explorer-pane">
                            {selected ? (
                                <>
                                    <div className="pane-icon">{iconFor(selected)}</div>
                                    <b>{selected.name}</b>
                                    <small>{typeFor(selected)} · {sizeFor(selected)}</small>
                                    {selected.desc && <p>{selected.desc}</p>}
                                    {selected.kind === 'text' && <pre>{selected.content}</pre>}
                                    {selected.kind === 'link' && <button onClick={() => activate(selected)}>Open link ↗</button>}
                                    {(selected.kind === 'app' || selected.kind === 'pdf') && <button onClick={() => activate(selected)}>Open</button>}
                                </>
                            ) : (
                                <small className="pane-empty">Select an item to preview it.</small>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </Window>
    );
};

export default Explorer;
