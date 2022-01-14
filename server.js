const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const config = require("config");
const auth = require("./middleware/auth");
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

app.use(express.static("uploads"));
app.use(express.static("ImageUploads"));
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));
app.use("/signup", require("./routes/userRegistrationRoute"));
app.use("/login", require("./routes/userLogInRoute"));

// Apis that requires authetication

app.use(auth);
app.use("/makeChallenge", require("./routes/challengeRoute"));
app.use("/userProfile", require("./routes/userProfile"));

const port = process.env.PORT || config.get("serverPort");
app.listen(port, () => {
  startupDebugger(`listening at port ${port}`);
});
