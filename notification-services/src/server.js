const dotenv = require('dotenv');
dotenv.config();
const { startConsumer } = require('./consumer');
const logger = require('./logger/logger');

startConsumer().catch((error) => {
  logger.error(`Failed to start consumer: ${error.message}`);
  process.exit(1);
});

logger.info('Notification service started');