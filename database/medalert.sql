-- Create Database
CREATE DATABASE IF NOT EXISTS medalert;
USE medalert;

-- --------------------------------------------------------
-- Table Structure for `users`
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(150) NOT NULL,
    email VARCHAR(150) UNIQUE,
    phone VARCHAR(20) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('patient', 'hospital', 'ambulance', 'admin') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- --------------------------------------------------------
-- Table Structure for `medical_profiles`
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS medical_profiles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    blood_group VARCHAR(5),
    allergies TEXT,
    medical_conditions TEXT,
    emergency_contact VARCHAR(20),
    date_of_birth DATE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- --------------------------------------------------------
-- Table Structure for `hospitals`
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS hospitals (
    id INT AUTO_INCREMENT PRIMARY KEY,
    hospital_name VARCHAR(200) NOT NULL,
    address TEXT NOT NULL,
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    specialties TEXT,
    total_beds INT DEFAULT 0,
    available_beds INT DEFAULT 0,
    icu_available BOOLEAN DEFAULT FALSE,
    phone VARCHAR(20) NOT NULL
);

-- --------------------------------------------------------
-- Table Structure for `ambulances`
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS ambulances (
    id INT AUTO_INCREMENT PRIMARY KEY,
    driver_name VARCHAR(150) NOT NULL,
    vehicle_number VARCHAR(50) UNIQUE NOT NULL,
    phone VARCHAR(20) NOT NULL,
    status ENUM('available', 'dispatched', 'maintenance', 'offline') DEFAULT 'available',
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8)
);

-- --------------------------------------------------------
-- Table Structure for `emergency_requests`
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS emergency_requests (
    id INT AUTO_INCREMENT PRIMARY KEY,
    patient_id INT NOT NULL,
    description TEXT,
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    emergency_type VARCHAR(100),
    severity ENUM('low', 'medium', 'high', 'critical') NOT NULL,
    priority INT DEFAULT 1,
    department VARCHAR(100),
    ai_summary TEXT,
    hospital_id INT,
    ambulance_id INT,
    status ENUM('pending', 'assigned', 'en_route', 'arrived', 'completed', 'cancelled') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (hospital_id) REFERENCES hospitals(id) ON DELETE SET NULL,
    FOREIGN KEY (ambulance_id) REFERENCES ambulances(id) ON DELETE SET NULL
);

-- --------------------------------------------------------
-- Table Structure for `emergency_history`
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS emergency_history (
    id INT AUTO_INCREMENT PRIMARY KEY,
    emergency_id INT NOT NULL,
    completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    outcome TEXT,
    FOREIGN KEY (emergency_id) REFERENCES emergency_requests(id) ON DELETE CASCADE
);


-- ========================================================
-- SAMPLE INSERT STATEMENTS FOR TESTING
-- ========================================================

-- Insert Sample Users
INSERT INTO users (full_name, email, phone, password, role) VALUES 
('Rahul Sharma', 'rahul.s@example.com', '+919876543210', 'hashed_pass_1', 'patient'),
('City General Admin', 'admin@citygeneral.com', '+918888888888', 'hashed_pass_2', 'hospital'),
('Amit Kumar', 'amit.ambulance@example.com', '+917777777777', 'hashed_pass_3', 'ambulance'),
('Super Admin', 'admin@medalert.ai', '+919999999999', 'hashed_pass_4', 'admin');

-- Insert Sample Medical Profile
INSERT INTO medical_profiles (user_id, blood_group, allergies, medical_conditions, emergency_contact, date_of_birth) VALUES 
(1, 'O+', 'Penicillin, Peanuts', 'Hypertension, Mild Asthma', '+919876500000', '1985-06-15');

-- Insert Sample Hospital
INSERT INTO hospitals (hospital_name, address, latitude, longitude, specialties, total_beds, available_beds, icu_available, phone) VALUES 
('City General Hospital', '123 Health Ave, Mumbai, Maharashtra', 19.076090, 72.877426, 'Cardiology, Trauma, Neurology', 500, 120, TRUE, '+912212345678'),
('Lifeline Care', '45 Wellness Blvd, Mumbai, Maharashtra', 19.082000, 72.881000, 'Orthopedics, General Surgery', 200, 45, FALSE, '+912287654321');

-- Insert Sample Ambulance
INSERT INTO ambulances (driver_name, vehicle_number, phone, status, latitude, longitude) VALUES 
('Amit Kumar', 'MH-01-AB-1234', '+917777777777', 'available', 19.079000, 72.878000),
('Rajeev Singh', 'MH-02-XY-9876', '+919666666666', 'offline', 19.081000, 72.880000);

-- Insert Sample Emergency Request
INSERT INTO emergency_requests (patient_id, description, latitude, longitude, emergency_type, severity, priority, department, ai_summary, hospital_id, ambulance_id, status) VALUES 
(1, 'Patient is experiencing severe chest pain and shortness of breath.', 19.075000, 72.875000, 'Cardiac Arrest', 'critical', 1, 'Cardiology', 'AI Alert: High probability of Myocardial Infarction. Immediate ACLS required.', 1, 1, 'en_route');

-- Insert Sample Emergency History
INSERT INTO emergency_history (emergency_id, outcome) VALUES 
(1, 'Patient successfully admitted to ER. Condition stabilized after emergency angioplasty.');