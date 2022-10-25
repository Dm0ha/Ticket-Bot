const { MessageEmbed, MessageActionRow, MessageButton } = require('discord.js');

const TicketManager = require("../../utils/database/utils/TicketManager.js");
const Command = require('../../utils/structures/Command');

module.exports = class extends Command {
  constructor() {
    super({
      name: "add",
      aliases: [],
      description: "Add user to ticket.",
      usage: "",
      example: "",
      category: "moderation",
      access: [
        "703935706958921809", // admin
        "734746688270368849", // manager
        "738198908630728756", // srmod
        "703935754388373514", // mod
        "798749786844692480" // trainee
      ]
    })
  }

  async run(message, args, bot) {
    const ticket = await TicketManager.get({ channelID: message.channel.id })
    if (!ticket.success) return;

    const member = message.mentions.members.size > 0 ? message.mentions.members.first() : await message.guild.members.fetch(args[0]).catch(err => err)
    if (!member.id) return message.error(`You have not specified a valid user to add.`)

    message.channel.createOverwrite(member.id, { "VIEW_CHANNEL": true })
    return message.post(`Successfully added \`${member.user.tag}\` to the ticket.`)
  }
}