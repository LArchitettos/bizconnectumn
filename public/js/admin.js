// Admin Panel JavaScript
let adminData = {
    users: [],
    news: [],
    umkm: [],
    stats: {}
};

// React-like component functionality for admin panel
class AdminComponent {
    constructor() {
        this.state = {
            users: [],
            news: [],
            umkm: [],
            stats: {}
        };
    }

    setState(newState) {
        this.state = { ...this.state, ...newState };
        this.render();
    }

    render() {
        // This will be called when state changes
        console.log('Admin state updated:', this.state);
    }
}

const adminComponent = new AdminComponent();

// Initialize admin panel
document.addEventListener('DOMContentLoaded', () => {
    // Check admin authentication
    if (!requireAdmin()) {
        return;
    }
    
    // Load admin data
    loadAdminData();
    
    // Setup event listeners
    setupAdminEventListeners();
    
    // Update admin name
    updateAdminName();

    // Setup mobile sidebar toggle
    setupSidebarToggle();
});

// Setup admin event listeners
function setupAdminEventListeners() {
    // Sidebar navigation
    const navItems = document.querySelectorAll('.nav-item');
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
    
    // Close sidebar on nav click (mobile)
    navItems.forEach(item => item.addEventListener('click', () => closeSidebar()));
    
    // Setup search functionality
    setupSearchFunctionality();
}

// Sidebar toggle handlers
function setupSidebarToggle() {
    const overlay = document.getElementById('sidebarOverlay');
    if (overlay) overlay.addEventListener('click', closeSidebar);
}

function toggleSidebar() {
    const sidebar = document.getElementById('adminSidebar');
    const overlay = document.getElementById('sidebarOverlay');
    if (!sidebar || !overlay) return;
    const willOpen = !sidebar.classList.contains('open');
    sidebar.classList.toggle('open', willOpen);
    overlay.classList.toggle('show', willOpen);
}

function closeSidebar() {
    const sidebar = document.getElementById('adminSidebar');
    const overlay = document.getElementById('sidebarOverlay');
    if (!sidebar || !overlay) return;
    sidebar.classList.remove('open');
    overlay.classList.remove('show');
}

// Setup search functionality for all sections
function setupSearchFunctionality() {
    // Users search
    const usersSearchInput = document.getElementById('usersSearchInput');
    if (usersSearchInput) {
        usersSearchInput.addEventListener('input', (e) => {
            const query = e.target.value.trim();
            searchUsers(query);
        });
    }
    
    // News search
    const newsSearchInput = document.getElementById('newsSearchInput');
    if (newsSearchInput) {
        newsSearchInput.addEventListener('input', (e) => {
            const query = e.target.value.trim();
            searchNews(query);
        });
    }
    
    // UMKM search
    const umkmSearchInput = document.getElementById('umkmSearchInput');
    if (umkmSearchInput) {
        umkmSearchInput.addEventListener('input', (e) => {
            const query = e.target.value.trim();
            searchUmkm(query);
        });
    }
}

