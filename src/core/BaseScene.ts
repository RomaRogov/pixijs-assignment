import { Container, Size } from 'pixi.js';

/**
 * Base class for scenes to provide common structure and lifecycle methods.
 */
export abstract class BaseScene extends Container {
    private readonly sceneName: string;
    
    // Constructor with name
    protected constructor(name: string) {
        super();
        this.sceneName = name;
    }
    
    getName(): string { return this.sceneName; };
    abstract init(screenSize: Size): Promise<void>;
    abstract release(): void;
    abstract show(): void;
    abstract hide(): Promise<void>;
    update?(deltaTime: number): void;
    resize?(screenSize: Size): void;
}

