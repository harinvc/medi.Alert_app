<?php
/**
 * Project Name: MedAlert AI - AI Powered Centralized Medical Emergency Response Alert System
 * File: gemini.php
 * Description: Connects to the Google Gemini API to analyze an emergency description
 *              and return structured data (Type, Severity, Priority, Department, AI Summary).
 */

// Set headers for JSON response and CORS
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
$description = trim($data->description ?? $_POST['description'] ?? '');

// Validate input
if (empty($description)) {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "Emergency description is required."]);
    exit;
}

// 3. Gemini API Configuration
// IMPORTANT: In production, store this in environment variables, e.g., getenv('GEMINI_API_KEY')
$api_key = "YOUR_GEMINI_API_KEY"; 
// Using gemini-1.5-flash for fast, highly capable text/JSON processing
$api_url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" . $api_key;

// 4. Construct the Prompt
// We instruct the model to return ONLY a JSON object to easily parse the output
$prompt = "You are an expert medical AI triage system for 'MedAlert AI'. 
Analyze the following medical emergency description and provide a highly accurate assessment. 
Description: \"$description\"

Return a raw JSON object (without markdown formatting) containing exactly these fields:
- \"emergency_type\": (string) The specific type of medical emergency.
- \"severity\": (string) Must be exactly one of: 'low', 'medium', 'high', 'critical'.
- \"priority\": (integer) A number from 1 to 5, where 1 is the most urgent (highest priority).
- \"department\": (string) The hospital department best suited for this (e.g., Cardiology, Trauma, Neurology).
- \"ai_summary\": (string) A concise, one-sentence summary of the emergency and immediate action required.";

// 5. Prepare Payload for Gemini API
$payload = [
    "contents" => [
        [
            "parts" => [
                ["text" => $prompt]
            ]
        ]
    ],
    // Force the model to output JSON (Supported in Gemini 1.5 models)
    "generationConfig" => [
        "response_mime_type" => "application/json"
    ]
];

// 6. Initialize and Execute cURL Request
$ch = curl_init($api_url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json'
]);
// Timeout to prevent hanging during critical emergency requests
curl_setopt($ch, CURLOPT_TIMEOUT, 10); 

$response = curl_exec($ch);
$http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$curl_error = curl_error($ch);

curl_close($ch);

// 7. Handle cURL and API Errors
if ($response === false) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => "Failed to connect to AI service: " . $curl_error]);
    exit;
}

$response_data = json_decode($response, true);

// Check if the API returned an HTTP error code
if ($http_code !== 200) {
    http_response_code(502); // Bad Gateway
    $error_msg = $response_data['error']['message'] ?? "Unknown AI API error.";
    echo json_encode(["status" => "error", "message" => "AI Service Error: " . $error_msg]);
    exit;
}

// 8. Parse the Gemini Response
try {
    // Extract the text content from Gemini's response structure
    $ai_text = $response_data['candidates'][0]['content']['parts'][0]['text'] ?? '';
    
    if (empty($ai_text)) {
        throw new Exception("Empty response received from AI model.");
    }

    // Decode the JSON string returned by the model
    $ai_result = json_decode($ai_text, true);

    if (json_last_error() !== JSON_ERROR_NONE) {
        throw new Exception("AI did not return valid JSON.");
    }

    // 9. Return the formatted success response
    http_response_code(200);
    echo json_encode([
        "status" => "success",
        "message" => "Emergency analyzed successfully.",
        "data" => [
            "emergency_type" => $ai_result['emergency_type'] ?? 'Unknown',
            "severity"       => $ai_result['severity'] ?? 'high',
            "priority"       => (int) ($ai_result['priority'] ?? 1),
            "department"     => $ai_result['department'] ?? 'Emergency Room',
            "ai_summary"     => $ai_result['ai_summary'] ?? 'Requires immediate attention.'
        ]
    ]);

} catch (Exception $e) {
    // Catch parsing errors if the AI response format is unexpected
    http_response_code(500);
    echo json_encode([
        "status" => "error", 
        "message" => "Failed to process AI analysis: " . $e->getMessage()
    ]);
}
?>