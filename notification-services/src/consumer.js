const { connectRabbitMQ } = require('./config/rabbitmq');
const { sendOrderPlacedEmail, sendOrderStatusEmail } = require('./handlers/notificationHandler');
const logger = require('./logger/logger');

const QUEUES = {
  ORDER_PLACED: 'order.placed',
  ORDER_STATUS_UPDATED: 'order.status.updated',
};

const startConsumer = async () => {
  let channel;

  // Retry until RabbitMQ is ready
  while (!channel) {
    try {
      channel = await connectRabbitMQ();
    } catch (error) {
      logger.error(`Waiting for RabbitMQ... retrying in 5s`);
      await new Promise((resolve) => setTimeout(resolve, 5000));
    }
  }

  // Assert queues so they exist before consuming
  await channel.assertQueue(QUEUES.ORDER_PLACED, { durable: true });
  await channel.assertQueue(QUEUES.ORDER_STATUS_UPDATED, { durable: true });

  // Consume order placed events
  channel.consume(QUEUES.ORDER_PLACED, async (msg) => {
    if (msg) {
      try {
        const data = JSON.parse(msg.content.toString());
        logger.info(`Received order.placed event for order: ${data.orderId}`);
        await sendOrderPlacedEmail(data);
        channel.ack(msg);
      } catch (error) {
        logger.error(`Error processing order.placed: ${error.message}`);
        channel.nack(msg);
      }
    }
  });

  // Consume order status updated events
  channel.consume(QUEUES.ORDER_STATUS_UPDATED, async (msg) => {
    if (msg) {
      try {
        const data = JSON.parse(msg.content.toString());
        logger.info(`Received order.status.updated event for order: ${data.orderId}`);
        await sendOrderStatusEmail(data);
        channel.ack(msg);
      } catch (error) {
        logger.error(`Error processing order.status.updated: ${error.message}`);
        channel.nack(msg);
      }
    }
  });

  logger.info('Notification service is listening for events');
};

module.exports = { startConsumer };