(()=>{"use strict";var __webpack_modules__={49:function(__unused_webpack_module,exports,__webpack_require__){var __awaiter=this&&this.__awaiter||function(thisArg,_arguments,P,generator){return new(P||(P=Promise))((function(resolve,reject){function fulfilled(value){try{step(generator.next(value))}catch(e){reject(e)}}function rejected(value){try{step(generator.throw(value))}catch(e){reject(e)}}function step(result){var value;result.done?resolve(result.value):(value=result.value,value instanceof P?value:new P((function(resolve){resolve(value)}))).then(fulfilled,rejected)}step((generator=generator.apply(thisArg,_arguments||[])).next())}))};Object.defineProperty(exports,"__esModule",{value:!0}),exports.GuessCommand=exports.HangmanCommand=void 0;const globals_1=__webpack_require__(888),game_1=__webpack_require__(769),HangmanCommand={definition:{id:"de.justjakob.hangmangame::hangman",name:"Hangman control",active:!0,trigger:"!hangman",description:"Hangman game control",subCommands:[{name:"Hangman start command",active:!0,trigger:"",id:"de.justjakob.hangmangame::start",arg:"start",regex:!1,usage:"start",description:"Start a new game of hangman."},{name:"Hangman restart command",active:!0,trigger:"",id:"de.justjakob.hangmangame::restart",arg:"restart",regex:!1,usage:"restart",description:"Restart the hangman game."},{name:"Hangman stop command",active:!0,trigger:"",id:"de.justjakob.hangmangame::stop",arg:"stop",regex:!1,usage:"stop",description:"Stop the current game of hangman."}]},onTriggerEvent:event=>__awaiter(void 0,void 0,void 0,(function*(){if(1===event.userCommand.args.length)switch(event.userCommand.args[0]){case"start":if(game_1.HangmanGame.currentGame)return void globals_1.default.twitchChat.sendChatMessage("There is already a game of hangman running!",null,null,event.chatMessage.id);case"restart":game_1.HangmanGame.currentGame=yield game_1.HangmanGame.newGame();break;case"stop":globals_1.default.commandManager.unregisterSystemCommand(GuessCommand.definition.id),game_1.HangmanGame.currentGame&&(globals_1.default.httpServer.sendToOverlay("hangman",{}),globals_1.default.eventManager.triggerEvent("de.justjakob.hangmangame","game-ended",{wordDefinition:game_1.HangmanGame.currentGame.wordDefinition})),game_1.HangmanGame.currentGame=null}}))};exports.HangmanCommand=HangmanCommand;const GuessCommand={definition:{id:"de.justjakob.hangmangame::guess",name:"Guess",active:!0,trigger:"!guess",description:"Guess a letter or word in a game of hangman.",subCommands:[{name:"Hangman guess letter command",active:!0,trigger:"",id:"de.justjakob.hangmangame::guessLetter",arg:".",regex:!0,usage:"[letter]",description:"Guess a letter"},{name:"Hangman guess word command",active:!0,trigger:"",id:"de.justjakob.hangmangame::guessWord",arg:".{2,}",regex:!0,usage:"[word]",description:"Guess a word"}]},onTriggerEvent:event=>__awaiter(void 0,void 0,void 0,(function*(){if(!game_1.HangmanGame.currentGame)return;const{userCommand}=event;if(userCommand.args.length<1)return void globals_1.default.twitchChat.sendChatMessage("Invalid guess! Try again!",null,null,event.chatMessage.id);const username=userCommand.commandSender,{currencyId,guessCost,payout}=globals_1.default.settings.settings.currency;if(guessCost){if((yield globals_1.default.currencyDb.getUserCurrencyAmount(username,currencyId))<guessCost)return void globals_1.default.twitchChat.sendChatMessage(`Sorry, ${username}, you don't have enough points for a guess!`,null,null,event.chatMessage.id);yield globals_1.default.currencyDb.adjustCurrencyForUser(username,currencyId,-guessCost)}const guess=userCommand.args.join(" ").toLowerCase().trim(),sendDefinition=()=>{const{provider,definition}=game_1.HangmanGame.currentGame.wordDefinition;provider&&definition&&globals_1.default.twitchChat.sendChatMessage(`Definition from ${provider}: ${definition}`)},winGame=()=>__awaiter(void 0,void 0,void 0,(function*(){payout&&(yield globals_1.default.currencyDb.adjustCurrencyForUser(username,currencyId,payout));const fails=game_1.HangmanGame.currentGame.getFails();globals_1.default.twitchChat.sendChatMessage(`Congratulations, ${username}, you have successfully solved the hangman quiz! The solution was: "${game_1.HangmanGame.currentGame.word}"`),sendDefinition(),globals_1.default.commandManager.unregisterSystemCommand(GuessCommand.definition.id),globals_1.default.httpServer.sendToOverlay("hangman",{letters:game_1.HangmanGame.currentGame.getLetters(!0),fails,finished:!0,lingerTime:globals_1.default.settings.settings.overlay.lingerTime}),globals_1.default.eventManager.triggerEvent("de.justjakob.hangmangame","game-won",{winner:username,wordDefinition:game_1.HangmanGame.currentGame.wordDefinition}),globals_1.default.eventManager.triggerEvent("de.justjakob.hangmangame","game-ended",{winner:username,wordDefinition:game_1.HangmanGame.currentGame.wordDefinition}),game_1.HangmanGame.currentGame=null}));if(guess.length>1)game_1.HangmanGame.currentGame.word===guess&&(yield winGame());else{if(game_1.HangmanGame.currentGame.guesses.includes(guess))return void globals_1.default.twitchChat.sendChatMessage(`Letter "${guess}" has already been guessed. Try again!`,null,null,event.chatMessage.id);if(game_1.HangmanGame.currentGame.guesses.push(guess),game_1.HangmanGame.currentGame.isComplete())return void(yield winGame());const fails=game_1.HangmanGame.currentGame.getFails();if(fails>=10)return globals_1.default.twitchChat.sendChatMessage(`Sorry, you did not solve the hangman quiz. The correct word was: "${game_1.HangmanGame.currentGame.word}"`),sendDefinition(),globals_1.default.commandManager.unregisterSystemCommand(GuessCommand.definition.id),globals_1.default.httpServer.sendToOverlay("hangman",{letters:game_1.HangmanGame.currentGame.getLetters(!0),fails,finished:!0,lingerTime:globals_1.default.settings.settings.overlay.lingerTime}),globals_1.default.eventManager.triggerEvent("de.justjakob.hangmangame","game-lost",{wordDefinition:game_1.HangmanGame.currentGame.wordDefinition}),globals_1.default.eventManager.triggerEvent("de.justjakob.hangmangame","game-ended",{wordDefinition:game_1.HangmanGame.currentGame.wordDefinition}),void(game_1.HangmanGame.currentGame=null);globals_1.default.twitchChat.sendChatMessage(game_1.HangmanGame.currentGame.renderWord()),globals_1.default.httpServer.sendToOverlay("hangman",{letters:game_1.HangmanGame.currentGame.getLetters(),fails})}}))};exports.GuessCommand=GuessCommand},242:(__unused_webpack_module,exports)=>{Object.defineProperty(exports,"__esModule",{value:!0});exports.default={id:"de.justjakob.hangmangame",name:"Hangman",events:[{id:"game-started",name:"Game started",description:"When a new game is started",cached:!1},{id:"game-ended",name:"Game ended",description:"When a game ends (independent of outcome)",cached:!1,manualMetadata:{wordDefinition:{provider:"dummy",word:"random",definition:"made, done, or happening without method or conscious decision."}}},{id:"game-won",name:"Game won",description:"When a game is won",cached:!1,manualMetadata:{winner:"Firebot",wordDefinition:{provider:"dummy",word:"random",definition:"made, done, or happening without method or conscious decision."}}},{id:"game-lost",name:"Game lost",description:"When a game is lost",cached:!1,manualMetadata:{wordDefinition:{provider:"dummy",word:"random",definition:"made, done, or happening without method or conscious decision."}}}]}},769:function(__unused_webpack_module,exports,__webpack_require__){var __awaiter=this&&this.__awaiter||function(thisArg,_arguments,P,generator){return new(P||(P=Promise))((function(resolve,reject){function fulfilled(value){try{step(generator.next(value))}catch(e){reject(e)}}function rejected(value){try{step(generator.throw(value))}catch(e){reject(e)}}function step(result){var value;result.done?resolve(result.value):(value=result.value,value instanceof P?value:new P((function(resolve){resolve(value)}))).then(fulfilled,rejected)}step((generator=generator.apply(thisArg,_arguments||[])).next())}))};Object.defineProperty(exports,"__esModule",{value:!0}),exports.HangmanGame=void 0;const fs=__webpack_require__(147),globals_1=__webpack_require__(888),commands_1=__webpack_require__(49);class HangmanGame{static newGame(){return __awaiter(this,void 0,void 0,(function*(){return new HangmanGame(yield HangmanGame.selectWord())}))}static selectWord(){return __awaiter(this,void 0,void 0,(function*(){switch(globals_1.default.settings.settings.wordSource.source||"file"){case"file":return new Promise(((resolve,reject)=>{fs.readFile(globals_1.default.settings.settings.wordSource.dictionaryFile,"utf-8",((err,data)=>{if(err)return reject(err);const lines=data.split("\n");resolve({word:lines[Math.floor(Math.random()*lines.length)],provider:"Dictionary file"})}))}));case"urbandictionary":return new Promise(((resolve,reject)=>{globals_1.default.request("https://api.urbandictionary.com/v0/random",((err,response,body)=>{if(err)return reject(err);try{const result=JSON.parse(body),{list}=result,item=list[Math.floor(Math.random()*list.length)],{word,definition,example}=item;resolve({word,definition,example,provider:"Urban Dictionary"})}catch(e){reject(e)}}))}))}return Promise.reject(new Error("Selected hangman guessword source is invalid!"))}))}constructor(word){this.guesses=[],this.wordDefinition=word,this.word=this.wordDefinition.word.toLowerCase().trim(),globals_1.default.twitchChat.sendChatMessage(this.renderWord()),globals_1.default.httpServer.sendToOverlay("hangman",{letters:this.getLetters(),fails:this.getFails(),position:globals_1.default.settings.settings.overlay.position}),globals_1.default.commandManager.registerSystemCommand(commands_1.GuessCommand),globals_1.default.eventManager.triggerEvent("de.justjakob.hangmangame","game-started",{})}renderWord(){return this.getLetters().map((letter=>letter||"_")).join(" ")}getLetters(won){return this.word.split("").map((letter=>won||this.isLetterShown(letter)?letter:null)).map((letter=>" "===letter?"␣":letter))}isLetterShown(letter){return" "===letter||this.guesses.includes(letter)}getFails(){return this.guesses.filter((letter=>!this.word.includes(letter))).length}isComplete(){return this.word.split("").reduce(((prev,curr)=>prev&&this.isLetterShown(curr)),!0)}}exports.HangmanGame=HangmanGame},62:(__unused_webpack_module,exports,__webpack_require__)=>{Object.defineProperty(exports,"__esModule",{value:!0});const globals_1=__webpack_require__(888),game_1=__webpack_require__(769),commands_1=__webpack_require__(49),HangmanGameDefinition={id:"de.justjakob.hangmangame",name:"Hangman",subtitle:"Alphabet Dangle",description:"Interactive word guessing game",icon:"sign-hanging",settingCategories:{wordSource:{title:"Dictionary settings",description:"Where to find words to guess for hangman",sortRank:1,settings:{source:{type:"enum",title:"Guessword source",description:"Where to get words to guess from",tip:"",showBottomHr:!1,default:"file",sortRank:2,options:{file:"Dictionary file",urbandictionary:"Urban Dictionary API (explicit)"},validation:{required:!0}},dictionaryFile:{type:"filepath",title:"Dictionary file",description:"A file containing words to randomly select from (one word per line)",tip:"",showBottomHr:!1,default:"",sortRank:3,validation:{required:!1}},wordnikApiKey:{type:"string",title:"Wordnik API key",description:"Get an API key for Wordnik over on wordnik.com",tip:"",showBottomHr:!1,default:"",sortRank:4,validation:{required:!1}}}},overlay:{title:"Overlay settings",description:"Settings for the hangman display on the firebot overlay",sortRank:5,settings:{position:{type:"enum",title:"Overlay position",description:"Where should the overlay appear on screen?",tip:"",showBottomHr:!1,default:"center-center",sortRank:6,options:{"top-left":"Top left","top-center":"Top center","top-right":"Top right","center-left":"Center left","center-center":"Center","center-right":"Center right","bottom-left":"Bottom left","bottom-center":"Bottom center","bottom-right":"Bottom right"},validation:{required:!0}},lingerTime:{type:"number",title:"Overlay linger time",description:"How long the hangman overlay should stay on screen after a game is finished (in seconds)",tip:"",showBottomHr:!1,default:5,sortRank:7,validation:{required:!1,min:0}}}},currency:{title:"Currency settings",description:"Configure costs and rewards",sortRank:8,settings:{currencyId:{type:"currency-select",title:"Currency",description:"Which currency to use",tip:"",showBottomHr:!1,default:null,sortRank:9,validation:{required:!0}},guessCost:{type:"number",title:"Guess cost",description:"How much will a single guess cost",tip:"",showBottomHr:!1,default:0,sortRank:10,validation:{required:!1}},payout:{type:"number",title:"Payout",description:"How much the winner of a game will receive",tip:"",showBottomHr:!1,default:0,sortRank:11,validation:{required:!1}}}}},onLoad:gameSettings=>{gameSettings&&(globals_1.default.settings=gameSettings),globals_1.default.commandManager.registerSystemCommand(commands_1.HangmanCommand)},onUnload:gameSettings=>{game_1.HangmanGame.currentGame&&(globals_1.default.httpServer.sendToOverlay("hangman",{}),globals_1.default.eventManager.triggerEvent("de.justjakob.hangmangame","game-ended",{wordDefinition:game_1.HangmanGame.currentGame.wordDefinition})),game_1.HangmanGame.currentGame=null,globals_1.default.commandManager.unregisterSystemCommand(commands_1.HangmanCommand.definition.id),globals_1.default.commandManager.unregisterSystemCommand(commands_1.GuessCommand.definition.id)},onSettingsUpdate:gameSettings=>{game_1.HangmanGame.currentGame&&globals_1.default.httpServer.sendToOverlay("hangman",{letters:game_1.HangmanGame.currentGame.getLetters(),fails:game_1.HangmanGame.currentGame.getFails(),position:globals_1.default.settings.settings.overlay.position})}};exports.default=HangmanGameDefinition},888:(__unused_webpack_module,exports)=>{Object.defineProperty(exports,"__esModule",{value:!0});exports.default={gameManager:null,commandManager:null,twitchChat:null,settings:null,httpServer:null,eventManager:null,currencyDb:null,request:null}},531:function(__unused_webpack_module,exports){var __awaiter=this&&this.__awaiter||function(thisArg,_arguments,P,generator){return new(P||(P=Promise))((function(resolve,reject){function fulfilled(value){try{step(generator.next(value))}catch(e){reject(e)}}function rejected(value){try{step(generator.throw(value))}catch(e){reject(e)}}function step(result){var value;result.done?resolve(result.value):(value=result.value,value instanceof P?value:new P((function(resolve){resolve(value)}))).then(fulfilled,rejected)}step((generator=generator.apply(thisArg,_arguments||[])).next())}))};Object.defineProperty(exports,"__esModule",{value:!0});const HangmanOverlayEffect={definition:{id:"de.justjakob.hangmangame::overlayEffect",name:"Hangman overlay",description:"Hangman overlay",icon:"fa-sign-hanging",categories:[],dependencies:[]},optionsTemplate:"",optionsController:($scope,utilityService)=>{},optionsValidator:effect=>[],onTriggerEvent:event=>__awaiter(void 0,void 0,void 0,(function*(){return!0})),overlayExtension:{dependencies:{css:[],globalStyles:"\n    .hangman {\n        color: white;\n        background-color: rgba(0, 0, 0, 0.25);\n        border-radius: 10px;\n        position: absolute;\n        left: 50%;\n        top: 50%;\n        transform: translate(-50%, -50%);\n        text-align: center;\n        padding: 20px;\n        margin: 20px;\n    }\n    \n    .hangman--top {\n        top: 0;\n        bottom: unset;\n        transform: unset;\n    }\n    \n    .hangman--bottom {\n        bottom: 0;\n        top: unset;\n        transform: unset;\n    }\n    \n    .hangman--left {\n        left: 0;\n        right: unset;\n        transform: unset;\n    }\n    \n    .hangman--right {\n        right: 0;\n        left: unset;\n    }\n    \n    .hangman--top.hangman--center, .hangman--bottom.hangman--center {\n        transform: translate(-50%, 0);\n    }\n    \n    .hangman--center.hangman--left, .hangman--center.hangman--right {\n        transform: translate(0, -50%);\n    }\n    \n    .hangman-gallows {\n        width: 400px;\n        height: 400px;\n        margin: 0 auto;\n    }\n    \n    .hangman-gallows svg {\n        width: 100%;\n    }\n    \n    .hangman-gallows .hangman-elements {\n        stroke: white;\n    }\n    \n    .hangman-gallows .hangman-elements * {\n        display: none;\n    } \n    \n    .hangman-letters {\n        font-size: 24pt;\n        text-shadow: 0 0 3px black;\n        text-align: center;\n    }\n",js:[]},event:{name:"hangman",onOverlayEvent:data=>{const $wrapper=$(".wrapper");let $el=$wrapper.find(".hangman"),selectedClasses="";if(data.position){selectedClasses=data.position.split("-").map((p=>"hangman--"+p)).join(" ");const allClasses=["top","bottom","left","right","center"].map((p=>"hangman--"+p)).join(" ");$el.removeClass(allClasses).addClass(selectedClasses)}if(data.letters){$el.length||($el=$(`\n                            <div class="hangman ${selectedClasses}">\n                                <div class="hangman-gallows">\n                                    <svg viewbox="0 0 210 210">\n                                        <g class="hangman-elements" style="fill:none;stroke-width:5;stroke-linecap:round;stroke-dasharray:none;stroke-opacity:1" transform="translate(5,5)">\n                                            <path d="M 0,200 H 200" />\n                                            <path d="M 150,200 V 0" />\n                                            <path d="M 150,0 H 75" />\n                                            <path d="M 75,0 V 50" />\n                                            <circle cx="75" cy="75" r="25" />\n                                            <path d="m 75,100 v 50" />\n                                            <path d="M 75,115 115,95" />\n                                            <path d="M 75,115 35,90" />\n                                            <path d="m 75,150 40,25" />\n                                            <path d="M 75,150 35,175" />\n                                        </g>\n                                    </svg>\n                                </div>\n                                <div class="hangman-letters"></div>\n                            </div>`),$wrapper.append($el)),$el.find(".hangman-letters").text(data.letters?data.letters.map((l=>l||"_")).join(" "):"");const fails=data.fails||0;$el.find(".hangman-elements *").each((function(index){$(this)[index>=fails?"hide":"show"]()})),data.finished&&setTimeout((()=>{$el.remove()}),1e3*(data.lingerTime||5))}else $el.remove()}}}};exports.default=HangmanOverlayEffect},892:function(__unused_webpack_module,exports,__webpack_require__){var __awaiter=this&&this.__awaiter||function(thisArg,_arguments,P,generator){return new(P||(P=Promise))((function(resolve,reject){function fulfilled(value){try{step(generator.next(value))}catch(e){reject(e)}}function rejected(value){try{step(generator.throw(value))}catch(e){reject(e)}}function step(result){var value;result.done?resolve(result.value):(value=result.value,value instanceof P?value:new P((function(resolve){resolve(value)}))).then(fulfilled,rejected)}step((generator=generator.apply(thisArg,_arguments||[])).next())}))};Object.defineProperty(exports,"__esModule",{value:!0});const globals_1=__webpack_require__(888),game_1=__webpack_require__(769),HangmanTriggerEffect={definition:{id:"de.justjakob.hangmangame::startEffect",name:"Trigger hangman",description:"Starts a new game of hangman",icon:"fa-sign-hanging",categories:[]},onTriggerEvent:event=>__awaiter(void 0,void 0,void 0,(function*(){return globals_1.default.settings.active?game_1.HangmanGame.currentGame?Promise.reject(new Error("There is already a game of hangman running")):void(game_1.HangmanGame.currentGame=yield game_1.HangmanGame.newGame()):Promise.reject(new Error("Hangman game is not active"))})),optionsTemplate:""};exports.default=HangmanTriggerEffect},449:(__unused_webpack_module,exports)=>{Object.defineProperty(exports,"__esModule",{value:!0}),exports.HangmanExampleVariable=exports.HangmanWordVariable=exports.HangmanWinnerVariable=exports.HangmanProviderVariable=exports.HangmanDefinitionVariable=void 0;exports.HangmanWinnerVariable={definition:{handle:"hangmanWinner",description:"Winner of the hangman game",triggers:{event:["de.justjakob.hangmangame:game-won"],manual:!0},possibleDataOutput:["text"]},evaluator:trigger=>trigger.metadata.eventData.winner||""};exports.HangmanProviderVariable={definition:{handle:"hangmanProvider",description:"Where did the hangman word come from?",triggers:{event:["de.justjakob.hangmangame:game-won","de.justjakob.hangmangame:game-lost","de.justjakob.hangmangame:game-ended"],manual:!0},possibleDataOutput:["text"]},evaluator:trigger=>trigger.metadata.eventData.wordDefinition.provider};exports.HangmanWordVariable={definition:{handle:"hangmanWord",description:"The word to be guessed in the hangman game",triggers:{event:["de.justjakob.hangmangame:game-won","de.justjakob.hangmangame:game-lost","de.justjakob.hangmangame:game-ended"],manual:!0},possibleDataOutput:["text"]},evaluator:trigger=>trigger.metadata.eventData.wordDefinition.word};exports.HangmanDefinitionVariable={definition:{handle:"hangmanDefinition",description:"The dictionary definition of the hangman word, if available",triggers:{event:["de.justjakob.hangmangame:game-won","de.justjakob.hangmangame:game-lost","de.justjakob.hangmangame:game-ended"],manual:!0},possibleDataOutput:["text"]},evaluator:trigger=>trigger.metadata.eventData.wordDefinition.definition||""};exports.HangmanExampleVariable={definition:{handle:"hangmanExample",description:"The dictionary example of the hangman word, if available",triggers:{event:["de.justjakob.hangmangame:game-won","de.justjakob.hangmangame:game-lost","de.justjakob.hangmangame:game-ended"],manual:!0},possibleDataOutput:["text"]},evaluator:trigger=>trigger.metadata.eventData.wordDefinition.example||""}},147:module=>{module.exports=require("fs")}},__webpack_module_cache__={};function __webpack_require__(moduleId){var cachedModule=__webpack_module_cache__[moduleId];if(void 0!==cachedModule)return cachedModule.exports;var module=__webpack_module_cache__[moduleId]={exports:{}};return __webpack_modules__[moduleId].call(module.exports,module,module.exports,__webpack_require__),module.exports}var __webpack_exports__={};(()=>{var exports=__webpack_exports__;const gamedef_1=__webpack_require__(62),events_1=__webpack_require__(242),overlay_1=__webpack_require__(531),trigger_1=__webpack_require__(892),variables_1=__webpack_require__(449),globals_1=__webpack_require__(888),script={getScriptManifest:()=>({name:"Hangman",description:"Hangman game",author:"Jakob Ketterl",version:"0.1"}),getDefaultParameters:()=>({}),run:runRequest=>{globals_1.default.gameManager=runRequest.modules.gameManager,globals_1.default.commandManager=runRequest.modules.commandManager,globals_1.default.twitchChat=runRequest.modules.twitchChat,globals_1.default.httpServer=runRequest.modules.httpServer,globals_1.default.eventManager=runRequest.modules.eventManager,globals_1.default.currencyDb=runRequest.modules.currencyDb,globals_1.default.request=runRequest.modules.request,runRequest.modules.gameManager.registerGame(gamedef_1.default),runRequest.modules.eventManager.registerEventSource(events_1.default),runRequest.modules.effectManager.registerEffect(overlay_1.default),runRequest.modules.effectManager.registerEffect(trigger_1.default),[variables_1.HangmanWinnerVariable,variables_1.HangmanProviderVariable,variables_1.HangmanWordVariable,variables_1.HangmanDefinitionVariable,variables_1.HangmanExampleVariable].forEach((v=>{runRequest.modules.replaceVariableManager.registerReplaceVariable(v)}))}};exports.default=script})(),module.exports=__webpack_exports__.default})();