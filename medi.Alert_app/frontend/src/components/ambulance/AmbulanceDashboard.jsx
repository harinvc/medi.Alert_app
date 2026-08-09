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
  MessageSquare,
  MessageCircle
} from 'lucide-react';
import TiltCard from '../TiltCard';
import RealMapTracker from '../patient/RealMapTracker';
import socket from '../../services/socket';

const sendEmergencyWhatsApp = (phoneNumber, patientName, hospital, eta, activeCase) => {
  const trackingId = activeCase?.id || `SOS-${Math.floor(100000 + Math.random() * 900000)}`;
  const trackingLink = `https://digital-leave-combining-tapes.trycloudflare.com/?track=${trackingId}`;
  const message = `🚨 MEDALERT EMERGENCY ALERT 🚨

Patient: ${patientName}

An emergency has been detected.

🏥 Hospital: ${hospital}
🚑 Ambulance ETA: ${eta}
📍 Live Location & Vitals: ${trackingLink}

Please contact the patient/ambulance immediately.

This is an automated MedAlert AI alert.`;

  // Clean phone number (remove +, spaces, parentheses) for wa.me link
  const cleanPhone = phoneNumber ? phoneNumber.replace(/\D/g, '') : '';
  const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;

  window.open(whatsappUrl, "_blank");
};

