const TicketManager = require("../../utils/database/utils/TicketManager.js");
const Command = require('../../utils/structures/Command');

module.exports = class extends Command {
  constructor() {
    super({
      name: "remove",
      aliases: [],
      description: "Remove user from ticket.",
      usage: "",
      example: "",
      category: "moderation",
      access: [
        "857034761033351208"
      ]
    })
  }

  async run(message, args, bot) {
    const ticket = await TicketManager.get({ channelID: message.channel.id })
    if (!ticket.success) return;

    const member = message.mentions.members.size > 0 ? message.mentions.members.first() : await message.guild.members.fetch(args[0]).catch(err => err)
    if (!member.id) return message.error(`You have not specified a valid user to remove.`)

    message.channel.createOverwrite(member.id, { "VIEW_CHANNEL": false })
    return message.post(`Successfully removed \`${member.user.tag}\` to the ticket.`)

  }
}