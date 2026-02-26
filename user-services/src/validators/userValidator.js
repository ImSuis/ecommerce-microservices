const { z } = require('zod');

const upsertProfileSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  phone: z.string().length(10, 'Phone number must be exactly 10 digits'),});

const addAddressSchema = z.object({
  city: z.string().min(1, 'City is required'),
  country: z.string().min(1, 'Country is required'),
});

module.exports = { upsertProfileSchema, addAddressSchema };