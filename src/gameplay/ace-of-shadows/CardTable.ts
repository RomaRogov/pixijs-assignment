import { Container, Sprite, Texture } from 'pixi.js';
import { Config } from '../../app/Config';
import { CardStack } from './CardStack';
import { CardAnimator } from './CardAnimator';

const CARD_COUNT = Config.aceOfShadows.cardCount;
const MOVE_INTERVAL = Config.aceOfShadows.cardMoveLoopIntervalS;
const STACK_SPACING = Config.aceOfShadows.stackSpacing;

/**
 * Manages two card stacks, the move timer, and delegates all animations
 * to CardAnimator. The scene only needs to place this container and call
 * show() / update() / killAnimations().
 */
export class CardTable extends Container {
    private sourceStack: CardStack;
    private targetStack: CardStack;
    private animator: CardAnimator;
    private overlayContainer: Container;

    private timer = 0;
    private isBusy = false;

    constructor() {
        super();

        this.sourceStack = new CardStack();
        this.targetStack = new CardStack();

        this.overlayContainer = new Container();

        this.addChild(this.sourceStack);
        this.addChild(this.targetStack);
        this.addChild(this.overlayContainer);

        this.animator = new CardAnimator(this.overlayContainer);
    }

    async init(cardTexture: Texture, placeholderTexture: Texture): Promise<void> {
        const deckWidth = placeholderTexture.width;
        this.sourceStack.position.set(-STACK_SPACING - deckWidth / 2, 0);
        this.targetStack.position.set(STACK_SPACING + deckWidth / 2, 0);

        this.sourceStack.setPlaceholder(placeholderTexture);
        this.targetStack.setPlaceholder(placeholderTexture);

        for (let i = 0; i < CARD_COUNT; i++) {
            const card = new Sprite(cardTexture);
            card.anchor.set(0.5);
            this.sourceStack.push(card);
        }
    }

    // Kick off the entrance stagger animation, then begin the move loop.
    show(screenHeight: number): void {
        this.isBusy = true;
        this.animator.animateBatchAppear(this.sourceStack, screenHeight).then(() => {
            this.isBusy = false;
            this.moveNextCard();
        });
    }

    update(deltaSeconds: number): void {
        if (this.isBusy) return;

        if (this.sourceStack.isEmpty && !this.animator.hasActiveAnimations) {
            this.isBusy = true;
            this.animator.animateBatchSwap(this.targetStack, this.sourceStack).then(() => {
                this.isBusy = false;
                this.timer = 0;
                this.moveNextCard();
            });
            return;
        }

        this.timer += deltaSeconds;
        if (this.timer >= MOVE_INTERVAL && !this.sourceStack.isEmpty) {
            this.timer -= MOVE_INTERVAL;
            this.moveNextCard();
        }
    }

    /**
     * Fade out every card (stacks + in-flight) and return a Promise that
     * resolves when the animation finishes. Intended for the scene's hide().
     */
    async disappear(): Promise<void> {
        this.isBusy = true;
        this.animator.killTweens();

        await this.animator.animateDisappear([
            this.sourceStack, 
            this.targetStack,
            ...this.overlayContainer.children]);

        this.isBusy = false;
        this.animator.killAll();
    }

    private moveNextCard(): void {
        const card = this.sourceStack.pop();
        if (!card) return;
        this.animator.animateCardMove(card, this.targetStack);
    }

    destroy(): void {
        this.animator.killAll();
        super.destroy({ children: true });
    }
}
