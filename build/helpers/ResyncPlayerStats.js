"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = require("axios");
function ResyncPlayerStats(playerStats) {
    axios_1.default({
        method: "get",
        url: `https://us-central1-tablechamp-444aa.cloudfunctions.net/stats`
    })
        .then((response) => {
        playerStats;
        response.data.forEach((userStats) => {
            // console.log('hi', userStats.stats);
            playerStats[userStats.user] = userStats.stats;
        });
    })
        .catch((error) => console.log(error));
    return playerStats;
}
module.exports = ResyncPlayerStats;
//# sourceMappingURL=ResyncPlayerStats.js.map