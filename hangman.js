const fs = require('fs');

const state = {
    currentGame: null
}

const hangmanCommand = {
    definition: {
        id: "de.justjakob.hangmangame::hangman",
        name: "Hangman control",
        active: true,
        trigger: "!hangman",
        description: "Hangman game control",
        subCommands: [{
            id: "de.justjakob.hangmangame::start",
            arg: "start",
            regex: false,
            usage: "start",
            description: "Start a new game of hangman."
        },{
            id: "de.justjakob.hangmangame::restart",
            arg: "restart",
            regex: false,
            usage: "restart",
            description: "Restart the hangman game."
        },{
            id: "de.justjakob.hangmangame::stop",
            arg: "stop",
            regex: false,
            usage: "stop",
            description: "Stop the current game of hangman."
        }]
    },
    onTriggerEvent: async event => {
        if (event.userCommand.args.length != 1) {
            return
        }

        switch (event.userCommand.args[0]) {
            case "start":
                if (state.currentGame) {
                    globals.twitchChat.sendChatMessage("There is already a game of hangman running!")
                    return
                }
                // break intentionally omitted
            case "restart":
                state.currentGame = {
                    word: (await selectWord()).toLowerCase().trim(),
                    guesses: []
                }
                globals.twitchChat.sendChatMessage(renderCurrentWord());
                globals.commandManager.registerSystemCommand(guessCommand)
                break;
            case "stop":
                console.info("stopping hangman")
                globals.commandManager.unregisterSystemCommand(guessCommand.definition.id)
                state.currentGame = null;
                break;
        }
    }
}

const guessCommand = {
    definition: {
        id: "de.justjakob.hangmangame::guess",
        name: "Guess",
        active: true,
        trigger: "!guess",
        description: "Guess a letter or word in a game of hangman.",
        subCommands: [{
            id: "de.justjakob.hangmangame::guessLetter",
            arg: ".",
            regex: true,
            usage: "[letter]",
            description: "Guess a letter"
        },{
            id: "de.justjakob.hangmangame::guessWord",
            arg: ".{2,}",
            regex: true,
            usage: "[word]",
            description: "Guess a word"
        }]
    },
    onTriggerEvent: async event => {
        if (!state.currentGame) {
            return
        }

        if (event.userCommand.args.length != 1) {
            globals.twitchChat.sendChatMessage("Invalid guess! Try again!")
            return
        }

        const guess = event.userCommand.args[0].toLowerCase().trim();

        if (guess.length > 1) {
            // more than one letter -> solve attempt
            if (state.currentGame.word == guess) {
                globals.twitchChat.sendChatMessage('Congratulations, you have successfully solved the hangman quiz! The solution was: "' + state.currentGame.word + '"')
                globals.commandManager.unregisterSystemCommand(guessCommand.definition.id)
                state.currentGame = null;
            }
        } else {
            // single letter -> guess
            if (state.currentGame.guesses.includes(guess)) {
                globals.twitchChat.sendChatMessage('Letter "' + guess + '" has already been guessed. Try again!');
                return
            }

            state.currentGame.guesses.push(guess);

            if (isComplete()) {
                globals.twitchChat.sendChatMessage('Congratulations, you have successfully solved the hangman quiz! The solution was: "' + state.currentGame.word + '"')
                globals.commandManager.unregisterSystemCommand(guessCommand.definition.id)
                state.currentGame = null;
                return
            }

            globals.twitchChat.sendChatMessage(renderCurrentWord());
        }
    }
}

async function selectWord() {
    if (globals.settings.settings.wordSource.dictionaryFile) {
        return new Promise((resolve, reject) => {
            fs.readFile(globals.settings.settings.wordSource.dictionaryFile, "utf-8", function(err, data) {
                if (err) {
                    reject(err)
                    return
                }

                const lines = data.split('\n');

                resolve(lines[Math.floor(Math.random() * lines.length)])
            })
        })
    }
    return Promise.resolve("innuendo")
}

function isComplete() {
    return state.currentGame.word.split('').reduce((prev, curr) => {
        return prev && state.currentGame.guesses.includes(curr);
    })
}

function renderCurrentWord() {
    return state.currentGame.word.split('').map((curr) => {
        if (state.currentGame.guesses.includes(curr)) {
            return curr;
        } else {
            return "_";
        }
    }).join(' ')
}

 /**
  * @type {import('../../game-manager').FirebotGame}
  */
const gameDef = {
    id: "de.justjakob.hangmangame", // unique id for the game
    name: "Hangman", // human readable name for the game
    subtitle: "Alphabet Dangle", // very short tagline for the game, shows up in the games tab
    description: "Interactive word guessing game", // verbose description of the game, shown when clicking edit on the game
    icon: "sign-hanging", // Font Awesome 5 icon to use for the game
    settingCategories: {
        wordSource:{
            title: "Dictionary settings",
            description: "Where to find words to guess for hangman",
            sortRank: 1,
            settings: {
                wordnikApiKey: {
                    type: "string",
                    title: "Wordnik API key",
                    description: "Get an API key for Wordnik over on wordnik.com",
                    default: "",
                    sortRank: 2,
                    validation: {
                        required: false
                    }
                },
                dictionaryFile: {
                    type: "filepath",
                    title: "Dictionary file",
                    description: "A file containing words to randomly select from (one word per line)",
                    default: "",
                    sortRank: 3,
                    validation: {
                        required: false
                    }
                }
            }
        }
    },
    onLoad: gameSettings => {
        globals.commandManager.registerSystemCommand(hangmanCommand)
        globals.settings = gameSettings;
    },
    onUnload: gameSettings => {
        globals.commandManager.unregisterSystemCommand(hangmanCommand.definition.id)
        globals.commandManager.unregisterSystemCommand(guessCommand.definition.id)
    },
    onSettingsUpdate: gameSettings => {
        globals.settings = gameSettings
    },
}

const globals = {
    gameManager: null,
    commandManager: null,
    twitchChat: null,
    settings: null
}

module.exports = {
    run: runRequest => {
        // this is ugly, but i currently don't know how to get to these objects at a later point.
        globals.gameManager = runRequest.modules.gameManager;
        globals.commandManager = runRequest.modules.commandManager;
        globals.twitchChat = runRequest.modules.twitchChat;
        runRequest.modules.gameManager.registerGame(gameDef);
    },
    getScriptManifest: () => {
        return {
            name: "Hangman",
            description: "Hangman game",
            author: "Jakob Ketterl",
            version: "0.1"
        }
    }
};