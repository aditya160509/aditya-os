import * as THREE from 'three';
import { mergeBufferGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import Application from '../Application';
import Resources from '../Utils/Resources';

/**
 * Replacement keyboard built from the uploaded TypeFast GLB.
 *
 * The source asset contains one mesh per key (85 meshes in the default scene).
 * Rendering those independently would add ~85 draw calls to an otherwise very
 * light baked scene, so we collapse them into two static meshes: keycaps and
 * chassis. The transform below was derived from the exact bounding box of the
 * original `keyboard` mesh in computer_setup.glb, so the replacement occupies
 * the same desk footprint instead of relying on hand-tuned camera guesses.
 */
export default class Keyboard {
    application: Application;
    scene: THREE.Scene;
    resources: Resources;
    group: THREE.Group;

    private readonly fitScale = new THREE.Vector3(
        501.6169874603238,
        349.692599925665,
        452.1155921203554
    );

    private readonly fitPosition = new THREE.Vector3(
        -201.34579687361372,
        -378.2705569948794,
        1280.6009364367185
    );

    constructor() {
        this.application = new Application();
        this.scene = this.application.scene;
        this.resources = this.application.resources;
        this.group = new THREE.Group();
        this.group.name = 'typefast-keyboard';

        this.build();
    }

    private build() {
        const gltf = this.resources.items.gltfModel.typefastKeyboardModel;
        if (!gltf?.scene) return;

        gltf.scene.updateMatrixWorld(true);

        const keyGeometries: THREE.BufferGeometry[] = [];
        const chassisGeometries: THREE.BufferGeometry[] = [];

        gltf.scene.traverse((child) => {
            if (!(child instanceof THREE.Mesh)) return;

            const geometry = child.geometry.clone();
            geometry.applyMatrix4(child.matrixWorld);

            // The uploaded model carries UVs but no textures/materials. Dropping
            // unused UV buffers saves memory before the merged geometry is kept.
            geometry.deleteAttribute('uv');

            if (child.name === 'static') chassisGeometries.push(geometry);
            else keyGeometries.push(geometry);
        });

        const keys = this.mergeAndBuild(
            keyGeometries,
            new THREE.MeshBasicMaterial({ color: 0x25272b }),
            'typefast-keycaps'
        );
        const chassis = this.mergeAndBuild(
            chassisGeometries,
            new THREE.MeshBasicMaterial({ color: 0x111216 }),
            'typefast-keyboard-chassis'
        );

        if (keys) this.group.add(keys);
        if (chassis) this.group.add(chassis);

        this.group.scale.copy(this.fitScale);
        this.group.position.copy(this.fitPosition);
        this.group.updateMatrix();
        this.group.matrixAutoUpdate = false;

        this.scene.add(this.group);

        // The merged geometry owns its own buffers. Release references to the
        // decompressed 85-mesh source model so it can be collected after setup.
        gltf.scene.traverse((child) => {
            if (child instanceof THREE.Mesh) child.geometry.dispose();
        });
        delete this.resources.items.gltfModel.typefastKeyboardModel;
    }

    private mergeAndBuild(
        geometries: THREE.BufferGeometry[],
        material: THREE.Material,
        name: string
    ): THREE.Mesh | null {
        if (geometries.length === 0) {
            material.dispose();
            return null;
        }

        const merged = mergeBufferGeometries(geometries, false);
        geometries.forEach((geometry) => geometry.dispose());

        if (!merged) {
            material.dispose();
            return null;
        }

        merged.computeBoundingBox();
        merged.computeBoundingSphere();

        const mesh = new THREE.Mesh(merged, material);
        mesh.name = name;
        mesh.matrixAutoUpdate = false;
        mesh.updateMatrix();
        return mesh;
    }
}
