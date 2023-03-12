const { MessageEmbed, MessageActionRow, MessageButton, MessageAttachment } = require("discord.js");

const TicketManager = require("../../utils/database/utils/TicketManager.js");
const { colors, processed_appeals } = require("../../config/config.json");
const { settings, ticketTypes, ticketOptions } = require("../../config/tickets.json");

module.exports = async (bot, interaction) => {
  const { message, guild, user } = interaction;

  /*if (["gd", "rd", "cd"].includes(interaction.customID)) {
    const ticket = await TicketManager.get({ channelID: message.channel.id })
    if (user.id == ticket.data.userID) return interaction.deferUpdate();

    const ticketUser = guild.members.cache.get(ticket.data.userID)
    message.channel.send(`/${interaction.customID} ${ticketUser.toString()}`)
  }
  */

  if (interaction.customID == "close") {
    const ticket = await TicketManager.get({ channelID: message.channel.id })
    if (!ticket.success) {
      try {
        return interaction.deferUpdate();
      } catch (error) {
        console.error(error)
        console.log('\n\nerror 1')
        return null
      }
    }
      

    const member = message.guild.members.cache.get(user.id)
    // if (!member.roles.cache.some(r => [
    //   "703935706958921809", // admin
    //   "734746688270368849", // manager
    //   "738198908630728756", // srmod
    //   "703935754388373514", // mod
    //   "798749786844692480" // trainee
    // ].includes(r.id))) {
    //   try {
    //     return interaction.deferUpdate();
    //   } catch (error) {
    //     console.error(error)
    //     console.log('\n\nerror 2')
    //     return null
    //   }
    // }

    const channelMessages = (await message.channel.messages.fetch()).array().reverse()
    const messages = Buffer.from(channelMessages.map(message => `${message.author.tag}: ${message.content}`).join('\n'), 'utf-8');

    const ticketData = ticketTypes.find(t => t.id == ticket.data.type)
    const logs = guild.channels.cache.get(ticketData.logs)
    await TicketManager.update(ticket.data.id, { active: false, staffID: user.id, closeReason: "Closed via button." })

    const ticketUser = await guild.members.fetch(ticket.data.userID).catch(err => err)
    
    // removing appeal team perms and add manager, ignore how stupidly this is situated
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
      .setFooter(ticketOptions.footer, guild.iconURL())
      .setDescription([
        `Ticket Type: **${ticket.data.type}**`,
        `Opened By: **${ticketUser?.user?.tag || "N/A"}** (${ticketUser?.user?.id})`,
        `Closed By: **${user.tag}** (${user.id})`,
        `Reason: \`Closed via button.\``,
      ].join("\n"))

    await logs.send({ embeds: [embed], files: [new MessageAttachment(messages, `transcript.txt`)] })
 
      
      
    if(ticket.data.type != "appeals" || !processed_appeals) {
        message.channel.delete().catch(err => err)
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
        let categoryProc = guild.channels.cache.get("875647948061552710")
    	if (categoryProc && message.channel) message.channel.setParent(categoryProc.id, { lockPermissions: false }).catch(err => err);
		else console.error(`One of the channels is missing:\nCategory: ${!!categoryProc}\nChannel: ${!!message.channel}`);

        const embedProc = new MessageEmbed()
          .setTitle(`${ticketData.name} [ID: #${ticket.data.id}]`)
          .setDescription("Your ticket has been closed.")
          .setColor(colors.error)
          .setFooter(ticketOptions.footer, guild.iconURL())

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
  
  else if (interaction.customID == "delete") {
      message.channel.delete().catch(err => err)
  }
      
  const ticketData = ticketTypes.find(o => o.id == interaction.customID)
  if (ticketData) {
    const alreadyTicket = await TicketManager.get({ active: true, userID: user.id, type: ticketData.id })
    
    if (alreadyTicket.success) {
      const ticket = await TicketManager.get({ active: true, userID: user.id, type: ticketData.id })
      const channel = guild.channels.cache.get(ticket.data.channelID)
      await channel?.send({ content: `You already have a ticket open ${user.toString()}! Please resolve this ticket before creating a new one.` }).catch(err => err)
      try {
        return interaction.deferUpdate();
      } catch (error) {
        console.error(error)
        console.log('\n\nerror 3')
        return null
      }
    }

    const overwrites = [
      { id: guild.id, deny: ["VIEW_CHANNEL", "MENTION_EVERYONE"] },
      { id: "910250758639849533", allow: ["VIEW_CHANNEL", "MANAGE_CHANNELS"] },
      { id: "734746688270368849", allow: ["VIEW_CHANNEL", "MANAGE_CHANNELS"] },
      { id: user.id, allow: ["VIEW_CHANNEL", "SEND_MESSAGES", "ATTACH_FILES"] },
      ...(ticketData.access || []).map(a => ({ id: a, allow: ["VIEW_CHANNEL"] }))
    ]

    const ticket = await TicketManager.create(user, ticketData.id)
    var channel;
    try {
      channel = await guild.channels.create(`${ticketData.id}-${ticket.data.id}`, { type: "text", parent: ticketData.parent, permissionOverwrites: overwrites })
    } catch {
      channel = await guild.channels.create(`${ticketData.id}-${ticket.data.id}`, { type: "text", parent: ticketData.backupParent, permissionOverwrites: overwrites })
    }
    await TicketManager.update(ticket.data.id, { channelID: channel.id })
      
    const embed = new MessageEmbed()
      .setTitle(`${ticketData.name} [ID: #${ticket.data.id}]`)
      .setDescription(ticketData.description.join("\n"))
      .setColor(colors.success)
      .setFooter(ticketOptions.footer, guild.iconURL())

    const row = new MessageActionRow()
      .addComponents([
        new MessageButton()
          .setLabel("Close")
          .setEmoji("🔒")
          .setStyle("DANGER")
          .setCustomID("close")
      ])

    /*new MessageButton()
      .setLabel("/gd")
      .setEmoji("🐒")
      .setStyle("SECONDARY")
      .setCustomID("gd"),
    new MessageButton()
      .setLabel("/rd")
      .setEmoji("🙇")
      .setStyle("SECONDARY")
      .setCustomID("rd"),
    new MessageButton()
      .setLabel("/cd")
      .setEmoji("🏹")
      .setStyle("SECONDARY")
      .setCustomID("cd")
    */

    await channel.send({ content: user.toString(), embeds: [embed], components: [row] })
  }
  try {
    return interaction.deferUpdate();
  } catch (error) {
    console.error(error)
    console.log('\n\nerror 4')
    return null
  }
}