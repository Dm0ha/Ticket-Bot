const { Client, Collection } = require("discord.js");

const { credentials } = require("./config/config.json");
const getFiles = require("./utils/modules/getFiles.js");

(async () => {
  const bot = new Client({ intents: ["GUILDS", "GUILD_MEMBERS", "GUILD_MESSAGES", "GUILD_MESSAGE_REACTIONS", "GUILD_EMOJIS"] })
  bot.commands = new Collection();

  getFiles("./utils/extenders")
    .filter(file => file.endsWith(".js"))
    .forEach(file => {
      require(`./${file.replace(/\\/g, "/")}`)
    })

  getFiles("./src/events")
    .filter(file => file.endsWith(".js"))
    .forEach(file => {
      file = file.replace(/\\/g, "/")
      const event = require(`./${file}`)
      bot.on(file.split("/").pop().split(".")[0], event.bind(null, bot))
    })

  getFiles("./src/commands")
    .filter(file => file.endsWith(".js"))
    .forEach(file => {
      file = file.replace(/\\/g, "/")
      const commandFile = require(`./${file}`)
      const command = new commandFile(bot)
      
      bot.commands.set(command.name, command)
    })

  bot.login(credentials.token);
}) ()