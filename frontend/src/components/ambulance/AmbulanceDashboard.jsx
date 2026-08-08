import React, { useState, useEffect, useRef } from 'react';
import { 
  Ambulance, 
  MapPin, 
  Hospital, 
  Navigation, 
  PhoneCall, 
  Volume2, 
  VolumeX, 
  Activity, 
  ShieldAlert, 
  CheckCircle2, 
  Clock, 
  ArrowLeft, 
  LogOut, 
  Radio, 
  Zap, 
  Heart, 
  Wind, 
  Thermometer, 
  AlertTriangle, 
  Fuel, 
  CheckSquare, 
  Mic, 
  MicOff, 
  ChevronRight,
  UserCheck,
  Stethoscope
} from 'lucide-react';
import TiltCard from '../TiltCard';
import RealMapTracker from '../patient/RealMapTracker';

export default function AmbulanceDashboard({ driverUser, onBackToLanding }) {
  const [sirenActive, setSirenActive] = useState(true);
  const [dutyStatus, setDutyStatus] = useState('IN DISPATCH'); // 'ON DUTY', 'IN DISPATCH', 'STANDBY', 'OFF DUTY'
  const [activeStep, setActiveStep] = useState(2); // 1: Ack, 2: En Route, 3: Boarded, 4: ER Transit, 5: Handover
  const [radioConnected, setRadioConnected] = useState(false);
  const [isTalking, setIsTalking] = useState(false);
  const [greenCorridor, setGreenCorridor] = useState(true);
  const [speed, setSpeed] = useState(68);

  // Driver details
  const driverInfo = {
    name: driverUser?.name || 'Marcus Vance',
    id: 'AMB-UNIT-04',
    license: driverUser?.licenseNumber || 'DL-98472910-X',
    vehicleReg: driverUser?.vehicleRegNo || 'AMB-104-NYC',
    baseHospital: driverUser?.baseHospital || 'City Cardiac Institute'
  };

  // Active Emergency Case Data
  const [emergencyCase, setEmergencyCase] = useState({
    id: 'SOS-849120',
    priority: 'RED',
    patientName: 'Alex Johnson',
    ageGender: '62yo Male',
    location: '100ft Road, Indiranagar, Sector 4',
    condition: 'Acute Myocardial Infarction (Cardiac)',
    allergies: 'Penicillin, Latex',
    vitals: {
      heartRate: 112,
      bp: '142/90',
      spo2: 94,
      respRate: 22
    },
    hospital: {
      name: 'City Cardiac & Emergency Institute',
      bed: 'Cardiology Bed #4 (Locked)',
      address: '45 Healthcare Boulevard',
      doctor: 'Dr. Sarah Jenkins (Cardiology Lead)'
    },
    contactPhone: '+1 (555) 392-0194'
  });

  // Dynamic speed fluctuation for realistic telemetry
  useEffect(() => {
    const interval = setInterval(() => {
      setSpeed(prev => {
        const delta = Math.floor(Math.random() * 7) - 3;
        return Math.min(85, Math.max(45, prev + delta));
      });
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const steps = [
    { id: 1, label: 'Dispatch Ack', desc: 'SOS Received' },
    { id: 2, label: 'En Route to Patient', desc: 'GPS Active' },
    { id: 3, label: 'Patient Boarded', desc: 'Vitals Synced' },
    { id: 4, label: 'In Transit to ER', desc: 'Pre-emption' },
    { id: 5, label: 'ER Handover', desc: 'Complete' }
  ];

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#1C2B22] flex flex-col justify-between selection:bg-[#D9532F]/15 selection:text-[#D9532F]">
      
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-40 bg-[#1C2B22] text-white border-b border-[#0C4A3B]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          
          <div className="flex items-center gap-4">
            <button
              onClick={onBackToLanding}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors flex items-center gap-1.5 text-xs font-semibold cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Landing</span>
            </button>

            <div className="h-6 w-[1px] bg-white/20 hidden sm:block"></div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#D9532F] text-white flex items-center justify-center shadow-lg animate-pulse">
                <Ambulance className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-serif-heading text-xl font-bold text-white tracking-tight">Ambulance Command</span>
                  <span className="text-[10px] bg-[#D9532F] text-white font-bold px-2 py-0.5 rounded uppercase tracking-wider shadow">
                    UNIT #04
                  </span>
                </div>
                <p className="text-xs text-gray-300 hidden sm:block">Driver: {driverInfo.name} • {driverInfo.vehicleReg}</p>
              </div>
            </div>
          </div>

          {/* Right Shift Duty & Audio Controls */}
          <div className="flex items-center gap-3">
            
            {/* Siren Simulation Toggle */}
            <button
              onClick={() => setSirenActive(!sirenActive)}
              className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer border ${
                sirenActive 
                  ? 'bg-[#D9532F] text-white border-[#D9532F] shadow-lg shadow-[#D9532F]/30 animate-pulse' 
                  : 'bg-white/10 text-gray-300 border-white/20 hover:bg-white/20'
              }`}
            >
              {sirenActive ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              <span className="hidden md:inline">{sirenActive ? 'Siren ACTIVE' : 'Siren Muted'}</span>
            </button>

            {/* Duty Status Select */}
            <select
              value={dutyStatus}
              onChange={(e) => setDutyStatus(e.target.value)}
              className="bg-[#0C4A3B] text-white text-xs font-bold px-3 py-2 rounded-xl border border-[#72DFB4]/30 focus:outline-none cursor-pointer"
            >
              <option value="IN DISPATCH">🚨 IN DISPATCH</option>
              <option value="ON DUTY">🟢 ON DUTY</option>
              <option value="STANDBY">🟡 STANDBY</option>
              <option value="OFF DUTY">🔴 OFF DUTY</option>
            </select>

            <button
              onClick={onBackToLanding}
              className="p-2 rounded-xl bg-white/10 hover:bg-red-600 text-gray-300 hover:text-white transition-colors cursor-pointer"
              title="Sign Out"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>

        </div>
      </header>

      {/* Main Content Body */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 flex-grow w-full space-y-6">
        
        {/* High Priority Emergency HUD Alert Banner */}
        <div className="bg-gradient-to-r from-[#D9532F] via-[#B53B18] to-[#1C2B22] text-white p-6 rounded-3xl shadow-2xl border border-red-400/30 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative overflow-hidden">
          
          <div className="absolute -right-10 -bottom-10 w-60 h-60 bg-white/5 rounded-full blur-2xl pointer-events-none"></div>

          <div className="space-y-2 max-w-2xl relative z-10">
            <div className="flex items-center gap-2">
              <span className="px-3 py-0.5 rounded-full bg-white text-[#D9532F] font-bold text-xs uppercase tracking-widest flex items-center gap-1.5 shadow">
                <span className="w-2 h-2 rounded-full bg-[#D9532F] animate-ping"></span>
                PRIORITY RED LEVEL-1
              </span>
              <span className="text-xs text-gray-200 font-mono">ID: {emergencyCase.id}</span>
            </div>
            
            <h1 className="text-2xl sm:text-3xl font-serif-heading font-bold text-white">
              {emergencyCase.condition}
            </h1>

            <p className="text-sm text-gray-200 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#72DFB4] shrink-0" />
              <span>Pick-up Target: <strong>{emergencyCase.location}</strong></span>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 relative z-10 shrink-0">
            <a
              href={`tel:${emergencyCase.contactPhone}`}
              className="bg-white text-[#D9532F] hover:bg-gray-100 font-bold px-5 py-3 rounded-2xl text-xs flex items-center gap-2 shadow-lg transition-transform hover:scale-105 cursor-pointer text-decoration-none"
            >
              <PhoneCall className="w-4 h-4" />
              <span>Call Patient Family</span>
            </a>

            <button
              onClick={() => setRadioConnected(!radioConnected)}
              className={`px-5 py-3 rounded-2xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer border shadow-lg ${
                radioConnected 
                  ? 'bg-[#0C4A3B] text-[#72DFB4] border-[#72DFB4]' 
                  : 'bg-white/10 text-white border-white/20 hover:bg-white/20'
              }`}
            >
              <Radio className="w-4 h-4" />
              <span>{radioConnected ? 'ER Radio Connected' : 'Connect ER Radio'}</span>
            </button>
          </div>

        </div>

        {/* Dispatch Pipeline Progress Tracker */}
        <div className="bg-white/90 backdrop-blur-md p-6 rounded-3xl border border-[#E6E2D8] shadow-md space-y-4">
          <div className="flex items-center justify-between border-b border-[#F2EEE6] pb-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#0C4A3B] flex items-center gap-2">
              <Zap className="w-4 h-4 text-[#D9532F]" /> Dispatch Pipeline Control
            </h3>
            <span className="text-xs text-[#5F6B63]">Click any step to broadcast status</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
            {steps.map((s) => {
              const isCurrent = activeStep === s.id;
              const isPassed = activeStep > s.id;

              return (
                <button
                  key={s.id}
                  onClick={() => setActiveStep(s.id)}
                  className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between space-y-2 ${
                    isCurrent
                      ? 'bg-[#0C4A3B] text-white border-[#0C4A3B] shadow-lg ring-2 ring-[#72DFB4]/40 scale-[1.02]'
                      : isPassed
                      ? 'bg-[#E8F0EC] text-[#0C4A3B] border-[#0C4A3B]/30'
                      : 'bg-[#FAF8F5] text-gray-400 border-[#E6E2D8] hover:bg-[#F2EEE6]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider font-mono opacity-80">Step 0{s.id}</span>
                    {isPassed ? <CheckCircle2 className="w-4 h-4 text-[#0C4A3B]" /> : isCurrent ? <Clock className="w-4 h-4 text-[#72DFB4] animate-spin" /> : null}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold leading-tight">{s.label}</h4>
                    <p className="text-[10px] opacity-75 mt-0.5">{s.desc}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* 2-Column Main Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Column: Interactive Map & Telemetry HUD (7 Cols) */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Real Interactive Leaflet Map Component */}
            <TiltCard maxDegree={3} className="bg-white/90 backdrop-blur-md rounded-3xl p-6 border border-[#E6E2D8] shadow-xl space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#F2EEE6] pb-3">
                <div className="flex items-center gap-2">
                  <Navigation className="w-5 h-5 text-[#D9532F]" />
                  <h3 className="text-lg font-serif-heading font-bold text-[#1C2B22]">Live Route Navigation</h3>
                </div>

                <button
                  onClick={() => setGreenCorridor(!greenCorridor)}
                  className={`px-3 py-1 rounded-full text-xs font-bold transition-colors cursor-pointer border ${
                    greenCorridor 
                      ? 'bg-[#E8F0EC] text-[#0C4A3B] border-[#0C4A3B]/30' 
                      : 'bg-gray-100 text-gray-500 border-gray-300'
                  }`}
                >
                  Traffic Pre-emption: {greenCorridor ? '🟢 FORCED GREEN' : '⚪ MANUAL'}
                </button>
              </div>

              {/* Real Leaflet Map */}
              <RealMapTracker activeSOS={{ id: emergencyCase.id, location: emergencyCase.location, hospital: emergencyCase.hospital }} />

              {/* Telemetry Gauge Cards */}
              <div className="grid grid-cols-3 gap-3 pt-2">
                <div className="bg-[#FAF8F5] p-3.5 rounded-2xl border border-[#E6E2D8] text-center space-y-1">
                  <span className="text-gray-500 text-[10px] uppercase font-bold block">Current Speed</span>
                  <span className="text-xl font-bold font-mono text-[#1C2B22]">{speed} km/h</span>
                </div>

                <div className="bg-[#FAF8F5] p-3.5 rounded-2xl border border-[#E6E2D8] text-center space-y-1">
                  <span className="text-gray-500 text-[10px] uppercase font-bold block">Traffic Signals</span>
                  <span className="text-xs font-bold text-[#0C4A3B] block">4 Signals Cleared</span>
                </div>

                <div className="bg-[#FAF8F5] p-3.5 rounded-2xl border border-[#E6E2D8] text-center space-y-1">
                  <span className="text-gray-500 text-[10px] uppercase font-bold block">Road Surface</span>
                  <span className="text-xs font-bold text-[#1C2B22] block">Dry • Optimal</span>
                </div>
              </div>
            </TiltCard>

            {/* Emergency Audio Telemetry & Doctor Broadcast */}
            <div className="bg-[#1C2B22] text-white p-6 rounded-3xl shadow-xl space-y-4 border border-[#0C4A3B]">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2 text-[#72DFB4]">
                  <Radio className="w-5 h-5 animate-pulse" />
                  <h3 className="text-sm font-bold uppercase tracking-wider">Hospital ER Radio Telemetry</h3>
                </div>
                <span className="text-xs text-gray-400">Freq: 462.775 MHz</span>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white/5 p-4 rounded-2xl border border-white/10">
                <div className="space-y-1 text-center sm:text-left">
                  <p className="text-xs font-semibold text-white">Direct ER Channel to {emergencyCase.hospital.doctor}</p>
                  <p className="text-[11px] text-gray-300">Press & hold to broadcast live paramedic audio to Cath Lab team.</p>
                </div>

                <button
                  onMouseDown={() => setIsTalking(true)}
                  onMouseUp={() => setIsTalking(false)}
                  onTouchStart={() => setIsTalking(true)}
                  onTouchEnd={() => setIsTalking(false)}
                  className={`px-6 py-3 rounded-2xl text-xs font-bold transition-all shadow-lg cursor-pointer flex items-center gap-2 shrink-0 ${
                    isTalking 
                      ? 'bg-[#D9532F] text-white scale-105 animate-pulse' 
                      : 'bg-[#0C4A3B] text-white hover:bg-[#08362B]'
                  }`}
                >
                  {isTalking ? <Mic className="w-4 h-4 animate-ping" /> : <Mic className="w-4 h-4" />}
                  <span>{isTalking ? 'BROADCASTING LIVE...' : 'PUSH TO TALK (PTT)'}</span>
                </button>
              </div>
            </div>

          </div>

          {/* Right Column: Patient Vitals, Destination ER & Vehicle Status (5 Cols) */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Patient Live Vitals Monitor Card */}
            <TiltCard maxDegree={4} className="bg-white/90 backdrop-blur-md rounded-3xl p-6 border border-[#E6E2D8] shadow-xl space-y-5">
              
              <div className="flex items-center justify-between border-b border-[#F2EEE6] pb-3">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#D9532F] block">Live Vitals Sync</span>
                  <h3 className="text-lg font-bold text-[#1C2B22]">{emergencyCase.patientName}</h3>
                </div>
                <span className="text-xs font-bold text-white bg-[#D9532F] px-2.5 py-1 rounded-full shadow">
                  {emergencyCase.ageGender}
                </span>
              </div>

              {/* Vitals Grid */}
              <div className="grid grid-cols-2 gap-3">
                
                {/* Heart Rate */}
                <div className="bg-red-50/70 p-3.5 rounded-2xl border border-red-200 space-y-1">
                  <div className="flex items-center justify-between text-red-700 text-xs font-semibold">
                    <span className="flex items-center gap-1"><Heart className="w-4 h-4 text-red-500 animate-pulse" /> Heart Rate</span>
                    <span className="text-[10px] bg-red-100 px-1.5 py-0.5 rounded font-bold">HIGH</span>
                  </div>
                  <div className="text-2xl font-bold font-mono text-red-800">{emergencyCase.vitals.heartRate} <span className="text-xs text-red-600">BPM</span></div>
                </div>

                {/* Blood Pressure */}
                <div className="bg-blue-50/70 p-3.5 rounded-2xl border border-blue-200 space-y-1">
                  <div className="flex items-center justify-between text-blue-700 text-xs font-semibold">
                    <span className="flex items-center gap-1"><Activity className="w-4 h-4 text-blue-500" /> Blood Press.</span>
                    <span className="text-[10px] bg-blue-100 px-1.5 py-0.5 rounded font-bold">SYS</span>
                  </div>
                  <div className="text-2xl font-bold font-mono text-blue-900">{emergencyCase.vitals.bp} <span className="text-xs text-blue-700">mmHg</span></div>
                </div>

                {/* Oxygen Saturation */}
                <div className="bg-emerald-50/70 p-3.5 rounded-2xl border border-emerald-200 space-y-1">
                  <div className="flex items-center justify-between text-emerald-700 text-xs font-semibold">
                    <span className="flex items-center gap-1"><Wind className="w-4 h-4 text-emerald-600" /> SpO2</span>
                    <span className="text-[10px] bg-emerald-100 px-1.5 py-0.5 rounded font-bold">STABLE</span>
                  </div>
                  <div className="text-2xl font-bold font-mono text-emerald-900">{emergencyCase.vitals.spo2}%</div>
                </div>

                {/* Respiratory Rate */}
                <div className="bg-amber-50/70 p-3.5 rounded-2xl border border-amber-200 space-y-1">
                  <div className="flex items-center justify-between text-amber-700 text-xs font-semibold">
                    <span className="flex items-center gap-1"><Thermometer className="w-4 h-4 text-amber-600" /> Resp Rate</span>
                    <span className="text-[10px] bg-amber-100 px-1.5 py-0.5 rounded font-bold">RPM</span>
                  </div>
                  <div className="text-2xl font-bold font-mono text-amber-900">{emergencyCase.vitals.respRate} <span className="text-xs text-amber-700">/min</span></div>
                </div>

              </div>

              {/* Simulated ECG Waveform Display */}
              <div className="bg-[#1C2B22] p-3 rounded-2xl space-y-1 border border-[#0C4A3B]">
                <div className="flex items-center justify-between text-[10px] text-gray-400 font-mono">
                  <span>ECG Lead II Telemetry</span>
                  <span className="text-[#72DFB4] font-bold">ST Segment Elevation Alert</span>
                </div>
                <div className="h-10 w-full flex items-center justify-center overflow-hidden">
                  <svg className="w-full h-full text-[#72DFB4]" viewBox="0 0 300 40" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M0,20 L40,20 L50,10 L60,30 L70,5 L80,35 L90,20 L130,20 L140,10 L150,30 L160,5 L170,35 L180,20 L220,20 L230,10 L240,30 L250,5 L260,35 L270,20 L300,20" />
                  </svg>
                </div>
              </div>

              {/* Critical Medical Flags */}
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-xs text-red-800">
                <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                <span>Known Allergies: <strong>{emergencyCase.allergies}</strong></span>
              </div>

            </TiltCard>

            {/* Reserved Hospital ER Unit Card */}
            <TiltCard maxDegree={4} className="bg-white/90 backdrop-blur-md rounded-3xl p-6 border border-[#E6E2D8] shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-[#F2EEE6] pb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-[#0C4A3B]">Destination Hospital ER</span>
                <span className="text-xs font-bold text-[#0C4A3B] bg-[#E8F0EC] px-2.5 py-0.5 rounded-full">Bed Locked</span>
              </div>

              <div className="space-y-1">
                <h4 className="text-base font-bold text-[#1C2B22]">{emergencyCase.hospital.name}</h4>
                <p className="text-xs text-[#0C4A3B] font-semibold">{emergencyCase.hospital.bed}</p>
                <p className="text-xs text-[#5F6B63]">{emergencyCase.hospital.address}</p>
              </div>

              <div className="pt-2 border-t border-[#F2EEE6] flex items-center justify-between text-xs text-[#1C2B22]">
                <span className="text-gray-500">Lead Physician:</span>
                <span className="font-bold text-[#0C4A3B]">{emergencyCase.hospital.doctor}</span>
              </div>
            </TiltCard>

            {/* Vehicle & Inventory Telemetry */}
            <div className="bg-white/80 p-5 rounded-3xl border border-[#E6E2D8] space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#5F6B63] flex items-center gap-1.5">
                <Fuel className="w-4 h-4 text-[#0C4A3B]" /> Vehicle & On-board Inventory
              </h4>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-[#FAF8F5] rounded-xl border border-[#E6E2D8]">
                  <span className="text-gray-400 block text-[10px] uppercase font-bold">Oxygen Cylinder</span>
                  <span className="font-bold text-[#0C4A3B]">1,850 PSI (Full)</span>
                </div>
                <div className="p-3 bg-[#FAF8F5] rounded-xl border border-[#E6E2D8]">
                  <span className="text-gray-400 block text-[10px] uppercase font-bold">Defibrillator Battery</span>
                  <span className="font-bold text-[#0C4A3B]">100% Tested</span>
                </div>
              </div>
            </div>

          </div>

        </div>

      </main>

      {/* Ambulance Footer */}
      <footer className="border-t border-[#EBE7DE] py-4 text-center text-xs text-[#5F6B63] bg-[#FAF8F5]">
        <p>MedAlert AI Ambulance Fleet Navigation System • Encrypted Emergency Telemetry</p>
      </footer>

    </div>
  );
}
