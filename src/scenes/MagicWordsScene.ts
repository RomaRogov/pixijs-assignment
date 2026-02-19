import gsap from 'gsap';
import { BaseScene } from '../core/BaseScene';
import { SceneManager } from '../core/SceneManager';
import { Button } from '../ui/Button';
import { DialoguesControl } from '../gameplay/magic-words/DialoguesControl';
import { Size } from 'pixi.js';

/**
 * Scene that hosts the Magic Words dialogue viewer.
 * Knows only about the DialoguesControl (dialogue) and the back button.
 */
export class MagicWordsScene extends BaseScene {
    public static readonly SCENE_NAME = 'magic-words';

    private dialoguesControl!: DialoguesControl;
    private backButton!: Button;
    private readonly sceneManager: SceneManager;

    constructor(sceneManager: SceneManager) {
        super(MagicWordsScene.SCENE_NAME);
        this.sceneManager = sceneManager;
    }

    async init(screenSize: Size): Promise<void> {
        this.dialoguesControl = new DialoguesControl();
        await this.dialoguesControl.init(screenSize);
        this.addChild(this.dialoguesControl);

        this.backButton = new Button({
            text: 'Back',
            width: 150,
            height: 45,
            fontSize: 22,
            onClick: () => this.sceneManager.changeScene('main-menu'),
        });
        this.backButton.position.set(85, 70);
        this.addChild(this.backButton);
    }

    release(): void {
        if (this.dialoguesControl) this.dialoguesControl.destroy({ children: true });
        if (this.backButton) this.backButton.destroy();
    }

    show(): void {
        this.visible = true;
        this.alpha = 1;

        // Start dialogue loop
        this.dialoguesControl.start();

        // Back button slides in from the left
        const targetX = this.backButton.x;
        this.backButton.x = -this.backButton.width;
        gsap.to(this.backButton, { x: targetX, duration: 0.5, ease: 'back.out(2)' });
    }

    async hide(): Promise<void> {
        this.backButton.setEnabled(false);
        this.dialoguesControl.stop();

        // Back button slides out to the left (fire-and-forget)
        gsap.to(this.backButton, { x: -this.backButton.width, duration: 0.3, ease: 'back.in(2)' });

        // Fade the entire scene and await
        await gsap.to(this, { alpha: 0, duration: 0.3, ease: 'power2.in' });

        this.release();
    }

    update(deltaSeconds: number): void {
        if (this.dialoguesControl) this.dialoguesControl.update(deltaSeconds);
    }

    resize(screenSize: Size): void {
        if (this.dialoguesControl) this.dialoguesControl.resize(screenSize);
    }
}
