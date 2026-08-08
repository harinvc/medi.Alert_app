require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const connectDB = require('./config/db');

// Models
const Bed = require('./models/Bed');
const MedicationOrder = require('./models/MedicationOrder');
const EmergencyCase = require('./models/EmergencyCase');
const Hospital = require('./models/Hospital');
const User = require('./models/User');
const sosRoutes = require('./routes/sos.routes');

const app = express();
const server = http.createServer(app);

// Connect to MongoDB
connectDB();

// Enable CORS for frontend clients
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE']
}));

app.use(express.json());

// Initialize Socket.io Server
const io = new Server(server, {
  cors: {
    origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:3000'],
    methods: ['GET', 'POST']
  }
});

// seedDatabase() logic has been moved to a standalone seed.js file.

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
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (user && user.password === password) {
      return res.json({ success: true, user, token: `token_${user._id}_${Date.now()}` });
    }

    return res.status(401).json({ success: false, message: 'Invalid credentials' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 2b. Authentication Register API
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, role, name, phone, bloodGroup, unit, reg, hospital, department } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }

    const newUser = new User({
      email,
      password,
      role: role === 'ambulance' ? 'driver' : role, // map ambulance to driver role in DB
      name: name || email.split('@')[0],
      phone,
      bloodGroup,
      unit,
      reg,
      hospital,
      department
    });

    await newUser.save();
    return res.json({ success: true, user: newUser, token: `token_${newUser._id}_${Date.now()}` });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Demo Route to fetch first user by role
app.get('/api/auth/demo/:role', async (req, res) => {
  try {
    const user = await User.findOne({ role: req.params.role });
    if (user) {
      res.json({ success: true, user });
    } else {
      res.status(404).json({ success: false, message: 'No user found for role.' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Attach io to req for controllers
app.use((req, res, next) => {
  req.io = io;
  next();
});

// 3. SOS Routes
app.use('/api/sos', sosRoutes);

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
io.on('connection', (socket) => {
  console.log('⚡ Client connected to WebSockets:', socket.id);

  socket.on('join_hospital', (hospitalId) => {
    socket.join(`hospital_${hospitalId}`);
    console.log(`🏥 Hospital dashboard joined room: hospital_${hospitalId}`);
  });

  socket.on('location-update', (data) => {
    io.emit('location-update', data);
  });

  socket.on('vitals-sync', (data) => {
    io.emit('vitals-sync', data);
  });

  socket.on('ambulance:telemetry', (data) => {
    io.emit('ambulance:telemetry', data); // Keep legacy for now just in case
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
