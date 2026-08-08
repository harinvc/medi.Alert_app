import React, { useState } from 'react';
import { 
  AlertTriangle, 
  Mic, 
  Send, 
  Sparkles, 
  MapPin, 
  CheckCircle2, 
  ShieldAlert, 
  PhoneCall, 
  RotateCcw,
  Activity,
  Ambulance,
  Hospital,
  Users
} from 'lucide-react';
import TiltCard from '../TiltCard';

export default function SosTrigger({ onEmergencyTriggered, emergencyContacts }) {
  const [symptomText, setSymptomText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [activeSOS, setActiveSOS] = useState(null);
  const [location, setLocation] = useState({ lat: '12.9716° N', lng: '77.5946° E', address: 'MG Road, Indiranagar, Sector 4' });

  const handleSimulateGPS = () => {
    setIsLocating(true);
    setTimeout(() => {
      setIsLocating(false);
      setLocation({
        lat: '12.9782° N',
        lng: '77.6394° E',
        address: '100ft Road, HAL 2nd Stage, Indiranagar (GPS Locked ± 4m)'
      });
    }, 1000);
  };

  const handleVoiceRecord = () => {
    setIsRecording(true);
    setTimeout(() => {
      setIsRecording(false);
      const voiceSample = "Severe chest pain, heavy pressure on heart, radiating down left arm.";
      setSymptomText(voiceSample);
    }, 2200);
  };

  const handleTriggerSOS = (presetText) => {
    const textToUse = presetText || symptomText || "Emergency SOS Triggered! Immediate Assistance Required.";
    setIsAnalyzing(true);

    setTimeout(() => {
      setIsAnalyzing(false);

      const sosData = {
        id: `SOS-${Math.floor(100000 + Math.random() * 900000)}`,
        timestamp: new Date().toLocaleTimeString(),
        symptoms: textToUse,
        location: location.address,
        aiAnalysis: {
          emergency: textToUse.toLowerCase().includes('chest') ? "Acute Myocardial Infarction" : "Severe Trauma / Acute Distress",
          severity: "Critical",
          priority: "RED",
          department: textToUse.toLowerCase().includes('chest') ? "Cardiology ER" : "Emergency Trauma Bay",
          recommendation: "Immediate Level-1 Dispatch · ER Bed Lock Active"
        },
        driver: {
          name: "Marcus Vance",
          phone: "+1 (555) 392-0194",
          licenseNo: "DL-98472910-X",
          vehicleReg: "AMB-104-NYC",
          photo: "https://images.unsplash.com/photo-1582750433449-648ed127bb54?auto=format&fit=crop&q=80&w=200",
          eta: "3.4 mins",
          distance: "1.8 km away"
        },
        hospital: {
          name: "City Cardiac & Emergency Institute",
          department: "Cardiology ER · Bed #4 Reserved",
          address: "45 Healthcare Boulevard",
          distance: "2.5 km"
        },
        contactsNotified: emergencyContacts.map(c => c.name)
      };

      setActiveSOS(sosData);
      onEmergencyTriggered(sosData);
    }, 1800);
  };

  return (
    <div className="space-y-8 text-left">
      
      {/* Top Banner */}
      <div className="bg-[#0C4A3B] text-white p-6 sm:p-8 rounded-3xl relative overflow-hidden shadow-xl border border-[#72DFB4]/20">
        <div className="absolute right-0 top-0 w-80 h-80 bg-gradient-to-br from-[#72DFB4]/20 to-transparent rounded-full blur-2xl pointer-events-none"></div>
        <div className="relative z-10 space-y-2 max-w-xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#72DFB4]/20 text-[#72DFB4] text-xs font-bold uppercase tracking-wider">
            <span className="w-2 h-2 rounded-full bg-[#72DFB4] animate-ping"></span>
            Real-Time AI Emergency Dispatch
          </div>
          <h2 className="text-3xl sm:text-4xl font-serif-heading font-medium">
            One-Tap SOS Response
          </h2>
          <p className="text-sm text-gray-300">
            Pressing SOS immediately broadcasts your live GPS location to nearest ambulances, matches hospital ER beds, and alerts your emergency contacts via SMS.
          </p>
        </div>
      </div>

      {activeSOS ? (
        /* Active SOS Dispatch Panel */
        <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-[#D9532F] shadow-2xl space-y-6 animate-in fade-in zoom-in duration-300">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#F2EEE6] pb-5">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-[#D9532F] text-white flex items-center justify-center shadow-lg animate-pulse">
                <AlertTriangle className="w-7 h-7" />
              </div>
              <div>
                <span className="text-xs font-bold text-[#D9532F] uppercase tracking-wider">Active Emergency Dispatch</span>
                <h3 className="text-2xl font-serif-heading font-bold text-[#1C2B22]">Emergency ID: {activeSOS.id}</h3>
              </div>
            </div>

            <button
              onClick={() => setActiveSOS(null)}
              className="px-4 py-2 rounded-full bg-[#EBE7DE] hover:bg-[#D5CFB9] text-xs font-semibold text-[#1C2B22] flex items-center gap-1.5 transition-colors cursor-pointer self-start sm:self-center"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Cancel SOS Demo
            </button>
          </div>

          {/* AI Analysis Summary */}
          <div className="bg-[#1C2B22] text-white p-5 rounded-2xl space-y-3 shadow-md">
            <div className="flex items-center justify-between border-b border-gray-700 pb-2">
              <span className="text-xs font-bold text-[#72DFB4] flex items-center gap-1">
                <Sparkles className="w-4 h-4 text-[#72DFB4]" /> MedAlert AI Triage
              </span>
              <span className="bg-[#D9532F] px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase">
                {activeSOS.aiAnalysis.priority} Priority
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-gray-400 block text-[10px] uppercase">Detected Condition</span>
                <span className="font-semibold text-white text-sm">{activeSOS.aiAnalysis.emergency}</span>
              </div>
              <div>
                <span className="text-gray-400 block text-[10px] uppercase">Department Match</span>
                <span className="font-semibold text-white text-sm">{activeSOS.aiAnalysis.department}</span>
              </div>
            </div>
          </div>

          {/* Dispatch Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* Driver Card */}
            <div className="bg-[#FAF8F5] p-5 rounded-2xl border border-[#E6E2D8] space-y-3">
              <span className="text-[10px] font-bold text-[#D9532F] uppercase tracking-wider block">Assigned Ambulance</span>
              <div className="flex items-center gap-3">
                <img src={activeSOS.driver.photo} alt={activeSOS.driver.name} className="w-12 h-12 rounded-xl object-cover border border-[#E6E2D8]" />
                <div>
                  <h4 className="text-sm font-bold text-[#1C2B22]">{activeSOS.driver.name}</h4>
                  <p className="text-xs text-[#5F6B63]">{activeSOS.driver.vehicleReg}</p>
                </div>
              </div>
              <div className="pt-2 border-t border-[#EBE7DE] flex items-center justify-between text-xs font-semibold text-[#0C4A3B]">
                <span>ETA: {activeSOS.driver.eta}</span>
                <a href={`tel:${activeSOS.driver.phone}`} className="flex items-center gap-1 text-[#D9532F] hover:underline">
                  <PhoneCall className="w-3.5 h-3.5" /> Call Driver
                </a>
              </div>
            </div>

            {/* Hospital Card */}
            <div className="bg-[#FAF8F5] p-5 rounded-2xl border border-[#E6E2D8] space-y-3">
              <span className="text-[10px] font-bold text-[#0C4A3B] uppercase tracking-wider block">Matched Hospital</span>
              <h4 className="text-sm font-bold text-[#1C2B22]">{activeSOS.hospital.name}</h4>
              <p className="text-xs text-[#0C4A3B] font-semibold">{activeSOS.hospital.department}</p>
              <div className="pt-2 border-t border-[#EBE7DE] text-xs text-[#5F6B63]">
                <span>{activeSOS.hospital.distance} away • Route cleared</span>
              </div>
            </div>

            {/* Contacts Notified Card */}
            <div className="bg-[#FAF8F5] p-5 rounded-2xl border border-[#E6E2D8] space-y-3">
              <span className="text-[10px] font-bold text-[#0C4A3B] uppercase tracking-wider block">Contacts Alerted (SMS Sent)</span>
              <div className="space-y-1.5">
                {activeSOS.contactsNotified.map((name, idx) => (
                  <div key={idx} className="flex items-center gap-1.5 text-xs text-[#1C2B22]">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#0C4A3B]" />
                    <span>{name}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>
      ) : (
        /* Standard SOS Trigger Interface */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Main SOS Trigger Button Card */}
          <div className="lg:col-span-6">
            <TiltCard 
              maxDegree={6} 
              className="bg-white/90 backdrop-blur-md rounded-3xl p-8 border border-[#E6E2D8] shadow-xl text-center space-y-8"
            >
              
              <div className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-[#D9532F]">Emergency Action</span>
                <h3 className="text-2xl font-serif-heading font-bold text-[#1C2B22]">Press & Hold to Request Help</h3>
                <p className="text-xs text-[#5F6B63]">Broadcasts live location, alerts ambulance drivers, and notifies family instantly.</p>
              </div>

              {/* Big Animated SOS Button */}
              <div className="py-4 flex justify-center items-center">
                <button
                  onClick={() => handleTriggerSOS()}
                  disabled={isAnalyzing}
                  className="relative group w-44 h-44 sm:w-52 sm:h-52 rounded-full bg-[#D9532F] text-white font-bold text-3xl sm:text-4xl shadow-2xl flex flex-col items-center justify-center gap-1 transition-transform transform active:scale-95 cursor-pointer hover:bg-[#C24522]"
                >
                  {/* Outer Pulsing Pulse Rings */}
                  <span className="absolute inset-0 rounded-full border-4 border-[#D9532F] animate-ping opacity-60 pointer-events-none"></span>
                  <span className="absolute -inset-4 rounded-full border-2 border-[#D9532F]/40 animate-pulse pointer-events-none"></span>

                  <ShieldAlert className="w-12 h-12 sm:w-14 sm:h-14 group-hover:scale-110 transition-transform" />
                  <span className="tracking-widest">SOS</span>
                  <span className="text-[10px] font-semibold tracking-normal text-white/80 uppercase">One-Tap Alert</span>
                </button>
              </div>

              {/* GPS Status Indicator */}
              <div className="bg-[#FAF8F5] p-4 rounded-2xl border border-[#E6E2D8] flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-[#D9532F]" />
                  <span className="font-semibold text-[#1C2B22] truncate max-w-[220px]">{location.address}</span>
                </div>
                <button 
                  onClick={handleSimulateGPS} 
                  disabled={isLocating}
                  className="text-[#0C4A3B] font-bold hover:underline cursor-pointer shrink-0"
                >
                  {isLocating ? 'Updating...' : 'Re-sync GPS'}
                </button>
              </div>

            </TiltCard>
          </div>

          {/* Voice / Text Symptom Inputs & Quick Presets */}
          <div className="lg:col-span-6 space-y-6">
            
            {/* Quick Emergency Symptoms Box */}
            <div className="bg-white/90 backdrop-blur-md rounded-3xl p-6 sm:p-8 border border-[#E6E2D8] shadow-xl space-y-6">
              <div className="space-y-1">
                <h3 className="text-xl font-serif-heading font-semibold text-[#1C2B22]">Describe Symptoms (Optional)</h3>
                <p className="text-xs text-[#5F6B63]">Speak or type symptoms so MedAlert AI can prep the ER before arrival.</p>
              </div>

              {/* Text Input & Voice Mic Button */}
              <div className="space-y-3">
                <div className="relative">
                  <textarea
                    rows="3"
                    placeholder="E.g. Severe chest pain, breathing difficulty, dizziness..."
                    value={symptomText}
                    onChange={(e) => setSymptomText(e.target.value)}
                    className="w-full p-4 rounded-2xl border border-[#E6E2D8] bg-[#FAF8F5] text-sm focus:outline-none focus:border-[#0C4A3B] focus:ring-1 focus:ring-[#0C4A3B] resize-none pr-28"
                  />
                  <button
                    onClick={handleVoiceRecord}
                    disabled={isRecording}
                    className={`absolute right-3 bottom-3 px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                      isRecording ? 'bg-[#D9532F] text-white animate-pulse' : 'bg-[#E8F0EC] text-[#0C4A3B] hover:bg-[#0C4A3B] hover:text-white'
                    }`}
                  >
                    <Mic className="w-4 h-4" />
                    <span>{isRecording ? 'Listening...' : 'Voice'}</span>
                  </button>
                </div>
              </div>

              {/* Symptom Presets */}
              <div className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-[#0C4A3B] block">Quick Presets</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <button
                    onClick={() => handleTriggerSOS("Severe crushing chest pain & difficulty breathing")}
                    className="p-3 bg-[#FAF8F5] hover:bg-[#E8F0EC] rounded-xl border border-[#E6E2D8] text-xs font-medium text-[#1C2B22] text-left transition-colors cursor-pointer"
                  >
                    🫀 Chest Pain / Cardiac
                  </button>
                  <button
                    onClick={() => handleTriggerSOS("Severe road crash trauma, compound leg fracture, heavy bleeding")}
                    className="p-3 bg-[#FAF8F5] hover:bg-[#E8F0EC] rounded-xl border border-[#E6E2D8] text-xs font-medium text-[#1C2B22] text-left transition-colors cursor-pointer"
                  >
                    🩸 Accident / Severe Bleeding
                  </button>
                </div>
              </div>

              <button
                onClick={() => handleTriggerSOS()}
                disabled={isAnalyzing}
                className="w-full bg-[#D9532F] text-white py-3.5 rounded-2xl font-semibold text-sm hover:bg-[#C24522] transition-all shadow cursor-pointer flex items-center justify-center gap-2"
              >
                {isAnalyzing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>MedAlert AI Dispatching...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-white" />
                    <span>Send Emergency Alert Now</span>
                  </>
                )}
              </button>

            </div>

          </div>

        </div>
      )}

    </div>
  );
}
