// Security Landing Page JavaScript

document.addEventListener('DOMContentLoaded', function() {
    
    // Smooth scrolling for navigation links
    initSmoothScrolling();
    
    // Initialize fade-in animations
    initFadeInAnimations();
    
    // Initialize statistics chart
    initStatsChart();
    
    // Initialize navbar scroll effect
    initNavbarScrollEffect();
    
    // Initialize counter animations
    initCounterAnimations();
    
    // Initialize typing effect for hero title
    initTypingEffect();
    
    // Initialize carousel for client spotlights
    initSpotlightsCarousel();
    
    // Initialize form validations
    initFormValidations();
    
    // Initialize loading animations
    initLoadingAnimations();
});

// Smooth scrolling for navigation links
function initSmoothScrolling() {
    const navLinks = document.querySelectorAll('a[href^="#"]');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            
            if (targetSection) {
                const offsetTop = targetSection.offsetTop - 80;
                
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// Fade-in animations on scroll
function initFadeInAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, observerOptions);
    
    // Add fade-in class to elements
    const elementsToAnimate = document.querySelectorAll(
        '.offer-card, .spotlight-card, .blog-card, .pricing-card, .testimonial-card, .stat-item'
    );
    
    elementsToAnimate.forEach(element => {
        element.classList.add('fade-in');
        observer.observe(element);
    });
}

// Initialize statistics chart
function initStatsChart() {
    const canvas = document.getElementById('statsChart');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    
    // Set canvas size
    canvas.width = 160;
    canvas.height = 60;
    
    // Generate random data points for the chart
    const dataPoints = [];
    for (let i = 0; i < 10; i++) {
        dataPoints.push(Math.random() * 40 + 20);
    }
    
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: Array.from({length: 10}, (_, i) => i + 1),
            datasets: [{
                data: dataPoints,
                borderColor: '#10b981',
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                borderWidth: 2,
                fill: true,
                tension: 0.4,
                pointRadius: 0,
                pointHoverRadius: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                x: {
                    display: false
                },
                y: {
                    display: false
                }
            },
            elements: {
                point: {
                    radius: 0
                }
            }
        }
    });
}

// Navbar scroll effect
function initNavbarScrollEffect() {
    const navbar = document.querySelector('.navbar');
    
    window.addEventListener('scroll', function() {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
            navbar.style.backgroundColor = 'rgba(255, 255, 255, 0.95)';
            navbar.style.backdropFilter = 'blur(10px)';
        } else {
            navbar.classList.remove('scrolled');
            navbar.style.backgroundColor = 'var(--white)';
            navbar.style.backdropFilter = 'none';
        }
    });
}

// Counter animations for statistics
function initCounterAnimations() {
    const counters = document.querySelectorAll('.stat-number');
    
    const observerOptions = {
        threshold: 0.5
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateCounter(entry.target);
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    counters.forEach(counter => {
        observer.observe(counter);
    });
}

function animateCounter(element) {
    const target = element.textContent;
    let current = 0;
    
    // Extract number from text
    const match = target.match(/[\d.]+/);
    if (!match) return;
    
    const targetNumber = parseFloat(match[0]);
    const suffix = target.replace(match[0], '');
    const increment = targetNumber / 100;
    
    const timer = setInterval(() => {
        current += increment;
        if (current >= targetNumber) {
            current = targetNumber;
            clearInterval(timer);
        }
        
        let displayValue = current;
        if (targetNumber >= 1000) {
            displayValue = Math.floor(current);
        } else {
            displayValue = current.toFixed(1);
        }
        
        element.textContent = displayValue + suffix;
    }, 20);
}

// Typing effect for hero title
function initTypingEffect() {
    const heroTitle = document.querySelector('.hero-title');
    if (!heroTitle) return;
    
    const text = heroTitle.innerHTML;
    heroTitle.innerHTML = '';
    
    let index = 0;
    const typeInterval = setInterval(() => {
        if (index < text.length) {
            heroTitle.innerHTML += text.charAt(index);
            index++;
        } else {
            clearInterval(typeInterval);
        }
    }, 50);
}

// Client spotlights carousel
function initSpotlightsCarousel() {
    const spotlightCards = document.querySelectorAll('.spotlight-card');
    
    if (spotlightCards.length === 0) return;
    
    let currentIndex = 0;
    
    // Auto-rotate every 5 seconds
    setInterval(() => {
        spotlightCards[currentIndex].style.opacity = '0.7';
        currentIndex = (currentIndex + 1) % spotlightCards.length;
        spotlightCards[currentIndex].style.opacity = '1';
    }, 5000);
}

// Form validations
function initFormValidations() {
    const forms = document.querySelectorAll('form');
    
    forms.forEach(form => {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const inputs = form.querySelectorAll('input[required], textarea[required]');
            let isValid = true;
            
            inputs.forEach(input => {
                if (!input.value.trim()) {
                    isValid = false;
                    input.classList.add('is-invalid');
                } else {
                    input.classList.remove('is-invalid');
                }
            });
            
            if (isValid) {
                // Show success message
                showNotification('Thank you! Your message has been sent.', 'success');
                form.reset();
            } else {
                showNotification('Please fill in all required fields.', 'error');
            }
        });
    });
}

