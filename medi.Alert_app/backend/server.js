require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const connectDB = require('./config/db');

// Models
const User = require('./models/User');
const SOS = require('./models/SOS');
const Bed = require('./models/Bed');
const MedicationOrder = require('./models/MedicationOrder');

const app = express();
const server = http.createServer(app);

// Connect to MongoDB
connectDB();

// Enable CORS for frontend clients
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:3000'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));

app.use(express.json());

// Initialize Socket.io Server
const io = new Server(server, {
  cors: {
    origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:3000'],
    methods: ['GET', 'POST']
  }
});

// Seed data function (runs on startup to populate if empty)
const seedDatabase = async () => {
  try {
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      await User.insertMany([
        { email: 'alex.johnson@gmail.com', password: 'password123', role: 'patient', name: 'Alex Johnson', phone: '+1 (555) 019-2834', bloodGroup: 'O+' },
        { email: 'driver@medalert.ai', password: 'password123', role: 'driver', name: 'Marcus Vance', unit: 'AMB-UNIT-04', reg: 'AMB-104-NYC' },
        { email: 'doctor@medalert.ai', password: 'password123', role: 'doctor', name: 'Dr. Sarah Jenkins', hospital: 'City Cardiac & Emergency Institute', department: 'Lead Emergency Cardiologist' }
      ]);
      console.log('Seeded Users');
    }

    const bedCount = await Bed.countDocuments();
    if (bedCount === 0) {
      await Bed.insertMany([
        { id: 1, name: 'Bed #1', status: 'Occupied', patient: 'Sam W.', type: 'Trauma' },
        { id: 2, name: 'Bed #2', status: 'Occupied', patient: 'Elena R.', type: 'General' },
        { id: 3, name: 'Bed #3', status: 'Available', patient: null, type: 'General' },
        { id: 4, name: 'Bed #4', status: 'Reserved (Locked)', patient: 'Alex Johnson (Incoming)', type: 'Cardiology ER' },
        { id: 5, name: 'Bed #5', status: 'Occupied', patient: 'Chris P.', type: 'ICU' },
        { id: 6, name: 'Bed #6', status: 'Sanitizing', patient: null, type: 'Trauma' },
        { id: 7, name: 'Bed #7', status: 'Reserved (Locked)', patient: 'Rachel Green (Incoming)', type: 'Orthopedic' },
        { id: 8, name: 'Bed #8', status: 'Available', patient: null, type: 'General' }
      ]);
      console.log('Seeded Beds');
    }

    const sosCount = await SOS.countDocuments();
    if (sosCount === 0) {
      await SOS.create({
        id: `SOS-849120`,
        status: 'DISPATCHED',
        priority: 'RED',
        patientName: 'Alex Johnson',
        ageGender: '62yo Male',
        location: '100ft Road, HAL Indiranagar, Sector 4',
        condition: 'Acute Distress / Chest Pain',
        allergies: 'Penicillin, Latex',
        symptoms: 'Severe crushing chest pain radiating down left arm',
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
          lat: 12.9782,
          lng: 77.6394,
          greenCorridor: true,
          eta: '3.0 min'
        },
        driver: {
          name: 'Marcus Vance',
          unit: 'AMB-UNIT-04',
          vehicleReg: 'AMB-104-NYC',
          phone: '+1 (555) 392-0194'
        },
        hospital: {
          name: 'City Cardiac & Emergency Institute',
          rating: 4.9,
          bed: 'Cardiology Bed #4 (Locked)',
          address: '45 Healthcare Boulevard',
          doctor: 'Dr. Sarah Jenkins (Cardiology Lead)',
          doctorPhone: '+1 (555) 019-2831'
        }
      });
      console.log('Seeded Initial SOS');
    }
  } catch (error) {
    console.error('Error seeding database:', error);
  }
};
seedDatabase();

// REST API ROUTES

