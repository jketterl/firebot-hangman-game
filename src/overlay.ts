import {Effects} from "@crowbartools/firebot-custom-scripts-types/types/effects";

const hangmanStyles = `
    .hangman {
        color: white;
        background-color: rgba(0, 0, 0, 0.25);
        border-radius: 10px;
        position: absolute;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%);
        text-align: center;
        padding: 20px;
        margin: 20px;
    }
    
    .hangman--top {
        top: 0;
        bottom: unset;
        transform: unset;
    }
    
    .hangman--bottom {
        bottom: 0;
        top: unset;
        transform: unset;
    }
    
    .hangman--left {
        left: 0;
        right: unset;
        transform: unset;
    }
    
    .hangman--right {
        right: 0;
        left: unset;
    }
    
    .hangman--top.hangman--center, .hangman--bottom.hangman--center {
        transform: translate(-50%, 0);
    }
    
    .hangman--center.hangman--left, .hangman--center.hangman--right {
        transform: translate(0, -50%);
    }
    
    .hangman-gallows {
        width: 400px;
        height: 400px;
        margin: 0 auto;
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

type OverlayDataType = {
    position: string,
    letters: Array<string>,
    fails: number,
    finished: boolean,
    lingerTime: number
}

const HangmanOverlayEffect: Effects.EffectType<any, OverlayDataType> = {
    definition: {
        id: "de.justjakob.hangmangame::overlayEffect",
        name: "Hangman overlay",
        description: "Hangman overlay",
        icon: "fa-sign-hanging",
        categories: [],
        dependencies: [],
    },
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
            onOverlayEvent: (data: OverlayDataType) => {
                const $wrapper = $('.wrapper')
                let $el = $wrapper.find('.hangman')

                let selectedClasses = '';
                if (data.position) {
                    selectedClasses = data.position.split('-').map(p => 'hangman--' + p).join(' ');
                    const allClasses = ['top', 'bottom', 'left', 'right', 'center'].map(p => 'hangman--' + p).join(' ');
                    $el.removeClass(allClasses).addClass(selectedClasses);
                }

                if (data.letters) {
                    if (!$el.length) {
                        $el = $(`
                            <div class="hangman ${selectedClasses}">
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

export default HangmanOverlayEffect