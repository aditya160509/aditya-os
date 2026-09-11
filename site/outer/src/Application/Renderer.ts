import * as THREE from 'three';
import { CSS3DRenderer } from 'three/examples/jsm/renderers/CSS3DRenderer.js';
import Application from './Application';
import Sizes from './Utils/Sizes';
import Camera from './Camera/Camera';
// @ts-ignore
import screenVert from './Shaders/screen/vertex.glsl';
// @ts-ignore
import screenFrag from './Shaders/screen/fragment.glsl';
import Time from './Utils/Time';

export default class Renderer {
    application: Application;
    sizes: Sizes;
    scene: THREE.Scene;
    cssScene: THREE.Scene;
    time: Time;
    overlay: THREE.Mesh;
    overlayScene: THREE.Scene;
    camera: Camera;
    instance: THREE.WebGLRenderer;
    cssInstance: CSS3DRenderer;
    raiseExposure: boolean;
    uniforms: {
        [uniform: string]: THREE.IUniform<any>;
    };

    /**
     * A phone renders at devicePixelRatio 3, which is nine times the fragments
     * of ratio 1 for a screen where the difference is invisible, and MSAA on
     * top of that is pure cost. Both are dialled back on touch devices.
     */
    private lowPower() {
        return (
            window.matchMedia('(pointer: coarse)').matches ||
            window.innerWidth < 900
        );
    }

    private targetPixelRatio() {
        return Math.min(this.sizes.pixelRatio, this.lowPower() ? 1.25 : 2);
    }

    constructor() {
        this.application = new Application();
        this.time = this.application.time;
        this.sizes = this.application.sizes;
        this.scene = this.application.scene;
        this.cssScene = this.application.cssScene;
        this.overlayScene = this.application.overlayScene;
        this.camera = this.application.camera;

        this.setInstance();
    }

    setInstance() {
        const lowPower = this.lowPower();
        this.instance = new THREE.WebGLRenderer({
            antialias: !lowPower,
            alpha: true,
            powerPreference: lowPower ? 'low-power' : 'high-performance',
        });
        this.instance.outputEncoding = THREE.sRGBEncoding;
        this.instance.setSize(this.sizes.width, this.sizes.height);
        this.instance.setPixelRatio(this.targetPixelRatio());
        this.instance.setClearColor(0x000000, 0.0);
        this.instance.autoClear = false;

        this.instance.domElement.style.position = 'absolute';
        this.instance.domElement.style.zIndex = '1';
        this.instance.domElement.style.top = '0px';

        document.querySelector('#webgl')?.appendChild(this.instance.domElement);

        this.cssInstance = new CSS3DRenderer();
        this.cssInstance.setSize(this.sizes.width, this.sizes.height);
        this.cssInstance.domElement.style.position = 'absolute';
        this.cssInstance.domElement.style.top = '0px';

        document
            .querySelector('#css')
            ?.appendChild(this.cssInstance.domElement);

        this.uniforms = {
            u_time: { value: 1 },
        };

        this.overlay = new THREE.Mesh(
            new THREE.PlaneGeometry(10000, 10000),
            new THREE.ShaderMaterial({
                vertexShader: screenVert,
                fragmentShader: screenFrag,
                uniforms: this.uniforms,
                transparent: true,
                opacity: 0.12,
                depthTest: false,
                depthWrite: false,
            })
        );

        this.overlayScene.add(this.overlay);
    }

    resize() {
        this.instance.setSize(this.sizes.width, this.sizes.height);
        this.instance.setPixelRatio(this.targetPixelRatio());
        this.cssInstance.setSize(this.sizes.width, this.sizes.height);
    }

    update() {
        this.application.camera.instance.updateProjectionMatrix();
        if (this.uniforms) {
            this.uniforms.u_time.value = Math.sin(this.time.current * 0.01);
        }

        this.overlay.position.copy(this.camera.instance.position);

        this.instance.clear();
        this.instance.render(this.scene, this.camera.instance);
        this.instance.clearDepth();
        this.instance.render(this.overlayScene, this.camera.instance);
        this.cssInstance.render(this.cssScene, this.camera.instance);
    }

    destroy() {
        this.overlay.geometry.dispose();
        const overlayMaterial = this.overlay.material;
        if (Array.isArray(overlayMaterial)) {
            overlayMaterial.forEach((material) => material.dispose());
        } else {
            overlayMaterial.dispose();
        }
        this.overlayScene.remove(this.overlay);

        this.instance.dispose();
        this.instance.domElement.remove();
        this.cssInstance.domElement.remove();
    }
}
