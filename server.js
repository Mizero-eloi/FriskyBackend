require("express-async-errors");
const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const config = require("config");
const startupDebugger = require("debug")("app:startup");
const dbDebugger = require("debug")("app:db");
const unCaughtExceptionDebugger = require("debug")(
  "app:unCaughtExceptionDebugger"
);
const unHandledRejectionDebugger = require("debug")(
  "app:unHandledRejectionDebugger"
);
const swaggerJsDoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");
const winston = require("winston");

const swaggerDoc = require("./documentation.json");
const error = require("./middleware/error");
const { logger } = require("./middleware/logger");
const app = express();

const swaggerOptions = {
  swaggerDefinition: {
    info: {
      title: "Frisky API",
      description: "Frisky1 all apis",
      contact: {
        name: "Frisky Developer",
      },
      servers: ["http://localhost:5000"],
      version: "1.0.1",
    },
  },
  apis: ["./routes/*.js"],
};

app.use(
  "/documentation",
  swaggerUi.serve,
  swaggerUi.setup(swaggerDoc, false, { docExpansion: "none" })
);

mongoose
  .connect(config.get("dbConnectionString"), {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => dbDebugger("MONGODB CONNECTED !!"))
  .catch((ex) => console.log("MONGODB CONNECTION FAILED ", ex));

app.use(express.static("uploads"));
app.use(express.static("ImageUploads"));
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ extended: true, limit: "50mb" }));
app.use("/signup", require("./routes/userRegistrationRoute"));
app.use("/login", require("./routes/userLogInRoute"));
app.use("/makeChallenge", require("./routes/challengeRoute"));
app.use("/userProfile", require("./routes/userProfile"));
app.use("/users", require("./routes/userRoute"));
app.use(error);

const port = process.env.PORT || config.get("serverPort");
app.listen(port, () => {
  startupDebugger(`listening at port ${port}`);
});