// Show notification
function showNotification(message, type) {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        color: white;
        font-weight: 500;
        z-index: 1000;
        transform: translateX(100%);
        transition: transform 0.3s ease;
        ${type === 'success' ? 'background-color: #10b981;' : 'background-color: #ef4444;'}
    `;
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// Loading animations
function initLoadingAnimations() {
    // Add pulse animation to cards while images load
    const images = document.querySelectorAll('img');
    
    images.forEach(img => {
        if (!img.complete) {
            img.parentElement.classList.add('pulse');
            
            img.addEventListener('load', function() {
                this.parentElement.classList.remove('pulse');
            });
        }
    });
}

// Parallax effect for hero section
function initParallaxEffect() {
    const heroSection = document.querySelector('.hero-section');
    
    window.addEventListener('scroll', function() {
        const scrolled = window.pageYOffset;
        const parallax = scrolled * 0.5;
        
        heroSection.style.transform = `translateY(${parallax}px)`;
    });
}

// Interactive button effects
document.querySelectorAll('.btn').forEach(button => {
    button.addEventListener('mouseenter', function() {
        this.style.transform = 'translateY(-2px)';
    });
    
    button.addEventListener('mouseleave', function() {
        this.style.transform = 'translateY(0)';
    });
    
    button.addEventListener('mousedown', function() {
        this.style.transform = 'translateY(0) scale(0.98)';
    });
    
    button.addEventListener('mouseup', function() {
        this.style.transform = 'translateY(-2px) scale(1)';
    });
});

// Accordion enhanced functionality
document.querySelectorAll('.accordion-button').forEach(button => {
    button.addEventListener('click', function() {
        const accordion = this.closest('.accordion');
        const allButtons = accordion.querySelectorAll('.accordion-button');
        
        allButtons.forEach(btn => {
            if (btn !== this) {
                btn.classList.add('collapsed');
            }
        });
    });
});

// Mobile menu enhancements
const navbarToggler = document.querySelector('.navbar-toggler');
const navbarCollapse = document.querySelector('.navbar-collapse');

if (navbarToggler && navbarCollapse) {
    navbarToggler.addEventListener('click', function() {
        navbarCollapse.classList.toggle('show');
    });
    
    // Close mobile menu when clicking on links
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            if (window.innerWidth < 992) {
                navbarCollapse.classList.remove('show');
            }
        });
    });
}

// Lazy loading for images
function initLazyLoading() {
    const images = document.querySelectorAll('img[data-src]');
    
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.classList.remove('lazy');
                imageObserver.unobserve(img);
            }
        });
    });
    
    images.forEach(img => imageObserver.observe(img));
}

// Initialize lazy loading
initLazyLoading();

// Dark mode toggle (optional feature)
function initDarkModeToggle() {
    const darkModeToggle = document.getElementById('darkModeToggle');
    
    if (darkModeToggle) {
        darkModeToggle.addEventListener('click', function() {
            document.body.classList.toggle('dark-mode');
            
            // Save preference
            const isDarkMode = document.body.classList.contains('dark-mode');
            localStorage.setItem('darkMode', isDarkMode);
        });
        
        // Load saved preference
        const savedDarkMode = localStorage.getItem('darkMode');
        if (savedDarkMode === 'true') {
            document.body.classList.add('dark-mode');
        }
    }
}

// Initialize all features
window.addEventListener('load', function() {
    initParallaxEffect();
    initDarkModeToggle();
});

// Performance optimization: Throttle scroll events
function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// Apply throttling to scroll events
window.addEventListener('scroll', throttle(function() {
    // Scroll-dependent functions here
}, 16)); // ~60fps