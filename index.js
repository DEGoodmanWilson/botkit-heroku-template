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
        convo.say('I am a bot that has just joined your team');
        convo.say(
          'You must now /invite me to a channel so that I can be of use!'
        );
      }
    });
  }
}

/**
 * Configure the persistence options
 */

// Load process.env values from .env file
require('dotenv').config();

var config = {};
if (process.env.MONGOLAB_URI) {
  var BotkitStorage = require('botkit-storage-firestore');
  config = {
    storage: BotkitStorage({
      mongoUri: process.env.MONGOLAB_URI,
      tables: ['coffee']
    })
  };
} else {
  config = {
    json_file_store: process.env.TOKEN
      ? './db_slack_bot_ci/'
      : './db_slack_bot_a/' //use a different name if an app or CI
  };
}

/**
 * Are being run as an app or a custom integration? The initialization will differ, depending
 */

if (process.env.TOKEN || process.env.SLACK_TOKEN) {
  //Treat this as a custom integration
  var customIntegration = require('./lib/custom_integrations');
  var token = process.env.TOKEN ? process.env.TOKEN : process.env.SLACK_TOKEN;
  var controller = customIntegration.configure(token, config, onInstallation);
} else if (
  process.env.CLIENT_ID &&
  process.env.CLIENT_SECRET &&
  process.env.PORT
) {
  //Treat this as an app
  var app = require('./lib/apps');
  var controller = app.configure(
    process.env.PORT,
    process.env.CLIENT_ID,
    process.env.CLIENT_SECRET,
    config,
    onInstallation
  );
} else {
  console.log(
    'Error: If this is a custom integration, please specify TOKEN in the environment. If this is an app, please specify CLIENTID, CLIENTSECRET, and PORT in the environment'
  );
  process.exit(1);
}

/**
TODO: Move off RTM
**/

controller.on('rtm_open', function(bot) {
  console.log('** The RTM api just connected!');
});

controller.on('rtm_close', function(bot) {
  console.log('** The RTM api just closed');
  // you may want to attempt to re-open
});

// Temporary solution before natural language processing
const mention = ['direct_mention', 'mention', 'direct_message'];

controller.on('bot_channel_join', function(bot, message) {
  //add a coffee related phrase
  bot.reply(message, 'Its coffee time');
});

controller.hears(['add coffee: '], mention, (bot, msg) => {
  const name = msg.text
    .substring(msg.text.lastIndexOf('coffee:') + 8, msg.text.lastIndexOf('by'))
    .trim();
  const roaster = msg.text
    .substring(msg.text.lastIndexOf('by') + 2, msg.text.length)
    .trim();

  controller.storage.coffee.save({
    id: name.concat(roaster.toLowerCase().replace(/ /g, '')),
    name,
    roaster,
    brew: new Date(),
    likes: 0,
    dislikes: 0
  });

  bot.reply(msg, `added: ${name}`);

  controller.storage.coffee.all((err, coffee) => {
    if (err) return console.error(err);
    if (coffee) {
      let coffeeList = `*Here's a list of our coffees:* \n`;
      coffee.forEach(
        bean => (coffeeList += `\n :coffee: ${bean.name} by ${bean.roaster}`)
      );
      bot.reply(msg, coffeeList);
    }
  });
});

controller.hears('menu', mention, (bot, msg) => {
  // table look-up all the coffee's brew date is today

  bot.reply(msg, 'looking...');
  var start = new Date();
  start.setHours(0, 0, 0, 0);

  var end = new Date();
  end.setHours(23, 59, 59, 999);

  controller.storage.coffee.find(
    { brew: { $gte: start, $lt: end } },
    (error, coffee) => {
      if (error) return console.error(error);
      if (coffee.length > 0) {
        coffee.forEach(({ name, roaster, url }) => {
          const u = url || 'http://www.google.com';

          bot.reply(msg, {
            text: `<${u}|${name}> by: *${roaster}*`,
            attachments: [
              {
                fallback: 'ranking is down, check back later',
                color: '#3AA3E3',
                attachment_type: 'default',
                actions: [
                  {
                    text: ':thumbsup:',
                    name: name,
                    type: 'button',
                    value: true
                  },
                  {
                    text: ':thumbsdown:',
                    name: name,
                    type: 'button',
                    value: false
                  }
                ]
              }
            ]
          });
        });
      } else {
        return bot.reply(msg, "sorry no coffee's found, brew up and try again");
      }
    }
  );
});

controller.hears('rank', mention, (bot, msg) => {});

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
