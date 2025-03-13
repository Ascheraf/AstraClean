document.addEventListener('DOMContentLoaded', function () {
    // Formulier bevestiging
    const form = document.querySelector('form[name="offerte"]');
    
    form.addEventListener("submit", async function(event) {
        event.preventDefault();
        
        // Toon loading state
        const submitButton = form.querySelector('button[type="submit"]');
        const originalText = submitButton.textContent;
        submitButton.textContent = 'Verzenden...';
        submitButton.disabled = true;

        try {
            // Verzamel form data
            const formData = new FormData(form);
            
            // Verstuur formulier
            const response = await fetch('/', {
                method: 'POST',
                body: formData
            });

            if (response.ok) {
                // Toon success modal
                const userName = document.getElementById("name").value;
                document.getElementById("userName").innerText = userName;
                document.getElementById("successModal").style.display = "block";
                
                // Reset formulier
                form.reset();
                if (typeof grecaptcha !== 'undefined') {
                    grecaptcha.reset();
                }
            } else {
                throw new Error('Er is iets misgegaan bij het verzenden van het formulier.');
            }
        } catch (error) {
            alert('Er is een fout opgetreden bij het verzenden van het formulier. Probeer het later opnieuw.');
            console.error('Form submission error:', error);
        } finally {
            // Reset button state
            submitButton.textContent = originalText;
            submitButton.disabled = false;
        }
    });

    // Sluit de pop-up bij klikken op "X"
    document.querySelector(".close").addEventListener("click", function() {
        document.getElementById("successModal").style.display = "none";
    });

    // Sluit de pop-up als je buiten het pop-up venster klikt
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
