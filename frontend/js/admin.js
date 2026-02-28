/* ============================================================
   js/admin.js — Admin Panel Logic
   ============================================================ */

let adminProducts = [];
let adminOrders = [];
let adminUsers = [];
let adminMessages = [];
let editingProductId = null;

// ── Boot ─────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', async () => {
  // ── Not logged in → Login page ────────────────────────────
  if (!Auth.isLoggedIn()) {
    window.location.href = '/login'; return;
  }
  // ── Logged-in user (not admin) → User Dashboard ───────────
  if (!Auth.isAdmin()) {
    showToast('🚫 Access Denied. Admin only area.', 'error');
    setTimeout(() => window.location.href = '/dashboard', 1000);
    return;
  }

  const user = Auth.getUser();
  const chip = document.getElementById('admin-user-chip');
  if (chip) chip.textContent = user.name;

  await loadAll();
});

// ── Load All Data ─────────────────────────────────────────────
async function loadAll() {
  const [pRes, oRes, uRes, mRes] = await Promise.allSettled([
    apiFetch('/products'),
    apiFetch('/orders/all', { headers: Auth.headers() }),
    apiFetch('/auth/users', { headers: Auth.headers() }),
    apiFetch('/messages', { headers: Auth.headers() })
  ]);

  if (pRes.status === 'fulfilled') adminProducts = pRes.value.products || [];
  if (oRes.status === 'fulfilled') adminOrders = Array.isArray(oRes.value) ? oRes.value : [];
  if (uRes.status === 'fulfilled') adminUsers = Array.isArray(uRes.value) ? uRes.value : [];
  if (mRes.status === 'fulfilled') adminMessages = Array.isArray(mRes.value) ? mRes.value : [];

  renderDashboard();
  renderProductsTable();
  renderOrdersTable();
  renderUsersTable();
  renderMessages();
  updateMsgBadge();
  if (typeof updateCountBadges === 'function') updateCountBadges();
}

// ── Dashboard ─────────────────────────────────────────────────
function renderDashboard() {
  document.getElementById('stat-products').textContent = adminProducts.length;
  document.getElementById('stat-orders').textContent = adminOrders.length;
  document.getElementById('stat-users').textContent = adminUsers.length;
  const revenue = adminOrders.reduce((s, o) => s + (o.total || 0), 0);
  document.getElementById('stat-revenue').textContent = fmt(revenue);

  // Recent orders (mini)
  const ordersEl = document.getElementById('dashboard-orders');
  ordersEl.innerHTML = adminOrders.slice(0, 5).map(o => `
    <div class="mini-order-row">
      <div>
        <div style="font-weight:600;font-size:0.85rem">${o.userName}</div>
        <div style="font-size:0.75rem;color:var(--clr-muted)">#${o.id.slice(0, 8).toUpperCase()}</div>
      </div>
      <span class="badge badge-${statusColor(o.status)}">${o.status}</span>
      <span style="font-weight:700;color:var(--clr-brown)">${fmt(o.total)}</span>
    </div>
  `).join('') || '<p class="text-muted" style="padding:1rem">No orders yet.</p>';

  // Latest messages
  const msgsEl = document.getElementById('dashboard-messages');
  msgsEl.innerHTML = adminMessages.slice(0, 4).map(m => `
    <div class="mini-order-row">
      <div>
        <div style="font-weight:600;font-size:0.85rem">${m.name}</div>
        <div style="font-size:0.75rem;color:var(--clr-muted)">${m.subject}</div>
      </div>
      <span class="badge badge-${m.read ? 'muted' : 'brown'}">${m.read ? 'Read' : 'New'}</span>
    </div>
  `).join('') || '<p class="text-muted" style="padding:1rem">No messages yet.</p>';
}

