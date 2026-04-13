import mongoose from 'mongoose';

const ArtistSchema = new mongoose.Schema(
  {
    artistName: { type: String, required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    penName: { type: String },
    email: { type: String, required: true, unique: true, lowercase: true },
    bio: { type: String },
    profileImage: { type: String },
    commissionRate: { type: Number, default: 18, min: 0, max: 100 },
    walletBalance: { type: Number, default: 0, min: 0 },
    lifetimeEarnings: { type: Number, default: 0, min: 0 },
    totalWithdrawn: { type: Number, default: 0, min: 0 },
    socialLinks: {
      website: { type: String },
      instagram: { type: String },
      twitter: { type: String },
      facebook: { type: String },
    },
    dateOfJoining: { type: Date, default: Date.now },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model('Artist', ArtistSchema);
