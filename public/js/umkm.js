// UMKM Page JavaScript
let currentPage = 1;
let currentCategory = 'all';
let currentSearch = '';
let allUmkm = [];
let cart = JSON.parse(localStorage.getItem('umkmCart')) || [];

// DOM Elements
const umkmGrid = document.getElementById('umkmGrid');
const featuredCard = document.getElementById('featuredCard');
const popularUmkm = document.getElementById('popularUmkm');
const filterTabs = document.querySelectorAll('.filter-tab');
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const loadMoreBtn = document.getElementById('loadMoreBtn');
const loadMoreBtnMobile = document.getElementById('loadMoreBtnMobile');
const storeProductsModal = document.getElementById('storeProductsModal');
const storeName = document.getElementById('storeName');
const storeInfo = document.getElementById('storeInfo');
const productsGrid = document.getElementById('productsGrid');
const cartModal = document.getElementById('cartModal');
const cartCount = document.getElementById('cartCount');
const cartItems = document.getElementById('cartItems');
const totalItems = document.getElementById('totalItems');
const totalPrice = document.getElementById('totalPrice');

// Initialize page
document.addEventListener('DOMContentLoaded', async () => {
    await loadUmkmData();
    createFilterTabs();
    displayUmkmGrid();
    displayPopularUmkm();
    displayPopularCategories();
    updateCartCount();
    updateCheckoutButton();
    setupEventListeners();
    
    // jsPDF library is loaded via HTML script tag
});

// Load UMKM data from API
async function loadUmkmData() {
    try {
        const response = await fetch('/api/umkm');
        const data = await response.json();
        allUmkm = Array.isArray(data) ? data.filter(u => u.status === 'approved') : [];
        
        // Store available categories from data
        const categories = [...new Set(allUmkm.map(u => u.category))];
        window.availableCategories = categories;
    } catch (error) {
        console.error('Error loading UMKM:', error);
        showError('Gagal memuat data UMKM');
    }
}

// Create filter tabs based on available categories
function createFilterTabs() {
    const filterTabsContainer = document.querySelector('.filter-tabs');
    if (!filterTabsContainer || !window.availableCategories) return;
    
    // Clear existing tabs except "Semua"
    const existingTabs = filterTabsContainer.querySelectorAll('.filter-tab');
    existingTabs.forEach(tab => {
        if (tab.dataset.category !== 'all') {
            tab.remove();
        }
    });
    
    // Create tabs for each category
    window.availableCategories.forEach(category => {
        const tab = document.createElement('button');
        tab.className = 'filter-tab';
        tab.dataset.category = category.toLowerCase().replace(/\s+/g, '-');
        tab.textContent = category;
        filterTabsContainer.appendChild(tab);
    });
    
    // Update filterTabs reference
    window.filterTabs = document.querySelectorAll('.filter-tab');
}


// Display UMKM grid
function displayUmkmGrid() {
    const filteredUmkm = getFilteredUmkm();
    const umkmToShow = filteredUmkm.slice(0, currentPage * 6);
    
    umkmGrid.innerHTML = umkmToShow.map(umkm => `
        <div class="umkm-card" data-category="${umkm.category.toLowerCase()}">
            <div class="umkm-image">
                <img src="${umkm.image || ''}" alt="${umkm.name || ''}" onerror="this.style.display='none'">
                <div class="umkm-badge">${umkm.category || ''}</div>
            </div>
            <div class="umkm-content-card">
                <div class="umkm-header">
                    <div>
                        <h3 class="umkm-title">${highlightSearchTerm(umkm.name || '')}</h3>
                        <p class="umkm-owner">Oleh: ${highlightSearchTerm(umkm.owner || '')}</p>
                    </div>
                    <div class="umkm-rating">
                        <i class="fas fa-star"></i>
                        <span>${umkm.rating ?? ''}</span>
                    </div>
                </div>
                <p class="umkm-description">${highlightSearchTerm(umkm.description || '')}</p>
                <div class="umkm-details">
                    <div class="umkm-detail-item">
                        <i class="fas fa-map-marker-alt"></i>
                        <span>${highlightSearchTerm(umkm.location || '')}</span>
                    </div>
                    <div class="umkm-detail-item">
                        <i class="fas fa-clock"></i>
                        <span>${umkm.hours || ''}</span>
                    </div>
                    <div class="umkm-detail-item">
                        <i class="fas fa-phone"></i>
                        <span>${umkm.contact || ''}</span>
                    </div>
                    <div class="umkm-detail-item">
                        <i class="fas fa-users"></i>
                        <span>${umkm.customers ?? 0} customers</span>
                    </div>
                </div>
                <div class="umkm-price">Mulai dari Rp ${formatPrice(umkm.price)}</div>
                <div class="umkm-actions">
                    <button class="umkm-btn umkm-btn-cart" onclick="viewStoreProducts(${umkm.id})">
                        <i class="fas fa-store"></i>
                        <span>Lihat Produk</span>
                    </button>
                    <button class="umkm-btn umkm-btn-primary" onclick="contactUmkm(${umkm.id})">
                        <i class="fas fa-phone"></i>
                        Hubungi
                    </button>
                    <button class="umkm-btn umkm-btn-secondary" onclick="viewUmkmDetails(${umkm.id})">
                        <i class="fas fa-eye"></i>
                        Lihat Detail
                    </button>
                </div>
            </div>
        </div>
    `).join('');
    
    // Show/hide load more button
    if (loadMoreBtn) {
        loadMoreBtn.style.display = umkmToShow.length < filteredUmkm.length ? 'block' : 'none';
    }
    if (loadMoreBtnMobile) {
        loadMoreBtnMobile.style.display = umkmToShow.length < filteredUmkm.length ? 'block' : 'none';
    }
}

// Highlight search term in text
function highlightSearchTerm(text) {
    if (!currentSearch || !text) return text;
    
    const searchTerm = currentSearch.toLowerCase();
    const regex = new RegExp(`(${searchTerm})`, 'gi');
    return text.replace(regex, '<mark class="search-highlight">$1</mark>');
}

// Display popular UMKM
function displayPopularUmkm() {
    const popular = allUmkm
        .sort((a, b) => (b.rating || 0) - (a.rating || 0))
        .slice(0, 5);
    
    popularUmkm.innerHTML = popular.map(umkm => `
        <div class="popular-umkm-item" onclick="viewUmkmDetails(${umkm.id})">
            <div class="popular-umkm-image">
                <img src="${umkm.image || ''}" alt="${umkm.name || ''}" onerror="this.style.display='none'">
            </div>
            <div class="popular-umkm-content">
                <h4>${umkm.name || ''}</h4>
                <p>${umkm.category || ''}</p>
                <div class="popular-umkm-rating">
                    <i class="fas fa-star"></i>
                    <span>${umkm.rating ?? ''}</span>
                </div>
            </div>
        </div>
    `).join('');
}

// Update transaction summary
function updateTransactionSummary(transactions) {
    const totalTransactions = document.getElementById('totalTransactions');
    const totalValue = document.getElementById('totalValue');
    
    if (totalTransactions) {
        totalTransactions.textContent = transactions.length;
    }
    
    if (totalValue) {
        const total = transactions.reduce((sum, transaction) => sum + (transaction.totalAmount || 0), 0);
        totalValue.textContent = formatCurrency(total);
    }
}

// Setup transaction filters
function setupTransactionFilters() {
    const applyFilterBtn = document.getElementById('applyFilter');
    const clearFilterBtn = document.getElementById('clearFilter');
    const printPDFBtn = document.getElementById('printPDF');
    
    if (applyFilterBtn) {
        applyFilterBtn.addEventListener('click', applyTransactionFilter);
    }
    
    if (clearFilterBtn) {
        clearFilterBtn.addEventListener('click', clearTransactionFilter);
    }
    
    if (printPDFBtn) {
        printPDFBtn.addEventListener('click', printTransactionPDF);
    }
}

