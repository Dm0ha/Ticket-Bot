const { Message, MessageEmbed, MessageAttachment } = require('discord.js');
const fs = require('fs');
const path = require('path');

const { colors } = require('../../config/config.json');

Message.prototype.error = function (description, image) {
  const embed = new MessageEmbed()
    .setDescription(description)
    .setColor(colors.error)

  if (image) {
    if (fs.existsSync(image)) {
      const attachment = new MessageAttachment(image, path.basename(image))
      embed.attachFiles([attachment])
      embed.setImage(`attachment://${path.basename(image)}`)
    } else {
      embed.setImage(image)
    }
  }

  this.reply({
    embeds: [embed],
    allowedMentions: { repliedUser: false }
  });
}

Message.prototype.post = async function (content, options) {
  if (typeof content === "string") return this.reply({ content: content, allowedMentions: { repliedUser: false } });

  if (typeof content === "object" && !content.pages && !Array.isArray(content)) {
    if (content.type) return this.reply({
      embeds: [content],
      allowedMentions: { repliedUser: false }
    })

    return this.reply({
      ...content,
      allowedMentions: { repliedUser: false }
    })
  }
}