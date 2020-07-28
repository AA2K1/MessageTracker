const express = require('express');
const app = express();
const port = 3000;

app.get('/', (req, res) => res.send('Hello World!'));

app.listen(port, () => console.log(`Example app listening at http://localhost:${port}`));

const { MessageEmbed, Client } = require("discord.js");
const prefix = "+";
const client = new Client();
const mongoose = require("mongoose");
const MessageData = require("./models/messages.js");
const MONGODB_URI = `mongodb+srv://godot:${process.env.PASSWORD}@messagetracker.kdaxt.azure.mongodb.net/${process.env.DBNAME}?retryWrites=true&w=majority`;
mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

mongoose.connection.on("connected", () => {
  console.log("Successfully connected to db!");
});

client.once("ready", () => {
  console.log("Ready to track!");
});

client.on("message", async message => {
  if (!message.author.bot) {
    if(message.content.toLowerCase() === prefix + "help") {
      let embed = new MessageEmbed() 
        .setColor("0x3970b8")
        .setTitle("MessageTracker")
        .setDescription("Commands: ")
        .addField("Stats", "Returns the number of messages you've sent in a pretty embed.")
        .addField("Leaderboard", "A global leaderboard to show the top chatters!")
        .setThumbnail(client.user.displayAvatarURL())
        .setFooter(client.user.username, client.user.displayAvatarURL())
      message.author.send(embed);
    } else if(!message.content.startsWith(prefix)) {
      if(message.mentions.members.username === client.user.username) {
        let embed = new MessageEmbed() 
        .setColor("0x3970b8")
        .setTitle("MessageTracker")
        .setDescription("Commands: ")
        .addField("Stats", "Returns the number of messages you've sent in a pretty embed.")
        .addField("Leaderboard", "A global leaderboard to show the top chatters!")
        .setThumbnail(client.user.displayAvatarURL())
        .setFooter(client.user.username, client.user.displayAvatarURL())
      message.author.send(embed);
      }
    }

    else if (message.content.toLowerCase() === prefix + "stats") {
      MessageData.findOne(
        {
          userID: message.author.id,
          username: message.author.username
        },
        (err, messages) => {
          if (err) console.error(err);
          if (!messages) {
            const newTracker = new MessageData({
              userID: message.author.id,
              username: message.author.username,
              messageCount: 1
            });
            newTracker.save().catch(err => console.error(err));
            message.channel.send("`ERROR: You haven't sent a message yet.`");
          } else {
            let embed = new MessageEmbed()
              .setColor("0x3970b8")
              .setTitle(`${message.author.username}'s Stats`)
              .setThumbnail(message.author.displayAvatarURL())
              .addField(
                "You have sent a total of: ",
                `**${messages.messageCount}** messages!`
              )
              .setFooter(client.user.username, client.user.displayAvatarURL());
            message.channel
              .send(embed)
              .then(msg => msg.delete({ timeout: 15000 }));
          }
        }
      );
    } else if (message.content.toLowerCase() === prefix + "leaderboard") {
      MessageData.find({})
        .sort([["messageCount", "descending"]])
        .exec((err, res) => {
          if (err) console.log(err);

          let embed = new MessageEmbed()
            .setTitle(`The Top Chatters of All Time`)
            .setFooter(client.user.username, client.user.displayAvatarURL());
          if (res.length === 0) {
            embed.setColor(0xe84d4d);
            embed.setDescription("`ERROR: No data to work off of...`");
          } else if (res.length < 5) {
            embed.setColor(0x3970b8);
            for (let i = 0; i < res.length; i++) {
              let member =
                MessageData.findOne({ userID: res[i].userID }) || "???";
              if (member == "User left") {
                embed.addField(
                  `${i + 1}. ${member}`,
                  `**Message Count:** ${res[i].messageCount}`
                );
              } else {
                if (i + 1 == 1) {
                  embed.addField(
                    `🥇: **${res[i].username}**`,
                    `**Message Count: ${res[i].messageCount}**`
                  );
                } else if (i + 1 == 2) {
                  embed.addField(
                    `🥈: **${res[i].username}**`,
                    `  **Message Count: ${res[i].messageCount}**`
                  );
                } else if (i + 1 == 3) {
                  embed.addField(
                    `🥉: **${res[i].username}**`,
                    `  **Message Count: ${res[i].messageCount}**`
                  );
                } else {
                  embed.addField(
                    `🏅: **${res[i].username}**`,
                    `  **Message Count: ${res[i].messageCount}**`
                  );
                }
              }
            }
          } else {
            embed.setColor(0x3970b8);
            for (let i = 0; i < 5; i++) {
              let member =
                MessageData.findOne({ userID: res[i].userID }) || "User left";
              if (member == "User left") {
                embed.addField(
                  `${i + 1}. ${member}`,
                  `**Message Count:** ${res[i].messageCount}`
                );
              } else {
                if (i + 1 == 1) {
                  embed.addField(
                    `🥇: **${res[i].username}**`,
                    `  **Message Count: ${res[i].messageCount}**`
                  );
                } else if (i + 1 == 2) {
                  embed.addField(
                    `🥈: **${res[i].username}**`,
                    `  **Message Count: ${res[i].messageCount}**`
                  );
                } else if (i + 1 == 3) {
                  embed.addField(
                    `🥉: **${res[i].username}**`,
                    `  **Message Count: ${res[i].messageCount}**`
                  );
                } else {
                  embed.addField(
                    `🏅: **${res[i].username}**`,
                    `  **Message Count: ${res[i].messageCount}**`
                  );
                }
              }
            }
          }
          message.channel.send(embed);
        });
    }

    MessageData.findOne(
      {
        userID: message.author.id,
        username: message.author.username
      },
      (err, messages) => {
        if (err) console.log(err);
        if (!messages) {
          const newTracker = new MessageData({
            userID: message.author.id,
            username: message.author.username,
            messageCount: 1
          });
          newTracker.save().catch(err => console.error(err));
        } else {
          messages.messageCount = messages.messageCount + 1;
          messages.save().catch(err => console.error(err));
        }
      }
    );
  }
});

client.login(process.env.TOKEN);