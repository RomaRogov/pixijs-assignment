import { BitmapText, Size } from 'pixi.js';
import gsap from 'gsap';
import { BaseScene } from '../core/BaseScene';
import { Button } from '../ui/Button';
import { SceneManager } from '../core/SceneManager';
import { AceOfShadowsScene } from './AceOfShadowsScene';

/**
 * Scene for the main menu of the game. Contains title and navigation buttons.
 */
export class MainMenuScene extends BaseScene {
    public static readonly SCENE_NAME = "main-menu";

    private title!: BitmapText;
    private buttons: Button[] = [];
    private sceneManager: SceneManager;
    private screenHeight = 0;

    constructor(sceneManager: SceneManager) {
        super(MainMenuScene.SCENE_NAME);
        this.sceneManager = sceneManager;
    }

    async init(screenSize: Size): Promise<void> {
        this.screenHeight = screenSize.height;
        this.buttons = [];
        this.createTitle();
        this.createButtons();
    }

    private createTitle(): void {
        this.title = new BitmapText({
            text: 'PixiJS Assignment',
            style: {
                fontFamily: 'roboto-semibold',
                fontSize: 40,
            },
        });

        this.title.anchor.set(0.5);
        this.addChild(this.title);
    }

    private createButtons(): void {
        const aceOfShadowsButton = new Button({
            text: 'Ace of Shadows',
            width: 300,
            height: 70,
            fontSize: 28,
            onClick: () => this.sceneManager.changeScene(AceOfShadowsScene.SCENE_NAME),
        });

        const magicWordsButton = new Button({
            text: 'Magic Words',
            width: 300,
            height: 70,
            fontSize: 28,
            onClick: () => this.sceneManager.changeScene('magic-words'),
        });

        const phoenixButton = new Button({
            text: 'Phoenix Flame',
            width: 300,
            height: 70,
            fontSize: 28,
            onClick: () => this.sceneManager.changeScene('phoenix-flame'),
        });

        this.buttons.push(aceOfShadowsButton, magicWordsButton, phoenixButton);
        this.buttons.forEach(button => this.addChild(button));
    }

    release(): void {
        this.buttons.forEach(button => button.destroy());
        this.buttons = [];
        if (this.title) {
            this.title.destroy();
        }
    }

    show(): void {
        this.visible = true;

        // Title: pop in from scale 0
        this.title.scale.set(0);
        gsap.to(this.title.scale, { x: 1, y: 1, duration: 0.5, ease: 'back.out(2)' });

        // Buttons: slide up from below the screen with stagger
        const targetYs = this.buttons.map(b => b.y);
        this.buttons.forEach(b => { b.y = this.screenHeight + b.height; });
        gsap.to(this.buttons, {
            y: (i) => targetYs[i],
            duration: 0.6,
            stagger: 0.1,
            ease: 'expo.out',
        });
    }

    async hide(): Promise<void> {
        this.buttons.forEach(b => b.setEnabled(false));

        // Title: shrink to 0 (fires and is left to run without blocking)
        gsap.to(this.title.scale, { x: 0, y: 0, duration: 0.35, ease: 'back.in(2)' });
        this.buttons.reverse(); // Reverse button array for stagger out in reverse order

        // Buttons: slide back down below the screen — await the full stagger
        await gsap.to(this.buttons, {
            y: this.screenHeight + 200,
            duration: 0.35,
            stagger: 0.07,
            ease: 'expo.in',
        });

        this.release();
    }

    resize(screenSize: Size): void {
        this.screenHeight = screenSize.height;

        if (this.title) {
            this.title.x = screenSize.width / 2;
            this.title.y = screenSize.height / 3;
        }

        if (this.buttons.length > 0) {
            const startY = screenSize.height / 2;
            const spacing = 90;

            this.buttons.forEach((button, index) => {
                button.x = screenSize.width / 2;
                button.y = startY + index * spacing;
            });
        }
    }
}
