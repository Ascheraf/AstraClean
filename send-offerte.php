<?php
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $name = htmlspecialchars($_POST["name"]);
    $phone = htmlspecialchars($_POST["phone"]);
    $email = filter_var($_POST["email"], FILTER_SANITIZE_EMAIL);
    $service = htmlspecialchars($_POST["service"]);
    $description = htmlspecialchars($_POST["description"]);

    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        die("Ongeldig e-mailadres.");
    }

    $to = "info@AstraClean.nl";  // Jouw e-mailadres
    $subject = "Nieuwe offerte aanvraag";
    $message = "Naam: $name\nTelefoon: $phone\nE-mail: $email\nDienst: $service\nOmschrijving: $description";
    $headers = "From: $email";

    if (mail($to, $subject, $message, $headers)) {
        echo "Bedankt! Jouw offerteaanvraag is verzonden.";
    } else {
        echo "Er ging iets mis. Probeer het opnieuw.";
    }
} else {
    echo "Ongeldige aanvraag.";
}
?>
