const { z } = require('zod');

const createProductSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  price: z.number().positive('Price must be a positive number'),
  category: z.string().min(1, 'Category is required'),
  stock: z.number().int().nonnegative('Stock cannot be negative'),
});

const updateProductSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  price: z.number().positive().optional(),
  category: z.string().min(1).optional(),
  stock: z.number().int().nonnegative().optional(),
});

const updateStockSchema = z.object({
  quantity: z.number().int('Quantity must be an integer'),
});

module.exports = { createProductSchema, updateProductSchema, updateStockSchema };