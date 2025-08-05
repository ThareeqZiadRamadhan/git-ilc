// Landing Page JavaScript

document.addEventListener('DOMContentLoaded', function() {
    
    // Smooth scroll for any anchor links
    const anchorLinks = document.querySelectorAll('a[href^="#"]');
    anchorLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            if (targetSection) {
                targetSection.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Add interactive hover effects for service cards
    const serviceCards = document.querySelectorAll('.service-card');
    serviceCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-8px)';
            this.style.boxShadow = '0 12px 40px rgba(0, 0, 0, 0.15)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
            this.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.05)';
        });
    });

    // Enhanced hover effect for digital media card
    const digitalMediaCard = document.querySelector('.digital-media-card');
    if (digitalMediaCard) {
        digitalMediaCard.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-5px)';
            this.style.boxShadow = '0 15px 50px rgba(0, 0, 0, 0.3)';
        });
        
        digitalMediaCard.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
            this.style.boxShadow = '0 8px 30px rgba(0, 0, 0, 0.2)';
        });
    }

    // Interactive arrow icons
    const arrowIcons = document.querySelectorAll('.arrow-icon');
    arrowIcons.forEach(arrow => {
        arrow.addEventListener('click', function() {
            // Add a click animation
            this.style.transform = 'scale(0.95) translateX(5px)';
            setTimeout(() => {
                this.style.transform = 'scale(1) translateX(5px)';
            }, 150);
            
            // You can add navigation logic here
            console.log('Service card clicked!');
        });
    });

    // Play button interaction
    const playButton = document.querySelector('.play-button');
    if (playButton) {
        playButton.addEventListener('click', function() {
            // Add click animation
            this.style.transform = 'scale(0.9)';
            setTimeout(() => {
                this.style.transform = 'scale(1)';
            }, 150);
            
            // You can add video play functionality here
            console.log('Play button clicked!');
            alert('Video player would open here!');
        });
    }

    // Add fade-in animation on scroll
    function fadeInOnScroll() {
        const elements = document.querySelectorAll('.service-card, .digital-media-card');
        elements.forEach(element => {
            const elementTop = element.getBoundingClientRect().top;
            const elementVisible = 150;
            
            if (elementTop < window.innerHeight - elementVisible) {
                element.style.opacity = '1';
                element.style.transform = 'translateY(0)';
            }
        });
    }

    // Initially hide elements for fade-in effect
    const animatedElements = document.querySelectorAll('.service-card, .digital-media-card');
    animatedElements.forEach(element => {
        element.style.opacity = '0';
        element.style.transform = 'translateY(50px)';
        element.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    });

    // Run fade-in on scroll
    window.addEventListener('scroll', fadeInOnScroll);
    
    // Run once on load
    fadeInOnScroll();

    // Add parallax effect to hero section
    window.addEventListener('scroll', function() {
        const scrolled = window.pageYOffset;
        const heroSection = document.querySelector('.hero-section');
        if (heroSection) {
            const rate = scrolled * -0.5;
            heroSection.style.transform = `translateY(${rate}px)`;
        }
    });

    // Add typing effect to the main heading (optional enhancement)
    function typeWriter(element, text, speed = 100) {
        let i = 0;
        element.innerHTML = '';
        
        function type() {
            if (i < text.length) {
                element.innerHTML += text.charAt(i);
                i++;
                setTimeout(type, speed);
            }
        }
        type();
    }

    // Optional: Add typing effect to main heading
    const mainHeading = document.querySelector('.hero-section h1');
    if (mainHeading) {
        const originalText = mainHeading.textContent;
        // Uncomment the line below to enable typing effect
        // typeWriter(mainHeading, originalText, 50);
    }

    // Add loading animation
    window.addEventListener('load', function() {
        document.body.style.opacity = '0';
        document.body.style.transition = 'opacity 0.5s ease';
        
        setTimeout(() => {
            document.body.style.opacity = '1';
        }, 100);
    });

    // Mobile menu handling (if needed for future expansion)
    function handleMobileMenu() {
        const width = window.innerWidth;
        if (width <= 768) {
            // Mobile-specific adjustments
            const cards = document.querySelectorAll('.service-card');
            cards.forEach(card => {
                card.style.marginBottom = '20px';
            });
        }
    }

    window.addEventListener('resize', handleMobileMenu);
    handleMobileMenu(); // Run on initial load

    console.log('Landing page loaded successfully!');
});