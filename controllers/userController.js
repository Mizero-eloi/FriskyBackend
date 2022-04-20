const { User } = require("../models/User");
const { getAllDocuments } = require("../services/queries");

// Get all users
module.exports.getAllUsers = async (req, res) => {
  await getAllDocuments({
    Collection: User,
    fields: { password: 0 },
    res: res,
  });
};
