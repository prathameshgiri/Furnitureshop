/* ============================================================
   js/product.js — Product Detail Page Logic
   ============================================================ */

let productData = null;
let qty = 1;

document.addEventListener('DOMContentLoaded', async () => {
  const pathParts = window.location.pathname.split('/');
  const id = pathParts[pathParts.length - 1];
  if (!id) { window.location.href = '/shop'; return; }
  await loadProduct(id);
  await loadRelated();
});

async function loadProduct(id) {
  try {
    productData = await apiFetch(`/products/${id}`);
    renderProduct(productData);
    renderReviews(productData);
  } catch {
    document.getElementById('product-detail').innerHTML =
      '<div style="grid-column:1/-1;text-align:center;padding:4rem"><h2>Product not found</h2><a href="/shop" class="btn btn-outline mt-md">Back to Shop</a></div>';
  }
}

function renderProduct(p) {
  const disc = p.originalPrice > p.price ? Math.round((1 - p.price / p.originalPrice) * 100) : null;
  document.title = `${p.name} — LuxeWood`;
  document.getElementById('bc-name').textContent = p.name;

  const gallery = p.gallery && p.gallery.length > 0 ? p.gallery : [p.image];

  document.getElementById('product-detail').innerHTML = `
    <!-- Gallery -->
    <div class="pd-gallery reveal-left">
      <div class="pd-main-img" id="pd-main-wrap">
        <img id="pd-main-img" data-src="${gallery[0]}" src="" alt="${p.name}">
      </div>
      <div class="pd-thumbs" id="pd-thumbs">
        ${gallery.map((img, i) => `
          <div class="pd-thumb ${i === 0 ? 'active' : ''}" onclick="switchImg('${img}', this)">
            <img src="${img}" alt="View ${i + 1}" loading="lazy">
          </div>
        `).join('')}
      </div>
    </div>

    <!-- Info -->
    <div class="pd-info reveal-right">
      <span class="pd-category">${p.category}</span>
      <h1 class="pd-name">${p.name}</h1>
      <div class="pd-rating">
        <span class="stars">${renderStars(p.rating)}</span>
        <span>${p.rating} (${p.reviews} reviews)</span>
        <span class="badge badge-${p.stock > 0 ? 'success' : 'danger'}">${p.stock > 0 ? `In Stock (${p.stock})` : 'Out of Stock'}</span>
      </div>
      <div class="pd-price-row">
        <span class="pd-price">${fmt(p.price)}</span>
        ${p.originalPrice > p.price ? `<span class="pd-original">${fmt(p.originalPrice)}</span>` : ''}
        ${disc ? `<span class="pd-discount">Save ${disc}%</span>` : ''}
      </div>
      <p class="pd-desc">${p.description}</p>
      <div class="pd-meta">
        <div class="pd-meta-row"><span class="pd-meta-label">Category</span><span class="pd-meta-val">${p.category}</span></div>
        <div class="pd-meta-row"><span class="pd-meta-label">Rating</span><span class="pd-meta-val">${p.rating}/5.0</span></div>
        <div class="pd-meta-row"><span class="pd-meta-label">Reviews</span><span class="pd-meta-val">${p.reviews} verified buyers</span></div>
      </div>

      <!-- Quantity -->
      <div class="pd-qty-row">
        <span class="pd-qty-label">Quantity:</span>
        <div class="pd-qty">
          <button class="qty-btn" onclick="changeQty(-1)">−</button>
          <span class="qty-num" id="pd-qty-display">1</span>
          <button class="qty-btn" onclick="changeQty(1)">+</button>
        </div>
      </div>

      <!-- Actions -->
      <div class="pd-actions">
        <button class="btn btn-primary btn-lg" onclick="addToCartDetail()" ${p.stock === 0 ? 'disabled' : ''}>
          🛒 Add to Cart
        </button>
        <button class="btn btn-outline btn-lg" onclick="buyNow()" ${p.stock === 0 ? 'disabled' : ''}>
          ⚡ Buy Now
        </button>
      </div>

      <!-- Guarantees -->
      <div class="pd-guarantee">
        <div class="pd-guarantee-item"><span class="g-icon">🚚</span><strong>Free Shipping</strong><span>Orders over ₹15,000</span></div>
        <div class="pd-guarantee-item"><span class="g-icon">↩</span><strong>30-Day Returns</strong><span>No questions asked</span></div>
        <div class="pd-guarantee-item"><span class="g-icon">🛡</span><strong>5-Year Warranty</strong><span>Structural guarantee</span></div>
      </div>
    </div>
  `;

  setTimeout(() => { initLazyImages(); initReveal(); }, 50);
}

