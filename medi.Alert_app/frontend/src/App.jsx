import React, { useState, useEffect } from 'react';
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
import PublicTracker from './components/patient/PublicTracker';

export default function App() {
  const [currentView, setCurrentView] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('track')) return 'public_tracking';
    const saved = localStorage.getItem('medalert_currentView');
    return (saved && saved !== 'public_tracking') ? saved : 'landing';
  });
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState('signup');
  const [authRole, setAuthRole] = useState('patient');

  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('medalert_user');
      return (saved && saved !== 'undefined') ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });

  useEffect(() => {
    if (currentView !== 'public_tracking') {
      localStorage.setItem('medalert_currentView', currentView);
    }
  }, [currentView]);

  useEffect(() => {
    localStorage.setItem('medalert_user', JSON.stringify(user));
  }, [user]);

  const handleOpenAuth = (mode = 'signup', role = 'patient') => {
    setAuthMode(mode);
    setAuthRole(role);
    setAuthModalOpen(true);
  };

  const handleAuthSuccess = async (role, userDetails) => {
    if (!userDetails) {
      alert("Authentication failed.");
      return;
    }
    
    setUser(userDetails);

    if (role === 'patient') {
      setCurrentView('patient_app');
    } else if (role === 'ambulance') {
      setCurrentView('ambulance_app');
    } else if (role === 'doctor') {
      setCurrentView('doctor_app');
    }
  };

  // If public tracking link is opened
  if (currentView === 'public_tracking') {
    const trackId = new URLSearchParams(window.location.search).get('track');
    return <PublicTracker trackId={trackId} />;
  }

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
