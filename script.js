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
                const formData = new FormData(this.elements.form);

                // Submit to Netlify Forms
                const response = await fetch('/', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                    body: new URLSearchParams(formData).toString()
                });

                if (response.ok) {
                    // Show success modal with user's name
                    const userName = document.getElementById('name').value;
                    document.getElementById('userName').textContent = userName;
                    new ModalHandler(this.elements.modal).show();
                    
                    // Reset form
                    this.elements.form.reset();
                    this.elements.charCount.textContent = '140 tekens resterend';
                    
                    // Clear all error states
                    this.elements.formGroups.forEach(group => {
                        const input = group.querySelector('input, select, textarea');
                        const errorMessage = group.querySelector('.error-message');
                        if (input) this.clearError(input, errorMessage);
                    });
                } else {
                    throw new Error('Er is een fout opgetreden bij het verzenden van het formulier');
                }
            } catch (error) {
                console.error('Form submission error:', error);
                alert(error.message || 'Er is een fout opgetreden. Probeer het later opnieuw.');
            } finally {
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
});
