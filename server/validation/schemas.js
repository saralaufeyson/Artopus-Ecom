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

export const verifyEmailSchema = Joi.object({
  email: Joi.string().email().required(),
  otp: Joi.string().length(6).pattern(/^\d+$/).required(),
});

export const resendVerificationSchema = Joi.object({
  email: Joi.string().email().required(),
});

const variantValidationSchema = Joi.object({
  category: Joi.string().valid('Original', 'Print on Demand').required(),
  size: Joi.string().allow('', null).optional(),
  price: Joi.number().min(0).allow(null, '').optional(),
  dimensions: Joi.string().allow('', null).optional(),
  stockQuantity: Joi.number().integer().min(0).optional()
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
  printPrice: Joi.number().min(0).optional(),
  canvasSketchPrice: Joi.number().min(0).optional(),
  canvasSketchImageUrl: Joi.string().uri().allow('', null).optional(),
  images: Joi.array().items(Joi.string().uri().allow('')).max(5).optional(),
  variants: Joi.array().items(variantValidationSchema).optional(),
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
  printPrice: Joi.number().min(0).optional(),
  canvasSketchPrice: Joi.number().min(0).optional(),
  canvasSketchImageUrl: Joi.string().uri().allow('', null).optional(),
  images: Joi.array().items(Joi.string().uri().allow('')).max(5).optional(),
  variants: Joi.array().items(variantValidationSchema).optional(),
  approvalStatus: Joi.string().valid('draft', 'pending', 'approved', 'rejected').optional(),
});

export const artistSchema = Joi.object({
  artistName: Joi.string().required(),
  penName: Joi.string().allow('', null).optional(),
  email: Joi.string().email().required(),
  bio: Joi.string().allow('', null).optional(),
  artistStatement: Joi.string().max(2000).allow('', null).optional(),
  location: Joi.string().max(160).allow('', null).optional(),
  artCategories: Joi.array().items(Joi.string().max(80)).max(20).optional(),
  artStyles: Joi.array().items(Joi.string().max(80)).max(20).optional(),
  mediums: Joi.array().items(Joi.string().max(80)).max(20).optional(),
  profileImage: Joi.string().uri().allow('', null).optional(),
  socialLinks: Joi.object({
    website: Joi.string().uri().allow('', null).optional(),
    instagram: Joi.string().uri().allow('', null).optional(),
    twitter: Joi.string().uri().allow('', null).optional(),
    facebook: Joi.string().uri().allow('', null).optional(),
    youtube: Joi.string().uri().allow('', null).optional(),
  }).optional(),
  address: Joi.object({
    street: Joi.string().max(160).allow('', null).optional(),
    line2: Joi.string().max(160).allow('', null).optional(),
    city: Joi.string().max(80).allow('', null).optional(),
    state: Joi.string().max(80).allow('', null).optional(),
    zip: Joi.string().pattern(/^[A-Za-z0-9 -]{3,12}$/).allow('', null).optional(),
    country: Joi.string().max(80).allow('', null).optional(),
  }).optional(),
});

export const artistProfileUpdateSchema = Joi.object({
  artistName: Joi.string().min(1).max(120).required(),
  phone: Joi.string().pattern(/^\+?[0-9 ()-]{7,20}$/).allow('', null).optional(),
  penName: Joi.string().max(120).allow('', null).optional(),
  bio: Joi.string().max(1000).allow('', null).optional(),
  artistStatement: Joi.string().max(2000).allow('', null).optional(),
  location: Joi.string().max(160).allow('', null).optional(),
  profileImage: Joi.string().uri().allow('', null).optional(),
  artCategories: Joi.array().items(Joi.string().max(80)).max(20).optional(),
  artStyles: Joi.array().items(Joi.string().max(80)).max(20).optional(),
  mediums: Joi.array().items(Joi.string().max(80)).max(20).optional(),
  socialLinks: Joi.object({
    website: Joi.string().uri().allow('', null).optional(),
    instagram: Joi.string().uri().allow('', null).optional(),
    twitter: Joi.string().uri().allow('', null).optional(),
    facebook: Joi.string().uri().allow('', null).optional(),
    youtube: Joi.string().uri().allow('', null).optional(),
  }).optional(),
  address: Joi.object({
    street: Joi.string().max(160).allow('', null).optional(),
    line2: Joi.string().max(160).allow('', null).optional(),
    city: Joi.string().max(80).allow('', null).optional(),
    state: Joi.string().max(80).allow('', null).optional(),
    zip: Joi.string().pattern(/^[A-Za-z0-9 -]{3,12}$/).allow('', null).optional(),
    country: Joi.string().max(80).allow('', null).optional(),
  }).optional(),
});

export const createIntentSchema = Joi.object({
  items: Joi.array().items(Joi.object({
    productId: Joi.string().required(),
    quantity: Joi.number().integer().min(1).required(),
    buyerOption: Joi.string().valid('painting', 'original', 'print', 'canvas-sketch', 'print-a5', 'print-a4', 'print-a3', 'outline-sketch', 'colored-version').optional(),
  })).min(1).required(),
  couponCode: Joi.string().allow('', null).optional(),
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
  printPrice: Joi.number().min(0).optional(),
  canvasSketchPrice: Joi.number().min(0).optional(),
  canvasSketchImageUrl: Joi.string().uri().allow('', null).optional(),
  images: Joi.array().items(Joi.string().uri().allow('')).max(5).optional(),
  variants: Joi.array().items(variantValidationSchema).optional(),
});

export const walletWithdrawalSchema = Joi.object({
  amount: Joi.number().positive().required(),
  note: Joi.string().allow('', null).optional(),
});

export const payoutAccountSchema = Joi.object({
  accountHolderName: Joi.string().trim().min(2).max(120).required(),
  accountNumber: Joi.string().pattern(/^\d{9,18}$/).required(),
  confirmAccountNumber: Joi.string().valid(Joi.ref('accountNumber')).required(),
  ifscCode: Joi.string().trim().uppercase().pattern(/^[A-Z]{4}0[A-Z0-9]{6}$/).required(),
  bankName: Joi.string().trim().min(2).max(120).required(),
  accountType: Joi.string().valid('savings', 'current').required(),
  upiId: Joi.string().trim().pattern(/^[\w.-]+@[\w.-]+$/).allow('', null).optional(),
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