// Apply transaction filter
function applyTransactionFilter() {
    const dateFrom = document.getElementById('dateFrom').value;
    const dateTo = document.getElementById('dateTo').value;
    const statusFilter = document.getElementById('statusFilter').value;
    
    filteredTransactions = allTransactions.filter(transaction => {
        const transactionDate = new Date(transaction.createdAt);
        const fromDate = dateFrom ? new Date(dateFrom) : null;
        const toDate = dateTo ? new Date(dateTo) : null;
        
        if (fromDate) fromDate.setHours(0, 0, 0, 0);
        if (toDate) toDate.setHours(23, 59, 59, 999);
        
        // Date filter (inclusive range)
        if (fromDate && transactionDate < fromDate) return false;
        if (toDate && transactionDate > toDate) return false;
        
        // Status filter
        if (statusFilter !== 'all' && transaction.status !== statusFilter) return false;
        
        return true;
    });
    
    displayTransactions(filteredTransactions);
    updateTransactionSummary(filteredTransactions);
}

// Clear transaction filter
function clearTransactionFilter() {
    document.getElementById('dateFrom').value = '';
    document.getElementById('dateTo').value = '';
    document.getElementById('statusFilter').value = 'all';
    
    filteredTransactions = [...allTransactions];
    displayTransactions(filteredTransactions);
    updateTransactionSummary(filteredTransactions);
}

// Print transaction PDF
async function printTransactionPDF() {
    console.log('Starting PDF generation...');
    console.log('Filtered transactions:', filteredTransactions?.length || 0);
    
    // Check if there are transactions to print
    if (!filteredTransactions || filteredTransactions.length === 0) {
        showToast('Tidak ada transaksi untuk dicetak. Silakan pilih rentang waktu yang berbeda.', 'warning');
        return;
    }
    
    try {
        const doc = createTransactionPdf();
        if (!doc) return;
        
        // Generate PDF content
        generateTransactionPdfContent(doc);
        
        // Save the PDF with user name
        const userData = JSON.parse(localStorage.getItem('userData') || '{}');
        const userName = userData.fullName || userData.username || 'user';
        const sanitizedUserName = userName.replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '-').toLowerCase();
        const fileName = `riwayat-transaksi-${sanitizedUserName}.pdf`;
        
        saveTransactionPdf(doc, fileName);
        showToast('PDF berhasil dibuat dan didownload!', 'success');
        
    } catch (error) {
        console.error('Error generating PDF:', error);
        showToast('Gagal membuat PDF. Silakan coba lagi.', 'error');
    }
}


// PDF Helper Functions (using same approach as admin panel)
function createTransactionPdf() {
    const { jsPDF } = window.jspdf || {};
    if (!jsPDF || typeof window.jspdf === 'undefined' || typeof jsPDF !== 'function') {
        showToast('Gagal memuat pustaka PDF. Coba muat ulang halaman.', 'error');
        return null;
    }
    const doc = new jsPDF({ unit: 'pt', format: 'a4' });
    
    // Add header with better styling
    doc.setFillColor(16, 185, 129); // Green color matching the theme
    doc.rect(0, 0, 595, 60, 'F');
    
    // Title
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(20);
    doc.setTextColor(255, 255, 255);
    doc.text('RIWAYAT TRANSAKSI', 40, 35);
    
    // User info
    const userData = JSON.parse(localStorage.getItem('userData') || '{}');
    const userName = userData.fullName || userData.username || 'User';
    doc.setFontSize(12);
    doc.setTextColor(255, 255, 255);
    doc.text(`Nama: ${userName}`, 40, 50);
    
    // Reset text color for content
    doc.setTextColor(0, 0, 0);
    
    return doc;
}

function generateTransactionPdfContent(doc) {
    let currentY = 80; // Start below header
    
    // Date range info with better styling
    const dateFrom = document.getElementById('dateFrom').value;
    const dateTo = document.getElementById('dateTo').value;
    const statusFilter = document.getElementById('statusFilter').value;
    
    // Filter info box
    doc.setFillColor(248, 250, 252);
    doc.rect(40, currentY, 515, 30, 'F');
    doc.setDrawColor(226, 232, 240);
    doc.rect(40, currentY, 515, 30, 'S');
    
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    let filterInfo = 'Semua Transaksi';
    if (dateFrom || dateTo || statusFilter !== 'all') {
        filterInfo = 'Filter: ';
        if (dateFrom) filterInfo += `Dari ${formatDateForPDF(dateFrom)} `;
        if (dateTo) filterInfo += `Sampai ${formatDateForPDF(dateTo)} `;
        if (statusFilter !== 'all') filterInfo += `Status: ${getStatusInfo(statusFilter).text}`;
    }
    doc.text(filterInfo, 50, currentY + 20);
    currentY += 50;
    
    // Summary section with better styling
    doc.setFillColor(16, 185, 129);
    doc.rect(40, currentY, 515, 25, 'F');
    
    doc.setFontSize(12);
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.text('RINGKASAN TRANSAKSI', 50, currentY + 17);
    currentY += 40;
    
    // Summary details
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    doc.text(`Total Transaksi: ${filteredTransactions.length}`, 50, currentY);
    const totalValue = filteredTransactions.reduce((sum, t) => sum + (t.totalAmount || 0), 0);
    doc.text(`Total Nilai: ${formatCurrency(totalValue)}`, 300, currentY);
    currentY += 30;
    
    // Generate detailed transaction list
    generateDetailedTransactionList(doc, currentY);
    
    // Add footer to the document
    addPageFooter(doc);
}

