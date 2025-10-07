// Auth guard for homepage
document.addEventListener('DOMContentLoaded', () => {
    try {
        const token = localStorage.getItem('authToken');
        let userData = localStorage.getItem('userData');
        if (!token) {
            window.location.href = '/login';
            return;
        }

        // If userData missing, try to decode from token payload (non-critical)
        if (!userData) {
            try {
                const payloadBase64 = token.split('.')[1];
                const payloadJson = atob(payloadBase64);
                const payload = JSON.parse(payloadJson);
                const minimalUser = {
                    id: payload.id,
                    username: payload.username,
                    role: payload.role
                };
                localStorage.setItem('userData', JSON.stringify(minimalUser));
                userData = JSON.stringify(minimalUser);
            } catch (_) {
                // If decoding fails, keep going without redirect to avoid loop
            }
        }

        // Populate navbar account controls
        const user = userData ? JSON.parse(userData) : null;
        const navUsername = document.getElementById('navUsername');
        if (navUsername && user) {
            navUsername.textContent = user.fullName || user.username || 'Akun';
        }
        const logoutBtn = document.getElementById('navLogoutBtn');
        const logoutBtnMobile = document.getElementById('navLogoutBtnMobile');
        const setupLogout = (btn) => btn && btn.addEventListener('click', () => {
                localStorage.removeItem('authToken');
                localStorage.removeItem('userData');
                window.location.href = '/login';
            });
        setupLogout(logoutBtn);
        setupLogout(logoutBtnMobile);

        // Populate mobile username
        const navUsernameMobile = document.getElementById('navUsernameMobile');
        if (navUsernameMobile && user) {
            navUsernameMobile.textContent = user.fullName || user.username || 'Akun';
        }
    } catch (e) {
        window.location.href = '/login';
    }
});

// DOM Elements
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');
const navLinks = document.querySelectorAll('.nav-link');
const contactForm = document.getElementById('contactForm');

// Mobile Navigation Toggle
if (hamburger && navMenu) {
    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        navMenu.classList.toggle('active');
    });
}

// Close mobile menu when clicking on a link
if (hamburger && navMenu) {
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
        });
    });
}

// Smooth scrolling for navigation links
navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const targetId = link.getAttribute('href');
        const targetSection = document.querySelector(targetId);
        
        if (targetSection) {
            targetSection.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Active navigation link on scroll
window.addEventListener('scroll', () => {
    const sections = document.querySelectorAll('section[id]');
    const scrollPos = window.scrollY + 100;

    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.offsetHeight;
        const sectionId = section.getAttribute('id');

        if (scrollPos >= sectionTop && scrollPos < sectionTop + sectionHeight) {
            navLinks.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === `#${sectionId}`) {
                    link.classList.add('active');
                }
            });
        }
    });
});


// Contact Form Handling
if (contactForm) contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = new FormData(contactForm);
    const data = {
        name: formData.get('name'),
        email: formData.get('email'),
        subject: formData.get('subject'),
        message: formData.get('message')
    };

    // Show loading state
    const submitBtn = contactForm.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Mengirim...';
    submitBtn.disabled = true;

    try {
        // Send to API endpoint
        const response = await fetch('/api/contact', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });
        
        const result = await response.json();
        
        if (result.success) {
            // Show success message
            showSuccessMessage();
            contactForm.reset();
        } else {
            throw new Error(result.message || 'Gagal mengirim pesan');
        }
    } catch (error) {
        console.error('Error sending message:', error);
        showErrorMessage(error.message || 'Gagal mengirim pesan. Silakan coba lagi.');
    } finally {
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }
});

// Show Success Message
function showSuccessMessage() {
    const successDiv = document.createElement('div');
    successDiv.className = 'success-message';
    successDiv.innerHTML = `
        <div style="background: #d4edda; color: #155724; padding: 1rem; border-radius: 8px; margin-top: 1rem; text-align: center;">
            <i class="fas fa-check-circle"></i>
            <strong>Pesan berhasil dikirim!</strong>
            <p>Terima kasih atas pesan Anda. Kami akan segera merespons ke email Anda.</p>
        </div>
    `;
    
    contactForm.appendChild(successDiv);
    
    // Remove success message after 5 seconds
    setTimeout(() => {
        successDiv.remove();
    }, 5000);
}

// Show Error Message
function showErrorMessage(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.innerHTML = `
        <div style="background: #f8d7da; color: #721c24; padding: 1rem; border-radius: 8px; margin-top: 1rem; text-align: center;">
            <i class="fas fa-exclamation-circle"></i>
            <strong>Gagal mengirim pesan!</strong>
            <p>${message}</p>
        </div>
    `;
    
    contactForm.appendChild(errorDiv);
    
    // Remove error message after 5 seconds
    setTimeout(() => {
        errorDiv.remove();
    }, 5000);
}

