<?php
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $secretKey = "6LfxtuUqAAAAAG7qQTQzG7GooWO2DI_3Cv536b4q"; // 🔴 Vervang dit met jouw geheime sleutel van Google
    $captchaResponse = $_POST["g-recaptcha-response"];

    // ✅ Controleer of de reCAPTCHA is ingevuld
    if (!$captchaResponse) {
        die("❌ Verificatie mislukt. Vul de reCAPTCHA in.");
    }

    // ✅ Stuur een verzoek naar Google om de reCAPTCHA te controleren
    $verifyResponse = file_get_contents("https://www.google.com/recaptcha/api/siteverify?secret=$secretKey&response=$captchaResponse");
    $responseData = json_decode($verifyResponse);

    // ✅ Controleer of de reCAPTCHA succesvol was
    if (!$responseData->success) {
        die("❌ reCAPTCHA-validatie mislukt. Probeer opnieuw.");
    }
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
