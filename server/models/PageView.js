import mongoose from 'mongoose';

const PageViewSchema = new mongoose.Schema(
  {
    page: { type: String, required: true },
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    meta: { type: Object, default: {} },
  },
  { timestamps: true }
);

export default mongoose.model('PageView', PageViewSchema);