function generateDetailedTransactionList(doc, startY) {
    let currentY = startY;
    const pageHeight = 750;
    const leftMargin = 40;
    const rightMargin = 555;
    const contentWidth = rightMargin - leftMargin;
    
    filteredTransactions.forEach((transaction, index) => {
        // Check if we need a new page
        if (currentY > pageHeight - 100) {
            doc.addPage();
            addPageFooter(doc);
            currentY = 40;
        }
        
        // Transaction header
        doc.setFillColor(248, 250, 252);
        doc.rect(leftMargin, currentY, contentWidth, 25, 'F');
        doc.setDrawColor(226, 232, 240);
        doc.rect(leftMargin, currentY, contentWidth, 25, 'S');
        
        // Transaction ID and status
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(0, 0, 0);
        doc.text(`Transaksi #${transaction.id}`, leftMargin + 10, currentY + 17);
        
        // Status badge
        const statusInfo = getStatusInfo(transaction.status || 'pending');
        const statusColor = getStatusColor(transaction.status || 'pending');
        doc.setFillColor(statusColor.r, statusColor.g, statusColor.b);
        doc.rect(rightMargin - 80, currentY + 5, 70, 15, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(9);
        doc.text(statusInfo.text, rightMargin - 75, currentY + 14);
        
        currentY += 35;
        
        // Transaction details
        doc.setTextColor(0, 0, 0);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        
        // Store info
        doc.text(`Toko: ${transaction.storeName}`, leftMargin + 10, currentY);
        doc.text(`Pemilik: ${transaction.storeOwner || 'N/A'}`, leftMargin + 200, currentY);
        currentY += 15;
        
        doc.text(`Tanggal: ${formatDateForPDF(transaction.createdAt)}`, leftMargin + 10, currentY);
        doc.text(`Metode: ${getPaymentMethodText(transaction.paymentMethod)}`, leftMargin + 200, currentY);
        currentY += 20;
        
        // Transaction items
        if (transaction.items && transaction.items.length > 0) {
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(10);
            doc.text('Item yang Dibeli:', leftMargin + 10, currentY);
            currentY += 15;
            
            transaction.items.forEach(item => {
                if (currentY > pageHeight - 50) {
                    doc.addPage();
                    currentY = 40;
                }
                
                doc.setFont('helvetica', 'normal');
                doc.setFontSize(9);
                const itemText = `${item.name} (${item.quantity}x)`;
                const itemPrice = formatCurrency((item.price || 0) * (item.quantity || 1));
                doc.text(itemText, leftMargin + 20, currentY);
                doc.text(itemPrice, rightMargin - 100, currentY);
                currentY += 12;
            });
            currentY += 10;
        }
        
        // Total amount
        doc.setFillColor(16, 185, 129);
        doc.rect(leftMargin + 10, currentY, contentWidth - 20, 20, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(11);
        doc.text('Total Pembayaran:', leftMargin + 20, currentY + 13);
        doc.text(formatCurrency(transaction.totalAmount || 0), rightMargin - 120, currentY + 13);
        currentY += 35;
        
        // Add separator line
        if (index < filteredTransactions.length - 1) {
            doc.setDrawColor(226, 232, 240);
            doc.line(leftMargin, currentY, rightMargin, currentY);
            currentY += 20;
        }
    });
}

function getStatusColor(status) {
    const colors = {
        'pending': { r: 245, g: 158, b: 11 },    // Orange
        'completed': { r: 16, g: 185, b: 129 }, // Green
        'cancelled': { r: 239, g: 68, b: 68 }   // Red
    };
    return colors[status] || colors['pending'];
}

function addPageFooter(doc) {
    const currentDate = new Date().toLocaleDateString('id-ID', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    
    // Footer background
    doc.setFillColor(16, 185, 129);
    doc.rect(0, 750, 595, 50, 'F');
    
    // Footer text
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Dicetak pada: ${currentDate}`, 40, 770);
    doc.text('Sistem UMKM Digital', 400, 770);
}

function saveTransactionPdf(doc, filename) {
    try { 
        doc.save(filename); 
    } catch (error) { 
        console.error('Error saving PDF:', error);
        showToast('Gagal menyimpan PDF', 'error'); 
    }
}

// Helper function to format date for PDF
function formatDateForPDF(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Helper function to format currency
function formatCurrency(amount) {
    if (typeof amount !== 'number') {
        amount = parseFloat(amount) || 0;
    }
    return `Rp ${amount.toLocaleString('id-ID')}`;
}

// Calculate category statistics
function calculateCategoryStats() {
    const categoryStats = {};
    
    allUmkm.forEach(umkm => {
        const category = umkm.category;
        if (categoryStats[category]) {
            categoryStats[category]++;
        } else {
            categoryStats[category] = 1;
        }
    });
    
    return categoryStats;
}

// Display popular categories
function displayPopularCategories() {
    const categoryStats = calculateCategoryStats();
    const categoryList = document.querySelector('.category-list');
    
    // Sort categories by count (descending)
    const sortedCategories = Object.entries(categoryStats)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5); // Show top 5 categories
    
    if (!categoryList) return;
    categoryList.innerHTML = sortedCategories.map(([category, count]) => `
        <div class="category-item" data-category="${category.toLowerCase().replace(/\s+/g, '-')}" onclick="filterByCategory('${category.toLowerCase().replace(/\s+/g, '-')}')">
            <div style="display: flex; align-items: center;">
                <span class="category-icon"></span>
                <span class="category-name">${category}</span>
            </div>
            <span class="category-count">${count}</span>
        </div>
    `).join('');
    
    // Update category counts in filter tabs
    updateFilterTabCounts(categoryStats);
}

// Update category counts in filter tabs
function updateFilterTabCounts(categoryStats) {
    const tabs = window.filterTabs || document.querySelectorAll('.filter-tab');
    tabs.forEach(tab => {
        const category = tab.dataset.category;
        if (category === 'all') {
            const totalCount = allUmkm.length;
            tab.innerHTML = `Semua (${totalCount})`;
        } else {
            const categoryName = Object.keys(categoryStats).find(cat => 
                cat.toLowerCase().replace(/\s+/g, '-') === category.toLowerCase()
            );
            const count = categoryStats[categoryName] || 0;
            const originalText = tab.textContent.split(' (')[0]; // Remove existing count
            tab.innerHTML = `${originalText} (${count})`;
        }
    });
}

// Get filtered UMKM based on category, search, and sort
function getFilteredUmkm() {
    let filtered = allUmkm;
    
    // Filter by category
    if (currentCategory !== 'all') {
        filtered = filtered.filter(umkm => {
            const categoryValue = (umkm && umkm.category) ? umkm.category : '';
            return categoryValue.toLowerCase().replace(/\s+/g, '-') === currentCategory.toLowerCase();
        });
    }
    
    // Filter by search (enhanced search for categories and keywords)
    if (currentSearch) {
        const searchTerm = currentSearch.toLowerCase();
        filtered = filtered.filter(umkm => {
            // Search in various fields
            const nameMatch = (umkm.name || '').toLowerCase().includes(searchTerm);
            const descriptionMatch = (umkm.description || '').toLowerCase().includes(searchTerm);
            const categoryMatch = (umkm.category || '').toLowerCase().includes(searchTerm);
            const ownerMatch = (umkm.owner || '').toLowerCase().includes(searchTerm);
            const facultyMatch = umkm.faculty && (umkm.faculty || '').toLowerCase().includes(searchTerm);
            const locationMatch = (umkm.location || '').toLowerCase().includes(searchTerm);
            
            // Search in products/services
            let productMatch = false;
            if (umkm.products) {
                productMatch = umkm.products.some(product => 
                    product.name.toLowerCase().includes(searchTerm) ||
                    product.description.toLowerCase().includes(searchTerm)
                );
            }
            if (umkm.services) {
                productMatch = productMatch || umkm.services.some(service => 
                    service.name.toLowerCase().includes(searchTerm) ||
                    service.description.toLowerCase().includes(searchTerm)
                );
            }
            
            return nameMatch || descriptionMatch || categoryMatch || ownerMatch || 
                   facultyMatch || locationMatch || productMatch;
        });
        
        // Sort results to prioritize matches
        filtered.sort((a, b) => {
            const searchTerm = currentSearch.toLowerCase();
            
            // Priority 1: Name matches
            const aNameMatch = (a.name || '').toLowerCase().includes(searchTerm);
            const bNameMatch = (b.name || '').toLowerCase().includes(searchTerm);
            if (aNameMatch && !bNameMatch) return -1;
            if (!aNameMatch && bNameMatch) return 1;
            
            // Priority 2: Category matches
            const aCategoryMatch = (a.category || '').toLowerCase().includes(searchTerm);
            const bCategoryMatch = (b.category || '').toLowerCase().includes(searchTerm);
            if (aCategoryMatch && !bCategoryMatch) return -1;
            if (!aCategoryMatch && bCategoryMatch) return 1;
            
            // Priority 3: Product/Service matches
            const aProductMatch = (a.products && a.products.some(p => (p.name || '').toLowerCase().includes(searchTerm))) ||
                                 (a.services && a.services.some(s => (s.name || '').toLowerCase().includes(searchTerm)));
            const bProductMatch = (b.products && b.products.some(p => (p.name || '').toLowerCase().includes(searchTerm))) ||
                                 (b.services && b.services.some(s => (s.name || '').toLowerCase().includes(searchTerm)));
            if (aProductMatch && !bProductMatch) return -1;
            if (!aProductMatch && bProductMatch) return 1;
            
            return 0;
        });
    }
    
    // Default sort by rating (highest first)
    filtered.sort((a, b) => b.rating - a.rating);
    
    return filtered;
}

// Setup event listeners
function setupEventListeners() {
    // Filter tabs - use the updated reference
    const tabs = window.filterTabs || document.querySelectorAll('.filter-tab');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            currentCategory = tab.dataset.category;
            currentPage = 1;
            displayUmkmGrid();
        });
    });
    
    // Search functionality
    if (searchBtn) searchBtn.addEventListener('click', performSearch);
    if (searchInput) {
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                performSearch();
            }
        });
    }
    
    // Load more button
    if (loadMoreBtn) {
        loadMoreBtn.addEventListener('click', () => {
            currentPage++;
            displayUmkmGrid();
        });
    }
    
    // Load more button mobile
    if (loadMoreBtnMobile) {
        loadMoreBtnMobile.addEventListener('click', () => {
            currentPage++;
            displayUmkmGrid();
        });
    }
}

// Filter by category from popular categories
function filterByCategory(category) {
    // Update current category
    currentCategory = category;
    currentPage = 1;
    
    // Update active tab
    const tabs = window.filterTabs || document.querySelectorAll('.filter-tab');
    tabs.forEach(tab => {
        tab.classList.remove('active');
        if (tab.dataset.category === category) {
            tab.classList.add('active');
        }
    });
    
    // Clear search if any
    if (currentSearch) {
        currentSearch = '';
        searchInput.value = '';
    }
    
    // Display filtered UMKM
    displayUmkmGrid();
    
    // Show toast notification
    const categoryStats = calculateCategoryStats();
    const categoryName = Object.keys(categoryStats).find(cat => 
        cat.toLowerCase().replace(/\s+/g, '-') === category
    );
    const count = categoryStats[categoryName] || 0;
    showToast(`Menampilkan ${count} UMKM dalam kategori "${categoryName}"`, 'info');
    
    // Scroll to UMKM section
    const umkmSection = document.querySelector('.umkm-content');
    if (umkmSection) {
        const navHeight = document.querySelector('.minimal-navbar').offsetHeight;
        const filterHeight = document.querySelector('.umkm-filter').offsetHeight;
        const offset = navHeight + filterHeight + 20;
        
        const elementPosition = umkmSection.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - offset;
        
        window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
        });
    }
}

// Perform search
function performSearch() {
    currentSearch = searchInput.value.trim();
    currentPage = 1;
    
    // Reset category to 'all' before searching
    if (currentSearch) {
        currentCategory = 'all';
        
        // Update active tab to 'Semua'
        const tabs = window.filterTabs || document.querySelectorAll('.filter-tab');
        tabs.forEach(tab => {
            tab.classList.remove('active');
            if (tab.dataset.category === 'all') {
                tab.classList.add('active');
            }
        });
    }
    
    displayUmkmGrid();
    
    // Show enhanced toast notification based on search results
    if (currentSearch) {
        const filteredUmkm = getFilteredUmkm();
        setTimeout(() => {
            if (filteredUmkm.length > 0) {
                // Analyze search results
                const searchTerm = currentSearch.toLowerCase();
                const categories = [...new Set(filteredUmkm.map(umkm => umkm.category))];
                const hasProductMatches = filteredUmkm.some(umkm => 
                    (umkm.products && umkm.products.some(p => p.name.toLowerCase().includes(searchTerm))) ||
                    (umkm.services && umkm.services.some(s => s.name.toLowerCase().includes(searchTerm)))
                );
                
                let message = `Ditemukan ${filteredUmkm.length} UMKM untuk "${currentSearch}"`;
                if (categories.length > 1) {
                    message += ` dalam ${categories.length} kategori`;
                }
                if (hasProductMatches) {
                    message += ` (termasuk produk/jasa)`;
                }
                
                showToast(message, 'success');
                scrollToFirstResult();
            } else {
                showToast(`Tidak ada UMKM ditemukan untuk "${currentSearch}". Coba kata kunci lain atau periksa ejaan.`, 'error');
            }
        }, 100);
    } else {
        // Clear search
        showToast('Pencarian dibersihkan', 'info');
    }
}

// Scroll to first search result
function scrollToFirstResult() {
    const firstUmkmCard = document.querySelector('.umkm-card[data-umkm-id]');
    if (firstUmkmCard) {
        // Calculate offset to account for fixed navigation
        const navHeight = document.querySelector('.minimal-navbar').offsetHeight;
        const filterHeight = document.querySelector('.umkm-filter').offsetHeight;
        const offset = navHeight + filterHeight + 20;
        
        const elementPosition = firstUmkmCard.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - offset;
        
        window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
        });
        
        // Add highlight effect to the first result
        firstUmkmCard.style.animation = 'searchHighlight 2s ease-in-out';
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

// Store Products Functions
function viewStoreProducts(umkmId) {
    const umkm = allUmkm.find(u => u.id === umkmId);
    if (!umkm) return;
    
    // Update store name
    storeName.textContent = umkm.name;
    
    // Update store info
    storeInfo.innerHTML = `
        <div class="store-info-content">
            <div class="store-info-image">
                <img src="${umkm.image}" alt="${umkm.name}" onerror="this.style.display='none'">
            </div>
            <div class="store-info-details">
                <h3>${umkm.name}</h3>
                <p>by ${umkm.owner}</p>
                <div class="store-rating">
                    <i class="fas fa-star"></i>
                    <span>${umkm.rating} (${umkm.reviews} reviews)</span>
                </div>
                <div class="store-category">${umkm.category}</div>
                <div class="store-location">
                    <i class="fas fa-map-marker-alt"></i>
                    <span>${umkm.location}</span>
                </div>
            </div>
        </div>
    `;
    
    // Display products/services
    const products = [
        ...((umkm.products && Array.isArray(umkm.products)) ? umkm.products : []),
        ...((umkm.services && Array.isArray(umkm.services)) ? umkm.services : [])
    ];
    productsGrid.innerHTML = products.map(product => `
        <div class="product-card">
            <div class="product-image">
                <img src="${product.image || ''}" alt="${product.name || ''}" onerror="this.style.display='none'">
            </div>
            <div class="product-details">
                <h4>${product.name || ''}</h4>
                <p>${product.description || ''}</p>
                <div class="product-price">Rp ${(Number(product.price) || 0).toLocaleString('id-ID')}</div>
                ${product.stock ? `<div class="product-stock">Stok: ${product.stock}</div>` : ''}
                ${product.duration ? `<div class="product-duration">Durasi: ${product.duration}</div>` : ''}
                <button class="btn btn-primary" onclick="addProductToCart(${umkmId}, ${product.id})">
                    <i class="fas fa-shopping-cart"></i>
                    Tambah ke Cart
                </button>
            </div>
        </div>
    `).join('');
    
    // Show modal
    storeProductsModal.classList.add('show');
    document.body.style.overflow = 'hidden';
}

function closeStoreProductsModal() {
    storeProductsModal.classList.remove('show');
    document.body.style.overflow = 'auto';
}

// Cart Functions (Modified for store-based grouping)
function addProductToCart(storeId, productId) {
    const store = allUmkm.find(u => u.id === storeId);
    if (!store) return;
    
    const products = [
        ...((Array.isArray(store.products) && store.products.length) ? store.products : []),
        ...((Array.isArray(store.services) && store.services.length) ? store.services : [])
    ];
    const product = products.find(p => p.id === productId);
    if (!product) return;
    
    // Check if store already exists in cart
    let storeCart = cart.find(store => store.storeId === storeId);
    
    if (!storeCart) {
        storeCart = {
            storeId: storeId,
            storeName: store.name,
            storeOwner: store.owner,
            storeImage: store.image,
            items: []
        };
        cart.push(storeCart);
    }
    
    // Check if product already exists in store cart
    const existingItem = storeCart.items.find(item => item.productId === productId);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        storeCart.items.push({
            productId: product.id,
            name: product.name,
            description: product.description,
            price: product.price,
            image: product.image,
            quantity: 1
        });
    }
    
    // Save to localStorage
    localStorage.setItem('umkmCart', JSON.stringify(cart));
    
    // Update UI
    updateCartCount();
    updateCartModal();
    updateCheckoutButton();
    
    // Show success toast
    showToast(`${product.name} ditambahkan ke cart!`, 'success');
}

function removeFromCart(storeId, productId) {
    const storeCart = cart.find(store => store.storeId === storeId);
    if (storeCart) {
        storeCart.items = storeCart.items.filter(item => item.productId !== productId);
        
        // Remove store from cart if no items left
        if (storeCart.items.length === 0) {
            cart = cart.filter(store => store.storeId !== storeId);
        }
        
        localStorage.setItem('umkmCart', JSON.stringify(cart));
        updateCartCount();
        updateCartModal();
        updateCheckoutButton();
        showToast('Item dihapus dari cart!', 'info');
    }
}

function updateQuantity(storeId, productId, newQuantity) {
    const storeCart = cart.find(store => store.storeId === storeId);
    if (storeCart) {
        const item = storeCart.items.find(item => item.productId === productId);
        if (item) {
            if (newQuantity <= 0) {
                removeFromCart(storeId, productId);
            } else {
                item.quantity = newQuantity;
                localStorage.setItem('umkmCart', JSON.stringify(cart));
                updateCartCount();
                updateCartModal();
                updateCheckoutButton();
            }
        }
    }
}

function updateCartCount() {
    const totalItems = cart.reduce((sum, store) => 
        sum + store.items.reduce((storeSum, item) => storeSum + item.quantity, 0), 0
    );
    cartCount.textContent = totalItems;
    cartCount.style.display = totalItems > 0 ? 'block' : 'none';
}

function updateCartModal() {
    if (cart.length === 0) {
        cartItems.innerHTML = `
            <div class="empty-cart">
                <i class="fas fa-shopping-cart"></i>
                <h3>Cart Kosong</h3>
                <p>Belum ada item di cart Anda</p>
            </div>
        `;
        totalItems.textContent = '0';
        totalPrice.textContent = 'Rp 0';
        return;
    }
    
    cartItems.innerHTML = cart.map(storeCart => `
        <div class="store-cart-section">
            <div class="store-cart-header">
                <div class="store-cart-info">
                    <img src="${storeCart.storeImage}" alt="${storeCart.storeName}" onerror="this.style.display='none'">
                    <div>
                        <h4>${storeCart.storeName}</h4>
                        <p>by ${storeCart.storeOwner}</p>
                    </div>
                </div>
                <button class="checkout-store-btn" onclick="checkoutStore(${storeCart.storeId})">
                    <i class="fas fa-credit-card"></i>
                    Checkout Toko Ini
                </button>
            </div>
            <div class="store-cart-items">
                ${storeCart.items.map(item => `
                    <div class="cart-item">
                        <div class="cart-item-image">
                            <img src="${item.image}" alt="${item.name}" onerror="this.style.display='none'">
                        </div>
                        <div class="cart-item-details">
                            <h4>${item.name}</h4>
                            <p>${item.description}</p>
                            <div class="cart-item-price">Rp ${item.price.toLocaleString('id-ID')}</div>
                        </div>
                        <div class="cart-item-controls">
                            <button class="quantity-btn" onclick="updateQuantity(${storeCart.storeId}, ${item.productId}, ${item.quantity - 1})">
                                <i class="fas fa-minus"></i>
                            </button>
                            <span class="quantity">${item.quantity}</span>
                            <button class="quantity-btn" onclick="updateQuantity(${storeCart.storeId}, ${item.productId}, ${item.quantity + 1})">
                                <i class="fas fa-plus"></i>
                            </button>
                            <button class="remove-btn" onclick="removeFromCart(${storeCart.storeId}, ${item.productId})">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `).join('');
    
    const totalItemsCount = cart.reduce((sum, store) => 
        sum + store.items.reduce((storeSum, item) => storeSum + item.quantity, 0), 0
    );
    totalItems.textContent = totalItemsCount;
    
    // Calculate total price
    const totalPriceValue = cart.reduce((sum, store) => 
        sum + store.items.reduce((storeSum, item) => storeSum + (item.price * item.quantity), 0), 0
    );
    
    totalPrice.textContent = `Rp ${totalPriceValue.toLocaleString('id-ID')}`;
    
    // Update checkout button based on store count
    updateCheckoutButton();
}

function updateCheckoutButton() {
    const checkoutBtn = document.getElementById('checkoutBtn');
    if (!checkoutBtn) return;
    
    if (cart.length === 0) {
        checkoutBtn.disabled = true;
        checkoutBtn.innerHTML = '<i class="fas fa-shopping-cart"></i> Cart Kosong';
        checkoutBtn.className = 'btn btn-secondary checkout-disabled';
        return;
    }
    
    if (cart.length === 1) {
        // Only one store - enable checkout
        checkoutBtn.disabled = false;
        checkoutBtn.innerHTML = '<i class="fas fa-credit-card"></i> Checkout';
        checkoutBtn.className = 'btn btn-primary';
        checkoutBtn.title = 'Checkout semua item dari toko yang sama';
    } else {
        // Multiple stores - disable checkout
        checkoutBtn.disabled = true;
        checkoutBtn.innerHTML = '<i class="fas fa-exclamation-triangle"></i> Checkout (Toko Berbeda)';
        checkoutBtn.className = 'btn btn-secondary checkout-disabled';
        checkoutBtn.title = 'Checkout hanya tersedia untuk produk dari toko yang sama. Silakan checkout per toko atau pilih produk dari toko yang sama.';
    }
}

function toggleCart() {
    cartModal.classList.toggle('show');
    if (cartModal.classList.contains('show')) {
        updateCartModal();
        document.body.style.overflow = 'hidden';
    } else {
        document.body.style.overflow = 'auto';
    }
}

function clearCart() {
    cart = [];
    localStorage.setItem('umkmCart', JSON.stringify(cart));
    updateCartCount();
    updateCartModal();
    updateCheckoutButton();
    showToast('Cart berhasil dikosongkan!', 'info');
}

function checkoutStore(storeId) {
    const storeCart = cart.find(store => store.storeId === storeId);
    if (!storeCart || storeCart.items.length === 0) {
        showToast('Tidak ada item dari toko ini!', 'warning');
        return;
    }
    
    // Create checkout modal for specific store
    const checkoutModal = document.createElement('div');
    checkoutModal.className = 'checkout-modal-overlay';
    checkoutModal.innerHTML = `
        <div class="checkout-modal">
            <div class="checkout-modal-header">
                <h2><i class="fas fa-credit-card"></i> Checkout - ${storeCart.storeName}</h2>
                <button class="close-btn" onclick="closeCheckoutModal()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="checkout-modal-content">
                <div class="store-checkout-info">
                    <div class="store-checkout-header">
                        <img src="${storeCart.storeImage}" alt="${storeCart.storeName}" onerror="this.style.display='none'">
                        <div>
                            <h3>${storeCart.storeName}</h3>
                            <p>by ${storeCart.storeOwner}</p>
                        </div>
                    </div>
                </div>
                <div class="checkout-items">
                    <h3>Items yang akan dibeli:</h3>
                    ${storeCart.items.map(item => `
                        <div class="checkout-item">
                            <img src="${item.image}" alt="${item.name}" onerror="this.style.display='none'">
                            <div class="checkout-item-details">
                                <h4>${item.name}</h4>
                                <p>${item.description}</p>
                                <p>Qty: ${item.quantity} x Rp ${item.price.toLocaleString('id-ID')}</p>
                            </div>
                        </div>
                    `).join('')}
                </div>
                <div class="checkout-form">
                    <h3>Informasi Pembeli:</h3>
                    <form id="checkoutForm">
                        <div class="form-group">
                            <label>Nama Lengkap:</label>
                            <input type="text" name="name" required>
                        </div>
                        <div class="form-group">
                            <label>Email:</label>
                            <input type="email" name="email" required>
                        </div>
                        <div class="form-group">
                            <label>No. Telepon:</label>
                            <input type="tel" name="phone" required>
                        </div>
                        <div class="form-group">
                            <label>Alamat:</label>
                            <textarea name="address" required></textarea>
                        </div>
                        <div class="form-group">
                            <label>Metode Pembayaran:</label>
                            <select name="payment" required>
                                <option value="">Pilih metode pembayaran</option>
                                <option value="transfer">Transfer Bank</option>
                                <option value="cod">Cash on Delivery</option>
                                <option value="e-wallet">E-Wallet</option>
                            </select>
                        </div>
                    </form>
                </div>
                <div class="checkout-summary">
                    <div class="checkout-total">
                        <span>Total Items: ${storeCart.items.reduce((sum, item) => sum + item.quantity, 0)}</span>
                        <span>Total Price: Rp ${storeCart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0).toLocaleString('id-ID')}</span>
                    </div>
                    <div class="checkout-actions">
                        <button class="btn btn-secondary" onclick="closeCheckoutModal()">
                            Batal
                        </button>
                        <button class="btn btn-primary" onclick="confirmStoreCheckout(${storeId})">
                            <i class="fas fa-check"></i> Konfirmasi Order
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(checkoutModal);
    document.body.style.overflow = 'hidden';
}

function proceedToCheckout() {
    if (cart.length === 0) {
        showToast('Cart kosong! Tambahkan item terlebih dahulu.', 'warning');
        return;
    }
    
    // Check if all items are from the same store
    if (cart.length > 1) {
        showToast('Tidak dapat checkout! Produk di cart berasal dari toko yang berbeda. Silakan checkout per toko atau pilih produk dari toko yang sama.', 'error');
        return;
    }
    
    // If only one store, proceed with checkout for that store
    if (cart.length === 1) {
        const storeCart = cart[0];
        checkoutStore(storeCart.storeId);
    }
}

function closeCheckoutModal() {
    const checkoutModal = document.querySelector('.checkout-modal-overlay');
    if (checkoutModal) {
        checkoutModal.remove();
        document.body.style.overflow = 'auto';
    }
}

function confirmStoreCheckout(storeId) {
    const form = document.getElementById('checkoutForm');
    const formData = new FormData(form);
    
    // Validate form
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }
    
    // Get store cart data
    const storeCart = cart.find(store => store.storeId === storeId);
    if (!storeCart || storeCart.items.length === 0) {
        showToast('Tidak ada item dari toko ini!', 'warning');
        return;
    }
    
    // Get store data to find phone number
    const storeData = allUmkm.find(u => u.id === storeId);
    if (!storeData) {
        showToast('Data toko tidak ditemukan!', 'error');
        return;
    }
    
    // Prepare transaction data
    const transactionData = {
        storeId: storeId,
        storeName: storeCart.storeName,
        storeOwner: storeCart.storeOwner,
        items: storeCart.items,
        totalAmount: storeCart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0),
        customerInfo: {
            name: formData.get('name'),
            email: formData.get('email'),
            phone: formData.get('phone'),
            address: formData.get('address')
        },
        paymentMethod: formData.get('payment')
    };
    
    // Record transaction
    fetch('/api/transactions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify(transactionData)
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            showToast(`Order dari ${storeCart.storeName} berhasil diproses!`, 'success');
            
            // Remove store from cart after successful checkout
            cart = cart.filter(store => store.storeId !== storeId);
            localStorage.setItem('umkmCart', JSON.stringify(cart));
            
            // Update UI
            updateCartCount();
            updateCartModal();
            
            closeCheckoutModal();
            
            // Redirect to WhatsApp with store phone number
            setTimeout(() => {
                const whatsappMessage = generateWhatsAppMessage(transactionData, storeData);
                const phoneNumber = extractPhoneNumber(storeData.contact);
                const whatsappUrl = `https://api.whatsapp.com/send/?phone=${phoneNumber}&text=${encodeURIComponent(whatsappMessage)}`;
                window.open(whatsappUrl, '_blank');
            }, 1500);
            
            // Close cart modal if no items left
            if (cart.length === 0) {
                toggleCart();
            }
        } else {
            showToast(data.message || 'Gagal memproses transaksi!', 'error');
        }
    })
    .catch(error => {
        console.error('Transaction error:', error);
        showToast('Terjadi kesalahan saat memproses transaksi!', 'error');
    });
}

