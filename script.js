// JavaScript for Pricing Toggle and Interactions

document.addEventListener('DOMContentLoaded', function() {
    // Pricing toggle functionality
    const toggleButtons = document.querySelectorAll('.toggle-btn');
    const priceElements = document.querySelectorAll('.price');
    const periodElements = document.querySelectorAll('.price-period');
    
    // Current period state
    let currentPeriod = 'monthly';
    
    // Toggle button click handler
    toggleButtons.forEach(button => {
        button.addEventListener('click', function() {
            const period = this.getAttribute('data-period');
            
            if (period !== currentPeriod) {
                // Update active state
                toggleButtons.forEach(btn => btn.classList.remove('active'));
                this.classList.add('active');
                
                // Update prices with animation
                updatePrices(period);
                
                // Update current period
                currentPeriod = period;
            }
        });
    });
    
    // Function to update prices with smooth animation
    function updatePrices(period) {
        priceElements.forEach(priceEl => {
            // Add updating class for animation
            priceEl.classList.add('updating');
            
            setTimeout(() => {
                const monthlyPrice = priceEl.getAttribute('data-monthly');
                const yearlyPrice = priceEl.getAttribute('data-yearly');
                
                let newPrice;
                if (period === 'yearly') {
                    newPrice = yearlyPrice;
                } else {
                    newPrice = monthlyPrice;
                }
                
                priceEl.textContent = '$' + newPrice;
                
                // Remove updating class
                setTimeout(() => {
                    priceEl.classList.remove('updating');
                }, 150);
            }, 150);
        });
        
        // Update period text
        periodElements.forEach(periodEl => {
            if (period === 'yearly') {
                periodEl.textContent = 'Per user/year, Annual';
            } else {
                periodEl.textContent = 'Per user/month, Annual';
            }
        });
    }
    
    // Smooth scroll for CTA buttons (optional enhancement)
    const ctaButtons = document.querySelectorAll('.btn-cta');
    ctaButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Add click animation
            this.style.transform = 'scale(0.95)';
            setTimeout(() => {
                this.style.transform = '';
            }, 150);
            
            // Here you would typically handle the actual signup process
            console.log('CTA clicked for plan:', this.closest('.pricing-card').querySelector('.card-title').textContent);
        });
    });
    
    // Explore plan button
    const exploreBtn = document.querySelector('.explore-btn');
    if (exploreBtn) {
        exploreBtn.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Add click animation
            this.style.transform = 'scale(0.95)';
            setTimeout(() => {
                this.style.transform = '';
            }, 150);
            
            console.log('Explore plan clicked');
        });
    }
    
    // Add hover effects for pricing cards
    const pricingCards = document.querySelectorAll('.pricing-card');
    pricingCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transition = 'all 0.3s ease';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transition = 'all 0.3s ease';
        });
    });
    
    // Initialize with monthly pricing (already set in HTML)
    console.log('Pricing page initialized with monthly billing');
});

// Additional utility functions
function formatPrice(price) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0
    }).format(price);
}

// Function to handle responsive behavior
function handleResize() {
    const proCard = document.querySelector('.pro-plan');
    if (window.innerWidth <= 768) {
        proCard.style.transform = 'none';
    } else {
        proCard.style.transform = 'scale(1.05)';
    }
}

// Listen for window resize
window.addEventListener('resize', handleResize);

// Call once on load
handleResize();