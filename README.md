# easy-peasy-bot

## The story of a (Slack)bot

A (not so) long time ago, a team called Tiny Speck built an app to communicate with each other as they worked.
In their daily work, they found that there were some mindless tasks they had to do over and over. These things pulled them out of important conversations, which slowed them down.

So, they built a special user in their messaging app: not a human user, but a digital user. The digital user took on some of their mindless tasks and integrated the other apps they used into their conversations.

Eventually their app was named Slack and their digital user, Slackbot.
And lo, you can build a Slack Bot, too! With our API and this nifty repository, a bot for your team can be all yours.

# Using Botkit for Custom Bots
1. Fork this project (test 3)
2. Open up your favorite terminal app, and clone your new repository to your local computer.
3. This is a Node.js project, so you’ll need to install the various dependencies by running:
    npm install
4. Edit `package.json` to give your bot a name and update the GitHub URLs to reflect the location of your fork in GitHub.
5. Go to https://my.slack.com/apps/new/A0F7YS25R-bots and pick a name for your new bot.
6. Once you’ve clicked “Add integration,” you’ll be taken to a page where you can further customize your bot. Of importance is the bot token—take note of it now.
7. Once you have the token, you can run your bot easily:

    ```bash
    TOKEN=xoxb-your-token-here npm start
    ```

    Your bot will now attempt to log into your team, and you should be able talk to it. Try telling your new bot “hello”. It should say “Hello!” back!

8. Botkit is structured around event listeners. The most important is the “hear” listener, which kicks off an action when your bot hears something. `index.js` contains the core logic, and has this event listener:

    ```javascript
    controller.hears('hello','direct_message', function(bot,message) {
        bot.reply(message, 'Hello!');
    });
    ```

    This event handler is triggered when the bot receives a direct message from a user that contains the word “hello.”

    The bot responds in the direct message with, “Hello!”

9. You can listen to any kind of message or you can configure your bot to only listen to direct messages or specific @-mentions of your bot. It’s up to you! To start let’s re-write the event listener to be more  flexible about the greetings it is listening for:
    ```javascript
    controller.hears(['hello', 'hi', 'greetings'], ['direct_mention', 'mention', 'direct_message'], function(bot,message) {
         bot.reply(message, 'Hello!');
     });
    ```

    Now our bot will respond any time it sees “hello,” “hi,” or “greetings” in either a DM or a message that @-mentions the bot. (Don’t forget to restart your bot after each edit!)

## Hurrah! Welcome to Level 2

You’ve built your first bot in Slack, and it’s not just a Hello World bot—it’s a Hi World and Greetings World bot too!

At this point you will probably want to start doing more sophisticated things, like making requests to external services, so your bot can respond with timely and useful information (depending on what your bot does, of course). There’s a lot more to Botkit than this! You can learn more about Botkit’s awesome features by simply perusing the [Botkit documentation](http://howdy.ai/botkit/docs/).

Once you’ve got your bot developed to your liking, it is ready to be deployed to your own hosting framework. No other configuration is necessary, except storing the token and desired port in environment variables.

# Using Botkit for Bot Apps

You can find full instructions for building a bot app with this repository at https://medium.com/slack-developer-blog/easy-peasy-bots-getting-started-96b65e6049bf#.4ay2fjf32
