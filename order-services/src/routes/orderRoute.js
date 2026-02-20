const express = require('express');
const { authGuard } = require('../middleware/authGuard');
const { adminGuard } = require('../middleware/adminGuard');
const {
  placeOrder,
  getMyOrders,
  getOrderById,
  updateOrderStatus,
  getAllOrders,
} = require('../controllers/orderController');

const router = express.Router();

router.post('/', authGuard, placeOrder);
router.get('/my', authGuard, getMyOrders);
router.get('/:id', authGuard, getOrderById);

// Admin only
router.get('/', authGuard, adminGuard, getAllOrders);
router.patch('/:id/status', authGuard, adminGuard, updateOrderStatus);

module.exports = router;