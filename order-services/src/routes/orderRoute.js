const express = require('express');
const { authGuard } = require('../middleware/authGuard');
const { adminGuard } = require('../middleware/adminGuard');
const {
  placeOrder,
  getMyOrders,
  getOrderById,
  updateOrderStatus,
  getAllOrders,
  cancelOrder,
} = require('../controllers/orderController');
const validate = require('../middleware/validate');
const { placeOrderSchema, updateStatusSchema } = require('../validator/orderValidator');

const router = express.Router();

router.post('/', authGuard, validate(placeOrderSchema), placeOrder);
router.get('/my', authGuard, getMyOrders);
router.get('/:id', authGuard, getOrderById);
router.patch('/:id/cancel', authGuard, cancelOrder);

// Admin only
router.get('/', authGuard, adminGuard, getAllOrders);
router.patch('/:id/status', authGuard, adminGuard, validate(updateStatusSchema), updateOrderStatus);

module.exports = router;