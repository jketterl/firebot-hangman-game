import {ReplaceVariable} from "@crowbartools/firebot-custom-scripts-types/types/modules/replace-variable-manager";

const HangmanWinnerVariable: ReplaceVariable = {
    definition: {
        handle: "hangmanWinner",
        description: "Winner of the hangman game",
        triggers: {
            event: [
                "de.justjakob.hangmangame:game-won"
            ],
            manual: true
        },
        possibleDataOutput: [
            "text"
        ]
    },
    evaluator: (trigger) => {
        return trigger.metadata.eventData.winner || ''
    }
}

const HangmanProviderVariable: ReplaceVariable = {
    definition: {
        handle: "hangmanProvider",
        description: "Where did the hangman word come from?",
        triggers: {
            event: [
                "de.justjakob.hangmangame:game-won",
                "de.justjakob.hangmangame:game-lost",
                "de.justjakob.hangmangame:game-ended"
            ],
            manual: true
        },
        possibleDataOutput: [
            "text"
        ]
    },
    evaluator: (trigger) => {
        return trigger.metadata.eventData.provider || ''
    }
}

const HangmanWordVariable: ReplaceVariable = {
    definition: {
        handle: "hangmanWord",
        description: "The word to be guessed in the hangman game",
        triggers: {
            event: [
                "de.justjakob.hangmangame:game-won",
                "de.justjakob.hangmangame:game-lost",
                "de.justjakob.hangmangame:game-ended",
            ],
            manual: true
        },
        possibleDataOutput: [
            "text"
        ]
    },
    evaluator: (trigger) => {
        return trigger.metadata.eventData.word || ''
    }
}

const HangmanDefinitionVariable: ReplaceVariable = {
    definition: {
        handle: "hangmanDefinition",
        description: "The dictionary definition of the hangman word, if available",
        triggers: {
            event: [
                "de.justjakob.hangmangame:game-won",
                "de.justjakob.hangmangame:game-lost",
                "de.justjakob.hangmangame:game-ended",
            ],
            manual: true
        },
        possibleDataOutput: [
            "text"
        ]
    },
    evaluator: (trigger) => {
        return trigger.metadata.eventData.definition || ''
    }
}

export { HangmanDefinitionVariable, HangmanProviderVariable, HangmanWinnerVariable, HangmanWordVariable }