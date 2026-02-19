import { Assets, Size, Spritesheet } from 'pixi.js';
import gsap from 'gsap';
import { BaseScene } from '../core/BaseScene';
import { SceneManager } from '../core/SceneManager';
import { CardTable } from '../gameplay/ace-of-shadows/CardTable';
import { Button } from '../ui/Button';

/**
 * Scene that hosts the Ace of Shadows card game.
 * Responsibility: loading assets, placing and centering the CardTable,
 * delegating scene lifecycle events to it.
 */
export class AceOfShadowsScene extends BaseScene {
    public static readonly SCENE_NAME = 'ace-of-shadows';

    private cardTable!: CardTable;
    private backButton!: Button;
    private sceneManager: SceneManager;
    private screenHeight = 0;

    constructor(sceneManager: SceneManager) {
        super(AceOfShadowsScene.SCENE_NAME);
        this.sceneManager = sceneManager;
    }

    async init(screenSize: Size): Promise<void> {
        await Assets.loadBundle('ace-of-shadows');

        const spritesheet = Assets.get<Spritesheet>('cards');
        const cardTexture = spritesheet.textures['card-back.png'];
        const placeholderTexture = spritesheet.textures['deck-placeholder.png'];

        this.cardTable = new CardTable();
        await this.cardTable.init(cardTexture, placeholderTexture);
        this.addChild(this.cardTable);
        this.cardTable.position.set(screenSize.width / 2, screenSize.height / 2);

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
        if (this.cardTable) {
            this.cardTable.destroy();
        }
        if (this.backButton) {
            this.backButton.destroy();
        }
    }

    show(): void {
        this.visible = true;
        this.cardTable.show(this.screenHeight);

        const targetX = this.backButton.x;
        this.backButton.x = -this.backButton.width;
        gsap.to(this.backButton, { x: targetX, duration: 0.5, ease: 'back.out(2)' });
    }

    async hide(): Promise<void> {
        this.backButton.setEnabled(false);
        gsap.to(this.backButton, { x: -this.backButton.width, duration: 0.3, ease: 'back.in(2)' });
        await this.cardTable.disappear();
        this.release();
        return Promise.resolve();
    }

    update(deltaSeconds: number): void {
        if (this.cardTable) {
            this.cardTable.update(deltaSeconds);
        }
    }

    resize(screenSize: Size): void {
        this.screenHeight = screenSize.height;
        if (this.cardTable) {
            this.cardTable.position.set(screenSize.width / 2, screenSize.height / 2);
        }
    }
}
