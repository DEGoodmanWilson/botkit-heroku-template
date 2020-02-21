"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv").config();
const StartGameMessage_1 = require("./StartGameMessage");
const GameInProgressMessage = require("./GameInProgressMessage");
const FinishedGameMessage = require("./FinishedGameMessage");
const { initializeGame, syncSlackUsers, swipSwapPositions } = require("./helpers/GameHelpers");
const resyncPlayerStats = require("./helpers/ResyncPlayerStats");
/**
 * A Bot for Slack!
 */
/**
 * Define a function for initiating a conversation on installation
 * With custom integrations, we don't have a way to find out who installed us, so we can't message them :(
 */
const EMPTY_FOOS_GAME = {
    mode: 'normal',
    yellow: {
        score: 0,
        p1: {
            name: "",
            currPosition: "F",
            scoreForward: 0,
            scoreGoal: 0,
        },
        p2: {
            name: "",
            currPosition: "G",
            scoreForward: 0,
            scoreGoal: 0,
        }
    },
    black: {
        score: 0,
        p1: {
            name: "",
            currPosition: "F",
            scoreForward: 0,
            scoreGoal: 0,
        },
        p2: {
            name: "",
            currPosition: "G",
            scoreForward: 0,
            scoreGoal: 0,
        }
    }
};
async function reSyncSlackUsers() {
    const slackUsersResponse = await syncSlackUsers();
    playersBlock = slackUsersResponse.playersBlock;
    slackUsers = slackUsersResponse.slackUsers;
}
function onInstallation(bot, installer) {
    if (installer) {
        bot.startPrivateConversation({ user: installer }, function (err, convo) {
            if (err) {
                console.log(err);
            }
            else {
                convo.say("I am a bot that has just joined your team");
                convo.say("You must now /invite me to a channel so that I can be of use!");
            }
        });
    }
}
/**
 * Configure the persistence options
 */
var config = {};
if (process.env.MONGODB_PASSWORD) {
    const mongoUri = `mongodb+srv://agrocrag:${process.env.MONGODB_PASSWORD}@slackbot-r2lnp.mongodb.net/test?retryWrites=true&w=majority`;
    var BotkitStorage = require("botkit-storage-mongo");
    config = {
        storage: BotkitStorage({ mongoUri: mongoUri })
    };
}
else {
    config = {
        json_file_store: process.env.TOKEN
            ? "./db_slack_bot_ci/"
            : "./db_slack_bot_a/" //use a different name if an app or CI
    };
}
/**
 * Are being run as an app or a custom integration? The initialization will differ, depending
 */
if (process.env.TOKEN || process.env.SLACK_TOKEN) {
    //Treat this as a custom integration
    var customIntegration = require("../lib/custom_integrations");
    var token = process.env.TOKEN ? process.env.TOKEN : process.env.SLACK_TOKEN;
    var controller = customIntegration.configure(token, config, onInstallation);
}
else if (process.env.CLIENT_ID &&
    process.env.CLIENT_SECRET &&
    process.env.PORT) {
    //Treat this as an app
    var app = require("../lib/apps");
    var controller = app.configure(process.env.PORT, process.env.CLIENT_ID, process.env.CLIENT_SECRET, config, onInstallation);
}
else {
    console.log("Error: If this is a custom integration, please specify TOKEN in the environment. If this is an app, please specify CLIENTID, CLIENTSECRET, and PORT in the environment");
    process.exit(1);
}
controller.on("rtm_open", function (bot) {
    console.log("** The RTM api just connected!");
});
controller.on("rtm_close", function (bot) {
    console.log("** The RTM api just closed");
    // you may want to attempt to re-open
});
/**
 * Core bot logic goes here!
 */
