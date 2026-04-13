import mongoose from 'mongoose';

const WalletSchema = new mongoose.Schema(
  {
    artist: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Artist',
      required: true,
      unique: true,
    },
    balance: { type: Number, default: 0, min: 0 },
    lifetimeCredits: { type: Number, default: 0, min: 0 },
  },
  { timestamps: true }
);

export default mongoose.model('Wallet', WalletSchema);
