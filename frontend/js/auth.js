/* ============================================================
   js/auth.js — Login & Register Logic (Role-Separated)
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
    // ── Already logged in? Redirect based on role ─────────────
    if (Auth.isLoggedIn()) {
        const user = Auth.getUser();
        if (user.role === 'admin') {
            window.location.href = '/admin';
        } else {
            window.location.href = '/dashboard';
        }
        return;
    }

    // Init lazy images in auth left panel
    setTimeout(initLazyImages, 100);

    // ── LOGIN ────────────────────────────────────────────────────
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = document.getElementById('login-btn');
            btn.textContent = 'Signing in…';
            btn.disabled = true;

            try {
                const data = await apiFetch('/auth/login', {
                    method: 'POST',
                    body: JSON.stringify({
                        email: document.getElementById('login-email').value.trim(),
                        password: document.getElementById('login-password').value
                    })
                });

                Auth.setSession(data.token, data.user);
                showToast(`Welcome back, ${data.user.name}! 👋`, 'success');

                setTimeout(() => {
                    window.location.href = data.user.role === 'admin' ? '/admin' : '/dashboard';
                }, 800);

            } catch (err) {
                showToast(err.message || 'Invalid credentials.', 'error');
                btn.textContent = 'Sign In →';
                btn.disabled = false;
            }
        });
    }

    // ── REGISTER ─────────────────────────────────────────────────
    const registerForm = document.getElementById('register-form');
    if (registerForm) {
        // Password strength meter
        const pwInput = document.getElementById('reg-password');
        if (pwInput) {
            pwInput.addEventListener('input', () => checkPasswordStrength(pwInput.value));
        }

        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = document.getElementById('reg-btn');
            const pw = document.getElementById('reg-password').value;
            const confirm = document.getElementById('reg-confirm').value;

            if (pw !== confirm) {
                showToast('Passwords do not match.', 'error'); return;
            }
            if (pw.length < 6) {
                showToast('Password must be at least 6 characters.', 'error'); return;
            }

            btn.textContent = 'Creating account…';
            btn.disabled = true;

            try {
                const data = await apiFetch('/auth/register', {
                    method: 'POST',
                    body: JSON.stringify({
                        name: document.getElementById('reg-name').value.trim(),
                        email: document.getElementById('reg-email').value.trim(),
                        password: pw
                    })
                });

                Auth.setSession(data.token, data.user);
                showToast(`Welcome to LuxeWood, ${data.user.name}! 🎉`, 'success');
                setTimeout(() => window.location.href = '/dashboard', 900);

            } catch (err) {
                showToast(err.message || 'Registration failed.', 'error');
                btn.textContent = 'Create Account →';
                btn.disabled = false;
            }
        });
    }
});

// ── Password Strength ─────────────────────────────────────────
function checkPasswordStrength(pw) {
    const bar = document.getElementById('pw-strength-bar');
    const label = document.getElementById('pw-strength-label');
    if (!bar || !label) return;

    let score = 0;
    if (pw.length >= 6) score++;
    if (pw.length >= 10) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;

    const levels = [
        { w: '20%', color: '#e05252', text: 'Weak' },
        { w: '40%', color: '#f0a500', text: 'Fair' },
        { w: '60%', color: '#f0a500', text: 'Good' },
        { w: '80%', color: '#4caf76', text: 'Strong' },
        { w: '100%', color: '#2e7d5e', text: 'Very Strong' }
    ];

    const lvl = levels[Math.min(score - 1, 4)] || levels[0];
    bar.style.width = pw.length === 0 ? '0' : lvl.w;
    bar.style.background = lvl.color;
    label.textContent = pw.length === 0 ? '' : lvl.text;
    label.style.color = lvl.color;
}

// ── Toggle Password Visibility ────────────────────────────────
function togglePw(id, btn) {
    const input = document.getElementById(id);
    if (!input) return;
    if (input.type === 'password') {
        input.type = 'text'; btn.textContent = '🙈';
    } else {
        input.type = 'password'; btn.textContent = '👁';
    }
}

window.togglePw = togglePw;
window.checkPasswordStrength = checkPasswordStrength;
