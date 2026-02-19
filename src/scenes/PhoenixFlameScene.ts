import { Assets, Size, Texture } from 'pixi.js';
import gsap from 'gsap';
import { BaseScene } from '../core/BaseScene';
import { SceneManager } from '../core/SceneManager';
import { Button } from '../ui/Button';
import { FireParticles } from '../gameplay/phoenix-flame/FireParticles';
import { Config } from '../app/Config';

export class PhoenixFlameScene extends BaseScene {
    public static readonly SCENE_NAME = 'phoenix-flame';

    private fireParticles!: FireParticles;
    private backButton!: Button;
    private readonly sceneManager: SceneManager;

    constructor(sceneManager: SceneManager) {
        super(PhoenixFlameScene.SCENE_NAME);
        this.sceneManager = sceneManager;
    }

    async init(): Promise<void> {
        await Assets.loadBundle('phoenix-flame');

        const textures: Texture[] = [];
        for (let i = 1; i <= Config.phoenixFlame.particleTextureCount; i++) {
            const texture = Assets.get(`fire-particle-${i}.png`) as Texture;
            if (texture) textures.push(texture);
        }
        this.fireParticles = new FireParticles(textures);
        this.addChild(this.fireParticles);

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
        if (this.fireParticles) this.fireParticles.destroy({ children: true });
        if (this.backButton) this.backButton.destroy();
    }

    show(): void {
        this.visible = true;
        this.alpha = 1;

        const targetX = this.backButton.x;
        this.backButton.x = -this.backButton.width;
        gsap.to(this.backButton, { x: targetX, duration: 0.5, ease: 'back.out(2)' });
    }

    async hide(): Promise<void> {
        this.backButton.setEnabled(false);
        gsap.to(this.backButton, { x: -this.backButton.width, duration: 0.3, ease: 'back.in(2)' });
        await gsap.to(this, { alpha: 0, duration: 0.3, ease: 'power2.in' });
        this.release();
    }

    update(deltaSeconds: number): void {
        if (this.fireParticles) this.fireParticles.update(deltaSeconds);
    }

    resize(screenSize: Size): void {
        if (this.fireParticles) {
            this.fireParticles.setEmitterPosition(screenSize.width / 2, screenSize.height * 0.7);
        }
    }
}
