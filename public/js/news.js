// News Page JavaScript
let currentPage = 1;
let currentCategory = 'all';
let currentSearch = '';
let allNews = [];

// DOM Elements
const newsGrid = document.getElementById('newsGrid');
const featuredCard = document.getElementById('featuredCard');
const popularNews = document.getElementById('popularNews');
const filterTabs = document.querySelectorAll('.filter-tab');
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const loadMoreBtn = document.getElementById('loadMoreBtn');

// Initialize page
document.addEventListener('DOMContentLoaded', async () => {
    await loadNewsData();
    
    // Set default filters
    resetFiltersToDefault();
    
    displayFeaturedNews();
    displayNewsGrid();
    displayPopularNews();
    displayPopularCategories();
    setupEventListeners();
});

// Load news data from API
async function loadNewsData() {
    try {
        const response = await fetch('/api/news');
        const data = await response.json();
        allNews = Array.isArray(data) ? data : [];
    } catch (error) {
        console.error('Error loading news:', error);
        showError('Gagal memuat data berita');
    }
}

// Display featured news
function displayFeaturedNews() {
    if (allNews.length === 0) return;
    
    const featured = allNews[0];
    featuredCard.innerHTML = `
        <div class="featured-image">
            <img src="${featured.image}" alt="${featured.title}" onerror="this.style.display='none'">
        </div>
        <div class="featured-content">
            <div class="featured-meta">
                <span><i class="fas fa-calendar"></i> ${formatDate(featured.date)}</span>
                <span><i class="fas fa-user"></i> ${featured.author}</span>
                <span><i class="fas fa-eye"></i> ${featured.views} views</span>
            </div>
            <h3 class="featured-title">${featured.title}</h3>
            <p class="featured-excerpt">${featured.summary}</p>
            <a href="#" class="featured-read-more" onclick="openNewsModal(${featured.id})">
                Baca Selengkapnya <i class="fas fa-arrow-right"></i>
            </a>
        </div>
    `;
}

// Display news grid
function displayNewsGrid() {
    const filteredNews = getFilteredNews();
    const newsToShow = filteredNews.slice(0, currentPage * 6);
    
    // Check if no results found
    if (filteredNews.length === 0 && currentSearch) {
        newsGrid.innerHTML = `
            <div class="no-results-message">
                <div class="no-results-icon">
                    <i class="fas fa-search"></i>
                </div>
                <h3>Tidak Ada Berita Ditemukan</h3>
                <p>Maaf, tidak ada berita yang sesuai dengan pencarian "<strong>${currentSearch}</strong>"</p>
                <div class="no-results-suggestions">
                    <p>Coba gunakan kata kunci yang berbeda atau periksa ejaan kata kunci Anda.</p>
                    <button onclick="clearSearch()" class="btn btn-primary">
                        <i class="fas fa-times"></i> Hapus Pencarian
                    </button>
                </div>
            </div>
        `;
        loadMoreBtn.style.display = 'none';
        return;
    }
    
    newsGrid.innerHTML = newsToShow.map((news, index) => `
        <div class="news-card" data-category="${(news.category_name || news.category).toLowerCase()}" data-news-id="${news.id}">
            <div class="news-image">
                <img src="${news.image}" alt="${news.title}" onerror="this.style.display='none'">
            </div>
            <div class="news-content-card">
                <div class="news-meta">
                    <span><i class="fas fa-calendar"></i> ${formatDate(news.date)}</span>
                    <span><i class="fas fa-user"></i> ${news.author}</span>
                </div>
                <div class="news-category">${news.category_name || news.category}</div>
                <h4 class="news-title">${highlightSearchTerm(news.title)}</h4>
                <p class="news-excerpt">${highlightSearchTerm(news.summary)}</p>
                <a href="#" class="news-read-more" onclick="openNewsModal(${news.id})">
                    Baca Selengkapnya <i class="fas fa-arrow-right"></i>
                </a>
            </div>
        </div>
    `).join('');
    
    // Show/hide load more button
    loadMoreBtn.style.display = newsToShow.length < filteredNews.length ? 'block' : 'none';
}

