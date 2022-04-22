const winston = require("winston");
const { logger } = require("../middleware/logger");

module.exports = function (err, req, res, next) {
  //   winston.error(err.message, err);
  logger.error(err.message, err);

  // error
  // warn
  // info
  // verbose
  // debug
  // silly

  res.status(500).send("Something  went wrong!");
};
