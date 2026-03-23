# 🪑 LuxeWood — Premium Online Furniture Shop

> A modern, full-stack e-commerce web application for premium handcrafted furniture, built with Node.js, Express, and Vanilla JavaScript.

<br>

---

## 📋 Table of Contents

- [About the Project](#about-the-project)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Installation & Setup](#installation--setup)
- [How to Run](#how-to-run)
- [Demo Credentials](#demo-credentials)
- [Website URLs](#website-urls)
- [Pages Overview](#pages-overview)
- [API Endpoints](#api-endpoints)
- [Design & Development](#design--development)

---

## 🏠 About the Project

**LuxeWood** is a fully functional premium furniture e-commerce website with:
- A beautiful **user-facing storefront** for browsing and purchasing furniture
- A powerful **admin panel** for managing orders, users, products, and messages
- **Strict Port Isolation** (Port 5001) ensuring the admin environment is fully insulated from the user storefront
- **Role-based authentication** (JWT) separating user and admin access with robust fail-safes
- Indian Rupee (₹) pricing throughout
- Product reviews with reviewer photos
- Order placement and order tracking for users

---

## ✨ Features

### � User Features
- Browse all furniture products with filters (category, price range, sort)
- Search products by name
- Add to cart with quantity controls
- Cart sidebar with ₹ subtotal
- Login required before checkout
- Place orders (UPI payment)
- View order history and track order status in dashboard
- Product detail page with gallery, reviews, and related products

### 🔑 Admin Features
- Admin dashboard with stats (total products, orders, users, revenue)
- View and manage all orders (update status: pending → shipped → delivered)
- View all registered users
- View all contact messages
- Responsive admin panel with sidebar navigation
- **Secure Architecture:** Admin panel securely runs on a separate port with strict HTML request blocking to prevent user-site crossover and infinite redirect loops.

### 🎨 Design Features
- Luxury earth-tone color palette (wood brown, beige, charcoal)
- Glassmorphism cards
- Smooth scroll + reveal animations (IntersectionObserver)
- Lazy loading for images and product cards
- Micro-interactions (hover tilt, shadow depth)
- Staggered mobile nav animations
- Fully responsive (mobile-first)
- Premium frosted-glass mobile navbar

---

## 🛠 Tech Stack

| Layer        | Technology                        |
|-------------|-----------------------------------|
| **Frontend** | HTML5, CSS3, Vanilla JavaScript   |
| **Backend**  | Node.js, Express.js               |
| **Database** | In-memory JSON (demo, no setup needed) |
| **Auth**     | JWT (JSON Web Tokens)             |
| **Passwords**| bcryptjs                          |
| **Fonts**    | Google Fonts (Cormorant, Inter)   |
| **Images**   | Unsplash (CDN), randomuser.me     |

---

## 📁 Project Structure

```
Online Furniture shop/
│
├── server.js              # Main Express server (runs on port 5000 + 5001)
├── package.json
├── .env                   # Environment variables
│
├── data/
│   └── db.js              # In-memory database (users, products, orders)
│
├── routes/
│   ├── auth.js            # Login, Register, Me
│   ├── products.js        # Product CRUD
│   ├── orders.js          # Order placement and management
│   └── messages.js        # Contact form messages
│
├── controllers/
│   ├── authController.js
│   ├── productController.js
│   ├── orderController.js
│   └── messageController.js
│
├── middleware/
│   └── auth.js            # JWT verify + adminOnly guard
│
└── frontend/
    ├── index.html         # Home page
    ├── shop.html          # Shop / product listing
    ├── product.html       # Product detail page
    ├── login.html         # Login page
    ├── register.html      # Register page
    ├── dashboard.html     # User dashboard (My Orders)
    ├── admin.html         # Admin panel
    │
    ├── css/
    │   ├── style.css      # Global styles, navbar, cards, cart
    │   ├── home.css       # Homepage-specific styles
    │   ├── shop.css       # Shop filters, grid
    │   ├── product.css    # Product detail + reviews
    │   ├── auth.css       # Login / Register pages
    │   ├── dashboard.css  # User dashboard
    │   └── admin.css      # Admin panel
    │
    └── js/
        ├── app.js         # Shared utilities (Auth, Cart, apiFetch, Toast)
        ├── home.js        # Homepage animations, featured products
        ├── shop.js        # Filters, product grid, checkout
        ├── product.js     # Product detail, reviews
        ├── auth.js        # Login/logout redirect guards
        ├── dashboard.js   # User order history
        └── admin.js       # Admin panel logic
```

---

## ⚙️ Prerequisites

Make sure you have the following installed:

- **Node.js** v16+ → [Download](https://nodejs.org/)
- **npm** v8+ (comes with Node.js)
- A modern browser (Chrome, Firefox, Edge)

---

## 📦 Installation & Setup

### Step 1 — Clone or Download the Project

```bash
# If using git
git clone <repository-url>

# Or just unzip the downloaded folder
```

### Step 2 — Navigate to the Project Directory

```bash
cd "Online Furniture shop"
```

### Step 3 — Install Dependencies

```bash
npm install
```

This installs: `express`, `cors`, `dotenv`, `bcryptjs`, `jsonwebtoken`, `uuid`

### Step 4 — Environment Setup

The project includes a `.env` file. If it's missing, create one:

```env
PORT=5000
ADMIN_PORT=5001
JWT_SECRET=luxewood_super_secret_key_2026
```

---

## 🚀 How to Run

### Start the Server

```bash
node server.js
```

Or if you have nodemon installed (auto-restarts on changes):

```bash
npx nodemon server.js
```

### Expected Output

```
[dotenv] injecting env...

🪑  LuxeWood Furniture Shop — http://localhost:5000
👤  User:  alfiya@user.com / alfiya123
🔑  Admin: alfiya@admin.com / alfiya123

⚙️   Admin Panel (separate session) → http://localhost:5001/admin
    Open this in a new tab alongside the shop!
```

### Open in Browser

| Purpose      | URL                                   |
|-------------|---------------------------------------|
| User Shop   | http://localhost:5000                 |
| Admin Panel | http://localhost:5001/admin           |

> **Pro Tip:** Open both in separate browser tabs. Since they run on different ports, they have **completely isolated sessions** — you can be logged in as a user AND admin simultaneously! The Admin server (Port 5001) is strictly guarded and explicitly blocks all user-facing HTML files.

---

## 🔐 Demo Credentials

### 👤 Regular User
| Field    | Value               |
|----------|---------------------|
| Email    | `alfiya@user.com`   |
| Password | `alfiya123`         |
| Access   | Shop, Cart, Orders, Dashboard |

### 🔑 Admin
| Field    | Value               |
|----------|---------------------|
| Email    | `alfiya@admin.com`  |
| Password | `alfiya123`         |
| Access   | Admin Panel, All Orders, All Users, Messages |

> **Note:** Admin login at `http://localhost:5001/admin` → logs into **admin session**
> User login at `http://localhost:5000/login` → logs into **user session**
> Both can be active at the same time in separate tabs!

---

## 🌐 Website URLs

### User-Facing (Port 5000)

| Page              | URL                                     |
|------------------|-----------------------------------------|
| Home             | http://localhost:5000/                  |
| Shop             | http://localhost:5000/shop              |
| Product Detail   | http://localhost:5000/product/:id       |
| Login            | http://localhost:5000/login             |
| Register         | http://localhost:5000/register          |
| My Dashboard     | http://localhost:5000/dashboard         |

### Admin (Port 5001)

| Page             | URL                                     |
|-----------------|-----------------------------------------|
| Admin Panel     | http://localhost:5001/admin             |
| Admin Login     | http://localhost:5001/login             |

---

## 📄 Pages Overview

### 🏠 Home Page (`/`)
- Animated hero section with headline
- Scrolling marquee strip (shipping info, warranty)
- Shop by Category grid (Sofas, Chairs, Tables, Beds)
- Featured Products section (lazy-loaded)
- Brand Story section
- Customer Testimonials (with real photos)
- Contact / Message form
- Full footer with navigation

### 🛋 Shop Page (`/shop`)
- Filter sidebar:
  - Category (All, Sofa, Chair, Table, Bed)
  - Price Range slider (₹0 – ₹2,00,000)
  - Sort (Featured, Price Low→High, Price High→Low, Top Rated)
- Search bar
- Grid / List view toggle
- Product cards with lazy-loaded images

### 📦 Product Detail Page (`/product/:id`)
- Image gallery with thumbnails
- Product info (name, category, rating, stock, price, discount)
- Quantity selector
- Add to Cart / Buy Now
- Guarantee badges (Free Shipping ₹15,000+, 30-Day Returns, 5-Year Warranty)
- Customer Reviews section:
  - Overall rating summary with star distribution bars
  - Individual review cards with reviewer photo, rating, date, comment

### 🔐 Login Page (`/login`)
- Email + password form
- Demo credentials hint (User & Admin)
- Redirect guard (already logged-in users are sent to their dashboard)

### 👤 Dashboard Page (`/dashboard`)
- User profile card
- My Orders list with order cards:
  - Order ID, date, status badge (Pending / Shipped / Delivered)
  - Product thumbnails, item count, total ₹ amount
  - Order tracking timeline

### ⚙️ Admin Panel (`/admin`)
- Dashboard overview stats
- Orders management (view all, update status)
- Users management (view all registered users)
- Messages (contact form submissions)
- Responsive sidebar with mobile drawer

---

## 🔌 API Endpoints

### Auth Routes (`/api/auth`)
| Method | Endpoint           | Description          | Auth Required |
|--------|-------------------|----------------------|---------------|
| POST   | `/api/auth/login`   | Login user           | ❌            |
| POST   | `/api/auth/register`| Register new user    | ❌            |
| GET    | `/api/auth/me`      | Get current user     | ✅ Token       |

### Product Routes (`/api/products`)
| Method | Endpoint              | Description           | Auth Required |
|--------|-----------------------|-----------------------|---------------|
| GET    | `/api/products`       | Get all products      | ❌            |
| GET    | `/api/products/:id`   | Get product by ID     | ❌            |

### Order Routes (`/api/orders`)
| Method | Endpoint                    | Description            | Auth Required |
|--------|-----------------------------|------------------------|---------------|
| POST   | `/api/orders`               | Place a new order      | ✅ User Token  |
| GET    | `/api/orders/my`            | Get my orders          | ✅ User Token  |
| GET    | `/api/orders/all`           | Get all orders         | ✅ Admin Token |
| PUT    | `/api/orders/:id/status`    | Update order status    | ✅ Admin Token |

### Message Routes (`/api/messages`)
| Method | Endpoint           | Description          | Auth Required |
|--------|-------------------|----------------------|---------------|
| POST   | `/api/messages`    | Submit contact form  | ❌            |
| GET    | `/api/messages`    | Get all messages     | ✅ Admin Token |

---

## 🎨 Design & Development

### Design Philosophy
- **Luxury, Minimal** — Earth-tone palette (wood brown #8B5E3C, beige, charcoal)
- **Premium Feel** — Glassmorphism cards, frosted-glass navbar, smooth animations
- **Mobile-First** — Fully responsive, touch-friendly mobile navigation
- **Performance** — Lazy loading for all images and product cards
- **Accessibility** — Semantic HTML5, ARIA labels, keyboard navigable

### Color Palette
| Name      | Hex        | Usage                    |
|-----------|-----------|--------------------------|
| Brown     | `#8B5E3C` | Primary accent, buttons  |
| Brown Light | `#c4956a` | Hover states, highlights |
| Charcoal  | `#2c2c2c` | Headings, text           |
| Beige     | `#f0e9df` | Backgrounds, cards       |
| Cream     | `#fdfaf6` | Page backgrounds         |
| Sand      | `#d4b896` | Muted elements           |

### Fonts
- **Cormorant Garamond** — Headings, product names (serif, luxury feel)
- **Inter** — Body text, UI elements (clean, modern sans-serif)

---

## 👨‍💻 Developed By

<div align="center">

### Prathamesh Giri

**Full-Stack Developer**

🌐 [prathameshgiri.in](https://prathameshgiri.in/)

*Built with dedication for Alfiya Ekambe’s College Project*

---

**Project:** LuxeWood — Premium Online Furniture Shop
**Year:** 2026
**Stack:** Node.js · Express · Vanilla JS · HTML5 · CSS3

</div>

---

## 📝 License

This project was created as a college project and is for educational purposes.

---

<div align="center">
  <strong>LuxeWood</strong> — Where Every Room Tells a Story 🪑
</div>
