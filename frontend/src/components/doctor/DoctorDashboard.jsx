import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Stethoscope, 
  Ambulance, 
  Activity, 
  ShieldAlert, 
  Heart, 
  Wind, 
  Thermometer, 
  PhoneCall, 
  Radio, 
  CheckCircle2, 
  Clock, 
  ArrowLeft, 
  LogOut, 
  FileText, 
  AlertTriangle, 
  User, 
  Zap, 
  Users, 
  Mic, 
  CheckSquare, 
  ChevronRight,
  BedDouble,
  Sliders,
  Sparkles
} from 'lucide-react';
import TiltCard from '../TiltCard';
import RealMapTracker from '../patient/RealMapTracker';

export default function DoctorDashboard({ doctorUser, onBackToLanding }) {
  const [selectedCaseId, setSelectedCaseId] = useState('case-1');
  const [radioIntercomActive, setRadioIntercomActive] = useState(false);
  const [protocolExecuted, setProtocolExecuted] = useState({
    bedLocked: true,
    cathLabAlerted: true,
    heparinApproved: true,
    labsOrdered: false
  });

  const doctorInfo = {
    name: doctorUser?.name || 'Dr. Sarah Jenkins',
    title: doctorUser?.department || 'Lead Emergency Cardiologist, M.D.',
    hospital: doctorUser?.hospitalName || 'City Cardiac & Emergency Institute',
    regNo: doctorUser?.doctorRegNo || 'MC-984029-NY'
  };

  // Mock Incoming Emergency Cases Queue
  const [cases, setCases] = useState([
    {
      id: 'case-1',
      sosId: 'SOS-849120',
      severity: 'RED',
      badgeClass: 'bg-red-500 text-white',
      title: 'Acute Cardiac Event (STEMI)',
      patientName: 'Alex Johnson',
      ageGender: '62yo Male',
      ambulanceUnit: 'Ambulance #04',
      driverName: 'Marcus Vance',
      eta: '3.4 min',
      bedAssigned: 'Bed #4 (Cardiology ER)',
      location: '100ft Road, HAL Indiranagar',
      vitals: { hr: 112, bp: '142/90', spo2: 94, rr: 22 },
      aiSummary: '62yo M, severe chest pain radiating down left arm. ECG telemetry shows ST-segment elevation. Oxygen 10L/min and Aspirin 300mg administered by paramedic.'
    },
    {
      id: 'case-2',
      sosId: 'SOS-301948',
      severity: 'AMBER',
      badgeClass: 'bg-amber-500 text-white',
      title: 'High-Impact Tibia Fracture',
      patientName: 'Rachel Green',
      ageGender: '28yo Female',
      ambulanceUnit: 'Ambulance #09',
      driverName: 'David Miller',
      eta: '11.2 min',
      bedAssigned: 'Bed #7 (Orthopedic Trauma)',
      location: 'Halasuru Metro Corridor',
      vitals: { hr: 88, bp: '124/82', spo2: 98, rr: 16 },
      aiSummary: '28yo F, right leg deformity following collision. Splint applied, bleeding controlled, vitals stable.'
    },
    {
      id: 'case-3',
      sosId: 'SOS-194820',
      severity: 'GREEN',
      badgeClass: 'bg-emerald-600 text-white',
      title: 'Observation Transfer',
      patientName: 'Robert Paulson',
      ageGender: '54yo Male',
      ambulanceUnit: 'Ambulance #12',
      driverName: 'Elena Rostova',
      eta: '18.5 min',
      bedAssigned: 'Ward Bed #12',
      location: 'Community Health Center',
      vitals: { hr: 72, bp: '118/78', spo2: 99, rr: 14 },
      aiSummary: 'Post-op routine transfer for overnight monitoring. Vitals normal, no acute distress.'
    }
  ]);

  // ER Bed Floor Plan Map (Beds 1-12)
  const [beds, setBeds] = useState([
    { id: 1, name: 'Bed #1', status: 'Occupied', patient: 'Sam W.', type: 'Trauma' },
    { id: 2, name: 'Bed #2', status: 'Occupied', patient: 'Elena R.', type: 'General' },
    { id: 3, name: 'Bed #3', status: 'Available', patient: null, type: 'General' },
    { id: 4, name: 'Bed #4', status: 'Reserved (Locked)', patient: 'Alex Johnson (Incoming)', type: 'Cardiology ER' },
    { id: 5, name: 'Bed #5', status: 'Occupied', patient: 'Chris P.', type: 'ICU' },
    { id: 6, name: 'Bed #6', status: 'Sanitizing', patient: null, type: 'Trauma' },
    { id: 7, name: 'Bed #7', status: 'Reserved (Locked)', patient: 'Rachel Green (Incoming)', type: 'Orthopedic' },
    { id: 8, name: 'Bed #8', status: 'Available', patient: null, type: 'General' }
  ]);

  const activeCase = cases.find(c => c.id === selectedCaseId) || cases[0];

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#1C2B22] flex flex-col justify-between selection:bg-[#0C4A3B]/15 selection:text-[#0C4A3B]">
      
      {/* Top ER Command Navigation Bar */}
      <header className="sticky top-0 z-40 bg-[#0C4A3B] text-white border-b border-[#08362B] shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          
          <div className="flex items-center gap-4">
            <button
              onClick={onBackToLanding}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors flex items-center gap-1.5 text-xs font-semibold cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Landing Page</span>
            </button>

            <div className="h-6 w-[1px] bg-white/20 hidden sm:block"></div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white text-[#0C4A3B] flex items-center justify-center shadow-md">
                <Stethoscope className="w-6 h-6 text-[#0C4A3B]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-serif-heading text-xl font-bold text-white tracking-tight">Hospital ER Portal</span>
                  <span className="text-[10px] bg-[#72DFB4] text-[#0C4A3B] font-bold px-2 py-0.5 rounded uppercase font-mono shadow">
                    LIVE TRIAGE COMMAND
                  </span>
                </div>
                <p className="text-xs text-emerald-100 hidden sm:block">{doctorInfo.name} • {doctorInfo.title}</p>
              </div>
            </div>
          </div>

          {/* Right Doctor Action Controls */}
          <div className="flex items-center gap-3">
            <div className="hidden lg:flex items-center gap-2 bg-white/10 px-3.5 py-1.5 rounded-xl border border-white/20 text-xs">
              <Building2 className="w-4 h-4 text-[#72DFB4]" />
              <span className="text-gray-200">{doctorInfo.hospital}</span>
            </div>

            <button
              onClick={onBackToLanding}
              className="p-2 rounded-xl bg-white/10 hover:bg-red-600 text-white transition-colors cursor-pointer"
              title="Sign Out"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>

        </div>
      </header>

      {/* Main Content Body */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 flex-grow w-full space-y-6">
        
        {/* Top Active ER Countdown Banner */}
        <div className="bg-[#1C2B22] text-white p-6 sm:p-7 rounded-3xl shadow-xl border border-[#0C4A3B] flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
          
          <div className="space-y-1 z-10 max-w-xl">
            <div className="flex items-center gap-2 text-xs font-bold text-[#72DFB4] uppercase tracking-wider">
              <span className="w-2.5 h-2.5 rounded-full bg-[#D9532F] animate-ping"></span>
              Incoming Emergency Unit Dispatched
            </div>
            <h2 className="text-2xl sm:text-3xl font-serif-heading font-bold text-white">
              {activeCase.title} — {activeCase.patientName} ({activeCase.ageGender})
            </h2>
            <p className="text-xs text-gray-300">
              Transported by {activeCase.ambulanceUnit} ({activeCase.driverName}) • Pick-up: {activeCase.location}
            </p>
          </div>

          {/* ETA Countdown Badge */}
          <div className="bg-gradient-to-br from-[#D9532F] to-[#B53B18] text-white px-6 py-4 rounded-2xl shadow-xl text-center shrink-0 border border-white/20">
            <span className="text-[10px] uppercase font-bold text-gray-100 block">INCOMING ETA</span>
            <span className="text-3xl sm:text-4xl font-bold font-mono text-white">{activeCase.eta}</span>
          </div>

        </div>

        {/* 2-Column Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Column: Active Patient Telemetry & Protocol Controls (7 Cols) */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Live Patient Telemetry & AI Triage Summary Card */}
            <TiltCard maxDegree={3} className="bg-white/90 backdrop-blur-md rounded-3xl p-6 border border-[#E6E2D8] shadow-xl space-y-6">
              
              <div className="flex items-center justify-between border-b border-[#F2EEE6] pb-4">
                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${activeCase.badgeClass}`}>
                    PRIORITY {activeCase.severity}
                  </span>
                  <div>
                    <h3 className="text-lg font-bold text-[#1C2B22]">AI Medical Triage Summary</h3>
                    <p className="text-xs text-gray-500">Case #{activeCase.sosId}</p>
                  </div>
                </div>

                <div className="bg-[#E8F0EC] text-[#0C4A3B] px-3 py-1 rounded-full text-xs font-bold">
                  {activeCase.bedAssigned}
                </div>
              </div>

              {/* AI Case Description */}
              <div className="bg-[#0C4A3B] text-white p-5 rounded-2xl space-y-2 border border-[#72DFB4]/30 shadow-md">
                <div className="flex items-center justify-between text-xs text-[#72DFB4]">
                  <span className="font-bold uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-[#72DFB4]" /> MedAlert Intelligence Diagnosis
                  </span>
                  <span>Synced Live</span>
                </div>
                <p className="text-sm leading-relaxed text-gray-100">{activeCase.aiSummary}</p>
              </div>

              {/* Patient Live Vitals Grid */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#0C4A3B]">Real-Time In-Transit Vitals</h4>
                
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div className="bg-red-50 p-3 rounded-2xl border border-red-200 text-center">
                    <span className="text-red-600 block text-[10px] font-bold uppercase">Heart Rate</span>
                    <span className="text-xl font-bold font-mono text-red-900">{activeCase.vitals.hr} <span className="text-xs font-normal">BPM</span></span>
                  </div>
                  
                  <div className="bg-blue-50 p-3 rounded-2xl border border-blue-200 text-center">
                    <span className="text-blue-600 block text-[10px] font-bold uppercase">Blood Pressure</span>
                    <span className="text-xl font-bold font-mono text-blue-900">{activeCase.vitals.bp}</span>
                  </div>

                  <div className="bg-emerald-50 p-3 rounded-2xl border border-emerald-200 text-center">
                    <span className="text-emerald-600 block text-[10px] font-bold uppercase">SpO2 Oxygen</span>
                    <span className="text-xl font-bold font-mono text-emerald-900">{activeCase.vitals.spo2}%</span>
                  </div>

                  <div className="bg-amber-50 p-3 rounded-2xl border border-amber-200 text-center">
                    <span className="text-amber-600 block text-[10px] font-bold uppercase">Resp Rate</span>
                    <span className="text-xl font-bold font-mono text-amber-900">{activeCase.vitals.rr} <span className="text-xs font-normal">/min</span></span>
                  </div>
                </div>
              </div>

              {/* ECG Waveform Telemetry */}
              <div className="bg-[#1C2B22] p-4 rounded-2xl space-y-2 border border-[#0C4A3B]">
                <div className="flex items-center justify-between text-xs text-gray-300 font-mono">
                  <span className="flex items-center gap-1.5 text-[#72DFB4] font-bold">
                    <Activity className="w-4 h-4 animate-pulse" /> ECG Lead II Stream
                  </span>
                  <span>25 mm/s • 10 mm/mV</span>
                </div>
                <div className="h-12 w-full flex items-center justify-center overflow-hidden">
                  <svg className="w-full h-full text-[#72DFB4]" viewBox="0 0 300 40" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M0,20 L40,20 L50,10 L60,30 L70,5 L80,35 L90,20 L130,20 L140,10 L150,30 L160,5 L170,35 L180,20 L220,20 L230,10 L240,30 L250,5 L260,35 L270,20 L300,20" />
                  </svg>
                </div>
              </div>

              {/* Doctor ER Action Protocols Checklist */}
              <div className="space-y-3 pt-2 border-t border-[#F2EEE6]">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#0C4A3B] flex items-center gap-2">
                  <CheckSquare className="w-4 h-4 text-[#0C4A3B]" /> Doctor ER Protocols Checklist
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <button
                    onClick={() => setProtocolExecuted(prev => ({ ...prev, bedLocked: !prev.bedLocked }))}
                    className={`p-3 rounded-xl border flex items-center gap-2 font-semibold transition-all cursor-pointer text-left ${
                      protocolExecuted.bedLocked ? 'bg-[#E8F0EC] text-[#0C4A3B] border-[#0C4A3B]' : 'bg-white text-gray-600 border-[#E6E2D8]'
                    }`}
                  >
                    <CheckCircle2 className={`w-4 h-4 shrink-0 ${protocolExecuted.bedLocked ? 'text-[#0C4A3B]' : 'text-gray-400'}`} />
                    <span>Cardiology Bed #4 Locked</span>
                  </button>

                  <button
                    onClick={() => setProtocolExecuted(prev => ({ ...prev, cathLabAlerted: !prev.cathLabAlerted }))}
                    className={`p-3 rounded-xl border flex items-center gap-2 font-semibold transition-all cursor-pointer text-left ${
                      protocolExecuted.cathLabAlerted ? 'bg-[#E8F0EC] text-[#0C4A3B] border-[#0C4A3B]' : 'bg-white text-gray-600 border-[#E6E2D8]'
                    }`}
                  >
                    <CheckCircle2 className={`w-4 h-4 shrink-0 ${protocolExecuted.cathLabAlerted ? 'text-[#0C4A3B]' : 'text-gray-400'}`} />
                    <span>Cath Lab Team Alerted</span>
                  </button>

                  <button
                    onClick={() => setProtocolExecuted(prev => ({ ...prev, heparinApproved: !prev.heparinApproved }))}
                    className={`p-3 rounded-xl border flex items-center gap-2 font-semibold transition-all cursor-pointer text-left ${
                      protocolExecuted.heparinApproved ? 'bg-[#E8F0EC] text-[#0C4A3B] border-[#0C4A3B]' : 'bg-white text-gray-600 border-[#E6E2D8]'
                    }`}
                  >
                    <CheckCircle2 className={`w-4 h-4 shrink-0 ${protocolExecuted.heparinApproved ? 'text-[#0C4A3B]' : 'text-gray-400'}`} />
                    <span>IV Heparin Protocol Pre-Approved</span>
                  </button>

                  <button
                    onClick={() => setProtocolExecuted(prev => ({ ...prev, labsOrdered: !prev.labsOrdered }))}
                    className={`p-3 rounded-xl border flex items-center gap-2 font-semibold transition-all cursor-pointer text-left ${
                      protocolExecuted.labsOrdered ? 'bg-[#E8F0EC] text-[#0C4A3B] border-[#0C4A3B]' : 'bg-white text-gray-600 border-[#E6E2D8]'
                    }`}
                  >
                    <CheckCircle2 className={`w-4 h-4 shrink-0 ${protocolExecuted.labsOrdered ? 'text-[#0C4A3B]' : 'text-gray-400'}`} />
                    <span>Stat Troponin Biomarker Labs</span>
                  </button>
                </div>
              </div>

            </TiltCard>

            {/* Paramedic Audio Broadcast & Transcribed Feeds */}
            <div className="bg-[#1C2B22] text-white p-6 rounded-3xl shadow-xl space-y-4 border border-[#0C4A3B]">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2 text-[#72DFB4]">
                  <Radio className="w-5 h-5 animate-pulse" />
                  <h3 className="text-sm font-bold uppercase tracking-wider">Live Paramedic Audio Broadcast</h3>
                </div>
                <span className="text-xs text-gray-400">Unit: {activeCase.ambulanceUnit}</span>
              </div>

              <div className="bg-white/5 p-4 rounded-2xl border border-white/10 space-y-3">
                <div className="flex items-center justify-between text-xs text-gray-300">
                  <span className="font-semibold text-[#72DFB4]">Paramedic Voice Log (Indiranagar Route)</span>
                  <span className="font-mono text-[10px]">Transcribed 2 min ago</span>
                </div>
                <p className="text-xs italic text-gray-200 leading-relaxed bg-white/5 p-3 rounded-xl border border-white/10">
                  "Dr. Jenkins, we have patient {activeCase.patientName} in transit. ST elevation noted on ECG. Patient received 300mg Aspirin and 10L oxygen. ETA 3.4 minutes."
                </p>

                <div className="flex items-center gap-3 pt-1">
                  <button
                    onClick={() => setRadioIntercomActive(!radioIntercomActive)}
                    className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                      radioIntercomActive 
                        ? 'bg-[#D9532F] text-white animate-pulse' 
                        : 'bg-[#0C4A3B] text-white hover:bg-[#08362B]'
                    }`}
                  >
                    <Mic className="w-4 h-4" />
                    <span>{radioIntercomActive ? 'INTERCOM ACTIVE (SPEAKING...)' : 'Open Intercom to Driver'}</span>
                  </button>

                  <a
                    href={`tel:+15553920194`}
                    className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold flex items-center gap-2 text-decoration-none transition-colors"
                  >
                    <PhoneCall className="w-4 h-4 text-[#72DFB4]" />
                    <span>Direct Call Driver</span>
                  </a>
                </div>
              </div>
            </div>

          </div>

          {/* Right Column: Incoming Queue & ER Bed Layout Floor Plan (5 Cols) */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Incoming Emergency Dispatch Queue */}
            <TiltCard maxDegree={4} className="bg-white/90 backdrop-blur-md rounded-3xl p-6 border border-[#E6E2D8] shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-[#F2EEE6] pb-3">
                <h3 className="text-sm font-bold uppercase tracking-wider text-[#0C4A3B] flex items-center gap-2">
                  <Ambulance className="w-4 h-4 text-[#D9532F]" /> Incoming ER Dispatches ({cases.length})
                </h3>
                <span className="text-xs text-[#5F6B63]">Live Updates</span>
              </div>

              <div className="space-y-3">
                {cases.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => setSelectedCaseId(item.id)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col space-y-2 ${
                      selectedCaseId === item.id
                        ? 'bg-[#E8F0EC] border-[#0C4A3B] shadow-md ring-2 ring-[#0C4A3B]/30'
                        : 'bg-[#FAF8F5] border-[#E6E2D8] hover:bg-[#F2EEE6]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${item.badgeClass}`}>
                        {item.severity}
                      </span>
                      <span className="text-xs font-bold font-mono text-[#D9532F]">ETA: {item.eta}</span>
                    </div>

                    <div>
                      <h4 className="text-sm font-bold text-[#1C2B22]">{item.title}</h4>
                      <p className="text-xs text-gray-500">{item.patientName} ({item.ageGender}) • {item.ambulanceUnit}</p>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-[#0C4A3B] font-semibold pt-1 border-t border-black/5">
                      <span>{item.bedAssigned}</span>
                      <ChevronRight className="w-4 h-4 text-gray-400" />
                    </div>
                  </div>
                ))}
              </div>
            </TiltCard>

            {/* ER Bed Floor Plan Status Grid */}
            <TiltCard maxDegree={4} className="bg-white/90 backdrop-blur-md rounded-3xl p-6 border border-[#E6E2D8] shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-[#F2EEE6] pb-3">
                <h3 className="text-sm font-bold uppercase tracking-wider text-[#0C4A3B] flex items-center gap-2">
                  <BedDouble className="w-4 h-4 text-[#0C4A3B]" /> ER Bed Floor Plan Status
                </h3>
                <span className="text-xs font-bold text-[#0C4A3B] bg-[#E8F0EC] px-2 py-0.5 rounded">
                  3 Beds Avail
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                {beds.map((b) => {
                  let statusBg = 'bg-gray-100 text-gray-700 border-gray-200';
                  if (b.status.includes('Reserved')) statusBg = 'bg-[#E8F0EC] text-[#0C4A3B] border-[#0C4A3B]/40 font-bold';
                  if (b.status.includes('Occupied')) statusBg = 'bg-red-50 text-red-800 border-red-200 font-semibold';
                  if (b.status.includes('Available')) statusBg = 'bg-emerald-50 text-emerald-800 border-emerald-200';

                  return (
                    <div key={b.id} className={`p-3 rounded-xl border text-xs space-y-1 ${statusBg}`}>
                      <div className="flex items-center justify-between font-bold">
                        <span>{b.name}</span>
                        <span className="text-[9px] uppercase tracking-wider opacity-80">{b.type}</span>
                      </div>
                      <p className="text-[11px] truncate">{b.patient || b.status}</p>
                    </div>
                  );
                })}
              </div>
            </TiltCard>

            {/* Real Interactive Map Section */}
            <div className="bg-white/90 p-5 rounded-3xl border border-[#E6E2D8] shadow-xl space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#0C4A3B] flex items-center gap-2">
                  <Zap className="w-4 h-4 text-[#D9532F]" /> Live Ambulance Tracking Map
                </h4>
                <span className="text-[10px] font-bold text-[#0C4A3B] bg-[#E8F0EC] px-2 py-0.5 rounded"> Indiranagar Sector </span>
              </div>
              <RealMapTracker activeSOS={{ id: activeCase.sosId, location: activeCase.location, hospital: { name: doctorInfo.hospital } }} />
            </div>

          </div>

        </div>

      </main>

      {/* ER Doctor Footer */}
      <footer className="border-t border-[#EBE7DE] py-4 text-center text-xs text-[#5F6B63] bg-[#FAF8F5]">
        <p>MedAlert AI Emergency Central Command Portal • Hospital ER Network</p>
      </footer>

    </div>
  );
}
