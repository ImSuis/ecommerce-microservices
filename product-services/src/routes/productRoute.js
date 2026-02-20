const express = require('express');
const { authGuard } = require('../middleware/authGuard');
const { adminGuard } = require('../middleware/adminGuard');
const {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
} = require('../controllers/productController');

const router = express.Router();

// Public
router.get('/', getProducts);
router.get('/:id', getProductById);

// Admin only — authGuard first to decode the token, then adminGuard to check role
router.post('/', authGuard, adminGuard, createProduct);
router.put('/:id', authGuard, adminGuard, updateProduct);
router.delete('/:id', authGuard, adminGuard, deleteProduct);

module.exports = router;