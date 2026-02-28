// ============================================================
// data/db.js - JSON-based In-Memory Database (INR Prices)
// ============================================================
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');

// ── User Store ───────────────────────────────────────────────
const users = [
    {
        id: 'admin-001',
        name: 'Alfiya Admin',
        email: 'alfiya@admin.com',
        password: bcrypt.hashSync('alfiya123', 10),
        role: 'admin',
        phone: '+91 98765 00001',
        createdAt: new Date().toISOString()
    },
    {
        id: 'user-001',
        name: 'Alfiya Ekambe',
        email: 'alfiya@user.com',
        password: bcrypt.hashSync('alfiya123', 10),
        role: 'user',
        phone: '+91 98765 00002',
        createdAt: new Date().toISOString()
    }
];

// ── Reviewer Photos (reusable pool) ──────────────────────────
const reviewerPhotos = [
    'https://randomuser.me/api/portraits/women/44.jpg',
    'https://randomuser.me/api/portraits/men/32.jpg',
    'https://randomuser.me/api/portraits/women/68.jpg',
    'https://randomuser.me/api/portraits/men/75.jpg',
    'https://randomuser.me/api/portraits/women/12.jpg',
    'https://randomuser.me/api/portraits/men/54.jpg',
    'https://randomuser.me/api/portraits/women/28.jpg',
    'https://randomuser.me/api/portraits/men/91.jpg'
];

