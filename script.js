// Performance optimizations and utility functions
const debounce = (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
};

const perfUtils = {
    // Debounce function to limit rate of execution
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    // Throttle function to ensure minimum time between executions
    throttle(func, limit) {
        let inThrottle;
        return function executedFunction(...args) {
            if (!inThrottle) {
                func(...args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    },

    // Request animation frame with fallback
    rafCallback(callback) {
        return window.requestAnimationFrame ||
            window.webkitRequestAnimationFrame ||
            window.mozRequestAnimationFrame ||
            function(callback) {
                window.setTimeout(callback, 1000 / 60);
            };
    },

    // Check if element is in viewport
    isInViewport(element) {
        const rect = element.getBoundingClientRect();
        return (
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
            rect.right <= (window.innerWidth || document.documentElement.clientWidth)
        );
    }
};

// Optimized form submission handler
async function handleFormSubmission(form) {
    const submitButton = form.querySelector('button[type="submit"]');
    const loadingSpinner = submitButton.querySelector('.loading');
    
    try {
        // Show loading state
        submitButton.disabled = true;
        loadingSpinner.style.display = 'block';
        
        const formData = new FormData(form);
        
        // Encode data for Netlify
        const urlEncodedData = new URLSearchParams(formData).toString();
        
        const response = await fetch('/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: urlEncodedData
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        // Success handling
        showMessage('Bedankt! Uw aanvraag is succesvol verzonden.', 'success');
        form.reset();
        
        // Redirect to success page if specified
        if (form.getAttribute('action')) {
            window.location.href = form.getAttribute('action');
        }
    } catch (error) {
        console.error('Form submission error:', error);
        showMessage('Er is iets misgegaan. Probeer het later opnieuw.', 'error');
    } finally {
        // Reset form state
        submitButton.disabled = false;
        loadingSpinner.style.display = 'none';
    }
}

// Message display function
function showMessage(message, type = 'success') {
    // Remove any existing messages
    const existingMessages = document.querySelectorAll('.message');
    existingMessages.forEach(msg => msg.remove());
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `message message-${type}`;
    messageDiv.setAttribute('role', 'alert');
    messageDiv.setAttribute('aria-live', 'polite');
    messageDiv.textContent = message;
    
    // Add message to DOM
    document.body.appendChild(messageDiv);
    
    // Ensure message is visible
    requestAnimationFrame(() => {
        messageDiv.classList.add('visible');
    });
    
    // Remove message after delay
    setTimeout(() => {
        messageDiv.classList.remove('visible');
        setTimeout(() => messageDiv.remove(), 300);
    }, 5000);
}

// Initialize form handling
document.addEventListener('DOMContentLoaded', () => {
    const forms = document.querySelectorAll('form[data-netlify="true"]');
    
    forms.forEach(form => {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            await handleFormSubmission(form);
        });
    });
});

// Optimized scroll handler
const scrollHandler = perfUtils.throttle(() => {
    // Update scroll-based animations only if needed
    requestAnimationFrame(() => {
        document.querySelectorAll('.section:not(.visible)').forEach(section => {
            if (perfUtils.isInViewport(section)) {
                section.classList.add('visible');
                // Remove will-change after animation
                setTimeout(() => {
                    section.style.willChange = 'auto';
                }, 1000);
            }
        });
    });
}, 100);

// Optimized intersection observer
const observerCallback = (entries, observer) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            // Cleanup
            observer.unobserve(entry.target);
            // Remove will-change after animation
            requestAnimationFrame(() => {
                setTimeout(() => {
                    entry.target.style.willChange = 'auto';
                }, 1000);
            });
        }
    });
};

// Initialize observers with optimized options
const observerOptions = {
    root: null,
    rootMargin: '50px',
    threshold: 0.1
};

const sectionObserver = new IntersectionObserver(observerCallback, observerOptions);

// Cache DOM queries
const domElements = {
    sections: document.querySelectorAll('.section'),
    cards: document.querySelectorAll('.service-card, .testimonial-card'),
    forms: document.querySelectorAll('form'),
    navLinks: document.querySelectorAll('.nav-link'),
    backToTop: document.querySelector('.back-to-top')
};

