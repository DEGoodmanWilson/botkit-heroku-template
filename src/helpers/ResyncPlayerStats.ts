import axios from "axios";

function ResyncPlayerStats(playerStats: any) {
  axios({
    method: "get",
    url: `https://us-central1-tablechamp-444aa.cloudfunctions.net/stats`
  })
    .then((response: any) => {
      playerStats
      response.data.forEach((userStats: any) => {
        // console.log('hi', userStats.stats);
        playerStats[userStats.user] = userStats.stats;
      });
    })
    .catch((error: any) => console.log(error));
  return playerStats;
}

module.exports = ResyncPlayerStats;
