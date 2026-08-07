<?php
/**
 * Project Name: MedAlert AI - AI Powered Centralized Medical Emergency Response Alert System
 * File: match.php
 * Description: API endpoint to match the nearest suitable hospital for an emergency.
 * Matching Criteria: Distance (Haversine formula), Specialty, Available Beds, ICU Availability.
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

$emergency_type = trim($data->emergency_type ?? $_POST['emergency_type'] ?? '');
$latitude       = $data->latitude ?? $_POST['latitude'] ?? null;
$longitude      = $data->longitude ?? $_POST['longitude'] ?? null;

// 3. Validate Inputs
if (empty($emergency_type) || !$latitude || !$longitude) {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "emergency_type, latitude, and longitude are required."]);
    exit;
}

// Convert coordinates to float for calculation
$lat = (float) $latitude;
$lon = (float) $longitude;

// 4. SQL Query to Find the Best Hospital
// Uses the Haversine formula to calculate the great-circle distance between two points in kilometers (Earth radius ~ 6371 km).
// We prioritize hospitals with available beds. We order by a specialty match first, then ICU availability, then distance.
$query = "
    SELECT 
        id, 
        hospital_name, 
        (6371 * acos(
            cos(radians(?)) * cos(radians(latitude)) * 
            cos(radians(longitude) - radians(?)) + 
            sin(radians(?)) * sin(radians(latitude))
        )) AS distance
    FROM hospitals
    WHERE available_beds > 0
    ORDER BY 
        (specialties LIKE CONCAT('%', ?, '%')) DESC, -- Prioritize if hospital handles this specialty
        icu_available DESC,                           -- Prioritize ICU availability
        distance ASC                                  -- Then pick the closest one
    LIMIT 1
";

$stmt = $conn->prepare($query);

if (!$stmt) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => "Database preparation error: " . $conn->error]);
    exit;
}

// Bind parameters: 
// ? = Patient Latitude (double)
// ? = Patient Longitude (double)
// ? = Patient Latitude (double)
// ? = Emergency Type (string)
$stmt->bind_param("ddds", $lat, $lon, $lat, $emergency_type);
$stmt->execute();
$result = $stmt->get_result();

// 5. Check if a suitable hospital was found
if ($result->num_rows === 0) {
    http_response_code(404);
    echo json_encode(["status" => "error", "message" => "No suitable hospitals with available beds found nearby."]);
    $stmt->close();
    exit;
}

$hospital = $result->fetch_assoc();

// 6. Calculate ETA (Estimated Time of Arrival)
// Assuming an average urban ambulance speed of 40 km/h.
// Formula: (Distance / Speed) * 60 minutes
$average_speed_kmh = 40; 
$distance_km = round((float) $hospital['distance'], 2);
$eta_minutes = ceil(($distance_km / $average_speed_kmh) * 60);

// Ensure ETA is at least 1 minute for very close distances
if ($eta_minutes < 1) {
    $eta_minutes = 1;
}

// 7. Return the Matched Hospital JSON Data
http_response_code(200);
echo json_encode([
    "status" => "success",
    "message" => "Hospital matched successfully.",
    "data" => [
        "hospital_id"   => $hospital['id'],
        "hospital_name" => $hospital['hospital_name'],
        "distance_km"   => $distance_km,
        "eta_minutes"   => $eta_minutes
    ]
]);

// Close statement and connection
$stmt->close();
$conn->close();
?>