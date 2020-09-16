var wrapp, controller;
var VERIFICATION_TOKEN = process.env.VERIFICATION_TOKEN;

function isFromSlack(t) {
  return t === VERIFICATION_TOKEN;
}

/**
 * Define a function for initiating a conversation on installation
 * With custom integrations, we don't have a way to find out who installed us, so we can't message them :(
 */

function onInstallation(bot, installer) {
  if (installer) {
    bot.startPrivateConversation({user: installer}, function(err, convo) {
      if (err) {
        console.log(err);
      } else {
        convo.say('I am a bot that has just joined your team');
        convo.say('You must now /invite me to a channel so that I can be of use!');
      }
    });
  }
}


/**
 * Configure the persistence options
 */

var config = {};
if (process.env.MONGOLAB_URI) {
  var BotkitStorage = require('botkit-storage-mongo');
  config = {
    storage: BotkitStorage({mongoUri: process.env.MONGOLAB_URI}),
  };
} else {
  config = {
    json_file_store: ((process.env.TOKEN) ? './db_slack_bot_ci/' : './db_slack_bot_a/'), //use a different name if an app or CI
  };
}

/**
 * Are being run as an app or a custom integration? The initialization will differ, depending
 */

if (process.env.TOKEN || process.env.SLACK_TOKEN) {
  //Treat this as a custom integration
  var customIntegration = require('./lib/custom_integrations');
  var token = (process.env.TOKEN) ? process.env.TOKEN : process.env.SLACK_TOKEN;  //OATH TOKEN, 'xoxp-****'
  controller = customIntegration.configure(token, config, onInstallation);
  console.log('running as a custom integration');
} else if (process.env.CLIENT_ID && process.env.CLIENT_SECRET && process.env.PORT) {
  //Treat this as an app
  wrapp = require('./lib/apps');
  controller = wrapp.configure(process.env.PORT, process.env.CLIENT_ID, process.env.CLIENT_SECRET, config, onInstallation);
  console.log('running as an APP');
} else {
  console.log('Error: If this is a custom integration, please specify TOKEN in the environment. If this is an app, please specify CLIENTID, CLIENTSECRET, and PORT in the environment');
  process.exit(1);
}


// Handle events related to the websocket connection to Slack
controller.on('rtm_open', function(bot) {
  console.log('** The RTM api just connected!');
});

controller.on('rtm_close', function(bot) {
  console.log('** The RTM api just closed');
  wrapp.connectRTM(bot, config);
});


/**
 * Core bot logic goes here!
 * NOTE 'url_verification' event only happens with PUSH events, not RTM, which this bot uses.
 */
// BEGIN EDITING HERE!

controller.on('bot_channel_join', function(bot, msg) {
  console.log('bot_channel_join', msg);
  bot.reply(msg, "I'm here!");
});

controller.hears(['hello', 'hi', 'greetings', 'sup'], 'direct_message', function(bot, msg) {
  console.log('hears', msg.text);
  bot.reply(msg, 'Hello!');
});

controller.on('slash_command', function(bot, msg) {
  console.log('handling', msg.command);
  if (!isFromSlack(msg.token)){
    console.log('message not from slack?', msg);
    return;
  }

  switch (msg.command) {
    case '/f':
      console.log('command /Q received');
      if (!msg.text || msg.text === 'help') {
        bot.replyPrivate(msg, 'I find things. Try typing `/f thing I want`.');
        return;
      }
      bot.replyPublic(msg, '1', function() {
        bot.replyPublicDelayed(msg, '2', function() {
          // botkit not thennable yet: https://github.com/howdyai/botkit/issues/416
          bot.replyPublicDelayed(msg, '3');
        })
      });
      return;
    default:
      console.log('unknown command', msg.command);
      bot.replyPublic(msg, 'I do not know how to ' + msg.command + ' yet.');
  }
});

/**
 * AN example of what could be:
 * Any un-handled direct mention gets a reaction and a pat response!
 */
//controller.on('direct_message,mention,direct_mention', function (bot, message) {
//    bot.api.reactions.add({
//        timestamp: message.ts,
//        channel: message.channel,
//        name: 'robot_face',
//    }, function (err) {
//        if (err) {
//            console.log(err)
//        }
//        bot.reply(message, 'I heard you loud and clear boss.');
//    });
//});
