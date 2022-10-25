const { developers, prefix } = require("../../config/config.json");

module.exports = async (bot, message) => {
  if (message.channel.type !== 'text' || message.author.bot) return;
  if (!message.content.toLowerCase().startsWith(prefix.toLowerCase())) return;

  const args = message.content.slice(prefix.length).split(/ +/);
  const commandName = args.shift().toLocaleLowerCase();
  const command = bot.commands.get(commandName) || bot.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));
    
  if (!command) {
    if ((message.content.toLowerCase().startsWith("-accept") || message.content.toLowerCase().startsWith("-deny")) && message.mentions.members.size > 0) {
      const staffProfile = await bot.db.staff.findOne({ where: { discordID: message.author.id } })
      if (!staffProfile) return;

      return staffProfile.increment("reports")
    }
    return;
  };
  if (command?.access.length && !message.member.roles.cache.some(r => command.access.includes(r.id)) && !developers.includes(message.author.id)) {
    return message.error(`This command is restricted from your current role.`)
  }
  if (command?.devOnly && !developers.includes(message.author.id)) {
    return message.error(`This command requires you to be the bot developer.`);
  }

  await command.run(message, args, bot).catch(err => console.log(err));
  console.log(`[CMD] (#${message.channel.name}) ${message.author.tag}: ${message.content}`)
}