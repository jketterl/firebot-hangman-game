import {GameManager, GameSettings} from "@crowbartools/firebot-custom-scripts-types/types/modules/game-manager";
import {CommandManager} from "@crowbartools/firebot-custom-scripts-types/types/modules/command-manager";
import {TwitchChat} from "@crowbartools/firebot-custom-scripts-types/types/modules/twitch-chat";
import {EventManager} from "@crowbartools/firebot-custom-scripts-types/types/modules/event-manager";
import {CurrencyDB} from "@crowbartools/firebot-custom-scripts-types/types/modules/currency-db";

type Globals = {
    gameManager: GameManager;
    commandManager: CommandManager;
    twitchChat: TwitchChat;
    settings: GameSettings
    httpServer: any;
    eventManager: EventManager;
    currencyDb: CurrencyDB;
    request: any;
}

const globals: Globals = {
    gameManager: null,
    commandManager: null,
    twitchChat: null,
    settings: null,
    httpServer: null,
    eventManager: null,
    currencyDb: null,
    request: null,
}

export default globals