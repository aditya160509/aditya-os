import React from 'react';
import Window from '../os/Window';

export interface TaskLogProps extends WindowAppProps {}

const ENTRIES: [string, string][] = [
    ['Video wallpaper', 'Wallspace MP4 looping behind desktop · speed + shade in Settings'],
    ['Brand icons', '15 esvg.org SVGs + Node + Cloud · Chrome Safari Python OpenAI Claude Spotify…'],
    ['Markets engine', 'Paper terminal: symbols, timeframes, volume, drawings, order ticket, live P&L'],
    ['Vela charts', 'LuxAlgo Vela WebGL2 engine · 70+ indicators · Pine EMA/RSI · drawings persist'],
    ['Claude session', 't3.chat-style thread: sidebar history, model picker, reasoning, diffs, artifacts'],
    ['Code Studio', 'VS Code portfolio workspace · research pages + terminal · touch ready'],
    ['Spotify', 'Real embed + playlist switcher + Spicetify themes'],
    ['Radio', 'Radio Browser live stations + local tapes · Winamp-style deck'],
    ['Paint', 'jspaint pattern: tools, palette, undo, PNG export'],
    ['Notepad', 'Local notes · autosave · multi-file'],
    ['Minesweeper', 'Classic 9×9 · flags · timer · win/lose'],
    ['Calculator', 'Safe parser · no eval'],
    ['Wordle', 'Daily word · correct duplicate scoring · streaks · share grid'],
    ['Sounds', 'Window open/close/minimize + terminal keys · honors Sound settings'],
    ['Content', 'All Henry → Aditya · your GitHub, LinkedIn, projects, email everywhere'],
];

const TaskLog: React.FC<TaskLogProps> = (props) => (
    <Window
        top={50}
        left={160}
        width={560}
        height={520}
        windowTitle="Task Log — build history"
        windowBarIcon="credits"
        bottomLeftText={`${ENTRIES.length} milestones shipped`}
        closeWindow={props.onClose}
        onInteract={props.onInteract}
        minimizeWindow={props.onMinimize}
    >
        <div className="tasklog-app">
            {ENTRIES.map(([t, d], i) => (
                <div key={t} className="tasklog-row">
                    <b>{String(i + 1).padStart(2, '0')}</b>
                    <div>
                        <strong>{t}</strong>
                        <small>{d}</small>
                    </div>
                    <span>✓</span>
                </div>
            ))}
        </div>
    </Window>
);

export default TaskLog;
