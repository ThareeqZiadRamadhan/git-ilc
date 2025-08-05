// Client Success Spotlights Landing Page JavaScript

document.addEventListener('DOMContentLoaded', function() {
    
    // Initialize animations
    initializeAnimations();
    
    // Initialize testimonial functionality
    initializeTestimonials();
    
    // Initialize interactive features
    initializeInteractivity();
    
    // Initialize scroll effects
    initializeScrollEffects();
});

// Animation initialization
function initializeAnimations() {
    // Animate elements on page load
    const animateElements = document.querySelectorAll('.success-card, .testimonial-card');
    
    animateElements.forEach((element, index) => {
        element.style.opacity = '0';
        element.style.transform = 'translateY(30px)';
        
        setTimeout(() => {
            element.style.transition = 'all 0.6s ease-out';
            element.style.opacity = '1';
            element.style.transform = 'translateY(0)';
        }, index * 150);
    });
    
    // Add fade-in class to header elements
    setTimeout(() => {
        const headers = document.querySelectorAll('h2, .lead');
        headers.forEach(header => {
            header.classList.add('fade-in');
        });
    }, 300);
}

// Testimonial functionality
function initializeTestimonials() {
    const testimonials = [
        {
            image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80",
            text: "Incredible service and expertise! The team at Stratify helped us streamline our business processes, resulting in greater efficiency and profitability. Highly recommended!",
            rating: 4.5
        },
        {
            image: "https://images.unsplash.com/photo-1494790108755-2616b9cb8dad?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80",
            text: "Outstanding support and innovative solutions! They transformed our customer experience and helped us achieve remarkable growth in just six months.",
            rating: 5
        }
    ];
    
    let currentTestimonial = 0;
    const testimonialImage = document.querySelector('.client-photo img');
    const testimonialText = document.querySelector('.testimonial-text');
    const navDots = document.querySelectorAll('.nav-dot');
    const starsContainer = document.querySelector('.stars');
    
    // Navigation dot functionality
    navDots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            switchTestimonial(index);
        });
    });
    
    function switchTestimonial(index) {
        if (index === currentTestimonial) return;
        
        // Add loading state
        const testimonialCard = document.querySelector('.testimonial-card');
        testimonialCard.classList.add('loading');
        
        setTimeout(() => {
            currentTestimonial = index;
            const testimonial = testimonials[currentTestimonial];
            
            // Update content
            testimonialImage.src = testimonial.image;
            testimonialText.textContent = `"${testimonial.text}"`;
            
            // Update stars
            updateStars(testimonial.rating);
            
            // Update navigation dots
            navDots.forEach((dot, i) => {
                dot.classList.toggle('active', i === currentTestimonial);
            });
            
            // Remove loading state
            testimonialCard.classList.remove('loading');
            
            // Add slide-up animation
            testimonialCard.classList.remove('slide-up');
            setTimeout(() => {
                testimonialCard.classList.add('slide-up');
            }, 10);
            
        }, 300);
    }
    
    function updateStars(rating) {
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 !== 0;
        
        starsContainer.innerHTML = '';
        
        // Add full stars
        for (let i = 0; i < fullStars; i++) {
            const star = document.createElement('i');
            star.className = 'fas fa-star text-warning';
            starsContainer.appendChild(star);
        }
        
        // Add half star if needed
        if (hasHalfStar) {
            const halfStar = document.createElement('i');
            halfStar.className = 'fas fa-star-half-alt text-warning';
            starsContainer.appendChild(halfStar);
        }
        
        // Add empty stars to complete 5 stars
        const remainingStars = 5 - Math.ceil(rating);
        for (let i = 0; i < remainingStars; i++) {
            const emptyStar = document.createElement('i');
            emptyStar.className = 'far fa-star text-warning';
            starsContainer.appendChild(emptyStar);
        }
    }
    
    // Auto-rotate testimonials every 5 seconds
    setInterval(() => {
        const nextIndex = (currentTestimonial + 1) % testimonials.length;
        switchTestimonial(nextIndex);
    }, 5000);
}

// Interactive features
function initializeInteractivity() {
    // View All button functionality
    const viewAllBtn = document.getElementById('viewAllBtn');
    
    viewAllBtn.addEventListener('click', function() {
        // Add click animation
        this.style.transform = 'scale(0.95)';
        setTimeout(() => {
            this.style.transform = 'scale(1)';
        }, 150);
        
        // Scroll to testimonials section
        const testimonialsSection = document.querySelector('.testimonials');
        testimonialsSection.scrollIntoView({ 
            behavior: 'smooth',
            block: 'start'
        });
        
        // Add pulse effect to testimonial cards
        setTimeout(() => {
            const testimonialCard = document.querySelector('.testimonial-card');
            testimonialCard.style.animation = 'pulse 0.6s ease-in-out';
            setTimeout(() => {
                testimonialCard.style.animation = '';
            }, 600);
        }, 1000);
    });
    
    // Success card hover effects
    const successCards = document.querySelectorAll('.success-card');
    
    successCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            // Add subtle glow effect
            this.style.boxShadow = '0 20px 40px rgba(0, 0, 0, 0.2)';
            
            // Slightly scale the image
            const image = this.querySelector('.card-image img');
            if (image) {
                image.style.transform = 'scale(1.05)';
            }
        });
        
        card.addEventListener('mouseleave', function() {
            // Reset effects
            this.style.boxShadow = '';
            
            const image = this.querySelector('.card-image img');
            if (image) {
                image.style.transform = 'scale(1)';
            }
        });
        
        // Click effect
        card.addEventListener('click', function() {
            // Add ripple effect
            const ripple = document.createElement('div');
            ripple.style.cssText = `
                position: absolute;
                border-radius: 50%;
                background: rgba(255, 255, 255, 0.3);
                transform: scale(0);
                animation: ripple 0.6s linear;
                width: 20px;
                height: 20px;
                left: 50%;
                top: 50%;
                margin-left: -10px;
                margin-top: -10px;
                pointer-events: none;
            `;
            
            this.appendChild(ripple);
            
            setTimeout(() => {
                ripple.remove();
            }, 600);
        });
    });
}

// Scroll effects
function initializeScrollEffects() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in');
            }
        });
    }, observerOptions);
    
    // Observe elements for scroll animations
    const elementsToObserve = document.querySelectorAll('.success-card, .testimonial-card');
    elementsToObserve.forEach(el => {
        observer.observe(el);
    });
    
    // Parallax effect for background elements
    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        const rate = scrolled * -0.5;
        
        const clientSpotlights = document.querySelector('.client-spotlights');
        if (clientSpotlights) {
            clientSpotlights.style.transform = `translateY(${rate}px)`;
        }
    });
}

// Utility functions
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Add CSS for ripple animation
const style = document.createElement('style');
style.textContent = `
    @keyframes ripple {
        to {
            transform: scale(4);
            opacity: 0;
        }
    }
    
    @keyframes pulse {
        0%, 100% {
            transform: scale(1);
        }
        50% {
            transform: scale(1.02);
        }
    }
`;
document.head.appendChild(style);

// Performance optimization
function optimizePerformance() {
    // Lazy load images
    const images = document.querySelectorAll('img[data-src]');
    
    const imageObserver = new IntersectionObserver((entries) => {
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

// Initialize performance optimizations
document.addEventListener('DOMContentLoaded', optimizePerformance);

// Export functions for testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        initializeAnimations,
        initializeTestimonials,
        initializeInteractivity,
        initializeScrollEffects
    };
}