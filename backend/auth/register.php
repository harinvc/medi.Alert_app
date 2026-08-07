<?php
/**
 * Project Name: MedAlert AI - AI Powered Centralized Medical Emergency Response Alert System
 * File: register.php
 * Description: API endpoint to register a new user. 
 * Expected Input: POST request with full_name, email, phone, password, role.
 */

// Include the secure database connection
require_once 'database.php';

// Set headers to configure standard API JSON responses and CORS policy
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

// 2. Receive POST Data
// Supports both raw JSON payloads (from modern frontends/mobile apps) and standard form-data
$data = json_decode(file_get_contents("php://input"));

$full_name = trim($data->full_name ?? $_POST['full_name'] ?? '');
$email     = trim($data->email ?? $_POST['email'] ?? '');
$phone     = trim($data->phone ?? $_POST['phone'] ?? '');
$password  = trim($data->password ?? $_POST['password'] ?? '');
$role      = trim($data->role ?? $_POST['role'] ?? '');

// 3. Validate Inputs
if (empty($full_name) || empty($email) || empty($phone) || empty($password) || empty($role)) {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "All fields (full_name, email, phone, password, role) are required."]);
    exit;
}

// Validate email format
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "Invalid email format."]);
    exit;
}

// Validate role against the ENUM defined in the database
$allowed_roles = ['patient', 'hospital', 'ambulance', 'admin'];
if (!in_array($role, $allowed_roles)) {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "Invalid role. Allowed roles are: " . implode(", ", $allowed_roles) . "."]);
    exit;
}

// 4. Prevent Duplicates (Check Email and Phone)
$check_query = "SELECT id FROM users WHERE email = ? OR phone = ?";
$check_stmt = $conn->prepare($check_query);

if (!$check_stmt) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => "Database preparation error: " . $conn->error]);
    exit;
}

// Bind parameters and execute check
$check_stmt->bind_param("ss", $email, $phone);
$check_stmt->execute();
$check_stmt->store_result();

if ($check_stmt->num_rows > 0) {
    // Conflict - user already exists
    http_response_code(409); 
    echo json_encode(["status" => "error", "message" => "A user with this email or phone number already exists."]);
    $check_stmt->close();
    exit;
}
$check_stmt->close();

// 5. Hash the Password securely using bcrypt
$hashed_password = password_hash($password, PASSWORD_DEFAULT);

// 6. Store User in MySQL Using Prepared Statements
$insert_query = "INSERT INTO users (full_name, email, phone, password, role) VALUES (?, ?, ?, ?, ?)";
$insert_stmt = $conn->prepare($insert_query);

if (!$insert_stmt) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => "Database preparation error: " . $conn->error]);
    exit;
}

// Bind user inputs securely to prevent SQL injection
$insert_stmt->bind_param("sssss", $full_name, $email, $phone, $hashed_password, $role);

// 7. Execute and Return JSON Response
if ($insert_stmt->execute()) {
    http_response_code(201); // 201 Created
    echo json_encode([
        "status" => "success", 
        "message" => "User registered successfully.",
        "data" => [
            "user_id" => $insert_stmt->insert_id,
            "role" => $role
        ]
    ]);
} else {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => "Failed to register user. " . $insert_stmt->error]);
}

// Close statement and connection
$insert_stmt->close();
$conn->close();
?>