// Search functions
function searchUsers(query) {
    const tableBody = document.getElementById('usersTableBody');
    const searchInfo = document.getElementById('usersSearchInfo');
    const searchCount = document.getElementById('usersSearchCount');
    const searchClear = document.getElementById('usersSearchClear');
    
    if (!tableBody) return;
    
    if (!query) {
        // Show all users
        loadUsersData();
        searchInfo.style.display = 'none';
        searchClear.style.display = 'none';
        return;
    }
    
    // Filter users based on query
    const filteredUsers = adminData.users.filter(user => {
        const searchText = `${user.username} ${user.email} ${user.fullName}`.toLowerCase();
        return searchText.includes(query.toLowerCase());
    });
    
    // Update table
    tableBody.innerHTML = filteredUsers.map(user => `
        <tr>
            <td>${user.id}</td>
            <td>${highlightSearchTerm(user.username, query)}</td>
            <td>${highlightSearchTerm(user.email, query)}</td>
            <td>${highlightSearchTerm(user.fullName, query)}</td>
            <td>
                <span class="status-badge ${user.role === 'admin' ? 'status-active' : 'status-pending'}">
                    ${user.role}
                </span>
            </td>
            <td>
                <span class="status-badge ${user.isActive ? 'status-active' : 'status-inactive'}">
                    ${user.isActive ? 'Aktif' : 'Tidak Aktif'}
                </span>
            </td>
            <td>${formatDate(user.lastLogin)}</td>
            <td>
                <div class="action-buttons">
                    <button class="btn btn-secondary" onclick="editUser(${user.id})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-danger" onclick="deleteUser(${user.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
    
    // Show search results info
    searchCount.textContent = filteredUsers.length;
    searchInfo.style.display = 'block';
    searchClear.style.display = 'block';
    
    // Show toast notification
    if (filteredUsers.length > 0) {
        showToast(`Ditemukan ${filteredUsers.length} user untuk "${query}"`, 'success');
    } else {
        showToast(`Tidak ada user yang ditemukan untuk "${query}"`, 'warning');
    }
}

function searchNews(query) {
    const tableBody = document.getElementById('newsTableBody');
    const searchInfo = document.getElementById('newsSearchInfo');
    const searchCount = document.getElementById('newsSearchCount');
    const searchClear = document.getElementById('newsSearchClear');
    
    if (!tableBody) return;
    
    if (!query) {
        // Show all news
        loadNewsData();
        searchInfo.style.display = 'none';
        searchClear.style.display = 'none';
        return;
    }
    
    // Filter news based on query
    const filteredNews = adminData.news.filter(news => {
        const categoryText = (news.category || news.category_name || '').toLowerCase();
        const searchText = `${news.title} ${categoryText} ${news.author}`.toLowerCase();
        return searchText.includes(query.toLowerCase());
    });
    
    // Update table
    tableBody.innerHTML = filteredNews.map(news => `
        <tr>
            <td>${news.id}</td>
            <td>${highlightSearchTerm(news.title, query)}</td>
            <td>${highlightSearchTerm(news.category || news.category_name || '', query)}</td>
            <td>${highlightSearchTerm(news.author, query)}</td>
            <td>${formatDateOnly(news.date)}</td>
            <td>${news.views}</td>
            <td>
                <div class="action-buttons">
                    <button class="btn btn-secondary" onclick="editNews(${news.id})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-danger" onclick="deleteNews(${news.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
    
    // Show search results info
    searchCount.textContent = filteredNews.length;
    searchInfo.style.display = 'block';
    searchClear.style.display = 'block';
    
    // Show toast notification
    if (filteredNews.length > 0) {
        showToast(`Ditemukan ${filteredNews.length} berita untuk "${query}"`, 'success');
    } else {
        showToast(`Tidak ada berita yang ditemukan untuk "${query}"`, 'warning');
    }
}

function searchUmkm(query) {
    const tableBody = document.getElementById('umkmTableBody');
    const searchInfo = document.getElementById('umkmSearchInfo');
    const searchCount = document.getElementById('umkmSearchCount');
    const searchClear = document.getElementById('umkmSearchClear');
    
    if (!tableBody) return;
    
    if (!query) {
        // Show all UMKM
        loadUmkmData();
        searchInfo.style.display = 'none';
        searchClear.style.display = 'none';
        return;
    }
    
    // Filter UMKM based on query
    const filteredUmkm = adminData.umkm.filter(umkm => {
        const searchText = `${umkm.name} ${umkm.owner} ${umkm.category}`.toLowerCase();
        return searchText.includes(query.toLowerCase());
    });
    
    // Update table
    tableBody.innerHTML = filteredUmkm.map(umkm => `
        <tr>
            <td>${umkm.id}</td>
            <td>${highlightSearchTerm(umkm.name, query)}</td>
            <td>${highlightSearchTerm(umkm.owner, query)}</td>
            <td>${highlightSearchTerm(umkm.category, query)}</td>
            <td>${umkm.rating}</td>
            <td>
                <span class="status-badge ${umkm.status === 'approved' ? 'status-approved' : 'status-pending'}">
                    ${umkm.status === 'approved' ? 'Disetujui' : 'Menunggu'}
                </span>
            </td>
            <td>${formatDate(umkm.createdAt)}</td>
            <td>
                <div class="action-buttons">
                    <button class="btn btn-primary" onclick="openManageUmkm(${umkm.id})" title="Kelola UMKM">
                        <i class="fas fa-cubes"></i>
                    </button>
                    <button class="btn btn-success" onclick="approveUmkm(${umkm.id})" ${umkm.status === 'approved' ? 'disabled' : ''}>
                        <i class="fas fa-check"></i>
                    </button>
                    <button class="btn btn-secondary" onclick="editUmkm(${umkm.id})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-danger" onclick="deleteUmkm(${umkm.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
    
    // Show search results info
    searchCount.textContent = filteredUmkm.length;
    searchInfo.style.display = 'block';
    searchClear.style.display = 'block';
    
    // Show toast notification
    if (filteredUmkm.length > 0) {
        showToast(`Ditemukan ${filteredUmkm.length} UMKM untuk "${query}"`, 'success');
    } else {
        showToast(`Tidak ada UMKM yang ditemukan untuk "${query}"`, 'warning');
    }
}

// Helper function to highlight search terms
function highlightSearchTerm(text, query) {
    if (!query || !text) return text;
    
    const regex = new RegExp(`(${query})`, 'gi');
    return text.replace(regex, '<mark class="search-highlight">$1</mark>');
}

// Clear search function
function clearSearch(section) {
    const searchInput = document.getElementById(`${section}SearchInput`);
    const searchInfo = document.getElementById(`${section}SearchInfo`);
    const searchClear = document.getElementById(`${section}SearchClear`);
    
    if (searchInput) {
        searchInput.value = '';
        searchInput.focus();
    }
    
    if (searchInfo) {
        searchInfo.style.display = 'none';
    }
    
    if (searchClear) {
        searchClear.style.display = 'none';
    }
    
    // Reload the section data
    switch(section) {
        case 'users':
            loadUsersData();
            break;
        case 'news':
            loadNewsData();
            break;
        case 'umkm':
            loadUmkmData();
            break;
    }
}

// Show specific section
function showSection(sectionId) {
    // Hide all sections
    const sections = document.querySelectorAll('.admin-section');
    sections.forEach(section => {
        section.classList.remove('active');
    });
    
    // Show target section
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
        targetSection.classList.add('active');
        
        // Load section data
        switch(sectionId) {
            case 'dashboard':
                loadDashboardData();
                break;
            case 'users':
                loadUsersData();
                break;
            case 'news':
                loadNewsData();
                break;
            case 'umkm':
                loadUmkmData();
                break;
        }
    }
}

// Open edit product modal
async function openEditProduct(umkmId, productId) {
    try {
        showLoading(true);
        const res = await fetch(`/api/admin/umkm/${umkmId}`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('authToken')}` }
        });
        const json = await res.json();
        if (!res.ok || json.success === false) throw new Error(json.message || 'Gagal memuat detail UMKM');
        const umkm = json.umkm;
        // Determine item type by checking which array contains the productId (compare as numbers)
        const asNum = (v) => Number(v);
        const isService = Array.isArray(umkm.services) && umkm.services.some(x => asNum(x.id) === asNum(productId));
        const listForLookup = isService ? (umkm.services || []) : (umkm.products || []);
        const p = listForLookup.find(x => asNum(x.id) === asNum(productId));
        if (!p) throw new Error('Produk/Jasa tidak ditemukan');
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Edit Produk/Jasa - ${umkm.name}</h3>
                    <button class="modal-close" onclick="closeModal(this)"><i class="fas fa-times"></i></button>
                </div>
                <div class="modal-body">
                    <form id="editProductForm">
                        <input type="hidden" name="umkmId" value="${umkmId}">
                        <input type="hidden" name="productId" value="${productId}">
                        <input type="hidden" name="type" value="${isService ? 'service' : 'product'}">
                        <div class="form-group">
                            <label>Nama</label>
                            <input type="text" name="name" value="${p.name || ''}" required>
                        </div>
                        <div class="form-group">
                            <label>Deskripsi</label>
                            <textarea name="description" rows="3">${p.description || ''}</textarea>
                        </div>
                        <div class="form-group">
                            <label>Harga (Rp)</label>
                            <input type="number" name="price" value="${p.price ?? ''}" required min="0" step="1">
                        </div>
                        <div class="form-group">
                            <label>URL Gambar Produk</label>
                            <input type="url" name="image" value="${p.image || ''}" placeholder="https://...">
                        </div>
                        <div class="form-group">
                            <label>Stok (opsional)</label>
                            <input type="number" name="stock" value="${p.stock ?? ''}" min="0" step="1">
                        </div>
                        <div class="form-group">
                            <label>Durasi (opsional, untuk jasa)</label>
                            <input type="text" name="duration" value="${p.duration || ''}" placeholder="mis. 3-5 hari">
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" onclick="closeModal(this)">Batal</button>
                    <button type="button" class="btn btn-danger" onclick="deleteProduct(${umkmId}, ${productId}, '${isService ? 'service' : 'product'}')">Hapus</button>
                    <button type="button" class="btn btn-primary" onclick="submitEditProduct(${umkmId}, ${productId})">Simpan</button>
                </div>
            </div>
        `;
        document.getElementById('modalContainer').appendChild(modal);
    } catch (e) {
        console.error(e);
        showToast(e.message || 'Gagal membuka edit produk', 'error');
    } finally {
        showLoading(false);
    }
}

// Delete product
async function deleteProduct(umkmId, productId, explicitType) {
    showConfirmToast('Hapus produk/jasa ini? Tindakan tidak dapat dibatalkan.', async () => {
        try {
            // If type not provided, try to infer by fetching details
            let type = explicitType;
            if (!type) {
                try {
                    const det = await fetch(`/api/admin/umkm/${umkmId}`, { headers: { 'Authorization': `Bearer ${localStorage.getItem('authToken')}` } });
                    const detJson = await det.json();
                    const asNum = (v) => Number(v);
                    if (Array.isArray(detJson?.umkm?.services) && detJson.umkm.services.some(x => asNum(x.id) === asNum(productId))) {
                        type = 'service';
                    } else {
                        type = 'product';
                    }
                } catch (_) { type = 'product'; }
            }
            const res = await fetch(`/api/admin/umkm/${umkmId}/products/${productId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ type })
            });
            const json = await res.json().catch(() => ({}));
            if (!res.ok || json.success === false) throw new Error(json.message || 'Gagal menghapus produk');
            showToast('Produk berhasil dihapus!', 'success');
            document.querySelector('.modal-overlay')?.remove();
            await openManageUmkm(umkmId);
            await refreshSectionData('umkm');
            try { addActivity({ ts: Date.now(), icon: 'fas fa-trash', iconBg: '#ef4444', title: 'Produk dihapus', description: `Produk UMKM #${umkmId} dihapus` }); } catch (_) {}
        } catch (e) {
            console.error(e);
            showToast(e.message || 'Gagal menghapus produk', 'error');
        }
    });
}

