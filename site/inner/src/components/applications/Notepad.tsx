import React, { useEffect, useState } from 'react';
import Window from '../os/Window';

export interface NotepadProps extends WindowAppProps {}

// Pattern copied from React95-style notepads — textarea + localStorage.
type Note = { id: number; title: string; body: string };

const load = (): Note[] => {
    try {
        return JSON.parse(localStorage.getItem('aditya-notes') || 'null') || [
            { id: 1, title: 'todo.txt', body: 'Welcome to Notepad.\n\n- Ship portfolio\n- Write research notes\n- Play Doom' },
        ];
    } catch {
        return [];
    }
};

const Notepad: React.FC<NotepadProps> = (props) => {
    const [notes, setNotes] = useState<Note[]>(load);
    const [active, setActive] = useState(0);
    const note = notes[active];

    useEffect(() => {
        localStorage.setItem('aditya-notes', JSON.stringify(notes));
    }, [notes]);

    const add = () =>
        setNotes((n) => {
            const next = [...n, { id: Date.now(), title: `note-${n.length + 1}.txt`, body: '' }];
            setActive(next.length - 1);
            return next;
        });
    const remove = () => {
        if (!notes.length) return;
        setNotes((n) => n.filter((_, i) => i !== active));
        setActive((a) => Math.max(0, a - 1));
    };

    return (
        <Window
            top={70}
            left={140}
            width={620}
            height={500}
            windowTitle={`Notepad — ${note?.title || 'empty'}`}
            windowBarIcon="windowExplorerIcon"
            bottomLeftText={`${note?.body.length || 0} chars · saved locally`}
            closeWindow={props.onClose}
            onInteract={props.onInteract}
            minimizeWindow={props.onMinimize}
        >
            <div className="notepad-app">
                <div className="notepad-menu">
                    <button onClick={add}>+ new</button>
                    <button onClick={remove}>− delete</button>
                </div>
                <div className="notepad-body">
                    <div className="notepad-list">
                        {notes.map((n, i) => (
                            <button key={n.id} className={i === active ? 'active' : ''} onClick={() => setActive(i)}>
                                {n.title}
                            </button>
                        ))}
                    </div>
                    <textarea
                        value={note?.body || ''}
                        placeholder="Start typing…"
                        onChange={(e) =>
                            setNotes((ns) => ns.map((n, i) => (i === active ? { ...n, body: e.target.value } : n)))
                        }
                    />
                </div>
            </div>
        </Window>
    );
};

export default Notepad;