// Root Route — Rich HTML Status Dashboard
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>MedAlert AI — Real-Time Emergency Backend</title>
      <style>
        body { margin: 0; padding: 0; font-family: system-ui, -apple-system, sans-serif; background: #091510; color: #E8F0EC; display: flex; align-items: center; justify-content: center; min-height: 100vh; }
        .card { background: #0C4A3B; border: 1px solid #72DFB4; border-radius: 24px; padding: 40px; max-width: 650px; width: 90%; box-shadow: 0 20px 40px rgba(0,0,0,0.5); }
        .badge { background: #D9532F; color: white; font-weight: bold; font-size: 11px; padding: 4px 12px; border-radius: 20px; text-transform: uppercase; letter-spacing: 1px; display: inline-block; margin-bottom: 12px; }
        h1 { margin: 0 0 8px 0; font-size: 28px; color: #FFFFFF; }
        p { color: #A3C9B8; font-size: 14px; margin-bottom: 24px; }
        .status-box { background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.15); border-radius: 16px; padding: 20px; margin-bottom: 20px; }
        .endpoint-link { display: block; color: #72DFB4; text-decoration: none; font-family: monospace; font-size: 13px; padding: 8px 12px; background: rgba(0,0,0,0.3); border-radius: 8px; margin-top: 8px; }
        .endpoint-link:hover { background: rgba(114,223,180,0.2); }
      </style>
    </head>
    <body>
      <div class="card">
        <span class="badge">🚨 BACKEND ACTIVE (MongoDB CONNECTED)</span>
        <h1>MedAlert AI Backend Command Center</h1>
        <p>Node.js + Express REST APIs & Socket.io WebSockets Real-Time Emergency Telemetry Server</p>
        <div class="status-box">
          <strong style="color: #72DFB4; font-size: 13px; text-transform: uppercase; letter-spacing: 1px;">📡 Available REST API Endpoints:</strong>
          <a href="/api/health" class="endpoint-link" target="_blank">GET /api/health — System Health Status</a>
          <a href="/api/sos/active" class="endpoint-link" target="_blank">GET /api/sos/active — Active Emergency Case State</a>
          <a href="/api/beds/status" class="endpoint-link" target="_blank">GET /api/beds/status — Hospital ER Beds Floor Plan</a>
          <a href="/api/hospitals/nearest?lat=12.9716&lng=77.5946" class="endpoint-link" target="_blank">GET /api/hospitals/nearest — Nearest Rated Hospitals</a>
        </div>
        <div style="font-size: 12px; color: #72DFB4; font-family: monospace;">
          ⚡ WebSockets Server: ws://localhost:${process.env.PORT || 5000} (Socket.io)
        </div>
      </div>
    </body>
    </html>
  `);
});

// 1. Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ONLINE', app: 'MedAlert AI Backend', database: 'MongoDB', timestamp: new Date().toISOString() });
});

// 2. Authentication Login API
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password, role } = req.body;
    let user = await User.findOne({ email });

    if (!user && role) {
      user = await User.findOne({ role });
    }

    if (user) {
      // NOTE: Passwords are not hashed here for prototype purposes
      return res.json({ success: true, user, token: `token_${user._id}_${Date.now()}` });
    }

    // Fallback auto-provision for demo
    const newUser = await User.create({
      email: email || 'user@medalert.ai',
      password: password || 'password123',
      name: email ? email.split('@')[0] : 'Emergency User',
      role: role || 'patient'
    });

    res.json({ success: true, user: newUser, token: `token_${newUser._id}_${Date.now()}` });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 3. Create Emergency SOS API
app.post('/api/sos/create', async (req, res) => {
  try {
    const { symptoms, location, patientName, bloodGroup, allergies, contactPhone } = req.body;

    const newSos = await SOS.create({
      id: `SOS-${Math.floor(100000 + Math.random() * 900000)}`,
      status: 'DISPATCHED',
      priority: symptoms && symptoms.toLowerCase().includes('chest') ? 'RED' : 'RED',
      patientName: patientName || 'Alex Johnson',
      ageGender: '62yo Male',
      location: location || '100ft Road, HAL Indiranagar, Sector 4',
      condition: symptoms || 'Acute Distress / Chest Pain',
      allergies: allergies || 'Penicillin, Latex',
      symptoms: symptoms || 'Severe crushing chest pain radiating down left arm',
      contactPhone: contactPhone || '+1 (555) 392-0194',
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
        lat: 12.9782,
        lng: 77.6394,
        greenCorridor: true,
        eta: '3.0 min'
      },
      driver: {
        name: 'Marcus Vance',
        unit: 'AMB-UNIT-04',
        vehicleReg: 'AMB-104-NYC',
        phone: '+1 (555) 392-0194'
      },
      hospital: {
        name: 'City Cardiac & Emergency Institute',
        rating: 4.9,
        bed: 'Cardiology Bed #4 (Locked)',
        address: '45 Healthcare Boulevard',
        doctor: 'Dr. Sarah Jenkins (Cardiology Lead)',
        doctorPhone: '+1 (555) 019-2831'
      }
    });

    // Broadcast SOS event to all connected WebSockets
    io.emit('sos:broadcast', newSos);

    res.json({ success: true, sos: newSos });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 4. Get Active Emergency SOS API
app.get('/api/sos/active', async (req, res) => {
  try {
    const sos = await SOS.findOne().sort({ createdAt: -1 }); // Get the latest SOS
    res.json({ success: true, sos });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 5. Get ER Beds Status API
app.get('/api/beds/status', async (req, res) => {
  try {
    const beds = await Bed.find().sort({ id: 1 });
    res.json({ success: true, beds });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 6. Doctor Pre-Arrival Medication Approval API
app.post('/api/doctor/protocol', async (req, res) => {
  try {
    const { doctorName, medication, dosage, bedId } = req.body;
    
    const order = await MedicationOrder.create({
      id: `ord_${Date.now()}`,
      doctorName: doctorName || 'Dr. Sarah Jenkins',
      medication,
      dosage,
      timestamp: new Date().toLocaleTimeString(),
      status: 'APPROVED_AND_BROADCAST'
    });

    // Broadcast to all WebSockets (Ambulance + Hospital)
    io.emit('doctor:medication_order', order);

    res.json({ success: true, order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Helper: Haversine formula for exact distance between two coordinates in kilometers
function haversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// 7. Dynamic Real Location-Based Nearest Hospital Finder & Ratings API
app.get('/api/hospitals/nearest', async (req, res) => {
  const lat = parseFloat(req.query.lat) || 12.9716;
  const lng = parseFloat(req.query.lng) || 77.5946;
  const MAPTILER_KEY = process.env.MAPTILER_API_KEY || '6VYRpEtYjtPMoI6mh0Ef';

  let rawHospitals = [];

  try {
    const nomUrl = `https://nominatim.openstreetmap.org/search?format=json&amenity=hospital&viewbox=${lng - 0.15},${lat + 0.15},${lng + 0.15},${lat - 0.15}&bounded=1&limit=12`;
    const response = await fetch(nomUrl, {
      headers: { 'User-Agent': 'MedAlert-AI-Emergency/1.0 (medalert@ai.org)' }
    });

    if (response.ok) {
      const data = await response.json();
      if (Array.isArray(data) && data.length > 0) {
        rawHospitals = data.map((h, i) => {
          const hLat = parseFloat(h.lat);
          const hLng = parseFloat(h.lon);
          const namePart = (h.display_name || '').split(',')[0].trim();
          const cleanName = (!namePart || namePart.toLowerCase() === 'hospital') 
            ? `Emergency Hospital ${(h.display_name || '').split(',')[1] || ''}`.trim()
            : namePart;

          return {
            rawName: cleanName,
            address: h.display_name ? h.display_name.split(',').slice(0, 3).join(', ') : 'Medical District',
            fullAddress: h.display_name || 'Emergency Medical Sector',
            lat: hLat,
            lng: hLng
          };
        });
      }
    }
  } catch (err) {
    console.log('OSM Nominatim fetch notice:', err.message);
  }

  if (rawHospitals.length < 3) {
    try {
      const mapTilerUrl = `https://api.maptiler.com/geocoding/hospital.json?key=${MAPTILER_KEY}&proximity=${lng},${lat}`;
      const mtRes = await fetch(mapTilerUrl);
      if (mtRes.ok) {
        const mtData = await mtRes.json();
        if (mtData && mtData.features) {
          mtData.features.forEach((f) => {
            if (f.center && f.center.length >= 2) {
              const hLng = f.center[0];
              const hLat = f.center[1];
              rawHospitals.push({
                rawName: f.text || 'Regional Emergency Care Center',
                address: f.place_name || 'Healthcare Corridor',
                fullAddress: f.place_name || 'Healthcare Boulevard',
                lat: hLat,
                lng: hLng
              });
            }
          });
        }
      }
    } catch (err) {
      console.log('MapTiler Geocoding notice:', err.message);
    }
  }

  if (rawHospitals.length === 0) {
    rawHospitals = [
      { rawName: 'Metro General Cardiac & Level-1 Trauma Hospital', address: 'Healthcare Boulevard', fullAddress: '45 Healthcare Boulevard', lat: lat - 0.008, lng: lng + 0.012 },
      { rawName: 'St. Jude Super Specialty Emergency Medical Center', address: 'Metro Health Corridor', fullAddress: '88 Metro Health Corridor', lat: lat + 0.015, lng: lng - 0.010 },
      { rawName: 'City Academic Emergency & Critical Care Hospital', address: 'Civic Parkway', fullAddress: '12 Civic Parkway', lat: lat - 0.018, lng: lng - 0.015 }
    ];
  }

  const processed = rawHospitals.map((h, index) => {
    const distKm = haversineDistance(lat, lng, h.lat, h.lng);
    const distStr = distKm < 1 ? `${Math.round(distKm * 1000)} m` : `${distKm.toFixed(1)} km`;
    const estTimeMins = Math.max(1, Math.round(distKm * 2.2 + 1));
    const ratingsArr = [4.9, 4.8, 4.7, 4.9, 4.8];
    const bedsArr = [
      'Cardiology ER Bed #4 (Locked)',
      'Trauma Bay #2 (Reserved)',
      'ICU Bed #1 (Available)',
      'Emergency Bed #8 (Sanitized)',
      'Acute Care Bed #3 (Ready)'
    ];

    return {
      id: `hosp-${index + 1}-${Math.round(distKm * 100)}`,
      name: h.rawName,
      address: h.address,
      fullAddress: h.fullAddress,
      rating: ratingsArr[index % ratingsArr.length],
      reviewsCount: 450 + (index * 190) % 800,
      distanceKm: parseFloat(distKm.toFixed(2)),
      distance: distStr,
      travelTime: `${estTimeMins} min`,
      bedAssigned: bedsArr[index % bedsArr.length],
      specialties: index === 0 ? ['Cardiology ER', 'Cath Lab', 'Level-1 Trauma'] : ['General Trauma', 'Neurology', 'ICU'],
      leadDoctor: index === 0 ? 'Dr. Sarah Jenkins (Cardiology Lead)' : 'Dr. Arthur Pendelton',
      doctorPhone: '+1 (555) 019-2831',
      coords: [h.lat, h.lng]
    };
  });

  processed.sort((a, b) => a.distanceKm - b.distanceKm);
  const topNearest = processed.slice(0, 6);

  res.json({
    success: true,
    locationQueried: { lat, lng },
    count: topNearest.length,
    hospitals: topNearest
  });
});

// WEBSOCKET REAL-TIME EVENT HANDLERS
io.on('connection', async (socket) => {
  console.log(`⚡ Client connected to WebSockets: ${socket.id}`);

  try {
    // Send current state on connect from DB
    const activeSOS = await SOS.findOne().sort({ createdAt: -1 });
    const beds = await Bed.find().sort({ id: 1 });
    
    socket.emit('sos:active', activeSOS);
    socket.emit('beds:update', beds);

    // 1. Live Ambulance Telemetry Streaming (GPS + Speed + Corridor)
    socket.on('ambulance:telemetry', async (data) => {
      // In a real app we might update the DB here, but since it's high frequency
      // telemetry streaming, broadcasting is usually enough, occasionally saving.
      socket.broadcast.emit('ambulance:telemetry_stream', data);
    });

    // 2. Live Patient Vitals Streaming (HR, BP, SpO2, Shock Index)
    socket.on('patient:vitals_stream', (vitals) => {
      socket.broadcast.emit('patient:vitals_update', vitals);
    });

    // 3. Push to Talk (PTT) Audio & Transcript Relays
    socket.on('ptt:start', (data) => {
      socket.broadcast.emit('ptt:incoming_start', data);
    });

    socket.on('ptt:audio_chunk', (chunk) => {
      socket.broadcast.emit('ptt:audio_chunk', chunk);
    });

    socket.on('ptt:transcript', (data) => {
      socket.broadcast.emit('ptt:transcript_stream', data);
    });

    socket.on('ptt:end', (data) => {
      socket.broadcast.emit('ptt:incoming_end', data);
    });
  } catch (err) {
    console.error('Socket Connection Error:', err);
  }

  socket.on('disconnect', () => {
    console.log(`🔌 Client disconnected: ${socket.id}`);
  });
});

// Start Node HTTP & Socket Server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`
  ======================================================
  🚨 MedAlert AI Real-Time Backend Server ACTIVE!
  📡 REST API: http://localhost:${PORT}/api/health
  ⚡ Socket.io WebSockets: ws://localhost:${PORT}
  ======================================================
  `);
});
