// Shared virtual filesystem — powers the Explorer window AND the Terminal.
// One source of truth: C:\ADITYA\...

export type FSNode = {
    name: string;
    kind: 'dir' | 'text' | 'link' | 'app' | 'pdf';
    children?: FSNode[];
    content?: string;
    url?: string;
    appKey?: string;
    desc?: string;
};

const T = (name: string, content: string, desc = ''): FSNode => ({ name, kind: 'text', content, desc });
const L = (name: string, url: string, desc = ''): FSNode => ({ name, kind: 'link', url, desc });
const A = (name: string, appKey: string, desc = ''): FSNode => ({ name, kind: 'app', appKey, desc });

export const FS_ROOT: FSNode = {
    name: 'ADITYA',
    kind: 'dir',
    children: [
        {
            name: 'Projects', kind: 'dir', children: [
                {
                    name: 'grade-central', kind: 'dir', desc: 'Academic workflow and grade intelligence', children: [
                        T('README.txt', 'GRADE CENTRAL\n==============\n\nAcademic workflow and grade intelligence dashboard.\nCoursework, deadlines and scores in one place — live data,\nclean visualizations, honest predictions.\n\nLive: https://grade-central.vercel.app/'),
                        L('demo.url', 'https://grade-central.vercel.app/', 'Live demo'),
                        T('stack.txt', 'TypeScript · React · Vercel\nLive data · visualizations · prediction model'),
                    ],
                },
                {
                    name: 'phenosync', kind: 'dir', desc: 'Climate-risk research pipeline', children: [
                        T('README.txt', 'PHENOSYNC\n=========\n\nClimate-risk pipeline over 4 public datasets.\nQuantified 4.6 days/yr phenology shift; modeled $B crop\nexposure. Sole author — Oxford Said Challenge.\n\nRepo: https://github.com/aditya160509/phenosync'),
                        L('repo.url', 'https://github.com/aditya160509/phenosync', 'GitHub repo'),
                    ],
                },
                {
                    name: 'study-notes', kind: 'dir', desc: 'Open structured learning archive', children: [
                        T('README.txt', 'STUDY NOTES\n============\n\nAn open, structured learning archive — math, physics,\nCS and quant notes, documented in the open.\n\nRepo: https://github.com/aditya160509/study-notes'),
                        L('repo.url', 'https://github.com/aditya160509/study-notes', 'GitHub repo'),
                    ],
                },
                {
                    name: 'nexus', kind: 'dir', desc: 'Agent-based market simulator', children: [
                        T('README.txt', 'NEXUS EXCHANGE\n==============\n\nAgent-based market simulator with 9 trader types.\n10,200 Monte Carlo runs; reproduced 9 real-market\npatterns; independently confirmed the GASI threshold.'),
                    ],
                },
                {
                    name: 'atlas-quant360', kind: 'dir', desc: 'Quant research platform', children: [
                        T('README.txt', 'ATLAS / QUANT360\n================\n\nQuant research platform used live for investment\nresearch. Free data only; point-in-time correct,\nno survivorship bias.'),
                    ],
                },
                {
                    name: 'aditya-os', kind: 'dir', desc: 'This workstation', children: [
                        T('README.txt', 'ADITYA-OS\n=========\n\nThis interactive workstation: 3D desk, working desktop\nOS, paper-trading terminal, games and apps.\n\nStack: React · Three.js · TypeScript · Vela charts'),
                        T('colophon.txt', 'Colophon\n--------\n3D shell reskinned from an open reference scene.\nCharts: lightweight-charts + OpenCharts indicator math.\nChess: lichess chessground (GPL-3) + chess.js (MIT).\nMinesweeper: nickarocho. Solitaire: scarolan/klondike.\nTetris + Pong: straker basic-html-games (CC0).\nWordle: modem7/react-wordle (MIT).\nTerminal config: ghostty-config. Assistant: local, no model.\nDOS games: js-dos + DOSBox. Radio: radio-browser.info.'),
                    ],
                },
            ],
        },
        {
            name: 'About', kind: 'dir', children: [
                T('bio.txt', 'Aditya Balaji — builder, researcher, student.\nWorks across software, markets, AI and science.\nLearns difficult material when a real problem requires it;\nbuilds tools instead of stopping at ideas.'),
                T('now.txt', 'NOW\n---\nBuilding: AdityaOS workstation + markets terminal\nResearching: investor attention thresholds (GASI)\nReading: market microstructure, behavioral finance'),
                T('skills.txt', 'Python · TypeScript · React · Three.js · Node.js\nPandas · Monte Carlo · Fama-MacBeth panels\nGit · Vercel · WebGL · js-dos emulation'),
                T('contact.vcf', 'BEGIN:VCARD\nFN:Aditya Balaji\nEMAIL:aditya160509@gmail.com\nURL:https://github.com/aditya160509\nURL:https://www.linkedin.com/in/aditya-balaji-50375237a/\nEND:VCARD'),
            ],
        },
        {
            name: 'Games', kind: 'dir', desc: 'Double-click to play', children: [
                A('Oregon Trail', 'trail', 'DOS original'),
                A('Doom', 'doom', 'DOS original'),
                A('Digger', 'digger', 'DOS classic'),
                A('Scrabble', 'scrabble', 'Built-in'),
                A('Aditya Wordle', 'henordle', 'Daily word'),
                A('Minesweeper', 'minesweeper', 'Classic 9x9'),
                A('Snake', 'snake', 'Arcade'),
                A('2048', 'game2048', 'Puzzle'),
                A('Pong', 'pong', 'Vs AI'),
                A('Tetris', 'tetris', 'Stacker'),
                A('Chess', 'chess', 'Full rules (chess.js)'),
                A('Solitaire', 'solitaire', 'Klondike'),
            ],
        },
        {
            name: 'Documents', kind: 'dir', desc: 'Papers, resume and reference notes', children: [
                { name: 'resume.pdf', kind: 'pdf', desc: 'Aditya Balaji — resume (PDF)' },
                {
                    name: 'Research', kind: 'dir', desc: 'Papers and reports', children: [
                        T('GASI.txt', 'GLOBAL ATTENTION SATURATION INDEX\n=================================\nBorsa Istanbul Review (Q1) — peer reviewed.\n\n22 international equity markets. Lewbel IV identification.\nStructural threshold gamma* = 1.5625, Hansen set [1.14, 2.50].\nDriscoll-Kraay standard errors throughout.\n"Silence Signature": volatility suppression at peak attention,\nconfirmed in 14/22 markets under synthetic-control falsification.'),
                        T('FPL-BOG.txt', 'BEHAVIORAL OWNERSHIP GAP\n========================\nJournal of Sports Economics (Q1) — under review.\n\nFama-MacBeth panel over 380 gameweeks, t = -57.20.\nGBP 137.1M annual welfare cost from information architecture.\nFrozen out-of-sample model: 105 profitable weeks of 105.'),
                        T('PhenoSync.txt', 'PHENOSYNC\n=========\nGBIF + NASA MODIS + NOAA GHCND + FAOSTAT.\nOLS shift 4.57 days/year (R2 = 0.83, p = 0.0003).\nSeven-framework robustness battery.\nPMI-severity crop exposure -> value-at-risk.\nSole author. Oxford Said Climate Challenge.'),
                        T('IPQ-9980.txt', 'CAMBRIDGE IPQ 9980\n==================\n4,982 words: does high-frequency trading destabilise\nmarkets under stress? Full independent research\nqualification — study design, empirical analysis,\nresearch log and bibliography, graded by Cambridge.'),
                        T('NTK-exposition.txt', 'WHY OVERPARAMETERISED NETWORKS GENERALISE\n=========================================\nNeural Tangent Kernel derived from A-level Further Maths:\nmatrices, eigenvalues, diagonalisation, Taylor series, ODEs.\nNine sections; spectral bias as the resolution; a fully\nworked two-neuron example computed line by line.'),
                    ],
                },
                {
                    name: 'Notes', kind: 'dir', children: [
                        T('reading.txt', 'READING\n-------\nMarket microstructure · behavioural finance\nAdvances in Financial Machine Learning\nCausal inference: DiD, RD, IV, event studies'),
                        T('stack.txt', 'STACK\n-----\nPython · TypeScript · SQL · R\nFastAPI · Next.js · PostgreSQL · pgvector\nLangGraph · Prometheus · Numba · Three.js'),
                    ],
                },
            ],
        },
        {
            name: 'Downloads', kind: 'dir', children: [
                L('future-lab.url', 'https://future-lab-terminal.vercel.app', 'Simulated market platform'),
                L('grade-central.url', 'https://grade-central.vercel.app/', 'Live demo'),
                L('github.url', 'https://github.com/aditya160509', 'GitHub profile'),
                L('linkedin.url', 'https://www.linkedin.com/in/aditya-balaji-50375237a/', 'LinkedIn'),
            ],
        },
        { name: 'resume.pdf', kind: 'pdf', desc: 'Aditya Balaji — resume (PDF)' },
    ],
};

