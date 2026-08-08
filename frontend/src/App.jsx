import React, { useState } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import StatsBar from './components/StatsBar';
import ThreeViews from './components/ThreeViews';
import FeatureShowcase from './components/FeatureShowcase';
import LiveDashboardPreview from './components/LiveDashboardPreview';
import SignUpModal from './components/SignUpModal';
import Footer from './components/Footer';
import PatientDashboard from './components/patient/PatientDashboard';
import AmbulanceDashboard from './components/ambulance/AmbulanceDashboard';
import DoctorDashboard from './components/doctor/DoctorDashboard';

export default function App() {
  const [currentView, setCurrentView] = useState('landing'); // 'landing', 'patient_app', 'ambulance_app', or 'doctor_app'
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState('signup');
  const [authRole, setAuthRole] = useState('patient');

  // Active User State
  const [user, setUser] = useState({
    name: 'Alex Johnson',
    email: 'alex.johnson@gmail.com',
    phone: '+1 (555) 019-2834',
    bloodGroup: 'O+'
  });

  const handleOpenAuth = (mode = 'signup', role = 'patient') => {
    setAuthMode(mode);
    setAuthRole(role);
    setAuthModalOpen(true);
  };

  const handleAuthSuccess = (role, userDetails) => {
    if (userDetails) {
      setUser({
        name: userDetails.name || userDetails.email?.split('@')[0] || (role === 'doctor' ? 'Dr. Sarah Jenkins' : role === 'ambulance' ? 'Marcus Vance' : 'Patient User'),
        email: userDetails.email || 'user@medalert.org',
        phone: userDetails.phone || '+1 (555) 019-2834',
        bloodGroup: userDetails.bloodGroup || 'O+',
        licenseNumber: userDetails.licenseNumber || 'DL-98472910-X',
        vehicleRegNo: userDetails.vehicleRegNo || 'AMB-104-NYC',
        baseHospital: userDetails.baseHospital || 'City Cardiac Institute',
        hospitalName: userDetails.hospitalName || 'City Cardiac & Emergency Institute',
        doctorRegNo: userDetails.doctorRegNo || 'MC-984029-NY',
        department: userDetails.department || 'Lead Emergency Cardiologist, M.D.'
      });
    }

    if (role === 'patient') {
      setCurrentView('patient_app');
    } else if (role === 'ambulance') {
      setCurrentView('ambulance_app');
    } else if (role === 'doctor') {
      setCurrentView('doctor_app');
    }
  };

  // If in Patient App View mode
  if (currentView === 'patient_app') {
    return <PatientDashboard user={user} onBackToLanding={() => setCurrentView('landing')} />;
  }

  // If in Ambulance Driver App View mode
  if (currentView === 'ambulance_app') {
    return <AmbulanceDashboard driverUser={user} onBackToLanding={() => setCurrentView('landing')} />;
  }

  // If in Doctor / Hospital ER App View mode
  if (currentView === 'doctor_app') {
    return <DoctorDashboard doctorUser={user} onBackToLanding={() => setCurrentView('landing')} />;
  }



  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#1C2B22] flex flex-col justify-between selection:bg-[#0C4A3B]/15 selection:text-[#0C4A3B]">
      
      {/* Header Navbar */}
      <Navbar 
        onOpenAuth={handleOpenAuth} 
      />

      {/* Main Content */}
      <main className="flex-grow">
        
        {/* Hero Section with Radar Graphic */}
        <Hero 
          onOpenAuth={handleOpenAuth} 
        />

        {/* Key Metrics Bar */}
        <StatsBar />

        {/* Three Roles Workflow Cards */}
        <ThreeViews 
          onSelectRoleView={(role) => {
            if (role === 'patient') {
              setCurrentView('patient_app');
            } else if (role === 'ambulance') {
              setCurrentView('ambulance_app');
            } else if (role === 'doctor') {
              setCurrentView('doctor_app');
            } else {
              handleOpenAuth('signup', role);
            }
          }} 
        />

        {/* Interactive Real-Time Capability Showcase */}
        <FeatureShowcase 
          onOpenAuth={handleOpenAuth} 
        />

        {/* Live Hospital Dispatch Dashboard Monitor */}
        <LiveDashboardPreview />

      </main>

      {/* Footer */}
      <Footer 
        onOpenAuth={handleOpenAuth} 
      />

      {/* Unified Sign In & Sign Up Modal */}
      <SignUpModal 
        isOpen={authModalOpen} 
        onClose={() => setAuthModalOpen(false)} 
        onAuthSuccess={handleAuthSuccess}
        initialMode={authMode} 
        initialRole={authRole} 
      />

    </div>
  );
}
