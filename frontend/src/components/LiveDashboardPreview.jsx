import React, { useState } from 'react';
import { Activity, Clock, ShieldAlert, HeartPulse, Stethoscope, ChevronRight } from 'lucide-react';
import TiltCard from './TiltCard';
import { useScroll3D } from '../hooks/useScroll3D';

export default function LiveDashboardPreview() {
  const { scrollY } = useScroll3D();
  
  const [cases] = useState([
    {
      id: 'case-1',
      severity: 'Red',
      badgeClass: 'bg-[#FCEBE6] text-[#D9532F] border border-[#F5C2B8]',
      title: 'Cardiac event, in transit',
      department: 'Cardiology · bed 4 held',
      eta: '4 min',
      aiSummary: '62yo M, severe chest pain radiating to left jaw. ECG shows ST elevation. Heparin admin.'
    },
    {
      id: 'case-2',
      severity: 'Amber',
      badgeClass: 'bg-[#FEF3D6] text-[#B45309] border border-[#FCD34D]',
      title: 'Suspected fracture',
      department: 'Orthopedics · imaging notified',
      eta: '11 min',
      aiSummary: '24yo F, right tibia deformity following high-impact fall. Splinted, vitals stable.'
    },
    {
      id: 'case-3',
      severity: 'Green',
      badgeClass: 'bg-[#E8F0EC] text-[#0C4A3B] border border-[#BDE0D0]',
      title: 'Routine transfer',
      department: 'General ward',
      eta: '18 min',
      aiSummary: 'Post-op observation transfer from community health center.'
    }
  ]);

  const [selectedCase, setSelectedCase] = useState(null);

  // Scroll perspective
  const scrollProgress = Math.min(Math.max((scrollY - 1300) / 500, 0), 1);
  const container3DStyle = {
    transform: `perspective(1000px) rotateX(${(1 - scrollProgress) * 10}deg) translateZ(${(1 - scrollProgress) * -20}px)`,
    opacity: 0.5 + scrollProgress * 0.5,
    transition: 'transform 0.2s ease-out, opacity 0.2s ease-out'
  };

  return (
    <section id="for-hospitals" className="py-16 bg-[#FAF8F5] relative overflow-hidden">
      
      {/* Background Ambient Glow */}
      <div className="absolute left-1/3 bottom-0 w-96 h-96 rounded-full bg-[#0C4A3B]/5 blur-3xl pointer-events-none"></div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main Dashboard Card Container with 3D Tilt */}
        <div style={container3DStyle}>
          <TiltCard 
            maxDegree={8}
            className="bg-white/95 backdrop-blur-md rounded-3xl p-6 sm:p-8 border border-[#E6E2D8] shadow-xl text-left space-y-6"
          >
            
            {/* Dashboard Header */}
            <div className="flex items-center justify-between border-b border-[#F2EEE6] pb-4">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#0C4A3B] animate-ping"></span>
                <h3 className="text-[#1C2B22] font-sans text-sm font-semibold tracking-wide">
                  Hospital dashboard
                </h3>
              </div>
              <span className="text-xs text-[#5F6B63]">Updated just now</span>
            </div>

            {/* Emergency Cases List */}
            <div className="space-y-4">
              {cases.map((item) => (
                <div
                  key={item.id}
                  onClick={() => setSelectedCase(selectedCase?.id === item.id ? null : item)}
                  className="bg-[#FAF8F5] hover:bg-[#F4F0E6] transition-all duration-200 rounded-2xl p-4 sm:p-5 border border-[#EBE7DE] flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer group shadow-sm hover:shadow-md hover:-translate-y-0.5"
                >
                  <div className="flex items-start sm:items-center gap-4">
                    {/* Badge */}
                    <span className={`px-3 py-1 rounded-full text-xs font-bold shrink-0 shadow-sm ${item.badgeClass}`}>
                      {item.severity}
                    </span>

                    {/* Title & Department */}
                    <div className="space-y-0.5">
                      <h4 className="text-base font-semibold text-[#1C2B22] group-hover:text-[#0C4A3B] transition-colors">
                        {item.title}
                      </h4>
                      <p className="text-xs text-[#5F6B63]">
                        {item.department}
                      </p>
                    </div>
                  </div>

                  {/* ETA */}
                  <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                    <span className="text-sm font-medium text-[#1C2B22]">
                      {item.eta}
                    </span>
                    <ChevronRight className="w-4 h-4 text-gray-400 group-hover:translate-x-1.5 transition-transform" />
                  </div>
                </div>
              ))}
            </div>

            {/* Selected Case Detail Drawer */}
            {selectedCase && (
              <div className="bg-[#0C4A3B] text-white p-5 rounded-2xl space-y-2 animate-in fade-in duration-200 shadow-lg border border-[#72DFB4]/30">
                <div className="flex items-center justify-between text-xs text-[#72DFB4]">
                  <span className="font-bold uppercase tracking-wider">Medical Intelligence Summary</span>
                  <span>Case #{selectedCase.id}</span>
                </div>
                <p className="text-sm leading-relaxed">{selectedCase.aiSummary}</p>
              </div>
            )}

          </TiltCard>
        </div>

      </div>
    </section>
  );
}
