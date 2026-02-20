const { createLogger, format, transports } = require('winston');

const logger = createLogger({
  level: 'info',
  format: format.combine(format.timestamp(), format.json()),
  transports: [
    new transports.Console(),
    new transports.File({ filename: 'product-error.log', level: 'error' }),
    new transports.File({ filename: 'product-combined.log' }),
  ],
});

module.exports = logger;
