/* ============================================================
   js/shop.js — Shop Page Logic
   ============================================================ */

let allProducts = [];
let currentView = 'grid';
let searchTimer = null;

// ── Boot ─────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', async () => {
    // Read URL params
    const params = new URLSearchParams(window.location.search);
    const urlCat = params.get('category');
    if (urlCat) {
        const radio = document.querySelector(`input[name="category"][value="${urlCat}"]`);
        if (radio) radio.checked = true;
    }

    await loadProducts();
    initPriceRange();
});

// ── Load All Products ─────────────────────────────────────────
async function loadProducts() {
    const grid = document.getElementById('shop-products');
    grid.innerHTML = renderSkeletons(8);

    try {
        const data = await apiFetch('/products');
        allProducts = data.products || [];
        renderShopProducts(allProducts);
    } catch {
        grid.innerHTML = '<p class="text-muted text-center" style="grid-column:1/-1;padding:3rem">Failed to load products.</p>';
    }
}

// ── Render Products ──────────────────────────────────────────
function renderShopProducts(products) {
    const grid = document.getElementById('shop-products');
    const noRes = document.getElementById('no-results');
    const count = document.getElementById('product-count');

    if (products.length === 0) {
        grid.innerHTML = '';
        noRes.classList.remove('d-none');
        count.textContent = '0 products';
        return;
    }

    noRes.classList.add('d-none');
    count.textContent = `${products.length} product${products.length !== 1 ? 's' : ''}`;
    grid.innerHTML = products.map(renderProductCard).join('');

    setTimeout(() => { initLazyImages(); initReveal(); }, 50);
}

// ── Apply Filters ────────────────────────────────────────────
function applyFilters() {
    let filtered = [...allProducts];

    // Category
    const cat = document.querySelector('input[name="category"]:checked')?.value;
    if (cat && cat !== 'All') {
        filtered = filtered.filter(p => p.category === cat);
    }

    // Price
    const minPrice = Number(document.getElementById('price-min').value);
    const maxPrice = Number(document.getElementById('price-max').value);
    filtered = filtered.filter(p => p.price >= minPrice && p.price <= maxPrice);

    // Search
    const q = document.getElementById('search-input').value.trim().toLowerCase();
    if (q) {
        filtered = filtered.filter(p =>
            p.name.toLowerCase().includes(q) ||
            p.category.toLowerCase().includes(q) ||
            p.description.toLowerCase().includes(q)
        );
    }

    // Sort
    const sort = document.querySelector('input[name="sort"]:checked')?.value;
    if (sort === 'price-asc') filtered.sort((a, b) => a.price - b.price);
    else if (sort === 'price-desc') filtered.sort((a, b) => b.price - a.price);
    else if (sort === 'rating') filtered.sort((a, b) => b.rating - a.rating);

    renderShopProducts(filtered);

    // Close mobile sidebar
    document.getElementById('shop-sidebar').classList.remove('open');
}

// ── Clear Filters ─────────────────────────────────────────────
function clearFilters() {
    document.querySelector('input[name="category"][value="All"]').checked = true;
    document.querySelector('input[name="sort"][value="default"]').checked = true;
    document.getElementById('price-min').value = 0;
    document.getElementById('price-max').value = 200000;
    document.getElementById('search-input').value = '';
    document.getElementById('price-min-display').textContent = '₹0';
    document.getElementById('price-max-display').textContent = '₹2,00,000';
    renderShopProducts(allProducts);
}

// ── Price Range ──────────────────────────────────────────────
function initPriceRange() {
    const minInput = document.getElementById('price-min');
    const maxInput = document.getElementById('price-max');
    const minDisplay = document.getElementById('price-min-display');
    const maxDisplay = document.getElementById('price-max-display');

    const update = () => {
        let min = Number(minInput.value);
        let max = Number(maxInput.value);
        if (min > max) [minInput.value, maxInput.value] = [max, min];
        minDisplay.textContent = fmt(Number(minInput.value));
        maxDisplay.textContent = fmt(Number(maxInput.value));
        applyFilters();
    };

    minInput.addEventListener('input', update);
    maxInput.addEventListener('input', update);
}

