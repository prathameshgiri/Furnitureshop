/* ============================================================
   js/home.js — Homepage Logic
   ============================================================ */

// ── Load Featured Products ───────────────────────────────────
async function loadFeaturedProducts() {
    const grid = document.getElementById('featured-grid');
    if (!grid) return;

    // Show skeletons
    grid.innerHTML = renderSkeletons(4);

    try {
        const data = await apiFetch('/products?featured=true');
        const products = (data.products || []).slice(0, 4);

        if (products.length === 0) {
            grid.innerHTML = '<p class="text-muted text-center" style="grid-column:1/-1">No featured products found.</p>';
            return;
        }

        grid.innerHTML = products.map(renderProductCard).join('');
        // Re-init animations for newly rendered cards
        setTimeout(() => { initLazyImages(); initReveal(); }, 50);
    } catch (err) {
        grid.innerHTML = '<p class="text-muted text-center" style="grid-column:1/-1">Could not load products.</p>';
    }
}

// ── Contact Form ─────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('contact-form');
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = form.querySelector('button[type="submit"]');
            btn.textContent = 'Sending…';
            btn.disabled = true;

            try {
                await apiFetch('/messages', {
                    method: 'POST',
                    body: JSON.stringify({
                        name: document.getElementById('cf-name').value,
                        email: document.getElementById('cf-email').value,
                        subject: document.getElementById('cf-subject').value,
                        message: document.getElementById('cf-message').value
                    })
                });
                showToast('✓ Message sent! We\'ll reply within 24 hours.', 'success');
                form.reset();
            } catch (err) {
                showToast('❌ Failed to send. Please try again.', 'error');
            } finally {
                btn.textContent = 'Send Message ✉️';
                btn.disabled = false;
            }
        });
    }

    // Parallax hero blobs on mouse move
    const hero = document.querySelector('.hero');
    if (hero) {
        hero.addEventListener('mousemove', (e) => {
            const { clientX, clientY } = e;
            const x = (clientX / window.innerWidth - 0.5) * 20;
            const y = (clientY / window.innerHeight - 0.5) * 20;
            const blob1 = hero.querySelector('.hero-blob-1');
            const blob2 = hero.querySelector('.hero-blob-2');
            if (blob1) blob1.style.transform = `translate(${x}px, ${y}px)`;
            if (blob2) blob2.style.transform = `translate(${-x * 0.5}px, ${-y * 0.5}px)`;
        });
    }

    // Load featured products
    loadFeaturedProducts();
});
