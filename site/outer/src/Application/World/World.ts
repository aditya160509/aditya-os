import * as THREE from 'three';
import Application from '../Application';
import Resources from '../Utils/Resources';
import ComputerSetup from './Computer';
import Keyboard from './Keyboard';
import MonitorScreen from './MonitorScreen';
import Environment from './Environment';
import Decor from './Decor';
import CoffeeSteam from './CoffeeSteam';
import Cursor from './Cursor';
import Hitboxes from './Hitboxes';
import AudioManager from '../Audio/AudioManager';

export default class World {
    application: Application;
    scene: THREE.Scene;
    resources: Resources;

    environment: Environment;
    decor: Decor;
    computerSetup: ComputerSetup;
    keyboard: Keyboard;
    monitorScreen: MonitorScreen;
    coffeeSteam: CoffeeSteam;
    cursor: Cursor;
    audioManager: AudioManager;

    constructor() {
        this.application = new Application();
        this.scene = this.application.scene;
        this.resources = this.application.resources;

        this.resources.on('ready', () => {
            this.environment = new Environment();
            this.decor = new Decor();
            this.computerSetup = new ComputerSetup();
            this.keyboard = new Keyboard();
            this.monitorScreen = new MonitorScreen();
            this.coffeeSteam = new CoffeeSteam();
            this.audioManager = new AudioManager();
            // const hb = new Hitboxes();
            // this.cursor = new Cursor();
        });
    }

    update() {
        if (this.monitorScreen) this.monitorScreen.update();
        if (this.environment) this.environment.update();
        if (this.coffeeSteam) this.coffeeSteam.update();
        if (this.audioManager) this.audioManager.update();
    }
}
