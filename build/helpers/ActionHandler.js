"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// TODO: Come back to this and finish it.
function ActionHandler(gameObj, action, bot, payload) {
    // let updatedMessage = null;
    // switch(action) {
    //     case "add_user_to_game":
    //   playersArray.includes(username) || playersArray.length >= 4 ? null : playersArray.push(username);
    //   updatedMessage = StartGameMessage(playersArray, playersBlock, playerStats);
    //   break;
    // case "multi_static_select":
    //   newPlayersArray = payload.actions[0].selected_options
    //   newPlayersArray.forEach(player => {
    //     playerName = player.text.text;
    //     playersArray.includes(playerName) || playersArray.length >= 4 ? null : playersArray.push(playerName);
    //   })
    //   updatedMessage = StartGameMessage(playersArray, playersBlock, playerStats);
    //   break;
    // case "remove_user_from_game":
    //   playersArray = playersArray.includes(username)
    //     ? playersArray.filter(i => i !== username)
    //     : playersArray;
    //   updatedMessage = StartGameMessage(playersArray, playersBlock, playerStats);
    //   break;
    // case "cancel_game":
    //   playersArray = [];
    //   GameInitiated = false;
    //   updatedMessage = {
    //     blocks: [
    //       {
    //         type: "section",
    //         text: {
    //           type: "mrkdwn",
    //           text: "Game has been canceled"
    //         }
    //       }
    //     ]
    //   };
    //   break;
    // case "start_game":
    //   // TODO: re-write this whole thingy
    //   foosGame = await fixTeams(playersArray);
    //   updatedMessage = GameInProgressMessage(foosGame);
    //   bot.reply(message, {
    //     attachments: [updatedMessage]
    //   });
    //   updatedMessage = {
    //     blocks: [
    //       {
    //         type: "section",
    //         text: {
    //           type: "mrkdwn",
    //           text: "Game is underway"
    //         }
    //       }
    //     ]
    //   };
    //   break;
    // case "increment_yg_score":
    //   foosGameObj.yellow.score += 1;
    //   yellowGoalie
    //   foosGame.yg.score += 1;
    //   updatedMessage = GameInProgressMessage(foosGame);
    //   break;
    // case "increment_yf_score":
    //   foosGame.yf.score += 1;
    //   updatedMessage = GameInProgressMessage(foosGame);
    //   break;
    // case "increment_bg_score":
    //   foosGame.bg.score += 1;
    //   updatedMessage = GameInProgressMessage(foosGame);
    //   break;
    // case "increment_bf_score":
    //   foosGame.bf.score += 1;
    //   updatedMessage = GameInProgressMessage(foosGame);
    //   break;
    // case "complete_game":
    //   updatedMessage = FinishedGameMessage(foosGame, playerStats);
    //   foosGame = {...EMPTY_FOOS_GAME};
    //   playersArray = [];
    //   GameInitiated = false;
    //   break;
    // case "complete_revenge":
    //   // TODO: implement
    //   // updatedMessage = FinishedGameMessage(foosGame, playerStats);
    //   // foosGame = {...EMPTY_FOOS_GAME};
    //   // playersArray = [];
    //   // GameInitiated = false;
    //   break;
    // case "complete_revenge_swip":
    //   // TODO: implement
    //   // updatedMessage = FinishedGameMessage(foosGame, playerStats);
    //   // foosGame = {...EMPTY_FOOS_GAME};
    //   // playersArray = [];
    //   // GameInitiated = false;
    //   break;
    // default:
    //   updatedMessage = StartGameMessage(playersArray, playersBlock, playerStats);
    //   break;
    // }
}
exports.ActionHandler = ActionHandler;
//# sourceMappingURL=ActionHandler.js.map