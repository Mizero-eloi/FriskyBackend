const mongoose = require("mongoose");
module.exports = function (req, res, next) {
  // Making the req.file required
  if (!req.file) {
    console.log("The file being sent: " + req.file);
    return res.status(400).send("challengeVideo is required !");
  } else {
    next();
  }
};
