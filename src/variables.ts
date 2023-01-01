import {ReplaceVariable} from "@crowbartools/firebot-custom-scripts-types/types/modules/replace-variable-manager";
import {WordDefinition} from "./game";

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
        const wordDefinition = trigger.metadata.eventData.wordDefinition as WordDefinition
        return wordDefinition.provider
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
        const wordDefinition = trigger.metadata.eventData.wordDefinition as WordDefinition
        return wordDefinition.word
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
        const wordDefinition = trigger.metadata.eventData.wordDefinition as WordDefinition
        return wordDefinition.definition || ''
    }
}

const HangmanExampleVariable: ReplaceVariable = {
    definition: {
        handle: "hangmanExample",
        description: "The dictionary example of the hangman word, if available",
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
        const wordDefinition = trigger.metadata.eventData.wordDefinition as WordDefinition
        return wordDefinition.example || ''
    }
}

export {
    HangmanDefinitionVariable,
    HangmanProviderVariable,
    HangmanWinnerVariable,
    HangmanWordVariable,
    HangmanExampleVariable
}