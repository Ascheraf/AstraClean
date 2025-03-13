document.addEventListener('DOMContentLoaded', function () {
    const form = document.querySelector('form[name="offerte"]');
    
    function validateForm() {
        const name = document.getElementById("name").value.trim();
        const phone = document.getElementById("phone").value.trim();
        const email = document.getElementById("email").value.trim();
        const description = document.getElementById("description").value.trim();
        const service = document.getElementById("service").value;
        
        let isValid = true;
        const errors = new Map();

        // Name validation
        if (name.length < 2) {
            errors.set('name', 'Hallo! We hebben uw naam nodig om u beter van dienst te kunnen zijn.');
            isValid = false;
        }

        // Phone validation (Dutch format)
        const phoneRegex = /^(?:(?:\+|00)31|0)(?:[1-9][0-9]?|6[1-9])[0-9]{7}$/;
        if (!phoneRegex.test(phone.replace(/[\s-]/g, ''))) {
            errors.set('phone', 'Tip: Een Nederlands telefoonnummer begint met 06, +31 of 0. Bijvoorbeeld: 0612345678');
            isValid = false;
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            errors.set('email', 'Oeps! Dit e-mailadres lijkt niet te kloppen. Controleer of u het juist heeft ingevuld.');
            isValid = false;
        }

        // Service validation
        if (!service) {
            errors.set('service', 'Selecteer alstublieft welke dienst u nodig heeft, zodat we u het beste kunnen helpen.');
            isValid = false;
        }

        // Description validation
        if (description.length === 0) {
            errors.set('description', 'Vertel ons kort wat we voor u kunnen betekenen.');
            isValid = false;
        } else if (description.length < 10) {
            errors.set('description', 'Iets meer detail helpt ons u beter te begrijpen. Minimaal 10 tekens nodig.');
            isValid = false;
        } else if (description.length > 140) {
            errors.set('description', 'Kort maar krachtig! Maximaal 140 tekens om het overzichtelijk te houden.');
            isValid = false;
        }

        // Display errors if any
        document.querySelectorAll('.error-message').forEach(el => el.remove());
        if (!isValid) {
            errors.forEach((message, field) => {
                const input = document.getElementById(field);
                const errorDiv = document.createElement('div');
                errorDiv.className = 'error-message';
                errorDiv.textContent = message;
                errorDiv.style.color = '#dc3545';
                errorDiv.style.fontSize = '0.8em';
                errorDiv.style.marginTop = '4px';
                input.parentNode.appendChild(errorDiv);
                input.style.borderColor = '#dc3545';
            });
        }

        return isValid;
    }

    // Reset form errors
    function resetFormErrors() {
        document.querySelectorAll('.error-message').forEach(el => el.remove());
        form.querySelectorAll('input, select, textarea').forEach(input => {
            input.style.borderColor = '';
        });
    }

    form.addEventListener("submit", function(event) {
        event.preventDefault();
        resetFormErrors();

        if (!validateForm()) {
            return;
        }

        const formData = new FormData(form);
        const submitButton = form.querySelector('button[type="submit"]');
        const originalText = submitButton.textContent;
        submitButton.textContent = 'Verzenden...';
        submitButton.disabled = true;

        fetch("/", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: new URLSearchParams(formData).toString()
        })
        .then(response => {
            if (response.ok) {
                // Show success modal
                const userName = document.getElementById("name").value;
                document.getElementById("userName").innerText = userName;
                document.getElementById("successModal").style.display = "block";
                
                // Reset form
                form.reset();
            } else {
                throw new Error('Network response was not ok');
            }
        })
        .catch(error => {
            const errorDiv = document.createElement('div');
            errorDiv.className = 'error-message';
            errorDiv.textContent = 'Er ging iets mis bij het verzenden. Probeer het opnieuw of neem telefonisch contact met ons op.';
            errorDiv.style.color = '#dc3545';
            errorDiv.style.fontSize = '0.8em';
            errorDiv.style.marginTop = '4px';
            form.insertBefore(errorDiv, form.firstChild);
        })
        .finally(() => {
            submitButton.textContent = originalText;
            submitButton.disabled = false;
        });
    });

    // Input validation on blur
    form.querySelectorAll('input, select, textarea').forEach(input => {
        input.addEventListener('blur', function() {
            resetFormErrors();
            validateForm();
        });
    });

    // Modal handling
    document.querySelector(".close").addEventListener("click", function() {
        document.getElementById("successModal").style.display = "none";
    });

    window.addEventListener("click", function(event) {
        let modal = document.getElementById("successModal");
        if (event.target === modal) {
            modal.style.display = "none";
        }
    });

    // FAQ Toggle script
    document.querySelectorAll(".faq-item h3").forEach(item => {
        item.addEventListener("click", function() {
            toggleFAQ(this);
        });

        item.addEventListener("keypress", function(event) {
            if (event.key === "Enter" || event.key === " ") {
                toggleFAQ(this);
            }
        });
    });

    function toggleFAQ(element) {
        let expanded = element.getAttribute("aria-expanded") === "true";
        element.setAttribute("aria-expanded", !expanded);
        let content = element.nextElementSibling;

        if (expanded) {
            content.style.display = "none";
        } else {
            content.style.display = "block";
        }
    }
});
