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
        if (event.userCommand.args.length !== 1) {
            return
        }

        switch (event.userCommand.args[0]) {
            case "start":
                if (state.currentGame) {
                    globals.twitchChat.sendChatMessage("There is already a game of hangman running!", null, null, event.chatMessage.id)
                    return
                }
                // break intentionally omitted
            case "restart":
                state.currentGame = {
                    guesses: []
                }

                const word = await selectWord()
                Object.assign(state.currentGame, word)
                state.currentGame.word = state.currentGame.word.toLowerCase().trim()

                globals.twitchChat.sendChatMessage(renderCurrentWord());
                globals.httpServer.sendToOverlay("hangman", {letters: getLetters(), fails: getFails()});
                globals.commandManager.registerSystemCommand(guessCommand)
                globals.eventManager.triggerEvent('de.justjakob.hangmangame', 'game-started')
                break;
            case "stop":
                globals.commandManager.unregisterSystemCommand(guessCommand.definition.id)
                globals.httpServer.sendToOverlay("hangman", {});
                globals.eventManager.triggerEvent('de.justjakob.hangmangame', 'game-ended')
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

        const { userCommand } = event

        if (userCommand.args.length < 1) {
            globals.twitchChat.sendChatMessage("Invalid guess! Try again!", null, null, event.chatMessage.id)
            return
        }

        const username = userCommand.commandSender
        const { currencyId, guessCost, payout } = globals.settings.settings.currency

        if (guessCost) {
            const userBalance = await globals.currencyDb.getUserCurrencyAmount(username, currencyId);

            if (userBalance < guessCost) {
                globals.twitchChat.sendChatMessage(`Sorry, ${username}, you don't have enough points for a guess!`, null, null, event.chatMessage.id);
                return;
            }

            await globals.currencyDb.adjustCurrencyForUser(username, currencyId, -guessCost);
        }

        const guess = userCommand.args.join(' ').toLowerCase().trim();

        const winGame = async () => {
            if (payout) {
                await globals.currencyDb.adjustCurrencyForUser(username, currencyId, payout);
            }
            const fails = getFails();
            globals.twitchChat.sendChatMessage(`Congratulations, ${username}, you have successfully solved the hangman quiz! The solution was: "${state.currentGame.word}"`)
            sendDefinition()
            globals.commandManager.unregisterSystemCommand(guessCommand.definition.id)
            globals.httpServer.sendToOverlay("hangman", {letters: getLetters(true), fails: fails, finished: true, lingerTime: globals.settings.settings.overlay.lingerTime});
            globals.eventManager.triggerEvent('de.justjakob.hangmangame', 'game-won')
            globals.eventManager.triggerEvent('de.justjakob.hangmangame', 'game-ended')
            state.currentGame = null;
        }

        if (guess.length > 1) {
            // more than one letter -> solve attempt
            if (state.currentGame.word === guess) await winGame()
        } else {
            // single letter -> guess
            if (state.currentGame.guesses.includes(guess)) {
                globals.twitchChat.sendChatMessage(`Letter "${guess}" has already been guessed. Try again!`, null, null, event.chatMessage.id);
                return
            }

            state.currentGame.guesses.push(guess);

            if (isComplete()) {
                await winGame();
                return
            }

            const fails = getFails();

            if (fails >= 10) {
                globals.twitchChat.sendChatMessage(`Sorry, you did not solve the hangman quiz. The correct word was: "${state.currentGame.word}"`)
                sendDefinition()
                globals.commandManager.unregisterSystemCommand(guessCommand.definition.id)
                globals.httpServer.sendToOverlay("hangman", {letters: getLetters(true), fails: fails, finished: true, lingerTime: globals.settings.settings.overlay.lingerTime});
                globals.eventManager.triggerEvent('de.justjakob.hangmangame', 'game-lost')
                globals.eventManager.triggerEvent('de.justjakob.hangmangame', 'game-ended')
                state.currentGame = null;
                return
            }

            globals.twitchChat.sendChatMessage(renderCurrentWord());
            globals.httpServer.sendToOverlay("hangman", {letters: getLetters(), fails});
        }
    }
}

