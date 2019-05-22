require('dotenv').config();

const admin = require('firebase-admin');
const serviceAccount = require(process.env.FIREBASE_TOKEN);

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});
const db = admin.firestore();

const fireStore = require('botkit-storage-firestore')({database: db, methods: ['coffee']});

var Botkit = require("botkit");

var _bots = {};

function _trackBot(bot) {
  _bots[bot.config.token] = bot;
}

function die(err) {
  console.log(err);
  process.exit(1);
}

module.exports = {
  pantryBot: () => {
    var controller = Botkit.slackbot({
      storage: fireStore
    }).configureSlackApp({
      clientId: process.env.CLIENT_ID,
      clientSecret: process.env.CLIENT_SECRET,
      scopes: ["bot"] //TODO it would be good to move this out a level, so it can be configured at the root level
    });

    controller.setupWebserver(process.env.PORT, function(err, webserver) {
      controller.createWebhookEndpoints(webserver);

      controller.createOauthEndpoints(webserver, function(
        err,
        req,
        res
      ) {
        if (err) {
          res.status(500).send("ERROR: " + err);
        } else {
          res.send("Success!");
        }
      });
    });

    controller.on("create_bot", function(bot, config) {
      if (_bots[bot.config.token]) {
        // already online! do nothing.
      } else {
        bot.startRTM(function(err) {
          if (err) {
            die(err);
          }

          _trackBot(bot);

          // init the botkit with a welcome message
          bot.startPrivateConversation({ user: config.createdBy }, function(err, convo) {
            if (err) {
              console.log(err);
            } else {
              convo.say('I am a bot that has just joined your team');
              convo.say(
                'You must now /invite me to a channel so that I can be of use!'
              );
            }
          });
        });
      }
    });

    // doing a blank document search via all is blowing up, fix this

    controller.storage.teams.all(function(err, teams) {
      if (err) throw new Error(err);

      if (!teams.length) {
        // TODO: seed teams collection if nothing found
        controller.storage.teams.save({ id: 0, name: "seed me bro" }, err => {
          if (err) console.log("teams", err);
        });
      } else {
        // connect all teams with bots up to slack!
        for (var t in teams) {
          if (teams[t].bot) {
            var bot = controller.spawn(teams[t]).startRTM(function(err) {
              if (err) {
                console.log("Error connecting bot to Slack:", err);
              } else {
                _trackBot(bot);
              }
            });
          }
        }
      }
    });

    return controller;
  }
};
