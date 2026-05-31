import mongoose from 'mongoose';

const ReturnReasonSchema = {
  code: { type: String, required: true }, // e.g., "defective", "not_as_described", "changed_mind"
  label: { type: String, required: true },
};

const ReturnSchema = new mongoose.Schema(
  {
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    reason: {
      code: { type: String, required: true },
      label: { type: String },
    },
    description: { type: String, required: true },
    photos: [{ type: String }], // URLs to photos of the item
    requestedAmount: { type: Number, required: true, min: 0 },
    approvedAmount: { type: Number, default: 0, min: 0 },
    status: {
      type: String,
      enum: ['requested', 'approved', 'rejected', 'refunded', 'completed'],
      default: 'requested',
    },
    adminNotes: { type: String },
    refundTransactionId: { type: String }, // Stripe/PayPal refund ID
    refundInitiatedDate: { type: Date },
    returnReceivedDate: { type: Date },
    rejectionReason: { type: String },
    requestedDate: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// Ensure returns can only be requested within 30 days
ReturnSchema.index({ requestedDate: 1 });
ReturnSchema.index({ orderId: 1, customerId: 1 });

export default mongoose.model('Return', ReturnSchema);
