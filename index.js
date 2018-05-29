const keys = require('./config/keys');
const messages = require('./config/messages');
const options = require('./config/requestOptions');
const request = require('request');
const rp = require('request-promise');
const Ticket = require('./models/Ticket');
var ticket_list = {};
var user_list = {};
var user_id_on_call = undefined;
var main_interval_id = -1;
var old_date;
var cur_date;
var escalation_level = 1;

/**
 * Define a function for initiating a conversation on installation
 * With custom integrations, we don't have a way to find out who installed us, so we can't message them :(
 */

function onInstallation(bot, installer) {
  if (installer) {
    bot.startPrivateConversation({user: installer}, function (err, convo) {
      if (err) {
        console.log(err);
      } else {
        convo.say("I'm the P0 bot! I'm here to automatically notify the on_call developer of any new P0s and send reminders to update the ticket until resolved.");
        convo.say("Most of my functions will handle automatically, however some commands rely on human interaction so /invite me to a channel to use them!");
      }
    });
  }

  botReboot();
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
    json_file_store: ((process.env.TOKEN)?'./db_slack_bot_ci/':'./db_slack_bot_a/'), //use a different name if an app or CI
  };
}

/**
 * Are being run as an app or a custom integration? The initialization will differ, depending
 */

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
  console.log('Error: If this is a custom integration, please specify TOKEN in the environment. If this is an app,'
    + ' please specify CLIENTID, CLIENTSECRET, and PORT in the environment');
  process.exit(1);
}

/**
 * Core bot logic goes here!
 */
// BEGIN EDITING HERE!
function botReboot(){
  if(main_interval_id != -1)
    clearInterval(main_interval_id);

  ticket_list = {};
  user_id_on_call = undefined;

  old_date = new Date();
  old_date = old_date.toISOString();
  old_date = old_date.substr(0, 18) + old_date.substr(22,23);

  main_interval_id = setInterval(function(){
    cur_date = new Date()
    cur_date = cur_date.toISOString();
    cur_date = cur_date.substr(0, 18) + cur_date.substr(22,23);

    // old_date = old_date.replace(":", "%3A");
    // cur_date = cur_date.replace(":", "%3A");
    // old_date = old_date.replace(":", "%3A");
    // cur_date = cur_date.replace(":", "%3A");

    options.p_zero_check.since = old_date;
    options.p_zero_check.until = cur_date;

    console.log("SINCE: " + options.p_zero_check.since);
    console.log("UNTIL: " + options.p_zero_check.until);

    request(options.p_zero_check, function(err, res, body){
      body = body.incidents;
      console.log(body);

      if(body == []){
        return;
      } else {
        for(var i = 0; i < body.length; i++){
          for(var j = 0; j < body[i].impacted_services.length; j++){
            if(body[i].impacted_services[j].summary == "Connect P0 Escalation")
              controller.trigger("p0 open", [bot, body.incident_number]);
          }
        }
      }

      old_date = cur_date;

      for(var ticket_number in ticket_list){
        request({url: 'https://api.pagerduty.com/incidents/' + ticket_number, json: true}, function(err, res, body){
          if(body.incidents.status == "resolved")
            controller.trigger("p0 close", [bot, body.incident_number]);
        });
      }
    });
          
  }, 10000);
}

controller.on('bot_channel_join', function (bot, message) {
  bot.reply(message, "This is the P0lice! Put your hands where I can see them! :male-police-officer: :rotating_light: :female-police-officer:");
  //botReboot();
});

// The big kahuna. This guy may be dirty af, but he gets the job done
controller.hears("p0 open", ['direct_mention', 'mention', 'direct_message'], function(bot, /*ticket_number*/ message){
  ticket_number = message.text.split(' ')[2];

  rp(options.slack_users).then(function(slack_users){
    var users = slack_users.members;
    user_list = {};

    for(var i = 0; i < users.length; i++){
      user_list[users[i].real_name] = users[i].id;
    }

    request(options.on_call, (err, res, body) => {
      if (err){
        return console.log(err);
      }

      body = body.oncalls;

      var user_name = body[2].user.summary;
      user_id_on_call = /*user_list[user_name]*/ 'UATBQNHML';
      bot.reply(message, "Ticket number" + ticket_number + " has been opened")

      bot.startPrivateConversation({user: user_id_on_call}, function(err, convo){
        if(err){
          console.log(err);
        }

        dm = messages.open[Math.floor(Math.random() * 5) + 1];
      
        convo.say(dm);
      });

       ticket_list[ticket_number] = new Ticket(ticket_number, user_id_on_call);

       controller.trigger("set reminder", [bot, ticket_list[ticket_number], 1, 'hour'])
    });
  });
});

