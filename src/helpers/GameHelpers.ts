const axios = require("axios");


type GameMode = 'normal' | 'swipswap';
type PlayerObj = {
  name: string,
  currPosition: "F" | "G",
  scoreForward: number,
  scoreGoal: number
}
type GameObjType = {
  mode: GameMode,
  yellow: {
    score: number,
    p1: PlayerObj,
    p2: PlayerObj
  },
  black: {
    score: number,
    p1: PlayerObj,
    p2: PlayerObj,
  }
}
type SlackUserObj = {
  playersBlock: Array<string>
  slackUsers: {
  [key: string]: string
}}

export function swipSwapPositions(gameObj: GameObjType, team: 'yellow' | 'black'): void {
  if (team === 'yellow') {
    const p1Position = gameObj.yellow.p1.currPosition;
    gameObj.yellow.p1.currPosition = gameObj.yellow.p2.currPosition;
    gameObj.yellow.p2.currPosition = p1Position;
  } else {
    const p1Position = gameObj.black.p1.currPosition;
    gameObj.black.p1.currPosition = gameObj.black.p2.currPosition;
    gameObj.black.p2.currPosition = p1Position;
  }
}

export async function initializeGame(mode: GameMode, playerList: Array<string>, revenge: boolean): Promise<GameObjType> {
  if (!revenge) {
    const formattedPlayers = playerList.join(',');
    const getPositionsUrl = `https://us-central1-tablechamp-444aa.cloudfunctions.net/getPositions?users=${formattedPlayers}`;
    const response = await axios.get(getPositionsUrl).then((response: { data: any; }) => response.data);
    playerList = [response.t1.forward, response.t1.goalie, response.t2.forward, response.t2.goalie]
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
  }
}

export const syncSlackUsers = async (): Promise<SlackUserObj> => {
  let slackUsers: any = {};
  let playersBlock: any = [];
  const response = await axios({
    method: 'get',
    url: `https://slack.com/api/users.list?token=${process.env.SLACK_SYNC_TOKEN}&pretty=1`,
  }).then((response: { data: any; }) => response.data).catch((error: any) => console.log(error));
  response.members
    .filter((mem: any) => {
      const { deleted, is_bot, is_app_user, is_restricted, name } = mem;
      if (deleted || is_bot || is_app_user || is_restricted) return false;
      if (name === "slackbot") return false;
      return true;
    })
    .forEach((user: { id: string | number; name: any; }) => {
      slackUsers[user.id] = user.name;
      playersBlock.push({
        text: {
          type: "plain_text",
          text: user.name,
          emoji: true
        },
        value: user.name
      });
    });;
  return {
    playersBlock: playersBlock,
    slackUsers: slackUsers,
  }
}