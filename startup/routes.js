require("express-async-errors");
const bodyParser = require("body-parser");
const express = require("express");
const error = require("../middleware/error");
const swaggerUi = require("swagger-ui-express");
const swaggerDoc = require("../documentation.json");
const swaggerJsDoc = require("swagger-jsdoc");

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
  apis: ["../routes/*.js"],
};

module.exports = (app) => {
  app.use(express.static("uploads"));
  app.use(express.static("ImageUploads"));
  app.use(bodyParser.json({ limit: "50mb" }));
  app.use(bodyParser.urlencoded({ extended: true, limit: "50mb" }));
  app.use(
    "/documentation",
    swaggerUi.serve,
    swaggerUi.setup(swaggerDoc, false, { docExpansion: "none" })
  );
  app.use("/signup", require("../routes/userRegistrationRoute"));
  app.use("/login", require("../routes/userLogInRoute"));
  app.use("/challenge", require("../routes/challengeRoute"));
  app.use("/userProfile", require("../routes/userProfile"));
  app.use("/users", require("../routes/userRoute"));
  app.use(error);
};
