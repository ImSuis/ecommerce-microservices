const express = require('express');
const { authGuard } = require('../middleware/authGuard');
const { adminGuard } = require('../middleware/adminGuard');
const { internalGuard } = require('../middleware/internalGuard');
const {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  updateStock,
} = require('../controllers/productController');

const router = express.Router();

// Public
router.get('/', getProducts);
router.get('/:id', getProductById);

// Internal — called by order service only
router.patch('/:id/stock', internalGuard, updateStock);

// Admin only
router.post('/', authGuard, adminGuard, createProduct);
router.put('/:id', authGuard, adminGuard, updateProduct);
router.delete('/:id', authGuard, adminGuard, deleteProduct);

module.exports = router;