function confirmCheckout() {
    const form = document.getElementById('checkoutForm');
    const formData = new FormData(form);
    
    // Validate form
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }
    
    // Get cart data (should be single store at this point)
    if (cart.length === 0) {
        showToast('Cart kosong!', 'warning');
        return;
    }
    
    const storeCart = cart[0]; // Single store checkout
    
    // Get store data to find phone number
    const storeData = allUmkm.find(u => u.id === storeCart.storeId);
    if (!storeData) {
        showToast('Data toko tidak ditemukan!', 'error');
        return;
    }
    
    // Prepare transaction data
    const transactionData = {
        storeId: storeCart.storeId,
        storeName: storeCart.storeName,
        storeOwner: storeCart.storeOwner,
        items: storeCart.items,
        totalAmount: storeCart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0),
        customerInfo: {
            name: formData.get('name'),
            email: formData.get('email'),
            phone: formData.get('phone'),
            address: formData.get('address')
        },
        paymentMethod: formData.get('payment')
    };
    
    // Record transaction
    fetch('/api/transactions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify(transactionData)
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            showToast('Order berhasil diproses!', 'success');
            
            // Clear cart after successful checkout
            clearCart();
            closeCheckoutModal();
            toggleCart(); // Close cart modal
            
            // Redirect to WhatsApp with store phone number
            setTimeout(() => {
                const whatsappMessage = generateWhatsAppMessage(transactionData, storeData);
                const phoneNumber = extractPhoneNumber(storeData.contact);
                const whatsappUrl = `https://api.whatsapp.com/send/?phone=${phoneNumber}&text=${encodeURIComponent(whatsappMessage)}`;
                window.open(whatsappUrl, '_blank');
            }, 1500);
        } else {
            showToast(data.message || 'Gagal memproses transaksi!', 'error');
        }
    })
    .catch(error => {
        console.error('Transaction error:', error);
        showToast('Terjadi kesalahan saat memproses transaksi!', 'error');
    });
}

