const { MessageEmbed, MessageActionRow, MessageButton } = require('discord.js');

const { ticketOptions, ticketTypes } = require("../../config/tickets.json");
const Command = require('../../utils/structures/Command');

module.exports = class extends Command {
  constructor() {
    super({
      name: "admin",
      aliases: [],
      description: "Access to admin configurations.",
      usage: "",
      example: "",
      category: "administration",
      access: [
        "703935706958921809"
      ]
    })
  }

  async run(message, args, bot) {
    if (!args.length || !args[0]) return message.error(`Invalid Arguments. Valid Options:\n\n ${["- createTicketEmbed", "- generalTicketEmbed", "- appealTicketEmbed", "- bugreportembed"].join("\n")}`)

    switch (args[0].toLowerCase()) {
      case "createticketembed":
        var embed = new MessageEmbed()
          .setAuthor(`Create Tickets`)
          .setDescription(ticketOptions.description.join("\n"))
          .setFooter(ticketOptions.footer, message.guild.iconURL())

        var row = new MessageActionRow()
          .addComponents(...ticketTypes.filter(o => !o.disabled).map(o => {
            return new MessageButton()
              .setLabel(o.short)
              .setEmoji(o.emote)
              .setStyle("PRIMARY")
              .setCustomID(o.id)
          }))

        return message.channel.send({ embeds: [embed], components: [row] })

      case "generalticketembed":
        var embed = new MessageEmbed()
          .setAuthor(`Create Support Request`)
          .setDescription(`React to create a support request, and get in touch with our staff team.`)
          .setFooter(ticketOptions.footer, message.guild.iconURL())

        var row = new MessageActionRow()
          .addComponents(...ticketTypes.filter(o => o.id == "general").map(o => {
            return new MessageButton()
              .setLabel(o.short)
              .setEmoji(o.emote)
              .setStyle("PRIMARY")
              .setCustomID(o.id)
          }))

        return message.channel.send({ embeds: [embed], components: [row] })

      case "appealticketembed":
        var embed = new MessageEmbed()
          .setAuthor(`Create Punishment Appeal`)
          .setDescription(`React to create a punishment appeal, and get in touch with our staff team.`)
          .setFooter(ticketOptions.footer, message.guild.iconURL())

        var row = new MessageActionRow()
          .addComponents(...ticketTypes.filter(o => o.id == "appeals").map(o => {
            return new MessageButton()
              .setLabel(o.short)
              .setEmoji(o.emote)
              .setStyle("PRIMARY")
              .setCustomID(o.id)
          }))

        return message.channel.send({ embeds: [embed], components: [row] })

      case "bugreportembed":
        var embed = new MessageEmbed()
          .setAuthor(`Create Bug Report`)
          .setDescription(`React to create a bug report, and get in touch with our staff team.`)
          .setFooter(ticketOptions.footer, message.guild.iconURL())

        var row = new MessageActionRow()
          .addComponents(...ticketTypes.filter(o => o.id == "bugs").map(o => {
            return new MessageButton()
              .setLabel(o.short)
              .setEmoji(o.emote)
              .setStyle("PRIMARY")
              .setCustomID(o.id)
          }))

        return message.channel.send({ embeds: [embed], components: [row] })
    }
  }
}