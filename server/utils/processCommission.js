import mongoose from 'mongoose';
import Order from '../models/Order.js';
import Artist from '../models/Artist.js';
import Wallet from '../models/Wallet.js';
import WalletTransaction from '../models/WalletTransaction.js';

const PLATFORM_FEE_RATE = 0.18;
const ARTIST_SHARE_RATE = 0.82;
const round = (value) => Number(value.toFixed(2));

export async function processCommission(orderId) {
  const session = await mongoose.startSession();

  try {
    let result = null;

    await session.withTransaction(async () => {
      const order = await Order.findById(orderId).session(session);
      if (!order) throw new Error('Order not found');

      for (const item of order.items) {
        if (!item.artistId) continue;

        const existing = await WalletTransaction.findOne({
          order: order._id,
          artist: item.artistId,
          type: 'sale_credit',
          'metadata.productId': item.productId,
          'metadata.buyerOption': item.buyerOption,
        }).session(session);

        if (existing) continue;

        const grossAmount = round(item.price * item.quantity);
        const platformFee = round(grossAmount * PLATFORM_FEE_RATE);
        const artistShare = round(grossAmount * ARTIST_SHARE_RATE);

        await Artist.updateOne(
          { _id: item.artistId },
          { $inc: { walletBalance: artistShare, lifetimeEarnings: artistShare } },
          { session }
        );

        await Wallet.findOneAndUpdate(
          { artist: item.artistId },
          { $inc: { balance: artistShare, lifetimeCredits: artistShare } },
          { upsert: true, new: true, session, setDefaultsOnInsert: true }
        );

        await WalletTransaction.create([{
          artist: item.artistId,
          order: order._id,
          amount: artistShare,
          commissionAmount: platformFee,
          type: 'sale_credit',
          status: 'completed',
          note: 'Commission processed',
          metadata: {
            productId: item.productId,
            buyerOption: item.buyerOption,
            grossAmount,
            platformFee,
            artistShare,
          },
        }], { session });
      }

      result = await Order.findById(order._id).session(session);
    });

    return result;
  } finally {
    session.endSession();
  }
}

export default processCommission;
