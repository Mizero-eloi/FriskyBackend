const mongoose = require("mongoose");
const dbDebugger = require("debug")("app:db");
const config = require("config");
module.exports = () => {
  mongoose
    .connect(config.get("dbConnectionString"), {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then(() => dbDebugger("MONGODB CONNECTED !!"));
};
