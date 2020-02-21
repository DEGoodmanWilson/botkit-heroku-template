export function StartGameMessage(players: Array<string>, playersBlock: Array<string>, playerStats: any) {
  const getAddOptions = () => {
    return {
      type: "section",
      block_id: "add_players_multi_select",
      text: {
        type: "mrkdwn",
        text: getStatus(),
      },
      accessory: {
        action_id: "multi_add_players",
        type: "multi_static_select",
        placeholder: {
          type: "plain_text",
          text: "Add Players",
          emoji: true
        },
        options: playersBlock
      }
    };
  };

  const getStatus = () => {
    const openSpots = 4 - players.length;
    if (openSpots === 0) {
      return `*Status:* Ready to begin`;
    } else {
      return `*Status:* Looking for ${openSpots} more.`;
    }
  };
  const getChallengers = () => {
    if (players.length === 0) {
      return "*Waiting for Challengers...*";
    }
    // const formattedPlayers = players.map(player => {
    //   const stats = playerStats[player];
    //   return `#${stats.rank || '?'} *${player}*  F: ${stats.gpg_f || '?'} G: ${stats.gpg_g || '?'} • win% ${(stats.wins/stats.games*100).toFixed(1)}`;
    // })
    const formattedPlayers = players.map(player => {
      const stats = playerStats[player];
      return `#${stats.rank || '?'} *${player}*  avg: ${(stats.gpg || 0).toFixed(2) || '?'} goals`;
    })
    let playerstring = formattedPlayers.join("\n");
    return `*Challengers:*\n ${playerstring}`;
  };

  const getButtons = () => {
    if (players.length === 4) {
      return [
        {
          type: "button",
          text: {
            type: "plain_text",
            emoji: true,
            text: "Start Standard Game"
          },
          style: "primary",
          value: "start_game_standard"
        },
        {
          type: "button",
          text: {
            type: "plain_text",
            emoji: true,
            text: "Start Swippy Swappy"
          },
          style: "primary",
          value: "start_game_swippy"
        },
        {
          type: "button",
          text: {
            type: "plain_text",
            emoji: true,
            text: "Cancel Game"
          },
          style: "danger",
          value: "cancel_game"
        },
        {
          type: "button",
          text: {
            type: "plain_text",
            emoji: true,
            text: "Leave"
          },
          style: "danger",
          value: "remove_user_from_game"
        }
      ];
    } else {
      return [
        {
          type: "button",
          text: {
            type: "plain_text",
            emoji: true,
            text: "Join"
          },
          style: "primary",
          value: "add_user_to_game"
        },
        {
          type: "button",
          text: {
            type: "plain_text",
            emoji: true,
            text: "Leave"
          },
          style: "danger",
          value: "remove_user_from_game"
        }
      ];
    }
  };

  return {
    blocks: [
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: "A Foosball game is about to go down!"
        }
      },
      {
        type: "section",
        fields: [
          {
            type: "mrkdwn",
            text: getChallengers()
          },
          // {
          //   type: "mrkdwn",
          //   text: getStatus()
          // }
        ]
      },
      getAddOptions(),
      {
        type: "actions",
        elements: getButtons()
      }
    ]
  };
}