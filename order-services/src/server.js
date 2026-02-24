const dotenv = require('dotenv');
dotenv.config();
const app = require('./app');
const { connectRabbitMQ } = require('./config/rabbitmq');
const logger = require('./logger/logger');

const PORT = process.env.PORT || 4005;

const start = async () => {
  await connectRabbitMQ();
  app.listen(PORT, () => {
    logger.info(`Order Service running on port ${PORT}`);
  });
};

start();