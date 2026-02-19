import { Container, Point, Sprite } from 'pixi.js';
import gsap from 'gsap';
import { CardStack } from './CardStack';
import { Config } from '../../app/Config';

const MOVE_DURATION = Config.aceOfShadows.cardAnimationDurationS;

/**
 * Single controller for all card animations.
 * Uses a dedicated overlay container placed above the card table so animating
 * cards render on top of both stacks during flight.
 */
export class CardAnimator {
    private overlayContainer: Container;
    private activeTweens: Array<gsap.core.Tween> = [];

    constructor(overlayContainer: Container) {
        this.overlayContainer = overlayContainer;
    }

    /**
     * Batch stagger animation: cards are already placed in the stack at their
     * final positions but start off the top of the screen and fall into place.
     */
    animateBatchAppear(stack: CardStack, screenHeight: number): Promise<void> {
        const cards = stack.getAllCards();
        if (cards.length === 0) return Promise.resolve();

        const cardHeight = cards[0].height;
        const startY = -screenHeight / 2 - cardHeight;
        const targets = cards.map(card => card.y);

        cards.forEach(card => { card.y = startY; });

        return new Promise(resolve => {
            const tween = gsap.to(cards, {
                duration: 0.6,
                stagger: 0.003,
                ease: 'expo.inOut',
                y: (i: number) => targets[i],
                onComplete: resolve,
            });
            this.activeTweens.push(tween);
        });
    }

    /**
     * Animate a single card (position already in world coords after pop())
     * from its current position to the next slot in targetStack via an arc.
     * The card is reparented to the overlay container for the duration.
     */
    animateCardMove(card: Sprite, targetStack: CardStack): void {
        const localStart = this.overlayContainer.toLocal(new Point(card.x, card.y));
        this.overlayContainer.addChild(card);
        card.position.set(localStart.x, localStart.y);

        const targetWorld = targetStack.getNextSlotWorldPosition();
        const targetLocal = this.overlayContainer.toLocal(targetWorld);

        const xTween = gsap.to(card, {
            x: targetLocal.x,
            duration: MOVE_DURATION,
            ease: 'sine.inOut',
        });

        const yTween = gsap.to(card, {
            y: targetLocal.y,
            duration: MOVE_DURATION,
            ease: 'back.in(4)',
            onComplete: () => {
                this.overlayContainer.removeChild(card);
                targetStack.push(card);
            },
        });

        this.activeTweens.push(xTween, yTween);
    }

    /**
     * Horizontal stagger animation: all cards slide from fromStack to toStack.
     * Used when resetting the decks after all cards have moved to one side.
     */
    animateBatchSwap(fromStack: CardStack, toStack: CardStack): Promise<void> {
        const cards = fromStack.getAllCards();
        if (cards.length === 0) return Promise.resolve();

        const worldPositions = cards.map(card => fromStack.toGlobal(card.position));
        fromStack.removeAll();

        cards.forEach((card, i) => {
            const localPos = this.overlayContainer.toLocal(worldPositions[i]);
            card.position.set(localPos.x, localPos.y);
            this.overlayContainer.addChild(card);
        });

        const targetWorldX = toStack.toGlobal(new Point(0, 0)).x;
        const targetLocalX = this.overlayContainer.toLocal(new Point(targetWorldX, 0)).x;

        return new Promise(resolve => {
            const tween = gsap.to(cards, {
                x: targetLocalX,
                duration: 0.5,
                stagger: 0.003,
                ease: 'sine.in',
                onComplete: () => {
                    cards.forEach(card => this.overlayContainer.removeChild(card));
                    cards.forEach(card => toStack.push(card));
                    resolve();
                },
            });
            this.activeTweens.push(tween);
        });
    }

    async animateDisappear(targets: Array<Container>): Promise<void> {
        await gsap.to(targets.map(target => target.scale), {
            x: 0,
            y: 0,
            duration: 0.3,
            ease: 'back.in'
        });
    }

    // True while any cards are mid-flight in the overlay
    get hasActiveAnimations(): boolean {
        return this.overlayContainer.children.length > 0;
    }

    // Kill tweens but leave overlay children intact (e.g. before disappear animation).
    killTweens(): void {
        this.activeTweens.forEach(t => t.kill());
        this.activeTweens = [];
    }

    // Kill tweens and immediately clear the overlay container.
    killAll(): void {
        this.killTweens();
        this.overlayContainer.removeChildren();
    }
}
