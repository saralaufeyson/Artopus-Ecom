import mongoose from 'mongoose';

const ArtistRequestSchema = new mongoose.Schema(
  {
    artistName: { type: String, required: true },
    penName: { type: String },
    email: { type: String, required: true, lowercase: true },
    bio: { type: String, required: true },
    portfolioLink: { type: String },
    socialLinks: {
      website: { type: String },
      instagram: { type: String },
      twitter: { type: String },
      facebook: { type: String },
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    processedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    processedAt: { type: Date },
  },
  { timestamps: true }
);

export default mongoose.model('ArtistRequest', ArtistRequestSchema);
