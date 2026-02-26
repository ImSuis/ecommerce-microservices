const { z } = require('zod');

const placeOrderSchema = z.object({
  addressId: z.string().uuid('Invalid address ID'),
});

const updateStatusSchema = z.object({
  status: z.enum(
    ['PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED'],
    { message: 'Invalid order status' }
  ),
});

module.exports = { placeOrderSchema, updateStatusSchema };