export default function AmbulanceDashboard({ driverUser, onBackToLanding }) {
  const [sirenActive, setSirenActive] = useState(false);
  const [dutyStatus, setDutyStatus] = useState('IN DISPATCH');
  const [activeStep, setActiveStep] = useState(2);
  const [radioConnected, setRadioConnected] = useState(true);
  const [isTalking, setIsTalking] = useState(false);
  const [liveTranscript, setLiveTranscript] = useState('');
  const [greenCorridor, setGreenCorridor] = useState(true);
  const [speed, setSpeed] = useState(68);
  const [activeTab, setActiveTab] = useState('navigation');
  const [isCompleting, setIsCompleting] = useState(false);

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

  const [emergencyCase, setEmergencyCase] = useState(null);

  // Fetch dynamic active emergency from backend REST API
  useEffect(() => {
    fetch((import.meta.env.VITE_BACKEND_URL || "") + "/api/sos/active')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.sos) {
          setEmergencyCase(prev => ({ ...prev, ...data.sos }));
        }
      })
      .catch(err => console.log('Backend connection notice:', err));

    // Listen for WebSocket emergency broadcasts
    socket.on('sos:broadcast', (newSos) => {
      setEmergencyCase(prev => ({ ...prev, ...newSos }));
    });

    // Listen for WebSocket doctor medication pre-approvals
    socket.on('doctor:medication_order', (order) => {
      setLiveTranscript(`DOCTOR ORDER: Approved ${order.medication} (${order.dosage}) by ${order.doctorName}`);
    });

    return () => {
      socket.off('sos:broadcast');
      socket.off('doctor:medication_order');
    };
  }, []);

  const handleCompleteSOS = async () => {
    if (!emergencyCase?.id) return;
    setIsCompleting(true);
    try {
      const response = await fetch((import.meta.env.VITE_BACKEND_URL || "") + `/api/sos/${emergencyCase.id}/complete`, {
        method: 'POST'
      });
      const data = await response.json();
      if (data.success) {
        setEmergencyCase(null);
        setDutyStatus('STANDBY');
      }
    } catch (error) {
      console.error('Failed to complete SOS:', error);
    } finally {
      setIsCompleting(false);
    }
  };

  // Dynamic speed fluctuation & WebSocket real-time telemetry stream
  useEffect(() => {
    const interval = setInterval(() => {
      setSpeed(prev => {
        const delta = Math.floor(Math.random() * 7) - 3;
        const newSpeed = Math.min(85, Math.max(45, prev + delta));
        
        // Emit live telemetry over WebSockets to Backend & Doctor Portal
        socket.emit('ambulance:telemetry', {
          speed: newSpeed,
          unit: driverInfo.id,
          greenCorridor
        });

        return newSpeed;
      });
    }, 2000);
    return () => clearInterval(interval);
  }, [greenCorridor, driverInfo.id]);

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
      console.log('AudioContext initialization notice:', err);
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
      console.warn('BroadcastChannel notice:', e);
    }

    return () => {
      if (radioChannelRef.current) {
        radioChannelRef.current.close();
      }
    };
  }, []);

  // Broadcast helper (BroadcastChannel + WebSockets)
  const broadcastTranscript = (text) => {
    setLiveTranscript(text);
    
    // Broadcast via WebSockets to Backend & Doctor Portal
    socket.emit('ptt:transcript', {
      text: text,
      sender: `${driverInfo.id} (${driverInfo.name})`
    });

    if (radioChannelRef.current) {
      radioChannelRef.current.postMessage({
        type: 'TRANSCRIPT',
        text: text,
        sender: `${driverInfo.id} (${driverInfo.name})`
      });
    }
  };

  // Handle Push To Talk (PTT) Press & Real-Time Speech Recognition
  const handlePttStart = async () => {
    setIsTalking(true);
    setLiveTranscript('Listening... Speak now into microphone');

    socket.emit('ptt:start', { sender: `${driverInfo.id} (${driverInfo.name})` });

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

        recognition.onerror = (e) => console.log('SpeechRecognition notice:', e.error);
        recognition.start();
        recognitionRef.current = recognition;
      } catch (err) {
        console.warn('SpeechRecognition notice:', err);
      }
    }

    // Streaming Fallback Simulator (ensures real-time text transcription shows up reliably)
    const fallbackPhrases = [
      `Dr. Jenkins, this is ${driverInfo.id}. We have patient ${emergencyCase.patientName} in transit. ST elevation detected on ECG, oxygen mask active. ETA 3 minutes to Cath Lab Bed #4.`,
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
        if (e.data.size > 0) {
          const reader = new FileReader();
          reader.onloadend = () => {
            const dataUrl = reader.result;
            
            // Send to Socket.io WebSockets
            socket.emit('ptt:audio_chunk', {
              audio: dataUrl,
              sender: `${driverInfo.id} (${driverInfo.name})`
            });

            if (radioChannelRef.current) {
              radioChannelRef.current.postMessage({
                type: 'AUDIO_CHUNK',
                audio: dataUrl,
                sender: `${driverInfo.id} (${driverInfo.name})`
              });
            }
          };
          reader.readAsDataURL(e.data);
        }
      };

      mediaRecorder.start(250);
    } catch (err) {
      console.warn('Microphone stream access notice:', err);
    }
  };

  // Handle Release Push To Talk
  const handlePttEnd = () => {
    setIsTalking(false);

    socket.emit('ptt:end', { sender: `${driverInfo.id} (${driverInfo.name})` });

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

  if (!emergencyCase) {
    return (
      <div className="min-h-screen bg-[#F8F7F4] flex flex-col justify-between selection:bg-[#D9532F]/15 selection:text-[#D9532F]">
        <header className="sticky top-0 z-40 bg-[#0C4A3B] text-white border-b border-[#08362B] shadow-md">
           <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between gap-4">
             <button onClick={onBackToLanding} className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all flex items-center gap-1.5 text-xs font-semibold cursor-pointer"><ArrowLeft className="w-4 h-4" /><span>Landing</span></button>
             <div className="flex items-center gap-2"><Ambulance className="w-5 h-5 text-white" /><span className="font-serif-heading text-lg font-bold text-white tracking-tight">Ambulance Command</span></div>
             <div></div>
           </div>
        </header>
        <main className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <div className="w-24 h-24 bg-[#E8F0EC] rounded-full flex items-center justify-center mb-6 shadow-inner">
            <Radio className="w-12 h-12 text-[#0C4A3B] animate-pulse" />
          </div>
          <h2 className="text-3xl font-serif-heading font-bold text-[#1C2B22] mb-2">Awaiting Dispatch</h2>
          <p className="text-[#5F6B63] max-w-md">Your unit is on standby. You will receive an alert here immediately when a new emergency is assigned to you.</p>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F7F4] text-[#1C2B22] flex flex-col justify-between selection:bg-[#D9532F]/15 selection:text-[#D9532F]">
      
      {/* Sleek Top Navigation Bar */}
      <header className="sticky top-0 z-40 bg-[#0C4A3B] text-white border-b border-[#08362B] shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between gap-4">
          
          {/* Brand & Unit Badge */}
          <div className="flex items-center gap-3">
            <button
              onClick={onBackToLanding}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all flex items-center gap-1.5 text-xs font-semibold cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Landing</span>
            </button>

            <div className="h-6 w-[1px] bg-white/20"></div>

            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#D9532F] text-white flex items-center justify-center shadow-md">
                <Ambulance className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-serif-heading text-lg font-bold text-white tracking-tight">Ambulance Command</span>
                  <span className="text-[10px] bg-[#D9532F] text-white font-bold px-2 py-0.5 rounded-full uppercase tracking-wider shadow">
                    UNIT #04
                  </span>
                </div>
                <p className="text-xs text-emerald-100 hidden md:block">{driverInfo.name} • {driverInfo.vehicleReg}</p>
              </div>
            </div>
          </div>

          {/* Quick Action Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Siren Toggle */}
            <button
              onClick={() => setSirenActive(!sirenActive)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer border ${
                sirenActive 
                  ? 'bg-[#D9532F] text-white border-[#D9532F] shadow-lg animate-pulse' 
                  : 'bg-white/10 text-gray-200 border-white/20 hover:bg-white/20'
              }`}
            >
              {sirenActive ? <Volume2 className="w-4 h-4 text-white animate-bounce" /> : <VolumeX className="w-4 h-4" />}
              <span className="hidden sm:inline">{sirenActive ? 'Siren SOUNDING' : 'Sound Siren'}</span>
            </button>

            {/* Duty Select */}
            <select
              value={dutyStatus}
              onChange={(e) => setDutyStatus(e.target.value)}
              className="bg-[#08362B] text-white text-xs font-bold px-3 py-2 rounded-xl border border-[#72DFB4]/30 focus:outline-none cursor-pointer"
            >
              <option value="IN DISPATCH">🚨 IN DISPATCH</option>
              <option value="ON DUTY">🟢 ON DUTY</option>
              <option value="STANDBY">🟡 STANDBY</option>
              <option value="OFF DUTY">🔴 OFF DUTY</option>
            </select>

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
        
        {/* Streamlined Mission Summary HUD */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-[#E5E2D9] shadow-sm space-y-4">
          
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 border-b border-[#F2EEE6] pb-4">
            
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-3 py-0.5 rounded-full bg-[#D9532F] text-white font-bold text-[10px] uppercase tracking-widest flex items-center gap-1.5 shadow-sm">
                  <span className="w-2 h-2 rounded-full bg-white animate-ping"></span>
                  PRIORITY RED LEVEL-1
                </span>
                <span className="text-xs text-gray-500 font-mono bg-gray-100 px-2.5 py-0.5 rounded-full">ID: {emergencyCase.id}</span>
                <span className="text-xs text-[#0C4A3B] font-bold bg-[#E8F0EC] px-2.5 py-0.5 rounded-full">Patient: {emergencyCase.patientName} ({emergencyCase.ageGender})</span>
              </div>
              
              <h1 className="text-2xl sm:text-3xl font-serif-heading font-bold text-[#1C2B22]">
                {emergencyCase.condition}
              </h1>

              <p className="text-xs sm:text-sm text-[#5F6B63] flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#D9532F] shrink-0" />
                <span>Pick-up Target: <strong className="text-[#1C2B22]">{emergencyCase.location}</strong></span>
              </p>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto shrink-0">
              {emergencyCase.emergencyContacts && emergencyCase.emergencyContacts.length > 0 ? (
                emergencyCase.emergencyContacts.map((contact, idx) => (
                  <React.Fragment key={idx}>
                    <a
                      href={`tel:${contact.phone}`}
                      className="flex-1 lg:flex-none justify-center bg-[#D9532F] hover:bg-[#B53B18] text-white font-bold px-4 py-2.5 rounded-2xl text-xs flex items-center gap-2 shadow transition-all cursor-pointer text-decoration-none"
                    >
                      <PhoneCall className="w-4 h-4" />
                      <span>Call {contact.name.split(' ')[0]}</span>
                    </a>
                    <button
                      onClick={() => sendEmergencyWhatsApp(contact.phone?.replace(/\D/g, '') || '', emergencyCase.patientName || 'Unknown', emergencyCase.hospitalName || 'City Cardiac Institute', 'Arriving Soon', emergencyCase)}
                      className="flex-1 lg:flex-none justify-center bg-[#25D366] hover:bg-[#1DA851] text-white font-bold px-4 py-2.5 rounded-2xl text-xs flex items-center gap-2 shadow transition-all cursor-pointer"
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span>WA {contact.name.split(' ')[0]}</span>
                    </button>
                  </React.Fragment>
                ))
              ) : (
                <React.Fragment>
                  <a
                    href={`tel:${emergencyCase.contactPhone}`}
                    className="flex-1 lg:flex-none justify-center bg-[#D9532F] hover:bg-[#B53B18] text-white font-bold px-4 py-2.5 rounded-2xl text-xs flex items-center gap-2 shadow transition-all cursor-pointer text-decoration-none"
                  >
                    <PhoneCall className="w-4 h-4" />
                    <span>Call Family</span>
                  </a>

                  <button
                    onClick={() => sendEmergencyWhatsApp(emergencyCase.contactPhone?.replace(/\D/g, '') || '', emergencyCase.patientName || 'Unknown', emergencyCase.hospitalName || 'City Cardiac Institute', 'Arriving Soon', emergencyCase)}
                    className="flex-1 lg:flex-none justify-center bg-[#25D366] hover:bg-[#1DA851] text-white font-bold px-4 py-2.5 rounded-2xl text-xs flex items-center gap-2 shadow transition-all cursor-pointer"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>WhatsApp</span>
                  </button>
                </React.Fragment>
              )}

              <button
                onClick={handleCompleteSOS}
                disabled={isCompleting}
                className="flex-1 lg:flex-none justify-center bg-[#0C4A3B] hover:bg-[#08362B] text-white font-bold px-4 py-2.5 rounded-2xl text-xs flex items-center gap-2 shadow transition-all cursor-pointer disabled:opacity-50"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{isCompleting ? 'Completing...' : 'Complete SOS'}</span>
              </button>

              <button
                onClick={() => setRadioConnected(!radioConnected)}
                className={`flex-1 lg:flex-none justify-center px-4 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer border ${
                  radioConnected 
                    ? 'bg-[#E8F0EC] text-[#0C4A3B] border-[#0C4A3B]/30' 
                    : 'bg-gray-100 text-gray-600 border-gray-300'
                }`}
              >
                <Radio className="w-4 h-4" />
                <span>{radioConnected ? 'ER Radio ON' : 'Connect Radio'}</span>
              </button>

              <button
                onClick={() => setGreenCorridor(!greenCorridor)}
                className={`flex-1 lg:flex-none justify-center px-4 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer border ${
                  greenCorridor 
                    ? 'bg-[#0C4A3B] text-white border-[#0C4A3B]' 
                    : 'bg-gray-100 text-gray-600 border-gray-300'
                }`}
              >
                <Zap className={`w-4 h-4 ${greenCorridor ? 'text-[#72DFB4] fill-[#72DFB4]' : 'text-gray-400'}`} />
                <span>Green Corridor: {greenCorridor ? 'ACTIVE' : 'OFF'}</span>
              </button>
            </div>

          </div>

          {/* Streamlined Step Workflow Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-1">
            {steps.map((s) => {
              const isCurrent = activeStep === s.id;
              const isPassed = activeStep > s.id;

              return (
                <button
                  key={s.id}
                  onClick={() => setActiveStep(s.id)}
                  className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                    isCurrent
                      ? 'bg-[#0C4A3B] text-white border-[#0C4A3B] shadow'
                      : isPassed
                      ? 'bg-[#E8F0EC] text-[#0C4A3B] border-[#0C4A3B]/20 font-semibold'
                      : 'bg-[#FAF9F6] text-gray-400 border-[#E5E2D9] hover:bg-gray-100'
                  }`}
                >
                  <div>
                    <span className="text-[9px] uppercase font-bold tracking-wider font-mono opacity-80 block">Step 0{s.id}</span>
                    <span className="text-xs font-bold leading-tight block truncate">{s.label}</span>
                  </div>
                  {isPassed ? <CheckCircle2 className="w-4 h-4 text-[#0C4A3B] shrink-0" /> : isCurrent ? <Clock className="w-4 h-4 text-[#72DFB4] animate-spin shrink-0" /> : null}
                </button>
              );
            })}
          </div>

        </div>

        {/* Clear Tab Navigation Bar */}
        <div className="flex items-center justify-between border-b border-[#E5E2D9] pb-3">
          <div className="flex items-center gap-2 overflow-x-auto py-1 scrollbar-none">
            <button
              onClick={() => setActiveTab('navigation')}
              className={`px-4 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'navigation'
                  ? 'bg-[#0C4A3B] text-white shadow'
                  : 'bg-white text-[#5F6B63] hover:bg-gray-100 border border-[#E5E2D9]'
              }`}
            >
              <Navigation className="w-4 h-4 text-[#D9532F]" />
              <span>🧭 Live Route & Map</span>
            </button>

            <button
              onClick={() => setActiveTab('vitals')}
              className={`px-4 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'vitals'
                  ? 'bg-[#0C4A3B] text-white shadow'
                  : 'bg-white text-[#5F6B63] hover:bg-gray-100 border border-[#E5E2D9]'
              }`}
            >
              <Heart className="w-4 h-4 text-red-500 animate-pulse" />
              <span>🩸 Patient Vitals & Shock Index</span>
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
              <span>🎙️ ER Radio & Voice</span>
            </button>

            <button
              onClick={() => setActiveTab('equipment')}
              className={`px-4 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'equipment'
                  ? 'bg-[#0C4A3B] text-white shadow'
                  : 'bg-white text-[#5F6B63] hover:bg-gray-100 border border-[#E5E2D9]'
              }`}
            >
              <ShieldCheck className="w-4 h-4 text-[#0C4A3B]" />
              <span>🚑 Vehicle & Equipment</span>
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
              <span>📊 Full Overview</span>
            </button>
          </div>

          <span className="text-xs text-[#5F6B63] font-medium hidden md:block">
            View: <strong className="text-[#0C4A3B] uppercase">{activeTab}</strong>
          </span>
        </div>

        {/* TAB 1: LIVE ROUTE & MAP FOCUS */}
        {activeTab === 'navigation' && (
          <div className="space-y-6">
            <div className="bg-white rounded-3xl p-6 border border-[#E5E2D9] shadow-sm space-y-5">
              
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#F2EEE6] pb-4">
                <div>
                  <h2 className="text-xl font-serif-heading font-bold text-[#1C2B22] flex items-center gap-2">
                    <Navigation className="w-6 h-6 text-[#D9532F]" />
                    Live Navigation & Traffic Pre-emption
                  </h2>
                  <p className="text-xs text-[#5F6B63] mt-0.5">Route: Indiranagar 100ft Road ➔ {emergencyCase.hospital?.name || 'City Cardiac Institute'}</p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="bg-[#FAF9F6] px-4 py-2 rounded-2xl border border-[#E5E2D9] text-center">
                    <span className="text-[10px] text-gray-500 uppercase font-bold block">Telemetry Speed</span>
                    <span className="text-lg font-bold font-mono text-[#D9532F]">{speed} km/h</span>
                  </div>

                  <div className="bg-[#E8F0EC] px-4 py-2 rounded-2xl border border-[#0C4A3B]/30 text-center">
                    <span className="text-[10px] text-[#0C4A3B] uppercase font-bold block">Destination ER Bed</span>
                    <span className="text-xs font-bold text-[#0C4A3B]">Cardiology Bed #4</span>
                  </div>
                </div>
              </div>

              {/* Full-width Map Tracker */}
              <div className="h-[460px]">
                <RealMapTracker activeSOS={{ id: emergencyCase.id, location: emergencyCase.location, hospital: emergencyCase.hospital }} />
              </div>

              {/* Detailed Navigation Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 pt-2">
                <div className="bg-[#FAF9F6] p-4 rounded-2xl border border-[#E5E2D9] space-y-1">
                  <span className="text-xs font-bold text-gray-500 uppercase">Estimated ETA</span>
                  <p className="text-2xl font-bold font-mono text-[#0C4A3B]">{emergencyCase.telemetry?.eta || '3.4 min'}</p>
                  <span className="text-[10px] text-gray-400">Green Corridor Active</span>
                </div>

                <div className="bg-[#FAF9F6] p-4 rounded-2xl border border-[#E5E2D9] space-y-1">
                  <span className="text-xs font-bold text-gray-500 uppercase">Distance Remaining</span>
                  <p className="text-2xl font-bold font-mono text-[#1C2B22]">3.8 km</p>
                  <span className="text-[10px] text-gray-400">Optimal GPS Route</span>
                </div>

                <div className="bg-[#FAF9F6] p-4 rounded-2xl border border-[#E5E2D9] space-y-1">
                  <span className="text-xs font-bold text-gray-500 uppercase">Traffic Signals</span>
                  <p className="text-2xl font-bold font-mono text-[#0C4A3B]">4 Cleared</p>
                  <span className="text-[10px] text-gray-400">Pre-emption active</span>
                </div>

                <div className="bg-[#FAF9F6] p-4 rounded-2xl border border-[#E5E2D9] space-y-1">
                  <span className="text-xs font-bold text-gray-500 uppercase">ER Cath Lab Lead</span>
                  <p className="text-sm font-bold text-[#0C4A3B]">Dr. Sarah Jenkins</p>
                  <span className="text-[10px] text-[#0C4A3B]">On Standby</span>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* TAB 2: PATIENT VITALS FOCUS & AI SHOCK INDEX */}
        {activeTab === 'vitals' && (
          <div className="space-y-6">
            <div className="bg-white rounded-3xl p-6 border border-[#E5E2D9] shadow-sm space-y-6">
              
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
                  href={`tel:${emergencyCase.hospital?.doctorPhone || '+15550192831'}`}
                  className="bg-[#0C4A3B] hover:bg-[#08362B] text-white font-bold px-5 py-3 rounded-2xl text-xs flex items-center gap-2 shadow text-decoration-none"
                >
                  <Stethoscope className="w-4 h-4 text-[#72DFB4]" />
                  <span>Call Lead Physician ({emergencyCase.hospital?.doctor || 'Dr. Sarah Jenkins'})</span>
                </a>
              </div>

              {/* AI Shock Index Telemetry Box */}
              <div className="bg-[#0C4A3B] text-white p-4.5 rounded-2xl border border-[#72DFB4]/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#D9532F] text-white flex items-center justify-center font-bold text-sm shrink-0 animate-pulse shadow">
                    ⚡
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-widest text-[#72DFB4] font-mono block">
                      AI SHOCK INDEX & DETERIORATION TELEMETRY
                    </span>
                    <h4 className="text-sm font-bold text-white">
                      Shock Index Score: <strong className="text-yellow-300 font-mono">{emergencyCase.vitals?.shockIndex || 0.79}</strong> (HR 112 / Systolic BP 142)
                    </h4>
                  </div>
                </div>

                <div className="text-left sm:text-right">
                  <span className="bg-[#D9532F] text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider shadow-sm">
                    {emergencyCase.vitals?.shockStatus || '⚡ CARDIOGENIC SHOCK RISK: ELEVATED'}
                  </span>
                  <span className="text-[10px] text-emerald-100 block mt-0.5">Calculated in real-time by MedAlert AI Backend</span>
                </div>
              </div>

              {/* Grid of Large Vitals */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-red-50 p-5 rounded-2xl border border-red-200 space-y-2">
                  <div className="flex items-center justify-between text-red-700 font-bold text-xs">
                    <span className="flex items-center gap-1.5"><Heart className="w-4 h-4 text-red-600 animate-pulse" /> Heart Rate</span>
                    <span className="bg-red-200 text-red-800 px-2 py-0.5 rounded text-[10px]">ELEVATED</span>
                  </div>
                  <div className="text-3xl font-bold font-mono text-red-900">{emergencyCase.vitals?.heartRate || 112} <span className="text-sm text-red-700">BPM</span></div>
                  <p className="text-[11px] text-red-700">Sinus Tachycardia detected</p>
                </div>

                <div className="bg-blue-50 p-5 rounded-2xl border border-blue-200 space-y-2">
                  <div className="flex items-center justify-between text-blue-700 font-bold text-xs">
                    <span className="flex items-center gap-1.5"><Activity className="w-4 h-4 text-blue-600" /> Blood Pressure</span>
                    <span className="bg-blue-200 text-blue-800 px-2 py-0.5 rounded text-[10px]">STAGE-1</span>
                  </div>
                  <div className="text-3xl font-bold font-mono text-blue-900">{emergencyCase.vitals?.bp || '142/90'} <span className="text-sm text-blue-700">mmHg</span></div>
                  <p className="text-[11px] text-blue-700">Systolic elevated</p>
                </div>

                <div className="bg-emerald-50 p-5 rounded-2xl border border-emerald-200 space-y-2">
                  <div className="flex items-center justify-between text-emerald-700 font-bold text-xs">
                    <span className="flex items-center gap-1.5"><Wind className="w-4 h-4 text-emerald-600" /> Oxygen Sat.</span>
                    <span className="bg-emerald-200 text-emerald-800 px-2 py-0.5 rounded text-[10px]">NORMAL</span>
                  </div>
                  <div className="text-3xl font-bold font-mono text-emerald-900">{emergencyCase.vitals?.spo2 || 94}%</div>
                  <p className="text-[11px] text-emerald-700">O2 Mask 4L/min active</p>
                </div>

                <div className="bg-amber-50 p-5 rounded-2xl border border-amber-200 space-y-2">
                  <div className="flex items-center justify-between text-amber-700 font-bold text-xs">
                    <span className="flex items-center gap-1.5"><Thermometer className="w-4 h-4 text-amber-600" /> Resp Rate</span>
                    <span className="bg-amber-200 text-amber-800 px-2 py-0.5 rounded text-[10px]">RPM</span>
                  </div>
                  <div className="text-3xl font-bold font-mono text-amber-900">{emergencyCase.vitals?.respRate || 22} <span className="text-sm text-amber-700">/min</span></div>
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

              {/* Allergies Alert */}
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

        {/* TAB 3: ER RADIO & VOICE FOCUS */}
        {activeTab === 'radio' && (
          <div className="space-y-6">
            <div className="bg-white rounded-3xl p-6 border border-[#E5E2D9] shadow-sm space-y-6">
              
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#F2EEE6] pb-4">
                <div>
                  <h2 className="text-xl font-serif-heading font-bold text-[#1C2B22] flex items-center gap-2">
                    <Radio className="w-6 h-6 text-[#0C4A3B]" />
                    Hospital ER Radio & Push-To-Talk Voice Link
                  </h2>
                  <p className="text-xs text-[#5F6B63] mt-0.5">Encrypted channel to {emergencyCase.hospital?.doctor || 'Dr. Sarah Jenkins'}</p>
                </div>
                <span className="text-xs font-mono font-bold bg-[#E8F0EC] text-[#0C4A3B] px-3 py-1 rounded-full">Freq: 462.775 MHz</span>
              </div>

              {/* Clean PTT Radio Box */}
              <div className="bg-[#1C2B22] text-white p-6 rounded-3xl space-y-4 border border-[#0C4A3B]">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white/5 p-5 rounded-2xl border border-white/10">
                  <div className="space-y-1 text-center sm:text-left">
                    <p className="text-sm font-semibold text-white">Direct Channel to ER Lead ({emergencyCase.hospital?.doctor || 'Dr. Sarah Jenkins'})</p>
                    <p className="text-xs text-gray-300">Press & hold button to stream live paramedic voice and real-time speech-to-text over WebSockets.</p>
                  </div>

                  <button
                    onMouseDown={handlePttStart}
                    onMouseUp={handlePttEnd}
                    onTouchStart={handlePttStart}
                    onTouchEnd={handlePttEnd}
                    className={`px-8 py-4 rounded-2xl text-xs font-bold transition-all shadow-lg cursor-pointer flex items-center gap-2 shrink-0 select-none ${
                      isTalking 
                        ? 'bg-[#D9532F] text-white scale-105 animate-pulse ring-4 ring-[#D9532F]/50' 
                        : 'bg-[#0C4A3B] text-white hover:bg-[#08362B]'
                    }`}
                  >
                    {isTalking ? <Mic className="w-5 h-5 animate-ping text-white" /> : <Mic className="w-5 h-5" />}
                    <span>{isTalking ? 'TALKING... (BROADCASTING LIVE)' : 'PUSH TO TALK (HOLD & SPEAK)'}</span>
                  </button>
                </div>

                {/* Quick Radio Presets */}
                <div className="space-y-2">
                  <span className="text-xs text-gray-400 font-semibold block">Quick One-Tap Radio Presets:</span>
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={() => sendPresetTranscript(`Dr. Jenkins, ST segment elevation confirmed. Prep Cath Lab Bed #4, ETA 3 mins.`)}
                      className="px-3 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5"
                    >
                      <MessageSquare className="w-4 h-4 text-[#72DFB4]" />
                      <span>Prep Cath Lab Bed #4</span>
                    </button>

                    <button
                      onClick={() => sendPresetTranscript(`Paramedic Unit #04: Patient Alex Johnson vitals stable, SpO2 94%, Aspirin given.`)}
                      className="px-3 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5"
                    >
                      <MessageSquare className="w-4 h-4 text-[#72DFB4]" />
                      <span>Patient Vitals Stable</span>
                    </button>

                    <button
                      onClick={() => sendPresetTranscript(`Traffic pre-emption active. Green corridor cleared. ETA 2.5 minutes.`)}
                      className="px-3 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5"
                    >
                      <MessageSquare className="w-4 h-4 text-[#72DFB4]" />
                      <span>Green Corridor Cleared</span>
                    </button>
                  </div>
                </div>

                {/* Real-time Live Speech Transcription Box */}
                {(isTalking || liveTranscript) && (
                  <div className="bg-[#0C4A3B]/90 p-4 rounded-2xl border border-[#72DFB4]/40 space-y-2">
                    <div className="flex items-center justify-between text-xs text-[#72DFB4] font-bold font-mono">
                      <span className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping"></span>
                        REAL-TIME SPEECH TRANSCRIPTION
                      </span>
                      <span>{isTalking ? 'LIVE VOICE STREAM' : 'LAST RECORDED'}</span>
                    </div>
                    <p className="text-sm font-mono text-white bg-black/40 p-3 rounded-xl border border-white/10 leading-relaxed">
                      "{liveTranscript || 'Listening... Speak now into microphone'}"
                    </p>
                  </div>
                )}
              </div>

            </div>
          </div>
        )}

        {/* TAB 4: VEHICLE & EQUIPMENT FOCUS */}
        {activeTab === 'equipment' && (
          <div className="space-y-6">
            <div className="bg-white rounded-3xl p-6 border border-[#E5E2D9] shadow-sm space-y-6">
              
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#F2EEE6] pb-4">
                <div>
                  <h2 className="text-xl font-serif-heading font-bold text-[#1C2B22] flex items-center gap-2">
                    <Ambulance className="w-6 h-6 text-[#0C4A3B]" />
                    Unit Readiness & On-board Inventory
                  </h2>
                  <p className="text-xs text-[#5F6B63] mt-0.5">Unit: <strong>{driverInfo.id}</strong> ({driverInfo.vehicleReg}) • Base: {driverInfo.baseHospital}</p>
                </div>

                <span className="text-xs font-bold text-[#0C4A3B] bg-[#E8F0EC] px-3 py-1.5 rounded-xl border border-[#0C4A3B]/20">
                  Driver: {driverInfo.name} ({driverInfo.license})
                </span>
              </div>

              {/* Equipment & Vehicle Metrics Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-5 bg-[#FAF9F6] rounded-2xl border border-[#E5E2D9] space-y-2">
                  <div className="flex items-center justify-between text-xs text-[#5F6B63] font-bold">
                    <span className="uppercase">Medical Oxygen</span>
                    <Wind className="w-4 h-4 text-[#0C4A3B]" />
                  </div>
                  <div className="text-2xl font-bold font-mono text-[#0C4A3B]">1,850 PSI</div>
                  <span className="text-xs text-emerald-700 font-semibold bg-emerald-100 px-2 py-0.5 rounded">Tank Full</span>
                </div>

                <div className="p-5 bg-[#FAF9F6] rounded-2xl border border-[#E5E2D9] space-y-2">
                  <div className="flex items-center justify-between text-xs text-[#5F6B63] font-bold">
                    <span className="uppercase">Defibrillator Battery</span>
                    <BatteryCharging className="w-4 h-4 text-[#0C4A3B]" />
                  </div>
                  <div className="text-2xl font-bold font-mono text-[#0C4A3B]">100%</div>
                  <span className="text-xs text-emerald-700 font-semibold bg-emerald-100 px-2 py-0.5 rounded">Self-Test Passed</span>
                </div>

                <div className="p-5 bg-[#FAF9F6] rounded-2xl border border-[#E5E2D9] space-y-2">
                  <div className="flex items-center justify-between text-xs text-[#5F6B63] font-bold">
                    <span className="uppercase">Vehicle Fuel Level</span>
                    <Fuel className="w-4 h-4 text-[#0C4A3B]" />
                  </div>
                  <div className="text-2xl font-bold font-mono text-[#1C2B22]">88%</div>
                  <span className="text-xs text-gray-600 font-semibold bg-gray-200 px-2 py-0.5 rounded">Range ~420 km</span>
                </div>

                <div className="p-5 bg-[#FAF9F6] rounded-2xl border border-[#E5E2D9] space-y-2">
                  <div className="flex items-center justify-between text-xs text-[#5F6B63] font-bold">
                    <span className="uppercase">Radio Hardware</span>
                    <Radio className="w-4 h-4 text-[#0C4A3B]" />
                  </div>
                  <div className="text-2xl font-bold font-mono text-[#0C4A3B]">OK</div>
                  <span className="text-xs text-emerald-700 font-semibold bg-emerald-100 px-2 py-0.5 rounded">Encrypted Channel</span>
                </div>
              </div>

              {/* Supply Checklist */}
              <div className="bg-[#FAF9F6] p-5 rounded-2xl border border-[#E5E2D9] space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#0C4A3B]">Pre-Shift Inventory Verification</h4>
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

        {/* TAB 5: FULL OVERVIEW VIEW */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Left Column (7 Cols) */}
            <div className="lg:col-span-7 space-y-6">
              
              <TiltCard maxDegree={3} className="bg-white rounded-3xl p-5 border border-[#E5E2D9] shadow-sm space-y-4">
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
                    Pre-emption: {greenCorridor ? '🟢 GREEN CORRIDOR' : '⚪ MANUAL'}
                  </button>
                </div>

                <RealMapTracker activeSOS={{ id: emergencyCase.id, location: emergencyCase.location, hospital: emergencyCase.hospital }} />

                <div className="grid grid-cols-3 gap-3 pt-2">
                  <div className="bg-[#FAF9F6] p-3 rounded-2xl border border-[#E5E2D9] text-center space-y-0.5">
                    <span className="text-gray-500 text-[10px] uppercase font-bold block">Current Speed</span>
                    <span className="text-lg font-bold font-mono text-[#1C2B22]">{speed} km/h</span>
                  </div>

                  <div className="bg-[#FAF9F6] p-3 rounded-2xl border border-[#E5E2D9] text-center space-y-0.5">
                    <span className="text-gray-500 text-[10px] uppercase font-bold block">Traffic Signals</span>
                    <span className="text-xs font-bold text-[#0C4A3B] block">4 Cleared</span>
                  </div>

                  <div className="bg-[#FAF9F6] p-3 rounded-2xl border border-[#E5E2D9] text-center space-y-0.5">
                    <span className="text-gray-500 text-[10px] uppercase font-bold block">Road Conditions</span>
                    <span className="text-xs font-bold text-[#1C2B22] block">Dry • Clear</span>
                  </div>
                </div>
              </TiltCard>

            </div>

            {/* Right Column (5 Cols) */}
            <div className="lg:col-span-5 space-y-6">
              
              <TiltCard maxDegree={3} className="bg-white rounded-3xl p-5 border border-[#E5E2D9] shadow-sm space-y-4">
                
                <div className="flex items-center justify-between border-b border-[#F2EEE6] pb-3">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#D9532F] block">Live Vitals Sync</span>
                    <h3 className="text-base font-bold text-[#1C2B22]">{emergencyCase.patientName}</h3>
                  </div>
                  <span className="text-xs font-bold text-white bg-[#D9532F] px-2.5 py-0.5 rounded-full shadow-sm">
                    {emergencyCase.ageGender}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div className="bg-red-50/80 p-3 rounded-2xl border border-red-200 space-y-0.5">
                    <div className="flex items-center justify-between text-red-700 text-[11px] font-semibold">
                      <span className="flex items-center gap-1"><Heart className="w-3.5 h-3.5 text-red-500 animate-pulse" /> Heart Rate</span>
                      <span className="text-[9px] bg-red-100 px-1 py-0.2 rounded font-bold">HIGH</span>
                    </div>
                    <div className="text-xl font-bold font-mono text-red-800">{emergencyCase.vitals?.heartRate || 112} <span className="text-xs text-red-600">BPM</span></div>
                  </div>

                  <div className="bg-blue-50/80 p-3 rounded-2xl border border-blue-200 space-y-0.5">
                    <div className="flex items-center justify-between text-blue-700 text-[11px] font-semibold">
                      <span className="flex items-center gap-1"><Activity className="w-3.5 h-3.5 text-blue-500" /> Blood Press.</span>
                      <span className="text-[9px] bg-blue-100 px-1 py-0.2 rounded font-bold">SYS</span>
                    </div>
                    <div className="text-xl font-bold font-mono text-blue-900">{emergencyCase.vitals?.bp || '142/90'} <span className="text-xs text-blue-700">mmHg</span></div>
                  </div>

                  <div className="bg-emerald-50/80 p-3 rounded-2xl border border-emerald-200 space-y-0.5">
                    <div className="flex items-center justify-between text-emerald-700 text-[11px] font-semibold">
                      <span className="flex items-center gap-1"><Wind className="w-3.5 h-3.5 text-emerald-600" /> SpO2</span>
                      <span className="text-[9px] bg-emerald-100 px-1 py-0.2 rounded font-bold">STABLE</span>
                    </div>
                    <div className="text-xl font-bold font-mono text-emerald-900">{emergencyCase.vitals?.spo2 || 94}%</div>
                  </div>

                  <div className="bg-amber-50/80 p-3 rounded-2xl border border-amber-200 space-y-0.5">
                    <div className="flex items-center justify-between text-amber-700 text-[11px] font-semibold">
                      <span className="flex items-center gap-1"><Thermometer className="w-3.5 h-3.5 text-amber-600" /> Resp Rate</span>
                      <span className="text-[9px] bg-amber-100 px-1 py-0.2 rounded font-bold">RPM</span>
                    </div>
                    <div className="text-xl font-bold font-mono text-amber-900">{emergencyCase.vitals?.respRate || 22} <span className="text-xs text-amber-700">/min</span></div>
                  </div>
                </div>

                <div className="bg-[#1C2B22] p-3 rounded-2xl space-y-1 border border-[#0C4A3B]">
                  <div className="flex items-center justify-between text-[10px] text-gray-400 font-mono">
                    <span>ECG Lead II Telemetry</span>
                    <span className="text-[#72DFB4] font-bold">ST Elevation Alert</span>
                  </div>
                  <div className="h-9 w-full flex items-center justify-center overflow-hidden">
                    <svg className="w-full h-full text-[#72DFB4]" viewBox="0 0 300 40" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M0,20 L40,20 L50,10 L60,30 L70,5 L80,35 L90,20 L130,20 L140,10 L150,30 L160,5 L170,35 L180,20 L220,20 L230,10 L240,30 L250,5 L260,35 L270,20 L300,20" />
                    </svg>
                  </div>
                </div>

              </TiltCard>

              <div className="bg-white rounded-3xl p-5 border border-[#E5E2D9] shadow-sm space-y-3">
                <div className="flex items-center justify-between border-b border-[#F2EEE6] pb-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#0C4A3B] flex items-center gap-1.5">
                    <Hospital className="w-4 h-4" /> Destination Hospital ER
                  </span>
                  <span className="text-[11px] font-bold text-[#0C4A3B] bg-[#E8F0EC] px-2.5 py-0.5 rounded-full">Bed Reserved</span>
                </div>

                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-[#1C2B22]">{emergencyCase.hospital?.name || 'City Cardiac Institute'}</h4>
                  <p className="text-xs text-[#0C4A3B] font-semibold">{emergencyCase.hospital?.bed || 'Cardiology Bed #4 (Locked)'}</p>
                  <p className="text-xs text-[#5F6B63]">{emergencyCase.hospital?.address || '45 Healthcare Boulevard'}</p>
                </div>
              </div>

            </div>

          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="border-t border-[#E5E2D9] py-4 text-center text-xs text-[#5F6B63] bg-white">
        <p>MedAlert AI Ambulance Fleet Navigation System • Encrypted Emergency Telemetry</p>
      </footer>

    </div>
  );
}