// ── Reviews Section ───────────────────────────────────────────
function renderReviews(p) {
  const container = document.getElementById('reviews-section');
  if (!container) return;

  const reviews = p.reviewList || [];
  const avgRating = p.rating || 0;
  const totalReviews = p.reviews || reviews.length;

  if (reviews.length === 0) {
    container.style.display = 'none';
    return;
  }

  // Build rating distribution bars (fake distribution based on avg)
  const dist = buildRatingDist(avgRating, totalReviews);

  container.innerHTML = `
    <div class="reviews-wrap container">
      <div class="reviews-header reveal">
        <h2 class="section-title">Customer Reviews</h2>
        <p class="section-subtitle">What our verified buyers say about ${p.name}</p>
      </div>

      <!-- Rating Summary -->
      <div class="reviews-summary reveal">
        <div class="reviews-score-box">
          <div class="reviews-big-score">${avgRating}</div>
          <div class="stars" style="font-size:1.5rem">${renderStars(avgRating)}</div>
          <div class="reviews-total">${totalReviews} verified reviews</div>
        </div>
        <div class="reviews-bars">
          ${[5, 4, 3, 2, 1].map(s => `
            <div class="rating-bar-row">
              <span class="rating-bar-label">${s} ★</span>
              <div class="rating-bar-track">
                <div class="rating-bar-fill" style="width:${dist[s]}%"></div>
              </div>
              <span class="rating-bar-pct">${dist[s]}%</span>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- Review Cards -->
      <div class="reviews-grid">
        ${reviews.map((r, i) => `
          <div class="review-card glass-card reveal" style="transition-delay:${i * 0.1}s">
            <!-- Reviewer -->
            <div class="review-header">
              <img src="${r.photo}" alt="${r.name}" class="reviewer-photo" loading="lazy"
                onerror="this.src='https://ui-avatars.com/api/?name=${encodeURIComponent(r.name)}&background=8B5E3C&color=fff&size=60'">
              <div class="reviewer-info">
                <div class="reviewer-name">${r.name}</div>
                <div class="reviewer-meta">
                  <span class="stars" style="font-size:0.85rem">${renderStars(r.rating)}</span>
                  <span class="review-date">${r.date}</span>
                </div>
              </div>
              <span class="review-verified">✓ Verified</span>
            </div>
            <!-- Comment -->
            <p class="review-comment">"${r.comment}"</p>
            <!-- Product Photo (if exists) -->
            ${r.productImg ? `
              <div class="review-photo-wrap">
                <img src="${r.productImg}" alt="Customer photo" class="review-product-photo" loading="lazy">
              </div>
            ` : ''}
          </div>
        `).join('')}
      </div>
    </div>
  `;

  setTimeout(() => initReveal(), 80);
}

function buildRatingDist(avg, total) {
  // Build a plausible distribution peaking near the average
  const dist = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  if (avg >= 4.8) { dist[5] = 82; dist[4] = 13; dist[3] = 3; dist[2] = 1; dist[1] = 1; }
  else if (avg >= 4.5) { dist[5] = 65; dist[4] = 25; dist[3] = 7; dist[2] = 2; dist[1] = 1; }
  else if (avg >= 4.0) { dist[5] = 50; dist[4] = 30; dist[3] = 13; dist[2] = 5; dist[1] = 2; }
  else { dist[5] = 35; dist[4] = 30; dist[3] = 20; dist[2] = 10; dist[1] = 5; }
  return dist;
}

function switchImg(src, el) {
  const img = document.getElementById('pd-main-img');
  if (!img) return;
  img.classList.remove('loaded');
  img.src = src;
  img.onload = () => img.classList.add('loaded');
  document.querySelectorAll('.pd-thumb').forEach(t => t.classList.remove('active'));
  el.classList.add('active');
}

function changeQty(delta) {
  qty = Math.max(1, qty + delta);
  const el = document.getElementById('pd-qty-display');
  if (el) el.textContent = qty;
}

function addToCartDetail() {
  if (!productData) return;
  Cart.add({ id: productData.id, name: productData.name, price: productData.price, image: productData.image }, qty);
}

function buyNow() {
  addToCartDetail();
  setTimeout(() => {
    if (!Auth.isLoggedIn()) {
      window.location.href = '/login';
    } else {
      document.getElementById('cart-btn').click();
    }
  }, 400);
}

async function loadRelated() {
  const grid = document.getElementById('related-grid');
  if (!grid || !productData) return;
  try {
    const data = await apiFetch(`/products?category=${productData.category}`);
    const related = (data.products || []).filter(p => p.id !== productData.id).slice(0, 4);
    if (related.length === 0) { grid.closest('section').style.display = 'none'; return; }
    grid.innerHTML = related.map(renderProductCard).join('');
    setTimeout(() => { initLazyImages(); initReveal(); }, 50);
  } catch { grid.closest('section').style.display = 'none'; }
}

window.switchImg = switchImg;
window.changeQty = changeQty;
window.addToCartDetail = addToCartDetail;
window.buyNow = buyNow;
