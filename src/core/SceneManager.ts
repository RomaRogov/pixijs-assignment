import {Application, Container, Size} from 'pixi.js';
import {BaseScene} from "./BaseScene";

/**
 * SceneManager implementation to handle different gameplay scenes.
 * Helps with initialization, transitions, cleanup and ticker updates.
 */
export class SceneManager {
    private stage: Container;
    private app: Application;
    private currentScene: BaseScene | null = null;
    private scenes: Map<string, BaseScene>;

    private get currentScreenSize():Size {
        return { width: this.app.renderer.width, height: this.app.renderer.height};
    }

    constructor(app: Application, sceneList: BaseScene[]) {
        this.scenes = new Map(sceneList.map(scene => [scene.getName(), scene]));
        this.app = app;
        this.stage = app.stage;
        window.addEventListener('resize', () => {
            this.resize();
        });
    }

    registerScene(scene: BaseScene): void {
        this.scenes.set(scene.getName(), scene);
    }

    async changeScene(sceneName: string): Promise<void> {
        const scene = this.scenes.get(sceneName);

        if (scene === undefined) {
            console.error(`Scene "${sceneName}" not found!`);
            return;
        }

        if (this.currentScene) {
            // Hide current scene but initialize new one in parallel to minimize transition time
            await Promise.all([this.currentScene.hide(), scene.init(this.currentScreenSize)]);
            this.stage.removeChild(this.currentScene);
        } else {
            await scene.init(this.currentScreenSize);
        }

        this.currentScene = scene;
        this.stage.addChild(scene);
        this.resize();
        scene.show();
    }

    update(deltaTime: number): void {
        if (this.currentScene && this.currentScene.update) {
            this.currentScene.update(deltaTime);
        }
    }

    resize(): void {
        if (this.currentScene && this.currentScene.resize) {
            this.currentScene.resize(this.currentScreenSize);
        }
    }
}
