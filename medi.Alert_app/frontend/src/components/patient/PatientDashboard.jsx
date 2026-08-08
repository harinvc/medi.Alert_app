import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, 
  Ambulance, 
  Users, 
  UserCheck, 
  Clock, 
  Activity, 
  ArrowLeft, 
  LogOut, 
  PhoneCall, 
  Sparkles,
  CheckCircle2,
  MapPin,
  Heart,
  Droplet
} from 'lucide-react';
import SosTrigger from './SosTrigger';
import LiveAmbulanceTracker from './LiveAmbulanceTracker';
import EmergencyContacts from './EmergencyContacts';
import MedicalProfile from './MedicalProfile';
import EmergencyHistory from './EmergencyHistory';

export default function PatientDashboard({ user, onBackToLanding }) {
  const [activeTab, setActiveTab] = useState('sos'); // 'sos', 'tracking', 'contacts', 'profile', 'history'
  const [activeSOS, setActiveSOS] = useState(null);

  // Dynamic emergency contacts from DB
  const [contacts, setContacts] = useState(user?.emergencyContacts || []);

  // Dynamic Patient Medical Profile from DB
  const [medicalProfile, setMedicalProfile] = useState({
    name: user?.name || 'Emergency Patient',
    email: user?.email || 'patient@medalert.org',
    phone: user?.phone || '+1 (555) 000-0000',
    bloodGroup: user?.bloodGroup || 'Unknown',
    organDonor: true,
    allergies: 'Severe Penicillin allergy, Latex sensitivity',
    chronicConditions: 'Hypertension (managed with Lysinopril 10mg), Mild Asthma',
    physicianName: 'Dr. Arthur Pendelton',
    physicianPhone: '+1 (555) 882-9401'
  });

  // Sync profile if user prop updates from auth
  useEffect(() => {
    if (user && user.name) {
      setMedicalProfile((prev) => ({
        ...prev,
        name: user.name,
        email: user.email || prev.email,
        phone: user.phone || prev.phone,
        bloodGroup: user.bloodGroup || prev.bloodGroup
      }));
    }
  }, [user]);

  // Dynamic emergency history logs from DB
  const [historyLogs, setHistoryLogs] = useState(user?.medicalHistory || []);

  const handleEmergencyTriggered = (sosData) => {
    setActiveSOS(sosData);
    setActiveTab('tracking');
  };

  return (
    <div className="min-h-screen bg-[#F8F7F4] text-[#1C2B22] flex flex-col justify-between selection:bg-[#0C4A3B]/15 selection:text-[#0C4A3B]">
      
      {/* Sleek Top Header Navigation Bar */}
      <header className="sticky top-0 z-40 bg-[#0C4A3B] text-white border-b border-[#08362B] shadow-md">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between gap-4">
          
          <div className="flex items-center gap-3">
            <button
              onClick={onBackToLanding}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors flex items-center gap-1.5 text-xs font-semibold cursor-pointer"
              title="Return to Main Website"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Landing</span>
            </button>

            <div className="h-6 w-[1px] bg-white/20"></div>

            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-white text-[#0C4A3B] flex items-center justify-center shadow-sm">
                <Activity className="w-5 h-5 text-[#0C4A3B]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-serif-heading text-lg font-bold text-white tracking-tight">Patient Portal</span>
                  <span className="text-[10px] bg-[#72DFB4] text-[#0C4A3B] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider font-mono shadow-sm">
                    LIVE SOS CONNECTED
                  </span>
                </div>
                <p className="text-xs text-emerald-100 hidden md:block">{medicalProfile.name} • {medicalProfile.phone}</p>
              </div>
            </div>
          </div>

          {/* User Profile & Medical Badges */}
          <div className="flex items-center gap-2.5">
            <span className="hidden lg:inline-flex items-center gap-1 bg-white/10 text-white text-xs font-bold px-3 py-1.5 rounded-xl border border-white/20">
              <Droplet className="w-3.5 h-3.5 text-red-400 fill-red-400" />
              <span>Blood: {medicalProfile.bloodGroup}</span>
            </span>

            <span className="hidden lg:inline-flex items-center gap-1 bg-white/10 text-white text-xs font-bold px-3 py-1.5 rounded-xl border border-white/20">
              <Heart className="w-3.5 h-3.5 text-[#72DFB4] fill-[#72DFB4]" />
              <span>Organ Donor</span>
            </span>

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

      {/* Main Dashboard Body */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 flex-grow w-full space-y-6 pb-28 sm:pb-12">
        
        {/* Clear Tab Navigation Bar */}
        <div className="hidden md:flex bg-white rounded-3xl p-2 border border-[#E5E2D9] shadow-sm items-center justify-between gap-1.5">
          
          <button
            onClick={() => setActiveTab('sos')}
            className={`flex-1 py-3 px-4 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeTab === 'sos'
                ? 'bg-[#D9532F] text-white shadow'
                : 'text-[#5F6B63] hover:text-[#1C2B22] hover:bg-[#FAF9F6]'
            }`}
          >
            <ShieldAlert className="w-4 h-4" />
            <span>🚨 One-Tap SOS</span>
          </button>

          <button
            onClick={() => setActiveTab('tracking')}
            className={`flex-1 py-3 px-4 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer relative ${
              activeTab === 'tracking'
                ? 'bg-[#0C4A3B] text-white shadow'
                : 'text-[#5F6B63] hover:text-[#1C2B22] hover:bg-[#FAF9F6]'
            }`}
          >
            <Ambulance className="w-4 h-4 text-[#72DFB4]" />
            <span>🧭 Live Ambulance Tracking</span>
            {activeSOS && (
              <span className="w-2.5 h-2.5 rounded-full bg-[#D9532F] animate-ping absolute top-2 right-3"></span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('contacts')}
            className={`flex-1 py-3 px-4 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeTab === 'contacts'
                ? 'bg-[#0C4A3B] text-white shadow'
                : 'text-[#5F6B63] hover:text-[#1C2B22] hover:bg-[#FAF9F6]'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>👥 Emergency Contacts ({contacts.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('profile')}
            className={`flex-1 py-3 px-4 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeTab === 'profile'
                ? 'bg-[#0C4A3B] text-white shadow'
                : 'text-[#5F6B63] hover:text-[#1C2B22] hover:bg-[#FAF9F6]'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            <span>📋 Medical Profile</span>
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`flex-1 py-3 px-4 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeTab === 'history'
                ? 'bg-[#0C4A3B] text-white shadow'
                : 'text-[#5F6B63] hover:text-[#1C2B22] hover:bg-[#FAF9F6]'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>🕒 Emergency History</span>
          </button>

        </div>

        {/* Tab Content Components */}
        {activeTab === 'sos' && (
          <SosTrigger 
            onEmergencyTriggered={handleEmergencyTriggered} 
            emergencyContacts={contacts} 
            medicalProfile={medicalProfile}
          />
        )}

        {activeTab === 'tracking' && (
          <LiveAmbulanceTracker 
            activeSOS={activeSOS} 
          />
        )}

        {activeTab === 'contacts' && (
          <EmergencyContacts 
            contacts={contacts} 
            onUpdateContacts={setContacts} 
            activeSOS={activeSOS}
          />
        )}

        {activeTab === 'profile' && (
          <MedicalProfile 
            profile={medicalProfile} 
            onUpdateProfile={setMedicalProfile} 
          />
        )}

        {activeTab === 'history' && (
          <EmergencyHistory 
            historyLogs={historyLogs} 
          />
        )}

      </main>

      {/* Mobile Bottom Navigation Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-[#E5E2D9] px-2 py-2 flex items-center justify-around shadow-xl">
        <button
          onClick={() => setActiveTab('sos')}
          className={`flex flex-col items-center gap-1 p-2 rounded-xl text-[10px] font-bold transition-all ${
            activeTab === 'sos' ? 'text-[#D9532F]' : 'text-gray-500'
          }`}
        >
          <div className={`p-1.5 rounded-full ${activeTab === 'sos' ? 'bg-[#D9532F]/10' : ''}`}>
            <ShieldAlert className="w-5 h-5" />
          </div>
          <span>SOS</span>
        </button>

        <button
          onClick={() => setActiveTab('tracking')}
          className={`flex flex-col items-center gap-1 p-2 rounded-xl text-[10px] font-bold transition-all relative ${
            activeTab === 'tracking' ? 'text-[#0C4A3B]' : 'text-gray-500'
          }`}
        >
          <div className={`p-1.5 rounded-full ${activeTab === 'tracking' ? 'bg-[#0C4A3B]/10' : ''}`}>
            <Ambulance className="w-5 h-5" />
          </div>
          <span>Tracker</span>
          {activeSOS && (
            <span className="w-2.5 h-2.5 rounded-full bg-[#D9532F] animate-ping absolute top-1 right-3"></span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('contacts')}
          className={`flex flex-col items-center gap-1 p-2 rounded-xl text-[10px] font-bold transition-all ${
            activeTab === 'contacts' ? 'text-[#0C4A3B]' : 'text-gray-500'
          }`}
        >
          <div className={`p-1.5 rounded-full ${activeTab === 'contacts' ? 'bg-[#0C4A3B]/10' : ''}`}>
            <Users className="w-5 h-5" />
          </div>
          <span>Contacts</span>
        </button>

        <button
          onClick={() => setActiveTab('profile')}
          className={`flex flex-col items-center gap-1 p-2 rounded-xl text-[10px] font-bold transition-all ${
            activeTab === 'profile' ? 'text-[#0C4A3B]' : 'text-gray-500'
          }`}
        >
          <div className={`p-1.5 rounded-full ${activeTab === 'profile' ? 'bg-[#0C4A3B]/10' : ''}`}>
            <UserCheck className="w-5 h-5" />
          </div>
          <span>Profile</span>
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={`flex flex-col items-center gap-1 p-2 rounded-xl text-[10px] font-bold transition-all ${
            activeTab === 'history' ? 'text-[#0C4A3B]' : 'text-gray-500'
          }`}
        >
          <div className={`p-1.5 rounded-full ${activeTab === 'history' ? 'bg-[#0C4A3B]/10' : ''}`}>
            <Clock className="w-5 h-5" />
          </div>
          <span>History</span>
        </button>
      </div>

      {/* Patient Footer */}
      <footer className="hidden sm:block border-t border-[#E5E2D9] py-4 text-center text-xs text-[#5F6B63] bg-white">
        <p>MedAlert AI Patient Emergency Network • HIPAA & GDPR Secured</p>
      </footer>

    </div>
  );
}
