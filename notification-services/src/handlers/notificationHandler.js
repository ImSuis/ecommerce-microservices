const transporter = require('../config/mailer');
const logger = require('../logger/logger');

const sendOrderPlacedEmail = async (data) => {
  const { email, orderId, items, total, street, city, country } = data;

  const itemRows = items.map(item =>
    `<tr>
      <td>${item.name}</td>
      <td>${item.quantity}</td>
      <td>$${item.price}</td>
    </tr>`
  ).join('');

  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: email,
    subject: 'Order Confirmed',
    html: `
      <h2>Thank you for your order!</h2>
      <p>Order ID: <strong>${orderId}</strong></p>
      <table border="1" cellpadding="8">
        <tr><th>Product</th><th>Quantity</th><th>Price</th></tr>
        ${itemRows}
      </table>
      <p><strong>Total: $${total}</strong></p>
      <h3>Delivery Address:</h3>
      <p>${street}, ${city}, ${country}</p>
    `,
  });

  logger.info(`Order placed email sent to ${email} for order ${orderId}`);
};

const sendOrderStatusEmail = async (data) => {
  const { email, orderId, status } = data;

  const statusMessages = {
    CONFIRMED: 'Your order has been confirmed and is being prepared.',
    SHIPPED: 'Your order has been shipped and is on its way.',
    DELIVERED: 'Your order has been delivered. Enjoy!',
    CANCELLED: 'Your order has been cancelled.',
  };

  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: email,
    subject: `Order ${status}`,
    html: `
      <h2>Order Update</h2>
      <p>Order ID: <strong>${orderId}</strong></p>
      <p>${statusMessages[status]}</p>
    `,
  });

  logger.info(`Order ${status} email sent to ${email} for order ${orderId}`);
};

module.exports = { sendOrderPlacedEmail, sendOrderStatusEmail };