"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = require("axios");
const resyncPlayerStats = require("./helpers/ResyncPlayerStats");
function FinishedGameMessage(gameObj, playerStats) {
    const [yellowForward, yellowGoalie] = gameObj.yellow.p1.currPosition === 'F' ? [gameObj.yellow.p1, gameObj.yellow.p2] : [gameObj.yellow.p2, gameObj.yellow.p1];
    const [blackForward, blackGoalie] = gameObj.black.p1.currPosition === 'F' ? [gameObj.black.p1, gameObj.black.p2] : [gameObj.black.p2, gameObj.black.p1];
    const winningMessage = () => {
        if (gameObj.mode === 'normal') {
            const yellowTeamScore = gameObj.yellow.score;
            const blackTeamScore = gameObj.black.score;
            if (yellowTeamScore > blackTeamScore) {
                return `*Winners* ${yellowTeamScore}pts\n` +
                    `F: ${yellowForward.name} - ${yellowForward.scoreForward}\n` +
                    `G: ${yellowGoalie.name} - ${yellowGoalie.scoreGoal}\n` +
                    `*Losers* ${blackTeamScore}pts\n` +
                    `F: ${blackForward.name} - ${blackForward.scoreForward}\n` +
                    `G: ${blackGoalie.name} - ${blackGoalie.scoreGoal}`;
            }
            else if (blackTeamScore > yellowTeamScore) {
                return `*Winners* ${blackTeamScore}pts\n` +
                    `F: ${blackForward.name} - ${blackForward.scoreForward}\n` +
                    `G: ${blackGoalie.name} - ${blackGoalie.scoreGoal}\n` +
                    `*Losers* ${yellowTeamScore}pts\n` +
                    `F: ${yellowForward.name} - ${yellowForward.scoreForward}\n` +
                    `G: ${yellowGoalie.name} - ${yellowGoalie.scoreGoal}`;
            }
            return 'I guess it was a tie :man-shrugging:';
        }
        else {
            const { p1: winP1, p2: winP2, score: winScore } = gameObj.yellow.score > gameObj.black.score ? gameObj.yellow : gameObj.black;
            const { p1: loseP1, p2: loseP2, score: loseScore } = gameObj.yellow.score < gameObj.black.score ? gameObj.yellow : gameObj.black;
            return `Swippy Swappy game\n` +
                `*Winners* ${winScore}pts\n` +
                `${winP1.name} F:${winP1.scoreForward} G: ${winP1.scoreGoal}\n` +
                `${winP2.name} F:${winP2.scoreForward} G: ${winP2.scoreGoal}\n` +
                `*Losers* ${loseScore}pts\n` +
                `${loseP1.name} F:${loseP1.scoreForward} G: ${loseP1.scoreGoal}\n` +
                `${loseP2.name} F:${loseP2.scoreForward} G: ${loseP2.scoreGoal}`;
        }
    };
    const payload = {
        FOOS_GAME: {
            players: {
                p1: yellowGoalie.name,
                p2: yellowForward.name,
                p3: blackGoalie.name,
                p4: blackForward.name,
            },
            teams: {
                t1: ["1", "2"],
                t2: ["3", "4"]
            },
            scores: {
                p1: { score_forward: yellowGoalie.scoreForward, score_goal: yellowGoalie.scoreGoal },
                p2: { score_forward: yellowForward.scoreForward, score_goal: yellowForward.scoreGoal },
                p3: { score_forward: blackGoalie.scoreForward, score_goal: blackGoalie.scoreGoal },
                p4: { score_forward: blackForward.scoreForward, score_goal: blackForward.scoreGoal },
            },
            positions: {
                p1: gameObj.mode === 'normal' ? "G" : "S",
                p2: gameObj.mode === 'normal' ? "F" : "S",
                p3: gameObj.mode === 'normal' ? "G" : "S",
                p4: gameObj.mode === 'normal' ? "F" : "S",
            }
        }
    };
    axios_1.default({
        method: 'post',
        url: 'https://us-central1-tablechamp-444aa.cloudfunctions.net/addScore',
        data: payload,
    }).then((response) => {
        playerStats;
        resyncPlayerStats(playerStats);
        console.log('done hitting api', response);
    }).catch((error) => {
        console.log('err', error);
    });
    return ({
        blocks: [
            {
                type: "section",
                text: {
                    type: "mrkdwn",
                    text: winningMessage()
                }
            }
        ]
    });
}
module.exports = FinishedGameMessage;
//# sourceMappingURL=FinishedGameMessage.js.map