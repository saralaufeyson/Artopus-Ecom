import mongoose from 'mongoose';
import dotenv from 'dotenv';
import TaxConfig from '../models/TaxConfig.js';
import { connectDB } from '../config/db.js';

dotenv.config();

async function seedTaxConfig() {
  try {
    await connectDB();
    console.log('Connected to DB');

    // Clear existing tax config
    await TaxConfig.deleteMany({});
    console.log('Cleared existing tax config');

    // Create default tax config with common US state tax rates
    const defaultRates = [
      { state: 'CA', rate: 8.625 },
      { state: 'NY', rate: 8.875 },
      { state: 'TX', rate: 8.25 },
      { state: 'FL', rate: 7 },
      { state: 'IL', rate: 6.25 },
      { state: 'OH', rate: 7.25 },
      { state: 'PA', rate: 6 },
      { state: 'MI', rate: 6 },
      { state: 'WA', rate: 10.25 },
      { state: 'VA', rate: 5.75 },
      { state: 'ALL', rate: 8, isDefault: true }, // Default for unmapped states
    ];

    const taxConfig = await TaxConfig.create({
      rates: defaultRates,
      enableTax: true,
      taxableProductTypes: ['original-artwork', 'merchandise'],
    });

    console.log('✅ Tax configuration seeded successfully!');
    console.log('Tax Rates:', taxConfig.rates);
    
    await mongoose.connection.close();
  } catch (error) {
    console.error('❌ Error seeding tax config:', error);
    process.exit(1);
  }
}

seedTaxConfig();
