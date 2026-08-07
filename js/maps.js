/**
 * Project Name: MedAlert AI - AI Powered Centralized Medical Emergency Response Alert System
 * File: maps.js
 * Description: Modular wrapper for Google Maps API, handling geolocation, routing, and real-time markers.
 * Technologies: ES6 JavaScript, Google Maps JavaScript API
 */

// Global state for map instance and services
let map = null;
let directionsService = null;
let directionsRenderer = null;

// Track active markers for easy updates/removal
const activeMarkers = {
    patient: null,
    ambulance: null,
    hospitals: []
};

/**
 * Gets the user's current GPS location via the browser's Geolocation API.
 * @returns {Promise<Object>} Resolves with {lat, lng} or rejects with an error message.
 */
export const getUserLocation = () => {
    return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
            reject(new Error("Geolocation is not supported by your browser."));
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                resolve({
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                });
            },
            (error) => {
                let errorMessage = "An unknown error occurred while fetching location.";
                switch (error.code) {
                    case error.PERMISSION_DENIED:
                        errorMessage = "GPS permission denied. Please enable location services.";
                        break;
                    case error.POSITION_UNAVAILABLE:
                        errorMessage = "Location information is unavailable.";
                        break;
                    case error.TIMEOUT:
                        errorMessage = "The request to get user location timed out.";
                        break;
                }
                reject(new Error(errorMessage));
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
    });
};

/**
 * Initializes the Google Map in the specified container.
 * @param {string} containerId - The DOM element ID to render the map into.
 * @param {number} lat - Initial map center latitude.
 * @param {number} lng - Initial map center longitude.
 * @param {number} zoom - Initial map zoom level (default 14).
 */
export const initMap = (containerId, lat, lng, zoom = 14) => {
    const mapContainer = document.getElementById(containerId);
    if (!mapContainer) {
        console.error(`Map container with ID '${containerId}' not found.`);
        return;
    }

    if (typeof google === 'undefined' || !google.maps) {
        console.error("Google Maps API is not loaded.");
        return;
    }

    const center = { lat, lng };

    map = new google.maps.Map(mapContainer, {
        center: center,
        zoom: zoom,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: true
    });

    // Initialize Routing Services
    directionsService = new google.maps.DirectionsService();
    directionsRenderer = new google.maps.DirectionsRenderer({
        map: map,
        suppressMarkers: true // We manage our own custom markers
    });

    // Set initial patient marker
    setPatientMarker(lat, lng);
};

/**
 * Sets or updates the patient's current location marker.
 * @param {number} lat 
 * @param {number} lng 
 */
export const setPatientMarker = (lat, lng) => {
    if (!map) return;
    
    const position = { lat, lng };

    if (activeMarkers.patient) {
        activeMarkers.patient.setPosition(position);
    } else {
        activeMarkers.patient = new google.maps.Marker({
            position: position,
            map: map,
            title: "Your Location",
            icon: {
                url: "http://maps.google.com/mapfiles/ms/icons/red-dot.png"
            }
        });
    }
    map.panTo(position);
};

/**
 * Displays nearby hospitals on the map based on backend data.
 * @param {Array} hospitals - Array of hospital objects { lat, lng, hospital_name }
 */
export const showNearbyHospitals = (hospitals) => {
    if (!map) return;

    // Clear existing hospital markers
    activeMarkers.hospitals.forEach(marker => marker.setMap(null));
    activeMarkers.hospitals = [];

    hospitals.forEach(hospital => {
        const marker = new google.maps.Marker({
            position: { lat: parseFloat(hospital.lat), lng: parseFloat(hospital.lng) },
            map: map,
            title: hospital.hospital_name,
            icon: {
                url: "http://maps.google.com/mapfiles/ms/icons/hospitals.png" // Standard hospital icon
            }
        });

        // Optional: Add InfoWindow on click
        const infoWindow = new google.maps.InfoWindow({
            content: `<strong>${hospital.hospital_name}</strong>`
        });

        marker.addListener('click', () => {
            infoWindow.open(map, marker);
        });

        activeMarkers.hospitals.push(marker);
    });
};

/**
 * Draws a driving route from the origin to the destination and extracts Distance/ETA.
 * @param {Object} origin - { lat, lng }
 * @param {Object} destination - { lat, lng }
 * @param {string} infoContainerId - DOM ID to display Distance and ETA (optional).
 * @returns {Promise<Object>} Resolves with { distance, duration } texts.
 */
export const drawRoute = (origin, destination, infoContainerId = null) => {
    return new Promise((resolve, reject) => {
        if (!directionsService || !directionsRenderer) {
            reject(new Error("Routing services not initialized. Call initMap first."));
            return;
        }

        const request = {
            origin: new google.maps.LatLng(origin.lat, origin.lng),
            destination: new google.maps.LatLng(destination.lat, destination.lng),
            travelMode: google.maps.TravelMode.DRIVING
        };

        directionsService.route(request, (result, status) => {
            if (status === google.maps.DirectionsStatus.OK) {
                directionsRenderer.setDirections(result);

                const leg = result.routes[0].legs[0];
                const routeInfo = {
                    distance: leg.distance.text,
                    duration: leg.duration.text
                };

                // Update UI if container ID is provided
                if (infoContainerId) {
                    const infoElement = document.getElementById(infoContainerId);
                    if (infoElement) {
                        infoElement.innerHTML = `
                            <strong>Distance:</strong> ${routeInfo.distance} <br>
                            <strong>ETA:</strong> ${routeInfo.duration}
                        `;
                    }
                }

                resolve(routeInfo);
            } else {
                reject(new Error("Could not calculate route: " + status));
            }
        });
    });
};

/**
 * Updates the real-time location of the assigned ambulance on the map.
 * @param {number} lat 
 * @param {number} lng 
 */
export const updateAmbulanceMarker = (lat, lng) => {
    if (!map) return;

    const position = { lat, lng };

    if (activeMarkers.ambulance) {
        // Move existing marker smoothly (for basic implementation, simple setPosition is used)
        activeMarkers.ambulance.setPosition(position);
    } else {
        // Create new ambulance marker
        activeMarkers.ambulance = new google.maps.Marker({
            position: position,
            map: map,
            title: "Ambulance",
            icon: {
                url: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png" 
            },
            zIndex: 999 // Keep above other markers
        });
    }
};

/**
 * Clears the active route from the map.
 */
export const clearRoute = () => {
    if (directionsRenderer) {
        directionsRenderer.setDirections({ routes: [] });
    }
};