// ── Products Table ─────────────────────────────────────────────
function renderProductsTable() {
  const tbody = document.getElementById('products-tbody');
  if (!tbody) return;
  tbody.innerHTML = adminProducts.map(p => `
    <tr>
      <td><img src="${p.image}" class="prod-img-thumb" alt="${p.name}" loading="lazy"></td>
      <td><strong>${p.name}</strong></td>
      <td><span class="badge badge-brown">${p.category}</span></td>
      <td>${fmt(p.price)}</td>
      <td>${p.stock}</td>
      <td>${p.featured ? '✅' : '—'}</td>
      <td>
        <div class="table-actions">
          <button class="btn btn-ghost btn-sm" onclick="editProduct('${p.id}')">✏️ Edit</button>
          <button class="btn btn-danger btn-sm" onclick="deleteProduct('${p.id}')">🗑 Delete</button>
        </div>
      </td>
    </tr>
  `).join('') || '<tr><td colspan="7" style="text-align:center;padding:2rem;color:var(--clr-muted)">No products found.</td></tr>';
}

// ── Orders Table ──────────────────────────────────────────────
function renderOrdersTable() {
  const tbody = document.getElementById('orders-tbody');
  if (!tbody) return;
  tbody.innerHTML = adminOrders.map(o => `
    <tr>
      <td>#${o.id.slice(0, 8).toUpperCase()}</td>
      <td>${o.userName}<br><small style="color:var(--clr-muted)">${o.userEmail}</small></td>
      <td>${o.items.length} item${o.items.length > 1 ? 's' : ''}</td>
      <td><strong>${fmt(o.total)}</strong></td>
      <td>
        <select class="status-select" onchange="updateOrderStatus('${o.id}', this.value)">
          ${['pending', 'processing', 'shipped', 'delivered', 'cancelled'].map(s =>
    `<option value="${s}" ${o.status === s ? 'selected' : ''}>${s.charAt(0).toUpperCase() + s.slice(1)}</option>`
  ).join('')}
        </select>
      </td>
      <td style="white-space:nowrap">${new Date(o.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</td>
      <td><span class="badge badge-${statusColor(o.status)}">${o.status}</span></td>
    </tr>
  `).join('') || '<tr><td colspan="7" style="text-align:center;padding:2rem;color:var(--clr-muted)">No orders yet.</td></tr>';
}

// ── Users Table ───────────────────────────────────────────────
function renderUsersTable() {
  const tbody = document.getElementById('users-tbody');
  if (!tbody) return;
  tbody.innerHTML = adminUsers.map(u => `
    <tr>
      <td><div style="width:36px;height:36px;border-radius:50%;background:var(--clr-brown);color:white;display:flex;align-items:center;justify-content:center;font-weight:700">${u.name.charAt(0)}</div></td>
      <td><strong>${u.name}</strong></td>
      <td>${u.email}</td>
      <td><span class="badge badge-${u.role === 'admin' ? 'brown' : 'muted'}">${u.role}</span></td>
      <td>${new Date(u.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</td>
    </tr>
  `).join('') || '<tr><td colspan="5" style="text-align:center;padding:2rem">No users found.</td></tr>';
}

// ── Messages ──────────────────────────────────────────────────
function renderMessages() {
  const container = document.getElementById('messages-list');
  if (!container) return;
  if (adminMessages.length === 0) {
    container.innerHTML = '<div class="orders-empty" style="text-align:center;padding:3rem;color:var(--clr-muted)"><span style="font-size:3rem">✉️</span><h3>No messages</h3></div>';
    return;
  }
  container.innerHTML = adminMessages.map(m => `
    <div class="msg-card ${m.read ? '' : 'unread'}" id="msg-${m.id}">
      <div class="msg-card-header">
        <div>
          <div class="msg-name">${m.name} ${m.read ? '' : '<span class="badge badge-brown" style="font-size:0.62rem">New</span>'}</div>
          <div class="msg-email">${m.email}</div>
        </div>
        <span style="font-size:0.75rem;color:var(--clr-muted)">${new Date(m.createdAt).toLocaleDateString()}</span>
      </div>
      <div class="msg-subject">${m.subject}</div>
      <div class="msg-body">${m.message}</div>
      <div class="msg-actions">
        ${!m.read ? `<button class="btn btn-ghost btn-sm" onclick="markMsgRead('${m.id}')">✓ Mark Read</button>` : ''}
        <button class="btn btn-danger btn-sm" onclick="deleteMsg('${m.id}')">🗑 Delete</button>
      </div>
    </div>
  `).join('');
}

