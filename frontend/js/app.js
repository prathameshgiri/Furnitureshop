/* ============================================================
   js/app.js — Shared Utilities & Global Logic
   ============================================================ */

const API = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') ? 'http://localhost:5000/api' : '/api';

// ── Auth Helpers ─────────────────────────────────────────────
const Auth = {
    getToken: () => localStorage.getItem('fs_token'),
    getUser: () => JSON.parse(localStorage.getItem('fs_user') || 'null'),
    setSession: (token, user) => {
        localStorage.setItem('fs_token', token);
        localStorage.setItem('fs_user', JSON.stringify(user));
    },
    clearSession: () => {
        localStorage.removeItem('fs_token');
        localStorage.removeItem('fs_user');
    },
    isLoggedIn: () => !!localStorage.getItem('fs_token'),
    isAdmin: () => {
        const u = Auth.getUser();
        return u && u.role === 'admin';
    },
    headers: () => ({
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${Auth.getToken()}`
    })
};

// ── API Fetch Wrapper ────────────────────────────────────────
async function apiFetch(endpoint, options = {}) {
    try {
        const { headers: extraHeaders = {}, ...restOptions } = options;
        const res = await fetch(`${API}${endpoint}`, {
            headers: {
                'Content-Type': 'application/json',
                ...extraHeaders
            },
            ...restOptions
        });
        const data = await res.json();
        if (!res.ok) {
            if (res.status === 401 || res.status === 403) {
                if (data.message === 'Invalid or expired token.' || data.message === 'Access denied. No token provided.') {
                    Auth.clearSession();
                    Cart.clear();
                    window.location.href = '/login';
                }
            }
            throw new Error(data.message || 'Request failed');
        }
        return data;
    } catch (err) {
        throw err;
    }
}

// ── Cart ─────────────────────────────────────────────────────
const Cart = {
    get: () => JSON.parse(localStorage.getItem('fs_cart') || '[]'),
    save: (cart) => {
        localStorage.setItem('fs_cart', JSON.stringify(cart));
        Cart.updateBadge();
        Cart.renderSidebar();
    },
    add: (product, qty = 1) => {
        const cart = Cart.get();
        const idx = cart.findIndex(i => i.id === product.id);
        if (idx >= 0) {
            cart[idx].quantity += qty;
        } else {
            cart.push({ id: product.id, name: product.name, price: product.price, image: product.image, quantity: qty });
        }
        Cart.save(cart);
        showToast(`✓ "${product.name}" added to cart`, 'success');
    },
    remove: (id) => {
        const cart = Cart.get().filter(i => i.id !== id);
        Cart.save(cart);
    },
    updateQty: (id, qty) => {
        const cart = Cart.get();
        const idx = cart.findIndex(i => i.id === id);
        if (idx >= 0) {
            if (qty <= 0) { cart.splice(idx, 1); } else { cart[idx].quantity = qty; }
        }
        Cart.save(cart);
    },
    total: () => Cart.get().reduce((sum, i) => sum + i.price * i.quantity, 0),
    count: () => Cart.get().reduce((sum, i) => sum + i.quantity, 0),
    clear: () => { localStorage.removeItem('fs_cart'); Cart.updateBadge(); Cart.renderSidebar(); },
    updateBadge: () => {
        const badge = document.getElementById('cart-badge');
        const count = Cart.count();
        if (badge) {
            badge.textContent = count;
            badge.style.display = count > 0 ? 'flex' : 'none';
        }
    },
    renderSidebar: () => {
        const container = document.getElementById('cart-items');
        const subtotalEl = document.getElementById('cart-subtotal-amount');
        if (!container) return;
        const cart = Cart.get();
        if (cart.length === 0) {
            container.innerHTML = `<div class="cart-empty"><i>🛒</i><p>Your cart is empty</p><a href="/shop" class="btn btn-outline btn-sm mt-md">Shop Now</a></div>`;
        } else {
            container.innerHTML = cart.map(item => `
        <div class="cart-item">
          <img src="${item.image}" alt="${item.name}" class="cart-item-img" loading="lazy">
          <div class="cart-item-info">
            <div class="cart-item-name">${item.name}</div>
            <div class="cart-item-price">${fmt(item.price)}</div>
            <div class="cart-item-qty">
              <button class="qty-btn" onclick="Cart.updateQty('${item.id}', ${item.quantity - 1})">−</button>
              <span class="qty-num">${item.quantity}</span>
              <button class="qty-btn" onclick="Cart.updateQty('${item.id}', ${item.quantity + 1})">+</button>
            </div>
          </div>
          <button class="cart-remove" onclick="Cart.remove('${item.id}')" title="Remove">✕</button>
        </div>
      `).join('');
        }
        if (subtotalEl) subtotalEl.textContent = fmt(Cart.total());
    }
};

// ── Toast Notifications ──────────────────────────────────────
function showToast(message, type = 'default', duration = 3200) {
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        document.body.appendChild(container);
    }
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `<span>${message}</span>`;
    container.appendChild(toast);
    setTimeout(() => {
        toast.classList.add('out');
        toast.addEventListener('animationend', () => toast.remove());
    }, duration);
}

// ── Page Loader ──────────────────────────────────────────────
function hidePageLoader() {
    const loader = document.getElementById('page-loader');
    if (loader) {
        loader.classList.add('hidden');
        setTimeout(() => loader.remove(), 600);
    }
}

// ── Intersection Observer — Reveal ───────────────────────────
function initReveal() {
    const revealEls = document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry, i) => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });
    revealEls.forEach(el => observer.observe(el));
}

// ── Lazy Image Loading ───────────────────────────────────────
function initLazyImages() {
    const imgs = document.querySelectorAll('img[data-src]');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.onload = () => img.classList.add('loaded');
                img.onerror = () => { img.src = 'https://placehold.co/400x300/e8dece/8B5E3C?text=Furniture'; img.classList.add('loaded'); };
                observer.unobserve(img);
            }
        });
    }, { threshold: 0.1, rootMargin: '200px' });
    imgs.forEach(img => observer.observe(img));
}

// ── Navbar ───────────────────────────────────────────────────
function initNavbar() {
    const navbar = document.getElementById('navbar');
    if (!navbar) return;

    // Scroll effect
    const onScroll = () => {
        if (window.scrollY > 20) navbar.classList.add('scrolled');
        else navbar.classList.remove('scrolled');
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    // Hamburger / mobile nav
    const hamburger = document.getElementById('hamburger');
    const mobileNav = document.getElementById('mobile-nav');
    const backdrop = document.getElementById('mobile-nav-backdrop');
    if (hamburger && mobileNav) {
        const closeMobileNav = () => {
            hamburger.classList.remove('open');
            mobileNav.classList.remove('open');
            if (backdrop) backdrop.classList.remove('open');
        };
        hamburger.addEventListener('click', () => {
            const isOpen = mobileNav.classList.contains('open');
            if (isOpen) {
                closeMobileNav();
            } else {
                hamburger.classList.add('open');
                mobileNav.classList.add('open');
                if (backdrop) backdrop.classList.add('open');
            }
        });
        if (backdrop) backdrop.addEventListener('click', closeMobileNav);
        mobileNav.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMobileNav));
        const mobileLogout = document.getElementById('mobile-logout');
        if (mobileLogout) mobileLogout.addEventListener('click', closeMobileNav);
    }

    // Active link highlight
    const currentPath = window.location.pathname;
    document.querySelectorAll('.nav-links a, .mobile-nav a').forEach(link => {
        if (link.getAttribute('href') === currentPath ||
            (currentPath === '/' && link.getAttribute('href') === '/')) {
            link.classList.add('active');
        }
    });

    // Auth-dynamic nav
    updateNavAuth();
}

function updateNavAuth() {
    const user = Auth.getUser();
    const loginLink = document.getElementById('nav-login-link');
    const dashLink = document.getElementById('nav-dashboard-link');
    const adminLink = document.getElementById('nav-admin-link');
    const logoutBtn = document.getElementById('nav-logout-btn');
    // Mobile nav auth
    const mobileLogin = document.getElementById('mobile-login');
    const mobileDash = document.getElementById('mobile-dashboard');
    const mobileAdmin = document.getElementById('mobile-admin');
    const mobileLogout = document.getElementById('mobile-logout');

    if (user) {
        if (loginLink) loginLink.style.display = 'none';
        if (dashLink) dashLink.style.display = '';
        if (adminLink) adminLink.style.display = user.role === 'admin' ? '' : 'none';
        if (logoutBtn) logoutBtn.style.display = '';
        // Mobile
        if (mobileLogin) mobileLogin.style.display = 'none';
        if (mobileDash) mobileDash.style.display = '';
        if (mobileAdmin) mobileAdmin.style.display = user.role === 'admin' ? '' : 'none';
        if (mobileLogout) mobileLogout.style.display = '';
    } else {
        if (loginLink) loginLink.style.display = '';
        if (dashLink) dashLink.style.display = 'none';
        if (adminLink) adminLink.style.display = 'none';
        if (logoutBtn) logoutBtn.style.display = 'none';
        // Mobile
        if (mobileLogin) mobileLogin.style.display = '';
        if (mobileDash) mobileDash.style.display = 'none';
        if (mobileAdmin) mobileAdmin.style.display = 'none';
        if (mobileLogout) mobileLogout.style.display = 'none';
    }
}

// ── Cart Sidebar init ────────────────────────────────────────
function initCartSidebar() {
    const overlay = document.getElementById('cart-overlay');
    const sidebar = document.getElementById('cart-sidebar');
    const openBtn = document.getElementById('cart-btn');
    const closeBtn = document.getElementById('cart-close');

    const open = () => { overlay.classList.add('open'); sidebar.classList.add('open'); Cart.renderSidebar(); };
    const close = () => { overlay.classList.remove('open'); sidebar.classList.remove('open'); };

    if (openBtn) openBtn.addEventListener('click', open);
    if (closeBtn) closeBtn.addEventListener('click', close);
    if (overlay) overlay.addEventListener('click', close);

    Cart.updateBadge();
}

// ── Star Renderer ────────────────────────────────────────────
function renderStars(rating) {
    const full = Math.floor(rating);
    const half = rating % 1 >= 0.5;
    let stars = '★'.repeat(full);
    if (half) stars += '½';
    stars += '☆'.repeat(5 - full - (half ? 1 : 0));
    return stars;
}

// ── Price Format ─────────────────────────────────────────────
function fmt(price) {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0
    }).format(Number(price));
}

// ── Discount Calc ─────────────────────────────────────────────
function discount(orig, curr) {
    if (!orig || orig <= curr) return null;
    return Math.round((1 - curr / orig) * 100);
}

// ── Render Product Card ──────────────────────────────────────
function renderProductCard(p) {
    const disc = discount(p.originalPrice, p.price);
    return `
    <div class="product-card reveal" onclick="window.location='/product/${p.id}'">
      <div class="product-card-img">
        <img data-src="${p.image}" src="" alt="${p.name}" loading="lazy">
        ${p.featured ? '<span class="product-card-badge">Featured</span>' : ''}
        ${disc ? `<span class="product-card-badge" style="left:auto;right:1rem;background:#4caf76">-${disc}%</span>` : ''}
        <div class="product-card-actions">
          <button class="product-card-action-btn" title="Quick Add" onclick="event.stopPropagation();Cart.add({id:'${p.id}',name:'${p.name.replace(/'/g, "\\'")}',price:${p.price},image:'${p.image}'})">🛒</button>
          <button class="product-card-action-btn" title="View Details" onclick="event.stopPropagation();window.location='/product/${p.id}'">👁</button>
        </div>
      </div>
      <div class="product-card-body">
        <div class="product-card-category">${p.category}</div>
        <div class="product-card-name">${p.name}</div>
        <div class="product-card-rating">
          <span class="stars">${renderStars(p.rating)}</span>
          <span class="rating-count">(${p.reviews})</span>
        </div>
        <div class="product-card-price">
          <span class="price-current">${fmt(p.price)}</span>
          ${p.originalPrice > p.price ? `<span class="price-original">${fmt(p.originalPrice)}</span>` : ''}
          ${disc ? `<span class="price-discount">-${disc}%</span>` : ''}
        </div>
      </div>
    </div>
  `;
}

// ── Skeleton Cards ───────────────────────────────────────────
function renderSkeletons(count) {
    return Array(count).fill(0).map(() => `
    <div class="skeleton-card">
      <div class="skeleton skeleton-img"></div>
      <div class="skeleton-body">
        <div class="skeleton skeleton-line w-40" style="margin-bottom:8px;height:10px"></div>
        <div class="skeleton skeleton-line w-80 h-6" style="margin-bottom:12px"></div>
        <div class="skeleton skeleton-line w-60"></div>
        <div class="skeleton skeleton-line w-40" style="margin-top:16px;height:18px"></div>
      </div>
    </div>
  `).join('');
}

// ── Logout ───────────────────────────────────────────────────
function logout() {
    Auth.clearSession();
    Cart.clear();
    showToast('You\'ve been logged out.', 'default');
    setTimeout(() => window.location.href = '/', 800);
}

// ── DOMContentLoaded Init ────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    initNavbar();
    initCartSidebar();
    initReveal();
    initLazyImages();

    const logoutBtn = document.getElementById('nav-logout-btn');
    if (logoutBtn) logoutBtn.addEventListener('click', logout);

    setTimeout(hidePageLoader, 400);
});

// Global exports for inline handlers
window.Cart = Cart;
window.Auth = Auth;
window.showToast = showToast;
window.logout = logout;
window.apiFetch = apiFetch;
window.renderProductCard = renderProductCard;
window.renderStars = renderStars;
window.fmt = fmt;
window.initLazyImages = initLazyImages;
window.initReveal = initReveal;
window.renderSkeletons = renderSkeletons;
