import {Effects} from "@crowbartools/firebot-custom-scripts-types/types/effects";
import globals from "./globals";
import {HangmanGame} from "./game";
import {HangmanCommand} from "./commands";

const HangmanTriggerEffect: Effects.EffectType<any> = {
    definition: {
        id: "de.justjakob.hangmangame::startEffect",
        name: "Trigger hangman",
        description: "Starts a new game of hangman",
        icon: "fa-sign-hanging",
        categories: [],
    },
    onTriggerEvent: async event => {
        if (!globals.settings.active) return Promise.reject(new Error("Hangman game is not active"))
        if (HangmanGame.currentGame) return Promise.reject(new Error("There is already a game of hangman running"))
        HangmanGame.currentGame = await HangmanGame.newGame()
    },
    optionsTemplate: ''
}

export default HangmanTriggerEffect