import mongoose from 'mongoose';

const WalletTransactionSchema = new mongoose.Schema(
  {
    artist: { type: mongoose.Schema.Types.ObjectId, ref: 'Artist', required: true },
    order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
    amount: { type: Number, required: true },
    commissionAmount: { type: Number, default: 0 },
    type: {
      type: String,
      enum: ['sale_credit', 'withdrawal_request', 'withdrawal_paid', 'manual_adjustment'],
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'completed', 'rejected'],
      default: 'completed',
    },
    note: { type: String },
    metadata: { type: Object, default: {} },
  },
  { timestamps: true }
);

export default mongoose.model('WalletTransaction', WalletTransactionSchema);
