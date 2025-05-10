// Mobile Menu Toggle
const mobileMenu = document.querySelector('.mobile-menu');
const navLinks = document.querySelector('.nav-links');

if (mobileMenu) {
    mobileMenu.addEventListener('click', () => {
        mobileMenu.classList.toggle('active');
        navLinks.classList.toggle('active');
    });
}

// Close mobile menu when clicking on a link
document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', () => {
        mobileMenu.classList.remove('active');
        navLinks.classList.remove('active');
    });
});

// Smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        if (this.getAttribute('href') !== '#') {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 70,
                    behavior: 'smooth'
                });
            }
        }
    });
});

// Header scroll effect
const header = document.querySelector('header');

if (header) {
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.1)';
            header.style.background = 'rgba(255, 255, 255, 0.95)';
        } else {
            header.style.boxShadow = 'none';
            header.style.background = 'rgba(255, 255, 255, 0.95)';
        }
    });
}

// Form submission (prevent default)
const contactForm = document.querySelector('.contact-form');
const newsletterForm = document.querySelector('.newsletter-form');

if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        alert('Thank you for your message! We will get back to you soon.');
        contactForm.reset();
    });
}

if (newsletterForm) {
    newsletterForm.addEventListener('submit', (e) => {
        e.preventDefault();
        alert('Thank you for subscribing to our newsletter!');
        newsletterForm.reset();
    });
}

// Animation on scroll
const animateOnScroll = () => {
    const elements = document.querySelectorAll('.feature-card, .stat, .about-image, .contact-form, .mission-card, .team-member');
    
    elements.forEach(element => {
        const elementPosition = element.getBoundingClientRect().top;
        const screenPosition = window.innerHeight / 1.3;
        
        if (elementPosition < screenPosition) {
            element.style.opacity = '1';
            element.style.transform = 'translateY(0)';
        }
    });
};

// Set initial styles for animation
document.querySelectorAll('.feature-card, .stat, .about-image, .contact-form, .mission-card, .team-member').forEach(element => {
    element.style.opacity = '0';
    element.style.transform = 'translateY(20px)';
    element.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
});

// Run animation on load and scroll
window.addEventListener('load', animateOnScroll);
window.addEventListener('scroll', animateOnScroll);

// FAQ Accordion
const faqItems = document.querySelectorAll('.faq-item');

if (faqItems.length > 0) {
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        
        question.addEventListener('click', () => {
            // Close all other items
            faqItems.forEach(otherItem => {
                if (otherItem !== item) {
                    otherItem.classList.remove('active');
                }
            });
            
            // Toggle current item
            item.classList.toggle('active');
        });
    });
}

// Breathing Exercise
const breathingCircle = document.querySelector('.breathing-circle');
const instructionText = document.querySelector('.instruction-text');
const startBreathingBtn = document.querySelector('.start-breathing');

if (startBreathingBtn) {
    startBreathingBtn.addEventListener('click', () => {
        startBreathingBtn.style.display = 'none';
        startBreathingExercise();
    });
}

function startBreathingExercise() {
    let count = 0;
    const maxCycles = 3;
    
    function breatheIn() {
        if (breathingCircle && instructionText) {
            instructionText.textContent = 'Inhale...';
            breathingCircle.classList.add('inhale');
            breathingCircle.classList.remove('exhale');
            
            setTimeout(breatheOut, 4000);
        }
    }
    
    function breatheOut() {
        if (breathingCircle && instructionText) {
            instructionText.textContent = 'Exhale...';
            breathingCircle.classList.add('exhale');
            breathingCircle.classList.remove('inhale');
            
            count++;
            
            if (count < maxCycles) {
                setTimeout(breatheIn, 4000);
            } else {
                setTimeout(() => {
                    if (instructionText && startBreathingBtn) {
                        instructionText.textContent = 'Great job!';
                        startBreathingBtn.style.display = 'inline-block';
                        startBreathingBtn.textContent = 'Start Again';
                    }
                }, 4000);
            }
        }
    }
    
    breatheIn();
}

// Count Up Animation for Stats
const statNumbers = document.querySelectorAll('.animate-count-up .stat-number');

function animateCountUp() {
    statNumbers.forEach(statNumber => {
        const target = parseInt(statNumber.getAttribute('data-target'));
        const duration = 2000; // 2 seconds
        const startTime = performance.now();
        
        function updateCount(currentTime) {
            const elapsedTime = currentTime - startTime;
            const progress = Math.min(elapsedTime / duration, 1);
            const currentValue = Math.floor(progress * target);
            
            statNumber.textContent = currentValue;
            
            if (progress < 1) {
                requestAnimationFrame(updateCount);
            } else {
                statNumber.textContent = target;
            }
        }
        
        requestAnimationFrame(updateCount);
    });
}

// Intersection Observer for Count Up Animation
if (statNumbers.length > 0) {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateCountUp();
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });
    
    // Observe the first stat number (they're all in the same container)
    observer.observe(statNumbers[0].parentElement);
}

// Page Transitions
function initPageTransitions() {
    const pageTransition = document.querySelector('.page-transition');
    
    // Store the current page URL
    let currentPage = window.location.href;
    
    // Add click event to all internal links
    document.querySelectorAll('a').forEach(link => {
        // Only add transition to internal links that aren't anchor links
        if (link.href.includes(window.location.origin) && !link.href.includes('#')) {
            link.addEventListener('click', function(e) {
                // Don't transition if it's the same page
                if (link.href === currentPage) {
                    return;
                }
                
                e.preventDefault();
                
                // Show transition
                pageTransition.classList.add('active');
                
                // Navigate after transition
                setTimeout(() => {
                    window.location.href = link.href;
                }, 500);
            });
        }
    });
    
    // Hide transition on page load
    window.addEventListener('load', () => {
        setTimeout(() => {
            pageTransition.classList.remove('active');
        }, 100);
    });
}

// Initialize page transitions
initPageTransitions();