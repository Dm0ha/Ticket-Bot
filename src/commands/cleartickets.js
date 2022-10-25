const { MessageEmbed, MessageActionRow, MessageButton, MessageAttachment } = require('discord.js');

const Command = require('../../utils/structures/Command');

const TicketManager = require("../../utils/database/utils/TicketManager.js");
const { colors } = require("../../config/config.json");
const { settings, ticketTypes, ticketOptions } = require("../../config/tickets.json");

module.exports = class extends Command {
  constructor() {
    super({
      name: "cleartickets",
      aliases: ["clt"],
      description: "Delete unanswered processed appeals.",
      usage: "",
      example: "",
      category: "moderation",
      access: [
        "703935706958921809", // admin
        "734746688270368849", // manager
      ]
    })
  }

  async run(message, args, bot) {
      message.delete()
      const category = await message.guild.channels.cache.get("875647948061552710");
      let count = 0;
      category.children.forEach(channel =>
      	channel.messages.fetch({ limit: 1 }).then(messages => {
          const lastMessage = messages.first()
          if (Date.now() - lastMessage.createdTimestamp > 1000*60*60*24 && lastMessage.author.id == "910250758639849533") {
              channel.delete()
              count++;
          }
      }).catch(err => { console.error(err) })
                                )
      setTimeout(function(){ 
         message.channel.send(`Cleared ${count} tickets.`);
      }, 1000);
  }
}
      