function sendDefinition() {
    const { provider, definition } = state.currentGame
    if (!provider || !definition) return
    globals.twitchChat.sendChatMessage(`Definition from ${provider}: ${definition}`)
}

async function selectWord() {
    const source = globals.settings.settings.wordSource.source || "file";

    switch (source) {
        case "file":
            return new Promise((resolve, reject) => {
                fs.readFile(globals.settings.settings.wordSource.dictionaryFile, "utf-8", function(err, data) {
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
                globals.request('https://api.urbandictionary.com/v0/random', function(err, response, body) {
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

function isLetterShown(letter) {
    return letter === ' ' || state.currentGame.guesses.includes(letter);
}

function isComplete() {
    return state.currentGame.word.split('').reduce((prev, curr) => {
        return prev && isLetterShown(curr);
    }, true)
}

function getLetters(won) {
    return state.currentGame.word.split('').map(letter =>
        won || isLetterShown(letter) ? letter : null
    ).map(letter =>
        // transform space into a visible space character
        letter === ' ' ? '␣' : letter
    )
}

function getFails() {
    const filtered = state.currentGame.guesses.filter(letter =>
        !state.currentGame.word.includes(letter)
    )
    return filtered.length
}

function renderCurrentWord() {
    return getLetters().map(letter => letter ? letter : '_').join(' ')
}

const hangmanStyles = `
    .hangman {
        color: white;
        position: absolute;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%);
    }
    
    .hangman-gallows {
        width: 400px;
        height: 400px;
    }
    
    .hangman-gallows svg {
        width: 100%;
    }
    
    .hangman-gallows .hangman-elements {
        stroke: white;
    }
    
    .hangman-gallows .hangman-elements * {
        display: none;
    } 
    
    .hangman-letters {
        font-size: 24pt;
        text-shadow: 0 0 3px black;
        text-align: center;
    }
`

const hangmanEffect = {
    definition: {
        id: "de.justjakob.hangmangame::overlayEffect",
        name: "Hangman overlay",
        description: "Hangman overlay",
        icon: "fa-sign-hanging",
        categories: [],
        dependency: [],
    },
    globalSettings: {},
    optionsTemplate: ``,
    optionsController: ($scope, utilityService) => {

    },
    optionsValidator: effect => {
        return []
    },
    onTriggerEvent: async event => {
        return true;
    },
    overlayExtension: {
        dependencies: {
            css: [],
            globalStyles: hangmanStyles,
            js: []
        },
        event: {
            name: "hangman",
            onOverlayEvent: data => {
                const $wrapper = $('.wrapper')
                let $el = $wrapper.find('.hangman')

                if (data.letters) {
                    if (!$el.length) {
                        $el = $(`
                            <div class="hangman">
                                <div class="hangman-gallows">
                                    <svg viewbox="0 0 210 210">
                                        <g class="hangman-elements" style="fill:none;stroke-width:5;stroke-linecap:round;stroke-dasharray:none;stroke-opacity:1" transform="translate(5,5)">
                                            <path d="M 0,200 H 200" />
                                            <path d="M 150,200 V 0" />
                                            <path d="M 150,0 H 75" />
                                            <path d="M 75,0 V 50" />
                                            <circle cx="75" cy="75" r="25" />
                                            <path d="m 75,100 v 50" />
                                            <path d="M 75,115 115,95" />
                                            <path d="M 75,115 35,90" />
                                            <path d="m 75,150 40,25" />
                                            <path d="M 75,150 35,175" />
                                        </g>
                                    </svg>
                                </div>
                                <div class="hangman-letters"></div>
                            </div>`)
                        $wrapper.append($el);
                    }

                    $el.find('.hangman-letters').text(data.letters ? data.letters.map(l => l ? l : "_").join(' ') : '')

                    const fails = data.fails || 0;

                    $el.find('.hangman-elements *').each(function (index) {
                        $(this)[(index >= fails ? 'hide' : 'show')]();
                    });

                    if (data.finished) setTimeout(() => {
                        $el.remove()
                    }, (data.lingerTime || 5) * 1000)
                } else {
                    $el.remove();
                }
            }
        }
    }
}

const hangmanEventSource = {
    id: "de.justjakob.hangmangame",
    name: "Hangman",
    description: "Events from the Hangman game.",
    events: [{
        id: "game-started",
        name: "Game started",
        description: "When a new game is started",
        cached: false
    },{
        id: "game-ended",
        name: "Game ended",
        description: "When a game ends (independent of outcome)",
        cached: false
    },{
        id: "game-won",
        name: "Game won",
        description: "When a game is won",
        cached: false
    },{
        id: "game-lost",
        name: "Game lost",
        description: "When a game is lost",
        cached: false
    }]
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
        wordSource: {
            title: "Dictionary settings",
            description: "Where to find words to guess for hangman",
            sortRank: 1,
            settings: {
                source: {
                    type: "enum",
                    title: "Guessword source",
                    description: "Where to get words to guess from",
                    default: "file",
                    sortRank: 2,
                    options: {
                        file: "Dictionary file",
                        // wordnik: "Wordnik API",
                        urbandictionary: "Urban Dictionary API (explicit)",
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
                },
                wordnikApiKey: {
                    type: "string",
                    title: "Wordnik API key",
                    description: "Get an API key for Wordnik over on wordnik.com",
                    default: "",
                    sortRank: 4,
                    validation: {
                        required: false
                    }
                }
            }
        },
        overlay: {
            title: "Overlay settings",
            description: "Settings for the hangman display on the firebot overlay",
            sortRank: 5,
            settings: {
                lingerTime: {
                    type: "number",
                    title: "Overlay linger time",
                    description: "How long the hangman overlay should stay on screen after a game is finished (in seconds)",
                    default: 5,
                    sortRank: 6,
                    validation: {
                        required: false,
                        min: 0
                    }
                }
            }
        },
        currency: {
            title: "Currency settings",
            description: "Configure costs and rewards",
            sortRank: 7,
            settings: {
                currencyId: {
                    type: "currency-select",
                    title: "Currency",
                    description: "Which currency to use",
                    sortRank: 8,
                    validation: {
                        required: true
                    }
                },
                guessCost: {
                    type: "number",
                    title: "Guess cost",
                    description: "How much will a single guess cost",
                    default: 0,
                    sortRank: 9,
                    validation: {
                        required: false
                    }
                },
                payout: {
                    type: "number",
                    title: "Payout",
                    description: "How much the winner of a game will receive",
                    default: 0,
                    sortRank: 10,
                    validation: {
                        required: false
                    }
                }
            }
        }
    },
    onLoad: gameSettings => {
        globals.settings = gameSettings;
        globals.commandManager.registerSystemCommand(hangmanCommand)
    },
    onUnload: gameSettings => {
        globals.settings = gameSettings;
        globals.commandManager.unregisterSystemCommand(hangmanCommand.definition.id)
        globals.commandManager.unregisterSystemCommand(guessCommand.definition.id)
    },
    onSettingsUpdate: gameSettings => {
        // this seems to be undefined, so i don't think this works as intended
        //globals.settings = gameSettings
    }
}

const globals = {
    gameManager: null,
    commandManager: null,
    twitchChat: null,
    settings: null,
    httpServer: null,
    eventManager: null,
    currencyDb: null,
    request: null,
}

module.exports = {
    run: runRequest => {
        // this is ugly, but i currently don't know how to get to these objects at a later point.
        globals.gameManager = runRequest.modules.gameManager;
        globals.commandManager = runRequest.modules.commandManager;
        globals.twitchChat = runRequest.modules.twitchChat;
        globals.httpServer = runRequest.modules.httpServer;
        globals.eventManager = runRequest.modules.eventManager;
        globals.currencyDb = runRequest.modules.currencyDb;
        globals.request = runRequest.modules.request;
        runRequest.modules.gameManager.registerGame(gameDef);
        runRequest.modules.eventManager.registerEventSource(hangmanEventSource);
        runRequest.modules.effectManager.registerEffect(hangmanEffect)
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