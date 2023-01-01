import { FirebotGame } from "@crowbartools/firebot-custom-scripts-types/types/modules/game-manager";
import globals from "./globals";
import {HangmanGame} from "./game";
import {HangmanCommand, GuessCommand} from "./commands";

const HangmanGameDefinition: FirebotGame = {
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
                    tip: "",
                    showBottomHr: false,
                    default: "file",
                    sortRank: 2,
                    //@ts-ignore firebot types don't know about enum options
                    options: {
                        file: "Dictionary file",
                        // wordnik: "Wordnik API",
                        urbandictionary: "Urban Dictionary API (explicit)",
                    },
                    validation: {
                        required: true,
                    }
                },
                dictionaryFile: {
                    type: "filepath",
                    title: "Dictionary file",
                    description: "A file containing words to randomly select from (one word per line)",
                    tip: "",
                    showBottomHr: false,
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
                    tip: "",
                    showBottomHr: false,
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
                position: {
                    type: "enum",
                    title: "Overlay position",
                    description: "Where should the overlay appear on screen?",
                    tip: "",
                    showBottomHr: false,
                    default: "center-center",
                    sortRank: 6,
                    //@ts-ignore firebot types don't know about enum options
                    options: {
                        "top-left": "Top left",
                        "top-center": "Top center",
                        "top-right": "Top right",
                        "center-left": "Center left",
                        "center-center": "Center",
                        "center-right": "Center right",
                        "bottom-left": "Bottom left",
                        "bottom-center": "Bottom center",
                        "bottom-right": "Bottom right"
                    },
                    validation: {
                        required: true
                    }
                },
                lingerTime: {
                    type: "number",
                    title: "Overlay linger time",
                    description: "How long the hangman overlay should stay on screen after a game is finished (in seconds)",
                    tip: "",
                    showBottomHr: false,
                    default: 5,
                    sortRank: 7,
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
            sortRank: 8,
            settings: {
                currencyId: {
                    type: "currency-select",
                    title: "Currency",
                    description: "Which currency to use",
                    tip: "",
                    showBottomHr: false,
                    default: null,
                    sortRank: 9,
                    validation: {
                        required: true
                    }
                },
                guessCost: {
                    type: "number",
                    title: "Guess cost",
                    description: "How much will a single guess cost",
                    tip: "",
                    showBottomHr: false,
                    default: 0,
                    sortRank: 10,
                    validation: {
                        required: false
                    }
                },
                payout: {
                    type: "number",
                    title: "Payout",
                    description: "How much the winner of a game will receive",
                    tip: "",
                    showBottomHr: false,
                    default: 0,
                    sortRank: 11,
                    validation: {
                        required: false
                    }
                }
            }
        }
    },
    onLoad: gameSettings => {
        if (gameSettings) globals.settings = gameSettings;
        globals.commandManager.registerSystemCommand(HangmanCommand)
    },
    onUnload: gameSettings => {
        // this seems to be undefined, so i don't think this works as intended
        //globals.settings = gameSettings
        if (HangmanGame.currentGame) {
            globals.httpServer.sendToOverlay("hangman", {})
            globals.eventManager.triggerEvent('de.justjakob.hangmangame', 'game-ended', { wordDefinition: HangmanGame.currentGame.wordDefinition })
        }
        HangmanGame.currentGame = null
        globals.commandManager.unregisterSystemCommand(HangmanCommand.definition.id)
        globals.commandManager.unregisterSystemCommand(GuessCommand.definition.id)
    },
    onSettingsUpdate: gameSettings => {
        // this seems to be undefined, so i don't think this works as intended
        //globals.settings = gameSettings
        if (HangmanGame.currentGame) {
            globals.httpServer.sendToOverlay("hangman", {
                letters: HangmanGame.currentGame.getLetters(),
                fails: HangmanGame.currentGame.getFails(),
                position: globals.settings.settings.overlay.position
            });
        }
    }
}

export default HangmanGameDefinition