const mongoose = require('mongoose');

const stockSchema = new mongoose.Schema({
  symbol: { type: String, required: true, unique: true, uppercase: true },
  name: { type: String, required: true },
  sector: { type: String, default: 'Technology' },
  currentPrice: { type: Number, required: true },
  previousClose: { type: Number, default: 0 },
  openPrice: { type: Number, default: 0 },
  dayHigh: { type: Number, default: 0 },
  dayLow: { type: Number, default: 0 },
  volume: { type: Number, default: 0 },
  marketCap: { type: Number, default: 0 },
  change: { type: Number, default: 0 },
  changePercent: { type: Number, default: 0 },
  description: { type: String, default: '' },
  isActive: { type: Boolean, default: true },
  priceHistory: [{
    price: Number,
    timestamp: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

module.exports = mongoose.model('Stock', stockSchema);
