import mongoose from 'mongoose';

const ArtistSchema = new mongoose.Schema(
  {
    artistName: { type: String, required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    penName: { type: String },
    email: { type: String, required: true, unique: true, lowercase: true },
    bio: { type: String },
    artistStatement: { type: String, maxlength: 2000 },
    location: { type: String, maxlength: 160 },
    artCategories: { type: [String], default: [] },
    artStyles: { type: [String], default: [] },
    mediums: { type: [String], default: [] },
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
      youtube: { type: String },
    },
    paymentDetails: {
      upiId: { type: String },
      bankName: { type: String },
      accountNumber: { type: String },
      ifscCode: { type: String },
      accountHolderName: { type: String },
    },
    payoutAccount: {
      accountHolderName: { type: String },
      accountNumberEncrypted: { type: String },
      accountNumberLast4: { type: String, maxlength: 4 },
      ifscCode: { type: String, uppercase: true },
      bankName: { type: String },
      accountType: { type: String, enum: ['savings', 'current'] },
      upiId: { type: String },
      verificationStatus: { type: String, enum: ['not_configured', 'pending', 'verified', 'failed', 'disabled'], default: 'not_configured' },
      verificationReason: { type: String },
      updatedAt: { type: Date },
    },
    address: {
      street: { type: String },
      line2: { type: String },
      city: { type: String },
      state: { type: String },
      zip: { type: String },
      country: { type: String },
    },
    dateOfJoining: { type: Date, default: Date.now },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model('Artist', ArtistSchema);
