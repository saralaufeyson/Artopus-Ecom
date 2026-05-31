import mongoose from 'mongoose';

const TaxRateSchema = new mongoose.Schema({
  state: { type: String, required: true }, // e.g., "CA", "NY", or "ALL" for default
  rate: { type: Number, required: true, min: 0, max: 100 }, // Percentage (e.g., 8.5)
  isDefault: { type: Boolean, default: false },
});

const TaxConfigSchema = new mongoose.Schema(
  {
    rates: [TaxRateSchema],
    enableTax: { type: Boolean, default: true },
    taxableProductTypes: [{ type: String, default: ['original-artwork', 'merchandise'] }],
    lastUpdated: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.model('TaxConfig', TaxConfigSchema);
