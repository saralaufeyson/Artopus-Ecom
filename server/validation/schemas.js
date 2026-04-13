import Joi from 'joi';

export const registerSchema = Joi.object({
  name: Joi.string().min(1).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  phone: Joi.string().allow('', null).optional(),
  whatsappNumber: Joi.string().allow('', null).optional(),
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
  imageUrl: Joi.string().uri().allow('').optional(),
  artistId: Joi.string().optional(),
  artistUserId: Joi.string().optional(),
  artistName: Joi.string().optional(),
  artistEmail: Joi.string().email().optional(),
  medium: Joi.string().allow('', null).optional(),
  dimensions: Joi.string().allow('', null).optional(),
  year: Joi.string().allow('', null).optional(),
  videoUrl: Joi.string().uri().allow('', null).optional(),
  outlineSketchPrice: Joi.number().min(0).optional(),
  coloringPrice: Joi.number().min(0).optional(),
  approvalStatus: Joi.string().valid('draft', 'pending', 'approved', 'rejected').optional(),
});

export const productUpdateSchema = Joi.object({
  type: Joi.string().valid('original-artwork', 'merchandise').optional(),
  title: Joi.string().min(1).optional(),
  description: Joi.string().min(1).optional(),
  price: Joi.number().min(0).optional(),
  category: Joi.string().optional(),
  stockQuantity: Joi.number().integer().min(0).optional(),
  imageUrl: Joi.string().uri().allow('').optional(),
  artistId: Joi.string().optional(),
  artistUserId: Joi.string().optional(),
  artistName: Joi.string().optional(),
  artistEmail: Joi.string().email().optional(),
  medium: Joi.string().allow('', null).optional(),
  dimensions: Joi.string().allow('', null).optional(),
  year: Joi.string().allow('', null).optional(),
  videoUrl: Joi.string().uri().allow('', null).optional(),
  outlineSketchPrice: Joi.number().min(0).optional(),
  coloringPrice: Joi.number().min(0).optional(),
  approvalStatus: Joi.string().valid('draft', 'pending', 'approved', 'rejected').optional(),
});

export const artistSchema = Joi.object({
  artistName: Joi.string().required(),
  penName: Joi.string().allow('', null).optional(),
  email: Joi.string().email().required(),
  bio: Joi.string().allow('', null).optional(),
  profileImage: Joi.string().uri().allow('', null).optional(),
  socialLinks: Joi.object({
    website: Joi.string().uri().allow('', null).optional(),
    instagram: Joi.string().uri().allow('', null).optional(),
    twitter: Joi.string().uri().allow('', null).optional(),
    facebook: Joi.string().uri().allow('', null).optional(),
  }).optional(),
});

export const createIntentSchema = Joi.object({
  items: Joi.array().items(Joi.object({
    productId: Joi.string().required(),
    quantity: Joi.number().integer().min(1).required(),
    buyerOption: Joi.string().valid('painting', 'outline-sketch', 'colored-version').optional(),
  })).min(1).required(),
  shippingAddress: Joi.object({
    street: Joi.string().required(),
    city: Joi.string().required(),
    state: Joi.string().required(),
    zip: Joi.string().required(),
    country: Joi.string().required(),
  }).required(),
});

export const reviewSchema = Joi.object({
  productId: Joi.string().required(),
  orderId: Joi.string().required(),
  rating: Joi.number().integer().min(1).max(5).required(),
  title: Joi.string().allow('', null).optional(),
  comment: Joi.string().allow('', null).max(1000).optional(),
});

export const artistActivationSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  name: Joi.string().min(1).required(),
  phone: Joi.string().allow('', null).optional(),
  whatsappNumber: Joi.string().allow('', null).optional(),
});

export const artistProductSchema = Joi.object({
  title: Joi.string().min(1).required(),
  description: Joi.string().min(1).required(),
  price: Joi.number().min(0).required(),
  category: Joi.string().required(),
  type: Joi.string().valid('original-artwork', 'merchandise').required(),
  stockQuantity: Joi.number().integer().min(0).optional(),
  imageUrl: Joi.string().uri().allow('').optional(),
  medium: Joi.string().allow('', null).optional(),
  dimensions: Joi.string().allow('', null).optional(),
  year: Joi.string().allow('', null).optional(),
  videoUrl: Joi.string().uri().required(),
  outlineSketchPrice: Joi.number().min(0).optional(),
  coloringPrice: Joi.number().min(0).optional(),
});

export const walletWithdrawalSchema = Joi.object({
  amount: Joi.number().positive().required(),
  note: Joi.string().allow('', null).optional(),
});

export const collectionSchema = Joi.object({
  name: Joi.string().min(1).max(60).required(),
});

export const collectionItemSchema = Joi.object({
  productId: Joi.string().required(),
});

export const payoutDecisionSchema = Joi.object({
  note: Joi.string().allow('', null).optional(),
});
