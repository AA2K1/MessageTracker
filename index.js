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
const WordData = require("./models/words.js");
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
  client.user.setPresence({ activity: { name: prefix + "help" }, status: 'idle' })
  .catch(err => console.log(err));
});

client.on("message", async message => {
  if (!message.author.bot) {
    let words = message.content.toLowerCase().split(" ");
    let counter = new Map();
    // Split message's text into words
    words.forEach((word) => {
      if (word.length === 0) {
        return;
      }
      if (counter.has(word)) {
        counter.set(word, parseInt(counter.get(word)) + 1);
      } else {
        counter.set(word, 1);
      }
    });
    // Save all words into a database
    WordData.findOne({userID: message.author.id}, function(err, words){
      if(!err) {
        if(!words) {
          const newWords = new WordData({
            userID: message.author.id,
            username: message.author.username,
            wordCount: counter
          });
          newWords.save((err) => console.log(err));
        } else {
          for (const [key, value] of counter.entries()) {
            if(words.wordCount.has(key)) {
              words.wordCount.set(key, words.wordCount.get(key) + value);
            } else {
              words.wordCount.set(key, 1);
            }
          } 
          words.save(function(err) {
          if(err) console.log(err);
          });
        }
      }
    });
    if(message.content.toLowerCase().includes(prefix + "wordlb")) {
      //Access thing
      let wordToFind = words[1];
      let sortParams = {'wordCount' : 'desc'};
      if(wordToFind == null) {
        return message.channel.send("`ERROR: There is no argument for what word you want to see.`").then(msg => msg.delete({timeout: 15000}))
      } else {
        try {
          console.log(wordToFind);
          console.log(words);
          WordData.find({})
          .sort(sortParams)
          .exec((err, res) => {
            if (err) console.log(err);

            let embed = new MessageEmbed()
              .setTitle(`Who said ${wordToFind} the most?`)
              .setFooter(client.user.username, client.user.displayAvatarURL());
            if (res.length === 0) {
              embed.setColor(0xe84d4d);
              embed.setDescription("`ERROR: No data to work off of...`");
            } else if (res.length < 5) {
              embed.setColor(0x3970b8);
              for (let i = 0; i < res.length; i++) {
                // console.log(res[i].wordCount.get(wordToFind.toString()));
                let member =
                  WordData.findOne({ userID: res[i].userID }) || "???";
                if (member == "???") {
                  embed.addField(
                    `${i + 1}. ${member}`,
                    `**Count:** ${res[i].wordCount.get(wordToFind.toString())}`
                  );
                } else if(res[i].wordCount.get(wordToFind) !== undefined) {
                  if (i + 1 == 1) {
                    embed.addField(
                      `🥇: **${res[i].username}**`,
                      `**Count: ${res[i].wordCount.get(wordToFind.toString())}**`
                    );
                  } else if (i + 1 == 2) {
                    embed.addField(
                      `🥈: **${res[i].username}**`,
                      `  **Count: ${res[i].wordCount.get(wordToFind.toString())}**`
                    );
                  } else if (i + 1 == 3) {
                    embed.addField(
                      `🥉: **${res[i].username}**`,
                      `  **Count: ${res[i].wordCount.get(wordToFind.toString())}**`
                    );
                  } else {
                    embed.addField(
                      `🏅: **${res[i].username}**`,
                      `  **Count: ${res[i].wordCount.get(wordToFind.toString())}**`
                    );
                  }
                }
              }
            } else {
              embed.setColor(0x3970b8);
              for (let i = 0; i < 5; i++) {
                // console.log(res[i].wordCount.get(wordToFind.toString()));
                let member =
                  MessageData.findOne({ userID: res[i].userID }) || "???";
                if (member == "???") {
                  embed.addField(
                    `${i + 1}. ${member}`,
                    `**Count:** ${res[i].wordCount.get(wordToFind.toString())}`
                  );
                } else if(res[i].wordCount.get(wordToFind) !== undefined) {
                  if (i + 1 == 1) {
                    embed.addField(
                      `🥇: **${res[i].username}**`,
                      `  **Count: ${res[i].wordCount.get(wordToFind.toString())}**`
                    );
                  } else if (i + 1 == 2) {
                    embed.addField(
                      `🥈: **${res[i].username}**`,
                      `  **Count: ${res[i].wordCount.get(wordToFind.toString())}**`
                    );
                  } else if (i + 1 == 3) {
                    embed.addField(
                      `🥉: **${res[i].username}**`,
                      `  **Count: ${res[i].wordCount.get(wordToFind.toString())}**`
                    );
                  } else {
                    embed.addField(
                      `🏅: **${res[i].username}**`,
                      `  **Count: ${res[i].wordCount.get(wordToFind.toString())}**`
                    );
                  }
                }
              }
            }
            message.channel.send(embed).then(msg => msg.delete({timeout: 15000}));
          });
        } catch(err) {
          console.log(err);
        }
      }
    } else if(message.content.toLowerCase().includes(prefix + "wordstats") || message.content.toLowerCase().includes(prefix + "wordcount")) {
      let wordToFind = words[1];
      WordData.findOne(
        {
          userID: message.author.id,
          username: message.author.username
        },
        (err, messages) => {
          if (err) console.error(err);
          if (!messages) {
            return message.channel.send("`ERROR: You haven't sent a message yet.`").then(msg => msg.delete({timeout: 15000}));
          } else {
            let embed = new MessageEmbed()
              .setTitle(`How many times has ${message.author.username} said ${wordToFind}?`)
              .setThumbnail(message.author.displayAvatarURL())
              .setFooter(client.user.username, client.user.displayAvatarURL());
              if(messages.wordCount.get(wordToFind) !== undefined) {
                embed.setColor("0x3970b8")
                embed.addField(
                  `You have said ${wordToFind} a total of:`,
                  `**${messages.wordCount.get(wordToFind)}** times!`
                )
              } else {
                embed.setColor("0xf56042");
                embed.setDescription(`**You haven't said this word yet!**`);
              }
            message.channel
              .send(embed)
              .then(msg => msg.delete({ timeout: 15000 }));
          }
        }
      );
    }
    else if(message.content.toLowerCase() === prefix + "help") {
      let embed = new MessageEmbed() 
        .setColor("0x3970b8")
        .setTitle("MessageTracker")
        .setDescription("Commands: ")
        .addField("msgstats", "Returns the number of messages you've sent in a pretty embed. Usage is: **+msgstats** or **+msgcount**.")
        .addField("msglb", "A global leaderboard to show the top chatters! Usage is **+msglb** or **+messagelb**.")
        .addField("wordstats", "Shows how many times you've said a given word. Usage is **+wordstats [word]** or **+wordcount [word]**.")
        .addField("wordlb", "A global leaderboard showing how many times you've said a given word! Usage is **+wordlb [word]**.")
        .setThumbnail(client.user.displayAvatarURL())
        .setFooter(client.user.username, client.user.displayAvatarURL())
      message.author.send(embed);
    } else if (message.content.toLowerCase() === prefix + "msgstats" || message.content.toLowerCase() === prefix + "msgcount") {
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
            message.channel.send("`ERROR: You haven't sent a message yet.`").then(msg => msg.delete({timeout: 15000}));
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
    } else if (message.content.toLowerCase() === prefix + "msglb" || message.content.toLowerCase() === prefix + "messagelb") {
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
              if (member == "???") {
                embed.addField(
                  `${i + 1}. ${member}`,
                  `**Count:** ${res[i].messageCount}`
                );
              } else {
                if (i + 1 == 1) {
                  embed.addField(
                    `🥇: **${res[i].username}**`,
                    `**Count: ${res[i].messageCount}**`
                  );
                } else if (i + 1 == 2) {
                  embed.addField(
                    `🥈: **${res[i].username}**`,
                    `  **Count: ${res[i].messageCount}**`
                  );
                } else if (i + 1 == 3) {
                  embed.addField(
                    `🥉: **${res[i].username}**`,
                    `  **Count: ${res[i].messageCount}**`
                  );
                } else {
                  embed.addField(
                    `🏅: **${res[i].username}**`,
                    `  **Count: ${res[i].messageCount}**`
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
                  `**Count:** ${res[i].messageCount}`
                );
              } else {
                if (i + 1 == 1) {
                  embed.addField(
                    `🥇: **${res[i].username}**`,
                    `  **Count: ${res[i].messageCount}**`
                  );
                } else if (i + 1 == 2) {
                  embed.addField(
                    `🥈: **${res[i].username}**`,
                    `  **Count: ${res[i].messageCount}**`
                  );
                } else if (i + 1 == 3) {
                  embed.addField(
                    `🥉: **${res[i].username}**`,
                    `  **Count: ${res[i].messageCount}**`
                  );
                } else {
                  embed.addField(
                    `🏅: **${res[i].username}**`,
                    `  **Count: ${res[i].messageCount}**`
                  );
                }
              }
            }
          }
          message.channel.send(embed).then(msg => msg.delete({timeout: 15000}));
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