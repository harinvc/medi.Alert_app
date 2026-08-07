/**
 * Project Name: MedAlert AI - AI Powered Centralized Medical Emergency Response Alert System
 * File: gemini.js
 * Description: Handles AI-powered emergency triage via Google Gemini API using Fetch API.
 * Technologies: ES6 JavaScript, Bootstrap 5 (DOM manipulation)
 */

/**
 * Analyzes an emergency description using the MedAlert AI Gemini backend.
 * 
 * @param {string} description - The emergency description from the SOS page input.
 * @param {string} resultContainerId - The DOM ID of the container to display the AI cards.
 * @param {string} loaderId - The DOM ID of the loading animation element.
 * @returns {Promise<Object|null>} - Returns the AI JSON response data or null if it fails.
 */
export const analyzeEmergency = async (description, resultContainerId, loaderId) => {
    const resultsContainer = document.getElementById(resultContainerId);
    const loader = document.getElementById(loaderId);

    if (!description || description.trim() === '') {
        renderError('Please provide a valid emergency description.', resultsContainer);
        return null;
    }

    // 1. Show loading animation, clear and hide previous results
    if (loader) loader.classList.remove('d-none');
    if (resultsContainer) {
        resultsContainer.innerHTML = '';
        resultsContainer.classList.add('d-none');
    }

    try {
        // 2. Send POST request to Gemini PHP backend
        const response = await fetch('backend/ai/gemini.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ description: description.trim() })
        });

        // 3. Receive and parse JSON
        const result = await response.json();

        if (!response.ok || result.status !== 'success') {
            throw new Error(result.message || 'Failed to process AI triage.');
        }

        const aiData = result.data;
        
        // 4. Display results in Bootstrap cards
        renderAICard(aiData, resultsContainer);
        
        return aiData;

    } catch (error) {
        // 6. Handle API errors gracefully
        console.error('Gemini API Error:', error);
        renderError(`AI Analysis Failed: ${error.message}`, resultsContainer);
        return null;
    } finally {
        // 5. Hide loading animation when done
        if (loader) loader.classList.add('d-none');
    }
};

/**
 * Renders the structured AI analysis results into a Bootstrap 5 card component.
 * 
 * @param {Object} data - The JSON data returned from the Gemini API.
 * @param {HTMLElement} container - The DOM element where the card will be injected.
 */
const renderAICard = (data, container) => {
    if (!container) return;

    const { emergency_type, severity, priority, department, ai_summary } = data;

    // Map severity levels to Bootstrap contextual colors
    const severityColors = {
        'low': 'success',
        'medium': 'warning',
        'high': 'danger',
        'critical': 'dark'
    };
    
    // Default to 'primary' if severity is unrecognized
    const themeColor = severityColors[severity?.toLowerCase()] || 'primary';

    // Construct the UI card
    const cardHTML = `
        <div class="card shadow border-${themeColor} mt-3">
            <div class="card-header bg-${themeColor} text-white fw-bold">
                AI Triage Assessment
            </div>
            <div class="card-body">
                <h5 class="card-title text-${themeColor}">${emergency_type}</h5>
                <p class="card-text mb-4"><strong>AI Summary:</strong> <span class="text-muted">${ai_summary}</span></p>
                
                <div class="row text-center g-2">
                    <div class="col-4">
                        <div class="p-2 border rounded bg-light h-100 flex-column d-flex justify-content-center">
                            <small class="text-muted d-block">Severity</small>
                            <span class="fw-bold text-${themeColor} text-uppercase">${severity}</span>
                        </div>
                    </div>
                    <div class="col-4">
                        <div class="p-2 border rounded bg-light h-100 flex-column d-flex justify-content-center">
                            <small class="text-muted d-block">Priority</small>
                            <span class="fw-bold text-dark">Level ${priority}</span>
                        </div>
                    </div>
                    <div class="col-4">
                        <div class="p-2 border rounded bg-light h-100 flex-column d-flex justify-content-center">
                            <small class="text-muted d-block">Department</small>
                            <span class="fw-bold text-dark">${department}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;

    container.innerHTML = cardHTML;
    container.classList.remove('d-none');
};

/**
 * Renders an error message in the UI using Bootstrap alert.
 * 
 * @param {string} message - The error message to display.
 * @param {HTMLElement} container - The DOM element where the error will be injected.
 */
const renderError = (message, container) => {
    if (!container) return;
    
    container.innerHTML = `
        <div class="alert alert-danger mt-3 shadow-sm" role="alert">
            <strong>Error:</strong> ${message}
        </div>
    `;
    container.classList.remove('d-none');
};