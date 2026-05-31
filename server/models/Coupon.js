import mongoose from 'mongoose';

const CouponSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    description: { type: String },
    type: { type: String, enum: ['percentage', 'fixed'], required: true }, // 'percentage' or 'fixed_amount'
    value: { type: Number, required: true, min: 0 }, // Percentage (0-100) or fixed amount
    maxDiscount: { type: Number }, // For percentage coupons, limit the max discount
    minOrderAmount: { type: Number, default: 0 }, // Minimum order total to use coupon
    maxOrderAmount: { type: Number }, // Maximum order total to use coupon
    usageLimit: { type: Number }, // Total times coupon can be used
    perUserLimit: { type: Number, default: 1 }, // Times per user
    usageCount: { type: Number, default: 0 }, // Current usage count
    active: { type: Boolean, default: true },
    validFrom: { type: Date, required: true },
    validUntil: { type: Date, required: true },
    applicableProductTypes: [{ type: String, default: ['original-artwork', 'merchandise'] }],
    categories: [{ type: String }], // Empty = all categories
    excludeArtists: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Artist' }],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

// Index for faster lookups
CouponSchema.index({ code: 1 });
CouponSchema.index({ active: 1, validFrom: 1, validUntil: 1 });

export default mongoose.model('Coupon', CouponSchema);
