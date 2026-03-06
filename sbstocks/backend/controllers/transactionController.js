const Transaction = require('../models/Transaction');
const Stock = require('../models/Stock');
const User = require('../models/User');
const Portfolio = require('../models/Portfolio');

// @POST /api/transactions/buy
const buyStock = async (req, res) => {
  try {
    const { stockId, quantity } = req.body;
    if (!stockId || !quantity || quantity <= 0)
      return res.status(400).json({ message: 'Invalid request' });

    const stock = await Stock.findById(stockId);
    if (!stock || !stock.isActive)
      return res.status(404).json({ message: 'Stock not found' });

    const user = await User.findById(req.user._id);
    const total = stock.currentPrice * quantity;

    if (user.virtualBalance < total)
      return res.status(400).json({ message: 'Insufficient virtual balance' });

    // Deduct balance
    user.virtualBalance -= total;
    await user.save();

    // Update portfolio
    let portfolio = await Portfolio.findOne({ user: user._id });
    if (!portfolio) portfolio = await Portfolio.create({ user: user._id });

    const holdingIdx = portfolio.holdings.findIndex(h => h.symbol === stock.symbol);
    if (holdingIdx >= 0) {
      const h = portfolio.holdings[holdingIdx];
      const newQty = h.quantity + quantity;
      h.avgBuyPrice = (h.totalInvested + total) / newQty;
      h.quantity = newQty;
      h.totalInvested += total;
    } else {
      portfolio.holdings.push({
        stock: stock._id,
        symbol: stock.symbol,
        name: stock.name,
        quantity,
        avgBuyPrice: stock.currentPrice,
        totalInvested: total
      });
    }
    portfolio.totalInvested += total;
    await portfolio.save();

    const tx = await Transaction.create({
      user: user._id, stock: stock._id,
      symbol: stock.symbol, name: stock.name,
      type: 'BUY', quantity, price: stock.currentPrice, total
    });

    res.status(201).json({ message: 'Stock purchased successfully', transaction: tx, newBalance: user.virtualBalance });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @POST /api/transactions/sell
const sellStock = async (req, res) => {
  try {
    const { stockId, quantity } = req.body;
    if (!stockId || !quantity || quantity <= 0)
      return res.status(400).json({ message: 'Invalid request' });

    const stock = await Stock.findById(stockId);
    if (!stock) return res.status(404).json({ message: 'Stock not found' });

    const user = await User.findById(req.user._id);
    const portfolio = await Portfolio.findOne({ user: user._id });

    const holdingIdx = portfolio?.holdings.findIndex(h => h.symbol === stock.symbol);
    if (holdingIdx === undefined || holdingIdx < 0)
      return res.status(400).json({ message: 'You do not own this stock' });

    const holding = portfolio.holdings[holdingIdx];
    if (holding.quantity < quantity)
      return res.status(400).json({ message: 'Insufficient shares' });

    const total = stock.currentPrice * quantity;
    user.virtualBalance += total;
    await user.save();

    holding.quantity -= quantity;
    holding.totalInvested -= holding.avgBuyPrice * quantity;
    if (holding.quantity === 0) portfolio.holdings.splice(holdingIdx, 1);
    portfolio.totalInvested -= holding.avgBuyPrice * quantity;
    await portfolio.save();

    const tx = await Transaction.create({
      user: user._id, stock: stock._id,
      symbol: stock.symbol, name: stock.name,
      type: 'SELL', quantity, price: stock.currentPrice, total
    });

    res.status(201).json({ message: 'Stock sold successfully', transaction: tx, newBalance: user.virtualBalance });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @GET /api/transactions
const getTransactions = async (req, res) => {
  try {
    const { page = 1, limit = 20, type } = req.query;
    let query = { user: req.user._id };
    if (type) query.type = type;
    const transactions = await Transaction.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    const total = await Transaction.countDocuments(query);
    res.json({ transactions, total, pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { buyStock, sellStock, getTransactions };
