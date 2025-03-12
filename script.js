document.addEventListener('DOMContentLoaded', function () {
    // Formulier bevestiging
    document.querySelector('form[name="offerte"]').addEventListener("submit", function(event) {
        event.preventDefault();
        let userName = document.getElementById("name").value;
        document.getElementById("userName").innerText = userName;
        document.getElementById("successModal").style.display = "block";
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

    // FAQ Toggle script met toegankelijkheid
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
            content.style.maxHeight = "0px";
            content.style.overflow = "hidden";
        } else {
            content.style.maxHeight = content.scrollHeight + "px";
            content.style.overflow = "visible";
        }
    }
});
