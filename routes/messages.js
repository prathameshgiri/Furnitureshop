// ── routes/messages.js ───────────────────────────────────────
const express = require('express');
const router = express.Router();
const { sendMessage, getMessages, markRead, deleteMessage } = require('../controllers/messageController');
const { verifyToken, adminOnly } = require('../middleware/auth');

router.post('/', sendMessage);
router.get('/', verifyToken, adminOnly, getMessages);
router.put('/:id/read', verifyToken, adminOnly, markRead);
router.delete('/:id', verifyToken, adminOnly, deleteMessage);

module.exports = router;
