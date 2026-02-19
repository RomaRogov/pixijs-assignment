import { Container, Point, Sprite, Texture } from 'pixi.js';
import { Config } from '../../app/Config';

const STACK_OFFSET_Y = Config.aceOfShadows.stackOffsetY;

/**
 * Container that manages a stack of card sprites.
 * Cards are stacked with a small vertical offset so each peeks out beneath the next.
 * A placeholder sprite is always kept at child index 0 so the slot remains
 * visible even when the deck is empty.
 */
export class CardStack extends Container {
    private cards: Sprite[] = [];

    setPlaceholder(texture: Texture): void {
        const sprite = new Sprite(texture);
        sprite.anchor.set(0.5);
        this.addChildAt(sprite, 0);
    }

    push(card: Sprite): void {
        card.position.set(0, -this.cards.length * STACK_OFFSET_Y);
        this.cards.push(card);
        this.addChild(card);
    }

    pop(): Sprite | null {
        if (this.cards.length === 0) return null;

        const card = this.cards.pop()!;
        const worldPos = this.toGlobal(card.position);
        this.removeChild(card);
        card.position.set(worldPos.x, worldPos.y);
        return card;
    }

    removeAll(): void {
        this.cards.forEach(card => this.removeChild(card));
        this.cards = [];
    }

    transferAllTo(other: CardStack): void {
        const allCards = [...this.cards];
        this.cards = [];
        allCards.forEach(card => this.removeChild(card));
        allCards.forEach(card => other.push(card));
    }

    getAllCards(): Sprite[] {
        return [...this.cards];
    }

    // World position where the next pushed card will land.
    getNextSlotWorldPosition(): Point {
        return this.toGlobal(new Point(0, -this.cards.length * STACK_OFFSET_Y));
    }

    get count(): number {
        return this.cards.length;
    }

    get isEmpty(): boolean {
        return this.cards.length === 0;
    }
}
