import mongoose from 'mongoose';

const ArtistSchema = new mongoose.Schema(
  {
    artistName: { type: String, required: true },
    penName: { type: String },
    email: { type: String, required: true, unique: true, lowercase: true },
    bio: { type: String },
    profileImage: { type: String },
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