// Submit edit product
async function submitEditProduct(umkmId, productId) {
    const form = document.getElementById('editProductForm');
    if (!form) return;
    const fd = new FormData(form);
    const payload = {};
    for (const [k, v] of fd.entries()) {
        if (k === 'umkmId' || k === 'productId') continue;
        if (v !== '') payload[k] = v;
    }
    // Normalize payload types and fields
    if (payload.price !== undefined) payload.price = Number(payload.price);
    if ((payload.type || '') === 'product') {
        if (payload.stock !== undefined && payload.stock !== '') {
            payload.stock = Number(payload.stock);
        }
        // Remove service-only fields
        delete payload.duration;
    } else if ((payload.type || '') === 'service') {
        // Remove product-only fields
        delete payload.stock;
    }
    try {
        const res = await fetch(`/api/admin/umkm/${umkmId}/products/${productId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            },
            body: JSON.stringify(payload)
        });
        const json = await res.json();
        if (!res.ok || json.success === false) throw new Error(json.message || 'Gagal menyimpan produk');
        showToast('Produk berhasil diperbarui!', 'success');
        document.querySelector('.modal-overlay')?.remove();
        await openManageUmkm(umkmId);
        await refreshSectionData('umkm');
        try { addActivity({ ts: Date.now(), icon: 'fas fa-edit', iconBg: '#22c55e', title: 'Produk diperbarui', description: `Produk UMKM #${umkmId} diperbarui` }); } catch (_) {}
    } catch (e) {
        console.error(e);
        showToast(e.message || 'Gagal menyimpan produk', 'error');
    }
}
// Load admin data
async function loadAdminData() {
    try {
        showLoading(true);
        
    // Load all data in parallel with Authorization header
    const authHeader = { 'Authorization': `Bearer ${localStorage.getItem('authToken')}` };
    const [usersRes, newsRes, umkmRes] = await Promise.all([
        fetch('/api/admin/users', { headers: authHeader }),
        fetch('/api/admin/news', { headers: authHeader }),
        fetch('/api/admin/umkm', { headers: authHeader })
    ]);

    // If unauthorized, redirect to login
    if (usersRes.status === 401 || usersRes.status === 403 ||
        newsRes.status === 401 || newsRes.status === 403 ||
        umkmRes.status === 401 || umkmRes.status === 403) {
        showToast('Sesi berakhir atau tidak berizin. Silakan login kembali.', 'error');
        logout();
        return;
    }

    const usersJson = await usersRes.json();
    const newsJson = await newsRes.json();
    const umkmJson = await umkmRes.json();

    // Normalize to arrays to prevent map/filter errors
    adminData.users = Array.isArray(usersJson) ? usersJson : (Array.isArray(usersJson?.users) ? usersJson.users : []);
    adminData.news = (Array.isArray(newsJson) ? newsJson : (Array.isArray(newsJson?.articles) ? newsJson.articles : []))
        .map(n => ({ ...n, category: n.category || n.category_name || '' }));
    adminData.umkm = Array.isArray(umkmJson) ? umkmJson : (Array.isArray(umkmJson?.businesses) ? umkmJson.businesses : []);
        
        // Calculate stats
        calculateStats();
        
        // Load dashboard by default
        loadDashboardData();
        
    } catch (error) {
        console.error('Error loading admin data:', error);
        showToast('Gagal memuat data admin!', 'error');
    } finally {
        showLoading(false);
    }
}

// Calculate statistics
function calculateStats() {
    adminData.stats = {
        totalUsers: adminData.users.length,
        totalNews: adminData.news.length,
        totalUmkm: adminData.umkm.length,
        pendingApprovals: adminData.umkm.filter(umkm => umkm.status === 'pending').length
    };
}

// Load dashboard data
function loadDashboardData() {
    // Update stats cards
    document.getElementById('totalUsers').textContent = adminData.stats.totalUsers;
    document.getElementById('totalNews').textContent = adminData.stats.totalNews;
    document.getElementById('totalUmkm').textContent = adminData.stats.totalUmkm;
    document.getElementById('pendingApprovals').textContent = adminData.stats.pendingApprovals;
    
    // Load recent activity
    loadRecentActivity();
    
    // Render pending approvals list instead of daily chart
    renderPendingApprovals();
}

// Load recent activity
function loadRecentActivity() {
    const activityContainer = document.getElementById('recentActivity');
    if (!activityContainer) return;
    // Build recent activities from latest changes in users, news, and umkm by timestamp
    const activities = [];
    try {
        // Users: createdAt, updatedAt, lastLogin
        (adminData.users || []).forEach(u => {
            if (u.createdAt) activities.push({ ts: new Date(u.createdAt).getTime(), icon: 'fas fa-user-plus', iconBg: '#667eea', title: 'User dibuat', description: `${u.fullName || u.username} dibuat` });
            if (u.updatedAt) activities.push({ ts: new Date(u.updatedAt).getTime(), icon: 'fas fa-user-edit', iconBg: '#a78bfa', title: 'User diperbarui', description: `${u.fullName || u.username} diperbarui` });
            if (u.lastLogin) activities.push({ ts: new Date(u.lastLogin).getTime(), icon: 'fas fa-sign-in-alt', iconBg: '#38bdf8', title: 'Login user', description: `${u.fullName || u.username} login` });
        });
        // News: date (published/created), updatedAt optional
        (adminData.news || []).forEach(n => {
            if (n.date) activities.push({ ts: new Date(n.date).getTime(), icon: 'fas fa-newspaper', iconBg: '#f093fb', title: 'Berita dibuat/dipublikasi', description: n.title });
            if (n.updatedAt) activities.push({ ts: new Date(n.updatedAt).getTime(), icon: 'fas fa-edit', iconBg: '#fb7185', title: 'Berita diperbarui', description: n.title });
        });
        // UMKM: createdAt, approvedAt, updatedAt
        (adminData.umkm || []).forEach(b => {
            if (b.createdAt) activities.push({ ts: new Date(b.createdAt).getTime(), icon: 'fas fa-store', iconBg: '#4facfe', title: 'UMKM diajukan', description: b.name });
            if (b.approvedAt) activities.push({ ts: new Date(b.approvedAt).getTime(), icon: 'fas fa-check-circle', iconBg: '#43e97b', title: 'UMKM disetujui', description: b.name });
            if (b.updatedAt) activities.push({ ts: new Date(b.updatedAt).getTime(), icon: 'fas fa-edit', iconBg: '#22c55e', title: 'UMKM diperbarui', description: b.name });
        });
    } catch (_) {}

    activities.sort((a, b) => b.ts - a.ts);
    const fmt = (ts) => {
        if (!ts) return '';
        const d = new Date(ts);
        return d.toLocaleString('id-ID', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    };

    activityContainer.innerHTML = activities.slice(0, 10).map(activity => `
        <div class="activity-item">
            <div class="activity-icon" style="background: ${activity.iconBg}">
                <i class="${activity.icon}"></i>
            </div>
            <div class="activity-content">
                <h4>${activity.title}</h4>
                <p>${activity.description}</p>
            </div>
            <div class="activity-time">${fmt(activity.ts)}</div>
        </div>
    `).join('');
}

// Add an activity item to the Recent Activity list (UI only)
function addActivity(entry) {
    const list = document.getElementById('recentActivity');
    if (!list) return;
    const ts = entry.ts || Date.now();
    const d = new Date(ts);
    const time = d.toLocaleString('id-ID', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    const item = document.createElement('div');
    item.className = 'activity-item';
    item.innerHTML = `
        <div class="activity-icon" style="background: ${entry.iconBg || '#667eea'}">
            <i class="${entry.icon || 'fas fa-info-circle'}"></i>
        </div>
        <div class="activity-content">
            <h4>${entry.title || 'Aktivitas'}</h4>
            <p>${entry.description || ''}</p>
        </div>
        <div class="activity-time">${time}</div>
    `;
    list.prepend(item);
}

// Load users data
function loadUsersData() {
    const tableBody = document.getElementById('usersTableBody');
    if (!tableBody) return;
    
    tableBody.innerHTML = adminData.users.map(user => `
        <tr>
            <td>${user.id}</td>
            <td>${user.username}</td>
            <td>${user.email}</td>
            <td>${user.fullName}</td>
            <td>
                <span class="status-badge ${user.role === 'admin' ? 'status-active' : 'status-pending'}">
                    ${user.role}
                </span>
            </td>
            <td>
                <span class="status-badge ${user.isActive ? 'status-active' : 'status-inactive'}">
                    ${user.isActive ? 'Aktif' : 'Tidak Aktif'}
                </span>
            </td>
            <td>${formatDate(user.lastLogin)}</td>
            <td>
                <div class="action-buttons">
                    <button class="btn btn-secondary" onclick="editUser(${user.id})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-danger" onclick="deleteUser(${user.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

// Load news data
function loadNewsData() {
    const tableBody = document.getElementById('newsTableBody');
    if (!tableBody) return;
    
    tableBody.innerHTML = adminData.news.map(news => `
        <tr>
            <td>${news.id}</td>
            <td>${news.title}</td>
            <td>${news.category || news.category_name || ''}</td>
            <td>${news.author}</td>
            <td>${formatDateOnly(news.date)}</td>
            <td>${news.views}</td>
            <td>
                <div class="action-buttons">
                    <button class="btn btn-secondary" onclick="editNews(${news.id})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-danger" onclick="deleteNews(${news.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

// Load UMKM data
function loadUmkmData() {
    const tableBody = document.getElementById('umkmTableBody');
    if (!tableBody) return;
    
    tableBody.innerHTML = adminData.umkm.map(umkm => `
        <tr>
            <td>${umkm.id}</td>
            <td>${umkm.name}</td>
            <td>${umkm.owner}</td>
            <td>${umkm.category}</td>
            <td>${umkm.rating}</td>
            <td>
                <span class="status-badge ${umkm.status === 'approved' ? 'status-approved' : 'status-pending'}">
                    ${umkm.status === 'approved' ? 'Disetujui' : 'Menunggu'}
                </span>
            </td>
            <td>${formatDate(umkm.createdAt)}</td>
            <td>
                <div class="action-buttons">
                    <button class="btn btn-primary" onclick="openManageUmkm(${umkm.id})" title="Kelola UMKM">
                        <i class="fas fa-cubes"></i>
                    </button>
                    <button class="btn btn-success" onclick="approveUmkm(${umkm.id})" ${umkm.status === 'approved' ? 'disabled' : ''}>
                        <i class="fas fa-check"></i>
                    </button>
                    <button class="btn btn-secondary" onclick="editUmkm(${umkm.id})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-danger" onclick="deleteUmkm(${umkm.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

// Open UMKM manage modal (details + products)
async function openManageUmkm(umkmId) {
    try {
        showLoading(true);
        const res = await fetch(`/api/admin/umkm/${umkmId}`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('authToken')}` }
        });
        const contentType = res.headers.get('content-type') || '';
        if (!contentType.includes('application/json')) {
            const text = await res.text();
            throw new Error(`Gagal memuat detail UMKM (status ${res.status}).`);
        }
        const json = await res.json();
        if (!res.ok || json.success === false) throw new Error(json.message || `Gagal memuat detail UMKM (status ${res.status})`);
        const umkm = json.umkm;
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';

        const productItemsHtml = (Array.isArray(umkm.products) ? umkm.products : []).map(p => `
            <div class="product-row">
                <div class="product-row-image">
                    ${p.image ? `<img src="${p.image}" alt="${p.name}" onerror="this.style.display='none'">` : ''}
                </div>
                <div class="product-row-info">
                    <strong>${p.name}</strong>
                    <small>Rp ${Number(p.price || 0).toLocaleString('id-ID')}</small>
                    ${p.stock !== undefined ? `<small>Stok: ${p.stock}</small>` : ''}
                </div>
                <div class="product-row-actions">
                    <button class="btn btn-secondary" onclick="openEditProduct(${umkm.id}, ${p.id})" title="Edit Produk"><i class="fas fa-edit"></i></button>
                </div>
            </div>
        `).join('');

        const serviceItemsHtml = (Array.isArray(umkm.services) ? umkm.services : []).map(s => `
            <div class="product-row">
                <div class="product-row-image">
                    ${s.image ? `<img src="${s.image}" alt="${s.name}" onerror="this.style.display='none'">` : ''}
                </div>
                <div class="product-row-info">
                    <strong>${s.name}</strong>
                    <small>Rp ${Number(s.price || 0).toLocaleString('id-ID')}</small>
                    ${s.duration ? `<small>Durasi: ${s.duration}</small>` : ''}
                </div>
                <div class="product-row-actions">
                    <button class="btn btn-secondary" onclick="openEditProduct(${umkm.id}, ${s.id})" title="Edit Jasa"><i class="fas fa-edit"></i></button>
                </div>
            </div>
        `).join('');

        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Kelola UMKM - ${umkm.name}</h3>
                    <div style="display:flex; gap:8px; align-items:center;">
                        <button class="modal-close" title="Print Produk" onclick="printUmkmProductsPdf(${umkm.id})"><i class="fas fa-print"></i></button>
                        <button class="modal-close" onclick="closeModal(this)" title="Tutup"><i class="fas fa-times"></i></button>
                    </div>
                </div>
                <div class="modal-body">
                    <div class="form-group">
                        <label>Informasi</label>
                        <div style="display:flex; gap:1rem; align-items:center;">
                            <div style="width:72px;height:72px;border-radius:8px;overflow:hidden;background:#f3f4f6;flex-shrink:0;">
                                ${umkm.image ? `<img src="${umkm.image}" alt="${umkm.name}" style="width:100%;height:100%;object-fit:cover;" onerror="this.style.display='none'">` : ''}
                            </div>
                            <div>
                                <div><strong>Pemilik:</strong> ${umkm.owner}</div>
                                <div><strong>Kategori:</strong> ${umkm.category}</div>
                                <div><strong>Status:</strong> ${umkm.status}</div>
                            </div>
                        </div>
                    </div>
                    <div class="form-group">
                        <label>Produk</label>
                        <div class="products-list">
                            ${productItemsHtml || '<p>Belum ada produk.</p>'}
                        </div>
                    </div>
                    <div class="form-group">
                        <label>Jasa</label>
                        <div class="products-list">
                            ${serviceItemsHtml || '<p>Belum ada jasa.</p>'}
                        </div>
                    </div>
                    <form id="addProductForm">
                        <h4 style="margin:0 0 .5rem 0;">Tambah Produk/Jasa</h4>
                        <input type="hidden" name="umkmId" value="${umkm.id}">
                        <div class="form-group">
                            <label>Jenis</label>
                            <select name="type" required>
                                <option value="product" selected>Produk</option>
                                <option value="service">Jasa</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label>Nama</label>
                            <input type="text" name="name" required>
                        </div>
                        <div class="form-group">
                            <label>Deskripsi</label>
                            <textarea name="description" rows="3"></textarea>
                        </div>
                        <div class="form-group">
                            <label>Harga (Rp)</label>
                            <input type="number" name="price" required min="0" step="1">
                        </div>
                        <div class="form-group">
                            <label>URL Gambar Produk</label>
                            <input type="url" name="image" placeholder="https://...">
                        </div>
                        <div class="form-group">
                            <label>Stok (opsional)</label>
                            <input type="number" name="stock" min="0" step="1">
                        </div>
                        <div class="form-group">
                            <label>Durasi (opsional, untuk jasa)</label>
                            <input type="text" name="duration" placeholder="mis. 3-5 hari">
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" onclick="closeModal(this)">Tutup</button>
                    <button type="button" class="btn btn-primary" onclick="submitAddProduct(${umkm.id})">Tambah Produk</button>
                </div>
            </div>
        `;
        document.getElementById('modalContainer').appendChild(modal);
    } catch (e) {
        console.error(e);
        showToast(e.message || 'Gagal membuka kelola UMKM', 'error');
    } finally {
        showLoading(false);
    }
}

// Submit add product
async function submitAddProduct(umkmId) {
    const form = document.getElementById('addProductForm');
    if (!form) return;
    const fd = new FormData(form);
    const payload = {};
    for (const [k, v] of fd.entries()) {
        if (v !== '') payload[k] = v;
    }
    // Client-side validation
    if (!payload.name || payload.name.trim() === '') {
        showToast('Nama produk/jasa wajib diisi', 'error');
        return;
    }
    if (payload.price === undefined || payload.price === '' || isNaN(Number(payload.price))) {
        showToast('Harga wajib diisi dan berupa angka', 'error');
        return;
    }
    // Normalize numeric fields
    payload.price = Number(payload.price);
    if ((payload.type || 'product') === 'product') {
        if (payload.stock !== undefined && payload.stock !== '') payload.stock = Number(payload.stock);
        delete payload.duration;
    } else {
        delete payload.stock;
        // duration remains for service
    }
    try {
        const res = await fetch(`/api/admin/umkm/${umkmId}/products`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            },
            body: JSON.stringify(payload)
        });
        const json = await res.json();
        if (!res.ok || json.success === false) throw new Error(json.message || 'Gagal menambahkan produk');
        showToast('Produk berhasil ditambahkan!', 'success');
        // Refresh detail in modal by reopening
        document.querySelector('.modal-overlay')?.remove();
        await openManageUmkm(umkmId);
        // Refresh table and stats
        await refreshSectionData('umkm');
        try { addActivity({ ts: Date.now(), icon: 'fas fa-plus', iconBg: '#3b82f6', title: 'Produk ditambahkan', description: `Produk baru ditambahkan ke UMKM #${umkmId}` }); } catch (_) {}
    } catch (e) {
        console.error(e);
        showToast(e.message || 'Gagal menambahkan produk', 'error');
    }
}

// User management functions
function openUserModal(userId = null) {
    // Create user modal
    const modal = createModal('user', userId);
    document.getElementById('modalContainer').appendChild(modal);
}

function editUser(userId) {
    const user = adminData.users.find(u => u.id === userId);
    if (user) {
        openUserModal(userId);
    }
}

async function deleteUser(userId) {
    showConfirmToast('Hapus user ini? Tindakan tidak dapat dibatalkan.', async () => {
        try {
            const response = await fetch(`/api/admin/users/${userId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                }
            });
            if (response.ok) {
                showToast('User berhasil dihapus!', 'success');
                await refreshSectionData('users');
            } else {
                showToast('Gagal menghapus user!', 'error');
            }
        } catch (error) {
            console.error('Error deleting user:', error);
            showToast('Terjadi kesalahan saat menghapus user!', 'error');
        }
    });
}

// News management functions
function openNewsModal(newsId = null) {
    const modal = createModal('news', newsId);
    document.getElementById('modalContainer').appendChild(modal);
}

function editNews(newsId) {
    const news = adminData.news.find(n => n.id === newsId);
    if (news) {
        openNewsModal(newsId);
    }
}

async function deleteNews(newsId) {
    showConfirmToast('Hapus berita ini? Tindakan tidak dapat dibatalkan.', async () => {
        try {
            const response = await fetch(`/api/admin/news/${newsId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                }
            });
            if (response.ok) {
                showToast('Berita berhasil dihapus!', 'success');
                await refreshSectionData('news');
                try { addActivity({ ts: Date.now(), icon: 'fas fa-trash', iconBg: '#ef4444', title: 'Berita dihapus', description: `Berita #${newsId} dihapus` }); } catch (_) {}
            } else {
                showToast('Gagal menghapus berita!', 'error');
            }
        } catch (error) {
            console.error('Error deleting news:', error);
            showToast('Terjadi kesalahan saat menghapus berita!', 'error');
        }
    });
}

// UMKM management functions
function openUmkmModal(umkmId = null) {
    const modal = createModal('umkm', umkmId);
    document.getElementById('modalContainer').appendChild(modal);
}

function editUmkm(umkmId) {
    const umkm = adminData.umkm.find(u => u.id === umkmId);
    if (umkm) {
        openUmkmModal(umkmId);
    }
}

async function approveUmkm(umkmId) {
    try {
        const response = await fetch(`/api/admin/umkm/${umkmId}/approve`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            }
        });
        
        if (response.ok) {
            showToast('UMKM berhasil disetujui!', 'success');
            await refreshSectionData('umkm');
        } else {
            showToast('Gagal menyetujui UMKM!', 'error');
        }
    } catch (error) {
        console.error('Error approving UMKM:', error);
        showToast('Terjadi kesalahan saat menyetujui UMKM!', 'error');
    }
}

