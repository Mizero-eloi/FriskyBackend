const config = require("config");

module.exports = () => {
  if (!config.get("jwtPrivateKey") || !config.get("serverPort")) {
    throw new Error("FATAL ERROR: some configurations are not yet defined !");
  }
};
