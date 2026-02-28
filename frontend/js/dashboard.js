/* ============================================================
   js/dashboard.js — User Dashboard Logic (User Only)
   ============================================================ */

document.addEventListener('DOMContentLoaded', async () => {
    // ── Auth Guard ────────────────────────────────────────────
    if (!Auth.isLoggedIn()) {
        showToast('Please sign in to view your account.', 'warning');
        setTimeout(() => window.location.href = '/login', 900);
        return;
    }

    // ── Role Guard: Admin → Admin Panel ───────────────────────
    const user = Auth.getUser();
    if (user.role === 'admin') {
        showToast('Redirecting to Admin Panel…', 'default');
        setTimeout(() => window.location.href = '/admin', 600);
        return;
    }

    // Populate user info
    document.getElementById('dash-name').textContent = user.name;
    document.getElementById('dash-email').textContent = user.email;
    document.getElementById('dash-avatar').textContent = user.name.charAt(0).toUpperCase();
    document.getElementById('welcome-name').textContent = user.name.split(' ')[0];

    // Load profile + orders in parallel
    await Promise.all([loadProfile(), loadOrders()]);

    // Handle tab from hash
    const hash = window.location.hash.replace('#', '');
    if (hash) {
        const btn = document.querySelector(`[data-tab="${hash}"]`);
        if (btn) { switchTab(hash, btn); }
    }
});

// ── Load Profile ─────────────────────────────────────────────
async function loadProfile() {
    try {
        const user = await apiFetch('/auth/profile', { headers: Auth.headers() });
        document.getElementById('pf-name').value = user.name || '';
        document.getElementById('pf-email').value = user.email || '';
        document.getElementById('pf-phone').value = user.phone || '';
        document.getElementById('pf-address').value = user.address || '';
    } catch { }
}

// ── Save Profile ─────────────────────────────────────────────
const profileForm = document.getElementById('profile-form');
if (profileForm) {
    profileForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = profileForm.querySelector('button[type=submit]');
        btn.textContent = 'Saving…'; btn.disabled = true;
        try {
            const data = await apiFetch('/auth/profile', {
                method: 'PUT',
                headers: Auth.headers(),
                body: JSON.stringify({
                    name: document.getElementById('pf-name').value,
                    phone: document.getElementById('pf-phone').value,
                    address: document.getElementById('pf-address').value
                })
            });
            // Update local session
            const stored = Auth.getUser();
            Auth.setSession(localStorage.getItem('fs_token'), { ...stored, name: data.user.name });
            showToast('Profile updated!', 'success');
        } catch (err) {
            showToast(err.message, 'error');
        } finally {
            btn.textContent = 'Save Changes'; btn.disabled = false;
        }
    });
}

// ── Load Orders ──────────────────────────────────────────────
async function loadOrders() {
    try {
        const orders = await apiFetch('/orders/my', { headers: Auth.headers() });

        // Stats
        const delivered = orders.filter(o => o.status === 'delivered').length;
        const spent = orders.reduce((s, o) => s + o.total, 0);
        document.getElementById('total-orders').textContent = orders.length;
        document.getElementById('delivered-orders').textContent = delivered;
        document.getElementById('total-spent').textContent = fmt(spent);

        // Recent (3)
        const recentContainer = document.getElementById('recent-orders-list');
        const allContainer = document.getElementById('all-orders-list');

        if (orders.length === 0) {
            const empty = `<div class="orders-empty"><span class="empty-icon">📦</span><h3>No orders yet</h3><p>Your order history will appear here.</p><a href="/shop" class="btn btn-primary mt-md">Start Shopping →</a></div>`;
            recentContainer.innerHTML = empty;
            allContainer.innerHTML = empty;
            return;
        }

        const html = (list) => list.map(o => renderOrderCard(o)).join('');
        recentContainer.innerHTML = html(orders.slice(0, 3));
        allContainer.innerHTML = html(orders);
    } catch (err) {
        document.getElementById('recent-orders-list').innerHTML = '<p class="text-muted">Could not load orders.</p>';
    }
}

function renderOrderCard(o) {
    const statusColors = {
        pending: 'warning', processing: 'brown', shipped: 'brown',
        delivered: 'success', cancelled: 'danger'
    };
    const imgs = o.items.slice(0, 4).map(i =>
        `<img src="${i.image}" alt="${i.name}" class="order-item-img">`
    ).join('');
    const extraItems = o.items.length > 4 ? `<div class="order-item-img flex-center" style="background:var(--clr-beige);font-size:0.75rem;font-weight:600">+${o.items.length - 4}</div>` : '';

    return `
    <div class="order-card">
      <div class="order-card-header">
        <div>
          <div class="order-id">Order #${o.id.slice(0, 8).toUpperCase()}</div>
          <div class="order-name">${o.items.length} Item${o.items.length > 1 ? 's' : ''}</div>
        </div>
        <span class="badge badge-${statusColors[o.status] || 'muted'}">${o.status.charAt(0).toUpperCase() + o.status.slice(1)}</span>
      </div>
      <div class="order-items-thumb">${imgs}${extraItems}</div>
      <div class="order-card-footer">
        <span class="order-total">${fmt(o.total)}</span>
        <span class="order-date">${new Date(o.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
      </div>
    </div>
  `;
}

// ── Tab Switching ─────────────────────────────────────────────
function switchTab(id, el) {
    document.querySelectorAll('.dash-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.dash-nav-item').forEach(n => n.classList.remove('active'));
    const tab = document.getElementById(`tab-${id}`);
    if (tab) tab.classList.add('active');
    if (el) el.classList.add('active');
}

window.switchTab = switchTab;
