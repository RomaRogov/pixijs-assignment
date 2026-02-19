import { Assets, Application as PixiApplication } from 'pixi.js';
import { SceneManager } from '../core/SceneManager';
import { MainMenuScene } from '../scenes/MainMenuScene';
import { AceOfShadowsScene } from '../scenes/AceOfShadowsScene';
import { MagicWordsScene } from '../scenes/MagicWordsScene';
import { PhoenixFlameScene } from '../scenes/PhoenixFlameScene';
import { FpsCounter } from '../ui/FpsCounter';

/**
 * Entry point for PIXI.Application initialization
 */
export class Application {
    private app!: PixiApplication;
    private sceneManager!: SceneManager;
    private fpsCounter!: FpsCounter;

    async init(): Promise<void> {
        // Initialize PIXI application
        this.app = new PixiApplication();

        await this.app.init({
            background: '#1a1a1a',
            resizeTo: window,
            resolution: window.devicePixelRatio || 1,
            autoDensity: true,
            antialias: true,
        });
        document.body.appendChild(this.app.canvas);

        // Init assets and load main bundle
        await Assets.init({
            basePath: 'assets/',
            manifest: 'manifest.json'
        });
        await Assets.loadBundle('default');

        // Add global FPS counter
        this.fpsCounter = new FpsCounter();
        this.app.stage.addChild(this.fpsCounter);

        // Create scene manager first so scenes can reference it
        this.sceneManager = new SceneManager(this.app, []);
        this.sceneManager.registerScene(new MainMenuScene(this.sceneManager));
        this.sceneManager.registerScene(new AceOfShadowsScene(this.sceneManager));
        this.sceneManager.registerScene(new MagicWordsScene(this.sceneManager));
        this.sceneManager.registerScene(new PhoenixFlameScene(this.sceneManager));

        // Connect ticker for per-frame updates (deltaMS / 1000 = seconds)
        this.app.ticker.add((ticker) => {
            this.sceneManager.update(ticker.deltaMS / 1000);
        });

        // Start with main menu
        await this.sceneManager.changeScene('main-menu');
    }
}
