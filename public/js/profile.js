// Profile Page JavaScript
let profileCurrentUser = null;

// Initialize profile page
document.addEventListener('DOMContentLoaded', () => {
    // Check authentication
    if (!requireAuth()) {
        return;
    }
    
    // Load user data
    loadUserData();
    
    // Setup event listeners
    setupProfileEventListeners();
});

// Setup profile event listeners
function setupProfileEventListeners() {
    // Navigation menu
    const navItems = document.querySelectorAll('.nav-menu-item');
    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const section = item.dataset.section;
            showSection(section);
            
            // Update active nav item
            navItems.forEach(nav => nav.classList.remove('active'));
            item.classList.add('active');
        });
    });
    
    // Security form
    const securityForm = document.getElementById('securityForm');
    if (securityForm) {
        securityForm.addEventListener('submit', handlePasswordChange);
    }
}

// Load user data
function loadUserData() {
    profileCurrentUser = getCurrentUser();
    if (!profileCurrentUser) {
        window.location.href = 'login.html';
        return;
    }
    
    // Fetch the latest profile from server to ensure data matches JSON
    fetch('/api/profile/me', {
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
    })
    .then(res => res.json())
    .then(json => {
        if (json && json.success && json.user) {
            profileCurrentUser = { ...profileCurrentUser, ...json.user };
            localStorage.setItem('userData', JSON.stringify(profileCurrentUser));
        }
    })
    .catch(() => {})
    .finally(() => {
        updateProfileDisplay();
        loadFormData();
    });
}

// Update profile display
function updateProfileDisplay() {
    // Update profile info
    document.getElementById('profileName').textContent = profileCurrentUser.fullName || profileCurrentUser.username;
    document.getElementById('profileEmail').textContent = profileCurrentUser.email;
    document.getElementById('profileRole').textContent = profileCurrentUser.role === 'admin' ? 'Admin' : 'User';
    
    // Activity removed
}

// Load form data
function loadFormData() {
    const displayUsername = document.getElementById('displayUsername');
    const displayEmail = document.getElementById('displayEmail');
    const displayFullName = document.getElementById('displayFullName');
    if (displayUsername) displayUsername.textContent = profileCurrentUser.username || '-';
    if (displayEmail) displayEmail.textContent = profileCurrentUser.email || '-';
    if (displayFullName) displayFullName.textContent = profileCurrentUser.fullName || '-';
    const securityFullName = document.getElementById('securityFullName');
    if (securityFullName) securityFullName.value = profileCurrentUser.fullName || '';
    const securityUsername = document.getElementById('securityUsername');
    if (securityUsername) securityUsername.value = profileCurrentUser.username || '';
}

// Activity timeline removed

// Show specific section
function showSection(sectionId) {
    // Hide all sections
    const sections = document.querySelectorAll('.profile-section');
    sections.forEach(section => {
        section.classList.remove('active');
    });
    
    // Show target section
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
        targetSection.classList.add('active');
    }
}

// Handle personal information update
async function handlePersonalUpdate(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const updateData = {
        fullName: formData.get('fullName'),
        username: formData.get('username'),
        email: formData.get('email'),
        phone: formData.get('phone'),
        bio: formData.get('bio')
    };
    
    // Validate form
    if (!validatePersonalForm(updateData)) {
        return;
    }
    
    showLoading(true);
    
    try {
        const response = await fetch('/api/profile/update', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            },
            body: JSON.stringify(updateData)
        });
        
        const result = await response.json();
        
        if (result.success) {
            // Update local user data
            Object.assign(currentUser, updateData);
            localStorage.setItem('userData', JSON.stringify(currentUser));
            
            // Update display
            updateProfileDisplay();
            
            showToast('Profil berhasil diperbarui!', 'success');
        } else {
            showToast(result.message || 'Gagal memperbarui profil!', 'error');
        }
    } catch (error) {
        console.error('Profile update error:', error);
        showToast('Terjadi kesalahan saat memperbarui profil!', 'error');
    } finally {
        showLoading(false);
    }
}

