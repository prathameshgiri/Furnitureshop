// ============================================================
// server.js - Main Entry Point
// Online Furniture Shop Backend
// ============================================================
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const orderRoutes = require('./routes/orders');
const messageRoutes = require('./routes/messages');

const app = express();
const PORT = process.env.PORT || 5000;

// ── Middleware ───────────────────────────────────────────────
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Serve Frontend Static Files ──────────────────────────────
app.use(express.static(path.join(__dirname, 'frontend')));

// ── API Routes ───────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/messages', messageRoutes);

// ── Frontend Page Routes ─────────────────────────────────────
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend', 'index.html'));
});
app.get('/shop', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend', 'shop.html'));
});
app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend', 'login.html'));
});
app.get('/register', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend', 'register.html'));
});
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend', 'admin.html'));
});
app.get('/dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend', 'dashboard.html'));
});
app.get('/product/:id', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend', 'product.html'));
});

// ── 404 Handler ──────────────────────────────────────────────
app.use((req, res) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ message: 'API route not found' });
  }
  res.sendFile(path.join(__dirname, 'frontend', 'index.html'));
});

// ── Start Server ─────────────────────────────────────────────
const ADMIN_PORT = process.env.ADMIN_PORT || 5001;

app.listen(PORT, () => {
  console.log(`\n🪑  LuxeWood Furniture Shop — http://localhost:${PORT}`);
  console.log(`👤  User:  alfiya@user.com / alfiya123`);
  console.log(`🔑  Admin: alfiya@admin.com / alfiya123\n`);
});

// ── Setup Admin-Only App on Admin Port ───────────────────────
const adminApp = express();
adminApp.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Block user-side HTML pages.
adminApp.use((req, res, next) => {
    if (req.path.endsWith('.html')) {
        return res.redirect('/admin');
    }
    next();
});

// Provide access to static frontend files (js, css, images).
adminApp.use(express.static(path.join(__dirname, 'frontend'), { index: false }));

// Admin panel explicit route
adminApp.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend', 'admin.html'));
});

// Admin login explicitly allowed since localStorage is isolated
adminApp.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend', 'login.html'));
});

// 404/Blocker for user-side HTML routes, redirect everything else to /admin
adminApp.use((req, res) => {
  res.redirect('/admin');
});

// Admin panel on separate port (isolated localStorage = no session conflict)
adminApp.listen(ADMIN_PORT, () => {
  console.log(`⚙️   Admin Panel (separate session) → http://localhost:${ADMIN_PORT}/admin`);
  console.log(`    Open this in a new tab alongside the shop!\n`);
});