// WhatsApp Helper Functions
function extractPhoneNumber(contact) {
    // Extract phone number from contact field
    // Handle different formats: "081234567890", "@username", "081234567890 (WhatsApp)"
    if (!contact) return '6287715658420'; // Default fallback
    
    // Remove common prefixes and suffixes
    let phone = contact.toString().trim();
    
    // Remove @ symbol for usernames
    if (phone.startsWith('@')) {
        return '6287715658420'; // Default fallback for usernames
    }
    
    // Remove common suffixes
    phone = phone.replace(/\s*\(.*?\)/g, ''); // Remove (WhatsApp) etc
    phone = phone.replace(/\s*WhatsApp.*/gi, ''); // Remove "WhatsApp" text
    phone = phone.replace(/\s*WA.*/gi, ''); // Remove "WA" text
    
    // Clean up the number
    phone = phone.replace(/\D/g, ''); // Remove all non-digits
    
    // Add country code if missing
    if (phone.startsWith('0')) {
        phone = '62' + phone.substring(1);
    } else if (!phone.startsWith('62')) {
        phone = '62' + phone;
    }
    
    return phone;
}

function generateWhatsAppMessage(transactionData, storeData) {
    const { storeName, items, totalAmount, customerInfo } = transactionData;
    
    // Create product list
    const productList = items.map(item => 
        `• ${item.name} (${item.quantity}x) - Rp ${(item.price * item.quantity).toLocaleString('id-ID')}`
    ).join('\n');
    
    const message = `Permisi, saya ingin melakukan pemesanan ke ${storeName} dengan rincian transaksi :

${productList}

Total: Rp ${totalAmount.toLocaleString('id-ID')}

Informasi Pembeli:
Nama: ${customerInfo.name}
Email: ${customerInfo.email}
Telepon: ${customerInfo.phone}
Alamat: ${customerInfo.address}
Metode Pembayaran: ${getPaymentMethodText(transactionData.paymentMethod)}

Terima kasih!`;
    
    return message;
}