// Initialize animations with performance optimizations
document.addEventListener('DOMContentLoaded', () => {
    // Observe sections for animations
    domElements.sections.forEach(section => {
        section.style.willChange = 'transform, opacity';
        sectionObserver.observe(section);
    });

    // Optimize card animations
    domElements.cards.forEach(card => {
        card.style.willChange = 'transform';
        card.addEventListener('transitionend', () => {
            card.style.willChange = 'auto';
        });
    });

    // Optimize form submissions
    domElements.forms.forEach(form => {
        const submitButton = form.querySelector('button[type="submit"]');
        if (!submitButton) return;

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            submitButton.disabled = true;

            try {
                await handleFormSubmission(form);
            } finally {
                submitButton.disabled = false;
            }
        });
    });

    // Optimize scroll handling
    window.addEventListener('scroll', scrollHandler, { passive: true });

    // Optimize back to top button
    if (domElements.backToTop) {
        window.addEventListener('scroll', perfUtils.throttle(() => {
            requestAnimationFrame(() => {
                domElements.backToTop.classList.toggle('visible', window.scrollY > 500);
            });
        }, 100), { passive: true });

        domElements.backToTop.addEventListener('click', (e) => {
            e.preventDefault();
            window.scrollTo({
                top: 0,
                behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'
            });
        });
    }

    // Remove loading class after initial load
    document.body.classList.remove('loading');
});

// Touch interaction handling
let touchStartY = 0;
let touchEndY = 0;
const minSwipeDistance = 50;

// Smooth scroll function
function smoothScroll(target, duration = 500) {
    const targetPosition = target.getBoundingClientRect().top + window.scrollY;
    const startPosition = window.scrollY;
    const distance = targetPosition - startPosition;
    let startTime = null;

    function animation(currentTime) {
        if (startTime === null) startTime = currentTime;
        const timeElapsed = currentTime - startTime;
        const progress = Math.min(timeElapsed / duration, 1);
        const ease = progress => (1 - Math.cos(progress * Math.PI)) / 2;
        
        window.scrollTo(0, startPosition + distance * ease(progress));
        
        if (timeElapsed < duration) {
            requestAnimationFrame(animation);
        }
    }

    requestAnimationFrame(animation);
}

// Service card touch feedback
document.querySelectorAll('.service-card, .testimonial-card').forEach(card => {
    card.addEventListener('touchstart', () => {
        card.style.transform = 'scale(0.98)';
        card.style.transition = 'transform 0.2s';
    });

    card.addEventListener('touchend', () => {
        card.style.transform = 'scale(1)';
    });

    card.addEventListener('touchcancel', () => {
        card.style.transform = 'scale(1)';
    });
});

// Form touch optimizations
document.querySelectorAll('.form-control').forEach(input => {
    // Add active state for touch
    input.addEventListener('touchstart', function(e) {
        this.classList.add('touch-active');
    });

    input.addEventListener('touchend', function(e) {
        this.classList.remove('touch-active');
    });

    // Prevent double-tap zoom on iOS
    input.addEventListener('touchend', function(e) {
        e.preventDefault();
        this.focus();
    });
});

// Button touch feedback
document.querySelectorAll('.btn').forEach(button => {
    button.addEventListener('touchstart', function(e) {
        this.style.transform = 'scale(0.98)';
    });

    button.addEventListener('touchend', function(e) {
        this.style.transform = 'scale(1)';
    });

    button.addEventListener('touchcancel', function(e) {
        this.style.transform = 'scale(1)';
    });
});

// Form submission with loading state
document.querySelector('form[name="offerte"]').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const submitButton = this.querySelector('button[type="submit"]');
    const buttonText = submitButton.querySelector('span');
    const loadingIndicator = submitButton.querySelector('.loading');
    
    // Disable form and show loading state
    submitButton.disabled = true;
    buttonText.style.opacity = '0.7';
    loadingIndicator.style.display = 'inline-block';
    
    try {
        const formData = new FormData(this);
        const response = await fetch(this.action, {
            method: 'POST',
            body: formData
        });

        if (response.ok) {
            // Show success message
            showMessage('Bedankt! We nemen zo spoedig mogelijk contact met u op.', 'success');
            this.reset();
        } else {
            throw new Error('Network response was not ok');
        }
    } catch (error) {
        showMessage('Er is iets misgegaan. Probeer het later opnieuw.', 'error');
    } finally {
        // Reset button state
        submitButton.disabled = false;
        buttonText.style.opacity = '1';
        loadingIndicator.style.display = 'none';
    }
});

