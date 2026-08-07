<?php

/**
 * MedAlert AI - SMS Notification Module
 * 
 * Purpose: Send SMS notifications to emergency contacts and ambulance drivers.
 * Uses: Twilio PHP SDK
 */

// Require Composer's autoloader for Twilio SDK
// Ensure you have run: composer require twilio/sdk
require_once __DIR__ . '/vendor/autoload.php';

use Twilio\Rest\Client;
use Twilio\Exceptions\RestException;

class MedAlertSMS
{
    private $client;
    private $twilioNumber;

    /**
     * Initialize the Twilio Client using Environment Variables
     */
    public function __construct()
    {
        // Load configuration from environment variables
        // In a production environment, ensure these are securely set
        $accountSid = getenv('TWILIO_ACCOUNT_SID');
        $authToken  = getenv('TWILIO_AUTH_TOKEN');
        $this->twilioNumber = getenv('TWILIO_PHONE_NUMBER');

        if (!$accountSid || !$authToken || !$this->twilioNumber) {
            error_log("MedAlert AI Error: Twilio credentials are not set in the environment.");
        }

        try {
            $this->client = new Client($accountSid, $authToken);
        } catch (Exception $e) {
            error_log("MedAlert AI Error: Failed to initialize Twilio client. " . $e->getMessage());
        }
    }

    /**
     * Core function to send an SMS via Twilio
     *
     * @param string $to Phone number to send the SMS to (E.164 format: +1234567890)
     * @param string $message The text content of the SMS
     * @return string JSON response indicating success or failure
     */
    private function sendSMS(string $to, string $message): string
    {
        try {
            if (!$this->client) {
                throw new Exception("Twilio client is not initialized.");
            }

            $this->client->messages->create(
                $to,
                [
                    'from' => $this->twilioNumber,
                    'body' => $message
                ]
            );

            return json_encode([
                "status" => "success",
                "message" => "SMS sent successfully"
            ]);

        } catch (RestException $e) {
            // Log the exact Twilio API error for backend debugging
            error_log("Twilio API Exception: " . $e->getMessage());
            
            return json_encode([
                "status" => "error",
                "message" => "Failed to send SMS"
            ]);
        } catch (Exception $e) {
            // Log general exceptions
            error_log("General SMS Exception: " . $e->getMessage());
            
            return json_encode([
                "status" => "error",
                "message" => "Failed to send SMS"
            ]);
        }
    }

    /**
     * Send an Emergency Alert SMS to contacts
     *
     * @param string $to Contact's phone number
     * @param string $patientName Name of the patient
     * @param string $emergencyType Type of emergency (e.g., Cardiac Arrest)
     * @param string $severity Severity level (e.g., Critical, High)
     * @param string $hospital Assigned hospital name
     * @param string $eta Estimated time of arrival
     * @param string $latitude Emergency location latitude
     * @param string $longitude Emergency location longitude
     * @return string JSON response
     */
    public function sendEmergencySMS(
        string $to, 
        string $patientName, 
        string $emergencyType, 
        string $severity, 
        string $hospital, 
        string $eta, 
        string $latitude, 
        string $longitude
    ): string {
        
        $mapsLink = "https://maps.google.com/?q={$latitude},{$longitude}";
        
        // Construct the message matching the exact required format
        $message = "🚨 MedAlert AI\n\n"
                 . "Emergency Alert!\n\n"
                 . "Patient: {$patientName}\n"
                 . "Emergency: {$emergencyType}\n"
                 . "Severity: {$severity}\n"
                 . "Hospital: {$hospital}\n"
                 . "ETA: {$eta}\n\n"
                 . "Location:\n"
                 . "{$mapsLink}";

        return $this->sendSMS($to, $message);
    }

    /**
     * Send a Dispatch Alert SMS to an ambulance driver
     *
     * @param string $to Driver's phone number
     * @param string $driverName Name of the ambulance driver
     * @param string $patientName Name of the patient
     * @param string $emergencyType Type of medical emergency
     * @param string $latitude Pickup location latitude
     * @param string $longitude Pickup location longitude
     * @return string JSON response
     */
    public function sendAmbulanceSMS(
        string $to, 
        string $driverName, 
        string $patientName, 
        string $emergencyType, 
        string $latitude, 
        string $longitude
    ): string {
        
        $mapsLink = "https://maps.google.com/?q={$latitude},{$longitude}";
        
        // Construct the dispatch message
        $message = "🚑 MedAlert AI Dispatch\n\n"
                 . "Driver: {$driverName}\n"
                 . "New Dispatch Assignment!\n\n"
                 . "Patient: {$patientName}\n"
                 . "Emergency: {$emergencyType}\n\n"
                 . "Pickup Location:\n"
                 . "{$mapsLink}";

        return $this->sendSMS($to, $message);
    }
}
?>