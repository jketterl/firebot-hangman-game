import * as fs from "fs";
import globals from "./globals";
import { GuessCommand } from "./commands"

export type WordDefinition = {
    word: string;
    provider: string;
    definition?: string;
    example?: string;
}

export class HangmanGame {
    static currentGame? : HangmanGame

    static async newGame(): Promise<HangmanGame> {
        return new HangmanGame(await HangmanGame.selectWord())
    }

    static async selectWord(): Promise<WordDefinition> {
        const source = globals.settings.settings.wordSource.source || "file";

        switch (source) {
            case "file":
                return new Promise((resolve, reject) => {
                    fs.readFile(globals.settings.settings.wordSource.dictionaryFile, "utf-8", (err: Error, data: string) => {
                        if (err) return reject(err)

                        const lines = data.split('\n');

                        resolve({
                            word: lines[Math.floor(Math.random() * lines.length)],
                            provider: "Dictionary file"
                        })
                    })
                })
            case "urbandictionary":
                return new Promise((resolve, reject) => {
                    globals.request('https://api.urbandictionary.com/v0/random', (err: Error, response: any, body: string) => {
                        if (err) return reject(err)

                        try {
                            const result = JSON.parse(body)
                            const { list } = result
                            const item = list[Math.floor(Math.random() * list.length)];
                            const { word, definition, example } = item
                            resolve({
                                word, definition, example,
                                provider: "Urban Dictionary"
                            })
                        } catch (e) {
                            reject(e);
                        }
                    })
                })
        }

        return Promise.reject(new Error("Selected hangman guessword source is invalid!"))
    }

    guesses: string[] = [];
    wordDefinition: WordDefinition;
    word: string;

    private constructor(word: WordDefinition) {
        this.wordDefinition = word
        this.word = this.wordDefinition.word.toLowerCase().trim()

        globals.twitchChat.sendChatMessage(this.renderWord());
        globals.httpServer.sendToOverlay("hangman", {letters: this.getLetters(), fails: this.getFails(), position: globals.settings.settings.overlay.position});
        globals.commandManager.registerSystemCommand(GuessCommand)
        globals.eventManager.triggerEvent('de.justjakob.hangmangame', 'game-started', {})
    }

    renderWord(): string {
        return this.getLetters().map(letter => letter ? letter : '_').join(' ')
    }

    getLetters(won?:boolean): string[] {
        return this.word.split('').map(letter =>
            won || this.isLetterShown(letter) ? letter : null
        ).map(letter =>
            // transform space into a visible space character
            letter === ' ' ? '␣' : letter
        )
    }

    isLetterShown(letter: string): boolean {
        return letter === ' ' || this.guesses.includes(letter);
    }

    getFails() {
        const filtered = this.guesses.filter(letter =>
            !this.word.includes(letter)
        )
        return filtered.length
    }

    isComplete() {
        return this.word.split('').reduce((prev, curr) => {
            return prev && this.isLetterShown(curr);
        }, true)
    }

}