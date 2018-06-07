function onInstallation(bot, installer) {
    if (installer) {
        bot.startPrivateConversation({user: installer}, function (err, convo) {
            if (err) {
                console.log(err);
            } else {
                convo.say('I am a Tuna bot that has just joined your team');
                convo.say('You must now /invite me to a channel so that I can be of use!');
            }
        });
    }
}

var config = {};
if (process.env.MONGOLAB_URI) {
    var BotkitStorage = require('botkit-storage-mongo');
    config = {
        storage: BotkitStorage({mongoUri: process.env.MONGOLAB_URI}),
    };
} else {
    config = {
        json_file_store: ((process.env.TOKEN)?'./db_slack_bot_ci/':'./db_slack_bot_a/'), //use a different name if an app or CI
    };
}

if (process.env.TOKEN || process.env.SLACK_TOKEN) {
    //Treat this as a custom integration
    var customIntegration = require('./lib/custom_integrations');
    var token = (process.env.TOKEN) ? process.env.TOKEN : process.env.SLACK_TOKEN;
    var controller = customIntegration.configure(token, config, onInstallation);
} else if (process.env.CLIENT_ID && process.env.CLIENT_SECRET && process.env.PORT) {
    //Treat this as an app
    var app = require('./lib/apps');
    var controller = app.configure(process.env.PORT, process.env.CLIENT_ID, process.env.CLIENT_SECRET, config, onInstallation);
} else {
    console.log('Error: If this is a custom integration, please specify TOKEN in the environment. If this is an app, please specify CLIENTID, CLIENTSECRET, and PORT in the environment');
    process.exit(1);
}

// Handle events related to the websocket connection to Slack
controller.on('rtm_open', function (bot) {
    console.log('** The RTM api just connected!');
});

controller.on('rtm_close', function (bot) {
    console.log('** The RTM api just closed');
    // you may want to attempt to re-open
});


/**
 * Core bot logic!
 */

 // When Miss Thang joins the channel #standup
controller.on('bot_channel_join', function (bot, message) {
    bot.reply(message, "What's up office fam? Bet you're surprised to see me here. I'm the new standup queen and will be taking it over from here @StandupJack.")
});

// Stop trying to talk to her!
controller.hears(['hello','Tuna'],'direct_message', function(bot,message) {
    bot.reply(message, 'Bork!');
});

controller.hears('pizzatime', 'direct_message', function(bot,message) {
    askYesterday = function(response, convo) {
      convo.ask('What did you accomplish yesterday?', function(response, convo) {
        convo.say('Cool.');
        askToday(response, convo);
        convo.next();
      });
    }
    askToday = function(response, convo) {
      convo.ask('What are you working on today?', function(response, convo) {
        convo.say('Sounds good.')
        askWhen(response, convo);
        convo.next();
      });
    }
    askWhen = function(response, convo) {
      convo.ask('When will you be done? Any blockers?', function(response, convo) {
        convo.say('Alright, peace out.');
        convo.next();
      });
    }

    bot.startConversation(message, askYesterday);
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
