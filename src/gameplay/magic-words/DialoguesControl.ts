import { Assets, BitmapFont, Container, Rectangle, Size } from 'pixi.js';
import { Config } from '../../app/Config';
import { DialogueService } from '../../services/dialogue/DialogueService';
import { DialogueSide } from './DialogueSide';
import { AssetManager } from '../../core/AssetManager';

/**
 * Manages two DialogueSide instances as a ping-pong buffer and drives the
 * auto-advancing dialogue loop.
 */
export class DialoguesControl extends Container {
    private readonly service: DialogueService;
    private sides!: [DialogueSide, DialogueSide];
    private activeSideIndex = 0;
    private hasShownFirst = false;

    private currentIndex = -1;
    private timer = 0;
    private running = false;

    constructor() {
        super();
        this.service = new DialogueService();
        this.eventMode = 'static';
        this.on('pointerdown', () => {
            if (!this.running) return;
            this.timer = 0;
            this.showNextPhrase();
        });
    }

    async init(currentScreenSize: Size): Promise<void> {
        // Load local assets (speech-bubble.png, profile-unknown.png)
        await Assets.loadBundle('magic-words');
        await this.service.load();

        const emojiMap = this.service.getEmojiMap();
        const font = await AssetManager.getInstance().get('roboto-semibold') as BitmapFont;

        const unknownTexture = Assets.get('profile-unknown.png');
        const speechBubbleTexture = Assets.get('speech-bubble.png');
        this.sides = [
            new DialogueSide(currentScreenSize, emojiMap, font, unknownTexture, speechBubbleTexture),
            new DialogueSide(currentScreenSize, emojiMap, font, unknownTexture, speechBubbleTexture),
        ];
        this.addChild(this.sides[0]);
        this.addChild(this.sides[1]);
        this.hitArea = new Rectangle(0, 0, currentScreenSize.width, currentScreenSize.height);
    }

    // Begin auto-advancing with slight delay for the first phrase
    start(): void {
        const { autoChangeIntervalS, firstPhraseDelayS } = Config.magicWords;
        this.running = true;
        this.timer = autoChangeIntervalS - firstPhraseDelayS;
    }

    stop(): void {
        this.running = false;
    }

    update(deltaSeconds: number): void {
        if (!this.running) return;
        this.timer += deltaSeconds;
        if (this.timer >= Config.magicWords.autoChangeIntervalS) {
            this.timer = 0;
            this.showNextPhrase();
        }
    }

    resize(screenSize: Size): void {
        this.hitArea = new Rectangle(0, 0, screenSize.width, screenSize.height);
        if (this.sides) {
            this.sides.forEach(side => {
                side.screenSize = screenSize;
                side.repositionContent(false);
            });
        }
    }

    private showNextPhrase(): void {
        const phrases = this.service.phrases;
        if (phrases.length === 0) return;

        this.currentIndex = (this.currentIndex + 1) % phrases.length;
        const phrase = phrases[this.currentIndex];

        const newIndex = 1 - this.activeSideIndex;

        if (this.hasShownFirst) {
            this.sides[this.activeSideIndex].hide();
        }
        this.hasShownFirst = true;

        this.sides[newIndex].show(phrase);
        this.activeSideIndex = newIndex;
    }
}
