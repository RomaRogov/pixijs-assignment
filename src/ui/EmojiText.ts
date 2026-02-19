import { BitmapFont, BitmapText, Container, Sprite, Texture } from 'pixi.js';

export interface EmojiTextOptions {
    text: string;
    emojiMap: Map<string, Texture>;
    maxWidth: number;
    font: BitmapFont;
    fontSize: number;
    emojiScale: number;
    fill?: number;
}

type Token = { type: 'word'; text: string } | { type: 'emoji'; name: string };

/**
 * Container that renders mixed text + emoji inline, with word-wrapping.
 */
export class EmojiText extends Container {
    private _contentHeight = 0;

    constructor() {
        super();
    }

    public rebuild(options: EmojiTextOptions): void {
        this.removeChildren();

        const { text, emojiMap, maxWidth, font, fontSize, emojiScale } = options;
        const fill = options.fill ?? 0x333333;

        // Parameters 
        const sizeMultiplier = fontSize / font.baseMeasurementFontSize;
        const lineHeight = font.lineHeight * sizeMultiplier;
        const emojiSize  = Math.ceil(fontSize * emojiScale);
        const spaceWidth = font.chars[' '].xAdvance * sizeMultiplier;

        const tokens = EmojiText.tokenize(text);
        let curX = 0;
        let curY = 0;
        let lineIsEmpty = true;

        for (const token of tokens) {
            if (token.type === 'emoji') {
                const texture = emojiMap.get(token.name);
                if (!texture) continue; // skip unknown emoji names silently

                const needed = lineIsEmpty ? emojiSize : spaceWidth + emojiSize;
                if (!lineIsEmpty && curX + needed > maxWidth) {
                    curX = 0;
                    curY += lineHeight;
                    lineIsEmpty = true;
                }
                if (!lineIsEmpty) curX += spaceWidth;

                const sprite = new Sprite(texture);
                const ratio = texture.width / texture.height;
                sprite.width  = emojiSize;
                sprite.height = emojiSize / ratio;
                sprite.x = curX;
                sprite.y = curY + lineHeight - sprite.height;
                this.addChild(sprite);

                curX += emojiSize;
                lineIsEmpty = false;

            } else {
                const label = new BitmapText({ text: token.text, style: { fontFamily: font.fontFamily, fontSize, fill } });
                const tokenWidth = label.width;

                const needed = lineIsEmpty ? tokenWidth : spaceWidth + tokenWidth;
                if (!lineIsEmpty && curX + needed > maxWidth) {
                    curX = 0;
                    curY += lineHeight;
                    lineIsEmpty = true;
                }
                if (!lineIsEmpty) curX += spaceWidth;

                label.x = curX;
                label.y = curY + Math.floor((lineHeight - fontSize) / 2);
                this.addChild(label);

                curX += tokenWidth;
                lineIsEmpty = false;
            }
        }

        this._contentHeight = tokens.length > 0 ? curY + lineHeight : 0;
    }

    // Asked AI to generate regex for tokenizing, works well
    private static tokenize(text: string): Token[] {
        const tokens: Token[] = [];
        const re = /\{(\w+)\}|(\S+)/g;
        let m: RegExpExecArray | null;
        while ((m = re.exec(text)) !== null) {
            if (m[1]) tokens.push({ type: 'emoji', name: m[1] });
            else if (m[2]) tokens.push({ type: 'word', text: m[2] });
        }
        return tokens;
    }

    get contentHeight(): number {
        return this._contentHeight;
    }
}
