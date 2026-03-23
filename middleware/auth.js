// ============================================================
// middleware/auth.js - JWT Authentication Middleware
// ============================================================
const jwt = require('jsonwebtoken');
const { users } = require('../data/db');

// ── Verify JWT Token ─────────────────────────────────────────
const verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer <token>

    if (!token) {
        return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'furniture_shop_secret_key_2024');
        req.user = decoded;
    } catch (err) {
        return res.status(403).json({ message: 'Invalid or expired token.' });
    }

    next();
};

// ── Admin-Only Guard ─────────────────────────────────────────
const adminOnly = (req, res, next) => {
    if (!req.user || req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Access denied. Admin only.' });
    }
    next();
};

module.exports = { verifyToken, adminOnly };
