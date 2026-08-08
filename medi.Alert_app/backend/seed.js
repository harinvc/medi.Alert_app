const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Bed = require('./models/Bed');
const EmergencyCase = require('./models/EmergencyCase');
const Hospital = require('./models/Hospital');

dotenv.config();

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

const importData = async () => {
  try {
    await connectDB();

    // Clear existing data
    await User.deleteMany();
    await Bed.deleteMany();
    await EmergencyCase.deleteMany();
    await Hospital.deleteMany();

    // Seed Users
    const users = await User.insertMany([
      {
        name: 'Alex Johnson',
        email: 'alex.patient@medalert.org',
        password: 'password123',
        role: 'patient',
        phone: '+1 (555) 019-2834',
        bloodGroup: 'O+',
        emergencyContacts: [
          { id: 'c-1', name: 'Sarah Johnson', relationship: 'Spouse', phone: '+1 (555) 392-0194', notifySms: true },
          { id: 'c-2', name: 'Mark Johnson', relationship: 'Son', phone: '+1 (555) 482-9912', notifySms: true }
        ],
        medicalHistory: [
          { id: 'h-1', date: '2023-11-14', event: 'Coronary Stent Placement', hospital: 'City Cardiac Institute', doctor: 'Dr. Sarah Jenkins', notes: 'LAD artery stent. Prescribed Plavix 75mg.', type: 'surgery' },
          { id: 'h-2', date: '2024-02-05', event: 'ER Visit - Chest Pain', hospital: 'General Hospital', doctor: 'Dr. Michael Chen', notes: 'Non-cardiac chest pain (acid reflux). Discharged same day.', type: 'er' }
        ]
      },
      {
        name: 'Marcus Vance',
        email: 'driver@medalert.org',
        password: 'password123',
        role: 'driver',
        phone: '+1 (555) 123-4567',
        unit: 'AMB-UNIT-04',
        reg: 'DL-98472910-X',
        vehicleRegNo: 'AMB-104-NYC',
        baseHospital: 'City Cardiac Institute'
      },
      {
        name: 'Dr. Sarah Jenkins',
        email: 'doctor@medalert.org',
        password: 'password123',
        role: 'doctor',
        phone: '+1 (555) 987-6543',
        hospital: 'City Cardiac & Emergency Institute',
        department: 'Cardiology Lead'
      }
    ]);

    // Seed Beds
    await Bed.insertMany([
      { id: 1, name: 'Cardiology Bed #1', status: 'OCCUPIED', patient: 'John Doe', type: 'ICU' },
      { id: 2, name: 'Cardiology Bed #2', status: 'OCCUPIED', patient: 'Jane Smith', type: 'ICU' },
      { id: 3, name: 'Cardiology Bed #3', status: 'PREPPING', patient: null, type: 'ICU' },
      { id: 4, name: 'Cardiology Bed #4', status: 'AVAILABLE', patient: null, type: 'ICU' },
      { id: 5, name: 'Trauma Bay A', status: 'AVAILABLE', patient: null, type: 'ER' },
      { id: 6, name: 'Trauma Bay B', status: 'MAINTENANCE', patient: null, type: 'ER' },
      { id: 7, name: 'General Ward 101', status: 'AVAILABLE', patient: null, type: 'WARD' },
      { id: 8, name: 'General Ward 102', status: 'AVAILABLE', patient: null, type: 'WARD' }
    ]);

    // Seed Hospitals
    await Hospital.insertMany([
      {
        name: 'City Cardiac & Emergency Institute',
        address: '45 Healthcare Boulevard',
        location: { lat: 12.9636, lng: 77.6066 },
        capacity: { icu: 4, general: 15 },
        availableResources: ['ICU', 'Cardiologist', 'Cath Lab', 'Trauma Surgeon', 'General Bed']
      },
      {
        name: 'Metro General Critical Care',
        address: '88 Metro Health Corridor',
        location: { lat: 12.9866, lng: 77.5846 },
        capacity: { icu: 1, general: 5 },
        availableResources: ['General Bed', 'Trauma Surgeon', 'Neurologist']
      }
    ]);

    console.log('Data Imported successfully!');
    process.exit();
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

importData();
