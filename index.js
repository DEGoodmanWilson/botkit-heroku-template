var controller = require('./lib/apps').pantryBot();

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
  
  const newFood = {
    id: name.concat(roaster.toLowerCase().replace(/ /g, '')),
    name,
    roaster,
    brew: new Date(),
    likes: 0,
    dislikes: 0
  };

  controller.storage.coffee.save(newFood, (err) => {
    if(err) console.error('firestore error' + err);
  });


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

  controller.storage.coffee.all((error, coffee) => {
      if (error) return console.error({error});
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
