import Coupon from '../models/Coupon.js';
import CouponUsage from '../models/CouponUsage.js';

/**
 * Validate coupon code for a given order
 * @param {string} code - Coupon code to validate
 * @param {number} orderTotal - Total order amount (before discount)
 * @param {string} userId - User ID applying the coupon
 * @param {Array} items - Order items (for category/artist validation)
 * @returns {Object} {valid: boolean, message?: string, discount?: number, coupon?: Object}
 */
export async function validateCoupon(code, orderTotal, userId, items = []) {
  if (!code) {
    return { valid: false, message: 'Coupon code is required' };
  }

  try {
    const coupon = await Coupon.findOne({
      code: code.toUpperCase().trim(),
      active: true,
    });

    if (!coupon) {
      return { valid: false, message: 'Invalid coupon code' };
    }

    const now = new Date();
    if (now < coupon.validFrom || now > coupon.validUntil) {
      return { valid: false, message: 'Coupon has expired or is not yet valid' };
    }

    // Check usage limit
    if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
      return { valid: false, message: 'Coupon usage limit reached' };
    }

    // Check per-user usage limit
    const userUsageCount = await CouponUsage.countDocuments({
      couponId: coupon._id,
      userId,
    });

    if (coupon.perUserLimit && userUsageCount >= coupon.perUserLimit) {
      return { valid: false, message: `You can only use this coupon ${coupon.perUserLimit} time(s)` };
    }

    // Check minimum order amount
    if (coupon.minOrderAmount && orderTotal < coupon.minOrderAmount) {
      return {
        valid: false,
        message: `Minimum order amount is $${coupon.minOrderAmount.toFixed(2)}`,
      };
    }

    // Check maximum order amount
    if (coupon.maxOrderAmount && orderTotal > coupon.maxOrderAmount) {
      return {
        valid: false,
        message: `Coupon cannot be applied to orders over $${coupon.maxOrderAmount.toFixed(2)}`,
      };
    }

    // Calculate discount
    let discount = 0;
    if (coupon.type === 'percentage') {
      discount = Math.round((orderTotal * coupon.value) / 100 * 100) / 100;
      if (coupon.maxDiscount) {
        discount = Math.min(discount, coupon.maxDiscount);
      }
    } else if (coupon.type === 'fixed') {
      discount = Math.min(coupon.value, orderTotal);
    }

    return {
      valid: true,
      discount,
      coupon: {
        id: coupon._id,
        code: coupon.code,
        type: coupon.type,
        value: coupon.value,
        description: coupon.description,
      },
    };
  } catch (error) {
    console.error('Error validating coupon:', error);
    return { valid: false, message: 'Error validating coupon' };
  }
}

/**
 * Record coupon usage
 * @param {string} couponId - Coupon ID
 * @param {string} userId - User ID
 * @param {number} discountAmount - Discount amount applied
 * @param {string} orderId - Order ID (optional)
 * @returns {Object} Created usage record
 */
export async function recordCouponUsage(couponId, userId, discountAmount, orderId = null) {
  try {
    const usage = await CouponUsage.create({
      couponId,
      userId,
      discountAmount,
      orderId,
    });

    // Increment coupon usage count
    await Coupon.findByIdAndUpdate(couponId, { $inc: { usageCount: 1 } });

    return usage;
  } catch (error) {
    console.error('Error recording coupon usage:', error);
    throw error;
  }
}

/**
 * Get active coupons for users
 * @returns {Array} List of active coupons
 */
export async function getActiveCoupons() {
  try {
    const now = new Date();
    const coupons = await Coupon.find({
      active: true,
      validFrom: { $lte: now },
      validUntil: { $gte: now },
    }).select('code description type value maxDiscount minOrderAmount');

    return coupons;
  } catch (error) {
    console.error('Error getting active coupons:', error);
    return [];
  }
}

/**
 * Create new coupon (admin only)
 * @param {Object} couponData - Coupon data
 * @returns {Object} Created coupon
 */
export async function createCoupon(couponData) {
  try {
    const coupon = await Coupon.create(couponData);
    return coupon;
  } catch (error) {
    console.error('Error creating coupon:', error);
    throw error;
  }
}

/**
 * Update coupon (admin only)
 * @param {string} couponId - Coupon ID
 * @param {Object} updates - Fields to update
 * @returns {Object} Updated coupon
 */
export async function updateCoupon(couponId, updates) {
  try {
    const coupon = await Coupon.findByIdAndUpdate(couponId, updates, { new: true });
    return coupon;
  } catch (error) {
    console.error('Error updating coupon:', error);
    throw error;
  }
}

/**
 * Delete coupon (admin only)
 * @param {string} couponId - Coupon ID
 */
export async function deleteCoupon(couponId) {
  try {
    await Coupon.findByIdAndDelete(couponId);
  } catch (error) {
    console.error('Error deleting coupon:', error);
    throw error;
  }
}