// ── Search Debounce ───────────────────────────────────────────
function debounceSearch() {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(applyFilters, 350);
}

// ── View Toggle ───────────────────────────────────────────────
function setView(view) {
    currentView = view;
    const grid = document.getElementById('shop-products');
    const btnGrid = document.getElementById('btn-grid');
    const btnList = document.getElementById('btn-list');

    if (view === 'grid') {
        grid.classList.remove('list-view');
        btnGrid.classList.add('active'); btnList.classList.remove('active');
    } else {
        grid.classList.add('list-view');
        btnList.classList.add('active'); btnGrid.classList.remove('active');
    }
}

// ── Mobile Sidebar Toggle ─────────────────────────────────────
function toggleSidebar() {
    document.getElementById('shop-sidebar').classList.toggle('open');
}

// ── Checkout ─────────────────────────────────────────────────
function proceedCheckout() {
    const cart = Cart.get();
    if (cart.length === 0) {
        showToast('Your cart is empty!', 'warning'); return;
    }

    if (!Auth.isLoggedIn()) {
        // Show login-required overlay
        showLoginGate('checkout');
        return;
    }

    placeOrderDemo();
}

// ── Login Gate Overlay ────────────────────────────────────────
function showLoginGate(reason = '') {
    // Remove any existing gate
    document.getElementById('login-gate')?.remove();

    const gate = document.createElement('div');
    gate.id = 'login-gate';
    gate.innerHTML = `
    <div class="login-gate-overlay" onclick="document.getElementById('login-gate').remove()"></div>
    <div class="login-gate-card glass-card">
      <button class="login-gate-close" onclick="document.getElementById('login-gate').remove()">✕</button>
      <div class="login-gate-icon">🔐</div>
      <h3 class="login-gate-title">Sign In Required</h3>
      <p class="login-gate-msg">
        ${reason === 'checkout'
            ? 'Please sign in to complete your purchase. Your cart will be saved!'
            : 'Please sign in to continue.'}
      </p>
      <div class="login-gate-actions">
        <a href="/login" class="btn btn-primary w-full" style="justify-content:center">Sign In →</a>
        <a href="/register" class="btn btn-outline w-full" style="justify-content:center;margin-top:0.5rem">Create Account</a>
      </div>
      <p class="login-gate-footer">
        User: <strong>alfiya@user.com</strong> / <strong>alfiya123</strong><br>
        Admin: <strong>alfiya@admin.com</strong> / <strong>alfiya123</strong>
      </p>
    </div>
  `;
    document.body.appendChild(gate);
}

async function placeOrderDemo() {
    const cart = Cart.get();
    const user = Auth.getUser();
    try {
        await apiFetch('/orders', {
            method: 'POST',
            headers: { Authorization: `Bearer ${Auth.getToken()}` },
            body: JSON.stringify({
                items: cart.map(i => ({ productId: i.id, quantity: i.quantity })),
                shippingAddress: user.address || 'Mumbai, India',
                paymentMethod: 'UPI'
            })
        });
        Cart.clear();
        // Close cart sidebar
        document.getElementById('cart-overlay')?.classList.remove('open');
        document.getElementById('cart-sidebar')?.classList.remove('open');
        // Show success then redirect to dashboard orders list
        showToast('🎉 Order placed successfully! Redirecting…', 'success', 3000);
        setTimeout(() => { window.location.href = '/dashboard'; }, 2000);
    } catch (err) {
        showToast('Order failed: ' + err.message, 'error');
    }
}

// Global for inline onclick
window.applyFilters = applyFilters;
window.clearFilters = clearFilters;
window.setView = setView;
window.toggleSidebar = toggleSidebar;
window.proceedCheckout = proceedCheckout;
window.debounceSearch = debounceSearch;
window.showLoginGate = showLoginGate;