// Display popular news
function displayPopularNews() {
    const popular = allNews
        .sort((a, b) => b.views - a.views)
        .slice(0, 5);
    
    popularNews.innerHTML = popular.map(news => `
        <div class="popular-item" onclick="openNewsModal(${news.id})">
            <div class="popular-image">
                <img src="${news.image}" alt="${news.title}" onerror="this.style.display='none'">
            </div>
            <div class="popular-content">
                <h4>${news.title}</h4>
                <p>${news.views} views</p>
            </div>
        </div>
    `).join('');
}

// Calculate category statistics
function calculateCategoryStats() {
    const categoryStats = {};
    
    allNews.forEach(news => {
        const category = news.category_name || news.category;
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
    
    categoryList.innerHTML = sortedCategories.map(([category, count]) => `
        <div class="category-item" onclick="filterByCategory('${category.toLowerCase()}')">
            <span class="category-name">${category}</span>
            <span class="category-count">${count}</span>
        </div>
    `).join('');
}

// Get filtered news based on category and search
function getFilteredNews() {
    let filtered = allNews;
    
    // Filter by category
    if (currentCategory !== 'all') {
        filtered = filtered.filter(news => 
            (news.category_name || news.category).toLowerCase() === currentCategory.toLowerCase()
        );
    }
    
    // Filter by search (prioritize title search)
    if (currentSearch) {
        const searchTerm = currentSearch.toLowerCase();
        filtered = filtered.filter(news =>
            news.title.toLowerCase().includes(searchTerm) ||
            news.summary.toLowerCase().includes(searchTerm) ||
            news.author.toLowerCase().includes(searchTerm)
        );
        
        // Sort results to prioritize title matches
        filtered.sort((a, b) => {
            const aTitleMatch = a.title.toLowerCase().includes(searchTerm);
            const bTitleMatch = b.title.toLowerCase().includes(searchTerm);
            
            if (aTitleMatch && !bTitleMatch) return -1;
            if (!aTitleMatch && bTitleMatch) return 1;
            return 0;
        });
    }
    
    return filtered;
}

// Setup event listeners
function setupEventListeners() {
    // Filter tabs
    filterTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            filterTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            currentCategory = tab.dataset.category;
            currentPage = 1;
            displayNewsGrid();
        });
    });
    
    // Search functionality
    searchBtn.addEventListener('click', performSearch);
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            performSearch();
        }
    });
    
    // Load more button
    loadMoreBtn.addEventListener('click', () => {
        currentPage++;
        displayNewsGrid();
    });
}

// Perform search
function performSearch() {
    currentSearch = searchInput.value.trim();
    
    // Reset category to 'all' before searching
    if (currentSearch) {
        resetFiltersToDefault();
    }
    
    displayNewsGrid();
    
    // Show toast notification based on search results
    if (currentSearch) {
        const filteredNews = getFilteredNews();
        setTimeout(() => {
            if (filteredNews.length > 0) {
                showToast(`Ditemukan ${filteredNews.length} berita untuk "${currentSearch}"`, 'success');
                scrollToFirstResult();
            } else {
                showToast(`Tidak ada berita ditemukan untuk "${currentSearch}"`, 'error');
            }
        }, 100);
    }
}

// Scroll to first search result
function scrollToFirstResult() {
    const firstNewsCard = document.querySelector('.news-card[data-news-id]');
    if (firstNewsCard) {
        // Calculate offset to account for fixed navigation
        const navHeight = document.querySelector('.minimal-navbar').offsetHeight;
        const filterHeight = document.querySelector('.news-filter').offsetHeight;
        const offset = navHeight + filterHeight + 20;
        
        const elementPosition = firstNewsCard.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - offset;
        
        window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
        });
        
        // Add highlight effect to the first result
        firstNewsCard.style.animation = 'searchHighlight 2s ease-in-out';
    }
}

