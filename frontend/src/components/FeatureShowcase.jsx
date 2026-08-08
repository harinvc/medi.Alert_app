import React, { useState } from 'react';
import { 
  Building2, 
  Navigation, 
  Users, 
  CheckCircle2, 
  ShieldAlert, 
  Sparkles, 
  Activity, 
  Clock, 
  ArrowRight 
} from 'lucide-react';
import TiltCard from './TiltCard';
import { useScroll3D } from '../hooks/useScroll3D';

export default function FeatureShowcase({ onOpenAuth }) {
  const [activeTab, setActiveTab] = useState('matching'); // 'matching', 'routing', 'family'
  const { scrollY } = useScroll3D();

  // Scroll 3D perspective transition
  const scrollProgress = Math.min(Math.max((scrollY - 700) / 500, 0), 1);
  const showcase3DStyle = {
    transform: `perspective(1000px) rotateX(${(1 - scrollProgress) * 10}deg) translateZ(${(1 - scrollProgress) * -20}px)`,
    opacity: 0.4 + scrollProgress * 0.6,
    transition: 'transform 0.2s ease-out, opacity 0.2s ease-out'
  };

  const featureTabs = [
    {
      id: 'matching',
      title: 'Smart Hospital Specialty Matcher',
      icon: Building2,
      tag: 'Resource Optimization',
      headline: 'The right ER bed, locked before arrival.',
      description: 'MedAlert AI analyzes incoming patient symptoms against live hospital bed capacity, ICU availability, and attending doctor specialties — eliminating emergency transfer delays.',
      metrics: [
        { label: 'Bed Reservation Time', val: '< 30 sec' },
        { label: 'Specialty Accuracy', val: '99.4%' }
      ],
      details: [
        'Real-time ICU & Trauma Bay bed hold',
        'Automatic medical department triage routing',
        'Direct doctor notification prior to door open'
      ]
    },
    {
      id: 'routing',
      title: 'Traffic Pre-emption Ambulance Route',
      icon: Navigation,
      tag: 'Priority Navigation',
      headline: 'Clear green light corridors for ambulances.',
      description: 'Integrates with city traffic management and GPS telemetry to calculate the absolute fastest route, pre-clearing signals and routing drivers around road closures.',
      metrics: [
        { label: 'Average Time Saved', val: '4.2 mins' },
        { label: 'Traffic Signal Sync', val: 'Automated' }
      ],
      details: [
        'Live turn-by-turn driver navigation HUD',
        'Traffic congestion bypass algorithms',
        'Continuous ETA synchronization with ER'
      ]
    },
    {
      id: 'family',
      title: 'Instant Family & Contact Alert Network',
      icon: Users,
      tag: 'Peace of Mind',
      headline: 'Loved ones notified with live GPS map links.',
      description: 'The moment an SOS is pressed, designated emergency contacts receive automated SMS alerts containing live tracking links, assigned ambulance vehicle details, and destination hospital info.',
      metrics: [
        { label: 'SMS Dispatch Time', val: 'Instant' },
        { label: 'Live Location Sharing', val: 'Encrypted' }
      ],
      details: [
        'Automated SMS with live map tracking link',
        'Driver contact details & vehicle plate number',
        'Hospital ER arrival status updates'
      ]
    }
  ];

  const currentFeature = featureTabs.find((f) => f.id === activeTab);

  return (
    <section className="py-20 bg-[#FAF8F5] border-t border-[#EBE7DE] relative overflow-hidden text-left">
      
      {/* Ambient background glow */}
      <div className="absolute right-10 top-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-[#0C4A3B]/5 blur-3xl pointer-events-none"></div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Title */}
        <div className="max-w-2xl space-y-3 mb-12" style={showcase3DStyle}>
          <span className="text-xs font-bold uppercase tracking-widest text-[#0C4A3B] bg-[#E8F0EC] px-3.5 py-1 rounded-full">
            Real-Time Coordination Capabilities
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif-heading font-medium text-[#1C2B22]">
            Built for split-second emergency decisions.
          </h2>
          <p className="text-base sm:text-lg text-[#4A554E]">
            Explore how MedAlert AI synchronizes patients, ambulance crews, and hospital ER departments in real time.
          </p>
        </div>

        {/* Feature Tab Navigation */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-8">
          {featureTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`p-5 rounded-2xl border text-left flex items-center gap-4 transition-all duration-200 cursor-pointer shadow-sm ${
                  isActive
                    ? 'border-[#0C4A3B] bg-[#0C4A3B] text-white ring-2 ring-[#0C4A3B]/20 shadow-lg translate-y-[-2px]'
                    : 'border-[#E6E2D8] bg-white text-[#1C2B22] hover:border-[#0C4A3B]/40 hover:bg-[#FAF8F5]'
                }`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                  isActive ? 'bg-[#72DFB4]/20 text-[#72DFB4]' : 'bg-[#E8F0EC] text-[#0C4A3B]'
                }`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <span className={`text-[10px] font-bold uppercase tracking-wider block ${isActive ? 'text-[#72DFB4]' : 'text-[#5F6B63]'}`}>
                    {tab.tag}
                  </span>
                  <h3 className={`text-sm font-semibold mt-0.5 ${isActive ? 'text-white' : 'text-[#1C2B22]'}`}>
                    {tab.title}
                  </h3>
                </div>
              </button>
            );
          })}
        </div>

        {/* Display Active Feature Showcase Card */}
        {currentFeature && (
          <TiltCard 
            maxDegree={6} 
            className="bg-white/95 backdrop-blur-md rounded-3xl p-8 sm:p-10 border border-[#E6E2D8] shadow-xl space-y-8"
          >
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              
              {/* Left Details */}
              <div className="lg:col-span-7 space-y-4">
                <span className="text-xs font-bold uppercase tracking-wider text-[#D9532F] bg-[#D9532F]/10 px-3 py-1 rounded-full inline-block">
                  {currentFeature.tag}
                </span>

                <h3 className="text-2xl sm:text-3xl font-serif-heading font-bold text-[#1C2B22]">
                  {currentFeature.headline}
                </h3>

                <p className="text-sm sm:text-base text-[#4A554E] leading-relaxed">
                  {currentFeature.description}
                </p>

                <div className="pt-2 space-y-2">
                  {currentFeature.details.map((point, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-xs font-semibold text-[#1C2B22]">
                      <CheckCircle2 className="w-4 h-4 text-[#0C4A3B] shrink-0" />
                      <span>{point}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Key Metrics Card */}
              <div className="lg:col-span-5 bg-[#FAF8F5] p-6 rounded-2xl border border-[#E6E2D8] space-y-6">
                <div className="flex items-center justify-between border-b border-[#EBE7DE] pb-3">
                  <span className="text-xs font-bold text-[#0C4A3B] uppercase tracking-wider">Performance Metrics</span>
                  <span className="w-2 h-2 rounded-full bg-[#0C4A3B] animate-ping"></span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {currentFeature.metrics.map((m, idx) => (
                    <div key={idx} className="bg-white p-4 rounded-xl border border-[#E6E2D8] text-center space-y-1">
                      <span className="text-2xl sm:text-3xl font-serif-heading font-bold text-[#0C4A3B]">{m.val}</span>
                      <span className="text-[11px] font-medium text-[#5F6B63] block">{m.label}</span>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => onOpenAuth('signup', 'patient')}
                  className="w-full bg-[#0C4A3B] text-white py-3 rounded-full text-xs font-semibold hover:bg-[#08362B] transition-all shadow cursor-pointer flex items-center justify-center gap-2"
                >
                  <span>Get Started with MedAlert AI</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

            </div>
          </TiltCard>
        )}

      </div>
    </section>
  );
}
