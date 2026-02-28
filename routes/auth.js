// ── routes/auth.js ────────────────────────────────────────────
const express = require('express');
const router = express.Router();
const { register, login, getProfile, updateProfile, getAllUsers } = require('../controllers/authController');
const { verifyToken, adminOnly } = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.get('/profile', verifyToken, getProfile);
router.put('/profile', verifyToken, updateProfile);
router.get('/users', verifyToken, adminOnly, getAllUsers);

module.exports = router;
