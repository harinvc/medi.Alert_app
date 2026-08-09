const EmergencyCase = require('../models/EmergencyCase');
const Hospital = require('../models/Hospital');
const aiService = require('../services/ai.service');
const matchingService = require('../services/matching.service');

exports.triggerSOS = async (req, res) => {
  try {
    const { symptoms, location, patientName, bloodGroup, allergies, emergencyContacts } = req.body;
    
    // Parse location if it's a string containing coordinates or fallback to default
    // In a real app, frontend would send accurate lat/lng. Here we mock from the text.
    let patientLat = 12.9716;
    let patientLng = 77.5946;
    
    // 1. AI Triage
    const aiTriage = await aiService.analyzeSymptoms(symptoms, allergies, "None");

    // 2. Hospital Matching Engine
    let bestHospital = await matchingService.findBestHospital(patientLat, patientLng, aiTriage.required_resources);
    
    // 3. Create Database Record
    const newCase = await EmergencyCase.create({
      id: `SOS-${Math.floor(100000 + Math.random() * 900000)}`,
      status: 'DISPATCHED',
      patientName: patientName || 'Alex Johnson',
      ageGender: '62yo Male',
      location: location || '100ft Road, Sector 4',
      condition: symptoms,
      allergies: allergies || 'None',
      symptoms: symptoms,
      emergencyContacts: emergencyContacts || [],
      vitals: {
        heartRate: 112,
        bp: '142/90',
        spo2: 94,
        respRate: 22,
        shockIndex: 0.79,
        shockStatus: 'CARDIOGENIC SHOCK RISK: ELEVATED'
      },
      telemetry: {
        speed: 72,
        lat: patientLat,
        lng: patientLng,
        greenCorridor: true,
        eta: '3.0 min'
      },
      driver: {
        name: 'Marcus Vance',
        unit: 'AMB-UNIT-04',
        vehicleReg: 'AMB-104-NYC',
        phone: '+1 (555) 392-0194'
      },
      hospital: bestHospital ? bestHospital._id : null,
      aiTriage: {
        severity: aiTriage.severity,
        requiredResources: aiTriage.required_resources,
        summary: aiTriage.clinical_summary
      }
    });

    const populatedCase = await EmergencyCase.findById(newCase._id).populate('hospital');

    // 4. Real-Time Dispatching (Socket.io)
    // Emitting targeted event
    if (populatedCase.hospital) {
      req.io.to(`hospital_${populatedCase.hospital._id}`).emit('incoming-critical-patient', populatedCase);
    }
    
    // Also emit broadcast so frontend patient tracker updates
    req.io.emit('sos:broadcast', populatedCase);

    res.json({ success: true, sos: populatedCase });
  } catch (error) {
    console.error("SOS Trigger Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getActiveSOS = async (req, res) => {
  try {
    const sos = await EmergencyCase.findOne({ status: { $ne: 'COMPLETED' } })
                                   .sort({ createdAt: -1 })
                                   .populate('hospital');
    res.json({ success: true, sos });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.completeSOS = async (req, res) => {
  try {
    const { id } = req.params;
    const emergency = await EmergencyCase.findOne({ id });
    if (!emergency) {
      return res.status(404).json({ success: false, message: "Emergency not found" });
    }

    emergency.status = 'COMPLETED';
    await emergency.save();

    res.json({ success: true, message: "Emergency handoff completed" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