async function deleteUmkm(umkmId) {
    showConfirmToast('Hapus UMKM ini? Tindakan tidak dapat dibatalkan.', async () => {
        try {
            const response = await fetch(`/api/admin/umkm/${umkmId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                }
            });
            if (response.ok) {
                showToast('UMKM berhasil dihapus!', 'success');
                await refreshSectionData('umkm');
            } else {
                showToast('Gagal menghapus UMKM!', 'error');
            }
        } catch (error) {
            console.error('Error deleting UMKM:', error);
            showToast('Terjadi kesalahan saat menghapus UMKM!', 'error');
        }
    });
}

// Create modal for CRUD operations
function createModal(type, id = null) {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>${id ? 'Edit' : 'Tambah'} ${type === 'user' ? 'User' : type === 'news' ? 'Berita' : 'UMKM'}</h3>
                <button class="modal-close" onclick="closeModal(this)">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="modal-body">
                <form id="${type}Form">
                    ${getFormFields(type, id)}
                </form>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" onclick="closeModal(this)">Batal</button>
                <button type="button" class="btn btn-primary" onclick="save${type.charAt(0).toUpperCase() + type.slice(1)}()">Simpan</button>
            </div>
        </div>
    `;
    // Prefill if editing
    setTimeout(() => prefillForm(type, id), 0);
    return modal;
}

// Get form fields based on type
function getFormFields(type, id) {
    switch(type) {
        case 'user':
            return `
                <input type="hidden" name="id" value="${id ?? ''}">
                <div class="form-group">
                    <label>Username</label>
                    <input type="text" name="username" required>
                </div>
                <div class="form-group">
                    <label>Email</label>
                    <input type="email" name="email" required>
                </div>
                <div class="form-group">
                    <label>Nama Lengkap</label>
                    <input type="text" name="fullName" required>
                </div>
                ${id ? '' : `
                <div class="form-group">
                    <label>Password</label>
                    <input type="password" name="password" required minlength="6" placeholder="Minimal 6 karakter">
                </div>
                <div class="form-group">
                    <label>Konfirmasi Password</label>
                    <input type="password" name="confirmPassword" required minlength="6" placeholder="Ulangi password">
                </div>
                `}
                <div class="form-group">
                    <label>Role</label>
                    <select name="role" required>
                        <option value="" disabled selected>Pilih Role</option>
                        <option value="user">👤 User</option>
                        <option value="admin">🛡️ Admin</option>
                    </select>
                </div>
            `;
        case 'news':
            return `
                <input type="hidden" name="id" value="${id ?? ''}">
                <div class="form-group">
                    <label>Judul</label>
                    <input type="text" name="title" required>
                </div>
                <div class="form-group">
                    <label>Kategori</label>
                    <select name="category" required>
                        <option value="" disabled selected>Pilih Kategori</option>
                        <option value="Prestasi">🏆 Prestasi</option>
                        <option value="Event">📅 Event</option>
                        <option value="Fasilitas">🏛️ Fasilitas</option>
                        <option value="Beasiswa">🎓 Beasiswa</option>
                        <option value="Budaya">🎭 Budaya</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Ringkasan</label>
                    <textarea name="summary" rows="3" placeholder="Ringkasan singkat (opsional)"></textarea>
                </div>
                <div class="form-group">
                    <label>Konten</label>
                    <textarea name="content" rows="5" required></textarea>
                </div>
                <div class="form-group">
                    <label>URL Gambar</label>
                    <input type="url" name="image" placeholder="https://...">
                </div>
            `;
        case 'umkm':
            return `
                <input type="hidden" name="id" value="${id ?? ''}">
                <div class="form-group">
                    <label>Nama UMKM</label>
                    <input type="text" name="name" required>
                </div>
                <div class="form-group">
                    <label>Pemilik</label>
                    <input type="text" name="owner" required>
                </div>
                <div class="form-group">
                    <label>Kategori</label>
                    <select name="category" required>
                        <option value="" disabled selected>Pilih Kategori</option>
                        <option value="Fashion & Accessories">👗 Fashion & Accessories</option>
                        <option value="Technology Services">💻 Technology Services</option>
                        <option value="Education Services">📘 Education Services</option>
                        <option value="Food & Beverage">🍽️ Food & Beverage</option>
                        <option value="Creative Services">🎨 Creative Services</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Deskripsi</label>
                    <textarea name="description" rows="3" required></textarea>
                </div>
            `;
        default:
            return '';
    }
}

// Close modal
function closeModal(button) {
    const modal = button.closest('.modal-overlay');
    if (modal) {
        modal.remove();
    }
}

// Prefill form when editing
function prefillForm(type, id) {
    if (!id) return;
    const form = document.getElementById(`${type}Form`);
    if (!form) return;
    let data;
    if (type === 'user') data = adminData.users.find(u => u.id === id);
    if (type === 'news') data = adminData.news.find(n => n.id === id);
    if (type === 'umkm') data = adminData.umkm.find(u => u.id === id);
    if (!data) return;
    Object.keys(data).forEach(key => {
        const input = form.querySelector(`[name="${key}"]`);
        if (input) {
            if (input.tagName === 'TEXTAREA') input.value = data[key] ?? '';
            else input.value = data[key] ?? '';
        }
    });
    // Ensure news category select is populated even if API provided category_name
    if (type === 'news') {
        const catInput = form.querySelector('[name="category"]');
        if (catInput && !catInput.value) {
            catInput.value = data.category || data.category_name || '';
        }
    }
}

// Helpers to collect form data
function collectFormData(formId) {
    const form = document.getElementById(formId);
    const fd = new FormData(form);
    const obj = {};
    for (const [k, v] of fd.entries()) obj[k] = v;
    return obj;
}

// Save User (create/update)
async function saveUser() {
    const data = collectFormData('userForm');
    const id = parseInt(data.id || '0');
    const method = id ? 'PUT' : 'POST';
    const url = id ? `/api/admin/users/${id}` : '/api/admin/users';
    try {
        // Client-side confirm password validation for create
        if (!id) {
            if (!data.password || !data.confirmPassword) {
                showToast('Password dan konfirmasi wajib diisi', 'error');
                return;
            }
            if (data.password !== data.confirmPassword) {
                showToast('Konfirmasi password tidak sama', 'error');
                return;
            }
        } else {
            // Ensure password fields are not sent on edit
            delete data.password;
            delete data.confirmPassword;
        }
        const res = await fetch(url, {
            method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            },
            body: JSON.stringify(data)
        });
        const json = await res.json();
        if (!res.ok || json.success === false) throw new Error(json.message || 'Gagal menyimpan user');
        showToast('User berhasil disimpan!', 'success');
        // Refresh users
        await refreshSectionData('users');
        // Close modal
        document.querySelector('.modal-overlay')?.remove();
    } catch (e) {
        console.error(e);
        showToast(e.message || 'Gagal menyimpan user', 'error');
    }
}

// Save News (create/update)
async function saveNews() {
    const data = collectFormData('newsForm');
    const id = parseInt(data.id || '0');
    const method = id ? 'PUT' : 'POST';
    const url = id ? `/api/admin/news/${id}` : '/api/admin/news';
    try {
        const res = await fetch(url, {
            method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            },
            body: JSON.stringify(data)
        });
        const json = await res.json();
        if (!res.ok || json.success === false) throw new Error(json.message || 'Gagal menyimpan berita');
        showToast('Berita berhasil disimpan!', 'success');
        await refreshSectionData('news');
        document.querySelector('.modal-overlay')?.remove();
        try {
            const isUpdate = !!id;
            addActivity({
                ts: Date.now(),
                icon: isUpdate ? 'fas fa-edit' : 'fas fa-newspaper',
                iconBg: isUpdate ? '#fb7185' : '#f093fb',
                title: isUpdate ? 'Berita diperbarui' : 'Berita dibuat/dipublikasi',
                description: data.title || (isUpdate ? 'Berita diperbarui' : 'Berita dibuat')
            });
        } catch (_) {}
    } catch (e) {
        console.error(e);
        showToast(e.message || 'Gagal menyimpan berita', 'error');
    }
}

// Save UMKM (create/update)
async function saveUmkm() {
    const data = collectFormData('umkmForm');
    const id = parseInt(data.id || '0');
    const method = id ? 'PUT' : 'POST';
    const url = id ? `/api/admin/umkm/${id}` : '/api/admin/umkm';
    try {
        const res = await fetch(url, {
            method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            },
            body: JSON.stringify(data)
        });
        const json = await res.json();
        if (!res.ok || json.success === false) throw new Error(json.message || 'Gagal menyimpan UMKM');
        showToast('UMKM berhasil disimpan!', 'success');
        await refreshSectionData('umkm');
        document.querySelector('.modal-overlay')?.remove();
    } catch (e) {
        console.error(e);
        showToast(e.message || 'Gagal menyimpan UMKM', 'error');
    }
}

// Refresh data for a section and recalc stats
async function refreshSectionData(section) {
    try {
        const authHeader = { 'Authorization': `Bearer ${localStorage.getItem('authToken')}` };
        if (section === 'users') {
            const res = await fetch('/api/admin/users', { headers: authHeader });
            const json = await res.json();
            adminData.users = Array.isArray(json) ? json : [];
            loadUsersData();
        } else if (section === 'news') {
            const res = await fetch('/api/admin/news', { headers: authHeader });
            const json = await res.json();
            adminData.news = Array.isArray(json) ? json : [];
            loadNewsData();
        } else if (section === 'umkm') {
            const res = await fetch('/api/admin/umkm', { headers: authHeader });
            const json = await res.json();
            adminData.umkm = Array.isArray(json) ? json : [];
            loadUmkmData();
        }
        calculateStats();
        loadDashboardData();
    } catch (e) {
        console.error('Refresh error', e);
    }
}

// Update admin name
function updateAdminName() {
    const user = getCurrentUser();
    if (user) {
        const adminNameElement = document.getElementById('adminName');
        if (adminNameElement) {
            adminNameElement.textContent = user.fullName || user.username;
        }
    }
}

// Update server uptime
function updateServerUptime() {
    const uptimeElement = document.getElementById('serverUptime');
    if (uptimeElement) {
        // Mock server uptime
        uptimeElement.textContent = '99.9% (7 hari)';
    }
}

// Toggle notifications
// Notification feature removed
function toggleNotifications() {
    // Notifications feature has been removed; provide user feedback and no-op
    try {
        showToast('Fitur notifikasi tidak tersedia.', 'info');
    } catch (_) {
        // Silently ignore if toast system is unavailable
    }
}

// Render pending approvals list
function renderPendingApprovals() {
    const container = document.getElementById('pendingApprovalsList');
    if (!container) return;
    const pendings = (adminData.umkm || []).filter(u => u.status === 'pending');
    if (pendings.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-check-circle"></i>
                <p>Tidak ada UMKM yang menunggu persetujuan.</p>
            </div>
        `;
        return;
    }
    pendings.sort((a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0));
    container.innerHTML = pendings.map(u => `
        <div class="pending-item">
            <div class="pending-info">
                <div class="pending-thumb">${u.image ? `<img src="${u.image}" alt="${u.name}" onerror="this.style.display='none'">` : '<div class="placeholder"></div>'}</div>
                <div>
                    <h4>${u.name}</h4>
                    <p>${u.category || ''} • oleh ${u.owner || 'Tidak diketahui'}</p>
                    <small>Diajukan: ${formatDate(u.createdAt || new Date().toISOString())}</small>
                </div>
            </div>
            <div class="pending-actions">
                <button class="btn btn-success" onclick="approveUmkm(${u.id})"><i class="fas fa-check"></i> Setujui</button>
                <button class="btn btn-danger" onclick="deleteUmkm(${u.id})"><i class="fas fa-trash"></i> Hapus</button>
            </div>
        </div>
    `).join('');
}
// Format date
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Date-only formatter for news (no time part)
function formatDateOnly(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
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

// PDF helpers
function createPdf(title) {
    const { jsPDF } = window.jspdf || {};
    if (!jsPDF || typeof window.jspdf === 'undefined' || typeof jsPDF !== 'function') {
        showToast('Gagal memuat pustaka PDF. Coba muat ulang halaman.', 'error');
        return null;
    }
    const doc = new jsPDF({ unit: 'pt', format: 'a4' });
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.text(title, 40, 40);
    return doc;
}

function savePdf(doc, filename) {
    try { doc.save(filename); } catch (_) { showToast('Gagal menyimpan PDF', 'error'); }
}

// Print products for a specific UMKM
async function printUmkmProductsPdf(umkmId) {
    try {
        const doc = createPdf(`Produk UMKM #${umkmId}`);
        if (!doc) return;
        // Ensure we have the latest detail
        const res = await fetch(`/api/admin/umkm/${umkmId}`, { headers: { 'Authorization': `Bearer ${localStorage.getItem('authToken')}` } });
        const json = await res.json();
        if (!res.ok || json.success === false) throw new Error(json.message || 'Gagal memuat detail UMKM');
        const umkm = json.umkm;
        const items = [
            ...((umkm.products && Array.isArray(umkm.products)) ? umkm.products : []),
            ...((umkm.services && Array.isArray(umkm.services)) ? umkm.services : [])
        ];
        const rows = items.map(p => [p.id, p.name, p.description || '-', p.price != null ? `Rp ${Number(p.price).toLocaleString('id-ID')}` : '-', p.stock ?? '-', p.duration || '-']);
        doc.setFontSize(12);
        doc.text(`${umkm.name} • ${umkm.owner || ''}`, 40, 58);
        doc.autoTable({
            startY: 80,
            head: [['ID', 'Nama', 'Deskripsi', 'Harga', 'Stok', 'Durasi']],
            body: rows,
            styles: { fontSize: 10, cellWidth: 'wrap' },
            headStyles: { fillColor: [102, 126, 234] }
        });
        savePdf(doc, `produk-umkm-${umkmId}.pdf`);
    } catch (e) {
        console.error(e);
        showToast(e.message || 'Gagal membuat PDF produk UMKM', 'error');
    }
}

// Print Users
function printUsersPdf() {
    const doc = createPdf('Laporan Data Users');
    if (!doc) return;
    const rows = (adminData.users || []).map(u => [u.id, u.username, u.email, u.fullName, u.role, u.isActive ? 'Aktif' : 'Tidak Aktif', u.lastLogin ? new Date(u.lastLogin).toLocaleDateString('id-ID') : '-']);
    doc.autoTable({
        startY: 60,
        head: [['ID', 'Username', 'Email', 'Nama Lengkap', 'Role', 'Status', 'Terakhir Login']],
        body: rows,
        styles: { fontSize: 10 },
        headStyles: { fillColor: [102, 126, 234] }
    });
    savePdf(doc, 'data-users.pdf');
}

// Print News
function printNewsPdf() {
    const doc = createPdf('Laporan Data Berita');
    if (!doc) return;
    const rows = (adminData.news || []).map(n => [n.id, n.title, (n.category || n.category_name || ''), n.author, n.date ? new Date(n.date).toLocaleDateString('id-ID') : '-', n.views ?? 0]);
    doc.autoTable({
        startY: 60,
        head: [['ID', 'Judul', 'Kategori', 'Author', 'Tanggal', 'Views']],
        body: rows,
        styles: { fontSize: 10 },
        headStyles: { fillColor: [102, 126, 234] }
    });
    savePdf(doc, 'data-berita.pdf');
}

// Print UMKM
function printUmkmPdf() {
    const doc = createPdf('Laporan Data UMKM');
    if (!doc) return;
    const rows = (adminData.umkm || []).map(b => [b.id, b.name, b.owner, b.category, b.rating ?? '-', b.status ?? '-', b.createdAt ? new Date(b.createdAt).toLocaleDateString('id-ID') : '-']);
    doc.autoTable({
        startY: 60,
        head: [['ID', 'Nama', 'Pemilik', 'Kategori', 'Rating', 'Status', 'Dibuat']],
        body: rows,
        styles: { fontSize: 10 },
        headStyles: { fillColor: [102, 126, 234] }
    });
    savePdf(doc, 'data-umkm.pdf');
}

// Confirm toast with Confirm/Cancel actions
function showConfirmToast(message, onConfirm, onCancel) {
    // Remove existing toast if any
    const existingToast = document.querySelector('.toast-notification');
    if (existingToast) existingToast.remove();

    const toast = document.createElement('div');
    toast.className = 'toast-notification toast-warning';
    toast.innerHTML = `
        <div class="toast-content">
            <div class="toast-icon">
                <i class="fas fa-exclamation-triangle"></i>
            </div>
            <div class="toast-message">
                <p>${message}</p>
            </div>
            <div class="toast-actions">
                <button class="toast-cancel">Batal</button>
                <button class="toast-confirm">Hapus</button>
            </div>
        </div>
        <div class="toast-progress"></div>
    `;
    document.body.appendChild(toast);
    setTimeout(() => toast.classList.add('show'), 10);

    const cleanup = () => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 250);
    };
    toast.querySelector('.toast-cancel').addEventListener('click', () => {
        cleanup();
        if (typeof onCancel === 'function') onCancel();
    });
    toast.querySelector('.toast-confirm').addEventListener('click', async () => {
        cleanup();
        if (typeof onConfirm === 'function') await onConfirm();
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

// Expose functions to global scope for inline HTML handlers
// This ensures buttons like "Tambah User" can call these functions
(() => {
    if (typeof window !== 'undefined') {
        window.openUserModal = openUserModal;
        window.openNewsModal = openNewsModal;
        window.openUmkmModal = openUmkmModal;
        window.saveUser = saveUser;
        window.saveNews = saveNews;
        window.saveUmkm = saveUmkm;
        window.closeModal = closeModal;
        window.editUser = editUser;
        window.deleteUser = deleteUser;
        window.editNews = editNews;
        window.deleteNews = deleteNews;
        window.editUmkm = editUmkm;
        window.approveUmkm = approveUmkm;
        window.deleteUmkm = deleteUmkm;
        window.toggleNotifications = toggleNotifications;
        window.clearSearch = clearSearch;
        window.toggleSidebar = toggleSidebar;
        window.closeSidebar = closeSidebar;
        window.printUsersPdf = printUsersPdf;
        window.printNewsPdf = printNewsPdf;
        window.printUmkmPdf = printUmkmPdf;
        window.printUmkmProductsPdf = printUmkmProductsPdf;
    }
})();