document.addEventListener('DOMContentLoaded', function () {
    // Cache DOM elements
    const elements = {
        form: document.querySelector('form[name="offerte"]'),
        formGroups: document.querySelectorAll('.form-group'),
        submitButton: document.querySelector('button[type="submit"]'),
        description: document.getElementById('description'),
        charCount: document.querySelector('.char-count'),
        modal: document.getElementById('successModal'),
        backToTop: document.getElementById('backToTop'),
        faqItems: document.querySelectorAll('.faq-item h3')
    };

    // Intersection Observer for section animations
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };

    const sectionObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                // Only observe once
                sectionObserver.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Observe all sections
    document.querySelectorAll('.section').forEach(section => {
        sectionObserver.observe(section);
    });

    // Smooth scroll animation
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                smoothScroll(target);
            }
        });
    });

    // FAQ Animation
    document.querySelectorAll('.faq-item').forEach(item => {
        const question = item.querySelector('.faq-question');
        const answer = item.querySelector('.faq-answer');
        
        question.addEventListener('click', () => {
            const isOpen = item.classList.contains('active');
            
            // Close all other FAQs
            document.querySelectorAll('.faq-item.active').forEach(openItem => {
                if (openItem !== item) {
                    openItem.classList.remove('active');
                }
            });
            
            // Toggle current FAQ
            item.classList.toggle('active');
            
            // Set max-height for animation
            if (!isOpen) {
                answer.style.maxHeight = answer.scrollHeight + 'px';
            } else {
                answer.style.maxHeight = '0';
            }
        });
    });

    // Service card hover effect
    document.querySelectorAll('.service-card').forEach(card => {
        card.addEventListener('mouseenter', () => {
            if (window.matchMedia('(hover: hover)').matches) {
                card.style.transform = 'translateY(-5px)';
            }
        });
        
        card.addEventListener('mouseleave', () => {
            if (window.matchMedia('(hover: hover)').matches) {
                card.style.transform = 'translateY(0)';
            }
        });
    });

    // Form submission animation
    document.querySelectorAll('form').forEach(form => {
        const submitButton = form.querySelector('button[type="submit"]');
        if (!submitButton) return;
        
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            submitButton.disabled = true;
            submitButton.classList.add('loading');
            
            try {
                // Simulate form submission (replace with actual submission)
                await new Promise(resolve => setTimeout(resolve, 1000));
                
                // Show success message with animation
                showMessage('Formulier succesvol verzonden!', 'success');
                form.reset();
            } catch (error) {
                showMessage('Er is iets misgegaan. Probeer het later opnieuw.', 'error');
            } finally {
                submitButton.disabled = false;
                submitButton.classList.remove('loading');
            }
        });
    });

    // Testimonial card animation
    document.querySelectorAll('.testimonial-card').forEach((card, index) => {
        card.style.animationDelay = `${index * 0.2}s`;
    });

    // Navigation link hover effect
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('mouseenter', () => {
            if (window.matchMedia('(hover: hover)').matches) {
                link.style.color = 'var(--primary-color)';
            }
        });
        
        link.addEventListener('mouseleave', () => {
            if (window.matchMedia('(hover: hover)').matches) {
                link.style.color = '';
            }
        });
    });

    // Back to top button animation
    const backToTop = document.querySelector('.back-to-top');
    if (backToTop) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 500) {
                backToTop.classList.add('visible');
            } else {
                backToTop.classList.remove('visible');
            }
        });
        
        backToTop.addEventListener('click', (e) => {
            e.preventDefault();
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }

    // Initialize Intersection Observer for animations
    const fadeObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in');
                fadeObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    // Observe sections for fade-in animation
    document.querySelectorAll('.section').forEach(section => {
        fadeObserver.observe(section);
    });

    // Form validation and submission handling
    class FormHandler {
        constructor(elements) {
            this.elements = elements;
            this.loadingIndicator = elements.submitButton.querySelector('.loading-indicator');
            this.setupEventListeners();
        }

        setupEventListeners() {
            // Character count
            this.elements.description.addEventListener('input', 
                debounce(this.updateCharCount.bind(this), 100));

            // Real-time validation
            this.elements.formGroups.forEach(group => {
                const input = group.querySelector('input, select, textarea');
                const errorMessage = group.querySelector('.error-message');

                if (input) {
                    input.addEventListener('input', 
                        debounce(() => this.validateField(input, errorMessage), 300));
                    input.addEventListener('blur', 
                        () => this.validateField(input, errorMessage));
                }
            });

            // Form submission
            this.elements.form.addEventListener('submit', this.handleSubmit.bind(this));
        }

        updateCharCount(event) {
            const remaining = 140 - event.target.value.length;
            this.elements.charCount.textContent = `${remaining} tekens resterend`;
        }

        validateField(field, errorMessage) {
            if (field.required && !field.value.trim()) {
                this.showError(field, errorMessage, 'Dit veld is verplicht');
                return false;
            }

            if (field.type === 'email' && field.value) {
                const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailPattern.test(field.value)) {
                    this.showError(field, errorMessage, 'Voer een geldig e-mailadres in');
                    return false;
                }
            }

            if (field.type === 'tel' && field.value) {
                const phonePattern = /^[0-9\-\+\s()]*$/;
                if (!phonePattern.test(field.value)) {
                    this.showError(field, errorMessage, 'Voer een geldig telefoonnummer in');
                    return false;
                }
            }

            this.clearError(field, errorMessage);
            return true;
        }

        showError(field, errorMessage, text) {
            errorMessage.textContent = text;
            errorMessage.classList.add('visible');
            field.classList.add('invalid');
            field.setAttribute('aria-invalid', 'true');
        }

        clearError(field, errorMessage) {
            errorMessage.classList.remove('visible');
            field.classList.remove('invalid');
            field.setAttribute('aria-invalid', 'false');
        }

        async handleSubmit(event) {
            event.preventDefault();
            
            // Validate all fields
            let isValid = true;
            this.elements.formGroups.forEach(group => {
                const input = group.querySelector('input, select, textarea');
                const errorMessage = group.querySelector('.error-message');
                if (input && !this.validateField(input, errorMessage)) {
                    isValid = false;
                }
            });
            
            if (!isValid) return;

            // Show loading state
            this.elements.submitButton.disabled = true;
            this.loadingIndicator.style.display = 'block';

            try {
                // Get form data
                const form = this.elements.form;
                const formData = new FormData(form);

                // Submit to Netlify Forms
                fetch(form.action, {
                    method: 'POST',
                    body: formData
                }).then(() => {
                    // Show success modal with user's name
                    const userName = document.getElementById('name').value;
                    document.getElementById('userName').textContent = userName;
                    new ModalHandler(this.elements.modal).show();
                    
                    // Reset form
                    form.reset();
                    this.elements.charCount.textContent = '140 tekens resterend';
                    
                    // Clear all error states
                    this.elements.formGroups.forEach(group => {
                        const input = group.querySelector('input, select, textarea');
                        const errorMessage = group.querySelector('.error-message');
                        if (input) this.clearError(input, errorMessage);
                    });
                }).catch(error => {
                    console.error('Form submission error:', error);
                    alert('Er is een fout opgetreden. Probeer het later opnieuw.');
                }).finally(() => {
                    this.elements.submitButton.disabled = false;
                    this.loadingIndicator.style.display = 'none';
                });
            } catch (error) {
                console.error('Form submission error:', error);
                alert('Er is een fout opgetreden. Probeer het later opnieuw.');
                this.elements.submitButton.disabled = false;
                this.loadingIndicator.style.display = 'none';
            }
        }
    }

    // Modal handling
    class ModalHandler {
        constructor(modal) {
            this.modal = modal;
            this.closeBtn = modal.querySelector('.close');
            this.setupEventListeners();
        }

        setupEventListeners() {
            this.closeBtn.addEventListener('click', () => this.hide());
            window.addEventListener('click', (event) => {
                if (event.target === this.modal) this.hide();
            });
            window.addEventListener('keydown', (event) => {
                if (event.key === 'Escape' && this.isVisible()) {
                    this.hide();
                }
            });
        }

        show() {
            this.modal.style.display = 'block';
            this.closeBtn.focus();
        }

        hide() {
            this.modal.style.display = 'none';
        }

        isVisible() {
            return this.modal.style.display === 'block';
        }
    }

    // FAQ handling
    class FAQHandler {
        constructor(items) {
            this.items = items;
            this.setupFAQs();
        }

        setupFAQs() {
            this.items.forEach(item => {
                const content = item.nextElementSibling;
                content.style.maxHeight = '0';
                content.style.overflow = 'hidden';
                content.style.transition = 'max-height 0.3s ease-out';
                
                item.addEventListener('click', () => this.toggleFAQ(item));
                item.addEventListener('keypress', (event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault();
                        this.toggleFAQ(item);
                    }
                });
            });
        }

        toggleFAQ(element) {
            const content = element.nextElementSibling;
            const expanded = element.getAttribute('aria-expanded') === 'true';
            
            // Close other FAQs
            this.items.forEach(item => {
                if (item !== element && item.getAttribute('aria-expanded') === 'true') {
                    item.setAttribute('aria-expanded', 'false');
                    item.nextElementSibling.style.maxHeight = '0';
                }
            });
            
            element.setAttribute('aria-expanded', !expanded);
            content.style.maxHeight = !expanded ? `${content.scrollHeight}px` : '0';
        }
    }

    // Back to top handling
    class BackToTopHandler {
        constructor(button) {
            this.button = button;
            this.scrollThreshold = 300;
            this.setupEventListeners();
        }

        setupEventListeners() {
            window.addEventListener('scroll', 
                debounce(() => this.handleScroll(), 100));
            
            this.button.addEventListener('click', (e) => {
                e.preventDefault();
                window.scrollTo({
                    top: 0,
                    behavior: 'smooth'
                });
            });
        }

        handleScroll() {
            if (!this.button.style.display || this.button.style.display === 'none') {
                this.button.style.display = 'block';
                // Force a reflow
                this.button.offsetHeight;
            }
            
            if (window.scrollY > this.scrollThreshold) {
                this.button.classList.add('visible');
            } else {
                this.button.classList.remove('visible');
                setTimeout(() => {
                    if (window.scrollY <= this.scrollThreshold) {
                        this.button.style.display = 'none';
                    }
                }, 300);
            }
        }
    }

    // Initialize handlers
    new FormHandler(elements);
    new ModalHandler(elements.modal);
    new FAQHandler(elements.faqItems);
    new BackToTopHandler(elements.backToTop);

    // Add touch feedback to all interactive elements
    document.querySelectorAll('a, button, input, select, textarea').forEach(el => {
        el.addEventListener('touchstart', function() {
            this.style.transition = 'transform 0.2s';
        });
    });

    // Handle form validation feedback
    document.querySelectorAll('.form-control').forEach(input => {
        input.addEventListener('invalid', function(e) {
            e.preventDefault();
            this.classList.add('invalid');
            
            const errorMessage = this.parentElement.querySelector('.error-message') 
                || document.createElement('div');
            errorMessage.className = 'error-message';
            errorMessage.textContent = this.validationMessage;
            
            if (!this.parentElement.querySelector('.error-message')) {
                this.parentElement.appendChild(errorMessage);
            }
        });

        input.addEventListener('input', function() {
            this.classList.remove('invalid');
            const errorMessage = this.parentElement.querySelector('.error-message');
            if (errorMessage) {
                errorMessage.remove();
            }
        });
    });
});

