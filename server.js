const express = require("express");
const config = require("config");
const startupDebugger = require("debug")("app:startup");

const app = express();
require("./startup/config")();
require("./startup/routes")(app);
require("./startup/db")();

const port = process.env.PORT || config.get("serverPort");
app.listen(port, () => {
  startupDebugger(`listening at port ${port}`);
});