// Contact UMKM
function contactUmkm(umkmId) {
    const umkm = allUmkm.find(u => u.id === umkmId);
    if (umkm) {
        // Create contact modal
        const modalContent = `
            <div class="contact-modal-overlay" onclick="closeContactModal()">
                <div class="contact-modal" onclick="event.stopPropagation()">
                    <div class="contact-modal-header">
                        <h2>Hubungi ${umkm.name}</h2>
                        <button class="close-btn" onclick="closeContactModal()">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <div class="contact-modal-content">
                        <div class="contact-info">
                            <div class="contact-item">
                                <i class="fas fa-user"></i>
                                <div>
                                    <h4>Pemilik</h4>
                                    <p>${umkm.owner}</p>
                                </div>
                            </div>
                            <div class="contact-item">
                                <i class="fas fa-phone"></i>
                                <div>
                                    <h4>Telepon</h4>
                                    <p><a href="tel:${umkm.contact}">${umkm.contact}</a></p>
                                </div>
                            </div>
                            <div class="contact-item">
                                <i class="fas fa-envelope"></i>
                                <div>
                                    <h4>Email</h4>
                                    <p><a href="mailto:${umkm.email}">${umkm.email}</a></p>
                                </div>
                            </div>
                            <div class="contact-item">
                                <i class="fas fa-map-marker-alt"></i>
                                <div>
                                    <h4>Lokasi</h4>
                                    <p>${umkm.location}</p>
                                </div>
                            </div>
                        </div>
                        <div class="contact-actions">
                            <button class="btn btn-primary" onclick="window.open('tel:${umkm.contact}')">
                                <i class="fas fa-phone"></i>
                                Telepon Sekarang
                            </button>
                            <button class="btn btn-secondary" onclick="window.open('mailto:${umkm.email}')">
                                <i class="fas fa-envelope"></i>
                                Kirim Email
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalContent);
        document.body.style.overflow = 'hidden';
    }
}

// View UMKM details
function viewUmkmDetails(umkmId) {
    const umkm = allUmkm.find(u => u.id === umkmId);
    if (umkm) {
        // Get products/services
    const products = (umkm.products && Array.isArray(umkm.products)) ? umkm.products :
                     (umkm.services && Array.isArray(umkm.services)) ? umkm.services : [];
        const hasProducts = products.length > 0;
        
        // Create details modal
        const modalContent = `
            <div class="details-modal-overlay" onclick="closeDetailsModal()">
                <div class="details-modal" onclick="event.stopPropagation()">
                    <div class="details-modal-header">
                        <h2>${umkm.name}</h2>
                        <button class="close-btn" onclick="closeDetailsModal()">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <div class="details-modal-content">
                        <div class="details-image">
                            <img src="${umkm.image}" alt="${umkm.name}" onerror="this.style.display='none'">
                        </div>
                        <div class="details-info">
                            <div class="details-meta">
                                <div class="rating">
                                    <i class="fas fa-star"></i>
                                    <span>${umkm.rating}</span>
                                    <span>(${umkm.reviews} reviews)</span>
                                </div>
                                <div class="category">${umkm.category}</div>
                            </div>
                            <div class="details-description">
                                <h3>Tentang Bisnis</h3>
                                <p>${umkm.description}</p>
                                ${umkm.faculty ? `<p><strong>Fakultas:</strong> ${umkm.faculty}</p>` : ''}
                                ${umkm.semester ? `<p><strong>Semester:</strong> ${umkm.semester}</p>` : ''}
                            </div>
                            ${hasProducts ? `
                            <div class="details-products">
                                <h3>Produk & Jasa</h3>
                                <div class="products-preview">
                                    ${products.slice(0, 3).map(product => `
                                        <div class="product-preview-item">
                                            <div class="product-preview-image">
                                                <img src="${product.image || ''}" alt="${product.name || ''}" onerror="this.style.display='none'">
                                            </div>
                                            <div class="product-preview-info">
                                                <h4>${product.name || ''}</h4>
                                                <p>Rp ${(Number(product.price) || 0).toLocaleString('id-ID')}</p>
                                            </div>
                                        </div>
                                    `).join('')}
                                    ${products.length > 3 ? `<p class="more-products">+${products.length - 3} produk lainnya</p>` : ''}
                                </div>
                                <button class="btn btn-primary" onclick="closeDetailsModal(); viewStoreProducts(${umkm.id})">
                                    <i class="fas fa-store"></i>
                                    Lihat Semua Produk
                                </button>
                            </div>
                            ` : ''}
                            <div class="details-contact">
                                <h3>Informasi Kontak</h3>
                                <div class="contact-grid">
                                    <div class="contact-item">
                                        <i class="fas fa-user"></i>
                                        <span>${umkm.owner}</span>
                                    </div>
                                    <div class="contact-item">
                                        <i class="fas fa-phone"></i>
                                        <span>${umkm.contact}</span>
                                    </div>
                                    <div class="contact-item">
                                        <i class="fas fa-envelope"></i>
                                        <span>${umkm.email || 'Tidak tersedia'}</span>
                                    </div>
                                    <div class="contact-item">
                                        <i class="fas fa-map-marker-alt"></i>
                                        <span>${umkm.location}</span>
                                    </div>
                                    <div class="contact-item">
                                        <i class="fas fa-clock"></i>
                                        <span>${umkm.hours || 'Tidak tersedia'}</span>
                                    </div>
                                    <div class="contact-item">
                                        <i class="fas fa-users"></i>
                                        <span>${umkm.customers} customers</span>
                                    </div>
                                </div>
                            </div>
                            <div class="details-price">
                                <h3>Harga</h3>
                                <p>${umkm.price_range || `Mulai dari Rp ${formatPrice(umkm.price)}`}</p>
                            </div>
                            <div class="details-actions">
                                <button class="btn btn-primary" onclick="closeDetailsModal(); viewStoreProducts(${umkm.id})">
                                    <i class="fas fa-store"></i>
                                    Lihat Produk
                                </button>
                                <button class="btn btn-secondary" onclick="closeDetailsModal(); contactUmkm(${umkm.id})">
                                    <i class="fas fa-phone"></i>
                                    Hubungi
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalContent);
        document.body.style.overflow = 'hidden';
    }
}

