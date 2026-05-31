import mongoose from 'mongoose';

const CouponUsageSchema = new mongoose.Schema(
  {
    couponId: { type: mongoose.Schema.Types.ObjectId, ref: 'Coupon', required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
    discountAmount: { type: Number, required: true, min: 0 },
    usedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// Index for tracking per-user usage
CouponUsageSchema.index({ couponId: 1, userId: 1 });
CouponUsageSchema.index({ userId: 1 });

export default mongoose.model('CouponUsage', CouponUsageSchema);
