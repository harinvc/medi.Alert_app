const Hospital = require('../models/Hospital');

// Haversine formula to calculate distance between two lat/lng points in km
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius of the earth in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2); 
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)); 
  return R * c; // Distance in km
}

exports.findBestHospital = async (patientLat, patientLng, requiredResources) => {
  // Get all hospitals
  const hospitals = await Hospital.find();
  if (hospitals.length === 0) return null;

  let bestHospital = null;
  let minScore = Infinity; // Lower score is better (combination of distance and resource match)

  hospitals.forEach(hospital => {
    // 1. Check if hospital has live ICU capacity (if ICU is required)
    const requiresICU = requiredResources.includes('ICU');
    if (requiresICU && hospital.capacity.icu <= 0) {
      return; // Skip if no ICU beds available
    }

    // 2. Calculate Distance
    const distance = calculateDistance(patientLat, patientLng, hospital.location.lat, hospital.location.lng);

    // 3. Resource matching penalty (if missing resources, penalize)
    let missingResources = 0;
    requiredResources.forEach(res => {
      if (res !== 'ICU' && res !== 'General Bed' && !hospital.availableResources.includes(res)) {
        missingResources++;
      }
    });

    // Score = distance (km) + 10km penalty for each missing specialized resource
    const score = distance + (missingResources * 10);

    if (score < minScore) {
      minScore = score;
      bestHospital = hospital;
    }
  });

  // Fallback to closest hospital regardless of resources if none matched perfectly but we still need *a* hospital
  if (!bestHospital) {
    let closestDist = Infinity;
    hospitals.forEach(hospital => {
      const distance = calculateDistance(patientLat, patientLng, hospital.location.lat, hospital.location.lng);
      if (distance < closestDist) {
        closestDist = distance;
        bestHospital = hospital;
      }
    });
  }

  return bestHospital;
};