// BEGIN EDITING HERE!
controller.on("bot_channel_join", function (bot, message) {
    bot.reply(message, "I'm back from the dead!");
});
// Variables
let playersArray = [];
let GameInitiated = false;
// let foosGame = initializeGame();
const playerStats = {};
let playersBlock = [];
let slackUsers = {};
let foosGameObj = Object.assign({}, EMPTY_FOOS_GAME);
controller.hears("test", ["direct_mention", "mention", "direct_message"], function (bot, message) {
    bot.reply(message, `testing 1,2,3`);
});
controller.hears("reset", ["direct_mention", "mention", "direct_message"], function (bot, message) {
    playersArray = [];
    GameInitiated = false;
    foosGameObj = Object.assign({}, EMPTY_FOOS_GAME);
    bot.reply(message, "$#%@ system error... Everything has been reset.");
});
controller.hears("sync", ["direct_mention", "mention", "direct_message"], function (bot, message) {
    reSyncSlackUsers();
    bot.reply(message, "resyncing slack users");
});
reSyncSlackUsers();
resyncPlayerStats(playerStats);
controller.hears("play", ["direct_mention", "mention", "direct_message"], function (bot, message) {
    if (GameInitiated) {
        bot.reply(message, 'A game has already been started, click "Join" if you want to play');
    }
    else {
        GameInitiated = true;
        const userInitiatingGame = slackUsers[message.user];
        playersArray.push(userInitiatingGame);
        const newMessage = StartGameMessage_1.StartGameMessage(playersArray, playersBlock, playerStats);
        bot.reply(message, {
            attachments: [newMessage]
        });
    }
});
controller.on("interactive_message_callback", async function (bot, message) {
    const payload = JSON.parse(message.payload);
    const username = payload.user.name;
    const action = message.actions[0].value || 'multi_static_select';
    let updatedMessage = null;
    let scoreBoardMessage = null;
    const [yellowForward, yellowGoalie] = foosGameObj.yellow.p1.currPosition === 'F' ? [foosGameObj.yellow.p1, foosGameObj.yellow.p2] : [foosGameObj.yellow.p2, foosGameObj.yellow.p1];
    const [blackForward, blackGoalie] = foosGameObj.black.p1.currPosition === 'F' ? [foosGameObj.black.p1, foosGameObj.black.p2] : [foosGameObj.black.p2, foosGameObj.black.p1];
    const revengePlayerOrder = [yellowForward.name, yellowGoalie.name, blackForward.name, blackGoalie.name];
    switch (action) {
        case "add_user_to_game":
            playersArray.includes(username) || playersArray.length >= 4 ? null : playersArray.push(username);
            if (playersArray.length === 4) {
                bot.reply(message, {
                    attachments: [{
                            blocks: [
                                {
                                    type: "section",
                                    text: {
                                        type: "mrkdwn",
                                        text: "Game is ready :foos:"
                                    }
                                }
                            ]
                        }]
                });
            }
            updatedMessage = StartGameMessage_1.StartGameMessage(playersArray, playersBlock, playerStats);
            break;
        case "multi_static_select":
            const newPlayersArray = payload.actions[0].selected_options;
            newPlayersArray.forEach(player => {
                const playerName = player.text.text;
                playersArray.includes(playerName) || playersArray.length >= 4 ? null : playersArray.push(playerName);
            });
            updatedMessage = StartGameMessage_1.StartGameMessage(playersArray, playersBlock, playerStats);
            break;
        case "remove_user_from_game":
            playersArray = playersArray.includes(username)
                ? playersArray.filter(i => i !== username)
                : playersArray;
            updatedMessage = StartGameMessage_1.StartGameMessage(playersArray, playersBlock, playerStats);
            break;
        case "cancel_game":
            playersArray = [];
            GameInitiated = false;
            foosGameObj = Object.assign({}, EMPTY_FOOS_GAME);
            updatedMessage = {
                blocks: [
                    {
                        type: "section",
                        text: {
                            type: "mrkdwn",
                            text: "Game has been canceled :cry:"
                        }
                    }
                ]
            };
            break;
        case "start_game_standard":
            foosGameObj = await initializeGame('normal', playersArray, false);
            updatedMessage = GameInProgressMessage(foosGameObj);
            bot.reply(message, {
                attachments: [updatedMessage]
            });
            updatedMessage = {
                blocks: [
                    {
                        type: "section",
                        text: {
                            type: "mrkdwn",
                            text: "Game is underway"
                        }
                    }
                ]
            };
            break;
        case "start_game_swippy":
            foosGameObj = await initializeGame('swipswap', playersArray, false);
            updatedMessage = GameInProgressMessage(foosGameObj);
            bot.reply(message, {
                attachments: [updatedMessage]
            });
            updatedMessage = {
                blocks: [
                    {
                        type: "section",
                        text: {
                            type: "mrkdwn",
                            text: "Game is underway"
                        }
                    }
                ]
            };
            break;
        case "increment_yg_score":
            if (foosGameObj.yellow.score < 10) {
                foosGameObj.yellow.score += 1;
                yellowGoalie.scoreGoal += 1;
                foosGameObj.mode === 'swipswap' ? swipSwapPositions(foosGameObj, 'yellow') : null;
            }
            updatedMessage = GameInProgressMessage(foosGameObj);
            break;
        case "increment_yf_score":
            if (foosGameObj.yellow.score < 10) {
                foosGameObj.yellow.score += 1;
                yellowForward.scoreForward += 1;
                foosGameObj.mode === 'swipswap' ? swipSwapPositions(foosGameObj, 'yellow') : null;
            }
            updatedMessage = GameInProgressMessage(foosGameObj);
            break;
        case "increment_bg_score":
            if (foosGameObj.black.score < 10) {
                blackGoalie.scoreGoal += 1;
                foosGameObj.black.score += 1;
                foosGameObj.mode === 'swipswap' ? swipSwapPositions(foosGameObj, 'black') : null;
            }
            updatedMessage = GameInProgressMessage(foosGameObj);
            break;
        case "increment_bf_score":
            if (foosGameObj.black.score < 10) {
                blackForward.scoreForward += 1;
                foosGameObj.black.score += 1;
                foosGameObj.mode === 'swipswap' ? swipSwapPositions(foosGameObj, 'black') : null;
            }
            updatedMessage = GameInProgressMessage(foosGameObj);
            break;
        case "complete_game":
            updatedMessage = FinishedGameMessage(foosGameObj, playerStats);
            foosGameObj = Object.assign({}, EMPTY_FOOS_GAME);
            playersArray = [];
            GameInitiated = false;
            break;
        case "complete_revenge":
            // TODO: test implement
            scoreBoardMessage = FinishedGameMessage(foosGameObj, playerStats);
            foosGameObj = await initializeGame('normal', revengePlayerOrder, true);
            updatedMessage = {
                blocks: [
                    {
                        type: "section",
                        text: {
                            type: "mrkdwn",
                            text: "Revenge."
                        }
                    }
                ]
            };
            bot.reply(message, {
                attachments: [updatedMessage]
            });
            updatedMessage = GameInProgressMessage(foosGameObj);
            bot.reply(message, {
                attachments: [updatedMessage]
            });
            updatedMessage = scoreBoardMessage;
            break;
        case "complete_revenge_swip":
            // TODO: test implement
            scoreBoardMessage = FinishedGameMessage(foosGameObj, playerStats);
            updatedMessage = {
                blocks: [
                    {
                        type: "section",
                        text: {
                            type: "mrkdwn",
                            text: "Revenge Swippy Swappy."
                        }
                    }
                ]
            };
            bot.reply(message, {
                attachments: [updatedMessage]
            });
            foosGameObj = await initializeGame('swipswap', revengePlayerOrder, true);
            updatedMessage = GameInProgressMessage(foosGameObj);
            bot.reply(message, {
                attachments: [updatedMessage]
            });
            updatedMessage = scoreBoardMessage;
            break;
        default:
            updatedMessage = StartGameMessage_1.StartGameMessage(playersArray, playersBlock, playerStats);
            break;
    }
    bot.replyInteractive(message, {
        attachments: [updatedMessage]
    });
});
//# sourceMappingURL=index.js.map