// Form validation utilities
const validators = {
    required: (value) => value.trim() !== '',
    email: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
    phone: (value) => /^(?:\+31|0)\d{9}$/.test(value.replace(/[\s-]/g, '')),
    minLength: (value, length) => value.trim().length >= length,
    maxLength: (value, length) => value.trim().length <= length
};

// Form validation rules
const validationRules = {
    naam: {
        required: true,
        minLength: 2,
        maxLength: 50,
        message: {
            required: 'Vul uw naam in',
            minLength: 'Naam moet minimaal 2 karakters bevatten',
            maxLength: 'Naam mag maximaal 50 karakters bevatten'
        }
    },
    email: {
        required: true,
        email: true,
        message: {
            required: 'Vul uw e-mailadres in',
            email: 'Vul een geldig e-mailadres in'
        }
    },
    telefoon: {
        required: true,
        phone: true,
        message: {
            required: 'Vul uw telefoonnummer in',
            phone: 'Vul een geldig Nederlands telefoonnummer in'
        }
    },
    dienst: {
        required: true,
        message: {
            required: 'Selecteer een dienst'
        }
    },
    bericht: {
        required: true,
        minLength: 10,
        maxLength: 500,
        message: {
            required: 'Vul uw bericht in',
            minLength: 'Bericht moet minimaal 10 karakters bevatten',
            maxLength: 'Bericht mag maximaal 500 karakters bevatten'
        }
    }
};

