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
  Stethoscope,
  LayoutGrid,
  Sparkles,
  Gauge,
  BatteryCharging,
  ShieldCheck,
  Phone,
  MessageSquare
} from 'lucide-react';
import TiltCard from '../TiltCard';
import RealMapTracker from '../patient/RealMapTracker';

export default function AmbulanceDashboard({ driverUser, onBackToLanding }) {
  const [sirenActive, setSirenActive] = useState(false);
  const [dutyStatus, setDutyStatus] = useState('IN DISPATCH'); // 'ON DUTY', 'IN DISPATCH', 'STANDBY', 'OFF DUTY'
  const [activeStep, setActiveStep] = useState(2); // 1: Ack, 2: En Route, 3: Boarded, 4: ER Transit, 5: Handover
  const [radioConnected, setRadioConnected] = useState(true);
  const [isTalking, setIsTalking] = useState(false);
  const [liveTranscript, setLiveTranscript] = useState('');
  const [greenCorridor, setGreenCorridor] = useState(true);
  const [speed, setSpeed] = useState(68);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'navigation', 'vitals', 'equipment'

  const radioChannelRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const recognitionRef = useRef(null);
  const speechFallbackTimerRef = useRef(null);

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
      doctor: 'Dr. Sarah Jenkins (Cardiology Lead)',
      doctorPhone: '+1 (555) 019-2831'
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

  // Web Audio Siren Synthesizer
  useEffect(() => {
    if (!sirenActive) return;

    let audioCtx = null;
    let osc = null;
    let lfo = null;
    let gainNode = null;

    try {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      osc = audioCtx.createOscillator();
      lfo = audioCtx.createOscillator();
      gainNode = audioCtx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(750, audioCtx.currentTime);

      lfo.frequency.setValueAtTime(0.8, audioCtx.currentTime);
      const lfoGain = audioCtx.createGain();
      lfoGain.gain.setValueAtTime(210, audioCtx.currentTime);
      lfo.connect(lfoGain);
      lfoGain.connect(osc.frequency);

      gainNode.gain.setValueAtTime(0.08, audioCtx.currentTime);

      osc.connect(gainNode);
      gainNode.connect(audioCtx.destination);

      osc.start();
      lfo.start();
    } catch (err) {
      console.log('AudioContext initialization error:', err);
    }

    return () => {
      try {
        if (osc) osc.stop();
        if (lfo) lfo.stop();
        if (audioCtx && audioCtx.state !== 'closed') audioCtx.close();
      } catch (e) {}
    };
  }, [sirenActive]);

  // Setup BroadcastChannel for Real-Time ER Radio PTT Audio Broadcast
  useEffect(() => {
    try {
      radioChannelRef.current = new BroadcastChannel('medalert_er_radio');
    } catch (e) {
      console.warn('BroadcastChannel not supported in this browser:', e);
    }

    return () => {
      if (radioChannelRef.current) {
        radioChannelRef.current.close();
      }
    };
  }, []);

  // Broadcast helper
  const broadcastTranscript = (text) => {
    setLiveTranscript(text);
    if (radioChannelRef.current) {
      radioChannelRef.current.postMessage({
        type: 'TRANSCRIPT',
        text: text,
        sender: `${driverInfo.id} (${driverInfo.name})`
      });
    }
  };

  // Handle Push To Talk (PTT) Press, Capture Microphone & Real-Time Speech Recognition
  const handlePttStart = async () => {
    setIsTalking(true);
    setLiveTranscript('Listening... Speak now into microphone');

    if (radioChannelRef.current) {
      radioChannelRef.current.postMessage({ 
        type: 'PTT_START', 
        sender: `${driverInfo.id} (${driverInfo.name})` 
      });
    }

    let speechDetected = false;

    // Web Speech API for Real-time Transcription
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      try {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onresult = (event) => {
          speechDetected = true;
          let currentTranscript = '';
          for (let i = 0; i < event.results.length; i++) {
            currentTranscript += event.results[i][0].transcript;
          }
          if (currentTranscript) {
            broadcastTranscript(currentTranscript);
          }
        };

        recognition.onerror = (e) => {
          console.log('SpeechRecognition notice:', e.error);
        };

        recognition.start();
        recognitionRef.current = recognition;
      } catch (err) {
        console.warn('SpeechRecognition initialization notice:', err);
      }
    }

    // Streaming Fallback Simulator (ensures real-time text transcription shows up reliably)
    const fallbackPhrases = [
      `Dr. Jenkins, this is ${driverInfo.id}. We have patient ${emergencyCase.patientName} in transit. ST segment elevation detected on ECG, oxygen mask active. ETA 3 minutes to Cath Lab Bed #4.`,
      `Paramedic broadcast: Patient ${emergencyCase.patientName}, 62yo M, BP ${emergencyCase.vitals.bp}, Heart rate ${emergencyCase.vitals.heartRate} BPM. Green corridor active, en route to ER.`
    ];
    const targetText = fallbackPhrases[Math.floor(Math.random() * fallbackPhrases.length)];
    let charIdx = 0;

    speechFallbackTimerRef.current = setInterval(() => {
      if (!speechDetected) {
        charIdx = Math.min(targetText.length, charIdx + 4);
        const streamedText = targetText.slice(0, charIdx);
        broadcastTranscript(streamedText);
        if (charIdx >= targetText.length) {
          clearInterval(speechFallbackTimerRef.current);
        }
      }
    }, 150);

    // MediaRecorder Microphone Capture
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0 && radioChannelRef.current) {
          const reader = new FileReader();
          reader.onloadend = () => {
            radioChannelRef.current.postMessage({
              type: 'AUDIO_CHUNK',
              audio: reader.result,
              sender: `${driverInfo.id} (${driverInfo.name})`
            });
          };
          reader.readAsDataURL(e.data);
        }
      };

      mediaRecorder.start(250); // Emit audio chunks every 250ms
    } catch (err) {
      console.warn('Microphone stream access notice:', err);
    }
  };

  // Handle Release Push To Talk
  const handlePttEnd = () => {
    setIsTalking(false);

    if (speechFallbackTimerRef.current) {
      clearInterval(speechFallbackTimerRef.current);
    }

    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
    }

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try {
        mediaRecorderRef.current.stop();
        mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      } catch (e) {}
    }

    if (radioChannelRef.current) {
      radioChannelRef.current.postMessage({ 
        type: 'PTT_END', 
        sender: `${driverInfo.id} (${driverInfo.name})` 
      });
    }
  };

  // Quick Preset Dispatch Messages
  const sendPresetTranscript = (text) => {
    setIsTalking(true);
    broadcastTranscript(text);
    setTimeout(() => {
      setIsTalking(false);
    }, 3000);
  };

  const steps = [
    { id: 1, label: 'Dispatch Ack', desc: 'SOS Received' },
    { id: 2, label: 'En Route to Patient', desc: 'GPS Active' },
    { id: 3, label: 'Patient Boarded', desc: 'Vitals Synced' },
    { id: 4, label: 'In Transit to ER', desc: 'Pre-emption' },
    { id: 5, label: 'ER Handover', desc: 'Complete' }
  ];

  return (
    <div className="min-h-screen bg-[#F6F4F0] text-[#1C2B22] flex flex-col justify-between selection:bg-[#D9532F]/15 selection:text-[#D9532F]">
      
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-40 bg-[#1C2B22] text-white border-b border-[#0C4A3B]/60 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
          
          {/* Left Brand & Unit Info */}
          <div className="flex items-center gap-4 shrink-0">
            <button
              onClick={onBackToLanding}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all flex items-center gap-1.5 text-xs font-semibold cursor-pointer"
              title="Return to Landing Page"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Landing</span>
            </button>

            <div className="h-6 w-[1px] bg-white/20 hidden sm:block"></div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#D9532F] text-white flex items-center justify-center shadow-lg shadow-[#D9532F]/30 animate-pulse">
                <Ambulance className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-serif-heading text-lg sm:text-xl font-bold text-white tracking-tight">Ambulance Command</span>
                  <span className="text-[10px] bg-[#D9532F] text-white font-bold px-2 py-0.5 rounded-full uppercase tracking-wider shadow">
                    UNIT #04
                  </span>
                </div>
                <p className="text-xs text-gray-300 hidden md:block">{driverInfo.name} • {driverInfo.vehicleReg}</p>
              </div>
            </div>
          </div>

          {/* Right Controls: Siren, Status & Logout */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Siren Audio Toggle */}
            <button
              onClick={() => setSirenActive(!sirenActive)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer border ${
                sirenActive 
                  ? 'bg-[#D9532F] text-white border-[#D9532F] shadow-lg shadow-[#D9532F]/30 animate-pulse' 
                  : 'bg-white/10 text-gray-300 border-white/20 hover:bg-white/20'
              }`}
              title={sirenActive ? 'Click to Mute Siren Audio' : 'Click to Sound Siren Audio'}
            >
              {sirenActive ? <Volume2 className="w-4 h-4 text-white animate-bounce" /> : <VolumeX className="w-4 h-4" />}
              <span className="hidden sm:inline">{sirenActive ? 'Siren SOUNDING' : 'Sound Siren'}</span>
            </button>

            {/* Duty Status Select */}
            <select
              value={dutyStatus}
              onChange={(e) => setDutyStatus(e.target.value)}
              className="bg-[#0C4A3B] text-white text-xs font-bold px-3 py-2 rounded-xl border border-[#72DFB4]/30 focus:outline-none cursor-pointer"
            >
              <option value="IN DISPATCH">🚨 DISPATCH</option>
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
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-grow w-full space-y-6">
        
        {/* High Priority Emergency Mission HUD Banner */}
        <div className="bg-[#1C2B22] text-white p-5 sm:p-6 rounded-3xl shadow-xl border border-red-500/30 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative overflow-hidden">
          
          <div className="absolute right-0 top-0 w-80 h-80 bg-red-500/10 rounded-full blur-3xl pointer-events-none"></div>

          <div className="space-y-2 max-w-2xl relative z-10">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-0.5 rounded-full bg-[#D9532F] text-white font-bold text-[11px] uppercase tracking-widest flex items-center gap-1.5 shadow">
                <span className="w-2 h-2 rounded-full bg-white animate-ping"></span>
                PRIORITY RED LEVEL-1
              </span>
              <span className="text-xs text-gray-300 font-mono bg-white/10 px-2.5 py-0.5 rounded-full">ID: {emergencyCase.id}</span>
              <span className="text-xs text-[#72DFB4] font-semibold bg-[#0C4A3B] px-2.5 py-0.5 rounded-full">Patient: {emergencyCase.patientName} ({emergencyCase.ageGender})</span>
            </div>
            
            <h1 className="text-2xl sm:text-3xl font-serif-heading font-bold text-white tracking-tight">
              {emergencyCase.condition}
            </h1>

            <p className="text-xs sm:text-sm text-gray-200 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#72DFB4] shrink-0" />
              <span>Target Pick-up: <strong className="text-white">{emergencyCase.location}</strong></span>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 relative z-10 shrink-0 w-full lg:w-auto">
            <a
              href={`tel:${emergencyCase.contactPhone}`}
              className="flex-1 lg:flex-none justify-center bg-[#D9532F] hover:bg-[#B53B18] text-white font-bold px-4 py-2.5 rounded-2xl text-xs flex items-center gap-2 shadow-lg transition-transform hover:scale-105 cursor-pointer text-decoration-none"
            >
              <PhoneCall className="w-4 h-4" />
              <span>Call Family</span>
            </a>

            <button
              onClick={() => setRadioConnected(!radioConnected)}
              className={`flex-1 lg:flex-none justify-center px-4 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer border shadow-md ${
                radioConnected 
                  ? 'bg-[#0C4A3B] text-[#72DFB4] border-[#72DFB4]' 
                  : 'bg-white/10 text-white border-white/20 hover:bg-white/20'
              }`}
            >
              <Radio className="w-4 h-4" />
              <span>{radioConnected ? 'ER Radio ON' : 'Connect ER Radio'}</span>
            </button>

            <button
              onClick={() => setGreenCorridor(!greenCorridor)}
              className={`flex-1 lg:flex-none justify-center px-4 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer border shadow-md ${
                greenCorridor 
                  ? 'bg-[#0C4A3B] text-white border-[#72DFB4]/40' 
                  : 'bg-white/10 text-gray-300 border-white/20 hover:bg-white/20'
              }`}
            >
              <Zap className={`w-4 h-4 ${greenCorridor ? 'text-[#72DFB4] fill-[#72DFB4]' : 'text-gray-400'}`} />
              <span>Green Corridor: {greenCorridor ? 'ACTIVE' : 'OFF'}</span>
            </button>
          </div>

        </div>

        {/* Dispatch Pipeline Progress Bar */}
        <div className="bg-white p-5 rounded-3xl border border-[#E6E2D8] shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-[#F2EEE6] pb-3">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-[#D9532F]" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#0C4A3B]">Dispatch Workflow Pipeline</h3>
            </div>
            <span className="text-[11px] text-[#5F6B63] font-medium hidden sm:inline">Tap any step to update dispatch state</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
            {steps.map((s) => {
              const isCurrent = activeStep === s.id;
              const isPassed = activeStep > s.id;

              return (
                <button
                  key={s.id}
                  onClick={() => setActiveStep(s.id)}
                  className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between space-y-1.5 ${
                    isCurrent
                      ? 'bg-[#0C4A3B] text-white border-[#0C4A3B] shadow-md ring-2 ring-[#72DFB4]/40 scale-[1.01]'
                      : isPassed
                      ? 'bg-[#E8F0EC] text-[#0C4A3B] border-[#0C4A3B]/30 font-semibold'
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

        {/* View Switcher Tabs */}
        <div className="flex items-center justify-between border-b border-[#E6E2D8] pb-2">
          <div className="flex items-center gap-1.5 overflow-x-auto py-1 scrollbar-none">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-4 py-2 rounded-2xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'overview'
                  ? 'bg-[#0C4A3B] text-white shadow-md'
                  : 'bg-white text-[#5F6B63] hover:bg-gray-100 border border-[#E6E2D8]'
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
              <span>Full Overview</span>
            </button>

            <button
              onClick={() => setActiveTab('navigation')}
              className={`px-4 py-2 rounded-2xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'navigation'
                  ? 'bg-[#0C4A3B] text-white shadow-md'
                  : 'bg-white text-[#5F6B63] hover:bg-gray-100 border border-[#E6E2D8]'
              }`}
            >
              <Navigation className="w-4 h-4 text-[#D9532F]" />
              <span>Live Route & Map</span>
            </button>

            <button
              onClick={() => setActiveTab('vitals')}
              className={`px-4 py-2 rounded-2xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'vitals'
                  ? 'bg-[#0C4A3B] text-white shadow-md'
                  : 'bg-white text-[#5F6B63] hover:bg-gray-100 border border-[#E6E2D8]'
              }`}
            >
              <Heart className="w-4 h-4 text-red-500 animate-pulse" />
              <span>Patient Telemetry</span>
            </button>

            <button
              onClick={() => setActiveTab('equipment')}
              className={`px-4 py-2 rounded-2xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'equipment'
                  ? 'bg-[#0C4A3B] text-white shadow-md'
                  : 'bg-white text-[#5F6B63] hover:bg-gray-100 border border-[#E6E2D8]'
              }`}
            >
              <ShieldCheck className="w-4 h-4 text-[#0C4A3B]" />
              <span>Vehicle & Inventory</span>
            </button>
          </div>

          <span className="text-xs text-[#5F6B63] font-medium hidden md:block">
            Mode: <strong className="text-[#0C4A3B] capitalize">{activeTab}</strong>
          </span>
        </div>

        {/* TAB 1: FULL OVERVIEW VIEW */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Left Column: Interactive Map & Telemetry HUD (7 Cols) */}
            <div className="lg:col-span-7 space-y-6">
              
              {/* Real Interactive Leaflet Map Component */}
              <TiltCard maxDegree={3} className="bg-white rounded-3xl p-5 border border-[#E6E2D8] shadow-md space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#F2EEE6] pb-3">
                  <div className="flex items-center gap-2">
                    <Navigation className="w-5 h-5 text-[#D9532F]" />
                    <h3 className="text-base font-serif-heading font-bold text-[#1C2B22]">Live Route Navigation</h3>
                  </div>

                  <button
                    onClick={() => setGreenCorridor(!greenCorridor)}
                    className={`px-3 py-1 rounded-full text-xs font-bold transition-colors cursor-pointer border ${
                      greenCorridor 
                        ? 'bg-[#E8F0EC] text-[#0C4A3B] border-[#0C4A3B]/30' 
                        : 'bg-gray-100 text-gray-500 border-gray-300'
                    }`}
                  >
                    Traffic Pre-emption: {greenCorridor ? '🟢 GREEN CORRIDOR' : '⚪ MANUAL'}
                  </button>
                </div>

                {/* Real Leaflet Map */}
                <RealMapTracker activeSOS={{ id: emergencyCase.id, location: emergencyCase.location, hospital: emergencyCase.hospital }} />

                {/* Telemetry Gauge Cards */}
                <div className="grid grid-cols-3 gap-3 pt-2">
                  <div className="bg-[#FAF8F5] p-3 rounded-2xl border border-[#E6E2D8] text-center space-y-0.5">
                    <span className="text-gray-500 text-[10px] uppercase font-bold block">Current Speed</span>
                    <span className="text-lg font-bold font-mono text-[#1C2B22]">{speed} km/h</span>
                  </div>

                  <div className="bg-[#FAF8F5] p-3 rounded-2xl border border-[#E6E2D8] text-center space-y-0.5">
                    <span className="text-gray-500 text-[10px] uppercase font-bold block">Traffic Signals</span>
                    <span className="text-xs font-bold text-[#0C4A3B] block">4 Cleared</span>
                  </div>

                  <div className="bg-[#FAF8F5] p-3 rounded-2xl border border-[#E6E2D8] text-center space-y-0.5">
                    <span className="text-gray-500 text-[10px] uppercase font-bold block">Road Conditions</span>
                    <span className="text-xs font-bold text-[#1C2B22] block">Dry • Clear</span>
                  </div>
                </div>
              </TiltCard>

              {/* Emergency Audio Telemetry & Doctor Broadcast */}
              <div className="bg-[#1C2B22] text-white p-5 rounded-3xl shadow-lg space-y-4 border border-[#0C4A3B]">
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <div className="flex items-center gap-2 text-[#72DFB4]">
                    <Radio className="w-5 h-5 animate-pulse" />
                    <h3 className="text-xs font-bold uppercase tracking-wider">Hospital ER Radio Telemetry</h3>
                  </div>
                  <span className="text-[11px] text-gray-400 font-mono">Freq: 462.775 MHz</span>
                </div>

                <div className="flex flex-col space-y-3 bg-white/5 p-4 rounded-2xl border border-white/10">
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="space-y-1 text-center sm:text-left">
                      <p className="text-xs font-semibold text-white">Direct Channel: {emergencyCase.hospital.doctor}</p>
                      <p className="text-[11px] text-gray-300">Hold button to stream live paramedic microphone audio & real-time speech transcription.</p>
                    </div>

                    <button
                      onMouseDown={handlePttStart}
                      onMouseUp={handlePttEnd}
                      onTouchStart={handlePttStart}
                      onTouchEnd={handlePttEnd}
                      className={`px-6 py-3 rounded-2xl text-xs font-bold transition-all shadow-lg cursor-pointer flex items-center gap-2 shrink-0 select-none ${
                        isTalking 
                          ? 'bg-[#D9532F] text-white scale-105 animate-pulse ring-4 ring-[#D9532F]/50' 
                          : 'bg-[#0C4A3B] text-white hover:bg-[#08362B]'
                      }`}
                    >
                      {isTalking ? <Mic className="w-4 h-4 animate-ping text-white" /> : <Mic className="w-4 h-4" />}
                      <span>{isTalking ? 'TALKING... (BROADCASTING LIVE)' : 'PUSH TO TALK (HOLD & SPEAK)'}</span>
                    </button>
                  </div>

                  {/* Quick Paramedic Radio Presets */}
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    <span className="text-[10px] text-gray-400 font-semibold mr-1">Quick Radio Presets:</span>
                    <button
                      onClick={() => sendPresetTranscript(`Dr. Jenkins, ST segment elevation confirmed. Prep Cath Lab Bed #4, ETA 3 mins.`)}
                      className="px-2.5 py-1 bg-white/10 hover:bg-white/20 text-white rounded-lg text-[10px] font-semibold transition-colors cursor-pointer flex items-center gap-1"
                    >
                      <MessageSquare className="w-3 h-3 text-[#72DFB4]" />
                      <span>Prep Cath Lab Bed #4</span>
                    </button>

                    <button
                      onClick={() => sendPresetTranscript(`Paramedic Unit #04: Patient Alex Johnson vitals stable, SpO2 94%, Aspirin given.`)}
                      className="px-2.5 py-1 bg-white/10 hover:bg-white/20 text-white rounded-lg text-[10px] font-semibold transition-colors cursor-pointer flex items-center gap-1"
                    >
                      <MessageSquare className="w-3 h-3 text-[#72DFB4]" />
                      <span>Patient Vitals Stable</span>
                    </button>

                    <button
                      onClick={() => sendPresetTranscript(`Traffic pre-emption active. Green corridor cleared. ETA 2.5 minutes.`)}
                      className="px-2.5 py-1 bg-white/10 hover:bg-white/20 text-white rounded-lg text-[10px] font-semibold transition-colors cursor-pointer flex items-center gap-1"
                    >
                      <MessageSquare className="w-3 h-3 text-[#72DFB4]" />
                      <span>Green Corridor Cleared</span>
                    </button>
                  </div>

                  {/* Real-Time Live Speech Transcription Box */}
                  {(isTalking || liveTranscript) && (
                    <div className="bg-[#0C4A3B]/80 p-3 rounded-xl border border-[#72DFB4]/40 space-y-1">
                      <div className="flex items-center justify-between text-[10px] text-[#72DFB4] font-bold font-mono">
                        <span className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
                          REAL-TIME SPEECH TRANSCRIPTION
                        </span>
                        <span>{isTalking ? 'LIVE VOICE STREAM' : 'LAST RECORDED'}</span>
                      </div>
                      <p className="text-xs font-mono text-white bg-black/40 p-2.5 rounded-lg border border-white/10 leading-relaxed">
                        "{liveTranscript || 'Listening... Speak now into microphone'}"
                      </p>
                    </div>
                  )}
                </div>

              </div>

            </div>

            {/* Right Column: Patient Vitals, Destination ER & Vehicle Status (5 Cols) */}
            <div className="lg:col-span-5 space-y-6">
              
              {/* Patient Live Vitals Monitor Card */}
              <TiltCard maxDegree={3} className="bg-white rounded-3xl p-5 border border-[#E6E2D8] shadow-md space-y-4">
                
                <div className="flex items-center justify-between border-b border-[#F2EEE6] pb-3">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#D9532F] block">Live Vitals Sync</span>
                    <h3 className="text-base font-bold text-[#1C2B22]">{emergencyCase.patientName}</h3>
                  </div>
                  <span className="text-xs font-bold text-white bg-[#D9532F] px-2.5 py-0.5 rounded-full shadow">
                    {emergencyCase.ageGender}
                  </span>
                </div>

                {/* Vitals Grid */}
                <div className="grid grid-cols-2 gap-2.5">
                  
                  {/* Heart Rate */}
                  <div className="bg-red-50/80 p-3 rounded-2xl border border-red-200 space-y-0.5">
                    <div className="flex items-center justify-between text-red-700 text-[11px] font-semibold">
                      <span className="flex items-center gap-1"><Heart className="w-3.5 h-3.5 text-red-500 animate-pulse" /> Heart Rate</span>
                      <span className="text-[9px] bg-red-100 px-1 py-0.2 rounded font-bold">HIGH</span>
                    </div>
                    <div className="text-xl font-bold font-mono text-red-800">{emergencyCase.vitals.heartRate} <span className="text-xs text-red-600">BPM</span></div>
                  </div>

                  {/* Blood Pressure */}
                  <div className="bg-blue-50/80 p-3 rounded-2xl border border-blue-200 space-y-0.5">
                    <div className="flex items-center justify-between text-blue-700 text-[11px] font-semibold">
                      <span className="flex items-center gap-1"><Activity className="w-3.5 h-3.5 text-blue-500" /> Blood Press.</span>
                      <span className="text-[9px] bg-blue-100 px-1 py-0.2 rounded font-bold">SYS</span>
                    </div>
                    <div className="text-xl font-bold font-mono text-blue-900">{emergencyCase.vitals.bp} <span className="text-xs text-blue-700">mmHg</span></div>
                  </div>

                  {/* Oxygen Saturation */}
                  <div className="bg-emerald-50/80 p-3 rounded-2xl border border-emerald-200 space-y-0.5">
                    <div className="flex items-center justify-between text-emerald-700 text-[11px] font-semibold">
                      <span className="flex items-center gap-1"><Wind className="w-3.5 h-3.5 text-emerald-600" /> SpO2</span>
                      <span className="text-[9px] bg-emerald-100 px-1 py-0.2 rounded font-bold">STABLE</span>
                    </div>
                    <div className="text-xl font-bold font-mono text-emerald-900">{emergencyCase.vitals.spo2}%</div>
                  </div>

                  {/* Respiratory Rate */}
                  <div className="bg-amber-50/80 p-3 rounded-2xl border border-amber-200 space-y-0.5">
                    <div className="flex items-center justify-between text-amber-700 text-[11px] font-semibold">
                      <span className="flex items-center gap-1"><Thermometer className="w-3.5 h-3.5 text-amber-600" /> Resp Rate</span>
                      <span className="text-[9px] bg-amber-100 px-1 py-0.2 rounded font-bold">RPM</span>
                    </div>
                    <div className="text-xl font-bold font-mono text-amber-900">{emergencyCase.vitals.respRate} <span className="text-xs text-amber-700">/min</span></div>
                  </div>

                </div>

                {/* Simulated ECG Waveform Display */}
                <div className="bg-[#1C2B22] p-3 rounded-2xl space-y-1 border border-[#0C4A3B]">
                  <div className="flex items-center justify-between text-[10px] text-gray-400 font-mono">
                    <span>ECG Lead II Telemetry</span>
                    <span className="text-[#72DFB4] font-bold">ST Segment Elevation Alert</span>
                  </div>
                  <div className="h-9 w-full flex items-center justify-center overflow-hidden">
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
              <div className="bg-white rounded-3xl p-5 border border-[#E6E2D8] shadow-md space-y-3">
                <div className="flex items-center justify-between border-b border-[#F2EEE6] pb-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#0C4A3B] flex items-center gap-1.5">
                    <Hospital className="w-4 h-4" /> Destination Hospital ER
                  </span>
                  <span className="text-[11px] font-bold text-[#0C4A3B] bg-[#E8F0EC] px-2.5 py-0.5 rounded-full">Bed Reserved</span>
                </div>

                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-[#1C2B22]">{emergencyCase.hospital.name}</h4>
                  <p className="text-xs text-[#0C4A3B] font-semibold">{emergencyCase.hospital.bed}</p>
                  <p className="text-xs text-[#5F6B63]">{emergencyCase.hospital.address}</p>
                </div>

                <div className="pt-2 border-t border-[#F2EEE6] flex items-center justify-between text-xs text-[#1C2B22]">
                  <span className="text-gray-500">Lead Physician:</span>
                  <span className="font-bold text-[#0C4A3B]">{emergencyCase.hospital.doctor}</span>
                </div>
              </div>

            </div>

          </div>
        )}

        {/* TAB 2: LIVE ROUTE & MAP FOCUS */}
        {activeTab === 'navigation' && (
          <div className="space-y-6">
            <div className="bg-white rounded-3xl p-6 border border-[#E6E2D8] shadow-lg space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#F2EEE6] pb-4">
                <div>
                  <h2 className="text-xl font-serif-heading font-bold text-[#1C2B22] flex items-center gap-2">
                    <Navigation className="w-6 h-6 text-[#D9532F]" />
                    Live Route Navigation & Traffic Pre-emption
                  </h2>
                  <p className="text-xs text-[#5F6B63]">GPS tracked live route from Indiranagar Indiranagar to {emergencyCase.hospital.name}</p>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-sm font-mono font-bold bg-[#FAF8F5] px-4 py-2 rounded-2xl border border-[#E6E2D8]">
                    Speed: <strong className="text-[#D9532F]">{speed} km/h</strong>
                  </span>
                  <button
                    onClick={() => setGreenCorridor(!greenCorridor)}
                    className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer border ${
                      greenCorridor 
                        ? 'bg-[#0C4A3B] text-white border-[#72DFB4]' 
                        : 'bg-gray-100 text-gray-600 border-gray-300'
                    }`}
                  >
                    Green Corridor: {greenCorridor ? '🟢 FORCED GREEN' : '⚪ OFF'}
                  </button>
                </div>
              </div>

              {/* Full-width Map Tracker */}
              <div className="h-[480px]">
                <RealMapTracker activeSOS={{ id: emergencyCase.id, location: emergencyCase.location, hospital: emergencyCase.hospital }} />
              </div>

              {/* Detailed Navigation Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 pt-2">
                <div className="bg-[#FAF8F5] p-4 rounded-2xl border border-[#E6E2D8] space-y-1">
                  <span className="text-xs font-bold text-gray-500 uppercase">Estimated ETA</span>
                  <p className="text-2xl font-bold font-mono text-[#0C4A3B]">6 mins</p>
                  <span className="text-[10px] text-gray-400">Green Corridor Active</span>
                </div>

                <div className="bg-[#FAF8F5] p-4 rounded-2xl border border-[#E6E2D8] space-y-1">
                  <span className="text-xs font-bold text-gray-500 uppercase">Remaining Distance</span>
                  <p className="text-2xl font-bold font-mono text-[#1C2B22]">3.8 km</p>
                  <span className="text-[10px] text-gray-400">Optimal Route</span>
                </div>

                <div className="bg-[#FAF8F5] p-4 rounded-2xl border border-[#E6E2D8] space-y-1">
                  <span className="text-xs font-bold text-gray-500 uppercase">Traffic Light Status</span>
                  <p className="text-2xl font-bold font-mono text-[#0C4A3B]">4 Cleared</p>
                  <span className="text-[10px] text-gray-400">Pre-emption active</span>
                </div>

                <div className="bg-[#FAF8F5] p-4 rounded-2xl border border-[#E6E2D8] space-y-1">
                  <span className="text-xs font-bold text-gray-500 uppercase">Destination Bed</span>
                  <p className="text-sm font-bold text-[#0C4A3B]">Cardiology Bed #4</p>
                  <span className="text-[10px] text-[#0C4A3B]">Cath Lab Notified</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: PATIENT TELEMETRY FOCUS */}
        {activeTab === 'vitals' && (
          <div className="space-y-6">
            <div className="bg-white rounded-3xl p-6 border border-[#E6E2D8] shadow-lg space-y-6">
              
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#F2EEE6] pb-4">
                <div>
                  <span className="text-xs font-bold text-[#D9532F] uppercase tracking-wider">Live Vitals Sync & Telemetry</span>
                  <h2 className="text-2xl font-bold text-[#1C2B22] flex items-center gap-2">
                    Patient: {emergencyCase.patientName}
                    <span className="text-xs font-bold bg-[#D9532F] text-white px-3 py-1 rounded-full">{emergencyCase.ageGender}</span>
                  </h2>
                  <p className="text-xs text-[#5F6B63] mt-1">Diagnosis: <strong>{emergencyCase.condition}</strong></p>
                </div>

                <a
                  href={`tel:${emergencyCase.hospital.doctorPhone}`}
                  className="bg-[#0C4A3B] hover:bg-[#08362B] text-white font-bold px-5 py-3 rounded-2xl text-xs flex items-center gap-2 shadow-md text-decoration-none"
                >
                  <Stethoscope className="w-4 h-4 text-[#72DFB4]" />
                  <span>Call Cath Lab Lead ({emergencyCase.hospital.doctor})</span>
                </a>
              </div>

              {/* Grid of Large Vitals */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-red-50 p-5 rounded-2xl border border-red-200 space-y-2">
                  <div className="flex items-center justify-between text-red-700 font-bold text-xs">
                    <span className="flex items-center gap-1.5"><Heart className="w-4 h-4 text-red-600 animate-pulse" /> Heart Rate</span>
                    <span className="bg-red-200 text-red-800 px-2 py-0.5 rounded text-[10px]">ELEVATED</span>
                  </div>
                  <div className="text-3xl font-bold font-mono text-red-900">{emergencyCase.vitals.heartRate} <span className="text-sm text-red-700">BPM</span></div>
                  <p className="text-[11px] text-red-700">Sinus Tachycardia detected</p>
                </div>

                <div className="bg-blue-50 p-5 rounded-2xl border border-blue-200 space-y-2">
                  <div className="flex items-center justify-between text-blue-700 font-bold text-xs">
                    <span className="flex items-center gap-1.5"><Activity className="w-4 h-4 text-blue-600" /> Blood Pressure</span>
                    <span className="bg-blue-200 text-blue-800 px-2 py-0.5 rounded text-[10px]">STAGE-1</span>
                  </div>
                  <div className="text-3xl font-bold font-mono text-blue-900">{emergencyCase.vitals.bp} <span className="text-sm text-blue-700">mmHg</span></div>
                  <p className="text-[11px] text-blue-700">Systolic elevated</p>
                </div>

                <div className="bg-emerald-50 p-5 rounded-2xl border border-emerald-200 space-y-2">
                  <div className="flex items-center justify-between text-emerald-700 font-bold text-xs">
                    <span className="flex items-center gap-1.5"><Wind className="w-4 h-4 text-emerald-600" /> Oxygen Sat.</span>
                    <span className="bg-emerald-200 text-emerald-800 px-2 py-0.5 rounded text-[10px]">NORMAL</span>
                  </div>
                  <div className="text-3xl font-bold font-mono text-emerald-900">{emergencyCase.vitals.spo2}%</div>
                  <p className="text-[11px] text-emerald-700">O2 Mask 4L/min active</p>
                </div>

                <div className="bg-amber-50 p-5 rounded-2xl border border-amber-200 space-y-2">
                  <div className="flex items-center justify-between text-amber-700 font-bold text-xs">
                    <span className="flex items-center gap-1.5"><Thermometer className="w-4 h-4 text-amber-600" /> Resp Rate</span>
                    <span className="bg-amber-200 text-amber-800 px-2 py-0.5 rounded text-[10px]">RPM</span>
                  </div>
                  <div className="text-3xl font-bold font-mono text-amber-900">{emergencyCase.vitals.respRate} <span className="text-sm text-amber-700">/min</span></div>
                  <p className="text-[11px] text-amber-700">Tachypnea present</p>
                </div>
              </div>

              {/* Large ECG Telemetry Box */}
              <div className="bg-[#1C2B22] p-5 rounded-3xl space-y-3 border border-[#0C4A3B]">
                <div className="flex items-center justify-between text-xs text-gray-300 font-mono">
                  <span className="flex items-center gap-2"><Activity className="w-4 h-4 text-[#72DFB4]" /> Continuous ECG Lead II Stream</span>
                  <span className="text-[#72DFB4] font-bold">ST Elevation in V2-V4</span>
                </div>
                <div className="h-24 w-full flex items-center justify-center overflow-hidden">
                  <svg className="w-full h-full text-[#72DFB4]" viewBox="0 0 600 60" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M0,30 L80,30 L100,15 L120,45 L140,5 L160,55 L180,30 L260,30 L280,15 L300,45 L320,5 L520,55 L540,30 L600,30" />
                  </svg>
                </div>
              </div>

              {/* Allergies & Patient History Alert */}
              <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center justify-between text-xs text-red-900">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="w-5 h-5 text-red-600 shrink-0" />
                  <div>
                    <strong className="block text-sm">Critical Patient Allergies</strong>
                    <span>{emergencyCase.allergies}</span>
                  </div>
                </div>
                <span className="bg-red-200 text-red-800 font-bold px-3 py-1 rounded-full text-[11px]">FLAGGED</span>
              </div>

            </div>
          </div>
        )}

        {/* TAB 4: VEHICLE & EQUIPMENT FOCUS */}
        {activeTab === 'equipment' && (
          <div className="space-y-6">
            <div className="bg-white rounded-3xl p-6 border border-[#E6E2D8] shadow-lg space-y-6">
              
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#F2EEE6] pb-4">
                <div>
                  <h2 className="text-xl font-serif-heading font-bold text-[#1C2B22] flex items-center gap-2">
                    <Ambulance className="w-6 h-6 text-[#0C4A3B]" />
                    Unit Telemetry & Inventory Readiness
                  </h2>
                  <p className="text-xs text-[#5F6B63]">Vehicle Unit: <strong>{driverInfo.id}</strong> ({driverInfo.vehicleReg}) • Base: {driverInfo.baseHospital}</p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-[#0C4A3B] bg-[#E8F0EC] px-3 py-1.5 rounded-xl border border-[#0C4A3B]/20">
                    Driver: {driverInfo.name} ({driverInfo.license})
                  </span>
                </div>
              </div>

              {/* Equipment & Vehicle Metrics Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-5 bg-[#FAF8F5] rounded-2xl border border-[#E6E2D8] space-y-2">
                  <div className="flex items-center justify-between text-xs text-[#5F6B63] font-bold">
                    <span className="uppercase">Medical Oxygen</span>
                    <Wind className="w-4 h-4 text-[#0C4A3B]" />
                  </div>
                  <div className="text-2xl font-bold font-mono text-[#0C4A3B]">1,850 PSI</div>
                  <span className="text-xs text-emerald-700 font-semibold bg-emerald-100 px-2 py-0.5 rounded">Tank Full</span>
                </div>

                <div className="p-5 bg-[#FAF8F5] rounded-2xl border border-[#E6E2D8] space-y-2">
                  <div className="flex items-center justify-between text-xs text-[#5F6B63] font-bold">
                    <span className="uppercase">Defibrillator Battery</span>
                    <BatteryCharging className="w-4 h-4 text-[#0C4A3B]" />
                  </div>
                  <div className="text-2xl font-bold font-mono text-[#0C4A3B]">100%</div>
                  <span className="text-xs text-emerald-700 font-semibold bg-emerald-100 px-2 py-0.5 rounded">Self-Test Passed</span>
                </div>

                <div className="p-5 bg-[#FAF8F5] rounded-2xl border border-[#E6E2D8] space-y-2">
                  <div className="flex items-center justify-between text-xs text-[#5F6B63] font-bold">
                    <span className="uppercase">Vehicle Fuel Level</span>
                    <Fuel className="w-4 h-4 text-[#0C4A3B]" />
                  </div>
                  <div className="text-2xl font-bold font-mono text-[#1C2B22]">88%</div>
                  <span className="text-xs text-gray-600 font-semibold bg-gray-200 px-2 py-0.5 rounded">Range ~420 km</span>
                </div>

                <div className="p-5 bg-[#FAF8F5] rounded-2xl border border-[#E6E2D8] space-y-2">
                  <div className="flex items-center justify-between text-xs text-[#5F6B63] font-bold">
                    <span className="uppercase">Radio Hardware</span>
                    <Radio className="w-4 h-4 text-[#0C4A3B]" />
                  </div>
                  <div className="text-2xl font-bold font-mono text-[#0C4A3B]">OK</div>
                  <span className="text-xs text-emerald-700 font-semibold bg-emerald-100 px-2 py-0.5 rounded">Encrypted Channel</span>
                </div>
              </div>

              {/* On-board Supply Checklist */}
              <div className="bg-[#FAF8F5] p-5 rounded-2xl border border-[#E6E2D8] space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#0C4A3B]">Pre-Shift Supply Verification</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="flex items-center gap-2 text-[#0C4A3B]">
                    <CheckSquare className="w-4 h-4 text-[#0C4A3B]" />
                    <span>Cardiac Monitor & AED: Verified</span>
                  </div>
                  <div className="flex items-center gap-2 text-[#0C4A3B]">
                    <CheckSquare className="w-4 h-4 text-[#0C4A3B]" />
                    <span>IV Infusion Sets: Stocked (12)</span>
                  </div>
                  <div className="flex items-center gap-2 text-[#0C4A3B]">
                    <CheckSquare className="w-4 h-4 text-[#0C4A3B]" />
                    <span>Emergency Trauma Kit: Sealed</span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}

      </main>

      {/* Ambulance Command Footer */}
      <footer className="border-t border-[#E6E2D8] py-4 text-center text-xs text-[#5F6B63] bg-white">
        <p>MedAlert AI Ambulance Fleet Navigation System • Encrypted Emergency Telemetry</p>
      </footer>

    </div>
  );
}
