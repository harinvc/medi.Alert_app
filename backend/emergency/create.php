<?php
/**
 * Project Name: MedAlert AI - AI Powered Centralized Medical Emergency Response Alert System
 * File: create.php
 * Description: API endpoint to create a new emergency request.
 * Flow: Stores emergency -> Calls Gemini API -> Updates with AI response -> Returns JSON.
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

// 2. Receive POST Data
$data = json_decode(file_get_contents("php://input"));

$patient_id  = $data->patient_id ?? $_POST['patient_id'] ?? null;
$description = trim($data->description ?? $_POST['description'] ?? '');
$latitude    = $data->latitude ?? $_POST['latitude'] ?? null;
$longitude   = $data->longitude ?? $_POST['longitude'] ?? null;

// 3. Validate Inputs
if (!$patient_id || empty($description) || !$latitude || !$longitude) {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "patient_id, description, latitude, and longitude are required."]);
    exit;
}

// 4. STEP 1: Store Initial Emergency Request
// Note: 'severity' is NOT NULL in the database, so we insert a default 'high' severity until AI triages it.
$temp_severity = 'high'; 
$status = 'pending';

$insert_query = "INSERT INTO emergency_requests (patient_id, description, latitude, longitude, severity, status) VALUES (?, ?, ?, ?, ?, ?)";
$insert_stmt = $conn->prepare($insert_query);

if (!$insert_stmt) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => "Database preparation error: " . $conn->error]);
    exit;
}

// i = integer, s = string, d = double (for decimals)
$insert_stmt->bind_param("isddss", $patient_id, $description, $latitude, $longitude, $temp_severity, $status);

if (!$insert_stmt->execute()) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => "Failed to log emergency: " . $insert_stmt->error]);
    $insert_stmt->close();
    exit;
}

$emergency_id = $insert_stmt->insert_id;
$insert_stmt->close();

// 5. STEP 2: Call Gemini API for Triage Analysis
$api_key = "YOUR_GEMINI_API_KEY"; // Replace with your actual Gemini API Key
$api_url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" . $api_key;

$prompt = "You are an expert medical AI triage system for 'MedAlert AI'. 
Analyze the following medical emergency description and provide a highly accurate assessment. 
Description: \"$description\"

Return a raw JSON object (without markdown) containing exactly these fields:
- \"emergency_type\": (string) The specific type of medical emergency.
- \"severity\": (string) Must be exactly one of: 'low', 'medium', 'high', 'critical'.
- \"priority\": (integer) A number from 1 to 5, where 1 is the most urgent.
- \"department\": (string) The best hospital department (e.g., Cardiology, Trauma).
- \"ai_summary\": (string) A one-sentence summary and immediate action.";

$payload = [
    "contents" => [
        ["parts" => [["text" => $prompt]]]
    ],
    "generationConfig" => [
        "response_mime_type" => "application/json"
    ]
];

$ch = curl_init($api_url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));
curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
curl_setopt($ch, CURLOPT_TIMEOUT, 10); // 10 second timeout

$response = curl_exec($ch);
$http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

// Default fallback values in case AI fails
$ai_success = false;
$emergency_type = "Unclassified";
$severity = "high"; // Fallback to safe severity
$priority = 2;
$department = "Emergency Room";
$ai_summary = "AI triage unavailable. Manual assessment required.";

if ($response !== false && $http_code === 200) {
    $response_data = json_decode($response, true);
    $ai_text = $response_data['candidates'][0]['content']['parts'][0]['text'] ?? '';
    
    if (!empty($ai_text)) {
        $ai_result = json_decode($ai_text, true);
        if (json_last_error() === JSON_ERROR_NONE) {
            $emergency_type = $ai_result['emergency_type'] ?? $emergency_type;
            $severity       = $ai_result['severity'] ?? $severity;
            $priority       = (int) ($ai_result['priority'] ?? $priority);
            $department     = $ai_result['department'] ?? $department;
            $ai_summary     = $ai_result['ai_summary'] ?? $ai_summary;
            $ai_success     = true;
        }
    }
}

// 6. STEP 3: Store AI Response (Update Database)
$update_query = "UPDATE emergency_requests SET emergency_type = ?, severity = ?, priority = ?, department = ?, ai_summary = ? WHERE id = ?";
$update_stmt = $conn->prepare($update_query);

if ($update_stmt) {
    // s = string, i = integer
    $update_stmt->bind_param("ssissi", $emergency_type, $severity, $priority, $department, $ai_summary, $emergency_id);
    $update_stmt->execute();
    $update_stmt->close();
}

// 7. STEP 4: Return JSON Response
http_response_code(201); // 201 Created
echo json_encode([
    "status" => "success",
    "message" => "Emergency logged and triaged successfully.",
    "data" => [
        "emergency_id"   => $emergency_id,
        "patient_id"     => $patient_id,
        "ai_triaged"     => $ai_success,
        "emergency_type" => $emergency_type,
        "severity"       => $severity,
        "priority"       => $priority,
        "department"     => $department,
        "ai_summary"     => $ai_summary
    ]
]);

$conn->close();
?>