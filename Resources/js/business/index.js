// DOM Elements
const testimonialContent = document.getElementById('testimonial-content');
const prevTestimonialBtn = document.getElementById('prev-testimonial');
const nextTestimonialBtn = document.getElementById('next-testimonial');
const enterpriseForm = document.getElementById('enterprise-form');
const knowledgeNav = document.querySelectorAll('.knowledge-nav .nav-btn');
const knowledgeCards = document.querySelector('.knowledge-cards-wrapper');

// Testimonials data
const testimonials = [
    {
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
        name: 'John Smith',
        company: 'Tech Solutions Inc.',
        rating: 4.5,
        quote: 'Incredible service and expertise! The team at Stratify helped us streamline our business processes, resulting in greater efficiency and profitability. Highly recommended!'
    },
    {
        avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
        name: 'Sarah Johnson',
        company: 'Marketing Pro Ltd.',
        rating: 5,
        quote: 'Outstanding partnership! Their innovative approach and dedicated support have transformed our marketing strategy and delivered exceptional results beyond our expectations.'
    },
    {
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
        name: 'Michael Chen',
        company: 'Global Enterprises',
        rating: 4.5,
        quote: 'Professional excellence at its finest! The comprehensive solutions and expert guidance provided have significantly improved our operational efficiency and market position.'
    }
];

// Current testimonial index
let currentTestimonialIndex = 0;

// Knowledge Hub navigation
let currentKnowledgeIndex = 0;
const knowledgeCardsArray = document.querySelectorAll('.knowledge-card');

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeTestimonials();
    initializePricingForm();
    initializeKnowledgeHub();
    initializeAnimations();
});

// Testimonials functionality
function initializeTestimonials() {
    if (testimonialContent) {
        renderTestimonial(currentTestimonialIndex);
        
        // Event listeners for navigation
        if (prevTestimonialBtn) {
            prevTestimonialBtn.addEventListener('click', () => {
                currentTestimonialIndex = currentTestimonialIndex === 0 
                    ? testimonials.length - 1 
                    : currentTestimonialIndex - 1;
                renderTestimonial(currentTestimonialIndex);
            });
        }
        
        if (nextTestimonialBtn) {
            nextTestimonialBtn.addEventListener('click', () => {
                currentTestimonialIndex = (currentTestimonialIndex + 1) % testimonials.length;
                renderTestimonial(currentTestimonialIndex);
            });
        }
        
        // Auto-rotate testimonials every 5 seconds
        setInterval(() => {
            currentTestimonialIndex = (currentTestimonialIndex + 1) % testimonials.length;
            renderTestimonial(currentTestimonialIndex);
        }, 5000);
    }
}

function renderTestimonial(index) {
    const testimonial = testimonials[index];
    const starsHtml = generateStars(testimonial.rating);
    
    testimonialContent.innerHTML = `
        <img src="${testimonial.avatar}" alt="${testimonial.name}" class="testimonial-avatar">
        <div class="testimonial-text">
            <div class="stars">${starsHtml}</div>
            <p class="testimonial-quote">"${testimonial.quote}"</p>
            <div class="testimonial-author">
                <strong>${testimonial.name}</strong><br>
                <small>${testimonial.company}</small>
            </div>
        </div>
    `;
    
    // Add fade-in animation
    testimonialContent.style.opacity = '0';
    setTimeout(() => {
        testimonialContent.style.opacity = '1';
    }, 100);
}

function generateStars(rating) {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    let starsHtml = '';
    
    for (let i = 0; i < fullStars; i++) {
        starsHtml += '★';
    }
    
    if (hasHalfStar) {
        starsHtml += '☆';
    }
    
    // Fill remaining stars
    const remainingStars = 5 - Math.ceil(rating);
    for (let i = 0; i < remainingStars; i++) {
        starsHtml += '☆';
    }
    
    return starsHtml;
}

// Pricing form functionality
function initializePricingForm() {
    if (enterpriseForm) {
        enterpriseForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const formData = new FormData(enterpriseForm);
            const selectedFeatures = formData.getAll('features');
            
            // Calculate estimated price based on selected features
            const basePrice = 100;
            const featurePrice = 50;
            const estimatedPrice = basePrice + (selectedFeatures.length * featurePrice);
            
            // Show modal or alert with selected features and price
            showPricingModal(selectedFeatures, estimatedPrice);
        });
        
        // Update pricing dynamically when checkboxes change
        const checkboxes = enterpriseForm.querySelectorAll('input[type="checkbox"]');
        checkboxes.forEach(checkbox => {
            checkbox.addEventListener('change', updateEnterprisePrice);
        });
    }
}

