const Sequelize = require("sequelize");

const { database } = require("../sql.js");

const tickets = database.define('tickets', {
  id: { type: Sequelize.INTEGER, autoIncrement: true, unique: true, primaryKey: true },
  channelID: { type: Sequelize.STRING, allowNull: true },
  userID: { type: Sequelize.STRING },
  type: { type: Sequelize.STRING },
  active: { type: Sequelize.BOOLEAN },
  staffID: { type: Sequelize.STRING, allowNull: true },
  closeReason: { type: Sequelize.TEXT, allowNull: true }
})

module.exports = {
  tickets
};