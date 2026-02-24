const axios = require('axios');
const prisma = require('../prismaClient');
const logger = require('../logger/logger');

const PRODUCT_SERVICE_URL = process.env.PRODUCT_SERVICE_URL || 'http://localhost:4003';
const CART_SERVICE_URL = process.env.CART_SERVICE_URL || 'http://localhost:4004';
const USER_SERVICE_URL = process.env.USER_SERVICE_URL || 'http://localhost:4002';

const placeOrder = async (req, res) => {
  const userId = req.user.id;
  const token = req.headers.authorization;
  const { addressId } = req.body;

  // Validate addressId is provided
  if (!addressId) {
    return res.status(400).json({ success: false, message: 'Delivery address is required' });
  }

  try {
    // 1. Fetch cart from cart service
    const cartResponse = await axios.get(`${CART_SERVICE_URL}/api/cart`, {
      headers: { Authorization: token },
    });

    const cart = cartResponse.data.data;

    if (!cart.items || cart.items.length === 0) {
      return res.status(400).json({ success: false, message: 'Cart is empty' });
    }

    // 2. Fetch user profile and validate address belongs to user
    const profileResponse = await axios.get(`${USER_SERVICE_URL}/api/users/profile`, {
      headers: { Authorization: token },
    });

    const profile = profileResponse.data.data;
    const address = profile.addresses.find((a) => a.id === addressId);

    if (!address) {
      return res.status(400).json({ success: false, message: 'Invalid delivery address' });
    }

    // 3. Check stock for each item
    for (const item of cart.items) {
      const productResponse = await axios.get(
        `${PRODUCT_SERVICE_URL}/api/products/${item.productId}`
      );
      const product = productResponse.data.data;

      if (product.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${item.name}`,
        });
      }
    }

    // 4. Calculate total
    const total = cart.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    // 5. Create order with snapshotted address
    const order = await prisma.order.create({
      data: {
        userId,
        total,
        street: address.street,
        city: address.city,
        country: address.country,
        items: {
          create: cart.items.map((item) => ({
            productId: item.productId,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
          })),
        },
      },
      include: { items: true },
    });

    // 6. Decrement stock in product service
    for (const item of cart.items) {
      await axios.patch(
        `${PRODUCT_SERVICE_URL}/api/products/${item.productId}/stock`,
        { quantity: -item.quantity },
        { headers: { 'x-internal-secret': process.env.INTERNAL_SECRET } }
      );
    }

    // 7. Clear cart
    await axios.delete(`${CART_SERVICE_URL}/api/cart/clear`, {
      headers: { Authorization: token },
    });

    logger.info(`Order placed: ${order.id} by user: ${userId}`);
    res.status(201).json({ success: true, data: order });
  } catch (error) {
    logger.error(`placeOrder error: ${error.message}`);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// GET MY ORDERS
const getMyOrders = async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      where: { userId: req.user.id },
      include: { items: true },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ success: true, data: orders });
  } catch (error) {
    logger.error(`getMyOrders error: ${error.message}`);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// GET ORDER BY ID
const getOrderById = async (req, res) => {
  try {
    const order = await prisma.order.findUnique({
      where: { id: req.params.id },
      include: { items: true },
    });

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Users can only see their own orders
    if (order.userId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }

    res.json({ success: true, data: order });
  } catch (error) {
    logger.error(`getOrderById error: ${error.message}`);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// UPDATE ORDER STATUS — admin only
const updateOrderStatus = async (req, res) => {
  const { status } = req.body;

  // Define valid transitions
  const validTransitions = {
    PENDING: ['CONFIRMED', 'CANCELLED'],
    CONFIRMED: ['SHIPPED', 'CANCELLED'],
    SHIPPED: ['DELIVERED'],
    DELIVERED: [],
    CANCELLED: [],
  };

  try {
    const order = await prisma.order.findUnique({
      where: { id: req.params.id },
      include: { items: true },
    });

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Check if transition is valid
    const allowed = validTransitions[order.status];
    if (!allowed.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot transition from ${order.status} to ${status}`,
      });
    }

    // Restore stock if cancelling
    if (status === 'CANCELLED') {
      for (const item of order.items) {
        await axios.patch(
          `${PRODUCT_SERVICE_URL}/api/products/${item.productId}/stock`,
          { quantity: item.quantity },
          { headers: { 'x-internal-secret': process.env.INTERNAL_SECRET } }
        );
      }
      logger.info(`Stock restored for cancelled order: ${order.id}`);
    }

    const updated = await prisma.order.update({
      where: { id: req.params.id },
      data: { status },
      include: { items: true },
    });

    logger.info(`Order ${req.params.id} status updated to ${status} by admin ${req.user.id}`);
    res.json({ success: true, data: updated });
  } catch (error) {
    logger.error(`updateOrderStatus error: ${error.message}`);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// GET ALL ORDERS — admin only
const getAllOrders = async (req, res) => {
  const { page = 1, limit = 10, status } = req.query;

  const where = {
    ...(status && { status }),
  };

  try {
    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: { items: true },
        orderBy: { createdAt: 'desc' },
        skip: (parseInt(page) - 1) * parseInt(limit),
        take: parseInt(limit),
      }),
      prisma.order.count({ where }),
    ]);

    res.json({
      success: true,
      data: orders,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    logger.error(`getAllOrders error: ${error.message}`);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const cancelOrder = async (req, res) => {
  try {
    const order = await prisma.order.findUnique({
      where: { id: req.params.id },
      include: { items: true },
    });

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (order.userId !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }

    if (order.status !== 'PENDING') {
      return res.status(400).json({
        success: false,
        message: 'Order can only be cancelled while pending. Please contact support.',
      });
    }

    // Restore stock
    for (const item of order.items) {
      await axios.patch(
        `${PRODUCT_SERVICE_URL}/api/products/${item.productId}/stock`,
        { quantity: item.quantity },
        { headers: { 'x-internal-secret': process.env.INTERNAL_SECRET } }
      );
    }

    const updated = await prisma.order.update({
      where: { id: req.params.id },
      data: { status: 'CANCELLED' },
      include: { items: true },
    });

    logger.info(`Order ${order.id} cancelled by user ${req.user.id}`);
    res.json({ success: true, data: updated });
  } catch (error) {
    logger.error(`cancelOrder error: ${error.message}`);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = {
  placeOrder,
  getMyOrders,
  getOrderById,
  updateOrderStatus,
  getAllOrders,
  cancelOrder
};