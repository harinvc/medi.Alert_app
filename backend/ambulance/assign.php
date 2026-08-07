<?php
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");

// Include your database connection file here
// require_once 'db_connect.php';

// Assuming $conn is your mysqli connection object
// Example: $conn = new mysqli("localhost", "user", "password", "medalert_db");

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(["status" => "error", "message" => "Method not allowed"]);
    exit();
}

// Get JSON input
$data = json_decode(file_get_contents("php://input"));

if (!isset($data->emergency_id) || !isset($data->latitude) || !isset($data->longitude)) {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "Missing required fields (emergency_id, latitude, longitude)"]);
    exit();
}

$emergency_id = $data->emergency_id;
$emer_lat = $data->latitude;
$emer_lng = $data->longitude;

try {
    // Start Transaction to ensure data integrity
    $conn->begin_transaction();

    // 1. Find the nearest available ambulance using the Haversine formula (Distance in Kilometers)
    $findQuery = "
        SELECT id, driver_name, vehicle_number, 
        (6371 * acos(cos(radians(?)) * cos(radians(latitude)) * cos(radians(longitude) - radians(?)) + sin(radians(?)) * sin(radians(latitude)))) AS distance 
        FROM ambulances 
        WHERE status = 'available' 
        ORDER BY distance ASC 
        LIMIT 1
    ";
    
    $stmtFind = $conn->prepare($findQuery);
    // Bind parameters: latitude, longitude, latitude
    $stmtFind->bind_param("ddd", $emer_lat, $emer_lng, $emer_lat);
    $stmtFind->execute();
    $result = $stmtFind->get_result();

    if ($result->num_rows === 0) {
        throw new Exception("No available ambulances nearby at this moment.");
    }

    $ambulance = $result->fetch_assoc();
    $ambulance_id = $ambulance['id'];
    $driver_name = $ambulance['driver_name'];
    $vehicle_number = $ambulance['vehicle_number'];
    $distance = $ambulance['distance'];

    // Calculate a rough ETA (Assuming average city speed of 40 km/h)
    // Time in minutes = (Distance / 40) * 60 = Distance * 1.5
    $eta_minutes = max(1, ceil($distance * 1.5)); 
    $eta = $eta_minutes . " mins";

    // 2. Update ambulance status to 'dispatched'
    $updateAmbQuery = "UPDATE ambulances SET status = 'dispatched' WHERE id = ?";
    $stmtAmb = $conn->prepare($updateAmbQuery);
    $stmtAmb->bind_param("i", $ambulance_id);
    $stmtAmb->execute();

    // 3. Assign ambulance to the emergency record
    $updateEmerQuery = "UPDATE emergencies SET ambulance_id = ?, status = 'assigned' WHERE id = ?";
    $stmtEmer = $conn->prepare($updateEmerQuery);
    $stmtEmer->bind_param("ii", $ambulance_id, $emergency_id);
    $stmtEmer->execute();

    // Commit the transaction
    $conn->commit();

    // Return the required success response
    echo json_encode([
        "status" => "success",
        "data" => [
            "driver" => $driver_name,
            "vehicle_number" => $vehicle_number,
            "eta" => $eta,
            "assignment_status" => "dispatched"
        ]
    ]);

    // Close statements
    $stmtFind->close();
    $stmtAmb->close();
    $stmtEmer->close();

} catch (Exception $e) {
    // Rollback changes if anything failed
    $conn->rollback();
    
    http_response_code(500);
    echo json_encode([
        "status" => "error", 
        "message" => $e->getMessage()
    ]);
}

$conn->close();
?>