// Form validation handler
class FormValidator {
    constructor(form) {
        this.form = form;
        this.errors = new Map();
        this.setupValidation();
    }

    setupValidation() {
        const fields = this.form.querySelectorAll('input, textarea, select');
        
        fields.forEach(field => {
            // Real-time validation
            field.addEventListener('input', () => {
                this.validateField(field);
                this.updateFieldUI(field);
            });

            // Blur validation
            field.addEventListener('blur', () => {
                this.validateField(field);
                this.updateFieldUI(field);
            });
        });

        // Form submission validation
        this.form.addEventListener('submit', (e) => {
            if (!this.validateForm()) {
                e.preventDefault();
                this.showFormErrors();
            }
        });
    }

    validateField(field) {
        const name = field.name;
        const value = field.value;
        const rules = validationRules[name];

        if (!rules) return true;

        let isValid = true;
        let errorMessage = '';

        // Check each validation rule
        for (const [rule, enabled] of Object.entries(rules)) {
            if (rule === 'message') continue;
            
            if (enabled && validators[rule]) {
                const validatorFn = validators[rule];
                const isRuleValid = typeof enabled === 'boolean' 
                    ? validatorFn(value)
                    : validatorFn(value, enabled);

                if (!isRuleValid) {
                    isValid = false;
                    errorMessage = rules.message[rule];
                    break;
                }
            }
        }

        if (!isValid) {
            this.errors.set(name, errorMessage);
        } else {
            this.errors.delete(name);
        }

        return isValid;
    }

