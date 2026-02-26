const { z } = require('zod');

const addToCartSchema = z.object({
  productId: z.string().uuid('Invalid product ID'),
  name: z.string().min(1, 'Product name is required'),
  price: z.number().positive('Price must be a positive number'),
  quantity: z.number().int().positive('Quantity must be a positive integer').optional(),
});

const updateQuantitySchema = z.object({
  productId: z.string().uuid('Invalid product ID'),
  quantity: z.number().int('Quantity must be an integer'),
});

module.exports = { addToCartSchema, updateQuantitySchema };