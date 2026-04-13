import mongoose from 'mongoose';

const SavedCollectionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true, trim: true },
    slug: { type: String, trim: true },
    isDefault: { type: Boolean, default: false },
    items: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
  },
  { timestamps: true }
);

SavedCollectionSchema.index({ user: 1, name: 1 }, { unique: true });

export default mongoose.model('SavedCollection', SavedCollectionSchema);
