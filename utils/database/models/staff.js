const Sequelize = require("sequelize");

const { staffDatabase } = require("../sql.js");

const staff = staffDatabase.define('staff', {
  uuid: { type: Sequelize.STRING },
  bans: Sequelize.INTEGER,
  mutes: Sequelize.INTEGER,
  warns: Sequelize.INTEGER,
  discordID: Sequelize.STRING,
  loginTracker: { type: Sequelize.BOOLEAN, defaultValue: true },
  reports: { type: Sequelize.INTEGER, defaultValue: 0 },
  screenshares: { type: Sequelize.INTEGER, defaultValue: 0 }
})

module.exports = {
  staff
};