import React, { useEffect, useRef, useState } from 'react';
import Window from '../os/Window';

export interface RadioProps extends WindowAppProps {}

type Station = { name: string; url: string; live?: boolean };

const TAPES: Station[] = [
    { name: 'Tape 01 — Desk Session', url: 'audio/radio/1.mp3' },
    { name: 'Tape 02 — Night Build', url: 'audio/radio/2.mp3' },
    { name: 'Tape 03 — Deep Work', url: 'audio/radio/3.mp3' },
];

// Pattern copied from the open Radio Browser project
// (radio-browser.info — 50k+ community stations, no key needed).
const REMOTE_URL =
    'https://de1.api.radio-browser.info/json/stations/topvote/12';

const Radio: React.FC<RadioProps> = (props) => {
    const audio = useRef<HTMLAudioElement>(null);
    const [stations, setStations] = useState<Station[]>(TAPES);
    const [current, setCurrent] = useState(0);
    const [playing, setPlaying] = useState(false);
    const [volume, setVolume] = useState(0.7);
    const [status, setStatus] = useState('TAPES LOADED');

    useEffect(() => {
        fetch(REMOTE_URL)
            .then((r) => r.json())
            .then((list: any[]) => {
                const live = list
                    .filter((s) => s.url_resolved)
                    .slice(0, 9)
                    .map((s) => ({
                        name: `${s.name.slice(0, 26)} · ${s.country || 'WEB'}`,
                        url: s.url_resolved,
                        live: true,
                    }));
                if (live.length) {
                    setStations([...TAPES, ...live]);
                    setStatus('LIVE STATIONS + TAPES');
                }
            })
            .catch(() => setStatus('OFFLINE — TAPES ONLY'));
    }, []);

    useEffect(() => {
        if (audio.current) audio.current.volume = volume;
    }, [volume]);

    const playStation = (i: number) => {
        setCurrent(i);
        setPlaying(true);
        setTimeout(() => audio.current?.play().catch(() => {}), 50);
    };
    const toggle = () => {
        if (!audio.current) return;
        if (playing) audio.current.pause();
        else audio.current.play().catch(() => {});
        setPlaying(!playing);
    };

    return (
        <Window
            top={60}
            left={120}
            width={560}
            height={480}
            windowTitle="Radio — Aditya FM"
            windowBarIcon="volumeOn"
            windowBarColor="#101418"
            bottomLeftText={status}
            closeWindow={props.onClose}
            onInteract={props.onInteract}
            minimizeWindow={props.onMinimize}
        >
            <div className="radio-app">
                <audio
                    ref={audio}
                    src={stations[current]?.url}
                    onEnded={() => playStation((current + 1) % stations.length)}
                />
                <div className="radio-lcd">
                    <div className="radio-freq">
                        {playing ? '▶' : '❚❚'} {stations[current]?.name}
                        {stations[current]?.live && (
                            <span className="live-badge">LIVE</span>
                        )}
                    </div>
                    <div className="radio-eq">
                        {Array.from({ length: 24 }).map((_, i) => (
                            <span
                                key={i}
                                className={playing ? 'bar on' : 'bar'}
                                style={{ animationDelay: `${i * 0.09}s` }}
                            />
                        ))}
                    </div>
                </div>
                <div className="radio-controls">
                    <button onClick={toggle}>{playing ? '⏸' : '▶'}</button>
                    <button
                        onClick={() =>
                            playStation(
                                (current - 1 + stations.length) % stations.length
                            )
                        }
                    >
                        ⏮
                    </button>
                    <button
                        onClick={() => playStation((current + 1) % stations.length)}
                    >
                        ⏭
                    </button>
                    <label>
                        VOL
                        <input
                            type="range"
                            min={0}
                            max={1}
                            step={0.05}
                            value={volume}
                            onChange={(e) => setVolume(Number(e.target.value))}
                        />
                    </label>
                </div>
                <div className="radio-presets">
                    {stations.map((s, i) => (
                        <button
                            key={i}
                            className={i === current ? 'active' : ''}
                            onClick={() => playStation(i)}
                        >
                            {i + 1}. {s.name}
                        </button>
                    ))}
                </div>
            </div>
        </Window>
    );
};

export default Radio;
