import UIEventBus from '../UI/EventBus';
import EventEmitter from './EventEmitter';

export default class Time extends EventEmitter {
    start: number;
    current: number;
    elapsed: number;
    delta: number;
    paused: boolean;
    frameInterval: number;
    lastFrame: number;

    constructor() {
        super();

        // Setup
        this.start = Date.now();
        this.current = this.start;
        this.elapsed = 0;
        this.delta = 16;
        this.paused = false;
        this.lastFrame = 0;

        // A phone GPU spends most of its budget on fragments it does not need
        // at 60fps for a desk that barely moves; 30 is not perceptibly worse
        // here and roughly halves the work.
        const coarse = window.matchMedia('(pointer: coarse)').matches;
        this.frameInterval = coarse || window.innerWidth < 900 ? 1000 / 30 : 0;

        // Nothing is on screen while the tab is hidden, so stop drawing.
        document.addEventListener('visibilitychange', () => {
            this.paused = document.hidden;
            if (!this.paused) {
                this.current = Date.now();
                window.requestAnimationFrame(() => this.tick());
            }
        });

        window.requestAnimationFrame(() => {
            this.tick();
        });

        UIEventBus.on('loadingScreenDone', () => {
            this.start = Date.now();
        });
    }

    tick() {
        if (this.paused) return;

        const currentTime = Date.now();

        if (this.frameInterval && currentTime - this.lastFrame < this.frameInterval) {
            window.requestAnimationFrame(() => this.tick());
            return;
        }
        this.lastFrame = currentTime;

        this.delta = currentTime - this.current;
        this.current = currentTime;
        this.elapsed = this.current - this.start;

        this.trigger('tick');

        window.requestAnimationFrame(() => {
            this.tick();
        });
    }
}
