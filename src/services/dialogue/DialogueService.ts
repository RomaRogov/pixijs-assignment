import { Assets, Texture } from 'pixi.js';
import { Config } from '../../app/Config';
import { DialogueCharacter } from './DialogueCharacter';
import { DialogueEmoji } from './DialogueEmoji';
import { DialoguePhrase } from './DialoguePhrase';

// ---- Data structures for parsing API response, not used outside this service. ----
interface ApiDialogueEntry {
    name: string;
    text: string;
}

interface ApiEmojiEntry {
    name: string;
    url: string;
}

interface ApiAvatarEntry {
    name: string;
    url: string;
    position: 'left' | 'right';
}

interface ApiResponse {
    dialogue: ApiDialogueEntry[];
    emojies: ApiEmojiEntry[];
    avatars: ApiAvatarEntry[];
}
// ---- End of API response data structures. ----

/**
 * Fetches dialogue data from the API and loads all avatar and emoji textures.
 */
export class DialogueService {
    private _phrases: DialoguePhrase[] = [];
    private _emojies: Map<string, DialogueEmoji> = new Map();

    async load(): Promise<void> {
        const response = await fetch(Config.magicWords.apiUrl);
        const data: ApiResponse = await response.json();

        const characters = new Map<string, DialogueCharacter>();
        for (const avatar of data.avatars) {
            characters.set(avatar.name, new DialogueCharacter(avatar.name, avatar.position, avatar.url));
        }

        for (const emoji of data.emojies) {
            this._emojies.set(emoji.name, new DialogueEmoji(emoji.name, emoji.url));
        }

        for (const entry of data.dialogue) {
            let character = characters.get(entry.name);
            if (!character) {
                // Character not in avatars list — default to right side, no avatar
                character = new DialogueCharacter(entry.name, 'right', '');
                characters.set(entry.name, character);
            }
            this._phrases.push(new DialoguePhrase(entry.text, character));
        }

        await this.loadTextures(characters, this._emojies);
    }

    private async loadTextures(
        characters: Map<string, DialogueCharacter>,
        emojies: Map<string, DialogueEmoji>,
    ): Promise<void> {
        const loads: Promise<void>[] = [];

        for (const char of characters.values()) {
            if (!char.avatarUrl) continue;
            loads.push(
                Assets.load<Texture>({ src: char.avatarUrl, parser: 'loadTextures' })
                    .then((texture) => { char.avatarTexture = texture; })
                    .catch(() => { /* Leave avatarTexture null on failure */ }),
            );
        }

        for (const emoji of emojies.values()) {
            loads.push(
                Assets.load<Texture>({ src: emoji.url, parser: 'loadTextures' })
                    .then((texture) => { emoji.texture = texture; })
                    .catch(() => { /* Leave texture null on failure */ }),
            );
        }

        await Promise.all(loads);
    }

    get phrases(): DialoguePhrase[] {
        return this._phrases;
    }

    // Returns only the emojis that loaded successfully, keyed by name.
    getEmojiMap(): Map<string, Texture> {
        const map = new Map<string, Texture>();
        for (const [name, data] of this._emojies) {
            if (data.texture) map.set(name, data.texture);
        }
        return map;
    }
}
