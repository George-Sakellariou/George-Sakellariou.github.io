// AI Architect Portfolio - JavaScript

// Smooth scroll behavior for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            const navHeight = document.querySelector('.nav').offsetHeight;
            const targetPosition = target.offsetTop - navHeight;
            
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        }
    });
});

// Update active nav link on scroll
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-links a');

window.addEventListener('scroll', () => {
    let current = '';
    const scrollPosition = window.scrollY + 100;
    
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        
        if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
            current = section.getAttribute('id');
        }
    });
    
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${current}`) {
            link.classList.add('active');
        }
    });
});

// Navbar background on scroll
const nav = document.querySelector('.nav');
let lastScrollY = window.scrollY;

window.addEventListener('scroll', () => {
    if (window.scrollY > 100) {
        nav.style.background = 'rgba(10, 14, 23, 0.95)';
        nav.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.3)';
    } else {
        nav.style.background = 'rgba(10, 14, 23, 0.8)';
        nav.style.boxShadow = 'none';
    }
    
    lastScrollY = window.scrollY;
});

// Intersection Observer for fade-in animations
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

// Observe architecture cards
document.querySelectorAll('.architecture-card, .experience-item, .sidebar-card').forEach(el => {
    observer.observe(el);
});

// Enhanced hover effect for architecture cards
document.querySelectorAll('.architecture-card').forEach(card => {
    card.addEventListener('mouseenter', function() {
        this.style.transform = 'translateY(-8px)';
    });
    
    card.addEventListener('mouseleave', function() {
        this.style.transform = 'translateY(0)';
    });
});

// Console Easter egg for developers
console.log('%c🏗️ AI Solutions Architect Portfolio', 'font-size: 20px; font-weight: bold; color: #00d9ff;');
console.log('%cBuilt with precision. Optimized for performance.', 'font-size: 12px; color: #8b93a8;');
console.log('%cGeorgios Sakellariou | gsakel25@gmail.com', 'font-size: 12px; color: #00ff88;');
console.log('%cInterested in the architectures? Contact me!', 'font-size: 12px; color: #ffaa00;');

// Add loading animation completion
window.addEventListener('load', () => {
    document.body.classList.add('loaded');
});

// Prevent architecture links from navigating (since pages don't exist yet)
// Remove this once architecture pages are created
document.querySelectorAll('.card-link').forEach(link => {
    link.addEventListener('click', function(e) {
        if (!this.href.includes('architecture-')) return;
        
        const archNum = this.href.match(/architecture-(\d)/)[1];
        alert(`Architecture ${archNum} documentation coming soon! This will showcase the complete system design.`);
        e.preventDefault();
    });
});
