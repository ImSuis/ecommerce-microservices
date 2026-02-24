const amqp = require('amqplib');
const logger = require('../logger/logger');

const connectRabbitMQ = async () => {
  while (true) {
    try {
      const connection = await amqp.connect(
        process.env.RABBITMQ_URL || 'amqp://guest:guest@localhost:5672'
      );
      const channel = await connection.createChannel();
      logger.info('Connected to RabbitMQ');
      return channel;
    } catch (error) {
      logger.error(`RabbitMQ connection error: ${error.message}`);
      logger.info('Retrying in 5 seconds...');
      await new Promise((resolve) => setTimeout(resolve, 5000));
    }
  }
};

module.exports = { connectRabbitMQ };