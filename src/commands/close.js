const { MessageEmbed, MessageActionRow, MessageButton, MessageAttachment } = require('discord.js');

const { colors, processed_appeals } = require("../../config/config.json");
const { ticketOptions, ticketTypes } = require("../../config/tickets.json");
const TicketManager = require("../../utils/database/utils/TicketManager.js");
const Command = require('../../utils/structures/Command');

module.exports = class extends Command {
  constructor() {
    super({
      name: "close",
      aliases: [],
      description: "Close a ticket with a reason.",
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
    if (!ticket) return message.error(`This doesn't seem to be a ticket.`)

    const reason = args?.join(" ") || "Closed via command."
    
    const channelMessages = (await message.channel.messages.fetch()).array().reverse()
    const messages = Buffer.from(channelMessages.map(message => `${message.author.tag}: ${message.content}`).join('\n'), 'utf-8');

    const ticketData = ticketTypes.find(t => t.id == ticket.data.type)
    const logs = message.guild.channels.cache.get(ticketData.logs)
    await TicketManager.update(ticket.data.id, { active: false, staffID: message.author.id, closeReason: reason })

    const ticketUser = await message.guild.members.fetch(ticket.data.userID).catch(err => err)
    
    // removing appeal team perms, ignore how stupidly this is situated
    if(ticket.data.type == "appeals") {
        try {
                message.channel.permissionOverwrites.get('761412746750590987').delete()
                message.channel.updateOverwrite(member.id, {'SEND_MESSAGES': true, 'ATTACH_FILES': true})
            } catch (error) {
                console.error(error)
            }
    } 

    const embed = new MessageEmbed()
      .setAuthor(`Ticket Closed [ID: #${ticket.data.id}]`)
      .setColor(colors.main)
      .setFooter(ticketOptions.footer, message.guild.iconURL())
      .setDescription([
        `Ticket Type: **${ticket.data.type}**`,
        `Opened By: **${ticketUser?.user?.tag || "N/A"}** (${ticketUser?.user?.id})`,
        `Closed By: **${message.author.tag}** (${message.author.id})`,
        `Reason: \`${reason}\``,
      ].join("\n"))

    await logs.send({ embeds: [ embed ], files: [ new MessageAttachment(messages, `transcript.txt`) ] })
      
    message.delete().catch(err => err)
      
    if (ticket.data.type != "appeals") {
        message.channel.delete().catch(err => err)
    } 
      
    if (!processed_appeals) {
        message.channel.delete().catch(err => err)
        return;
    }
    
    else {
        
        // deleting all bot messages
        message.channel.messages.fetch().then(messages => {
            const messagesToDelete = messages.filter(msg => msg.author.id == '910250758639849533');
            	message.channel.bulkDelete(messagesToDelete);
        }).catch(err => {
            console.log('Error while doing Bulk Delete');
            console.log(err);
        });
        
        //moving to new category
        let categoryProc = message.guild.channels.cache.get("875647948061552710")
    	if (categoryProc && message.channel) message.channel.setParent(categoryProc.id, { lockPermissions: false }).catch(err => err);
		else console.error(`One of the channels is missing:\nCategory: ${!!categoryProc}\nChannel: ${!!message.channel}`);

        const embedProc = new MessageEmbed()
          .setTitle(`${ticketData.name} [ID: #${ticket.data.id}]`)
          .setDescription("Your ticket has been closed.")
          .setColor(colors.error)
          .setFooter(ticketOptions.footer, message.guild.iconURL())

        const rowProc = new MessageActionRow()
          .addComponents([
            new MessageButton()
              .setLabel("Delete")
              .setEmoji("⛔")
              .setStyle("DANGER")
              .setCustomID("delete")
          ])

        await message.channel.send({ content: ticketUser?.user?.toString(), embeds: [embedProc], components: [rowProc] })
        
    } 
  }
}