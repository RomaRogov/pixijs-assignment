import { Container, BitmapText, FederatedPointerEvent, NineSliceSprite, Assets } from 'pixi.js';
import gsap from 'gsap';

export interface ButtonOptions {
    text: string;
    width?: number;
    height?: number;
    fontSize?: number;
    onClick?: () => void;
}

/**
 * Simple button with 9-slice background and BitmapText label, with hover and click animations.
 */
export class Button extends Container {
    private background: NineSliceSprite;
    private labelText: BitmapText;
    private options: Required<ButtonOptions>;
    private isHovered: boolean = false;
    private animTween?: gsap.core.Tween | undefined;

    constructor(options: ButtonOptions) {
        super();

        this.options = {
            text: options.text,
            width: options.width ?? 200,
            height: options.height ?? 60,
            fontSize: options.fontSize ?? 24,
            onClick: options.onClick ?? (() => { }),
        };

        const buttonAsset = Assets.get('button-purple');
        this.background = new NineSliceSprite({
            texture: buttonAsset,
            width: this.options.width,
            height: this.options.height,
            leftWidth: 20,
            topHeight: 13,
            rightWidth: 20,
            bottomHeight: 21,
        });
        this.background.anchor.set(0.5);
        this.addChild(this.background);

        this.labelText = new BitmapText({
            text: this.options.text,
            style: {
                fontFamily: 'roboto-semibold',
                fontSize: this.options.fontSize
            },
        });
        this.labelText.position.set(0, -3);
        this.labelText.anchor.set(0.5);
        this.addChild(this.labelText);

        this.eventMode = 'static';
        this.cursor = 'pointer';

        this.on('pointerover', this.onPointerOver.bind(this));
        this.on('pointerout', this.onPointerOut.bind(this));
        this.on('pointerdown', this.onPointerDown.bind(this));
    }

    private onPointerOver(): void {
        this.isHovered = true;

        if (this.animTween) {
            this.animTween.kill();
        }
        this.animTween = gsap.to(this.scale, {
            x: 1.05,
            y: 1.05,
            duration: 0.2,
            ease: 'power2.out',
        });
    }

    private onPointerOut(): void {
        this.isHovered = false;

        if (this.animTween) {
            this.animTween.kill();
        }
        this.animTween = gsap.to(this.scale, {
            x: 1,
            y: 1,
            duration: 0.2,
            ease: 'power2.out',
        });
    }

    private onPointerDown(event: FederatedPointerEvent): void {
        event.stopPropagation();

        if (this.animTween) {
            this.animTween.kill();
        }
        this.animTween = gsap.to(this.scale, {
            x: 0.95,
            y: 0.95,
            duration: 0.1,
            ease: 'power2.in',
            onComplete: () => {
                this.animTween = gsap.to(this.scale, {
                    x: this.isHovered ? 1.05 : 1,
                    y: this.isHovered ? 1.05 : 1,
                    duration: 0.1,
                    ease: 'power2.out',
                });
            },
        });

        this.options.onClick();
    }

    setText(text: string): void {
        this.labelText.text = text;
    }

    setEnabled(enabled: boolean): void {
        this.eventMode = enabled ? 'static' : 'none';
    }
}








