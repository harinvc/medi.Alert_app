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
  Sparkles,
  Volume2,
  LayoutGrid
} from 'lucide-react';
import TiltCard from '../TiltCard';
import RealMapTracker from '../patient/RealMapTracker';

export default function DoctorDashboard({ doctorUser, onBackToLanding }) {
  const [selectedCaseId, setSelectedCaseId] = useState('case-1');
  const [radioIntercomActive, setRadioIntercomActive] = useState(false);
  const [incomingAudio, setIncomingAudio] = useState(false);
  const [activeSpeaker, setActiveSpeaker] = useState('Ambulance Unit #04');
  const [liveTranscript, setLiveTranscript] = useState('');
  const [activeTab, setActiveTab] = useState('active_triage'); // 'active_triage', 'radio', 'beds', 'queue', 'overview'

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

  // Real-time Push to Talk BroadcastChannel listener for incoming paramedic audio & speech transcript
  useEffect(() => {
    let channel = null;
    let audioQueue = [];
    let isPlaying = false;

    const playNextChunk = () => {
      if (audioQueue.length === 0) {
        isPlaying = false;
        return;
      }
      isPlaying = true;
      const dataUrl = audioQueue.shift();
      const audio = new Audio(dataUrl);
      audio.onended = () => playNextChunk();
      audio.onerror = () => playNextChunk();
      audio.play().catch(() => playNextChunk());
    };

    try {
      channel = new BroadcastChannel('medalert_er_radio');
      channel.onmessage = (event) => {
        const { type, audio, text, sender } = event.data;
        if (type === 'PTT_START') {
          setIncomingAudio(true);
          if (sender) setActiveSpeaker(sender);
        } else if (type === 'TRANSCRIPT' && text) {
          setLiveTranscript(text);
        } else if (type === 'AUDIO_CHUNK' && audio) {
          setIncomingAudio(true);
          if (sender) setActiveSpeaker(sender);
          audioQueue.push(audio);
          if (!isPlaying) playNextChunk();
        } else if (type === 'PTT_END') {
          setTimeout(() => {
            setIncomingAudio(false);
          }, 1800);
        }
      };
    } catch (e) {
      console.warn('BroadcastChannel notice:', e);
    }

    return () => {
      if (channel) channel.close();
    };
  }, []);

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

  // ER Bed Floor Plan Map (Beds 1-8)
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
    <div className="min-h-screen bg-[#F8F7F4] text-[#1C2B22] flex flex-col justify-between selection:bg-[#0C4A3B]/15 selection:text-[#0C4A3B]">
      
      {/* Top ER Command Navigation Bar */}
      <header className="sticky top-0 z-40 bg-[#0C4A3B] text-white border-b border-[#08362B] shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between gap-4">
          
          <div className="flex items-center gap-3">
            <button
              onClick={onBackToLanding}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors flex items-center gap-1.5 text-xs font-semibold cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Landing</span>
            </button>

            <div className="h-6 w-[1px] bg-white/20"></div>

            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-white text-[#0C4A3B] flex items-center justify-center shadow-sm">
                <Stethoscope className="w-5 h-5 text-[#0C4A3B]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-serif-heading text-lg font-bold text-white tracking-tight">Hospital ER Portal</span>
                  <span className="text-[10px] bg-[#72DFB4] text-[#0C4A3B] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider font-mono shadow-sm">
                    LIVE TRIAGE COMMAND
                  </span>
                </div>
                <p className="text-xs text-emerald-100 hidden md:block">{doctorInfo.name} • {doctorInfo.title}</p>
              </div>
            </div>
          </div>

          {/* Right Doctor Controls */}
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
              <LogOut className="w-4 h-4" />
            </button>
          </div>

        </div>
      </header>

      {/* Main Content Body */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-grow w-full space-y-6">
        
        {/* Real-time Incoming Audio Stream Alert Banner */}
        {incomingAudio && (
          <div className="bg-[#D9532F] text-white p-4 rounded-2xl shadow-lg animate-pulse flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-2 border-white/40">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white text-[#D9532F] flex items-center justify-center font-bold shadow shrink-0">
                <Mic className="w-6 h-6 animate-ping text-[#D9532F]" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold tracking-widest bg-white/20 px-2 py-0.5 rounded text-white">
                  🔴 LIVE PARAMEDIC VOICE TELEMETRY
                </span>
                <h4 className="text-sm font-bold text-white">Incoming Broadcast: {activeSpeaker}</h4>
                {liveTranscript && (
                  <p className="text-xs font-mono text-yellow-200 mt-1">"{liveTranscript}"</p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <span className="text-xs font-bold font-mono text-white mr-2">PLAYING AUDIO OUT LOUD</span>
              <div className="w-1.5 h-6 bg-white rounded-full animate-bounce"></div>
              <div className="w-1.5 h-8 bg-white rounded-full animate-bounce delay-100"></div>
              <div className="w-1.5 h-4 bg-white rounded-full animate-bounce delay-200"></div>
            </div>
          </div>
        )}

        {/* Unified Active Incoming Emergency Summary Banner */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-[#E5E2D9] shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          
          <div className="space-y-1.5 max-w-xl">
            <div className="flex items-center gap-2">
              <span className="px-3 py-0.5 rounded-full bg-[#D9532F] text-white font-bold text-[10px] uppercase tracking-widest flex items-center gap-1.5 shadow-sm">
                <span className="w-2 h-2 rounded-full bg-white animate-ping"></span>
                PRIORITY RED LEVEL-1
              </span>
              <span className="text-xs text-[#0C4A3B] font-bold bg-[#E8F0EC] px-2.5 py-0.5 rounded-full">Unit: {activeCase.ambulanceUnit}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-serif-heading font-bold text-[#1C2B22]">
              {activeCase.title} — {activeCase.patientName} ({activeCase.ageGender})
            </h2>
            <p className="text-xs sm:text-sm text-[#5F6B63]">
              Transported by {activeCase.ambulanceUnit} ({activeCase.driverName}) • Pick-up: {activeCase.location}
            </p>
          </div>

          {/* Incoming ETA Countdown Box */}
          <div className="bg-[#0C4A3B] text-white px-6 py-4 rounded-2xl shadow text-center shrink-0 border border-[#72DFB4]/30 w-full md:w-auto">
            <span className="text-[10px] uppercase font-bold text-[#72DFB4] block">INCOMING ER ETA</span>
            <span className="text-3xl sm:text-4xl font-bold font-mono text-white">{activeCase.eta}</span>
            <span className="text-[10px] text-emerald-100 block mt-0.5">{activeCase.bedAssigned}</span>
          </div>

        </div>

        {/* Clear View Switcher Tabs */}
        <div className="flex items-center justify-between border-b border-[#E5E2D9] pb-3">
          <div className="flex items-center gap-2 overflow-x-auto py-1 scrollbar-none">
            <button
              onClick={() => setActiveTab('active_triage')}
              className={`px-4 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'active_triage'
                  ? 'bg-[#0C4A3B] text-white shadow'
                  : 'bg-white text-[#5F6B63] hover:bg-gray-100 border border-[#E5E2D9]'
              }`}
            >
              <Activity className="w-4 h-4 text-[#D9532F]" />
              <span>🚨 Active Patient Triage</span>
            </button>

            <button
              onClick={() => setActiveTab('radio')}
              className={`px-4 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'radio'
                  ? 'bg-[#0C4A3B] text-white shadow'
                  : 'bg-white text-[#5F6B63] hover:bg-gray-100 border border-[#E5E2D9]'
              }`}
            >
              <Radio className="w-4 h-4 text-[#0C4A3B]" />
              <span>🎙️ Paramedic Radio & Speech</span>
            </button>

            <button
              onClick={() => setActiveTab('beds')}
              className={`px-4 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'beds'
                  ? 'bg-[#0C4A3B] text-white shadow'
                  : 'bg-white text-[#5F6B63] hover:bg-gray-100 border border-[#E5E2D9]'
              }`}
            >
              <BedDouble className="w-4 h-4 text-[#0C4A3B]" />
              <span>🛏️ ER Bed Floor Plan</span>
            </button>

            <button
              onClick={() => setActiveTab('queue')}
              className={`px-4 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'queue'
                  ? 'bg-[#0C4A3B] text-white shadow'
                  : 'bg-white text-[#5F6B63] hover:bg-gray-100 border border-[#E5E2D9]'
              }`}
            >
              <Users className="w-4 h-4 text-[#0C4A3B]" />
              <span>📋 Emergency Triage Queue</span>
            </button>

            <button
              onClick={() => setActiveTab('overview')}
              className={`px-4 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'overview'
                  ? 'bg-[#0C4A3B] text-white shadow'
                  : 'bg-white text-[#5F6B63] hover:bg-gray-100 border border-[#E5E2D9]'
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
              <span>📊 Full Command Overview</span>
            </button>
          </div>

          <span className="text-xs text-[#5F6B63] font-medium hidden md:block">
            View: <strong className="text-[#0C4A3B] uppercase">{activeTab}</strong>
          </span>
        </div>

        {/* TAB 1: ACTIVE PATIENT TRIAGE (DEFAULT VIEW) */}
        {activeTab === 'active_triage' && (
          <div className="space-y-6">
            <div className="bg-white rounded-3xl p-6 border border-[#E5E2D9] shadow-sm space-y-6">
              
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#F2EEE6] pb-4">
                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${activeCase.badgeClass}`}>
                    PRIORITY {activeCase.severity}
                  </span>
                  <div>
                    <h3 className="text-lg font-bold text-[#1C2B22]">MedAlert AI Medical Triage Summary</h3>
                    <p className="text-xs text-gray-500">Emergency SOS #{activeCase.sosId}</p>
                  </div>
                </div>

                <div className="bg-[#E8F0EC] text-[#0C4A3B] px-3.5 py-1.5 rounded-full text-xs font-bold border border-[#0C4A3B]/20">
                  Assigned: {activeCase.bedAssigned}
                </div>
              </div>

              {/* AI Diagnosis Box */}
              <div className="bg-[#0C4A3B] text-white p-5 rounded-2xl space-y-2 border border-[#72DFB4]/30 shadow">
                <div className="flex items-center justify-between text-xs text-[#72DFB4]">
                  <span className="font-bold uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-[#72DFB4]" /> Automated AI Triage Analysis
                  </span>
                  <span>Synced Live</span>
                </div>
                <p className="text-sm leading-relaxed text-gray-100">{activeCase.aiSummary}</p>
              </div>

              {/* AI Emergency Pre-Arrival Medication Orders */}
              <div className="bg-[#FAF9F6] p-4.5 rounded-2xl border border-[#E5E2D9] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#0C4A3B] flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-[#0C4A3B]" /> AI Emergency Pre-Arrival Medication Pre-Approvals
                  </span>
                  <span className="text-[10px] font-mono bg-[#E8F0EC] text-[#0C4A3B] font-bold px-2 py-0.5 rounded">
                    DIRECT PARAMEDIC BROADCAST
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
                  <button
                    onClick={() => {
                      setProtocolExecuted(prev => ({ ...prev, heparinApproved: true }));
                      try {
                        const ch = new BroadcastChannel('medalert_er_radio');
                        ch.postMessage({ type: 'TRANSCRIPT', text: `DR. JENKINS: IV Heparin 5,000 Units protocol APPROVED by ER Lead.`, sender: `Dr. Sarah Jenkins` });
                        ch.close();
                      } catch(e) {}
                    }}
                    className="p-3 rounded-xl bg-white border border-[#0C4A3B]/30 hover:bg-[#E8F0EC] transition-all font-semibold text-[#0C4A3B] flex items-center gap-2 cursor-pointer text-left"
                  >
                    <span className="w-2 h-2 rounded-full bg-[#0C4A3B]"></span>
                    <div>
                      <strong className="block text-xs">Stat IV Heparin</strong>
                      <span className="text-[10px] text-gray-500">5,000 Units Bolus</span>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      try {
                        const ch = new BroadcastChannel('medalert_er_radio');
                        ch.postMessage({ type: 'TRANSCRIPT', text: `DR. JENKINS: Sublingual Nitroglycerin 0.4mg APPROVED for chest pain relief.`, sender: `Dr. Sarah Jenkins` });
                        ch.close();
                      } catch(e) {}
                    }}
                    className="p-3 rounded-xl bg-white border border-[#0C4A3B]/30 hover:bg-[#E8F0EC] transition-all font-semibold text-[#0C4A3B] flex items-center gap-2 cursor-pointer text-left"
                  >
                    <span className="w-2 h-2 rounded-full bg-[#0C4A3B]"></span>
                    <div>
                      <strong className="block text-xs">Sublingual Nitro</strong>
                      <span className="text-[10px] text-gray-500">0.4mg Tab (Check BP)</span>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      setProtocolExecuted(prev => ({ ...prev, labsOrdered: true }));
                      try {
                        const ch = new BroadcastChannel('medalert_er_radio');
                        ch.postMessage({ type: 'TRANSCRIPT', text: `DR. JENKINS: Stat Cardiac Troponin I Lab Panel ordered for immediate arrival.`, sender: `Dr. Sarah Jenkins` });
                        ch.close();
                      } catch(e) {}
                    }}
                    className="p-3 rounded-xl bg-white border border-[#0C4A3B]/30 hover:bg-[#E8F0EC] transition-all font-semibold text-[#0C4A3B] flex items-center gap-2 cursor-pointer text-left"
                  >
                    <span className="w-2 h-2 rounded-full bg-[#0C4A3B]"></span>
                    <div>
                      <strong className="block text-xs">Stat Troponin I Labs</strong>
                      <span className="text-[10px] text-gray-500">High-Sensitivity Assay</span>
                    </div>
                  </button>
                </div>
              </div>

              {/* In-Transit Vitals Grid */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#0C4A3B]">Real-Time In-Transit Patient Vitals</h4>
                
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div className="bg-red-50 p-4 rounded-2xl border border-red-200 text-center space-y-1">
                    <span className="text-red-600 block text-[10px] font-bold uppercase">Heart Rate</span>
                    <span className="text-2xl font-bold font-mono text-red-900">{activeCase.vitals.hr} <span className="text-xs font-normal">BPM</span></span>
                    <span className="text-[10px] text-red-700 block">ELEVATED</span>
                  </div>
                  
                  <div className="bg-blue-50 p-4 rounded-2xl border border-blue-200 text-center space-y-1">
                    <span className="text-blue-600 block text-[10px] font-bold uppercase">Blood Pressure</span>
                    <span className="text-2xl font-bold font-mono text-blue-900">{activeCase.vitals.bp}</span>
                    <span className="text-[10px] text-blue-700 block">SYSTOLIC HIGH</span>
                  </div>

                  <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-200 text-center space-y-1">
                    <span className="text-emerald-600 block text-[10px] font-bold uppercase">SpO2 Oxygen</span>
                    <span className="text-2xl font-bold font-mono text-emerald-900">{activeCase.vitals.spo2}%</span>
                    <span className="text-[10px] text-emerald-700 block">O2 MASK ACTIVE</span>
                  </div>

                  <div className="bg-amber-50 p-4 rounded-2xl border border-amber-200 text-center space-y-1">
                    <span className="text-amber-600 block text-[10px] font-bold uppercase">Respiratory Rate</span>
                    <span className="text-2xl font-bold font-mono text-amber-900">{activeCase.vitals.rr} <span className="text-xs font-normal">/min</span></span>
                    <span className="text-[10px] text-amber-700 block">TACHYPNEA</span>
                  </div>
                </div>
              </div>

              {/* ECG Lead Stream */}
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

              {/* Doctor Action Checklist */}
              <div className="space-y-3 pt-2 border-t border-[#F2EEE6]">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#0C4A3B] flex items-center gap-2">
                  <CheckSquare className="w-4 h-4 text-[#0C4A3B]" /> Emergency ER Pre-Arrival Protocol Verification
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <button
                    onClick={() => setProtocolExecuted(prev => ({ ...prev, bedLocked: !prev.bedLocked }))}
                    className={`p-3.5 rounded-2xl border flex items-center gap-2.5 font-semibold transition-all cursor-pointer text-left ${
                      protocolExecuted.bedLocked ? 'bg-[#E8F0EC] text-[#0C4A3B] border-[#0C4A3B]' : 'bg-white text-gray-600 border-[#E5E2D9]'
                    }`}
                  >
                    <CheckCircle2 className={`w-4 h-4 shrink-0 ${protocolExecuted.bedLocked ? 'text-[#0C4A3B]' : 'text-gray-400'}`} />
                    <span>Cardiology Bed #4 Locked & Reserved</span>
                  </button>

                  <button
                    onClick={() => setProtocolExecuted(prev => ({ ...prev, cathLabAlerted: !prev.cathLabAlerted }))}
                    className={`p-3.5 rounded-2xl border flex items-center gap-2.5 font-semibold transition-all cursor-pointer text-left ${
                      protocolExecuted.cathLabAlerted ? 'bg-[#E8F0EC] text-[#0C4A3B] border-[#0C4A3B]' : 'bg-white text-gray-600 border-[#E5E2D9]'
                    }`}
                  >
                    <CheckCircle2 className={`w-4 h-4 shrink-0 ${protocolExecuted.cathLabAlerted ? 'text-[#0C4A3B]' : 'text-gray-400'}`} />
                    <span>Cath Lab On-Call Team Alerted</span>
                  </button>

                  <button
                    onClick={() => setProtocolExecuted(prev => ({ ...prev, heparinApproved: !prev.heparinApproved }))}
                    className={`p-3.5 rounded-2xl border flex items-center gap-2.5 font-semibold transition-all cursor-pointer text-left ${
                      protocolExecuted.heparinApproved ? 'bg-[#E8F0EC] text-[#0C4A3B] border-[#0C4A3B]' : 'bg-white text-gray-600 border-[#E5E2D9]'
                    }`}
                  >
                    <CheckCircle2 className={`w-4 h-4 shrink-0 ${protocolExecuted.heparinApproved ? 'text-[#0C4A3B]' : 'text-gray-400'}`} />
                    <span>IV Heparin Protocol Pre-Approved</span>
                  </button>

                  <button
                    onClick={() => setProtocolExecuted(prev => ({ ...prev, labsOrdered: !prev.labsOrdered }))}
                    className={`p-3.5 rounded-2xl border flex items-center gap-2.5 font-semibold transition-all cursor-pointer text-left ${
                      protocolExecuted.labsOrdered ? 'bg-[#E8F0EC] text-[#0C4A3B] border-[#0C4A3B]' : 'bg-white text-gray-600 border-[#E5E2D9]'
                    }`}
                  >
                    <CheckCircle2 className={`w-4 h-4 shrink-0 ${protocolExecuted.labsOrdered ? 'text-[#0C4A3B]' : 'text-gray-400'}`} />
                    <span>Stat Troponin Biomarker Labs</span>
                  </button>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* TAB 2: PARAMEDIC RADIO & VOICE */}
        {activeTab === 'radio' && (
          <div className="space-y-6">
            <div className="bg-white rounded-3xl p-6 border border-[#E5E2D9] shadow-sm space-y-6">
              
              <div className="flex items-center justify-between border-b border-[#F2EEE6] pb-4">
                <div className="flex items-center gap-2 text-[#0C4A3B]">
                  <Radio className="w-6 h-6 text-[#0C4A3B]" />
                  <div>
                    <h2 className="text-xl font-serif-heading font-bold text-[#1C2B22]">Live Paramedic Audio Broadcast & Transcripts</h2>
                    <p className="text-xs text-[#5F6B63]">Active Link to {activeCase.ambulanceUnit} ({activeCase.driverName})</p>
                  </div>
                </div>
                <span className="text-xs font-mono font-bold bg-[#E8F0EC] text-[#0C4A3B] px-3 py-1 rounded-full">Freq: 462.775 MHz</span>
              </div>

              {/* Radio Box */}
              <div className="bg-[#1C2B22] text-white p-6 rounded-3xl space-y-4 border border-[#0C4A3B]">
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <span className="font-semibold text-sm text-[#72DFB4]">Paramedic Voice Feed & Live Transcript</span>
                  <span className="font-mono text-xs text-gray-300">{incomingAudio ? '🔴 LIVE VOICE TRANSMISSION' : 'Channel Active'}</span>
                </div>

                <div className="bg-black/40 p-4 rounded-2xl border border-white/10 space-y-2">
                  <span className="text-[10px] uppercase font-bold text-[#72DFB4] font-mono block">LIVE SPEECH-TO-TEXT TRANSCRIPT:</span>
                  <p className="text-sm font-mono text-white leading-relaxed">
                    "{liveTranscript || `"Dr. Jenkins, we have patient ${activeCase.patientName} in transit. ST elevation noted on ECG. Patient received 300mg Aspirin and 10L oxygen. ETA 3.4 minutes."`}"
                  </p>
                </div>

                <div className="pt-2 flex items-center gap-3">
                  <button
                    onClick={() => setRadioIntercomActive(!radioIntercomActive)}
                    className={`px-5 py-3 rounded-2xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                      radioIntercomActive || incomingAudio
                        ? 'bg-[#D9532F] text-white animate-pulse' 
                        : 'bg-[#0C4A3B] text-white hover:bg-[#08362B]'
                    }`}
                  >
                    <Radio className="w-4 h-4" />
                    <span>{incomingAudio ? 'RECEIVING LIVE PARAMEDIC AUDIO STREAM' : radioIntercomActive ? 'INTERCOM CONNECTED' : 'OPEN INTERCOM TO AMBULANCE'}</span>
                  </button>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* TAB 3: ER BED FLOOR PLAN MAP */}
        {activeTab === 'beds' && (
          <div className="space-y-6">
            <div className="bg-white rounded-3xl p-6 border border-[#E5E2D9] shadow-sm space-y-6">
              
              <div className="flex items-center justify-between border-b border-[#F2EEE6] pb-4">
                <div className="flex items-center gap-2 text-[#0C4A3B]">
                  <BedDouble className="w-6 h-6 text-[#0C4A3B]" />
                  <div>
                    <h2 className="text-xl font-serif-heading font-bold text-[#1C2B22]">Emergency Department Bed Floor Plan</h2>
                    <p className="text-xs text-[#5F6B63]">Real-time bed availability & lock status</p>
                  </div>
                </div>
                <span className="text-xs font-mono font-bold bg-gray-100 text-gray-700 px-3 py-1 rounded-full">8 Beds Total</span>
              </div>

              {/* Bed Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {beds.map((b) => (
                  <div
                    key={b.id}
                    className={`p-5 rounded-2xl border space-y-2 ${
                      b.status.includes('Reserved')
                        ? 'bg-[#E8F0EC] border-[#0C4A3B] text-[#0C4A3B] font-semibold shadow-sm'
                        : b.status === 'Occupied'
                        ? 'bg-red-50 border-red-200 text-red-900'
                        : b.status === 'Available'
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                        : 'bg-gray-50 border-gray-200 text-gray-600'
                    }`}
                  >
                    <div className="flex items-center justify-between font-bold text-sm">
                      <span>{b.name}</span>
                      <span className="text-xs opacity-75">{b.type}</span>
                    </div>
                    <p className="text-xs font-bold truncate">{b.patient || b.status}</p>
                    <span className="text-[10px] font-mono uppercase block text-gray-500">{b.status}</span>
                  </div>
                ))}
              </div>

            </div>
          </div>
        )}

        {/* TAB 4: TRIAGE CASE QUEUE */}
        {activeTab === 'queue' && (
          <div className="space-y-6">
            <div className="bg-white rounded-3xl p-6 border border-[#E5E2D9] shadow-sm space-y-4">
              
              <div className="flex items-center justify-between border-b border-[#F2EEE6] pb-4">
                <div className="flex items-center gap-2 text-[#0C4A3B]">
                  <Users className="w-6 h-6 text-[#D9532F]" />
                  <div>
                    <h2 className="text-xl font-serif-heading font-bold text-[#1C2B22]">Emergency Triage Queue</h2>
                    <p className="text-xs text-[#5F6B63]">Incoming units sorted by priority</p>
                  </div>
                </div>
                <span className="text-xs font-bold text-gray-600 font-mono">{cases.length} Active Cases</span>
              </div>

              <div className="space-y-3">
                {cases.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setSelectedCaseId(c.id)}
                    className={`w-full p-4 rounded-2xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                      selectedCaseId === c.id
                        ? 'bg-[#0C4A3B] text-white border-[#0C4A3B] shadow'
                        : 'bg-[#FAF9F6] text-[#1C2B22] border-[#E5E2D9] hover:bg-gray-100'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${c.badgeClass}`}>
                          {c.severity}
                        </span>
                        <span className="text-sm font-bold">{c.patientName} ({c.ageGender})</span>
                      </div>
                      <p className={`text-xs ${selectedCaseId === c.id ? 'text-gray-200' : 'text-gray-600'}`}>
                        {c.title} • {c.ambulanceUnit} ({c.driverName})
                      </p>
                    </div>

                    <div className="text-right space-y-0.5">
                      <span className={`text-sm font-mono font-bold block ${selectedCaseId === c.id ? 'text-[#72DFB4]' : 'text-[#D9532F]'}`}>
                        ETA {c.eta}
                      </span>
                      <span className={`text-xs block ${selectedCaseId === c.id ? 'text-gray-300' : 'text-gray-500'}`}>
                        {c.bedAssigned}
                      </span>
                    </div>
                  </button>
                ))}
              </div>

            </div>
          </div>
        )}

        {/* TAB 5: FULL COMMAND OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Left Column (7 Cols) */}
            <div className="lg:col-span-7 space-y-6">
              
              <TiltCard maxDegree={3} className="bg-white rounded-3xl p-6 border border-[#E5E2D9] shadow-sm space-y-6">
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

                <div className="bg-[#0C4A3B] text-white p-5 rounded-2xl space-y-2 border border-[#72DFB4]/30">
                  <div className="flex items-center justify-between text-xs text-[#72DFB4]">
                    <span className="font-bold uppercase tracking-wider flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-[#72DFB4]" /> MedAlert Intelligence Diagnosis
                    </span>
                    <span>Synced Live</span>
                  </div>
                  <p className="text-sm leading-relaxed text-gray-100">{activeCase.aiSummary}</p>
                </div>

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
              </TiltCard>

            </div>

            {/* Right Column (5 Cols) */}
            <div className="lg:col-span-5 space-y-6">
              
              <div className="bg-white rounded-3xl p-5 border border-[#E5E2D9] shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-[#F2EEE6] pb-3">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-[#0C4A3B] flex items-center gap-2">
                    <Users className="w-4 h-4 text-[#D9532F]" /> Emergency Triage Queue
                  </h3>
                  <span className="text-xs font-bold text-gray-500 font-mono">{cases.length} Active Units</span>
                </div>

                <div className="space-y-2.5">
                  {cases.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => setSelectedCaseId(c.id)}
                      className={`w-full p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                        selectedCaseId === c.id
                          ? 'bg-[#0C4A3B] text-white border-[#0C4A3B] shadow'
                          : 'bg-[#FAF9F6] text-[#1C2B22] border-[#E5E2D9] hover:bg-gray-100'
                      }`}
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] font-bold px-2 py-0.2 rounded-full ${c.badgeClass}`}>
                            {c.severity}
                          </span>
                          <span className="text-xs font-bold">{c.patientName}</span>
                        </div>
                        <p className={`text-[11px] ${selectedCaseId === c.id ? 'text-gray-200' : 'text-gray-500'}`}>
                          {c.title} • {c.ambulanceUnit}
                        </p>
                      </div>

                      <div className="text-right">
                        <span className={`text-xs font-mono font-bold block ${selectedCaseId === c.id ? 'text-[#72DFB4]' : 'text-[#D9532F]'}`}>
                          {c.eta}
                        </span>
                        <span className={`text-[10px] ${selectedCaseId === c.id ? 'text-gray-300' : 'text-gray-400'}`}>
                          {c.bedAssigned}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

            </div>

          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="border-t border-[#E5E2D9] py-4 text-center text-xs text-[#5F6B63] bg-white">
        <p>MedAlert AI Emergency Department Triage System • Encrypted HIPAA Telemetry</p>
      </footer>

    </div>
  );
}
