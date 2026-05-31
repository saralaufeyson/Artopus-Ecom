import TaxConfig from '../models/TaxConfig.js';

/**
 * Get tax rate for a given state
 * @param {string} state - State abbreviation or name
 * @returns {number} Tax rate as a decimal (e.g., 0.085 for 8.5%)
 */
export async function getTaxRate(state) {
  try {
    if (!state) return 0;

    const taxConfig = await TaxConfig.findOne().select('rates enableTax');
    if (!taxConfig || !taxConfig.enableTax) return 0;

    // Look for state-specific rate
    const stateRate = taxConfig.rates.find((r) => r.state.toUpperCase() === state.toUpperCase());
    if (stateRate) return stateRate.rate / 100;

    // Fall back to default rate
    const defaultRate = taxConfig.rates.find((r) => r.isDefault);
    return defaultRate ? defaultRate.rate / 100 : 0;
  } catch (err) {
    console.error('Error getting tax rate:', err);
    return 0;
  }
}

/**
 * Calculate tax amount for an order
 * @param {number} subtotal - Order subtotal before tax
 * @param {string} state - Shipping state
 * @returns {Promise<number>} Calculated tax amount
 */
export async function calculateTax(subtotal, state) {
  const rate = await getTaxRate(state);
  return Math.round(subtotal * rate * 100) / 100; // Round to 2 decimal places
}

/**
 * Get all tax rates
 * @returns {Promise<Array>} Array of tax rates
 */
export async function getAllTaxRates() {
  try {
    const taxConfig = await TaxConfig.findOne();
    return taxConfig?.rates || [];
  } catch (err) {
    console.error('Error getting tax rates:', err);
    return [];
  }
}

/**
 * Update tax rates (admin only)
 * @param {Array} rates - Array of rate objects
 * @returns {Promise<Object>} Updated tax config
 */
export async function updateTaxRates(rates) {
  try {
    let taxConfig = await TaxConfig.findOne();
    if (!taxConfig) {
      taxConfig = new TaxConfig();
    }
    taxConfig.rates = rates;
    taxConfig.lastUpdated = new Date();
    await taxConfig.save();
    return taxConfig;
  } catch (err) {
    console.error('Error updating tax rates:', err);
    throw err;
  }
}

/**
 * Toggle tax on/off globally
 * @param {boolean} enabled - Whether tax should be enabled
 * @returns {Promise<Object>} Updated tax config
 */
export async function setTaxEnabled(enabled) {
  try {
    let taxConfig = await TaxConfig.findOne();
    if (!taxConfig) {
      taxConfig = new TaxConfig();
    }
    taxConfig.enableTax = enabled;
    await taxConfig.save();
    return taxConfig;
  } catch (err) {
    console.error('Error setting tax enabled:', err);
    throw err;
  }
}
