import { Firebot } from "@crowbartools/firebot-custom-scripts-types";
import HangmanGameDefinition from "./gamedef"
import HangmanEventSource from "./events";
import HangmanOverlayEffect from "./overlay";
import HangmanTriggerEffect from "./trigger";
import {HangmanWinnerVariable, HangmanWordVariable, HangmanProviderVariable, HangmanDefinitionVariable, HangmanExampleVariable} from "./variables";
import globals from "./globals";

const script: Firebot.CustomScript = {
    getScriptManifest: () => {
        return {
            name: "Hangman",
            description: "Hangman game",
            author: "Jakob Ketterl",
            version: "0.1"
        }
    },
    getDefaultParameters: () => {
        return {}
    },
    run: (runRequest) => {
        // this is ugly, but i currently don't know how to get to these objects at a later point.
        globals.gameManager = runRequest.modules.gameManager
        globals.commandManager = runRequest.modules.commandManager
        globals.twitchChat = runRequest.modules.twitchChat
        globals.httpServer = runRequest.modules.httpServer
        globals.eventManager = runRequest.modules.eventManager
        globals.currencyDb = runRequest.modules.currencyDb
        globals.request = runRequest.modules.request
        runRequest.modules.gameManager.registerGame(HangmanGameDefinition)
        runRequest.modules.eventManager.registerEventSource(HangmanEventSource)
        runRequest.modules.effectManager.registerEffect(HangmanOverlayEffect)
        runRequest.modules.effectManager.registerEffect(HangmanTriggerEffect);
        [
            HangmanWinnerVariable,
            HangmanProviderVariable,
            HangmanWordVariable,
            HangmanDefinitionVariable,
            HangmanExampleVariable
        ].forEach(v => {
            runRequest.modules.replaceVariableManager.registerReplaceVariable(v)
        })
    }
}

export default script;