<?php
/**
 * Project Name: MedAlert AI - AI Powered Centralized Medical Emergency Response Alert System
 * File: update.php
 * Description: API endpoint to update the status of an emergency request.
 */

// Include the secure database connection
require_once 'database.php';

// Set headers for standard API JSON response and CORS
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

// 1. Verify Request Method
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(["status" => "error", "message" => "Method not allowed. Please use POST."]);
    exit;
}

// 2. Receive POST Data (Handles raw JSON and form-data)
$data = json_decode(file_get_contents("php://input"));

$emergency_id = $data->emergency_id ?? $_POST['emergency_id'] ?? null;
$status       = trim($data->status ?? $_POST['status'] ?? '');

// 3. Validate Inputs
if (!$emergency_id || empty($status)) {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "emergency_id and status are required."]);
    exit;
}

// Ensure the emergency_id is an integer
$emergency_id = (int) $emergency_id;

// Define allowed statuses based on the project's new tracking flow
// Note: Ensure your `emergency_requests` table's `status` ENUM is updated to support these exact values.
$allowed_statuses = [
    'Pending', 
    'Matched', 
    'Ambulance Assigned', 
    'Driver Accepted', 
    'Patient Picked', 
    'Hospital Reached', 
    'Completed'
];

// Case-insensitive check for valid status
$isValidStatus = false;
$finalStatus = '';
foreach ($allowed_statuses as $allowed) {
    if (strcasecmp($status, $allowed) === 0) {
        $isValidStatus = true;
        $finalStatus = $allowed; // Normalize to expected casing
        break;
    }
}

if (!$isValidStatus) {
    http_response_code(400);
    echo json_encode([
        "status" => "error", 
        "message" => "Invalid status provided. Allowed values are: " . implode(", ", $allowed_statuses)
    ]);
    exit;
}

// 4. Update the Database using Prepared Statements
$update_query = "UPDATE emergency_requests SET status = ? WHERE id = ?";
$stmt = $conn->prepare($update_query);

if (!$stmt) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => "Database preparation error: " . $conn->error]);
    exit;
}

// Bind parameters: s = string (status), i = integer (emergency_id)
$stmt->bind_param("si", $finalStatus, $emergency_id);

if ($stmt->execute()) {
    // Check if the record actually existed and was updated
    if ($stmt->affected_rows > 0) {
        http_response_code(200);
        echo json_encode([
            "status" => "success",
            "message" => "Emergency status updated successfully.",
            "data" => [
                "emergency_id" => $emergency_id,
                "new_status"   => $finalStatus
            ]
        ]);
    } else {
        // ID not found or status was already the same
        http_response_code(404);
        echo json_encode([
            "status" => "warning", 
            "message" => "No changes made. Emergency ID not found or status is already set to '$finalStatus'."
        ]);
    }
} else {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => "Failed to update status: " . $stmt->error]);
}

// Close statement and connection
$stmt->close();
$conn->close();
?>