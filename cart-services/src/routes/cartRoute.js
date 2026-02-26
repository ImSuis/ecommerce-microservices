const express = require('express');
const { authGuard } = require('../middleware/authGuard');
const {
  getCart,
  addToCart,
  updateQuantity,
  removeFromCart,
  clearCart,
} = require('../controllers/cartController');
const validate = require('../middleware/validate');
const { addToCartSchema, updateQuantitySchema } = require('../validators/cartValidator');

const router = express.Router();

router.get('/', authGuard, getCart);
router.post('/add', authGuard, validate(addToCartSchema), addToCart);
router.put('/update', authGuard, validate(updateQuantitySchema), updateQuantity);
router.delete('/item/:productId', authGuard, removeFromCart);
router.delete('/clear', authGuard, clearCart);

module.exports = router;