import {SystemCommand} from "@crowbartools/firebot-custom-scripts-types/types/modules/command-manager";
import globals from "./globals";
import {HangmanGame} from "./game";

const HangmanCommand: SystemCommand = {
    definition: {
        id: "de.justjakob.hangmangame::hangman",
        name: "Hangman control",
        active: true,
        trigger: "!hangman",
        description: "Hangman game control",
        subCommands: [{
            name: "Hangman start command",
            active: true,
            trigger: '',
            id: "de.justjakob.hangmangame::start",
            arg: "start",
            regex: false,
            usage: "start",
            description: "Start a new game of hangman."
        },{
            name: "Hangman restart command",
            active: true,
            trigger: '',
            id: "de.justjakob.hangmangame::restart",
            arg: "restart",
            regex: false,
            usage: "restart",
            description: "Restart the hangman game."
        },{
            name: "Hangman stop command",
            active: true,
            trigger: '',
            id: "de.justjakob.hangmangame::stop",
            arg: "stop",
            regex: false,
            usage: "stop",
            description: "Stop the current game of hangman."
        }]
    },
    onTriggerEvent: async event => {
        if (event.userCommand.args.length !== 1) {
            return
        }

        switch (event.userCommand.args[0]) {
            case "start":
                if (HangmanGame.currentGame) {
                    //@ts-ignore firebot types are not updated for message responses
                    globals.twitchChat.sendChatMessage("There is already a game of hangman running!", null, null, event.chatMessage.id)
                    return
                }
            // break intentionally omitted
            case "restart":
                HangmanGame.currentGame = await HangmanGame.newGame()
                break;
            case "stop":
                globals.commandManager.unregisterSystemCommand(GuessCommand.definition.id)
                if (HangmanGame.currentGame) {
                    globals.httpServer.sendToOverlay("hangman", {})
                    globals.eventManager.triggerEvent('de.justjakob.hangmangame', 'game-ended', { wordDefinition: HangmanGame.currentGame.wordDefinition })
                }
                HangmanGame.currentGame = null
                break;
        }
    }
}

const GuessCommand: SystemCommand = {
    definition: {
        id: "de.justjakob.hangmangame::guess",
        name: "Guess",
        active: true,
        trigger: "!guess",
        description: "Guess a letter or word in a game of hangman.",
        subCommands: [{
            name: "Hangman guess letter command",
            active: true,
            trigger: '',
            id: "de.justjakob.hangmangame::guessLetter",
            arg: ".",
            regex: true,
            usage: "[letter]",
            description: "Guess a letter"
        },{
            name: "Hangman guess word command",
            active: true,
            trigger: '',
            id: "de.justjakob.hangmangame::guessWord",
            arg: ".{2,}",
            regex: true,
            usage: "[word]",
            description: "Guess a word"
        }]
    },
    onTriggerEvent: async event => {
        if (!HangmanGame.currentGame) {
            return
        }

        const { userCommand } = event

        if (userCommand.args.length < 1) {
            //@ts-ignore firebot types are not updated for message responses
            globals.twitchChat.sendChatMessage("Invalid guess! Try again!", null, null, event.chatMessage.id)
            return
        }

        const username = userCommand.commandSender
        const { currencyId, guessCost, payout } = globals.settings.settings.currency

        if (guessCost) {
            const userBalance = await globals.currencyDb.getUserCurrencyAmount(username, currencyId);

            if (userBalance < guessCost) {
                //@ts-ignore firebot types are not updated for message responses
                globals.twitchChat.sendChatMessage(`Sorry, ${username}, you don't have enough points for a guess!`, null, null, event.chatMessage.id);
                return;
            }

            await globals.currencyDb.adjustCurrencyForUser(username, currencyId, -guessCost);
        }

        const guess = userCommand.args.join(' ').toLowerCase().trim();

        const sendDefinition = () => {
            const { provider, definition } = HangmanGame.currentGame.wordDefinition
            if (!provider || !definition) return
            globals.twitchChat.sendChatMessage(`Definition from ${provider}: ${definition}`)
        }

        const winGame = async () => {
            if (payout) {
                await globals.currencyDb.adjustCurrencyForUser(username, currencyId, payout);
            }
            const fails = HangmanGame.currentGame.getFails();
            globals.twitchChat.sendChatMessage(`Congratulations, ${username}, you have successfully solved the hangman quiz! The solution was: "${HangmanGame.currentGame.word}"`)
            sendDefinition()
            globals.commandManager.unregisterSystemCommand(GuessCommand.definition.id)
            globals.httpServer.sendToOverlay("hangman", {letters: HangmanGame.currentGame.getLetters(true), fails: fails, finished: true, lingerTime: globals.settings.settings.overlay.lingerTime});
            globals.eventManager.triggerEvent('de.justjakob.hangmangame', 'game-won', {winner: username, wordDefinition: HangmanGame.currentGame.wordDefinition})
            globals.eventManager.triggerEvent('de.justjakob.hangmangame', 'game-ended', {winner: username, wordDefinition: HangmanGame.currentGame.wordDefinition})
            HangmanGame.currentGame = null;
        }

        if (guess.length > 1) {
            // more than one letter -> solve attempt
            if (HangmanGame.currentGame.isWordCorrect(guess)) await winGame()
        } else {
            // single letter -> guess
            if (HangmanGame.currentGame.hasBeenGuessed(guess)) {
                //@ts-ignore firebot types are not updated for message responses
                globals.twitchChat.sendChatMessage(`Letter "${guess}" has already been guessed. Try again!`, null, null, event.chatMessage.id);
                return
            }

            if (HangmanGame.currentGame.guessLetter(guess)) {
                await winGame();
                return
            }

            const fails = HangmanGame.currentGame.getFails();

            if (fails >= 10) {
                globals.twitchChat.sendChatMessage(`Sorry, you did not solve the hangman quiz. The correct word was: "${HangmanGame.currentGame.word}"`)
                sendDefinition()
                globals.commandManager.unregisterSystemCommand(GuessCommand.definition.id)
                globals.httpServer.sendToOverlay("hangman", {letters: HangmanGame.currentGame.getLetters(true), fails: fails, finished: true, lingerTime: globals.settings.settings.overlay.lingerTime});
                globals.eventManager.triggerEvent('de.justjakob.hangmangame', 'game-lost', {wordDefinition: HangmanGame.currentGame.wordDefinition})
                globals.eventManager.triggerEvent('de.justjakob.hangmangame', 'game-ended', {wordDefinition: HangmanGame.currentGame.wordDefinition})
                HangmanGame.currentGame = null;
                return
            }

            globals.twitchChat.sendChatMessage(HangmanGame.currentGame.renderWord());
            globals.httpServer.sendToOverlay("hangman", {letters: HangmanGame.currentGame.getLetters(), fails});
        }
    }
}

export { HangmanCommand, GuessCommand }