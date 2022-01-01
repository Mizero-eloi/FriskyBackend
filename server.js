const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const startupDebugger = require("debug")("app:startup");
const dbDebugger = require("debug")("app:startup");
const app = express();

mongoose
  .connect("mongodb://localhost/Frisky", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => dbDebugger("MONGODB CONNECTED !!"))
  .catch((ex) => console.log("MONGODB CONNECTION FAILED ", ex));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use("/signup", require("./routes/userRegistrationRoute"));
app.use("/login", require("./routes/userLogInRoute"));

const port = process.env.PORT || 5000;
app.listen(port, () => {
  startupDebugger(`listening at port ${port}`);
});