// Highlight search terms in text
function highlightSearchTerm(text) {
    if (!currentSearch) return text;
    
    const searchTerm = currentSearch.toLowerCase();
    const regex = new RegExp(`(${searchTerm})`, 'gi');
    return text.replace(regex, '<mark class="search-highlight">$1</mark>');
}

// Reset filters to default state (all categories)
function resetFiltersToDefault() {
    currentCategory = 'all';
    currentPage = 1;
    
    // Update active tab to 'Semua'
    filterTabs.forEach(tab => {
        tab.classList.remove('active');
        if (tab.dataset.category === 'all') {
            tab.classList.add('active');
        }
    });
}

// Filter by category from popular categories
function filterByCategory(category) {
    // Update current category
    currentCategory = category;
    currentPage = 1;
    
    // Update active tab
    filterTabs.forEach(tab => {
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
    
    // Display filtered news
    displayNewsGrid();
    
    // Show toast notification
    const categoryStats = calculateCategoryStats();
    const categoryName = Object.keys(categoryStats).find(cat => 
        cat.toLowerCase() === category
    );
    const count = categoryStats[categoryName] || 0;
    showToast(`Menampilkan ${count} berita dalam kategori "${categoryName}"`, 'info');
    
    // Scroll to news section
    const newsSection = document.querySelector('.news-content');
    if (newsSection) {
        const navHeight = document.querySelector('.minimal-navbar').offsetHeight;
        const filterHeight = document.querySelector('.news-filter').offsetHeight;
        const offset = navHeight + filterHeight + 20;
        
        const elementPosition = newsSection.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - offset;
        
        window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
        });
    }
}

// Clear search
function clearSearch() {
    currentSearch = '';
    searchInput.value = '';
    
    // Reset filters to default state
    resetFiltersToDefault();
    
    displayNewsGrid();
    
    // Show toast notification for clearing search
    showToast('Pencarian dihapus, menampilkan semua berita', 'info');
    
    // Scroll back to top of news section
    const newsSection = document.querySelector('.news-content');
    if (newsSection) {
        const navHeight = document.querySelector('.minimal-navbar').offsetHeight;
        const filterHeight = document.querySelector('.news-filter').offsetHeight;
        const offset = navHeight + filterHeight + 20;
        
        const elementPosition = newsSection.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - offset;
        
        window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
        });
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

