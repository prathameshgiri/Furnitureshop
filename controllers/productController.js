// ============================================================
// controllers/productController.js
// ============================================================
const { products, uuidv4 } = require('../data/db');

// ── GET all products ─────────────────────────────────────────
const getProducts = (req, res) => {
    let result = [...products];
    const { category, minPrice, maxPrice, featured, search } = req.query;

    if (category && category !== 'All') {
        result = result.filter(p => p.category.toLowerCase() === category.toLowerCase());
    }
    if (minPrice) result = result.filter(p => p.price >= Number(minPrice));
    if (maxPrice) result = result.filter(p => p.price <= Number(maxPrice));
    if (featured === 'true') result = result.filter(p => p.featured);
    if (search) {
        const q = search.toLowerCase();
        result = result.filter(p =>
            p.name.toLowerCase().includes(q) ||
            p.category.toLowerCase().includes(q) ||
            p.description.toLowerCase().includes(q)
        );
    }

    res.json({ count: result.length, products: result });
};

// ── GET single product ───────────────────────────────────────
const getProduct = (req, res) => {
    const product = products.find(p => p.id === req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found.' });
    res.json(product);
};

// ── POST create product (admin) ──────────────────────────────
const createProduct = (req, res) => {
    const { name, category, price, originalPrice, description, image, stock, featured } = req.body;
    if (!name || !category || !price || !image)
        return res.status(400).json({ message: 'Name, category, price, and image are required.' });

    const newProduct = {
        id: uuidv4(),
        name,
        category,
        price: Number(price),
        originalPrice: Number(originalPrice) || Number(price),
        description: description || '',
        image,
        gallery: [image],
        rating: 0,
        reviews: 0,
        stock: Number(stock) || 0,
        featured: featured === true || featured === 'true',
        createdAt: new Date().toISOString()
    };
    products.push(newProduct);
    res.status(201).json({ message: 'Product created.', product: newProduct });
};

// ── PUT update product (admin) ───────────────────────────────
const updateProduct = (req, res) => {
    const idx = products.findIndex(p => p.id === req.params.id);
    if (idx === -1) return res.status(404).json({ message: 'Product not found.' });

    const updates = req.body;
    const allowedFields = ['name', 'category', 'price', 'originalPrice', 'description', 'image', 'stock', 'featured'];
    allowedFields.forEach(field => {
        if (updates[field] !== undefined) {
            if (['price', 'originalPrice', 'stock'].includes(field)) {
                products[idx][field] = Number(updates[field]);
            } else if (field === 'featured') {
                products[idx][field] = updates[field] === true || updates[field] === 'true';
            } else {
                products[idx][field] = updates[field];
            }
        }
    });
    if (updates.image) products[idx].gallery = [updates.image];

    res.json({ message: 'Product updated.', product: products[idx] });
};

// ── DELETE product (admin) ───────────────────────────────────
const deleteProduct = (req, res) => {
    const idx = products.findIndex(p => p.id === req.params.id);
    if (idx === -1) return res.status(404).json({ message: 'Product not found.' });
    products.splice(idx, 1);
    res.json({ message: 'Product deleted successfully.' });
};

module.exports = { getProducts, getProduct, createProduct, updateProduct, deleteProduct };
