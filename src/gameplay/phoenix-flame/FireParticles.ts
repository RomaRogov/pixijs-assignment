import { Container, Sprite, Texture } from 'pixi.js';
import gsap from 'gsap';
import { Config } from '../../app/Config';

interface Particle {
    sprite: Sprite;
    life: number;
    maxLife: number;
    vx: number;
    vy: number;
    vrot: number;
    startScale: number;
    startDelay: number;
}

/**
 * Pooled fire-particle emitter.
 *
 * Pool size and lifetime are driven by Config.phoenixFlame.
 * Call setEmitterPosition() whenever the spawn point changes,
 * then update() every frame with delta time in seconds.
 */
export class FireParticles extends Container {
    private readonly particles: Particle[] = [];
    private emitterX = 0;
    private emitterY = 0;
    private readonly easeIn: (t: number) => number;
    private readonly easeOut: (t: number) => number;
    private readonly color = { r: 255, g: 0, b: 0 };

    constructor(textures: Texture[]) {
        super();
        this.easeIn  = gsap.parseEase(Config.phoenixFlame.particleEaseIn);
        this.easeOut = gsap.parseEase(Config.phoenixFlame.particleEaseOut);
        const delayBetweenSpawnsS = Config.phoenixFlame.particleLifetimeS.min / Config.phoenixFlame.maxParticles;
        for (let i = 0; i < Config.phoenixFlame.maxParticles; i++) {
            const sprite = new Sprite(textures[i % textures.length]);
            sprite.anchor.set(0.5);
            sprite.blendMode = 'add';
            sprite.visible = false;
            this.addChild(sprite);
            this.particles.push({ sprite, life: 0, maxLife: 0, vx: 0, vy: 0, vrot: 0, startScale: 1, startDelay: i * delayBetweenSpawnsS });
        }
    }

    setEmitterPosition(x: number, y: number): void {
        this.emitterX = x;
        this.emitterY = y;
    }

    update(deltaSeconds: number): void {
        for (const p of this.particles) {
            if (p.life > 0) {
                p.life -= deltaSeconds;
                const progress = 1 - (p.life / p.maxLife);

                p.sprite.x += p.vx * deltaSeconds;
                p.sprite.y += p.vy * deltaSeconds;
                p.sprite.rotation += p.vrot * deltaSeconds;

                const split = Config.phoenixFlame.particleLifeSplitRatio;
                let value: number;
                let tintProgress: number;

                if (progress < split) {
                    const t = this.easeIn(progress / split);
                    value = t;
                    tintProgress = t * split;
                } else {
                    const t = this.easeOut((progress - split) / (1 - split));
                    value = 1 - t;
                    tintProgress = split + t * (1 - split);
                }

                p.sprite.scale.set(p.startScale * Math.max(value, 0));
                p.sprite.alpha = Math.max(value, 0);

                const g = Math.round(255 * (1 - tintProgress * 0.8));
                const b = Math.round(50  * (1 - tintProgress));
                this.color.g = g;
                this.color.b = b;
                p.sprite.tint = this.color;

                if (p.life <= 0) p.sprite.visible = false;
            } else if (p.startDelay > 0) {
                p.startDelay -= deltaSeconds;
            } else {
                this.spawnParticle(p);
            }
        }
    }

    private spawnParticle(p: Particle): void {
        const { min, max } = Config.phoenixFlame.particleLifetimeS;
        p.maxLife = min + Math.random() * (max - min);
        p.life = p.maxLife;
        p.vx = (Math.random() - 0.5) * 60;
        p.vy = -(80 + Math.random() * 120);
        p.startScale = 0.5 + Math.random() * 1.5;
        p.sprite.x = this.emitterX + (Math.random() - 0.5) * 30;
        p.sprite.y = this.emitterY;
        p.sprite.alpha = 1;
        p.sprite.visible = true;
        p.sprite.scale.set(0);
        p.sprite.rotation = Math.random() * 2 * Math.PI;
        p.vrot = (Math.random() - 0.5) * Math.PI / 10;
    }
}
