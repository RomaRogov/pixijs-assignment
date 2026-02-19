import { Texture } from 'pixi.js';

export class DialogueEmoji {
    readonly name: string;
    readonly url: string;
    texture: Texture | null = null;

    constructor(name: string, url: string) {
        this.name = name;
        this.url = url;
    }
}
