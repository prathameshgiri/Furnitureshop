// ============================================================
// controllers/orderController.js
// ============================================================
const { orders, products, uuidv4 } = require('../data/db');

// ── Place Order ──────────────────────────────────────────────
const placeOrder = (req, res) => {
    const { items, shippingAddress, paymentMethod } = req.body;
    if (!items || !Array.isArray(items) || items.length === 0)
        return res.status(400).json({ message: 'No items in order.' });

    let total = 0;
    const orderItems = items.map(item => {
        const product = products.find(p => p.id === item.productId);
        if (!product) return null;
        const subtotal = product.price * item.quantity;
        total += subtotal;
        return {
            productId: product.id,
            name: product.name,
            price: product.price,
            quantity: item.quantity,
            image: product.image,
            subtotal
        };
    }).filter(Boolean);

    if (orderItems.length === 0)
        return res.status(400).json({ message: 'No valid products found.' });

    const newOrder = {
        id: uuidv4(),
        userId: req.user.id,
        userName: req.user.name,
        userEmail: req.user.email,
        items: orderItems,
        total: total + 49, // $49 shipping
        shippingFee: 49,
        shippingAddress: shippingAddress || 'Not provided',
        paymentMethod: paymentMethod || 'Credit Card',
        status: 'pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };

    orders.push(newOrder);
    res.status(201).json({ message: 'Order placed successfully!', order: newOrder });
};

// ── Get User Orders ──────────────────────────────────────────
const getUserOrders = (req, res) => {
    const userOrders = orders.filter(o => o.userId === req.user.id);
    res.json(userOrders);
};

// ── Get All Orders (Admin) ───────────────────────────────────
const getAllOrders = (req, res) => {
    res.json(orders);
};

// ── Update Order Status (Admin) ──────────────────────────────
const updateOrderStatus = (req, res) => {
    const idx = orders.findIndex(o => o.id === req.params.id);
    if (idx === -1) return res.status(404).json({ message: 'Order not found.' });

    const { status } = req.body;
    const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status))
        return res.status(400).json({ message: 'Invalid status.' });

    orders[idx].status = status;
    orders[idx].updatedAt = new Date().toISOString();
    res.json({ message: 'Order updated.', order: orders[idx] });
};

module.exports = { placeOrder, getUserOrders, getAllOrders, updateOrderStatus };
