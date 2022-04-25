const mongoose = require("mongoose");
module.exports = function (id) {
  return function (req, res, next) {
    if (!mongoose.Types.ObjectId.isValid(req.params[id])) {
      const url = req.protocol + "://" + req.get("host") + req.originalUrl;
      return res.status(400).send("Invalid url " + url);
    }
    next();
  };
};
