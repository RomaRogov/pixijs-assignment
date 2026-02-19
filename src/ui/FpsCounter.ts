import { BitmapText, Ticker, Container } from 'pixi.js';

/**
 * FPS counter displayed in top-left corner
 */
export class FpsCounter extends Container {
    private text: BitmapText;
    private lastTime: number = 0;
    private frameCount: number = 0;
    private fps: number = 0;

    constructor() {
        super();

        this.text = new BitmapText({
            text: 'FPS: 0',
            style: {
                fontFamily: 'roboto-semibold',
                fontSize: 24,
                fill: 0xffffff
            },
        });

        this.text.x = 10;
        this.text.y = 10;
        this.addChild(this.text);

        Ticker.shared.add(this.update, this);
    }

    private update(): void {
        this.frameCount++;
        const currentTime = Date.now();
        const elapsed = currentTime - this.lastTime;

        if (elapsed >= 500) {
            this.fps = Math.round((this.frameCount * 1000) / elapsed);
            this.text.text = `FPS: ${this.fps}`;
            this.frameCount = 0;
            this.lastTime = currentTime;
        }
    }

    override destroy(options?: any): void {
        Ticker.shared.remove(this.update, this);
        super.destroy(options);
    }
}




