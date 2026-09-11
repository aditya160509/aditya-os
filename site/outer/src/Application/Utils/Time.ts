import EventEmitter from './EventEmitter';

export default class Time extends EventEmitter {
    start: number;
    current: number;
    elapsed: number;
    delta: number;
    paused: boolean;
    frameInterval: number;
    lastFrame: number;
    animationFrameId: number | null;
    destroyed: boolean;
    visibilityHandler: () => void;
    loadingScreenDoneHandler: () => void;

    constructor() {
        super();

        this.start = Date.now();
        this.current = this.start;
        this.elapsed = 0;
        this.delta = 16;
        this.paused = false;
        this.lastFrame = 0;
        this.animationFrameId = null;
        this.destroyed = false;

        // A phone GPU spends most of its budget on fragments it does not need
        // at 60fps for a desk that barely moves; 30 is not perceptibly worse
        // here and roughly halves the work.
        const coarse = window.matchMedia('(pointer: coarse)').matches;
        this.frameInterval = coarse || window.innerWidth < 900 ? 1000 / 30 : 0;

        this.visibilityHandler = () => {
            this.paused = document.hidden;

            if (this.paused) {
                if (this.animationFrameId !== null) {
                    window.cancelAnimationFrame(this.animationFrameId);
                    this.animationFrameId = null;
                }
                return;
            }

            this.current = Date.now();
            this.scheduleNextFrame();
        };

        this.loadingScreenDoneHandler = () => {
            this.start = Date.now();
        };

        document.addEventListener('visibilitychange', this.visibilityHandler);
        document.addEventListener(
            'loadingScreenDone',
            this.loadingScreenDoneHandler
        );

        this.scheduleNextFrame();
    }

    private scheduleNextFrame() {
        if (this.destroyed || this.paused || this.animationFrameId !== null) return;

        this.animationFrameId = window.requestAnimationFrame(() => {
            this.animationFrameId = null;
            this.tick();
        });
    }

    tick() {
        if (this.destroyed || this.paused) return;

        const currentTime = Date.now();

        if (this.frameInterval && currentTime - this.lastFrame < this.frameInterval) {
            this.scheduleNextFrame();
            return;
        }
        this.lastFrame = currentTime;

        this.delta = currentTime - this.current;
        this.current = currentTime;
        this.elapsed = this.current - this.start;

        this.trigger('tick');
        this.scheduleNextFrame();
    }

    destroy() {
        if (this.destroyed) return;
        this.destroyed = true;
        this.paused = true;

        if (this.animationFrameId !== null) {
            window.cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = null;
        }

        document.removeEventListener('visibilitychange', this.visibilityHandler);
        document.removeEventListener(
            'loadingScreenDone',
            this.loadingScreenDoneHandler
        );

        this.off('tick');
    }
}
