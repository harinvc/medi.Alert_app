<?php

/**
 * MedAlert AI - Email Notification Module
 * 
 * Purpose: Send emergency email notifications to hospitals and emergency contacts.
 * Uses: PHPMailer
 */

// Require Composer's autoloader for PHPMailer
// Ensure you have run: composer require phpmailer/phpmailer
require_once __DIR__ . '/vendor/autoload.php';

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

class MedAlertEmail
{
    // SMTP Configuration variables
    private $smtpHost;
    private $smtpPort;
    private $smtpUsername;
    private $smtpPassword;
    private $senderEmail;

    /**
     * Initialize the Email module with SMTP configuration from environment variables.
     * Secure coding practice: Never hardcode credentials in source files.
     */
    public function __construct()
    {
        // Load configuration from environment variables
        $this->smtpHost     = getenv('SMTP_HOST');
        $this->smtpPort     = getenv('SMTP_PORT');
        $this->smtpUsername = getenv('SMTP_USERNAME');
        $this->smtpPassword = getenv('SMTP_PASSWORD');
        $this->senderEmail  = getenv('SMTP_SENDER_EMAIL');

        if (!$this->smtpHost || !$this->smtpUsername || !$this->smtpPassword || !$this->senderEmail) {
            error_log("MedAlert AI Error: SMTP configuration variables are missing.");
        }
    }

    /**
     * Core reusable function to send an email using PHPMailer
     *
     * @param string $to Recipient email address
     * @param string $subject Email subject
     * @param string $htmlBody HTML content of the email
     * @return string JSON response indicating success or failure
     */
    private function sendEmail(string $to, string $subject, string $htmlBody): string
    {
        $mail = new PHPMailer(true);

        try {
            // Server settings
            $mail->isSMTP();                                            // Send using SMTP
            $mail->Host       = $this->smtpHost;                        // Set the SMTP server to send through
            $mail->SMTPAuth   = true;                                   // Enable SMTP authentication
            $mail->Username   = $this->smtpUsername;                    // SMTP username
            $mail->Password   = $this->smtpPassword;                    // SMTP password
            $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;         // Enable TLS encryption
            $mail->Port       = (int)$this->smtpPort;                   // TCP port to connect to

            // Recipients
            $mail->setFrom($this->senderEmail, 'MedAlert AI');
            $mail->addAddress($to);                                     // Add a recipient

            // Content
            $mail->isHTML(true);                                        // Set email format to HTML
            $mail->Subject = $subject;
            $mail->Body    = $htmlBody;
            
            // Plain text fallback
            $mail->AltBody = strip_tags(str_replace('<br>', "\n", $htmlBody));

            $mail->send();

            return json_encode([
                "status" => "success",
                "message" => "Email sent successfully"
            ]);
            
        } catch (Exception $e) {
            // Log the exact PHPMailer error for backend debugging
            error_log("MedAlert AI Mailer Error: {$mail->ErrorInfo}");
            
            return json_encode([
                "status" => "error",
                "message" => "Email sending failed"
            ]);
        }
    }

    /**
     * Generates the standard HTML body for emergency alerts
     */
    private function buildEmailBody(
        string $patientName,
        string $emergencyType,
        string $severity,
        string $priority,
        string $department,
        string $aiSummary,
        string $hospitalName,
        string $eta,
        string $latitude,
        string $longitude
    ): string {
        // Prevent XSS in email clients by escaping variables
        $patientName   = htmlspecialchars($patientName);
        $emergencyType = htmlspecialchars($emergencyType);
        $severity      = htmlspecialchars($severity);
        $priority      = htmlspecialchars($priority);
        $department    = htmlspecialchars($department);
        $aiSummary     = htmlspecialchars($aiSummary);
        $hospitalName  = htmlspecialchars($hospitalName);
        $eta           = htmlspecialchars($eta);
        $latitude      = htmlspecialchars($latitude);
        $longitude     = htmlspecialchars($longitude);

        $mapsLink = "https://maps.google.com/?q={$latitude},{$longitude}";
        $dateTime = date("Y-m-d H:i:s T");

        $html = "
            <h2>🚨 MedAlert AI - Emergency Alert</h2>
            <p>Immediate attention is required for an incoming patient.</p>
            <table border='1' cellpadding='10' cellspacing='0' style='border-collapse: collapse; width: 100%; max-width: 600px;'>
                <tr><td><strong>Date & Time</strong></td><td>{$dateTime}</td></tr>
                <tr><td><strong>Patient Name</strong></td><td>{$patientName}</td></tr>
                <tr><td><strong>Emergency Type</strong></td><td>{$emergencyType}</td></tr>
                <tr><td><strong>Severity</strong></td><td><strong style='color: red;'>{$severity}</strong></td></tr>
                <tr><td><strong>Priority</strong></td><td>{$priority}</td></tr>
                <tr><td><strong>Department</strong></td><td>{$department}</td></tr>
                <tr><td><strong>AI Summary</strong></td><td>{$aiSummary}</td></tr>
                <tr><td><strong>Assigned Hospital</strong></td><td>{$hospitalName}</td></tr>
                <tr><td><strong>ETA</strong></td><td>{$eta}</td></tr>
                <tr><td><strong>Location</strong></td><td><a href='{$mapsLink}'>View on Google Maps</a></td></tr>
            </table>
            <br>
            <p><em>This is an automated message generated by MedAlert AI.</em></p>
        ";

        return $html;
    }

    /**
     * Send an Emergency Alert Email to a Hospital
     */
    public function sendHospitalEmail(
        string $toEmail,
        string $patientName,
        string $emergencyType,
        string $severity,
        string $priority,
        string $department,
        string $aiSummary,
        string $hospitalName,
        string $eta,
        string $latitude,
        string $longitude
    ): string {
        $subject = "🚨 Emergency Alert - MedAlert AI [Hospital Notice]";
        $htmlBody = $this->buildEmailBody(
            $patientName, $emergencyType, $severity, $priority, 
            $department, $aiSummary, $hospitalName, $eta, $latitude, $longitude
        );

        return $this->sendEmail($toEmail, $subject, $htmlBody);
    }

    /**
     * Send an Emergency Alert Email to an Emergency Contact
     */
    public function sendEmergencyContactEmail(
        string $toEmail,
        string $patientName,
        string $emergencyType,
        string $severity,
        string $priority,
        string $department,
        string $aiSummary,
        string $hospitalName,
        string $eta,
        string $latitude,
        string $longitude
    ): string {
        $subject = "🚨 Emergency Alert - MedAlert AI [Contact Notice]";
        $htmlBody = $this->buildEmailBody(
            $patientName, $emergencyType, $severity, $priority, 
            $department, $aiSummary, $hospitalName, $eta, $latitude, $longitude
        );

        // Can append additional contact-specific messaging here if necessary
        $htmlBody .= "<p><strong>Note to Contact:</strong> An ambulance has been dispatched to the location provided.</p>";

        return $this->sendEmail($toEmail, $subject, $htmlBody);
    }
}
?>