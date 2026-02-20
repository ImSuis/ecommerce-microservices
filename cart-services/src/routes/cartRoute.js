const express = require('express');
const { authGuard } = require('../middleware/authGuard');
const {
  getCart,
  addToCart,
  updateQuantity,
  removeFromCart,
  clearCart,
} = require('../controllers/cartController');

const router = express.Router();

router.get('/', authGuard, getCart);
router.post('/add', authGuard, addToCart);
router.put('/update', authGuard, updateQuantity);
router.delete('/item/:productId', authGuard, removeFromCart);
router.delete('/clear', authGuard, clearCart);

module.exports = router;