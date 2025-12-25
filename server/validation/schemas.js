import Joi from 'joi';

export const registerSchema = Joi.object({
  name: Joi.string().min(1).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
});

export const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

export const productCreateSchema = Joi.object({
  type: Joi.string().valid('original-artwork', 'merchandise').required(),
  title: Joi.string().min(1).required(),
  description: Joi.string().min(1).required(),
  price: Joi.number().min(0).required(),
  category: Joi.string().required(),
  stockQuantity: Joi.number().integer().min(0).optional(),
  imageUrl: Joi.string().uri().optional(),
});

export const productUpdateSchema = Joi.object({
  type: Joi.string().valid('original-artwork', 'merchandise').optional(),
  title: Joi.string().min(1).optional(),
  description: Joi.string().min(1).optional(),
  price: Joi.number().min(0).optional(),
  category: Joi.string().optional(),
  stockQuantity: Joi.number().integer().min(0).optional(),
  imageUrl: Joi.string().uri().optional(),
});

export const createIntentSchema = Joi.object({
  items: Joi.array().items(Joi.object({ productId: Joi.string().required(), quantity: Joi.number().integer().min(1).required() })).min(1).required(),
  shippingAddress: Joi.object({
    street: Joi.string().required(),
    city: Joi.string().required(),
    state: Joi.string().required(),
    zip: Joi.string().required(),
    country: Joi.string().required(),
  }).required(),
});
