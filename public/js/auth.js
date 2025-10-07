// Authentication JavaScript
let currentUser = null;

// Initialize authentication
document.addEventListener('DOMContentLoaded', () => {
    // Check if user is already logged in
    const token = localStorage.getItem('authToken');
    if (token) {
        // Verify token; redirect only when appropriate (avoid loops)
        verifyToken(token);
    }
    
    // Setup form handlers
    setupAuthForms();
});

// Setup authentication forms
function setupAuthForms() {
    // Login form
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    // Register form
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegister);
    }
}

// Handle login
async function handleLogin(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const loginData = {
        username: formData.get('username'),
        password: formData.get('password'),
        rememberMe: formData.get('rememberMe') === 'on'
    };
    
    // Validate form
    if (!validateLoginForm(loginData)) {
        return;
    }
    
    showLoading(true);
    
    try {
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(loginData)
        });
        
        const result = await response.json();
        
        if (result.success) {
            // Store auth data
            localStorage.setItem('authToken', result.token);
            localStorage.setItem('userData', JSON.stringify(result.user));
            
            // Show success message
            showToast('Login berhasil! Mengalihkan...', 'success');
            
            // Redirect based on role
            setTimeout(() => {
                const path = window.location.pathname;
                const isLoginPage = path === '/login' || path === '/login.html';
                const isRegisterPage = path === '/register' || path === '/register.html';
                if (result.user.role === 'admin') {
                    if (path !== '/admin') window.location.replace('/admin');
                } else {
                    if (isLoginPage || isRegisterPage) {
                        window.location.replace('/');
                    }
                }
            }, 1000);
        } else {
            showToast(result.message || 'Login gagal!', 'error');
        }
    } catch (error) {
        console.error('Login error:', error);
        showToast('Terjadi kesalahan saat login!', 'error');
    } finally {
        showLoading(false);
    }
}

// Handle register
async function handleRegister(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const registerData = {
        fullName: formData.get('fullName'),
        username: formData.get('username'),
        email: formData.get('email'),
        password: formData.get('password'),
        confirmPassword: formData.get('confirmPassword'),
        newsletter: formData.get('newsletter') === 'on'
    };
    
    // Validate form
    if (!validateRegisterForm(registerData)) {
        return;
    }
    
    showLoading(true);
    
    try {
        const response = await fetch('/api/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(registerData)
        });
        
        const result = await response.json();
        
        if (result.success) {
            showToast('Registrasi berhasil! Silakan login.', 'success');
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 1500);
        } else {
            showToast(result.message || 'Registrasi gagal!', 'error');
        }
    } catch (error) {
        console.error('Register error:', error);
        showToast('Terjadi kesalahan saat registrasi!', 'error');
    } finally {
        showLoading(false);
    }
}

// Validate login form
function validateLoginForm(data) {
    if (!data.username || !data.password) {
        showToast('Username dan password harus diisi!', 'error');
        return false;
    }
    
    if (data.username.length < 3) {
        showToast('Username minimal 3 karakter!', 'error');
        return false;
    }
    
    if (data.password.length < 6) {
        showToast('Password minimal 6 karakter!', 'error');
        return false;
    }
    
    return true;
}

// Validate register form
function validateRegisterForm(data) {
    // Check required fields
    if (!data.fullName || !data.username || !data.email || !data.password || !data.confirmPassword) {
        showToast('Semua field harus diisi!', 'error');
        return false;
    }
    
    // Check full name
    if (data.fullName.length < 2) {
        showToast('Nama lengkap minimal 2 karakter!', 'error');
        return false;
    }
    
    // Check username
    if (data.username.length < 3) {
        showToast('Username minimal 3 karakter!', 'error');
        return false;
    }
    
    if (!/^[a-zA-Z0-9_]+$/.test(data.username)) {
        showToast('Username hanya boleh mengandung huruf, angka, dan underscore!', 'error');
        return false;
    }
    
    // Check email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
        showToast('Format email tidak valid!', 'error');
        return false;
    }
    
    // Check password
    if (data.password.length < 6) {
        showToast('Password minimal 6 karakter!', 'error');
        return false;
    }
    
    // Check password confirmation
    if (data.password !== data.confirmPassword) {
        showToast('Password dan konfirmasi password tidak sama!', 'error');
        return false;
    }
    
    return true;
}

// Toggle password visibility
function togglePassword(fieldId = 'password') {
    const field = document.getElementById(fieldId);
    const icon = document.getElementById(fieldId + 'Icon');
    
    if (field.type === 'password') {
        field.type = 'text';
        icon.classList.remove('fa-eye');
        icon.classList.add('fa-eye-slash');
    } else {
        field.type = 'password';
        icon.classList.remove('fa-eye-slash');
        icon.classList.add('fa-eye');
    }
}

// Verify token
async function verifyToken(token) {
    try {
        const response = await fetch('/api/auth/verify', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });
        
        const result = await response.json();
        
        if (result.success) {
            currentUser = result.user;
            const path = window.location.pathname;
            const isLoginPage = path === '/login' || path === '/login.html';
            const isRegisterPage = path === '/register' || path === '/register.html';
            // Only redirect away from auth pages; avoid redirecting when already on target
            if (result.user.role === 'admin') {
                if (path !== '/admin' && (isLoginPage || isRegisterPage)) {
                    window.location.replace('/admin');
                }
            } else {
                if (isLoginPage || isRegisterPage) {
                    window.location.replace('/');
                }
            }
        } else {
            // Invalid token, clear storage
            localStorage.removeItem('authToken');
            localStorage.removeItem('userData');
        }
    } catch (error) {
        console.error('Token verification error:', error);
        localStorage.removeItem('authToken');
        localStorage.removeItem('userData');
    }
}

