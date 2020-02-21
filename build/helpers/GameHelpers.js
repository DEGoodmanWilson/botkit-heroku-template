"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const axios = require("axios");
function swipSwapPositions(gameObj, team) {
    if (team === 'yellow') {
        const p1Position = gameObj.yellow.p1.currPosition;
        gameObj.yellow.p1.currPosition = gameObj.yellow.p2.currPosition;
        gameObj.yellow.p2.currPosition = p1Position;
    }
    else {
        const p1Position = gameObj.black.p1.currPosition;
        gameObj.black.p1.currPosition = gameObj.black.p2.currPosition;
        gameObj.black.p2.currPosition = p1Position;
    }
}
exports.swipSwapPositions = swipSwapPositions;
async function initializeGame(mode, playerList, revenge) {
    if (!revenge) {
        const formattedPlayers = playerList.join(',');
        const getPositionsUrl = `https://us-central1-tablechamp-444aa.cloudfunctions.net/getPositions?users=${formattedPlayers}`;
        const response = await axios.get(getPositionsUrl).then((response) => response.data);
        playerList = [response.t1.forward, response.t1.goalie, response.t2.forward, response.t2.goalie];
    }
    return {
        mode: mode,
        yellow: {
            score: 0,
            p1: {
                name: playerList[0],
                currPosition: "F",
                scoreForward: 0,
                scoreGoal: 0,
            },
            p2: {
                name: playerList[1],
                currPosition: "G",
                scoreForward: 0,
                scoreGoal: 0,
            }
        },
        black: {
            score: 0,
            p1: {
                name: playerList[2],
                currPosition: "F",
                scoreForward: 0,
                scoreGoal: 0,
            },
            p2: {
                name: playerList[3],
                currPosition: "G",
                scoreForward: 0,
                scoreGoal: 0,
            }
        }
    };
}
exports.initializeGame = initializeGame;
exports.syncSlackUsers = async () => {
    let slackUsers = {};
    let playersBlock = [];
    const response = await axios({
        method: 'get',
        url: `https://slack.com/api/users.list?token=${process.env.SLACK_SYNC_TOKEN}&pretty=1`,
    }).then((response) => response.data).catch((error) => console.log(error));
    response.members
        .filter((mem) => {
        const { deleted, is_bot, is_app_user, is_restricted, name } = mem;
        if (deleted || is_bot || is_app_user || is_restricted)
            return false;
        if (name === "slackbot")
            return false;
        return true;
    })
        .forEach((user) => {
        slackUsers[user.id] = user.name;
        playersBlock.push({
            text: {
                type: "plain_text",
                text: user.name,
                emoji: true
            },
            value: user.name
        });
    });
    ;
    return {
        playersBlock: playersBlock,
        slackUsers: slackUsers,
    };
};
//# sourceMappingURL=GameHelpers.js.map