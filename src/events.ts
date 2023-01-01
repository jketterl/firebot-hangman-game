import { EventSource } from "@crowbartools/firebot-custom-scripts-types/types/modules/event-manager";

const HangmanEventSource: EventSource = {
    id: "de.justjakob.hangmangame",
    name: "Hangman",
    events: [{
        id: "game-started",
        name: "Game started",
        description: "When a new game is started",
        cached: false
    },{
        id: "game-ended",
        name: "Game ended",
        description: "When a game ends (independent of outcome)",
        cached: false,
        manualMetadata: {
            wordDefinition:{
                provider: "dummy",
                word: "random",
                definition: "made, done, or happening without method or conscious decision."
            }
        }
    },{
        id: "game-won",
        name: "Game won",
        description: "When a game is won",
        cached: false,
        manualMetadata: {
            winner: "Firebot",
            wordDefinition: {
                provider: "dummy",
                word: "random",
                definition: "made, done, or happening without method or conscious decision."
            }
        }
    },{
        id: "game-lost",
        name: "Game lost",
        description: "When a game is lost",
        cached: false,
        manualMetadata: {
            wordDefinition: {
                provider: "dummy",
                word: "random",
                definition: "made, done, or happening without method or conscious decision."
            }
        }
    }]
}

export default HangmanEventSource