// ── Product Store (Prices in INR ₹) ──────────────────────────
const products = [
    {
        id: 'prod-001',
        name: 'Luxe Velvet Sofa',
        category: 'Sofa',
        price: 108000,
        originalPrice: 132000,
        description: 'Sink into pure luxury with this hand-crafted velvet sofa. Features premium hardwood frame, high-density foam cushions, and genuine velvet upholstery in rich charcoal.',
        image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&q=80',
        gallery: [
            'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&q=80',
            'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=800&q=80',
            'https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?w=800&q=80'
        ],
        rating: 4.8,
        reviews: 124,
        reviewList: [
            { name: 'Priya Sharma', photo: reviewerPhotos[0], rating: 5, date: '15 Jan 2025', comment: 'Absolutely stunning sofa! The velvet texture is incredibly soft and the color is even more beautiful in person. Delivery was smooth and assembly was easy.', productImg: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&q=80' },
            { name: 'Arjun Mehta', photo: reviewerPhotos[1], rating: 5, date: '02 Feb 2025', comment: 'Worth every rupee. The quality is exceptional — solid frame, dense cushions, and the charcoal velvet matches my living room perfectly.', productImg: null },
            { name: 'Sneha Kulkarni', photo: reviewerPhotos[2], rating: 4, date: '18 Feb 2025', comment: 'Very premium feel. Took a week to deliver but the packaging was excellent. Slight crease on one armrest but it smoothed out.', productImg: 'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=400&q=80' }
        ],
        stock: 15,
        featured: true,
        createdAt: new Date().toISOString()
    },
    {
        id: 'prod-002',
        name: 'Nordic Oak Dining Table',
        category: 'Table',
        price: 70500,
        originalPrice: 91200,
        description: 'Solid oak dining table with a minimalist Nordic design. Seats 6 comfortably. Each piece is unique with natural grain variations.',
        image: 'https://images.unsplash.com/photo-1549497538-303791108f95?w=800&q=80',
        gallery: [
            'https://images.unsplash.com/photo-1549497538-303791108f95?w=800&q=80',
            'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=800&q=80'
        ],
        rating: 4.6,
        reviews: 87,
        reviewList: [
            { name: 'Rahul Verma', photo: reviewerPhotos[3], rating: 5, date: '10 Dec 2024', comment: 'Gorgeous table. The oak grain looks premium and it is extremely sturdy. All 6 of us can eat comfortably. 10/10 recommend.', productImg: 'https://images.unsplash.com/photo-1549497538-303791108f95?w=400&q=80' },
            { name: 'Kavita Desai', photo: reviewerPhotos[4], rating: 4, date: '22 Jan 2025', comment: 'Beautiful minimalist design. The natural wood grain varies which makes it feel unique. Slight delay in delivery but product quality is great.', productImg: null }
        ],
        stock: 8,
        featured: true,
        createdAt: new Date().toISOString()
    },
    {
        id: 'prod-003',
        name: 'Wabi-Sabi Lounge Chair',
        category: 'Chair',
        price: 49700,
        originalPrice: 62200,
        description: 'Inspired by Japanese wabi-sabi philosophy. Curved rattan base with full-grain leather cushion. Perfect statement piece for any living room.',
        image: 'https://images.unsplash.com/photo-1592078615290-033ee584e267?w=800&q=80',
        gallery: [
            'https://images.unsplash.com/photo-1592078615290-033ee584e267?w=800&q=80',
            'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=800&q=80'
        ],
        rating: 4.9,
        reviews: 203,
        reviewList: [
            { name: 'Meera Iyer', photo: reviewerPhotos[6], rating: 5, date: '05 Jan 2025', comment: 'This chair is a work of art. The rattan base is sturdy and the leather cushion is buttery smooth. My guests always compliment it.', productImg: 'https://images.unsplash.com/photo-1592078615290-033ee584e267?w=400&q=80' },
            { name: 'Vikram Singh', photo: reviewerPhotos[7], rating: 5, date: '19 Jan 2025', comment: 'Best purchase I have made this year. The Japanese design philosophy really shines through - simple, elegant, and incredibly comfortable.', productImg: null },
            { name: 'Ananya Nair', photo: reviewerPhotos[0], rating: 5, date: '01 Feb 2025', comment: 'Perfect statement piece! The curved rattan base is so unique. Highly recommend for anyone wanting a premium accent chair.', productImg: 'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=400&q=80' }
        ],
        stock: 20,
        featured: true,
        createdAt: new Date().toISOString()
    },
    {
        id: 'prod-004',
        name: 'Zen Platform Bed Frame',
        category: 'Bed',
        price: 124500,
        originalPrice: 157700,
        description: 'Low-profile platform bed with walnut veneer finish. No box spring needed. Integrated under-bed storage drawers. Available in Queen and King.',
        image: 'https://images.unsplash.com/photo-1505693314120-0d443867891c?w=800&q=80',
        gallery: [
            'https://images.unsplash.com/photo-1505693314120-0d443867891c?w=800&q=80',
            'https://images.unsplash.com/photo-1540518614846-7eded433c457?w=800&q=80'
        ],
        rating: 4.7,
        reviews: 156,
        reviewList: [
            { name: 'Deepika Rao', photo: reviewerPhotos[2], rating: 5, date: '08 Jan 2025', comment: 'The walnut veneer finish is absolutely beautiful. The storage drawers are a bonus! Sleeping on this feels incredibly premium.', productImg: 'https://images.unsplash.com/photo-1505693314120-0d443867891c?w=400&q=80' },
            { name: 'Suresh Patel', photo: reviewerPhotos[5], rating: 4, date: '29 Jan 2025', comment: 'Great quality bed. Low profile looks very modern. Assembly instructions could be clearer, took about 2 hours, but worth it.', productImg: null }
        ],
        stock: 10,
        featured: true,
        createdAt: new Date().toISOString()
    },
    {
        id: 'prod-005',
        name: 'Marble & Brass Coffee Table',
        category: 'Table',
        price: 56400,
        originalPrice: 74700,
        description: 'Genuine white Carrara marble top with aged brass legs. A statement centerpiece that elevates any living space.',
        image: 'https://images.unsplash.com/photo-1567016432779-094069958ea5?w=800&q=80',
        gallery: [
            'https://images.unsplash.com/photo-1567016432779-094069958ea5?w=800&q=80',
            'https://images.unsplash.com/photo-1533090481720-856c6e3c1fdc?w=800&q=80'
        ],
        rating: 4.5,
        reviews: 68,
        reviewList: [
            { name: 'Ritu Joshi', photo: reviewerPhotos[4], rating: 5, date: '12 Feb 2025', comment: 'The marble is real and the brass legs are solid. Looks even better in real life than the photos. A true luxury centerpiece.', productImg: 'https://images.unsplash.com/photo-1567016432779-094069958ea5?w=400&q=80' },
            { name: 'Aditya Kumar', photo: reviewerPhotos[1], rating: 4, date: '25 Feb 2025', comment: 'Beautiful table but marble requires careful maintenance. The brass legs have a premium aged look. Very happy with the purchase.', productImg: null }
        ],
        stock: 12,
        featured: false,
        createdAt: new Date().toISOString()
    },
    {
        id: 'prod-006',
        name: 'Cloud Sectional Sofa',
        category: 'Sofa',
        price: 190900,
        originalPrice: 240700,
        description: 'Ultra-plush modular sectional with down-feather blend cushions. Fully configurable L-shape or U-shape. Stain-resistant performance fabric.',
        image: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&q=80',
        gallery: [
            'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&q=80',
            'https://images.unsplash.com/photo-1484101403633-562f891dc89a?w=800&q=80'
        ],
        rating: 4.9,
        reviews: 312,
        reviewList: [
            { name: 'Nisha Bose', photo: reviewerPhotos[6], rating: 5, date: '03 Jan 2025', comment: 'This sectional is INCREDIBLE. The down-feather cushions feel like sitting on clouds. The stain-resistant fabric is a lifesaver with kids!', productImg: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=400&q=80' },
            { name: 'Rohit Agarwal', photo: reviewerPhotos[3], rating: 5, date: '20 Jan 2025', comment: 'Best sofa I have ever owned. The modular design is so versatile. Changed it from L-shape to U-shape in minutes. Absolutely love it.', productImg: null },
            { name: 'Sunita Reddy', photo: reviewerPhotos[0], rating: 5, date: '10 Feb 2025', comment: 'Splurged on this and zero regrets. The quality justifies every rupee. Our family room looks like a luxury hotel lounge now!', productImg: 'https://images.unsplash.com/photo-1484101403633-562f891dc89a?w=400&q=80' }
        ],
        stock: 5,
        featured: false,
        createdAt: new Date().toISOString()
    },
    {
        id: 'prod-007',
        name: 'Artisan Accent Chair',
        category: 'Chair',
        price: 37300,
        originalPrice: 49800,
        description: 'Hand-woven fabric accent chair with solid beechwood legs. A versatile piece that complements both modern and classic interiors.',
        image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&q=80',
        gallery: [
            'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&q=80',
            'https://images.unsplash.com/photo-1571508601891-ca5e7a713859?w=800&q=80'
        ],
        rating: 4.4,
        reviews: 89,
        reviewList: [
            { name: 'Pooja Banerjee', photo: reviewerPhotos[2], rating: 4, date: '07 Feb 2025', comment: 'Great value for money! The hand-woven texture is unique and the beechwood legs are very sturdy. Looks great in my reading corner.', productImg: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&q=80' },
            { name: 'Karthik Menon', photo: reviewerPhotos[7], rating: 5, date: '14 Feb 2025', comment: 'Excellent quality for the price. The weave pattern is intricate and the chair is very comfortable. Fast delivery too!', productImg: null }
        ],
        stock: 25,
        featured: false,
        createdAt: new Date().toISOString()
    },
    {
        id: 'prod-008',
        name: 'Walnut King Bed',
        category: 'Bed',
        price: 157700,
        originalPrice: 199300,
        description: 'Solid American black walnut king bed with upholstered headboard. The epitome of bedroom luxury — engineered for a lifetime of comfort.',
        image: 'https://images.unsplash.com/photo-1560448205-4d9b3e6bb6db?w=800&q=80',
        gallery: [
            'https://images.unsplash.com/photo-1560448205-4d9b3e6bb6db?w=800&q=80',
            'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800&q=80'
        ],
        rating: 4.8,
        reviews: 178,
        reviewList: [
            { name: 'Lalitha Krishnan', photo: reviewerPhotos[4], rating: 5, date: '11 Jan 2025', comment: 'This bed is breathtaking! The walnut wood is so rich in colour and the upholstered headboard is perfect for reading in bed. Worth every paisa!', productImg: 'https://images.unsplash.com/photo-1560448205-4d9b3e6bb6db?w=400&q=80' },
            { name: 'Manish Gupta', photo: reviewerPhotos[5], rating: 5, date: '27 Jan 2025', comment: 'Premium quality king bed. The black walnut finish is stunning. Assembly took 3 hours but the end result is absolutely magnificent.', productImg: null }
        ],
        stock: 7,
        featured: false,
        createdAt: new Date().toISOString()
    },
    {
        id: 'prod-009',
        name: 'Reclaimed Wood Console',
        category: 'Table',
        price: 41500,
        originalPrice: 53900,
        description: 'Sustainably sourced reclaimed pine wood console table. Industrial iron pipe legs with matte black finish. Each piece tells a unique story.',
        image: 'https://images.unsplash.com/photo-1600210492493-0946911123ea?w=800&q=80',
        gallery: [
            'https://images.unsplash.com/photo-1600210492493-0946911123ea?w=800&q=80',
            'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&q=80'
        ],
        rating: 4.6,
        reviews: 54,
        reviewList: [
            { name: 'Tanya Shah', photo: reviewerPhotos[6], rating: 4, date: '03 Feb 2025', comment: 'Love the rustic, industrial look. The reclaimed wood has a beautiful character with its natural markings. Makes my hallway look amazing.', productImg: 'https://images.unsplash.com/photo-1600210492493-0946911123ea?w=400&q=80' },
            { name: 'Sanjay Mishra', photo: reviewerPhotos[1], rating: 5, date: '17 Feb 2025', comment: 'Unique piece! No two are exactly alike which is what I love. The iron pipe legs are rock solid. Very happy with this purchase.', productImg: null }
        ],
        stock: 18,
        featured: false,
        createdAt: new Date().toISOString()
    },
    {
        id: 'prod-010',
        name: 'Bouclé Reading Chair',
        category: 'Chair',
        price: 60600,
        originalPrice: 78800,
        description: "Sink into the perfect reading nook with this enveloping bouclé fabric armchair. Includes matching ottoman. The coziest chair you'll ever own.",
        image: 'https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=800&q=80',
        gallery: [
            'https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=800&q=80',
            'https://images.unsplash.com/photo-1592078615290-033ee584e267?w=800&q=80'
        ],
        rating: 4.7,
        reviews: 142,
        reviewList: [
            { name: 'Divya Pillai', photo: reviewerPhotos[0], rating: 5, date: '09 Jan 2025', comment: 'This is my absolute favourite piece of furniture! The bouclé texture is so cozy and the ottoman makes it perfect for long reading sessions.', productImg: 'https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=400&q=80' },
            { name: 'Prathamesh Giri', photo: 'https://prathameshgiri.in/assets/hero.img.jpeg', rating: 5, date: '20 Jan 2025', comment: 'This chair is a complete vibe! I code for hours and still feel comfortable. The bouclé fabric is premium and the ottoman is a game changer. Highly recommend to every developer!', productImg: null },
            { name: 'Asha Nambiar', photo: reviewerPhotos[2], rating: 4, date: '05 Feb 2025', comment: 'Beautiful chair, very comfortable. The bouclé fabric attracts some pet hair but a lint roller fixes that. Overall very satisfied!', productImg: 'https://images.unsplash.com/photo-1592078615290-033ee584e267?w=400&q=80' }
        ],
        stock: 14,
        featured: false,
        createdAt: new Date().toISOString()
    }
];

// ── Order Store ──────────────────────────────────────────────
const orders = [];

// ── Messages Store ───────────────────────────────────────────
const messages = [];

// ── Cart Store ───────────────────────────────────────────────
const carts = {};

module.exports = { users, products, orders, messages, carts, uuidv4 };
