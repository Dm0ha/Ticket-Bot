const { MessageEmbed, MessageActionRow, MessageButton, MessageAttachment } = require('discord.js');

const Command = require('../../utils/structures/Command');

const TicketManager = require("../../utils/database/utils/TicketManager.js");
const { colors, processed_appeals } = require("../../config/config.json");
const { settings, ticketTypes, ticketOptions } = require("../../config/tickets.json");

module.exports = class extends Command {
  constructor() {
    super({
      name: "aa",
      aliases: ["aaf", "aar", "cda", "cd", "rd", "wd", "id", "cr", "ci", "gd"],
      description: "Verdict for tickets.",
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
      
	//verdict message
    const guild = message.guild
    const ticket = await TicketManager.get({ channelID: message.channel.id })
    if(ticket.data.type == "appeals") {
        
        if (!ticket.success) return;
        const member = await guild.members.fetch(ticket.data.userID).catch(err => err)
        
        var info = message.content.split(' ').slice(1).join(' ')
        if (typeof info === 'undefined' || info == '') {
            info = 'N/A'
        }

        var ticketInfo = ` If you have any more questions, please put them here.\nAdditional Info: *${info}*`
        var msgInfo = ""
        if (processed_appeals) {
        	msgInfo = ` If you have any more questions, please use <#${message.channel.id}>.\nAdditional Info: *${info}*`
    	} else {
            msgInfo = ` If you have any more questions, please message <@213878039107469313>.\nAdditional Info: *${info}*`
        }
        

        if (message.content.includes('-aa') && !(message.content.includes('-aaf')) && !(message.content.includes('-aar'))) {
            var msg = `Your appeal has been **accepted**.`
            var ver = 'aa'
            }
        else if (message.content.includes('-aaf')) {
            var msg = `Your appeal has been **accepted** and the ban has been marked as false.`
            var ver = 'aaf'
            }
        else if (message.content.includes('-aar')) {
            var msg = `Your appeal has been **accepted**. If you are caught with an inappropriate name or skin again, you will be permanently banned with no chance to appeal.`
            var ver = 'aar'
            }
        else if (message.content.includes('-cda')) {
            var msg = `Your appeal has been **denied**.` 
            msgInfo = ` This decision is final.\nAdditional Info: *Anticheat - Autoclicking*`
            var ver = 'cda'
            }
        else if (message.content.includes('-cd')) {
            var msg = `Your appeal has been **denied**.` 
            var ver = 'cd'
            }
        else if (message.content.includes('-rd')) {
            var msg = `Your appeal has been **denied**. Your account is your responsibility.` 
            var ver = 'rd'
            }
        else if (message.content.includes('-wd')) {
            var msg = `Your appeal has been **denied**.`
            ticketInfo = ` You must wait **${info}** more days before appealing. If you have any more questions, please put them here.`
            if (processed_appeals) {
            	msgInfo = ` You must wait **${info}** more days before appealing. If you have any more questions, please use <#${message.channel.id}>.`
            } else {
                msgInfo = ` You must wait **${info}** more days before appealing. If you have any more questions, please message <@213878039107469313>.`
            }
            var ver = 'wd'
            }
        else if (message.content.includes('-id')) {
            var msg = `Your appeal has been **denied**. Multiple accounts have cheated on your network, resulting in your IP being blacklisted.`
            var ver = 'id'
            }
        else if (message.content.includes('-gd')) {
            var msg = `Your appeal has been **denied**. We only accept guilty appeals for punishments over 30 days.`
            var ver = 'gd'
            }
        else if (message.content.includes('-cr')) {
            var msg = `Your appeal has been closed as your issue has been resolved.`
            var ver = 'cr'
            }
        else if (message.content.includes('-ci')) {
            var msg = `Your appeal has been closed and remains indeterminate. You are welcome to appeal again.` 
            var ver = 'ci'
            }
        
        if (member.kickable) {
            member.send(`Hey ${member},\n${msg}${msgInfo}`).catch(err => err)
        }

         // close the ticket
        const user = message.author
        const ticketUser = member
        
        const channelMessages = (await message.channel.messages.fetch()).array().reverse()
        const messages = Buffer.from(channelMessages.map(message => `${message.author.tag}: ${message.content}`).join('\n'), 'utf-8');

        const ticketData = ticketTypes.find(t => t.id == ticket.data.type)
        const logs = guild.channels.cache.get(ticketData.logs)
        await TicketManager.update(ticket.data.id, { active: false, staffID: user.id, closeReason: "Closed via button." })

        // removing appeal team perms and add manager, ignore how stupidly this is situated
        if(ticket.data.type == "appeals") {
            const id = member.id;
            if (id) {
                message.channel.permissionOverwrites.get('761412746750590987').delete().catch(err => err).catch(err => err)
                message.channel.updateOverwrite(id, {'SEND_MESSAGES': true, 'ATTACH_FILES': true}).catch(err => err)
            }
        } 

        const embed = new MessageEmbed()
          .setAuthor(`Ticket Closed [ID: #${ticket.data.id}]`)
          .setColor(colors.main)
          .setFooter(ticketOptions.footer, guild.iconURL())
          .setDescription([
            `Ticket Type: **${ticket.data.type}**`,
            `Opened By: **${ticketUser?.user?.tag || "N/A"}** (${ticket.data.userID})`,
            `Closed By: **${user.tag}** (${user.id})`,
            `Reason: \`Closed via button.\``,
          ].join("\n"))

        await logs.send({ embeds: [embed], files: [new MessageAttachment(messages, `transcript.txt`)] })



        if(ticket.data.type != "appeals") {
            message.channel.delete().catch(err => err)
        } 
        
        if (!processed_appeals) {
            message.channel.delete().catch(err => err)
            return;
    	} else {
            // deleting all bot messages
            message.channel.messages.fetch().then(messages => {
                const messagesToDelete = messages.filter(msg => msg.author.id == '910250758639849533');
                    message.channel.bulkDelete(messagesToDelete);
            }).catch(err => {
                console.log('Error while doing Bulk Delete');
                console.log(err);
            });

            //moving to new category
            let categoryProc = guild.channels.cache.get("875647948061552710")
            if (categoryProc && message.channel) message.channel.setParent(categoryProc.id, { lockPermissions: false }).catch(err => err);
            else console.error(`One of the channels is missing:\nCategory: ${!!categoryProc}\nChannel: ${!!message.channel}`);

            const embedProc = new MessageEmbed()
              .setTitle(`${ticketData.name} [ID: #${ticket.data.id}]`)
              .setDescription(msg + ticketInfo)
              .setColor(colors.error)
              .setFooter(ticketOptions.footer + ` (${message.author.id})`, guild.iconURL())

            const rowProc = new MessageActionRow()
              .addComponents([
                new MessageButton()
                  .setLabel("Delete")
                  .setEmoji("⛔")
                  .setStyle("DANGER")
                  .setCustomID("delete")
              ])

            await message.channel.send({ content: ticketUser?.user?.toString() + ` (${ver})`, embeds: [embedProc], components: [rowProc] })
            message.delete().catch(err => err)
        }
    }
  }
}