function updateMsgBadge() {
  const unread = adminMessages.filter(m => !m.read).length;
  const el = document.getElementById('msg-count');
  if (el) { el.textContent = unread; el.style.display = unread > 0 ? '' : 'none'; }
}

async function markMsgRead(id) {
  try {
    await apiFetch(`/messages/${id}/read`, { method: 'PUT', headers: Auth.headers() });
    const msg = adminMessages.find(m => m.id === id);
    if (msg) msg.read = true;
    renderMessages(); updateMsgBadge(); renderDashboard();
    showToast('Marked as read.', 'success');
  } catch (err) { showToast(err.message, 'error'); }
}

async function deleteMsg(id) {
  if (!confirm('Delete this message?')) return;
  try {
    await apiFetch(`/messages/${id}`, { method: 'DELETE', headers: Auth.headers() });
    adminMessages = adminMessages.filter(m => m.id !== id);
    renderMessages(); updateMsgBadge(); renderDashboard();
    showToast('Message deleted.', 'success');
  } catch (err) { showToast(err.message, 'error'); }
}

// ── Update Order Status ───────────────────────────────────────
async function updateOrderStatus(id, status) {
  try {
    await apiFetch(`/orders/${id}/status`, {
      method: 'PUT', headers: Auth.headers(),
      body: JSON.stringify({ status })
    });
    const order = adminOrders.find(o => o.id === id);
    if (order) order.status = status;
    renderDashboard();
    showToast('Order status updated.', 'success');
  } catch (err) { showToast(err.message, 'error'); }
}

// ── Product Modal ─────────────────────────────────────────────
function openProductModal(id = null) {
  editingProductId = id;
  document.getElementById('modal-title').textContent = id ? 'Edit Product' : 'Add Product';
  document.getElementById('pm-submit').textContent = id ? 'Update Product' : 'Save Product';

  if (id) {
    const p = adminProducts.find(p => p.id === id);
    if (p) {
      document.getElementById('pm-id').value = p.id;
      document.getElementById('pm-name').value = p.name;
      document.getElementById('pm-category').value = p.category;
      document.getElementById('pm-price').value = p.price;
      document.getElementById('pm-original-price').value = p.originalPrice || '';
      document.getElementById('pm-image').value = p.image;
      document.getElementById('pm-stock').value = p.stock;
      document.getElementById('pm-description').value = p.description;
      document.getElementById('pm-featured').checked = p.featured;
    }
  } else {
    document.getElementById('product-form').reset();
  }

  document.getElementById('product-modal-overlay').classList.add('open');
  document.getElementById('product-modal').classList.add('open');
}

function closeProductModal() {
  document.getElementById('product-modal-overlay').classList.remove('open');
  document.getElementById('product-modal').classList.remove('open');
  document.getElementById('product-form').reset();
  editingProductId = null;
}

function editProduct(id) { openProductModal(id); }

async function deleteProduct(id) {
  if (!confirm('Delete this product? This cannot be undone.')) return;
  try {
    await apiFetch(`/products/${id}`, { method: 'DELETE', headers: Auth.headers() });
    adminProducts = adminProducts.filter(p => p.id !== id);
    renderProductsTable(); renderDashboard();
    showToast('Product deleted.', 'success');
  } catch (err) { showToast(err.message, 'error'); }
}

