import React, { useEffect, useRef, useState } from 'react';
import Window from '../os/Window';

export interface RadioProps extends WindowAppProps {}

type Track = {
    name: string;
    artist: string;
    url: string;
    live?: boolean;
};

const TRACKS: Track[] = [
    {
        name: 'Mujhse Mohabbat Ka Izhaar Karta',
        artist: 'Satrang Music Official',
        url: 'audio/radio/1.mp3',
    },
    {
        name: 'Night Build',
        artist: 'Aditya FM',
        url: 'audio/radio/2.mp3',
    },
    {
        name: 'Deep Work',
        artist: 'Aditya FM',
        url: 'audio/radio/3.mp3',
    },
];

const REMOTE_URL =
    'https://de1.api.radio-browser.info/json/stations/topvote/12';
const BACKDROP_URL = '/desktop/assets/radio-saloon/bg.avif';
const LOGO_URL = '/desktop/assets/radio-saloon/logo.svg';
const COVER_URL = '/desktop/assets/radio-saloon/cover.jpg';

const formatTime = (seconds: number) => {
    if (!Number.isFinite(seconds) || seconds <= 0) return '0:00';
    const minutes = Math.floor(seconds / 60);
    const remaining = Math.floor(seconds % 60)
        .toString()
        .padStart(2, '0');
    return `${minutes}:${remaining}`;
};

const Radio: React.FC<RadioProps> = (props) => {
    const audio = useRef<HTMLAudioElement>(null);
    const [tracks, setTracks] = useState<Track[]>(TRACKS);
    const [current, setCurrent] = useState(0);
    const [playing, setPlaying] = useState(false);
    const [volume] = useState(0.7);
    const [elapsed, setElapsed] = useState(0);
    const [duration, setDuration] = useState(0);
    const [online, setOnline] = useState(36);
    const [clock, setClock] = useState('');

    useEffect(() => {
        const updateClock = () =>
            setClock(
                new Intl.DateTimeFormat(undefined, {
                    hour: 'numeric',
                    minute: '2-digit',
                }).format(new Date())
            );
        updateClock();
        const timer = window.setInterval(updateClock, 30000);
        return () => window.clearInterval(timer);
    }, []);

    useEffect(() => {
        fetch(REMOTE_URL)
            .then((response) => response.json())
            .then((list: any[]) => {
                const live = list
                    .filter((station) => station.url_resolved)
                    .slice(0, 9)
                    .map((station) => ({
                        name: station.name.slice(0, 34),
                        artist: `${station.country || 'WEB'} · LIVE`,
                        url: station.url_resolved,
                        live: true,
                    }));
                if (live.length) {
                    setTracks([...TRACKS, ...live]);
                    setOnline(36 + live.length);
                }
            })
            .catch(() => undefined);
    }, []);

    useEffect(() => {
        if (audio.current) audio.current.volume = volume;
    }, [volume]);

    const playTrack = (index: number) => {
        setCurrent(index);
        setPlaying(true);
        window.setTimeout(() => {
            const node = audio.current;
            if (!node) return;
            node.load();
            node.play().catch(() => setPlaying(false));
        }, 60);
    };

    const toggle = () => {
        const node = audio.current;
        if (!node) return;
        if (playing) {
            node.pause();
            setPlaying(false);
        } else {
            node.play()
                .then(() => setPlaying(true))
                .catch(() => setPlaying(false));
        }
    };

    const seek = (event: React.ChangeEvent<HTMLInputElement>) => {
        const nextTime = Number(event.target.value);
        if (audio.current) audio.current.currentTime = nextTime;
        setElapsed(nextTime);
    };

    const previous = () =>
        playTrack((current - 1 + tracks.length) % tracks.length);
    const next = () => playTrack((current + 1) % tracks.length);

    const track = tracks[current] || TRACKS[0];

    return (
        <Window
            top={36}
            left={86}
            width={760}
            height={560}
            windowTitle="Radio — Deluxe Saloon"
            windowBarIcon="volumeOn"
            windowBarColor="#17191d"
            bottomLeftText={`DELUXE SALOON · ${online} ONLINE`}
            closeWindow={props.onClose}
            onInteract={props.onInteract}
            minimizeWindow={props.onMinimize}
        >
            <div
                className="radio-saloon-app"
                style={{ '--saloon-backdrop': `url(${BACKDROP_URL})` } as React.CSSProperties}
            >
                <audio
                    ref={audio}
                    src={track.url}
                    onPlay={() => setPlaying(true)}
                    onPause={() => setPlaying(false)}
                    onEnded={next}
                    onTimeUpdate={(event) => setElapsed(event.currentTarget.currentTime)}
                    onLoadedMetadata={(event) => setDuration(event.currentTarget.duration)}
                />

                <header className="saloon-topbar">
                    <span className="saloon-clock">{clock}</span>
                    <div className="saloon-online" aria-label={`${online} listeners online`}>
                        <span className="saloon-online-pulse" />
                        <strong>{online}</strong>
                        <span>online</span>
                    </div>
                    <nav className="saloon-links" aria-label="Music services">
                        <a
                            href="https://open.spotify.com/playlist/2AVjI8Z57bqMJVtU3V9X1Q"
                            target="_blank"
                            rel="noreferrer"
                        >
                            <span className="saloon-service-icon">●</span> Spotify <span>↗</span>
                        </a>
                        <a
                            href="https://music.youtube.com/playlist?list=PLTJ1PnzCWyFw"
                            target="_blank"
                            rel="noreferrer"
                        >
                            <span className="saloon-service-icon">▷</span> YT Music <span>↗</span>
                        </a>
                    </nav>
                </header>

                <main className="saloon-stage">
                    <img className="saloon-logo" src={LOGO_URL} alt="Deluxe Saloon" />
                </main>

                <section className="saloon-player" aria-label="Radio player">
                    <img className="saloon-cover" src={COVER_URL} alt={`${track.name} artwork`} />
                    <div className="saloon-track-details">
                        <div className="saloon-track-name" title={track.name}>
                            {track.name}
                        </div>
                        <div className="saloon-track-artist">
                            {track.artist}
                            {track.live && <span className="saloon-live">LIVE</span>}
                        </div>
                        <input
                            className="saloon-progress"
                            type="range"
                            min="0"
                            max={duration || 0}
                            step="0.1"
                            value={Math.min(elapsed, duration || 0)}
                            onChange={seek}
                            aria-label="Seek"
                        />
                        <div className="saloon-time">
                            {formatTime(elapsed)} <span>/</span> {formatTime(duration)}
                        </div>
                    </div>
                    <div className="saloon-controls">
                        <button type="button" onClick={previous} aria-label="Previous track" title="Previous track">
                            |◀
                        </button>
                        <button
                            type="button"
                            className="saloon-play"
                            onClick={toggle}
                            aria-label={playing ? 'Pause' : 'Play'}
                            title={playing ? 'Pause' : 'Play'}
                        >
                            {playing ? 'Ⅱ' : '▶'}
                        </button>
                        <button type="button" onClick={next} aria-label="Next track" title="Next track">
                            ▶|
                        </button>
                    </div>
                </section>
            </div>
        </Window>
    );
};

export default Radio;
