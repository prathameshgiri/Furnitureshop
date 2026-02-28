// ── routes/orders.js ─────────────────────────────────────────
const express = require('express');
const router = express.Router();
const { placeOrder, getUserOrders, getAllOrders, updateOrderStatus } = require('../controllers/orderController');
const { verifyToken, adminOnly } = require('../middleware/auth');

router.post('/', verifyToken, placeOrder);
router.get('/my', verifyToken, getUserOrders);
router.get('/all', verifyToken, adminOnly, getAllOrders);
router.put('/:id/status', verifyToken, adminOnly, updateOrderStatus);

module.exports = router;
