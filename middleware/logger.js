const winston = require("winston");

const alignColorsAndTime = winston.format.combine(
  winston.format.colorize({
    all: true,
  }),
  winston.format.timestamp({
    format: "YY-MM-DD HH:MM:SS",
  })
  //   winston.format.printf(
  //     (info) =>
  //       ` ${info.label}  ${info.timestamp}  ${info.level} : ${info.message}`
  //   )
);

module.exports.logger = winston.createLogger({
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        alignColorsAndTime
      ),
    }),
    ,
    new winston.transports.File({ filename: "logfile.log" }),
  ],
});
