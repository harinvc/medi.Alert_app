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
  MapPin
} from 'lucide-react';
import SosTrigger from './SosTrigger';
import LiveAmbulanceTracker from './LiveAmbulanceTracker';
import EmergencyContacts from './EmergencyContacts';
import MedicalProfile from './MedicalProfile';
import EmergencyHistory from './EmergencyHistory';

export default function PatientDashboard({ user, onBackToLanding }) {
  const [activeTab, setActiveTab] = useState('sos'); // 'sos', 'tracking', 'contacts', 'profile', 'history'
  const [activeSOS, setActiveSOS] = useState(null);

  // Mock initial emergency contacts
  const [contacts, setContacts] = useState([
    { id: 'c1', name: 'Eleanor Vance', relationship: 'Spouse', phone: '+1 (555) 392-0194', notifySms: true },
    { id: 'c2', name: 'Dr. Arthur Pendelton', relationship: 'Personal Physician', phone: '+1 (555) 882-9401', notifySms: true }
  ]);

  // Dynamic Patient Medical Profile (Sync with user entered name & email)
  const [medicalProfile, setMedicalProfile] = useState({
    name: user?.name || 'Alex Johnson',
    email: user?.email || 'alex.johnson@gmail.com',
    phone: user?.phone || '+1 (555) 019-2834',
    bloodGroup: user?.bloodGroup || 'O+',
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

  // Mock emergency history logs
  const [historyLogs] = useState([
    {
      id: 'SOS-849120',
      date: '2026-07-14',
      time: '14:22 PM',
      priority: 'RED',
      emergencyType: 'Acute Chest Pain / Angina',
      location: '100ft Road, Indiranagar',
      hospitalName: 'City Cardiac Institute',
      department: 'Cardiology ER · Bed #2',
      responseTime: '5.4 mins',
      aiSummary: 'Patient presented with sudden onset precordial chest discomfort. Dispatched Ambulance #04 with ECG telemetry. Heparin admin on route.'
    },
    {
      id: 'SOS-301948',
      date: '2026-05-02',
      time: '09:15 AM',
      priority: 'AMBER',
      emergencyType: 'Acute Asthmatic Bronchospasm',
      location: 'Halasuru Metro Station',
      hospitalName: 'St. Jude General Hospital',
      department: 'Pulmonology ER',
      responseTime: '6.8 mins',
      aiSummary: 'Bronchospasm secondary to pollen allergen exposure. Nebulized Albuterol administered during transit.'
    }
  ]);

  const handleEmergencyTriggered = (sosData) => {
    setActiveSOS(sosData);
    setActiveTab('tracking');
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#1C2B22] flex flex-col justify-between selection:bg-[#0C4A3B]/15 selection:text-[#0C4A3B]">
      
      {/* Patient Header Navigation Bar */}
      <header className="sticky top-0 z-40 bg-[#FAF8F5]/90 backdrop-blur-md border-b border-[#EBE7DE]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          
          <div className="flex items-center gap-4">
            <button
              onClick={onBackToLanding}
              className="p-2 rounded-xl text-[#0C4A3B] hover:bg-[#E8F0EC] transition-colors flex items-center gap-1 text-xs font-semibold cursor-pointer"
              title="Return to Main Website"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Landing Page</span>
            </button>

            <div className="h-6 w-[1px] bg-[#EBE7DE] hidden sm:block"></div>

            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-[#0C4A3B] text-white flex items-center justify-center shadow">
                <Activity className="w-5 h-5 text-[#72DFB4]" />
              </div>
              <div>
                <span className="font-serif-heading text-xl font-bold text-[#0C4A3B]">Patient Portal</span>
                <span className="text-[10px] bg-[#E8F0EC] text-[#0C4A3B] font-bold px-2 py-0.5 rounded ml-2 uppercase">Live SOS Connected</span>
              </div>
            </div>
          </div>

          {/* User Name & Profile Badge */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex flex-col text-right">
              <span className="text-xs font-bold text-[#1C2B22]">{medicalProfile.name}</span>
              <span className="text-[11px] text-[#5F6B63]">{medicalProfile.email}</span>
            </div>

            <div className="w-9 h-9 rounded-xl bg-[#E8F0EC] text-[#0C4A3B] font-bold flex items-center justify-center border border-[#0C4A3B]/20">
              {medicalProfile.name ? medicalProfile.name.charAt(0).toUpperCase() : 'P'}
            </div>

            <button
              onClick={onBackToLanding}
              className="p-2 rounded-full text-gray-400 hover:text-[#D9532F] hover:bg-red-50 transition-colors cursor-pointer"
              title="Sign Out"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>

        </div>
      </header>

      {/* Main Dashboard Body */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 flex-grow w-full space-y-6 sm:space-y-8 pb-28 sm:pb-12">
        
        {/* Desktop Navigation Tabs (Hidden on mobile) */}
        <div className="hidden md:flex bg-white/80 backdrop-blur-md p-1.5 rounded-2xl border border-[#E6E2D8] shadow-sm items-center justify-between gap-1">
          
          <button
            onClick={() => setActiveTab('sos')}
            className={`flex-1 py-3 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeTab === 'sos'
                ? 'bg-[#D9532F] text-white shadow-md'
                : 'text-[#5F6B63] hover:text-[#1C2B22] hover:bg-[#FAF8F5]'
            }`}
          >
            <ShieldAlert className="w-4 h-4" />
            <span>One-Tap SOS</span>
          </button>

          <button
            onClick={() => setActiveTab('tracking')}
            className={`flex-1 py-3 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer relative ${
              activeTab === 'tracking'
                ? 'bg-[#0C4A3B] text-white shadow-md'
                : 'text-[#5F6B63] hover:text-[#1C2B22] hover:bg-[#FAF8F5]'
            }`}
          >
            <Ambulance className="w-4 h-4 text-[#72DFB4]" />
            <span>Live Tracking</span>
            {activeSOS && (
              <span className="w-2 h-2 rounded-full bg-[#D9532F] animate-ping absolute top-2 right-2"></span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('contacts')}
            className={`flex-1 py-3 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeTab === 'contacts'
                ? 'bg-[#0C4A3B] text-white shadow-md'
                : 'text-[#5F6B63] hover:text-[#1C2B22] hover:bg-[#FAF8F5]'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Emergency Contacts ({contacts.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('profile')}
            className={`flex-1 py-3 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeTab === 'profile'
                ? 'bg-[#0C4A3B] text-white shadow-md'
                : 'text-[#5F6B63] hover:text-[#1C2B22] hover:bg-[#FAF8F5]'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            <span>Medical Profile</span>
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`flex-1 py-3 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeTab === 'history'
                ? 'bg-[#0C4A3B] text-white shadow-md'
                : 'text-[#5F6B63] hover:text-[#1C2B22] hover:bg-[#FAF8F5]'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>History Log</span>
          </button>

        </div>

        {/* Tab Content Components */}
        {activeTab === 'sos' && (
          <SosTrigger 
            onEmergencyTriggered={handleEmergencyTriggered} 
            emergencyContacts={contacts} 
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

      {/* Mobile Bottom App Navigation Bar (Native Mobile App Experience) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#FAF8F5]/95 backdrop-blur-lg border-t border-[#E6E2D8] px-2 py-2 flex items-center justify-around shadow-2xl">
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
          <span>Map GPS</span>
          {activeSOS && (
            <span className="w-2 h-2 rounded-full bg-[#D9532F] animate-ping absolute top-1 right-3"></span>
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
      <footer className="hidden sm:block border-t border-[#EBE7DE] py-6 text-center text-xs text-[#5F6B63]">
        <p>MedAlert AI Patient Emergency Network • HIPAA & GDPR Secured</p>
      </footer>


    </div>
  );
}
