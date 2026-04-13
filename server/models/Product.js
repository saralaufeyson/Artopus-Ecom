import mongoose from 'mongoose';

const ProductSchema = new mongoose.Schema(
  {
    type: { type: String, enum: ['original-artwork', 'merchandise'], required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    category: { type: String, required: true },
    imageUrl: { type: String, required: true },
    stockQuantity: { type: Number, default: 0 },
    artistId: { type: mongoose.Schema.Types.ObjectId, ref: 'Artist', required: false },
    artistUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    artistName: { type: String, required: false },
    artistEmail: { type: String },
    medium: { type: String },
    dimensions: { type: String },
    year: { type: String },
    videoUrl: { type: String },
    outlineSketchPrice: { type: Number, min: 0, default: 0 },
    coloringPrice: { type: Number, min: 0, default: 0 },
    approvalStatus: { type: String, enum: ['draft', 'pending', 'approved', 'rejected'], default: 'approved' },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Ensure original artworks always have stock 1 or 0
ProductSchema.pre('save', function () {
  if (this.type === 'original-artwork') {
    if (this.stockQuantity > 1) this.stockQuantity = 1;
  }
});

export default mongoose.model('Product', ProductSchema);
