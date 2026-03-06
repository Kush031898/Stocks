const mongoose = require('mongoose');

const portfolioSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  holdings: [{
    stock: { type: mongoose.Schema.Types.ObjectId, ref: 'Stock' },
    symbol: String,
    name: String,
    quantity: { type: Number, default: 0 },
    avgBuyPrice: { type: Number, default: 0 },
    totalInvested: { type: Number, default: 0 },
  }],
  totalInvested: { type: Number, default: 0 },
  currentValue: { type: Number, default: 0 },
  totalPnL: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('Portfolio', portfolioSchema);