// Close contact modal
function closeContactModal() {
    const modal = document.querySelector('.contact-modal-overlay');
    if (modal) {
        modal.remove();
        document.body.style.overflow = 'auto';
    }
}

// Close details modal
function closeDetailsModal() {
    const modal = document.querySelector('.details-modal-overlay');
    if (modal) {
        modal.remove();
        document.body.style.overflow = 'auto';
    }
}

// Format price
function formatPrice(price) {
    const numeric = Number(price);
    if (!isFinite(numeric) || isNaN(numeric)) return '0';
    const rounded = Math.round(numeric);
    return rounded.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

// Transaction History Functions
function toggleTransactionHistory() {
    const modal = document.getElementById('transactionHistoryModal');
    if (modal.classList.contains('show')) {
        modal.classList.remove('show');
        document.body.style.overflow = 'auto';
    } else {
        modal.classList.add('show');
        document.body.style.overflow = 'hidden';
        loadTransactionHistory();
    }
}

// Global variables for transaction filtering
let allTransactions = [];
let filteredTransactions = [];

async function loadTransactionHistory() {
    const transactionList = document.getElementById('transactionList');
    if (!transactionList) return;
    
    try {
        const response = await fetch('/api/transactions', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            }
        });
        
        if (!response.ok) {
            throw new Error('Failed to load transactions');
        }
        
        const data = await response.json();
        allTransactions = data.transactions || [];
        
        if (allTransactions.length === 0) {
            displayEmptyTransactions();
            updateTransactionSummary([]);
            return;
        }
        
        // Sort transactions by date (newest first)
        allTransactions.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        
        // Initially show all transactions
        filteredTransactions = [...allTransactions];
        displayTransactions(filteredTransactions);
        updateTransactionSummary(filteredTransactions);
        setupTransactionFilters();
        
    } catch (error) {
        console.error('Error loading transactions:', error);
        transactionList.innerHTML = `
            <div class="empty-transactions">
                <i class="fas fa-exclamation-triangle"></i>
                <h3>Error Memuat Data</h3>
                <p>Gagal memuat riwayat transaksi. Silakan coba lagi.</p>
            </div>
        `;
    }
}

// Helper function to format date
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

// Helper function to get payment method text
function getPaymentMethodText(method) {
    const methods = {
        'bank_transfer': 'Transfer Bank',
        'credit_card': 'Kartu Kredit',
        'debit_card': 'Kartu Debit',
        'e_wallet': 'E-Wallet',
        'cash': 'Tunai'
    };
    return methods[method] || method;
}

// Helper function to get status text and class
function getStatusInfo(status) {
    const statusMap = {
        'pending': { text: 'Pending', class: 'status-pending' },
        'completed': { text: 'Selesai', class: 'status-completed' },
        'cancelled': { text: 'Dibatalkan', class: 'status-cancelled' }
    };
    return statusMap[status] || { text: status, class: 'status-pending' };
}

function displayEmptyTransactions() {
    const transactionList = document.getElementById('transactionList');
    transactionList.innerHTML = `
        <div class="empty-transactions">
            <i class="fas fa-receipt"></i>
            <h3>Belum Ada Transaksi</h3>
            <p>Mulai berbelanja untuk melihat riwayat transaksi Anda</p>
        </div>
    `;
}