// Show loading overlay
function showLoading(show) {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) {
        if (show) {
            overlay.classList.add('show');
        } else {
            overlay.classList.remove('show');
        }
    }
}

// Show toast notification
function showToast(message, type = 'info') {
    // Remove existing toast if any
    const existingToast = document.querySelector('.toast-notification');
    if (existingToast) {
        existingToast.remove();
    }
    
    // Create toast element
    const toast = document.createElement('div');
    toast.className = `toast-notification toast-${type}`;
    
    // Set icon based on type
    let icon = 'fas fa-info-circle';
    switch (type) {
        case 'success':
            icon = 'fas fa-check-circle';
            break;
        case 'error':
            icon = 'fas fa-exclamation-circle';
            break;
        case 'warning':
            icon = 'fas fa-exclamation-triangle';
            break;
        case 'info':
        default:
            icon = 'fas fa-info-circle';
            break;
    }
    
    toast.innerHTML = `
        <div class="toast-content">
            <div class="toast-icon">
                <i class="${icon}"></i>
            </div>
            <div class="toast-message">
                <p>${message}</p>
            </div>
            <button class="toast-close" onclick="closeToast(this)">
                <i class="fas fa-times"></i>
            </button>
        </div>
        <div class="toast-progress"></div>
    `;
    
    // Add to page
    document.body.appendChild(toast);
    
    // Trigger animation
    setTimeout(() => {
        toast.classList.add('show');
    }, 10);
    
    // Auto remove after 4 seconds
    setTimeout(() => {
        closeToast(toast.querySelector('.toast-close'));
    }, 4000);
}

// Show confirm toast with action buttons
function showConfirmToast(message, options = {}) {
    const { confirmText = 'Ya', cancelText = 'Batal', onConfirm, onCancel } = options;
    // Remove existing toast if any
    const existingToast = document.querySelector('.toast-notification');
    if (existingToast) {
        existingToast.remove();
    }

    const toast = document.createElement('div');
    toast.className = 'toast-notification toast-warning';
    toast.innerHTML = `
        <div class="toast-content">
            <div class="toast-icon">
                <i class="fas fa-question-circle"></i>
            </div>
            <div class="toast-message">
                <p>${message}</p>
            </div>
            <div class="toast-actions">
                <button class="toast-btn toast-cancel">${cancelText}</button>
                <button class="toast-btn toast-confirm">${confirmText}</button>
            </div>
        </div>
    `;

    document.body.appendChild(toast);
    setTimeout(() => toast.classList.add('show'), 10);

    const cleanup = () => {
        toast.classList.remove('show');
        setTimeout(() => {
            if (toast.parentNode) toast.remove();
        }, 300);
    };

    toast.querySelector('.toast-cancel').addEventListener('click', () => {
        cleanup();
        if (typeof onCancel === 'function') onCancel();
    });
    toast.querySelector('.toast-confirm').addEventListener('click', () => {
        cleanup();
        if (typeof onConfirm === 'function') onConfirm();
    });
}

// Close toast notification
function closeToast(closeBtn) {
    const toast = closeBtn.closest('.toast-notification');
    if (toast) {
        toast.classList.remove('show');
        setTimeout(() => {
            if (toast.parentNode) {
                toast.remove();
            }
        }, 300);
    }
}

// Logout function
function logout() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    currentUser = null;
    window.location.href = 'login.html';
}

// Get current user
function getCurrentUser() {
    if (!currentUser) {
        const userData = localStorage.getItem('userData');
        if (userData) {
            currentUser = JSON.parse(userData);
        } else {
            // Fallback: decode minimal user from token if present
            const token = localStorage.getItem('authToken');
            if (token) {
                try {
                    const payloadBase64 = token.split('.')[1];
                    const payloadJson = atob(payloadBase64);
                    const payload = JSON.parse(payloadJson);
                    currentUser = {
                        id: payload.id,
                        username: payload.username,
                        role: payload.role
                    };
                    localStorage.setItem('userData', JSON.stringify(currentUser));
                } catch (_) {
                    // ignore decode errors
                }
            }
        }
    }
    return currentUser;
}

// Check if user is admin
function isAdmin() {
    const user = getCurrentUser();
    return user && user.role === 'admin';
}

// Check if user is logged in
function isLoggedIn() {
    // Consider logged in if we have either a user object or an auth token
    if (getCurrentUser()) return true;
    return !!localStorage.getItem('authToken');
}

// Redirect to login if not authenticated
function requireAuth() {
    if (!isLoggedIn()) {
        window.location.href = 'login.html';
        return false;
    }
    return true;
}

// Redirect to admin if not admin
function requireAdmin() {
    if (!requireAuth()) {
        return false;
    }
    
    if (!isAdmin()) {
        window.location.href = 'index.html';
        return false;
    }
    return true;
}