function updateEnterprisePrice() {
    const checkboxes = enterpriseForm.querySelectorAll('input[type="checkbox"]:checked');
    const basePrice = 100;
    const featurePrice = 50;
    const estimatedPrice = basePrice + (checkboxes.length * featurePrice);
    
    // Update the price display if there's a price element
    const priceElement = document.querySelector('#plan-custom span');
    if (priceElement && checkboxes.length > 0) {
        priceElement.textContent = `$${estimatedPrice}`;
    } else if (priceElement) {
        priceElement.textContent = 'Custom';
    }
}

function showPricingModal(features, price) {
    const modal = document.createElement('div');
    modal.className = 'pricing-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>Enterprise Plan Quote</h3>
                <button class="modal-close">&times;</button>
            </div>
            <div class="modal-body">
                <h4>Selected Features:</h4>
                <ul>
                    ${features.map(feature => `<li>${feature}</li>`).join('')}
                </ul>
                <div class="estimated-price">
                    <strong>Estimated Monthly Price: $${price}</strong>
                </div>
                <p>Our sales team will contact you within 24 hours to finalize your custom plan.</p>
            </div>
            <div class="modal-footer">
                <button class="btn-outline modal-close">Close</button>
                <button class="plan-btn">Contact Sales</button>
            </div>
        </div>
    `;
    
    // Add modal styles
    const modalStyles = `
        .pricing-modal {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1000;
        }
        .modal-content {
            background: white;
            border-radius: 16px;
            max-width: 500px;
            width: 90%;
            max-height: 90vh;
            overflow-y: auto;
        }
        .modal-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 24px;
            border-bottom: 1px solid #e5e7eb;
        }
        .modal-close {
            background: none;
            border: none;
            font-size: 24px;
            cursor: pointer;
        }
        .modal-body {
            padding: 24px;
        }
        .estimated-price {
            background: #f3f4f6;
            padding: 16px;
            border-radius: 8px;
            margin: 16px 0;
            text-align: center;
            font-size: 1.2rem;
        }
        .modal-footer {
            display: flex;
            gap: 16px;
            padding: 24px;
            border-top: 1px solid #e5e7eb;
        }
    `;
    
    if (!document.querySelector('#modal-styles')) {
        const styleSheet = document.createElement('style');
        styleSheet.id = 'modal-styles';
        styleSheet.textContent = modalStyles;
        document.head.appendChild(styleSheet);
    }
    
    document.body.appendChild(modal);
    
    // Close modal functionality
    modal.querySelectorAll('.modal-close').forEach(btn => {
        btn.addEventListener('click', () => {
            document.body.removeChild(modal);
        });
    });
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            document.body.removeChild(modal);
        }
    });
}

// Knowledge Hub functionality
function initializeKnowledgeHub() {
    if (knowledgeNav.length > 0 && knowledgeCardsArray.length > 0) {
        knowledgeNav.forEach((btn, index) => {
            btn.addEventListener('click', () => {
                if (index === 0) { // Previous button
                    scrollKnowledgeCards('prev');
                } else { // Next button
                    scrollKnowledgeCards('next');
                }
            });
        });
    }
}

function scrollKnowledgeCards(direction) {
    const cardWidth = knowledgeCardsArray[0].offsetWidth + 30; // Card width + gap
    const container = knowledgeCards;
    
    if (direction === 'next') {
        container.scrollBy({ left: cardWidth, behavior: 'smooth' });
    } else {
        container.scrollBy({ left: -cardWidth, behavior: 'smooth' });
    }
}

// Animations and interactions
function initializeAnimations() {
    // Intersection Observer for scroll animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
            }
        });
    }, observerOptions);
    
    // Observe all cards and sections
    document.querySelectorAll('.card, .price-card, .knowledge-card, section').forEach(el => {
        observer.observe(el);
    });
    
    // Add smooth scrolling to anchor links
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
    
    // Add hover effects to cards
    document.querySelectorAll('.card, .price-card, .knowledge-card').forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-5px)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
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

// Handle window resize
window.addEventListener('resize', debounce(() => {
    // Recalculate layouts if needed
    if (knowledgeCards) {
        knowledgeCards.scrollLeft = 0;
    }
}, 250));

// Add CSS animations
const animationStyles = `
    @keyframes fadeInUp {
        from {
            opacity: 0;
            transform: translateY(30px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
    
    .animate-in {
        animation: fadeInUp 0.6s ease forwards;
    }
    
    .testimonial-content {
        transition: opacity 0.3s ease;
    }
`;

if (!document.querySelector('#animation-styles')) {
    const styleSheet = document.createElement('style');
    styleSheet.id = 'animation-styles';
    styleSheet.textContent = animationStyles;
    document.head.appendChild(styleSheet);
}