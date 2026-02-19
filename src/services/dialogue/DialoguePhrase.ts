import { DialogueCharacter } from './DialogueCharacter';

export class DialoguePhrase {
    readonly text: string;
    readonly character: DialogueCharacter;

    constructor(text: string, character: DialogueCharacter) {
        this.text = text;
        this.character = character;
    }
}
