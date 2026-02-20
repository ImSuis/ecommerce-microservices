const redis = require('../config/redis');
const logger = require('../logger/logger');

const CART_EXPIRY = 60 * 60 * 24 * 7; // 7 days in seconds

const getCart = async (req, res) => {
  try {
    const data = await redis.get(`cart:${req.user.id}`);
    const cart = data ? JSON.parse(data) : { items: [] };

    logger.info(`Cart fetched for user: ${req.user.id}`);
    res.json({ success: true, data: cart });
  } catch (error) {
    logger.error(`getCart error: ${error.message}`);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const addToCart = async (req, res) => {
  const { productId, name, price, quantity = 1 } = req.body;

  if (!productId || !name || !price) {
    return res.status(400).json({ success: false, message: 'productId, name and price are required' });
  }

  try {
    const data = await redis.get(`cart:${req.user.id}`);
    const cart = data ? JSON.parse(data) : { items: [] };

    // If item already exists, increment quantity
    const existingItem = cart.items.find((item) => item.productId === productId);
    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cart.items.push({ productId, name, price, quantity });
    }

    // Save back to Redis with expiry
    await redis.set(`cart:${req.user.id}`, JSON.stringify(cart), 'EX', CART_EXPIRY);

    logger.info(`Item added to cart for user: ${req.user.id}, productId: ${productId}`);
    res.json({ success: true, data: cart });
  } catch (error) {
    logger.error(`addToCart error: ${error.message}`);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const updateQuantity = async (req, res) => {
  const { productId, quantity } = req.body;

  if (!productId || quantity === undefined) {
    return res.status(400).json({ success: false, message: 'productId and quantity are required' });
  }

  try {
    const data = await redis.get(`cart:${req.user.id}`);
    if (!data) {
      return res.status(404).json({ success: false, message: 'Cart not found' });
    }

    const cart = JSON.parse(data);
    const item = cart.items.find((item) => item.productId === productId);

    if (!item) {
      return res.status(404).json({ success: false, message: 'Item not found in cart' });
    }

    if (quantity <= 0) {
      // Remove item if quantity is 0 or less
      cart.items = cart.items.filter((item) => item.productId !== productId);
    } else {
      item.quantity = quantity;
    }

    await redis.set(`cart:${req.user.id}`, JSON.stringify(cart), 'EX', CART_EXPIRY);

    logger.info(`Cart updated for user: ${req.user.id}, productId: ${productId}, quantity: ${quantity}`);
    res.json({ success: true, data: cart });
  } catch (error) {
    logger.error(`updateQuantity error: ${error.message}`);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const removeFromCart = async (req, res) => {
  const { productId } = req.params;

  try {
    const data = await redis.get(`cart:${req.user.id}`);
    if (!data) {
      return res.status(404).json({ success: false, message: 'Cart not found' });
    }

    const cart = JSON.parse(data);

    // Check if item actually exists before removing
    const itemExists = cart.items.some((item) => item.productId === productId);
    if (!itemExists) {
      return res.status(404).json({ success: false, message: 'Item not found in cart' });
    }

    cart.items = cart.items.filter((item) => item.productId !== productId);
    await redis.set(`cart:${req.user.id}`, JSON.stringify(cart), 'EX', CART_EXPIRY);

    logger.info(`Item removed from cart for user: ${req.user.id}, productId: ${productId}`);
    res.json({ success: true, data: cart });
  } catch (error) {
    logger.error(`removeFromCart error: ${error.message}`);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const clearCart = async (req, res) => {
  try {
    await redis.del(`cart:${req.user.id}`);

    logger.info(`Cart cleared for user: ${req.user.id}`);
    res.json({ success: true, message: 'Cart cleared' });
  } catch (error) {
    logger.error(`clearCart error: ${error.message}`);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = { getCart, addToCart, updateQuantity, removeFromCart, clearCart };