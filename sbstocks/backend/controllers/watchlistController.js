const Watchlist = require('../models/Watchlist');
const Stock = require('../models/Stock');

// @GET /api/watchlist
const getWatchlist = async (req, res) => {
  try {
    let watchlist = await Watchlist.findOne({ user: req.user._id });
    if (!watchlist) watchlist = await Watchlist.create({ user: req.user._id, stocks: [] });

    const enriched = [];
    for (const w of watchlist.stocks) {
      const stock = await Stock.findOne({ symbol: w.symbol }).select('-priceHistory');
      if (stock) enriched.push({ ...stock.toObject(), addedAt: w.addedAt });
    }

    res.json(enriched);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @POST /api/watchlist/:symbol
const addToWatchlist = async (req, res) => {
  try {
    const stock = await Stock.findOne({ symbol: req.params.symbol.toUpperCase() });
    if (!stock) return res.status(404).json({ message: 'Stock not found' });

    let watchlist = await Watchlist.findOne({ user: req.user._id });
    if (!watchlist) watchlist = await Watchlist.create({ user: req.user._id, stocks: [] });

    const exists = watchlist.stocks.find(s => s.symbol === stock.symbol);
    if (exists) return res.status(400).json({ message: 'Already in watchlist' });

    watchlist.stocks.push({ stock: stock._id, symbol: stock.symbol });
    await watchlist.save();
    res.json({ message: 'Added to watchlist' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @DELETE /api/watchlist/:symbol
const removeFromWatchlist = async (req, res) => {
  try {
    const watchlist = await Watchlist.findOne({ user: req.user._id });
    if (!watchlist) return res.status(404).json({ message: 'Watchlist not found' });

    watchlist.stocks = watchlist.stocks.filter(s => s.symbol !== req.params.symbol.toUpperCase());
    await watchlist.save();
    res.json({ message: 'Removed from watchlist' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getWatchlist, addToWatchlist, removeFromWatchlist };
