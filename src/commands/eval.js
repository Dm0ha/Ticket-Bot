const Discord = require('discord.js');
const Command = require('../../utils/structures/Command');
const Sequelize = require("sequelize");
const moment = require("moment");

const util = require('util');
const config = require("../../config/config.json");

const { database } = require("../../utils/database/sql.js");
const { tickets }= require("../../utils/database/models/tickets.js");

module.exports = class extends Command {
  constructor() {
    super({
      name: "eval",
      aliases: [],
      description: "Execute code within discord.",
      usage: "[code]",
      example: "message.channel.send(\"hello\")",
      category: "command",
      devOnly: true
    })
  }

  async run(message, args, bot) {
    /*
    let code = args.join(" ").startsWith("\`\`\`") ? args.join(" ").replace(/\`\`\`\n|\`\`\`\S.*\n|\`\`\`/g, "") : args.join(" ")
    if (!code.includes('return')) code = `return ${code}`

    const embed = new Discord.MessageEmbed()
    .setColor(message.member.displayHexColor)

    try {
      embed.setAuthor(`Successful Evaluation`)
      embed.addFields({
        name: `:outbox_tray: Output:`,
        value: `\`\`\`js\n${util.inspect(await eval(`(async () => {${code}})()`)).split("").slice(0, 1000).join("")}\n\`\`\``
      })
    } catch (e) {
      embed.setAuthor(`Unsuccessful Evaluation`)
      embed.addFields({
        name: `:outbox_tray: Error:`,
        value: `\`\`\`js\n${e}\n\`\`\``
      })
    }

    return message.post(embed)
     */
  }
}