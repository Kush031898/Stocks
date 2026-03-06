const Portfolio = require('../models/Portfolio');
const Stock = require('../models/Stock');
const User = require('../models/User');

// @GET /api/portfolio
const getPortfolio = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    let portfolio = await Portfolio.findOne({ user: req.user._id });

    if (!portfolio) {
      portfolio = await Portfolio.create({ user: req.user._id });
    }

    // Enrich with live prices
    let currentValue = 0;
    const enriched = [];
    for (const h of portfolio.holdings) {
      const stock = await Stock.findOne({ symbol: h.symbol });
      if (stock && h.quantity > 0) {
        const liveValue = stock.currentPrice * h.quantity;
        const pnl = liveValue - h.totalInvested;
        const pnlPercent = (pnl / h.totalInvested) * 100;
        currentValue += liveValue;
        enriched.push({
          ...h.toObject(),
          currentPrice: stock.currentPrice,
          currentValue: liveValue,
          pnl,
          pnlPercent: pnlPercent.toFixed(2),
          change: stock.change,
          changePercent: stock.changePercent
        });
      }
    }

    const totalInvested = enriched.reduce((s, h) => s + h.totalInvested, 0);
    const totalPnL = currentValue - totalInvested;

    res.json({
      holdings: enriched,
      totalInvested,
      currentValue,
      totalPnL,
      totalPnLPercent: totalInvested > 0 ? ((totalPnL / totalInvested) * 100).toFixed(2) : '0.00',
      virtualBalance: user.virtualBalance,
      netWorth: currentValue + user.virtualBalance
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getPortfolio };