// ── Product Form Submit ───────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('product-form');
  if (!form) return;
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = document.getElementById('pm-submit');
    btn.textContent = 'Saving…'; btn.disabled = true;

    const body = {
      name: document.getElementById('pm-name').value,
      category: document.getElementById('pm-category').value,
      price: document.getElementById('pm-price').value,
      originalPrice: document.getElementById('pm-original-price').value,
      image: document.getElementById('pm-image').value,
      stock: document.getElementById('pm-stock').value,
      description: document.getElementById('pm-description').value,
      featured: document.getElementById('pm-featured').checked
    };

    try {
      if (editingProductId) {
        const data = await apiFetch(`/products/${editingProductId}`, {
          method: 'PUT', headers: Auth.headers(), body: JSON.stringify(body)
        });
        const idx = adminProducts.findIndex(p => p.id === editingProductId);
        if (idx >= 0) adminProducts[idx] = data.product;
        showToast('Product updated!', 'success');
      } else {
        const data = await apiFetch('/products', {
          method: 'POST', headers: Auth.headers(), body: JSON.stringify(body)
        });
        adminProducts.unshift(data.product);
        showToast('Product created!', 'success');
      }
      renderProductsTable(); renderDashboard();
      closeProductModal();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      btn.disabled = false;
      btn.textContent = editingProductId ? 'Update Product' : 'Save Product';
    }
  });
});

// ── Nav ───────────────────────────────────────────────────────
function adminNav(tab, el) {
  document.querySelectorAll('.admin-tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.admin-nav-item').forEach(n => n.classList.remove('active'));
  const tabEl = document.getElementById(`atab-${tab}`);
  if (tabEl) tabEl.classList.add('active');

  // If el was passed directly, mark it active; otherwise find the matching button
  const activeBtn = el || document.querySelector(`[data-tab="${tab}"]`);
  if (activeBtn) activeBtn.classList.add('active');

  const titles = { dashboard: 'Dashboard', products: 'Products', orders: 'Orders', users: 'Users', messages: 'Messages' };
  const titleEl = document.getElementById('admin-page-title');
  if (titleEl) titleEl.textContent = titles[tab] || tab;

  // Close sidebar on mobile
  closeSidebar();
}

function toggleAdminSidebar() {
  const sidebar = document.getElementById('admin-sidebar');
  const backdrop = document.getElementById('sidebar-backdrop');
  if (sidebar.classList.contains('open')) {
    closeSidebar();
  } else {
    sidebar.classList.add('open');
    if (backdrop) backdrop.classList.add('show');
  }
}

function closeSidebar() {
  const sidebar = document.getElementById('admin-sidebar');
  const backdrop = document.getElementById('sidebar-backdrop');
  if (window.innerWidth < 1024) {
    if (sidebar) sidebar.classList.remove('open');
    if (backdrop) backdrop.classList.remove('show');
  }
}

function statusColor(s) {
  const map = { pending: 'warning', processing: 'brown', shipped: 'brown', delivered: 'success', cancelled: 'danger' };
  return map[s] || 'muted';
}

function updateCountBadges() {
  const ob = document.getElementById('order-count-badge');
  const ub = document.getElementById('user-count-badge');
  const unreadBadge = document.getElementById('unread-count-badge');
  if (ob) ob.textContent = `${adminOrders.length} order${adminOrders.length !== 1 ? 's' : ''}`;
  if (ub) ub.textContent = `${adminUsers.length} user${adminUsers.length !== 1 ? 's' : ''}`;
  const unread = adminMessages.filter(m => !m.read).length;
  if (unreadBadge) {
    unreadBadge.textContent = `${unread} unread`;
    unreadBadge.style.display = unread > 0 ? '' : 'none';
  }
}

// Global
window.adminNav = adminNav;
window.toggleAdminSidebar = toggleAdminSidebar;
window.closeSidebar = closeSidebar;
window.openProductModal = openProductModal;
window.closeProductModal = closeProductModal;
window.editProduct = editProduct;
window.deleteProduct = deleteProduct;
window.updateOrderStatus = updateOrderStatus;
window.markMsgRead = markMsgRead;
window.deleteMsg = deleteMsg;
window.loadAll = loadAll;
