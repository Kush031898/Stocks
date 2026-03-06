const express = require('express');
const router = express.Router();
const { getDashboard, getUsers, toggleUser, createStock, updateStock, deleteStock, seedStocks } = require('../controllers/adminController');
const { protect, adminOnly } = require('../middleware/auth');

router.use(protect, adminOnly);

router.get('/dashboard', getDashboard);
router.get('/users', getUsers);
router.put('/users/:id/toggle', toggleUser);
router.get('/stocks', require('../controllers/stockController').getStocks);
router.post('/stocks', createStock);
router.put('/stocks/:id', updateStock);
router.delete('/stocks/:id', deleteStock);
router.post('/seed', seedStocks);

module.exports = router;
