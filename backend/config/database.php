<?php
/**
 * Project Name: MedAlert AI - AI Powered Centralized Medical Emergency Response Alert System
 * File: database.php
 * Description: Secure and reusable database connection file for backend modules.
 */

// ---------------------------------
// Configuration
// ---------------------------------
// Define application environment mode (development or production)
define('APP_ENV', 'development');

// ---------------------------------
// PHP Settings
// ---------------------------------
// Set the default timezone for accurate timestamping
date_default_timezone_set('Asia/Kolkata');

// Enable error reporting for development to catch bugs and issues
if (APP_ENV === 'development') {
    error_reporting(E_ALL);
    ini_set('display_errors', 1);
} else {
    // Disable error display in production for security
    error_reporting(0);
    ini_set('display_errors', 0);
}

// ---------------------------------
// Database Credentials
// ---------------------------------
// Store database connection details securely as PHP variables
$db_host = "localhost";
$db_user = "root";
$db_pass = "";
$db_name = "medalert";

// ---------------------------------
// Database Connection
// ---------------------------------
// Create a new MySQL connection instance using MySQLi
// The error control operator (@) prevents credential leakage in default warnings
$conn = @new mysqli($db_host, $db_user, $db_pass, $db_name);

// ---------------------------------
// Character Encoding
// ---------------------------------
// Use UTF-8 encoding (utf8mb4) for full Unicode support, including emojis/special characters
if ($conn && !$conn->connect_error) {
    if (!$conn->set_charset("utf8mb4")) {
        die("Error loading character set utf8mb4: " . $conn->error);
    }
}

// ---------------------------------
// Connection Validation
// ---------------------------------
// If the connection fails: Stop execution and display a clear error message
if ($conn->connect_error) {
    die("Database Connection Failed! Error: " . $conn->connect_error);
}

// If the connection succeeds, script execution continues.
// The $conn object is now available to be used in other files such as:
// auth/login.php, auth/register.php, emergency/create.php, etc.
?>