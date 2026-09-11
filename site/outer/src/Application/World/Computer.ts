import * as THREE from 'three';
import Application from '../Application';
import BakedModel from '../Utils/BakedModel';
import Resources from '../Utils/Resources';

export default class Computer {
    application: Application;
    scene: THREE.Scene;
    resources: Resources;
    bakedModel: BakedModel;

    constructor() {
        this.application = new Application();
        this.scene = this.application.scene;
        this.resources = this.application.resources;

        this.bakeModel();
        this.removeLegacyKeyboard();
        this.setModel();
    }

    bakeModel() {
        this.bakedModel = new BakedModel(
            this.resources.items.gltfModel.computerSetupModel,
            this.resources.items.texture.computerSetupTexture,
            900
        );
    }

    private removeLegacyKeyboard() {
        const model = this.bakedModel.getModel();
        const keyboard = model.getObjectByName('keyboard');
        if (!keyboard) return;

        // Keep the rest of the baked computer model unchanged, but remove the
        // original keyboard so the replacement does not z-fight or overlap it.
        keyboard.parent?.remove(keyboard);
    }

    setModel() {
        this.scene.add(this.bakedModel.getModel());
    }
}
