import mongoose from 'mongoose';

const OrderItemSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  title: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true, min: 1 },
  artistEmail: { type: String },
});

const AddressSchema = new mongoose.Schema({
  street: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  zip: { type: String, required: true },
  country: { type: String, required: true },
});

const OrderSchema = new mongoose.Schema(
  {
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    items: { type: [OrderItemSchema], validate: [(arr) => arr && arr.length > 0, 'Order must have at least one item'] },
    totalAmount: { type: Number, required: true },
    paymentIntentId: { type: String, required: true },
    status: { type: String, enum: ['created', 'succeeded', 'failed', 'shipped', 'delivered'], default: 'created' },
    shippingAddress: { type: AddressSchema, required: true },
    expectedDeliveryDate: { type: Date },
  },
  { timestamps: true }
);

export default mongoose.model('Order', OrderSchema);