export function fsResolve(path: string): FSNode | null {
    const parts = path.replace(/\\/g, '/').split('/').filter((p) => p && p !== '.' && p.toUpperCase() !== 'C:');
    if (parts.length === 0 || (parts.length === 1 && parts[0].toUpperCase() === 'ADITYA')) return FS_ROOT;
    let node: FSNode = FS_ROOT;
    // allow paths starting with ADITYA
    const start = parts[0].toUpperCase() === 'ADITYA' ? 1 : 0;
    for (let i = start; i < parts.length; i++) {
        if (node.kind !== 'dir' || !node.children) return null;
        const next = node.children.find((c) => c.name.toLowerCase() === parts[i].toLowerCase());
        if (!next) return null;
        node = next;
    }
    return node;
}

export function fsParent(path: string): string {
    const p = path.replace(/\\/g, '/').replace(/\/$/, '');
    const i = p.lastIndexOf('/');
    if (i <= 0) return 'C:\\ADITYA';
    return 'C:' + p.slice(0, i).replace(/^C:/i, '');
}

export function fsJoin(cwd: string, rel: string): string {
    if (/^[A-Za-z]:\\/i.test(rel) || rel.startsWith('C:')) return 'C:' + rel.replace(/^C:/i, '').replace(/\//g, '\\');
    if (rel === '..') return fsParent(cwd);
    if (rel === '.' || rel === '') return cwd;
    return (cwd.replace(/\\$/, '') + '\\' + rel).replace(/\//g, '\\');
}

export function openApp(key: string) {
    window.dispatchEvent(new CustomEvent('aditya-open-app', { detail: { key } }));
}
