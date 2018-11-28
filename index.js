/**
 * A Bot for Slack!
 */

const Aftership = require("aftership")(process.env.AFTERSHIP_KEY);

/**
 * Define a function for initiating a conversation on installation
 * With custom integrations, we don't have a way to find out who installed us, so we can't message them :(
 */

function onInstallation(bot, installer) {
  if (installer) {
    bot.startPrivateConversation({ user: installer }, function(err, convo) {
      if (err) {
        console.log(err);
      } else {
        convo.say(
          "Hello. I am your aftership bot that has just joined your team."
        );
        convo.say(
          "You must now /invite me to a channel so that I can be of use!"
        );
      }
    });
  }
}

/**
 * Configure the persistence options
 */

var config = {};
if (process.env.MONGOLAB_URI) {
  var BotkitStorage = require("botkit-storage-mongo");
  config = {
    storage: BotkitStorage({ mongoUri: process.env.MONGOLAB_URI })
  };
} else {
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
  var customIntegration = require("./lib/custom_integrations");
  var token = process.env.TOKEN ? process.env.TOKEN : process.env.SLACK_TOKEN;
  var controller = customIntegration.configure(token, config, onInstallation);
} else if (
  process.env.CLIENT_ID &&
  process.env.CLIENT_SECRET &&
  process.env.PORT &&
  process.env.AFTERSHIP_KEY
) {
  //Treat this as an app
  var app = require("./lib/apps");
  var controller = app.configure(
    process.env.PORT,
    process.env.CLIENT_ID,
    process.env.CLIENT_SECRET,
    config,
    onInstallation
  );
} else {
  console.log(
    "Error: If this is a custom integration, please specify TOKEN in the environment. If this is an app, please specify CLIENT_ID, CLIENT_SECRET, AFTERSHIP_KEY, and PORT in the environment"
  );
  process.exit(1);
}

/**
 * A demonstration for how to handle websocket events. In this case, just log when we have and have not
 * been disconnected from the websocket. In the future, it would be super awesome to be able to specify
 * a reconnect policy, and do reconnections automatically. In the meantime, we aren't going to attempt reconnects,
 * WHICH IS A B0RKED WAY TO HANDLE BEING DISCONNECTED. So we need to fix this.
 *
 * TODO: fixed b0rked reconnect behavior
 */
// Handle events related to the websocket connection to Slack
controller.on("rtm_open", function(bot) {
  console.log("** The RTM api just connected!");
});

controller.on("rtm_close", function(bot) {
  console.log("** The RTM api just closed");
  // you may want to attempt to re-open
});

/**
 * Core bot logic follows
 */

controller.on("bot_channel_join", function(bot, message) {
  bot.reply(
    message,
    "I'm here and I'm ready to start helping you track your packages!"
  );
  bot.reply(
    message,
    "Simply use !track TRACKING-ID-NUMBER and a description of the package."
  );
  bot.reply(
    message,
    "I'll add that package to your Aftership list of tracked packages."
  );
});

controller.hears("(^)!track", "ambient", function(bot, message) {
  var arr = message.text.split(" ");
  var params = arr.splice(0, 2);
  params.push(arr.join(" "));

  var trackId = params[1];
  var description = params[2];

  let body = {
    tracking: {
      tracking_number: trackId,
      title: description
    }
  };
  Aftership.call(
    "POST",
    "/trackings",
    {
      body: body
    },
    function(err, response) {
      if (err) {
        console.log(err);
        bot.reply(message, "Error " + err.code + ": " + err.message);
      } else {
        bot.reply(
          message,
          "Successfully added tracking for " +
            description +
            " (" +
            trackId +
            ")"
        );
      }
    }
  );
});

controller.hears("hello", "direct_message", function(bot, message) {
  bot.reply(message, "Hello!");
});
