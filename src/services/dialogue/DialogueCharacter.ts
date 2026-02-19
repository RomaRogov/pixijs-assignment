import { Texture } from 'pixi.js';

export class DialogueCharacter {
    readonly name: string;
    readonly position: 'left' | 'right';
    readonly avatarUrl: string;
    avatarTexture: Texture | null = null;

    constructor(name: string, position: 'left' | 'right', avatarUrl: string) {
        this.name = name;
        this.position = position;
        this.avatarUrl = avatarUrl;
    }
}
