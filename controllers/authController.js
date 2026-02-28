// ============================================================
// controllers/authController.js
// ============================================================
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { users, uuidv4 } = require('../data/db');

// ── Register ─────────────────────────────────────────────────
const register = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        if (!name || !email || !password)
            return res.status(400).json({ message: 'All fields are required.' });

        if (users.find(u => u.email === email))
            return res.status(400).json({ message: 'Email already registered.' });

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = {
            id: uuidv4(),
            name,
            email,
            password: hashedPassword,
            role: 'user',
            phone: '',
            address: '',
            createdAt: new Date().toISOString()
        };
        users.push(newUser);

        const token = jwt.sign(
            { id: newUser.id, email: newUser.email, name: newUser.name, role: newUser.role },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.status(201).json({
            message: 'Registration successful!',
            token,
            user: { id: newUser.id, name: newUser.name, email: newUser.email, role: newUser.role }
        });
    } catch (err) {
        res.status(500).json({ message: 'Server error.', error: err.message });
    }
};

// ── Login ─────────────────────────────────────────────────────
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password)
            return res.status(400).json({ message: 'Email and password are required.' });

        const user = users.find(u => u.email === email);
        if (!user) return res.status(401).json({ message: 'Invalid credentials.' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(401).json({ message: 'Invalid credentials.' });

        const token = jwt.sign(
            { id: user.id, email: user.email, name: user.name, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.json({
            message: 'Login successful!',
            token,
            user: { id: user.id, name: user.name, email: user.email, role: user.role }
        });
    } catch (err) {
        res.status(500).json({ message: 'Server error.', error: err.message });
    }
};

// ── Get Profile ──────────────────────────────────────────────
const getProfile = (req, res) => {
    const user = users.find(u => u.id === req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found.' });
    const { password, ...safe } = user;
    res.json(safe);
};

// ── Update Profile ───────────────────────────────────────────
const updateProfile = async (req, res) => {
    const idx = users.findIndex(u => u.id === req.user.id);
    if (idx === -1) return res.status(404).json({ message: 'User not found.' });

    const { name, phone, address } = req.body;
    if (name) users[idx].name = name;
    if (phone !== undefined) users[idx].phone = phone;
    if (address !== undefined) users[idx].address = address;

    const { password, ...safe } = users[idx];
    res.json({ message: 'Profile updated.', user: safe });
};

// ── Get All Users (Admin) ────────────────────────────────────
const getAllUsers = (req, res) => {
    const safeUsers = users.map(({ password, ...u }) => u);
    res.json(safeUsers);
};

module.exports = { register, login, getProfile, updateProfile, getAllUsers };