    updateFieldUI(field) {
        const formGroup = field.closest('.form-group');
        const errorElement = formGroup.querySelector('.error-message') || document.createElement('div');
        const errorMessage = this.errors.get(field.name);

        errorElement.className = 'error-message';
        
        if (errorMessage) {
            field.setAttribute('aria-invalid', 'true');
            field.classList.add('invalid');
            errorElement.textContent = errorMessage;
            if (!formGroup.contains(errorElement)) {
                formGroup.appendChild(errorElement);
            }
            errorElement.style.display = 'block';
        } else {
            field.removeAttribute('aria-invalid');
            field.classList.remove('invalid');
            errorElement.style.display = 'none';
        }
    }

    validateForm() {
        const fields = this.form.querySelectorAll('input, textarea, select');
        let isValid = true;

        fields.forEach(field => {
            if (!this.validateField(field)) {
                isValid = false;
            }
        });

        return isValid;
    }

    showFormErrors() {
        const fields = this.form.querySelectorAll('input, textarea, select');
        fields.forEach(field => this.updateFieldUI(field));

        // Focus first invalid field
        const firstInvalidField = this.form.querySelector('[aria-invalid="true"]');
        if (firstInvalidField) {
            firstInvalidField.focus();
        }
    }
}

// Initialize form validation on DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
    const forms = document.querySelectorAll('form[data-netlify="true"]');
    forms.forEach(form => new FormValidator(form));
});