function displayTransactions(transactions) {
    const transactionList = document.getElementById('transactionList');
    
    if (transactions.length === 0) {
        transactionList.innerHTML = `
            <div class="empty-transactions">
                <i class="fas fa-search"></i>
                <h3>Tidak Ada Transaksi</h3>
                <p>Tidak ada transaksi yang sesuai dengan filter yang dipilih</p>
            </div>
        `;
        return;
    }
    
    transactionList.innerHTML = transactions.map(transaction => {
        const statusInfo = getStatusInfo(transaction.status || 'pending');
        return `
        <div class="transaction-item">
            <div class="transaction-header">
                <div class="transaction-info">
                    <h3>Transaksi #${transaction.id}</h3>
                    <p>${transaction.storeName} • ${formatDate(transaction.createdAt)}</p>
                </div>
                <div class="transaction-status ${statusInfo.class}">
                    ${statusInfo.text}
                </div>
            </div>
            
            <div class="transaction-details">
                <div class="transaction-detail-item">
                    <label>Toko</label>
                    <span>${transaction.storeName}</span>
                </div>
                <div class="transaction-detail-item">
                    <label>Pemilik</label>
                    <span>${transaction.storeOwner || 'N/A'}</span>
                </div>
                <div class="transaction-detail-item">
                    <label>Metode Pembayaran</label>
                    <span>${getPaymentMethodText(transaction.paymentMethod)}</span>
                </div>
                <div class="transaction-detail-item">
                    <label>Tanggal</label>
                    <span>${formatDate(transaction.createdAt)}</span>
                </div>
            </div>
            
            <div class="transaction-items">
                <h4>Item yang Dibeli:</h4>
                <div class="transaction-item-list">
                    ${(transaction.items || []).map(item => `
                        <div class="transaction-item-row">
                            <span>${item.name} (${item.quantity}x)</span>
                            <span>${formatCurrency((item.price || 0) * (item.quantity || 1))}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
            
            <div class="transaction-total">
                <span>Total Pembayaran</span>
                <span>${formatCurrency(transaction.totalAmount || 0)}</span>
            </div>
        </div>
        `;
    }).join('');
}

// Setup transaction filters
function setupTransactionFilters() {
    const applyFilterBtn = document.getElementById('applyFilter');
    const clearFilterBtn = document.getElementById('clearFilter');
    const printPDFBtn = document.getElementById('printPDF');
    
    if (applyFilterBtn) {
        applyFilterBtn.addEventListener('click', applyTransactionFilter);
    }
    
    if (clearFilterBtn) {
        clearFilterBtn.addEventListener('click', clearTransactionFilter);
    }
    
    if (printPDFBtn) {
        printPDFBtn.addEventListener('click', printTransactionPDF);
    }
}

// Apply transaction filter
function applyTransactionFilter() {
    const dateFrom = document.getElementById('dateFrom').value;
    const dateTo = document.getElementById('dateTo').value;
    const statusFilter = document.getElementById('statusFilter').value;
    
    filteredTransactions = allTransactions.filter(transaction => {
        const transactionDate = new Date(transaction.createdAt);
        const fromDate = dateFrom ? new Date(dateFrom) : null;
        const toDate = dateTo ? new Date(dateTo) : null;
        
        // Date filter
        if (fromDate && transactionDate < fromDate) return false;
        if (toDate && transactionDate > toDate) return false;
        
        // Status filter
        if (statusFilter !== 'all' && transaction.status !== statusFilter) return false;
        
        return true;
    });
    
    displayTransactions(filteredTransactions);
    updateTransactionSummary(filteredTransactions);
}


// Show error message
function showError(message) {
    umkmGrid.innerHTML = `
        <div class="error-message">
            <i class="fas fa-exclamation-triangle"></i>
            <h3>Oops! Terjadi Kesalahan</h3>
            <p>${message}</p>
            <button onclick="location.reload()" class="btn btn-primary">Coba Lagi</button>
        </div>
    `;
}

// Add CSS for modals
const modalCSS = `
<style>
.contact-modal-overlay,
.details-modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.8);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    padding: 2rem;
}

.contact-modal,
.details-modal {
    background: white;
    border-radius: 16px;
    max-width: 600px;
    width: 100%;
    max-height: 90vh;
    overflow-y: auto;
    animation: slideInScale 0.3s ease-out;
}

.details-modal {
    max-width: 800px;
}

.contact-modal-header,
.details-modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 2rem 2rem 1rem;
    border-bottom: 1px solid var(--border-color);
}

.contact-modal-header h2,
.details-modal-header h2 {
    font-size: 1.8rem;
    font-weight: 700;
    color: var(--text-dark);
    margin: 0;
}

.close-btn {
    background: none;
    border: none;
    font-size: 1.5rem;
    color: var(--text-light);
    cursor: pointer;
    padding: 0.5rem;
    border-radius: 50%;
    transition: all 0.3s ease;
}

.close-btn:hover {
    background: var(--bg-light);
    color: var(--text-dark);
}

.contact-modal-content,
.details-modal-content {
    padding: 2rem;
}

.contact-info {
    display: grid;
    gap: 1.5rem;
    margin-bottom: 2rem;
}

.contact-item {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1rem;
    background: var(--bg-light);
    border-radius: 8px;
}

.contact-item i {
    font-size: 1.2rem;
    color: var(--primary-color);
    width: 20px;
}

.contact-item h4 {
    font-size: 0.9rem;
    font-weight: 600;
    color: var(--text-dark);
    margin-bottom: 0.25rem;
}

.contact-item p {
    margin: 0;
    color: var(--text-light);
}

.contact-item a {
    color: var(--primary-color);
    text-decoration: none;
}

.contact-item a:hover {
    text-decoration: underline;
}

.contact-actions {
    display: flex;
    gap: 1rem;
}

.contact-actions .btn {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
}

.details-image {
    width: 100%;
    height: 300px;
    background: var(--gradient);
    border-radius: 12px;
    margin-bottom: 2rem;
    overflow: hidden;
}

.details-image img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.details-meta {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
    padding-bottom: 1rem;
    border-bottom: 1px solid var(--border-color);
}

.rating {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-weight: 600;
}

.rating i {
    color: #fbbf24;
}

.category {
    background: var(--primary-color);
    color: white;
    padding: 0.5rem 1rem;
    border-radius: 20px;
    font-size: 0.9rem;
    font-weight: 600;
}

.details-description,
.details-contact,
.details-price {
    margin-bottom: 2rem;
}

.details-description h3,
.details-contact h3,
.details-price h3 {
    font-size: 1.2rem;
    font-weight: 600;
    color: var(--text-dark);
    margin-bottom: 1rem;
}

.details-description p {
    line-height: 1.6;
    color: var(--text-light);
}

.contact-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 1rem;
}

.contact-grid .contact-item {
    background: var(--bg-light);
    padding: 1rem;
    border-radius: 8px;
    flex-direction: column;
    text-align: center;
}

.contact-grid .contact-item i {
    font-size: 1.5rem;
    margin-bottom: 0.5rem;
}

.details-price p {
    font-size: 1.2rem;
    font-weight: 700;
    color: var(--primary-color);
}

.details-products {
    margin-bottom: 2rem;
}

.details-products h3 {
    font-size: 1.2rem;
    font-weight: 600;
    color: var(--text-dark);
    margin-bottom: 1rem;
}

.products-preview {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1rem;
    margin-bottom: 1rem;
}

.product-preview-item {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.75rem;
    background: var(--bg-light);
    border-radius: 8px;
    transition: all 0.3s ease;
}

.product-preview-item:hover {
    background: var(--primary-color);
    color: white;
    transform: translateY(-2px);
}

.product-preview-image {
    width: 50px;
    height: 50px;
    border-radius: 6px;
    overflow: hidden;
    flex-shrink: 0;
}

.product-preview-image img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.product-preview-info h4 {
    font-size: 0.9rem;
    font-weight: 600;
    margin-bottom: 0.25rem;
    line-height: 1.3;
}

.product-preview-info p {
    font-size: 0.8rem;
    font-weight: 600;
    color: var(--primary-color);
    margin: 0;
}

.product-preview-item:hover .product-preview-info p {
    color: white;
}

.more-products {
    text-align: center;
    font-style: italic;
    color: var(--text-light);
    margin: 0.5rem 0;
    font-size: 0.9rem;
}

.details-actions {
    display: flex;
    gap: 1rem;
    margin-top: 2rem;
    padding-top: 1.5rem;
    border-top: 1px solid var(--border-color);
}

.details-actions .btn {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
}

@keyframes slideInScale {
    0% {
        opacity: 0;
        transform: scale(0.8);
    }
    100% {
        opacity: 1;
        transform: scale(1);
    }
}

@media (max-width: 768px) {
    .contact-modal,
    .details-modal {
        margin: 1rem;
        max-height: calc(100vh - 2rem);
    }
    
    .contact-modal-header,
    .details-modal-header {
        padding: 1.5rem 1.5rem 1rem;
    }
    
    .contact-modal-content,
    .details-modal-content {
        padding: 1.5rem;
    }
    
    .contact-actions {
        flex-direction: column;
    }
    
    .contact-grid {
        grid-template-columns: 1fr;
    }
}
</style>
`;

document.head.insertAdjacentHTML('beforeend', modalCSS);
