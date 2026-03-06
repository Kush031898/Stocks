const Stock = require('../models/Stock');

// Simulate price fluctuation
const simulatePrice = (stock) => {
  const change = (Math.random() - 0.48) * stock.currentPrice * 0.02;
  const newPrice = Math.max(1, stock.currentPrice + change);
  stock.change = newPrice - stock.previousClose;
  stock.changePercent = ((stock.change / stock.previousClose) * 100);
  stock.currentPrice = parseFloat(newPrice.toFixed(2));
  if (stock.priceHistory.length > 50) stock.priceHistory.shift();
  stock.priceHistory.push({ price: stock.currentPrice, timestamp: new Date() });
  return stock;
};

// @GET /api/stocks
const getStocks = async (req, res) => {
  try {
    const { search, sector, page = 1, limit = 20 } = req.query;
    let query = { isActive: true };
    if (search) query.$or = [
      { symbol: { $regex: search, $options: 'i' } },
      { name: { $regex: search, $options: 'i' } }
    ];
    if (sector) query.sector = sector;

    const stocks = await Stock.find(query)
      .select('-priceHistory')
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Stock.countDocuments(query);
    res.json({ stocks, total, pages: Math.ceil(total / limit), currentPage: page });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @GET /api/stocks/:symbol
const getStockBySymbol = async (req, res) => {
  try {
    let stock = await Stock.findOne({ symbol: req.params.symbol.toUpperCase() });
    if (!stock) return res.status(404).json({ message: 'Stock not found' });
    stock = simulatePrice(stock);
    await stock.save();
    res.json(stock);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @GET /api/stocks/refresh/prices  — refresh all prices
const refreshPrices = async (req, res) => {
  try {
    const stocks = await Stock.find({ isActive: true });
    for (let stock of stocks) {
      simulatePrice(stock);
      await stock.save();
    }
    res.json({ message: `Refreshed ${stocks.length} stocks` });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @GET /api/stocks/sectors/list
const getSectors = async (req, res) => {
  try {
    const sectors = await Stock.distinct('sector');
    res.json(sectors);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getStocks, getStockBySymbol, refreshPrices, getSectors };
