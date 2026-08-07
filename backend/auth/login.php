<?php
/**
 * Project Name: MedAlert AI - AI Powered Centralized Medical Emergency Response Alert System
 * File: login.php
 * Description: API endpoint for user authentication.
 * Expected Input: POST request with email and password.
 */

// 1. Start PHP Session
session_start();

// Include the secure database connection
require_once 'database.php';

// Set headers for standard API JSON response and CORS
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

// 2. Verify Request Method
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(["status" => "error", "message" => "Method not allowed. Please use POST."]);
    exit;
}

// 3. Receive POST Data (Handles both JSON payloads and form-data)
$data = json_decode(file_get_contents("php://input"));

$email    = trim($data->email ?? $_POST['email'] ?? '');
$password = trim($data->password ?? $_POST['password'] ?? '');

// 4. Validate Inputs
if (empty($email) || empty($password)) {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "Email and password are required."]);
    exit;
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "Invalid email format."]);
    exit;
}

// 5. Check if user exists using Prepared Statements
$query = "SELECT id, full_name, password, role FROM users WHERE email = ? LIMIT 1";
$stmt = $conn->prepare($query);

if (!$stmt) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => "Database error: " . $conn->error]);
    exit;
}

// Bind email parameter and execute
$stmt->bind_param("s", $email);
$stmt->execute();
$result = $stmt->get_result();

// 6. Verify User Exists
if ($result->num_rows === 0) {
    http_response_code(401); // 401 Unauthorized
    echo json_encode(["status" => "error", "message" => "Invalid email or password."]);
    $stmt->close();
    exit;
}

$user = $result->fetch_assoc();

// 7. Verify Password
if (!password_verify($password, $user['password'])) {
    http_response_code(401);
    echo json_encode(["status" => "error", "message" => "Invalid email or password."]);
    $stmt->close();
    exit;
}

// 8. Establish Session Data
$_SESSION['user_id']   = $user['id'];
$_SESSION['full_name'] = $user['full_name'];
$_SESSION['role']      = $user['role'];
$_SESSION['logged_in'] = true;

// 9. Determine Redirect Path based on Role
// Note: Since this is a JSON API, we return the path so the frontend (JS) can redirect appropriately.
$redirect_url = "";
switch ($user['role']) {
    case 'patient':
        $redirect_url = "/dashboard/patient.php";
        break;
    case 'hospital':
        $redirect_url = "/dashboard/hospital.php";
        break;
    case 'ambulance':
        $redirect_url = "/dashboard/ambulance.php";
        break;
    case 'admin':
        $redirect_url = "/dashboard/admin.php";
        break;
    default:
        $redirect_url = "/index.php";
}

// 10. Return Success JSON Response
http_response_code(200);
echo json_encode([
    "status" => "success",
    "message" => "Login successful.",
    "data" => [
        "id" => $user['id'],
        "full_name" => $user['full_name'],
        "role" => $user['role'],
        "redirect_url" => $redirect_url
    ]
]);

// Close statement and connection
$stmt->close();
$conn->close();
?>