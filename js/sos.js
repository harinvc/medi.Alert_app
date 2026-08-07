/**
 * Project Name: MedAlert AI - AI Powered Centralized Medical Emergency Response Alert System
 * File: sos.js
 * Description: Core logic for handling SOS alerts, including voice input, geolocation, and API communication.
 * Technologies: ES6 JavaScript, Web Speech API, Fetch API
 */

import { analyzeEmergency } from './gemini.js';
import { getUserLocation } from './maps.js';

document.addEventListener('DOMContentLoaded', () => {
    const sosBtn = document.getElementById('sosBtn');
    const micBtn = document.getElementById('micBtn');

    if (sosBtn) sosBtn.addEventListener('click', handleSOSAlert);
    if (micBtn) micBtn.addEventListener('click', handleVoiceInput);
});

/**
 * Handles the Voice Input using the Web Speech API to transcribe speech to text.
 */
const handleVoiceInput = () => {
    const micBtn = document.getElementById('micBtn');
    const descriptionInput = document.getElementById('emergencyDescription');

    // Check for browser support
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
        showAlert('Speech recognition is not supported in your browser. Please type the description.', 'warning');
        return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
        micBtn.classList.add('btn-danger'); // Change color to indicate recording
        micBtn.innerHTML = '<i class="bi bi-mic-fill"></i> Listening...';
    };

    recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        descriptionInput.value = transcript;
    };

    recognition.onerror = (event) => {
        console.error('Speech Recognition Error:', event.error);
        showAlert('Error capturing voice input. Please try again or type manually.', 'danger');
    };

    recognition.onend = () => {
        micBtn.classList.remove('btn-danger');
        micBtn.classList.add('btn-secondary');
        micBtn.innerHTML = '<i class="bi bi-mic"></i> Voice Input';
    };

    recognition.start();
};

/**
 * Primary function executed when the large SOS Button is clicked.
 */
const handleSOSAlert = async () => {
    const descriptionInput = document.getElementById('emergencyDescription').value.trim();
    const sosBtn = document.getElementById('sosBtn');
    const statusContainer = document.getElementById('emergencyStatusContainer');

    // 1. Validate Description
    if (!descriptionInput) {
        showAlert('Please provide an emergency description via text or voice.', 'danger');
        return;
    }

    // Prepare UI for loading state
    setButtonLoading(sosBtn, true, 'Processing SOS...');
    clearAlerts();

    try {
        // 2. Get Current Location
        const location = await getUserLocation();

        // Retrieve logged-in user data from session storage
        const sessionUser = JSON.parse(sessionStorage.getItem('medalert_user') || '{}');
        const patientId = sessionUser.id;

        if (!patientId) {
            throw new Error('User session not found. Please log in.');
        }

        // 3. Send emergency data to backend/emergency/create.php
        const createResponse = await fetch('backend/emergency/create.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                patient_id: patientId,
                description: descriptionInput,
                latitude: location.lat,
                longitude: location.lng
            })
        });

        const createResult = await createResponse.json();

        if (!createResponse.ok || createResult.status !== 'success') {
            throw new Error(createResult.message || 'Failed to create emergency request.');
        }

        const emergencyData = createResult.data;

        // 4. Call analyzeEmergency() from gemini.js to visually process and display AI cards
        // Assuming DOM elements 'aiResultContainer' and 'aiLoader' exist in the HTML
        await analyzeEmergency(descriptionInput, 'aiResultContainer', 'aiLoader');

        // 5. Match with nearest suitable hospital based on AI's emergency_type classification
        const matchResponse = await fetch('backend/hospital/match.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                emergency_type: emergencyData.emergency_type,
                latitude: location.lat,
                longitude: location.lng
            })
        });

        const matchResult = await matchResponse.json();
        
        let assignedHospital = 'Pending Match';
        let eta = 'Calculating...';

        if (matchResponse.ok && matchResult.status === 'success') {
            assignedHospital = matchResult.data.hospital_name;
            eta = `${matchResult.data.eta_minutes} mins`;
        } else {
            console.warn('Hospital match warning:', matchResult.message);
        }

        // 6. Display the consolidated status UI
        displayEmergencyStatus(statusContainer, {
            type: emergencyData.emergency_type,
            severity: emergencyData.severity,
            priority: emergencyData.priority,
            hospital: assignedHospital,
            eta: eta,
            status: 'Pending Assignment' // Initial status
        });

        // 7. Show success message
        showAlert('SOS Alert sent successfully! Help is on the way.', 'success');

    } catch (error) {
        // 8. Handle API errors
        console.error('SOS Processing Error:', error);
        showAlert(`Failed to process SOS: ${error.message}`, 'danger');
    } finally {
        // Reset button state
        setButtonLoading(sosBtn, false, 'PRESS FOR SOS');
    }
};

/**
 * Renders the emergency status dashboard dynamically.
 * @param {HTMLElement} container 
 * @param {Object} data 
 */
const displayEmergencyStatus = (container, data) => {
    if (!container) return;

    container.innerHTML = `
        <div class="card mt-4 shadow-lg border-danger">
            <div class="card-header bg-danger text-white fw-bold">
                <i class="bi bi-broadcast"></i> Live Emergency Status
            </div>
            <ul class="list-group list-group-flush">
                <li class="list-group-item"><strong>Emergency Type:</strong> ${data.type}</li>
                <li class="list-group-item"><strong>Severity:</strong> <span class="badge bg-dark text-uppercase">${data.severity}</span></li>
                <li class="list-group-item"><strong>Priority Level:</strong> ${data.priority}</li>
                <li class="list-group-item"><strong>Assigned Hospital:</strong> ${data.hospital}</li>
                <li class="list-group-item"><strong>Estimated ETA:</strong> ${data.eta}</li>
                <li class="list-group-item text-primary fw-bold"><strong>Current Status:</strong> ${data.status}</li>
            </ul>
        </div>
    `;
    container.classList.remove('d-none');
};

/**
 * Utility: Shows a Bootstrap 5 alert.
 * @param {string} message 
 * @param {string} type 
 */
const showAlert = (message, type) => {
    const alertBox = document.getElementById('sosAlertContainer');
    if (!alertBox) return;

    alertBox.innerHTML = `
        <div class="alert alert-${type} alert-dismissible fade show" role="alert">
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        </div>
    `;
};

/**
 * Utility: Clears the alert container.
 */
const clearAlerts = () => {
    const alertBox = document.getElementById('sosAlertContainer');
    if (alertBox) alertBox.innerHTML = '';
};

/**
 * Utility: Toggles button loading state.
 * @param {HTMLButtonElement} btn 
 * @param {boolean} isLoading 
 * @param {string} text 
 */
const setButtonLoading = (btn, isLoading, text) => {
    if (!btn) return;
    if (isLoading) {
        btn.disabled = true;
        btn.innerHTML = `<span class="spinner-grow spinner-grow-sm" role="status" aria-hidden="true"></span> ${text}`;
    } else {
        btn.disabled = false;
        btn.innerHTML = text;
    }
};