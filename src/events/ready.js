const { tickets } = require("../../utils/database/models/tickets.js");
const { staff } = require("../../utils/database/models/staff.js");

module.exports = async (bot) => {
  console.log("Successfully launched.")

  bot.user.setActivity(`bedwarspractice.club`, { type: "PLAYING" })
  tickets.sync()
  staff.sync()

  bot.db = {
    tickets: tickets,
    staff: staff
  }
}