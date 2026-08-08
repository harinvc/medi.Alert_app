import React, { useState } from 'react';
import { Smartphone, Ambulance, Building2, ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react';
import TiltCard from './TiltCard';
import { useScroll3D } from '../hooks/useScroll3D';

export default function ThreeViews({ onSelectRoleView }) {
  const [activeViewModal, setActiveViewModal] = useState(null);
  const { scrollY } = useScroll3D();

  // 3D perspective scroll reveal calculation
  const sectionProgress = Math.min(Math.max((scrollY - 200) / 400, 0), 1);
  const title3DStyle = {
    transform: `perspective(1000px) rotateX(${(1 - sectionProgress) * 15}deg) translateZ(${(1 - sectionProgress) * -40}px)`,
    opacity: 0.3 + sectionProgress * 0.7,
    transition: 'transform 0.2s ease-out, opacity 0.2s ease-out'
  };

  const viewsData = [
    {
      id: 'patient',
      badge: 'P',
      title: 'Patient app',
      description: "Speak or type what's happening — MedAlert AI turns it into a structured medical case in seconds.",
      features: ['One-Tap SOS Button', 'Voice to Medical Translation', 'Live GPS Tracking', 'Emergency Contact Auto-Alert'],
      accentColor: '#0C4A3B'
    },
    {
      id: 'ambulance',
      badge: 'A',
      title: 'Ambulance view',
      description: 'Live location, fastest route, and exactly what condition to expect on arrival.',
      features: ['Real-time Turn Navigation', 'Patient Vitals & History', 'Traffic-Aware Routing', 'Driver Status Toggle'],
      accentColor: '#D9532F'
    },
    {
      id: 'hospital',
      badge: 'H',
      title: 'Hospital view',
      description: 'The ER sees the case, severity, and required department before the doors open.',
      features: ['AI Triage Case Summary', 'Automated Bed Holding', 'Specialty Match Engine', 'Incoming ETA Countdown'],
      accentColor: '#0C4A3B'
    }
  ];

  return (
    <section id="platform" className="py-20 bg-[#FAF8F5] relative overflow-hidden">
      
      {/* Background Ambient Glow */}
      <div className="absolute top-1/2 left-0 w-72 h-72 rounded-full bg-[#0C4A3B]/5 blur-3xl pointer-events-none"></div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header with 3D Scroll Reveal */}
        <div className="max-w-2xl text-left space-y-4 mb-16" style={title3DStyle}>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif-heading font-medium text-[#1C2B22] leading-tight">
            One system, three people who need to trust each other.
          </h2>
          <p className="text-lg text-[#4A554E]">
            Nobody re-explains the emergency. The AI summary travels with the patient.
          </p>
        </div>

        {/* 3 View Cards Grid wrapped in 3D Interactive TiltCard */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {viewsData.map((item, index) => (
            <TiltCard 
              key={item.id}
              onClick={() => setActiveViewModal(item)}
              maxDegree={14}
              className="bg-white/90 backdrop-blur-md rounded-3xl p-8 border border-[#E6E2D8] hover:border-[#0C4A3B]/50 shadow-md hover:shadow-2xl transition-all duration-300 flex flex-col justify-between group"
            >
              <div className="space-y-6">
                {/* Badge Letter */}
                <div className="w-12 h-12 rounded-xl bg-[#E8F0EC] text-[#0C4A3B] font-semibold text-lg flex items-center justify-center group-hover:bg-[#0C4A3B] group-hover:text-white transition-colors duration-300 shadow-sm">
                  {item.badge}
                </div>

                <div className="space-y-3 text-left">
                  <h3 className="text-2xl font-serif-heading font-semibold text-[#1C2B22]">
                    {item.title}
                  </h3>
                  <p className="text-sm text-[#4A554E] leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>

              {/* Action Hint */}
              <div className="pt-8 flex items-center justify-between border-t border-[#F2EEE6] mt-6 text-xs font-semibold text-[#0C4A3B] group-hover:text-[#D9532F] transition-colors">
                <span>Explore {item.title}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
              </div>
            </TiltCard>
          ))}
        </div>
      </div>

      {/* Interactive Detail Modal */}
      {activeViewModal && (
        <div className="fixed inset-0 z-50 bg-[#1C2B22]/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#FAF8F5] max-w-lg w-full rounded-3xl p-8 border border-[#E6E2D8] shadow-2xl relative space-y-6 animate-in fade-in zoom-in duration-200">
            
            <div className="flex items-center justify-between border-b border-[#EBE7DE] pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#E8F0EC] text-[#0C4A3B] font-bold text-lg flex items-center justify-center">
                  {activeViewModal.badge}
                </div>
                <div>
                  <h3 className="text-xl font-serif-heading font-bold text-[#1C2B22]">{activeViewModal.title}</h3>
                  <p className="text-xs text-[#5F6B63]">MedAlert Centralized Workflow</p>
                </div>
              </div>
              <button 
                onClick={() => setActiveViewModal(null)}
                className="w-8 h-8 rounded-full bg-[#EBE7DE] text-[#1C2B22] flex items-center justify-center hover:bg-[#D5CFB9] transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            <p className="text-sm text-[#4A554E] leading-relaxed">
              {activeViewModal.description}
            </p>

            <div className="space-y-3 bg-white p-5 rounded-2xl border border-[#EBE7DE]">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#0C4A3B]">Core Capabilities</h4>
              <div className="grid grid-cols-1 gap-2">
                {activeViewModal.features.map((feat, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-xs text-[#1C2B22]">
                    <CheckCircle2 className="w-4 h-4 text-[#0C4A3B] shrink-0" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-3">
              <button 
                onClick={() => setActiveViewModal(null)}
                className="px-5 py-2.5 rounded-full text-xs font-semibold text-[#5F6B63] hover:bg-[#EBE7DE]"
              >
                Close
              </button>
              <button 
                onClick={() => {
                  const roleMap = { patient: 'patient', ambulance: 'ambulance', hospital: 'doctor' };
                  onSelectRoleView(roleMap[activeViewModal.id]);
                  setActiveViewModal(null);
                }}
                className="px-6 py-2.5 rounded-full bg-[#0C4A3B] text-white text-xs font-semibold hover:bg-[#08362B] transition-colors shadow"
              >
                Sign up as {activeViewModal.title.split(' ')[0]}
              </button>
            </div>

          </div>
        </div>
      )}

    </section>
  );
}
