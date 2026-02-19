import { BitmapFont, BitmapText, Container, NineSliceSprite, Size, Sprite, Texture } from 'pixi.js';
import gsap from 'gsap';
import { DialoguePhrase } from '../../services/dialogue/DialoguePhrase';
import { EmojiText, EmojiTextOptions } from '../../ui/EmojiText';
import { Config } from '../../app/Config';

/**
 * One dialogue card: avatar sprite + 9-slice speech-bubble with name and EmojiText.
 */
export class DialogueSide extends Container {
    private readonly emojiMap: Map<string, Texture>;
    private readonly font: BitmapFont;

    private readonly avatarSprite: Sprite;
    private readonly bubbleContainer: Container;
    private readonly bubbleSprite: NineSliceSprite;
    private readonly nameLabel: BitmapText;
    private readonly emojiConfig: EmojiTextOptions;
    private readonly emojiText: EmojiText;
    private unknownTexture: Texture;

    private currentScreenSize: Size;
    private currentSideIsLeft = true;

    constructor(screenSize: Size, emojiMap: Map<string, Texture>, font: BitmapFont, unknownProfileTexture: Texture, speechBubbleTexture: Texture) {
        super();
        this.currentScreenSize = screenSize;
        this.emojiMap = emojiMap;
        this.font = font;
        this.visible = false;
        this.unknownTexture = unknownProfileTexture;

        const { layout } = Config.magicWords;

        this.avatarSprite = new Sprite();

        this.bubbleContainer = new Container();
        this.bubbleSprite = new NineSliceSprite({
            texture: speechBubbleTexture,
            leftWidth: layout.bubbleSliceLeft,
            topHeight: layout.bubbleSliceTop,
            rightWidth: layout.bubbleSliceRight,
            bottomHeight: layout.bubbleSliceBottom,
        });
        this.bubbleContainer.addChild(this.bubbleSprite);

        this.nameLabel = new BitmapText({
            text: 'Character Name',
            style: {
                fontFamily: this.font.fontFamily,
                fontSize: layout.nameFontSize,
            },
        });
        this.nameLabel.anchor.set(0, 1);
        this.bubbleContainer.addChild(this.nameLabel);

        this.emojiConfig = {
            text: '',
            emojiMap: this.emojiMap,
            maxWidth: 100,
            font: this.font,
            fontSize: layout.contentFontSize,
            fill: layout.contentFill,
            emojiScale: layout.emojiScale,
        };
        this.emojiText = new EmojiText();
        this.bubbleContainer.addChild(this.emojiText);

        this.addChild(this.avatarSprite);
        this.addChild(this.bubbleContainer);
    }

    set screenSize(s: Size) { this.currentScreenSize = s; }

    show(phrase: DialoguePhrase): void {
        const { slideOffset, bubbleFadeDelay } = Config.magicWords.layout;

        gsap.killTweensOf(this.avatarSprite);
        gsap.killTweensOf(this.bubbleContainer);

        this.rebuildContent(phrase);

        this.visible = true;
        this.alpha = 1;

        const avatarTargetY = this.avatarSprite.y;
        const bubbleTargetY = this.bubbleContainer.y;
        this.avatarSprite.position.set(this.avatarSprite.x, this.avatarSprite.y + slideOffset);
        this.bubbleContainer.position.set(this.bubbleContainer.x, this.bubbleContainer.y + slideOffset);
        this.avatarSprite.alpha = 0;
        this.bubbleContainer.alpha = 0;

        gsap.to(this.avatarSprite, { y: avatarTargetY, alpha: 1, duration: 0.35, ease: 'expo.out' });
        gsap.to(this.bubbleContainer, { y: bubbleTargetY, alpha: 1, duration: 0.35, delay: bubbleFadeDelay, ease: 'expo.out' });
    }

    hide(): void {
        if (!this.visible) return;
        const { slideOffset } = Config.magicWords.layout;

        gsap.killTweensOf(this.avatarSprite);
        gsap.killTweensOf(this.bubbleContainer);

        gsap.to(this.avatarSprite, { y: this.avatarSprite.y + slideOffset, alpha: 0, duration: 0.2, ease: 'sine.in' });
        gsap.to(this.bubbleContainer, { y: this.bubbleContainer.y + slideOffset, alpha: 0, duration: 0.2, ease: 'sine.in' });
    }

    private rebuildContent(phrase: DialoguePhrase): void {
        this.currentSideIsLeft = phrase.character.position === 'left';
        const avatarTex = phrase.character.avatarTexture ?? this.unknownTexture;
        this.avatarSprite.texture = avatarTex;
        this.nameLabel.text = phrase.character.name;
        this.emojiConfig.text = phrase.text;
        this.repositionContent(true);
    }

    public repositionContent(withText: boolean): void {
        const {
            cornerGap, bubbleGap, contentGapSide, contentGapWithTail, contentGapBottom,
            nameColorLeft, nameColorRight, bubbleWidthRatio,
        } = Config.magicWords.layout;

        const horizontalPivot = this.currentSideIsLeft ? 0 : 1;
        const horizontalSign  = this.currentSideIsLeft ? 1 : -1;

        // Main container placed at side horizontally and bottom vertically with gap from corner
        this.position.set(
            this.currentSideIsLeft ? cornerGap : this.currentScreenSize.width - cornerGap,
            this.currentScreenSize.height - cornerGap);

        // Avatar sprite placed in side corner of main container
        this.avatarSprite.anchor.set(horizontalPivot, 1);
        this.avatarSprite.position.set(0, 0);

        // Bubble container placed with gap, from avatar horizontally and from bottom vertically
        this.bubbleContainer.position.set((this.avatarSprite.width + bubbleGap) * horizontalSign, -bubbleGap);

        // Following parts are calculated only with text rebuilding, skip for simple repositioning
        if (!withText) {
            return;
        }

        // Preparing bubble content
        const bubbleW  = this.currentScreenSize.width * bubbleWidthRatio - this.avatarSprite.width - bubbleGap;
        const contentW = bubbleW - contentGapSide - contentGapWithTail;

        // Emoji text placed with gap and size first to calculate height
        this.emojiConfig.maxWidth = contentW;
        this.emojiText.rebuild(this.emojiConfig);

        const contentH = this.emojiText.contentHeight;
        const bubbleH  = contentH + contentGapSide + contentGapBottom + this.nameLabel.height;

        this.emojiText.position.set(
            this.currentSideIsLeft ? contentGapWithTail : -contentGapWithTail - contentW,
            -contentGapBottom - contentH);

        // Place name label at the left top corner of emoji text
        this.nameLabel.tint = this.currentSideIsLeft ? nameColorLeft : nameColorRight;
        this.nameLabel.position.set(
            this.currentSideIsLeft ? contentGapWithTail : -contentGapWithTail - contentW,
            -contentGapBottom - contentH);

        // Finally, resize bubble based on content size with some gap and tail space
        // Place it on corner of bubble container with horizontal flip for right side
        this.bubbleSprite.width  = bubbleW;
        this.bubbleSprite.height = bubbleH;
        this.bubbleSprite.scale.set(horizontalSign, 1);
        this.bubbleSprite.anchor.set(0, 0);
        this.bubbleSprite.position.set(0, -bubbleH);
    }

    override destroy(options?: Parameters<Container['destroy']>[0]): void {
        gsap.killTweensOf(this);
        gsap.killTweensOf(this.avatarSprite);
        gsap.killTweensOf(this.bubbleContainer);
        super.destroy(options);
    }
}
