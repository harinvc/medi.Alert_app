/**
 * Project Name: MedAlert AI - AI Powered Centralized Medical Emergency Response Alert System
 * File: auth.js
 * Description: Handles user registration, login, role-based redirection, and session management.
 * Technologies: Vanilla JS, Fetch API, Bootstrap 5
 */

document.addEventListener('DOMContentLoaded', () => {
    // Initialize Event Listeners for Forms if they exist on the current page
    const registerForm = document.getElementById('registerForm');
    const loginForm = document.getElementById('loginForm');
    const logoutBtn = document.getElementById('logoutBtn');

    if (registerForm) {
        registerForm.addEventListener('submit', handleRegistration);
    }

    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }

    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }
});

/**
 * Handles User Registration
 * @param {Event} event 
 */
async function handleRegistration(event) {
    event.preventDefault(); // Prevent default form submission

    const form = event.target;
    const alertContainer = document.getElementById('registerAlertContainer');
    const submitBtn = form.querySelector('button[type="submit"]');

    // 1. Get and Validate Inputs
    const fullName = form.full_name.value.trim();
    const email = form.email.value.trim();
    const phone = form.phone.value.trim();
    const password = form.password.value.trim();
    const role = form.role.value.trim();

    if (!fullName || !email || !phone || !password || !role) {
        showAlert(alertContainer, 'All fields are required.', 'danger');
        return;
    }

    // 2. Prepare Data and UI State
    const payload = { full_name: fullName, email, phone, password, role };
    setLoadingState(submitBtn, true, 'Registering...');
    clearAlert(alertContainer);

    // 3. Send POST Request
    try {
        const response = await fetch('backend/auth/register.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        const result = await response.json();

        // 4. Handle Response
        if (response.ok && result.status === 'success') {
            showAlert(alertContainer, 'Registration successful! Please log in.', 'success');
            form.reset();
            // Optional: Redirect to login page after brief delay
            // setTimeout(() => window.location.href = 'login.html', 2000);
        } else {
            showAlert(alertContainer, result.message || 'Registration failed. Please try again.', 'danger');
        }
    } catch (error) {
        console.error('Registration Error:', error);
        showAlert(alertContainer, 'A server error occurred. Please check your connection and try again.', 'danger');
    } finally {
        setLoadingState(submitBtn, false, 'Register');
    }
}

/**
 * Handles User Login
 * @param {Event} event 
 */
async function handleLogin(event) {
    event.preventDefault();

    const form = event.target;
    const alertContainer = document.getElementById('loginAlertContainer');
    const submitBtn = form.querySelector('button[type="submit"]');

    // 1. Get and Validate Inputs
    const email = form.email.value.trim();
    const password = form.password.value.trim();

    if (!email || !password) {
        showAlert(alertContainer, 'Email and password are required.', 'danger');
        return;
    }

    // 2. Prepare Data and UI State
    const payload = { email, password };
    setLoadingState(submitBtn, true, 'Logging in...');
    clearAlert(alertContainer);

    // 3. Send POST Request
    try {
        const response = await fetch('backend/auth/login.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        const result = await response.json();

        // 4. Handle Response
        if (response.ok && result.status === 'success') {
            const user = result.data;
            
            // Store user details in sessionStorage
            sessionStorage.setItem('medalert_user', JSON.stringify(user));
            sessionStorage.setItem('medalert_logged_in', 'true');

            showAlert(alertContainer, 'Login successful! Redirecting...', 'success');

            // Redirect based on role
            setTimeout(() => {
                switch (user.role) {
                    case 'patient':
                        window.location.href = 'patient/dashboard.html';
                        break;
                    case 'hospital':
                        window.location.href = 'hospital/dashboard.html';
                        break;
                    case 'ambulance':
                        window.location.href = 'ambulance/dashboard.html';
                        break;
                    case 'admin':
                        window.location.href = 'admin/dashboard.html';
                        break;
                    default:
                        window.location.href = 'index.html';
                }
            }, 1000); // 1-second delay for smooth UX
        } else {
            showAlert(alertContainer, result.message || 'Invalid credentials.', 'danger');
        }
    } catch (error) {
        console.error('Login Error:', error);
        showAlert(alertContainer, 'A server error occurred. Please try again later.', 'danger');
    } finally {
        setLoadingState(submitBtn, false, 'Login');
    }
}

/**
 * Handles User Logout
 */
function handleLogout(event) {
    if (event) event.preventDefault();
    
    // Clear session storage
    sessionStorage.removeItem('medalert_user');
    sessionStorage.removeItem('medalert_logged_in');

    // Redirect to login/home page
    window.location.href = '../login.html'; 
}

/**
 * Utility: Shows a Bootstrap 5 Alert
 * @param {HTMLElement} container - The DOM element to inject the alert into
 * @param {string} message - The message to display
 * @param {string} type - Bootstrap alert type (success, danger, warning, info)
 */
function showAlert(container, message, type) {
    if (!container) return;
    container.innerHTML = `
        <div class="alert alert-${type} alert-dismissible fade show" role="alert">
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        </div>
    `;
}

/**
 * Utility: Clears the Alert Container
 * @param {HTMLElement} container 
 */
function clearAlert(container) {
    if (container) {
        container.innerHTML = '';
    }
}

/**
 * Utility: Toggles Button Loading State with Bootstrap Spinner
 * @param {HTMLButtonElement} button - The button to toggle
 * @param {boolean} isLoading - True to show spinner, false to revert
 * @param {string} defaultText - Text to display on the button
 */
function setLoadingState(button, isLoading, text) {
    if (!button) return;
    
    if (isLoading) {
        button.disabled = true;
        button.innerHTML = `
            <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
            ${text}
        `;
    } else {
        button.disabled = false;
        button.innerHTML = text;
    }
}