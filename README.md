# aftership-bot

## The story of the aftership-bot

A (not so) long time ago, a suburbun couple was receiving and sending so many packages for their small business that they wanted a way to track them. They stumbled upon aftership.com, which helped them track all of their packages in one place. What they didn't want was another website to go to and interact with as part of their workflow.
In their daily work, they found that it would be best to have a home base for managing the business. As they were already using Slack to communicate casually, they found that there would be great benefit if they could just enter their package tracking information and descriptions into their slack channels and be done with it. They set up a MagicMirror to display the shipment data from aftership.com and created this here bot to quickly add package details to the aftership.com backend.
Using this repository, you too can simplify your package tracking efforts.

# Using aftership-bot

1. Fork this project.
2. Open up your favorite terminal app, and clone your new repository to your local computer.
3. This is a Node.js project, so you’ll need to install the various dependencies by running:
   npm install
4. Edit `package.json` to update the GitHub URLs to reflect the location of your fork in GitHub.
5. Go to https://my.slack.com/apps/new/A0F7YS25R-bots and pick a name for your new bot.
6. Once you’ve clicked “Add integration,” you’ll be taken to a page where you can further customize your bot. Of importance is the bot token—take note of it now.
7. Once you have the token, you can run your bot easily:

   ```bash
   AFTERSHIP_KEY= abc-def CLIENT_ID=xxx.yyy CLIENT_SECRET=qrst-uvw PORT=8765 npm start
   ```

   Your bot will now attempt to log into your team, and you should be able talk to it. Try telling your new bot “hello”. It should say “Hello!” back!

   Next, follow your bot's instructions to invite it to a channel. It'll listen within this channel for any !track `TrackingNumber` `description` commands and add the specified package to Aftership.