// Handle password change
async function handlePasswordChange(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const passwordData = {
        currentPassword: formData.get('currentPassword'),
        newPassword: formData.get('newPassword'),
        confirmPassword: formData.get('confirmPassword')
    };
    const newUsername = formData.get('securityUsername');
    const newFullName = formData.get('securityFullName');
    
    // Validate form
    // Password update is optional; require ALL password fields if changing
    const hasAnyPassword = passwordData.currentPassword || passwordData.newPassword || passwordData.confirmPassword;
    const hasAllPassword = passwordData.currentPassword && passwordData.newPassword && passwordData.confirmPassword;
    if (hasAnyPassword && !hasAllPassword) {
        showToast('Lengkapi semua field password untuk mengubah password!', 'warning');
        return;
    }
    if (hasAllPassword) {
        if (!validatePasswordForm(passwordData)) {
            return;
        }
    }
    
    showLoading(true);
    
    try {
        // Step 1: update password if requested
        if (hasAllPassword) {
            const response = await fetch('/api/profile/password', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                },
                body: JSON.stringify(passwordData)
            });
            const result = await response.json();
            if (!result.success) {
                showToast(result.message || 'Gagal mengubah password!', 'error');
                showLoading(false);
                return;
            }
        }
        
        // If username change requested, call profile update
        if ((newUsername && newUsername !== profileCurrentUser.username) || (newFullName && newFullName !== profileCurrentUser.fullName)) {
            const updateRes = await fetch('/api/profile/update', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                },
                body: JSON.stringify({
                    fullName: newFullName || profileCurrentUser.fullName,
                    username: newUsername || profileCurrentUser.username,
                    email: profileCurrentUser.email
                })
            });
            const updateJson = await updateRes.json();
            if (!updateJson.success) {
                showToast(updateJson.message || 'Gagal mengubah username!', 'error');
                showLoading(false);
                return;
            }
            profileCurrentUser.username = newUsername || profileCurrentUser.username;
            profileCurrentUser.fullName = newFullName || profileCurrentUser.fullName;
            localStorage.setItem('userData', JSON.stringify(profileCurrentUser));
        }
        
        showToast('Profil berhasil disimpan!', 'success');
        updateProfileDisplay();
        resetSecurityForm();
    } catch (error) {
        console.error('Password change error:', error);
        showToast('Terjadi kesalahan saat mengubah password!', 'error');
    } finally {
        showLoading(false);
    }
}

// Validate personal form
function validatePersonalForm(data) {
    if (!data.fullName || !data.username || !data.email) {
        showToast('Nama lengkap, username, dan email harus diisi!', 'error');
        return false;
    }
    
    if (data.fullName.length < 2) {
        showToast('Nama lengkap minimal 2 karakter!', 'error');
        return false;
    }
    
    if (data.username.length < 3) {
        showToast('Username minimal 3 karakter!', 'error');
        return false;
    }
    
    if (!/^[a-zA-Z0-9_]+$/.test(data.username)) {
        showToast('Username hanya boleh mengandung huruf, angka, dan underscore!', 'error');
        return false;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
        showToast('Format email tidak valid!', 'error');
        return false;
    }
    
    return true;
}

// Validate password form
function validatePasswordForm(data) {
    if (!data.currentPassword || !data.newPassword || !data.confirmPassword) {
        showToast('Semua field password harus diisi!', 'error');
        return false;
    }
    
    if (data.newPassword.length < 6) {
        showToast('Password baru minimal 6 karakter!', 'error');
        return false;
    }
    
    if (data.newPassword !== data.confirmPassword) {
        showToast('Password baru dan konfirmasi password tidak sama!', 'error');
        return false;
    }
    
    if (data.currentPassword === data.newPassword) {
        showToast('Password baru harus berbeda dengan password saat ini!', 'error');
        return false;
    }
    
    return true;
}

// Toggle password visibility
function togglePassword(fieldId) {
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

// Change avatar
// Avatar upload removed

// Reset personal form
function resetForm() {
    loadFormData();
    showToast('Form telah direset!', 'info');
}

// Reset security form
function resetSecurityForm() {
    document.getElementById('securityForm').reset();
}

// Delete account
async function deleteAccount() {
    showConfirmToast('Hapus akun Anda? Tindakan ini tidak dapat dibatalkan.', {
        confirmText: 'Hapus',
        cancelText: 'Batal',
        onConfirm: async () => {
            showLoading(true);
            try {
                let res = await fetch('/api/profile/delete', {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                    }
                });
                if (res.status === 404) {
                    // Retry with POST fallback
                    res = await fetch('/api/profile/delete', {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                        }
                    });
                }
                if (res.status === 404) {
                    // Treat 404 as account already removed or token invalid
                    showToast('Akun tidak ditemukan atau sudah dihapus. Mengalihkan...', 'warning');
                    localStorage.removeItem('authToken');
                    localStorage.removeItem('userData');
                    setTimeout(() => { window.location.href = '/login'; }, 800);
                    return;
                }
                const json = await res.json();
                if (!json.success) {
                    showToast(json.message || 'Gagal menghapus akun!', 'error');
                    return;
                }
                showToast('Akun berhasil dihapus.', 'success');
                localStorage.removeItem('authToken');
                localStorage.removeItem('userData');
                setTimeout(() => {
                    window.location.href = '/login';
                }, 800);
            } catch (e) {
                showToast('Terjadi kesalahan saat menghapus akun!', 'error');
            } finally {
                showLoading(false);
            }
        }
    });
}

// Format date
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
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
