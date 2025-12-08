// ===================================
// MODERN AI ARCHITECT PORTFOLIO - JS
// ===================================

// Cursor Glow Effect
const cursorGlow = document.querySelector('.cursor-glow');
let mouseX = 0;
let mouseY = 0;
let glowX = 0;
let glowY = 0;

document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
});

function animateGlow() {
    // Smooth lerp animation for cursor glow
    glowX += (mouseX - glowX) * 0.1;
    glowY += (mouseY - glowY) * 0.1;

    cursorGlow.style.left = glowX + 'px';
    cursorGlow.style.top = glowY + 'px';

    requestAnimationFrame(animateGlow);
}

animateGlow();

// Hide cursor glow on mobile
if ('ontouchstart' in window) {
    cursorGlow.style.display = 'none';
}

// ===================================
// SMOOTH SCROLL
// ===================================

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

// ===================================
// ACTIVE NAV LINK
// ===================================

const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-links a');

function updateActiveNav() {
    const scrollPosition = window.scrollY + 150;

    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        const sectionId = section.getAttribute('id');

        if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
            navLinks.forEach(link => {
                link.style.color = '';
                const afterElement = link.querySelector('::after');
                if (link.getAttribute('href') === `#${sectionId}`) {
                    link.style.color = 'var(--text-primary)';
                }
            });
        }
    });
}

window.addEventListener('scroll', updateActiveNav);
updateActiveNav();

// ===================================
// INTERSECTION OBSERVER - FADE IN
// ===================================

const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

// Observe elements for fade-in animation
const fadeElements = document.querySelectorAll('.arch-card, .competency-item, .sidebar-card, .contact-card');
fadeElements.forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
    observer.observe(el);
});

// ===================================
// ARCHITECTURE CARDS - COMING SOON
// ===================================

const archCards = document.querySelectorAll('.arch-card');
archCards.forEach((card, index) => {
    card.addEventListener('click', (e) => {
        // Don't trigger if clicking on a link
        if (e.target.tagName === 'A') return;

        const archNumber = index + 1;
        const archTitle = card.querySelector('h3').textContent;

        // Create custom notification
        showNotification(`${archTitle} - Architecture details coming soon!`);
    });
});

// ===================================
// CUSTOM NOTIFICATION
// ===================================

function showNotification(message) {
    // Remove existing notification if any
    const existing = document.querySelector('.custom-notification');
    if (existing) {
        existing.remove();
    }

    // Create notification element
    const notification = document.createElement('div');
    notification.className = 'custom-notification';
    notification.textContent = message;

    // Add styles
    notification.style.cssText = `
        position: fixed;
        bottom: 2rem;
        left: 50%;
        transform: translateX(-50%) translateY(100px);
        background: var(--bg-elevated);
        color: var(--text-primary);
        padding: 1rem 2rem;
        border-radius: 50px;
        border: 1px solid var(--border-hover);
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
        z-index: 10000;
        font-size: 0.9375rem;
        font-weight: 500;
        opacity: 0;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    `;

    document.body.appendChild(notification);

    // Animate in
    setTimeout(() => {
        notification.style.opacity = '1';
        notification.style.transform = 'translateX(-50%) translateY(0)';
    }, 10);

    // Animate out and remove
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateX(-50%) translateY(100px)';
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}

// ===================================
// NAVBAR SCROLL EFFECT
// ===================================

const nav = document.querySelector('.nav');
let lastScrollY = window.scrollY;

window.addEventListener('scroll', () => {
    if (window.scrollY > 100) {
        nav.style.background = 'rgba(10, 10, 10, 0.95)';
        nav.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.3)';
    } else {
        nav.style.background = 'rgba(10, 10, 10, 0.8)';
        nav.style.boxShadow = 'none';
    }

    lastScrollY = window.scrollY;
});

// ===================================
// SCROLL REVEAL ANIMATION
// ===================================

const scrollRevealOptions = {
    threshold: 0.15,
    rootMargin: '0px 0px -50px 0px'
};

const scrollRevealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry, index) => {
        if (entry.isIntersecting) {
            setTimeout(() => {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }, index * 100);
            scrollRevealObserver.unobserve(entry.target);
        }
    });
}, scrollRevealOptions);

// Apply to section headers
document.querySelectorAll('.section-header, .section-title').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = 'opacity 0.8s ease-out, transform 0.8s ease-out';
    scrollRevealObserver.observe(el);
});

// ===================================
// PERFORMANCE OPTIMIZATIONS
// ===================================

// Debounce function for scroll events
function debounce(func, wait = 10) {
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

// Use debounced scroll handler for nav updates
window.addEventListener('scroll', debounce(updateActiveNav, 10));

// ===================================
// EASTER EGG - CONSOLE MESSAGE
// ===================================

console.log(
    '%c🏗️ AI Solutions Architect Portfolio',
    'font-size: 20px; font-weight: bold; background: linear-gradient(135deg, #00d4ff 0%, #0099ff 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent;'
);

console.log(
    '%cBuilt with modern web technologies.\nOptimized for performance and user experience.',
    'font-size: 12px; color: #888;'
);

console.log(
    '%cGeorgios Sakellariou | gsakel25@gmail.com',
    'font-size: 12px; color: #00d4ff;'
);

console.log(
    '%cInterested in the architectures? Get in touch!',
    'font-size: 12px; color: #00ff88;'
);

// ===================================
// PAGE LOAD ANIMATION
// ===================================

window.addEventListener('load', () => {
    document.body.style.opacity = '1';
});

// Set initial opacity
document.body.style.opacity = '0';
document.body.style.transition = 'opacity 0.3s ease-in-out';

// ===================================
// PREVENT FLASH OF UNSTYLED CONTENT
// ===================================

document.addEventListener('DOMContentLoaded', () => {
    document.body.style.visibility = 'visible';
});