controller.hears("p0 close", ['direct_mention', 'mention', 'direct_message'], function(bot, /*ticket_number*/ message){
  ticket_number = '123';
  var temp = ticket_list[ticket_number];
  clearInterval(temp.interval_id);

  bot.startPrivateConversation({user: temp.user_id}, function(err, convo){
    if(err){
      console.log(err);
    }

    dm = messages.close[Math.floor(Math.random() * 4) + 1];

    convo.say(dm);
  });

  delete ticket_list[ticket_number];
});

controller.on("set reminder", function(bot, ticket, time_number, time_unit){
  if(ticket.interval_id != -1)
    clearInterval(ticket.interval_id);

  var time = (time_unit == 'minute' || time_unit == 'minutes') ? 1000*60*time_number : 1000*60*60*time_number;

  ticket.interval_id = setInterval(function(){
    bot.startPrivateConversation({user: ticket.user_id}, function(err, convo){
      if(err){
        console.log(err);
      }

      convo.say("This is a reminder to update ticket number " + ticket.number);
    })
  }, time);
})

controller.hears("p0 time", ['direct_mention', 'mention', 'direct_message'], function(bot, message){
  message_text = message.text.split(' ');

  if(message_text.length != 5){
    bot.reply(message, "It looks like you entered the wrong format. It should be 'p0 time <ticket number> <time_number> <time_unit> where time unit is either in minutes or hours'");
    return;
  }

  var ticket_number = message_text[2];
  var time_number = parseInt(message_text[3]);
  var time_unit = message_text[4];

  if(time_number == NaN){
    bot.reply(message, "Please enter a real number for the time");
    return;
  }

  var temp = ticket_list[ticket_number];

  if(temp == undefined){
    bot.reply(message, "The ticket number you entered is invalid.");
    return;
  }

  controller.trigger("set reminder", [bot, temp, time_number, time_unit]);

  bot.reply(message, "The time intervals for updates on ticket " + ticket_number + " has been changed to " + time_number + " " + time_unit);

  bot.startPrivateConversation({user: user_id_on_call}, function(err, convo){
    if(err){
      console.log(err);
    }

    convo.say("The reminder interval was updated to" + time_number + " " + time_unit + " for ticket number " + ticket_number + " so you may need to update the ticket.")
  });
});

controller.hears('escalation', ['direct_mention', 'mention', 'direct_message'], function(bot, message){
  request(options.escalation, (err, res, body) => {
    body = body.oncalls;
  
    var escalation1 = body[2].user.summary;
    var escalation2 = body[1].user.summary;
    var escalation3 = body[0].user.summary;

    bot.reply(message, "Escalation 1: " + escalation1 + "\nEscalation 2: " + escalation2 + "\nEscalation 3: " + escalation3);
  })
});

controller.hears("stop reminders", ['direct_mention', 'mention', 'direct_message'], function(bot, message){
  message_text = message.split(' ');
});

controller.hears("reboot", ['direct_mention', 'mention', 'direct_message'], function(bot, message){
  botReboot();
});

controller.hears("", ['direct_mention', 'mention', 'direct_message'], function(bot, message){
  console.log(message);
});

controller.hears("escalate", ["direct_mention", "mention", "direct_message"], function(bot, message){
  message_text = message.text.split(' ');

  if(message_text.length != 2){
    bot.reply(message, "Bad format. Please enter 'escalation <ticket number>'.");
    return;
  }
  
  if(escalation_level == 3){
    bot.reply(message, "We are already at the highest esclation");
    return;
  }

  escalation_level++;

  ticket = ticket_list[message_text[1]];

  if(ticket == undefined){
    bot.reply(message, "Invalid ticket number");
    return;
  }

  request(options.escalation, (err, res, body) => {
    var newOnCall = body[3 - escalation_level].user.summary; 

    ticket.user_id = user_list[newOnCall];
  })
})
