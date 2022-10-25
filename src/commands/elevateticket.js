const { MessageEmbed, MessageActionRow, MessageButton, MessageAttachment } = require('discord.js');

const Command = require('../../utils/structures/Command');

const TicketManager = require("../../utils/database/utils/TicketManager.js");
const { colors } = require("../../config/config.json");
const { settings, ticketTypes, ticketOptions } = require("../../config/tickets.json");

module.exports = class extends Command {
  constructor() {
    super({
      name: "elevate",
      aliases: ["el"],
      description: "Elevate a ticket.",
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
    const channelName = message.channel.name
    if(!channelName.includes('-e')) {
        message.channel.setName(channelName + '-e');
    }
      message.delete().catch(err => err)
  }
}