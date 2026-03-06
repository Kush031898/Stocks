const express = require('express');
const router = express.Router();
const { getStocks, getStockBySymbol, refreshPrices, getSectors } = require('../controllers/stockController');
const { protect } = require('../middleware/auth');

router.get('/', protect, getStocks);
router.get('/sectors/list', protect, getSectors);
router.get('/refresh/prices', protect, refreshPrices);
router.get('/:symbol', protect, getStockBySymbol);

module.exports = router;
