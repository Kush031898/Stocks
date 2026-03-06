const User = require('../models/User');
const Stock = require('../models/Stock');
const Transaction = require('../models/Transaction');

// @GET /api/admin/dashboard
const getDashboard = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ role: 'user' });
    const totalStocks = await Stock.countDocuments({ isActive: true });
    const totalTransactions = await Transaction.countDocuments();
    const recentTransactions = await Transaction.find()
      .populate('user', 'name email')
      .sort({ createdAt: -1 }).limit(10);
    res.json({ totalUsers, totalStocks, totalTransactions, recentTransactions });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @GET /api/admin/users
const getUsers = async (req, res) => {
  try {
    const users = await User.find({ role: 'user' }).select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @PUT /api/admin/users/:id/toggle
const toggleUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    user.isActive = !user.isActive;
    await user.save();
    res.json({ message: `User ${user.isActive ? 'activated' : 'deactivated'}`, isActive: user.isActive });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @POST /api/admin/stocks
const createStock = async (req, res) => {
  try {
    const { symbol, name, sector, currentPrice, description } = req.body;
    if (!symbol || !name || !currentPrice)
      return res.status(400).json({ message: 'Symbol, name, and price are required' });

    const exists = await Stock.findOne({ symbol: symbol.toUpperCase() });
    if (exists) return res.status(400).json({ message: 'Stock already exists' });

    const stock = await Stock.create({
      symbol: symbol.toUpperCase(), name, sector,
      currentPrice, previousClose: currentPrice,
      openPrice: currentPrice, dayHigh: currentPrice,
      dayLow: currentPrice, description,
      priceHistory: [{ price: currentPrice }]
    });
    res.status(201).json(stock);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @PUT /api/admin/stocks/:id
const updateStock = async (req, res) => {
  try {
    const stock = await Stock.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!stock) return res.status(404).json({ message: 'Stock not found' });
    res.json(stock);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @DELETE /api/admin/stocks/:id
const deleteStock = async (req, res) => {
  try {
    const stock = await Stock.findById(req.params.id);
    if (!stock) return res.status(404).json({ message: 'Stock not found' });
    stock.isActive = false;
    await stock.save();
    res.json({ message: 'Stock deactivated' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @POST /api/admin/seed
const seedStocks = async (req, res) => {
  try {
    const stocks = [
      { symbol: 'AAPL', name: 'Apple Inc.', sector: 'Technology', currentPrice: 189.84, description: 'Consumer electronics, software, and services.' },
      { symbol: 'MSFT', name: 'Microsoft Corporation', sector: 'Technology', currentPrice: 415.32, description: 'Software, cloud computing, and hardware.' },
      { symbol: 'GOOGL', name: 'Alphabet Inc.', sector: 'Technology', currentPrice: 175.25, description: 'Internet services and products.' },
      { symbol: 'AMZN', name: 'Amazon.com Inc.', sector: 'E-Commerce', currentPrice: 215.90, description: 'E-commerce, cloud computing, and AI.' },
      { symbol: 'NVDA', name: 'NVIDIA Corporation', sector: 'Technology', currentPrice: 875.40, description: 'Graphics processing units and AI chips.' },
      { symbol: 'META', name: 'Meta Platforms Inc.', sector: 'Technology', currentPrice: 589.25, description: 'Social media and virtual reality.' },
      { symbol: 'TSLA', name: 'Tesla Inc.', sector: 'Automotive', currentPrice: 245.60, description: 'Electric vehicles and clean energy.' },
      { symbol: 'JPM', name: 'JPMorgan Chase & Co.', sector: 'Finance', currentPrice: 224.15, description: 'Investment banking and financial services.' },
      { symbol: 'V', name: 'Visa Inc.', sector: 'Finance', currentPrice: 312.80, description: 'Payment technology and financial services.' },
      { symbol: 'JNJ', name: 'Johnson & Johnson', sector: 'Healthcare', currentPrice: 158.25, description: 'Pharmaceuticals and medical devices.' },
      { symbol: 'WMT', name: 'Walmart Inc.', sector: 'Retail', currentPrice: 89.50, description: 'Multinational retail corporation.' },
      { symbol: 'PG', name: 'Procter & Gamble', sector: 'Consumer Goods', currentPrice: 172.35, description: 'Consumer goods and personal care products.' },
      { symbol: 'DIS', name: 'The Walt Disney Company', sector: 'Entertainment', currentPrice: 112.45, description: 'Entertainment and media company.' },
      { symbol: 'NFLX', name: 'Netflix Inc.', sector: 'Entertainment', currentPrice: 685.30, description: 'Streaming entertainment service.' },
      { symbol: 'AMD', name: 'Advanced Micro Devices', sector: 'Technology', currentPrice: 178.90, description: 'Semiconductors and processors.' },
      { symbol: 'INTC', name: 'Intel Corporation', sector: 'Technology', currentPrice: 42.15, description: 'Semiconductor chips and processors.' },
      { symbol: 'BABA', name: 'Alibaba Group', sector: 'E-Commerce', currentPrice: 78.60, description: 'Chinese e-commerce conglomerate.' },
      { symbol: 'PYPL', name: 'PayPal Holdings', sector: 'Finance', currentPrice: 68.25, description: 'Digital payment platform.' },
      { symbol: 'UBER', name: 'Uber Technologies', sector: 'Transportation', currentPrice: 82.40, description: 'Ride-sharing and food delivery.' },
      { symbol: 'SPOT', name: 'Spotify Technology', sector: 'Entertainment', currentPrice: 345.20, description: 'Audio streaming platform.' },
    ];

    let created = 0;
    for (const s of stocks) {
      const exists = await Stock.findOne({ symbol: s.symbol });
      if (!exists) {
        await Stock.create({
          ...s, previousClose: s.currentPrice,
          openPrice: s.currentPrice, dayHigh: s.currentPrice * 1.02,
          dayLow: s.currentPrice * 0.98, volume: Math.floor(Math.random() * 10000000),
          marketCap: s.currentPrice * Math.floor(Math.random() * 1000000000),
          priceHistory: [{ price: s.currentPrice }]
        });
        created++;
      }
    }
    res.json({ message: `Seeded ${created} stocks` });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getDashboard, getUsers, toggleUser, createStock, updateStock, deleteStock, seedStocks };
