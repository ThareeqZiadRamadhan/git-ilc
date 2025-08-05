// DOM Content Loaded
document.addEventListener('DOMContentLoaded', function() {
    // Toggle functionality for Monthly/Yearly
    const monthlyBtn = document.getElementById('monthly-btn');
    const yearlyBtn = document.getElementById('yearly-btn');
    const prices = document.querySelectorAll('.price');
    
    // Price data
    const priceData = {
        monthly: ['$00', '$50', '$100'],
        yearly: ['$00', '$500', '$1000']
    };
    
    // Handle Monthly button click
    monthlyBtn.addEventListener('click', function() {
        setActiveToggle(monthlyBtn, yearlyBtn);
        updatePrices('monthly');
        updatePriceText('Per user/month, Annual');
    });
    
    // Handle Yearly button click
    yearlyBtn.addEventListener('click', function() {
        setActiveToggle(yearlyBtn, monthlyBtn);
        updatePrices('yearly');
        updatePriceText('Per user/year, Annual');
    });
    
    // Set active toggle button
    function setActiveToggle(activeBtn, inactiveBtn) {
        activeBtn.classList.add('active');
        inactiveBtn.classList.remove('active');
    }
    
    // Update prices based on selected period
    function updatePrices(period) {
        prices.forEach((price, index) => {
            price.textContent = priceData[period][index];
        });
    }
    
    // Update price text
    function updatePriceText(text) {
        const priceTexts = document.querySelectorAll('.price-text');
        priceTexts.forEach(priceText => {
            priceText.textContent = text;
        });
    }
    
    // Add click handlers for Get Started buttons
    const getStartedButtons = document.querySelectorAll('.btn-get-started');
    getStartedButtons.forEach((button, index) => {
        button.addEventListener('click', function() {
            const planNames = ['Free Plan', 'Pro Plan', 'Performance Plan'];
            showAlert(`You selected the ${planNames[index]}!`);
        });
    });
    
    // Add click handler for Explore plan button
    const exploreBtn = document.querySelector('.btn-explore');
    exploreBtn.addEventListener('click', function() {
        showAlert('Explore more plans coming soon!');
    });
    
    // Custom alert function
    function showAlert(message) {
        // Create a modern alert overlay
        const overlay = document.createElement('div');
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.5);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 1000;
        `;
        
        const alertBox = document.createElement('div');
        alertBox.style.cssText = `
            background: white;
            padding: 40px;
            border-radius: 20px;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
            text-align: center;
            max-width: 400px;
            width: 90%;
        `;
        
        const alertText = document.createElement('p');
        alertText.textContent = message;
        alertText.style.cssText = `
            margin: 0 0 20px 0;
            font-size: 1.1rem;
            color: #2c3e50;
        `;
        
        const closeBtn = document.createElement('button');
        closeBtn.textContent = 'OK';
        closeBtn.style.cssText = `
            background: #007bff;
            color: white;
            border: none;
            padding: 12px 30px;
            border-radius: 25px;
            font-weight: 600;
            cursor: pointer;
            transition: background 0.3s ease;
        `;
        
        closeBtn.addEventListener('click', function() {
            document.body.removeChild(overlay);
        });
        
        closeBtn.addEventListener('mouseenter', function() {
            this.style.background = '#0056b3';
        });
        
        closeBtn.addEventListener('mouseleave', function() {
            this.style.background = '#007bff';
        });
        
        alertBox.appendChild(alertText);
        alertBox.appendChild(closeBtn);
        overlay.appendChild(alertBox);
        document.body.appendChild(overlay);
        
        // Close on overlay click
        overlay.addEventListener('click', function(e) {
            if (e.target === overlay) {
                document.body.removeChild(overlay);
            }
        });
    }
    
    // Add smooth scroll animation for better UX
    function addSmoothAnimations() {
        const cards = document.querySelectorAll('.pricing-card');
        
        // Intersection Observer for scroll animations
        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }
            });
        }, {
            threshold: 0.1
        });
        
        // Initially hide cards for animation
        cards.forEach((card, index) => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(30px)';
            card.style.transition = `opacity 0.6s ease ${index * 0.1}s, transform 0.6s ease ${index * 0.1}s`;
            observer.observe(card);
        });
    }
    
    // Initialize animations
    addSmoothAnimations();
    
    // Add keyboard navigation support
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Tab') {
            // Add focus styles for better accessibility
            const focusedElement = document.activeElement;
            if (focusedElement.classList.contains('toggle-btn') || 
                focusedElement.classList.contains('btn-get-started') || 
                focusedElement.classList.contains('btn-explore')) {
                focusedElement.style.outline = '2px solid #007bff';
                focusedElement.style.outlineOffset = '2px';
            }
        }
    });
    
    // Remove focus outline on mouse click
    document.addEventListener('mousedown', function() {
        const focusedElement = document.activeElement;
        if (focusedElement) {
            focusedElement.style.outline = 'none';
        }
    });
});