// Open news modal (placeholder for now)
function openNewsModal(newsId) {
    const news = allNews.find(n => n.id === newsId);
    if (news) {
        // Create modal content
        const modalContent = `
            <div class="news-modal-overlay" onclick="closeNewsModal()">
                <div class="news-modal" onclick="event.stopPropagation()">
                    <div class="news-modal-header">
                        <h2>${news.title}</h2>
                        <button class="close-btn" onclick="closeNewsModal()">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <div class="news-modal-content">
                        <div class="news-modal-image">
                            <img src="${news.image}" alt="${news.title}" onerror="this.style.display='none'">
                        </div>
                        <div class="news-modal-meta">
                            <span><i class="fas fa-calendar"></i> ${formatDate(news.date)}</span>
                            <span><i class="fas fa-user"></i> ${news.author}</span>
                            <span><i class="fas fa-eye"></i> ${news.views} views</span>
                            <span><i class="fas fa-heart"></i> ${news.likes} likes</span>
                        </div>
                        <div class="news-modal-body">
                            <p>${news.content}</p>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalContent);
        document.body.style.overflow = 'hidden';
    }
}

// Close news modal
function closeNewsModal() {
    const modal = document.querySelector('.news-modal-overlay');
    if (modal) {
        modal.remove();
        document.body.style.overflow = 'auto';
    }
}

// Format date
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

// Show error message
function showError(message) {
    newsGrid.innerHTML = `
        <div class="error-message">
            <i class="fas fa-exclamation-triangle"></i>
            <h3>Oops! Terjadi Kesalahan</h3>
            <p>${message}</p>
            <button onclick="location.reload()" class="btn btn-primary">Coba Lagi</button>
        </div>
    `;
}

// Add CSS for modal and search features
const modalCSS = `
<style>
.news-modal-overlay {
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

.news-modal {
    background: white;
    border-radius: 16px;
    max-width: 800px;
    width: 100%;
    max-height: 90vh;
    overflow-y: auto;
    animation: slideInScale 0.3s ease-out;
}

.news-modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 2rem 2rem 1rem;
    border-bottom: 1px solid var(--border-color);
}

.news-modal-header h2 {
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

.news-modal-content {
    padding: 2rem;
}

.news-modal-image {
    width: 100%;
    height: 300px;
    background: var(--gradient);
    border-radius: 12px;
    margin-bottom: 1.5rem;
    overflow: hidden;
}

.news-modal-image img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.news-modal-meta {
    display: flex;
    gap: 2rem;
    margin-bottom: 2rem;
    font-size: 0.9rem;
    color: var(--text-light);
    flex-wrap: wrap;
}

.news-modal-meta span {
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.news-modal-body {
    line-height: 1.8;
    color: var(--text-dark);
}

.news-modal-body p {
    margin-bottom: 1.5rem;
}

/* No Results Message Styles */
.no-results-message {
    text-align: center;
    padding: 4rem 2rem;
    background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
    border-radius: 16px;
    border: 2px dashed #cbd5e1;
    margin: 2rem 0;
}

.no-results-icon {
    font-size: 4rem;
    color: #94a3b8;
    margin-bottom: 1.5rem;
}

.no-results-message h3 {
    font-size: 1.8rem;
    font-weight: 600;
    color: #334155;
    margin-bottom: 1rem;
}

.no-results-message p {
    font-size: 1.1rem;
    color: #64748b;
    margin-bottom: 2rem;
    line-height: 1.6;
}

.no-results-suggestions {
    max-width: 400px;
    margin: 0 auto;
}

.no-results-suggestions p {
    font-size: 0.95rem;
    color: #64748b;
    margin-bottom: 1.5rem;
}

/* Search Highlight Styles */
.search-highlight {
    background: linear-gradient(120deg, #fbbf24 0%, #f59e0b 100%);
    color: white;
    padding: 0.2rem 0.4rem;
    border-radius: 4px;
    font-weight: 600;
    box-shadow: 0 2px 4px rgba(245, 158, 11, 0.3);
}

/* Search Highlight Animation */
@keyframes searchHighlight {
    0% {
        transform: scale(1);
        box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.7);
    }
    50% {
        transform: scale(1.02);
        box-shadow: 0 0 0 10px rgba(59, 130, 246, 0);
    }
    100% {
        transform: scale(1);
        box-shadow: 0 0 0 0 rgba(59, 130, 246, 0);
    }
}

/* Toast Notification Styles */
.toast-notification {
    position: fixed;
    top: 20px;
    right: 20px;
    min-width: 320px;
    max-width: 500px;
    background: white;
    border-radius: 12px;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
    z-index: 10000;
    transform: translateX(100%);
    opacity: 0;
    transition: all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
    border-left: 4px solid #3b82f6;
    overflow: hidden;
}

.toast-notification.show {
    transform: translateX(0);
    opacity: 1;
}

.toast-content {
    display: flex;
    align-items: center;
    padding: 1rem 1.5rem;
    gap: 1rem;
}

.toast-icon {
    font-size: 1.5rem;
    flex-shrink: 0;
}

.toast-message {
    flex: 1;
}

.toast-message p {
    margin: 0;
    font-size: 0.95rem;
    font-weight: 500;
    color: #374151;
    line-height: 1.4;
}

.toast-close {
    background: none;
    border: none;
    font-size: 1rem;
    color: #9ca3af;
    cursor: pointer;
    padding: 0.25rem;
    border-radius: 4px;
    transition: all 0.2s ease;
    flex-shrink: 0;
}

.toast-close:hover {
    background: #f3f4f6;
    color: #374151;
}

.toast-progress {
    height: 3px;
    background: linear-gradient(90deg, #3b82f6, #1d4ed8);
    width: 100%;
    transform: scaleX(1);
    transform-origin: left;
    animation: toastProgress 4s linear forwards;
}

/* Toast Types */
.toast-success {
    border-left-color: #10b981;
}

.toast-success .toast-icon {
    color: #10b981;
}

.toast-success .toast-progress {
    background: linear-gradient(90deg, #10b981, #059669);
}

.toast-error {
    border-left-color: #ef4444;
}

.toast-error .toast-icon {
    color: #ef4444;
}

.toast-error .toast-progress {
    background: linear-gradient(90deg, #ef4444, #dc2626);
}

.toast-warning {
    border-left-color: #f59e0b;
}

.toast-warning .toast-icon {
    color: #f59e0b;
}

.toast-warning .toast-progress {
    background: linear-gradient(90deg, #f59e0b, #d97706);
}

.toast-info {
    border-left-color: #3b82f6;
}

.toast-info .toast-icon {
    color: #3b82f6;
}

.toast-info .toast-progress {
    background: linear-gradient(90deg, #3b82f6, #1d4ed8);
}

/* Toast Progress Animation */
@keyframes toastProgress {
    0% {
        transform: scaleX(1);
    }
    100% {
        transform: scaleX(0);
    }
}

/* Toast Hover Effects */
.toast-notification:hover .toast-progress {
    animation-play-state: paused;
}

/* Popular Categories Styles */
.category-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.75rem 1rem;
    margin-bottom: 0.5rem;
    background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.3s ease;
    border: 1px solid transparent;
}

.category-item:hover {
    background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
    color: white;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
    border-color: #1d4ed8;
}

.category-item:hover .category-name {
    color: white;
    font-weight: 600;
}

.category-item:hover .category-count {
    background: rgba(255, 255, 255, 0.2);
    color: white;
    border-color: rgba(255, 255, 255, 0.3);
}

.category-name {
    font-weight: 500;
    color: #374151;
    transition: all 0.3s ease;
}

.category-count {
    background: #e5e7eb;
    color: #6b7280;
    padding: 0.25rem 0.5rem;
    border-radius: 12px;
    font-size: 0.75rem;
    font-weight: 600;
    border: 1px solid #d1d5db;
    transition: all 0.3s ease;
    min-width: 24px;
    text-align: center;
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
    .news-modal {
        margin: 1rem;
        max-height: calc(100vh - 2rem);
    }
    
    .news-modal-header {
        padding: 1.5rem 1.5rem 1rem;
    }
    
    .news-modal-content {
        padding: 1.5rem;
    }
    
    .news-modal-meta {
        gap: 1rem;
    }
    
    .no-results-message {
        padding: 3rem 1.5rem;
    }
    
    .no-results-icon {
        font-size: 3rem;
    }
    
    .no-results-message h3 {
        font-size: 1.5rem;
    }
    
    /* Toast Responsive */
    .toast-notification {
        top: 20px;
        right: 20px;
        left: auto;
        min-width: 280px;
        max-width: calc(100vw - 40px);
    }
    
    .toast-content {
        padding: 0.875rem 1rem;
        gap: 0.75rem;
    }
    
    .toast-icon {
        font-size: 1.25rem;
    }
    
    .toast-message p {
        font-size: 0.875rem;
    }
}
</style>
`;

document.head.insertAdjacentHTML('beforeend', modalCSS);
