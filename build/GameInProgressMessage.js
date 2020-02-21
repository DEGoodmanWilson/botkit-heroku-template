"use strict";
function GameInProgressMessage(gameObj) {
    const yellowTeamScore = gameObj.yellow.score;
    const blackTeamScore = gameObj.black.score;
    const [yellowForward, yellowGoalie] = gameObj.yellow.p1.currPosition === 'F' ? [gameObj.yellow.p1, gameObj.yellow.p2] : [gameObj.yellow.p2, gameObj.yellow.p1];
    const [blackForward, blackGoalie] = gameObj.black.p1.currPosition === 'F' ? [gameObj.black.p1, gameObj.black.p2] : [gameObj.black.p2, gameObj.black.p1];
    const makeButton = (label, buttonStyle, actionCode) => {
        return {
            type: "button",
            text: {
                type: "plain_text",
                emoji: true,
                text: label,
            },
            style: buttonStyle,
            value: actionCode,
        };
    };
    const footerButtons = () => {
        const gameOver = yellowTeamScore === 10 || blackTeamScore === 10;
        if (gameOver) {
            return [
                makeButton('Finish Game', 'primary', 'complete_game'),
                makeButton('Revenge', 'primary', 'complete_revenge'),
                makeButton('Revenge w/ swip', 'primary', 'complete_revenge_swip'),
            ];
        }
        return [
            makeButton('Cancel Game', 'danger', 'cancel_game')
        ];
    };
    return {
        blocks: [
            {
                type: "section",
                text: {
                    type: "mrkdwn",
                    text: `*Yellow Team:* ${yellowTeamScore}`
                }
            },
            {
                type: "actions",
                elements: [
                    {
                        type: "button",
                        text: {
                            type: "plain_text",
                            emoji: true,
                            text: `G: ${yellowGoalie.name} ${yellowGoalie.scoreForward + yellowGoalie.scoreGoal}`
                        },
                        value: "increment_yg_score"
                    },
                    {
                        type: "button",
                        text: {
                            type: "plain_text",
                            emoji: true,
                            text: `F: ${yellowForward.name} ${yellowForward.scoreForward + yellowForward.scoreGoal}`
                        },
                        value: "increment_yf_score"
                    }
                ]
            },
            {
                type: "section",
                text: {
                    type: "mrkdwn",
                    text: `*Black Team:* ${blackTeamScore}`
                }
            },
            {
                type: "actions",
                elements: [
                    {
                        type: "button",
                        text: {
                            type: "plain_text",
                            emoji: true,
                            text: `G: ${blackGoalie.name} ${blackGoalie.scoreForward + blackGoalie.scoreGoal}`
                        },
                        value: "increment_bg_score"
                    },
                    {
                        type: "button",
                        text: {
                            type: "plain_text",
                            emoji: true,
                            text: `F: ${blackForward.name} ${blackForward.scoreForward + blackForward.scoreGoal}`
                        },
                        value: "increment_bf_score"
                    }
                ]
            },
            {
                type: "divider"
            },
            {
                type: "actions",
                elements: footerButtons()
            }
        ]
    };
}
module.exports = GameInProgressMessage;
//# sourceMappingURL=GameInProgressMessage.js.map