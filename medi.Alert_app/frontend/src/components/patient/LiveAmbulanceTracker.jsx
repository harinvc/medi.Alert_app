import React from 'react';
import { 
  Ambulance, 
  MapPin, 
  PhoneCall, 
  Clock, 
  Hospital, 
  ShieldCheck, 
  CheckCircle2, 
  Navigation,
  UserCheck,
  FileCheck
} from 'lucide-react';
import TiltCard from '../TiltCard';
import RealMapTracker from './RealMapTracker';

export default function LiveAmbulanceTracker({ activeSOS }) {
  if (!activeSOS) {
    return (
      <div className="bg-white rounded-3xl p-12 text-center border border-[#E6E2D8] shadow-md space-y-4">
        <div className="w-16 h-16 rounded-full bg-[#E8F0EC] text-[#0C4A3B] flex items-center justify-center mx-auto">
          <Ambulance className="w-8 h-8 text-[#0C4A3B]" />
        </div>
        <h3 className="text-2xl font-serif-heading font-bold text-[#1C2B22]">No Active Emergency Dispatch</h3>
        <p className="text-sm text-[#5F6B63] max-w-md mx-auto">
          When you press the One-Tap SOS button, your assigned ambulance driver, real-time GPS route, and hospital ER status will appear live on this screen.
        </p>
      </div>
    );
  }

  const driver = activeSOS.driver || {
    name: 'Marcus Vance',
    unit: 'AMB-UNIT-04',
    vehicleReg: 'AMB-104-NYC',
    phone: '+1 (555) 392-0194',
    licenseNo: 'DL-98472910-X',
    eta: '3.4 min'
  };

  const hospital = activeSOS.hospital || {
    name: 'City Cardiac & Emergency Institute',
    department: 'Cardiology ER · Bed #4 Reserved',
    address: '45 Healthcare Boulevard'
  };

  return (
    <div className="space-y-6 text-left animate-in fade-in duration-300">
      
      {/* Header Banner */}
      <div className="bg-[#0C4A3B] text-white p-6 sm:p-8 rounded-3xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl border border-[#72DFB4]/20">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#72DFB4] flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#72DFB4] animate-ping"></span>
            Live GPS Tracking Active (WebSockets Connected)
          </span>
          <h2 className="text-2xl sm:text-3xl font-serif-heading font-medium mt-1">
            {driver.unit || 'Ambulance Unit #04'} En Route
          </h2>
          <p className="text-xs sm:text-sm text-gray-300">
            Emergency ID: {activeSOS.id} • Pick-up location: {activeSOS.location}
          </p>
        </div>

        <div className="bg-white/10 backdrop-blur-md px-6 py-3 rounded-2xl border border-white/20 text-center shrink-0">
          <span className="text-[10px] uppercase font-bold text-[#72DFB4] block">Estimated Arrival</span>
          <span className="text-3xl font-bold text-white font-mono">{driver.eta || '3.4 min'}</span>
        </div>
      </div>

      {/* Grid: Route Progress & Driver Info */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Interactive Animated Map Visualizer */}
        <div className="lg:col-span-7">
          <TiltCard maxDegree={4} className="bg-white/90 backdrop-blur-md rounded-3xl p-6 border border-[#E6E2D8] shadow-xl space-y-6">
            <div className="flex items-center justify-between border-b border-[#F2EEE6] pb-3">
              <h3 className="text-lg font-serif-heading font-bold text-[#1C2B22] flex items-center gap-2">
                <Navigation className="w-5 h-5 text-[#D9532F]" />
                Live GPS Route & Traffic Guidance
              </h3>
              <span className="text-xs font-bold text-[#0C4A3B] bg-[#E8F0EC] px-3 py-1 rounded-full">Fastest Corridor</span>
            </div>

            {/* Real Interactive Leaflet GPS Map Tracker */}
            <RealMapTracker activeSOS={activeSOS} />

            {/* Emergency Status Flow */}
            <div className="space-y-3 pt-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#0C4A3B]">Step-by-step Status</h4>
              <div className="space-y-2 text-xs">
                <div className="flex items-center gap-3 p-2.5 rounded-xl bg-[#E8F0EC] text-[#0C4A3B] font-semibold">
                  <CheckCircle2 className="w-4 h-4" /> SOS Received & MedAlert AI Triage Complete
                </div>
                <div className="flex items-center gap-3 p-2.5 rounded-xl bg-[#E8F0EC] text-[#0C4A3B] font-semibold">
                  <CheckCircle2 className="w-4 h-4" /> {driver.unit || 'Ambulance #04'} Dispatched & Driver En Route
                </div>
                <div className="flex items-center gap-3 p-2.5 rounded-xl bg-white border border-[#E6E2D8] text-[#1C2B22]">
                  <Clock className="w-4 h-4 text-[#D9532F] animate-spin" /> In Transit to Patient Location (ETA {driver.eta || '3.4 min'})
                </div>
                <div className="flex items-center gap-3 p-2.5 rounded-xl bg-white border border-[#E6E2D8] text-gray-400">
                  <Hospital className="w-4 h-4" /> Patient Transfer to {hospital.name}
                </div>
              </div>
            </div>

          </TiltCard>
        </div>

        {/* Right: Driver Profile & Hospital Details */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Assigned Driver Card */}
          <TiltCard maxDegree={6} className="bg-white/90 backdrop-blur-md rounded-3xl p-6 border border-[#E6E2D8] shadow-xl space-y-5">
            <div className="flex items-center justify-between border-b border-[#F2EEE6] pb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-[#D9532F]">Assigned Ambulance Driver</span>
              <span className="text-xs font-semibold text-[#0C4A3B] bg-[#E8F0EC] px-2.5 py-0.5 rounded-full">Verified</span>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-[#0C4A3B] text-white flex items-center justify-center text-2xl font-bold border-2 border-[#D9532F]/40 shadow shrink-0">
                🚑
              </div>
              <div className="space-y-1">
                <h4 className="text-lg font-bold text-[#1C2B22]">{driver.name}</h4>
                <p className="text-xs text-[#5F6B63] font-mono">Vehicle: {driver.vehicleReg}</p>
                <p className="text-[11px] text-gray-500">License: {driver.licenseNo}</p>
              </div>
            </div>

            <a
              href={`tel:${driver.phone}`}
              className="w-full bg-[#D9532F] text-white py-3 rounded-2xl font-semibold text-xs hover:bg-[#C24522] transition-all shadow cursor-pointer flex items-center justify-center gap-2 text-decoration-none"
            >
              <PhoneCall className="w-4 h-4" />
              <span>Call Driver ({driver.phone})</span>
            </a>
          </TiltCard>

          {/* Reserved Hospital Card */}
          <TiltCard maxDegree={6} className="bg-white/90 backdrop-blur-md rounded-3xl p-6 border border-[#E6E2D8] shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#F2EEE6] pb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-[#0C4A3B]">Destination Hospital</span>
              <span className="text-xs font-bold text-[#D9532F] bg-[#D9532F]/10 px-2.5 py-0.5 rounded-full">Bed Held</span>
            </div>

            <div className="space-y-1">
              <h4 className="text-base font-bold text-[#1C2B22]">{hospital.name}</h4>
              <p className="text-xs text-[#0C4A3B] font-semibold">{hospital.department || hospital.bed}</p>
              <p className="text-xs text-[#5F6B63]">{hospital.address}</p>
            </div>
          </TiltCard>

        </div>

      </div>

    </div>
  );
}