// Newsletter Form Handling
document.addEventListener('DOMContentLoaded', () => {
    const newsletterForm = document.querySelector('.newsletter-form');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = newsletterForm.querySelector('input[type="email"]').value;
            
            if (email) {
                // Show success message
                const button = newsletterForm.querySelector('button');
                const originalText = button.textContent;
                button.textContent = 'Subscribed!';
                button.style.background = '#10b981';
                
                setTimeout(() => {
                    button.textContent = originalText;
                    button.style.background = '';
                }, 2000);
                
                newsletterForm.querySelector('input[type="email"]').value = '';
            }
        });
    }
});

// Intersection Observer for animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe elements for animation
document.addEventListener('DOMContentLoaded', () => {
    const animatedElements = document.querySelectorAll('.feature-card, .explore-card, .contact-item');
    
    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
});

// Navbar background on scroll
window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    if (!navbar) return;
    if (window.scrollY > 50) {
        navbar.style.background = 'rgba(255, 255, 255, 0.98)';
        navbar.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.1)';
    } else {
        navbar.style.background = 'rgba(255, 255, 255, 0.95)';
        navbar.style.boxShadow = 'none';
    }
});


// Utility function to format date
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

// Utility function to truncate text
function truncateText(text, maxLength) {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
}

// Carousel functionality
class AboutCarousel {
    constructor() {
        this.carousel = document.getElementById('aboutCarousel');
        this.prevBtn = document.getElementById('prevBtn');
        this.nextBtn = document.getElementById('nextBtn');
        this.indicators = document.querySelectorAll('.indicator');
        this.currentSlide = 0;
        this.totalSlides = 3;
        this.isAnimating = false;
        
        this.init();
    }
    
    init() {
        if (!this.carousel) return;
        
        if (this.prevBtn) this.prevBtn.addEventListener('click', () => this.prevSlide());
        if (this.nextBtn) this.nextBtn.addEventListener('click', () => this.nextSlide());
        
        this.indicators.forEach((indicator, index) => {
            indicator.addEventListener('click', () => this.goToSlide(index));
        });
        
        // Auto-play carousel with initial delay
        setTimeout(() => {
            this.startAutoPlay();
        }, 1000); // Start auto-play after 1 second
        
        // Pause on hover
        this.carousel.addEventListener('mouseenter', () => this.stopAutoPlay());
        this.carousel.addEventListener('mouseleave', () => this.startAutoPlay());
        
        // Pause on focus (for accessibility)
        this.carousel.addEventListener('focusin', () => this.stopAutoPlay());
        this.carousel.addEventListener('focusout', () => this.startAutoPlay());
        
        // Touch/swipe support
        this.addTouchSupport();
    }
    
    prevSlide() {
        if (this.isAnimating) return;
        
        this.currentSlide = this.currentSlide === 0 ? this.totalSlides - 1 : this.currentSlide - 1;
        this.updateSlide();
    }
    
    nextSlide() {
        if (this.isAnimating) return;
        
        this.currentSlide = this.currentSlide === this.totalSlides - 1 ? 0 : this.currentSlide + 1;
        this.updateSlide();
    }
    
    goToSlide(slideIndex) {
        if (this.isAnimating || slideIndex === this.currentSlide) return;
        
        this.currentSlide = slideIndex;
        this.updateSlide();
    }
    
    updateSlide() {
        this.isAnimating = true;
        
        // Remove all slide classes
        this.carousel.classList.remove('slide-0', 'slide-1', 'slide-2');
        
        // Add current slide class
        this.carousel.classList.add(`slide-${this.currentSlide}`);
        
        // Update indicators
        this.indicators.forEach((indicator, index) => {
            indicator.classList.toggle('active', index === this.currentSlide);
        });
        
        // Reset animation flag after transition
        setTimeout(() => {
            this.isAnimating = false;
        }, 600);
    }
    
    startAutoPlay() {
        this.stopAutoPlay();
        this.autoPlayInterval = setInterval(() => {
            this.nextSlide();
        }, 3000); // Reduced to 3 seconds for more dynamic movement
    }
    
    stopAutoPlay() {
        if (this.autoPlayInterval) {
            clearInterval(this.autoPlayInterval);
            this.autoPlayInterval = null;
        }
    }
    
    addTouchSupport() {
        let startX = 0;
        let endX = 0;
        
        this.carousel.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
        });
        
        this.carousel.addEventListener('touchend', (e) => {
            endX = e.changedTouches[0].clientX;
            this.handleSwipe(startX, endX);
        });
    }
    
    handleSwipe(startX, endX) {
        const threshold = 50;
        const diff = startX - endX;
        
        if (Math.abs(diff) > threshold) {
            if (diff > 0) {
                this.nextSlide();
            } else {
                this.prevSlide();
            }
        }
    }
}

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    console.log('BizConnect loaded successfully!');
    
    // Initialize carousel
    new AboutCarousel();
    
    // Add smooth scrolling to all anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
});

// Back to Top Function
function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

// Show/Hide Back to Top Button based on scroll position
window.addEventListener('scroll', () => {
    const backToTopBtn = document.getElementById('backToTop');
    if (backToTopBtn) {
        if (window.pageYOffset > 300) {
            backToTopBtn.classList.add('show');
        } else {
            backToTopBtn.classList.remove('show');
        }
    }
});