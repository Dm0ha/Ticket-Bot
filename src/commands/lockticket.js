const { MessageEmbed, MessageActionRow, MessageButton, MessageAttachment, Permissions } = require('discord.js');

const Command = require('../../utils/structures/Command');

const TicketManager = require("../../utils/database/utils/TicketManager.js");
const { colors } = require("../../config/config.json");
const { settings, ticketTypes, ticketOptions } = require("../../config/tickets.json");

module.exports = class extends Command {
  constructor() {
    super({
      name: "lockticket",
      aliases: [],
      description: "Locks or unlocks a ticket.",
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
      
    const guild = message.guild
    const ticket = await TicketManager.get({ channelID: message.channel.id })
    const ticketData = ticketTypes.find(t => t.id == ticket.data.type)
    var title = ''
    var description = ''
    if(ticket.data.type == "appeals") {
        const member = await guild.members.fetch(ticket.data.userID)
        if((new Permissions(member.permissionsIn(message.channel))).serialize().SEND_MESSAGES) {
            message.channel.updateOverwrite(member.id, {'SEND_MESSAGES': false, 'ATTACH_FILES': false});
            title = "Ticket Locked"
            description = "Your ticket has been locked for the time being while your case is investigated further. Please be patient in the meantime."
        } else {
            message.channel.updateOverwrite(member.id, {'SEND_MESSAGES': true, 'ATTACH_FILES': true});
            title = "Ticket Unlocked"
            description = "Your ticket has been unlocked."
        }
        const embedProc = new MessageEmbed()
              .setTitle(title)
              .setDescription(description)
              .setColor(colors.error)
              .setFooter(ticketOptions.footer + ` (${message.author.id})`, guild.iconURL())
        await message.channel.send({ embeds: [embedProc] })
        message.delete().catch(err => err)
    }
  }
}