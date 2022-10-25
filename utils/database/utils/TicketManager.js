const { tickets } = require("../models/tickets.js");

module.exports = {
  get: async (query = {}) => {
    return new Promise(async resolve => {
      const ticket = await tickets.findOne({ where: query })
      if (!ticket) resolve({ success: false })

      resolve({ success: true, data: ticket })
    })
  },

  create: async (user, type) => { 
    try {
      const creation = await tickets.create({ active: true, userID: user.id, type: type })
      return { success: true, data: creation }
    } catch(e) {
      return { success: false, exception: e }
    }
  },

  update: async (id, query = {}) => {
    try {
      const updated = await tickets.update(query, { where: { id: id } })
      return { success: true, data: updated }
    } catch (e) {
      return { success: false, exception: e }
    }
  }
}