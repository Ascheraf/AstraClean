document.addEventListener('DOMContentLoaded', function () {
    // Formulier bevestiging
    const form = document.querySelector('form[name="offerte"]');
    
    form.addEventListener("submit", function(event) {
        // Don't prevent default - let Netlify handle the submission
        const submitButton = form.querySelector('button[type="submit"]');
        const originalText = submitButton.textContent;
        submitButton.textContent = 'Verzenden...';
        submitButton.disabled = true;

        // Show success modal after a short delay to allow form submission
        setTimeout(() => {
            const userName = document.getElementById("name").value;
            document.getElementById("userName").innerText = userName;
            document.getElementById("successModal").style.display = "block";
            
            // Reset button state
            submitButton.textContent = originalText;
            submitButton.disabled = false;
            
            // Reset form and reCAPTCHA
            setTimeout(() => {
                form.reset();
                if (typeof grecaptcha !== 'undefined') {
                    grecaptcha.reset();
                }
            }, 1000);
        }, 1000);
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
