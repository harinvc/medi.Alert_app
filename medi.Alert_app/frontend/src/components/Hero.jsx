import React, { useState } from 'react';
import { Sparkles, Hospital, Ambulance, ShieldAlert } from 'lucide-react';
import { useScroll3D } from '../hooks/useScroll3D';

export default function Hero({ onOpenAuth }) {
  const [hoveredNode, setHoveredNode] = useState(null);
  const { scrollY } = useScroll3D();

  // Compute 3D perspective tilt & disappearance based on scroll position
  const textScrollRatio = Math.min(Math.max(scrollY / 400, 0), 1);
  const text3DStyle = {
    transform: `perspective(1000px) rotateX(${textScrollRatio * 18}deg) translateZ(${-textScrollRatio * 70}px) translateY(${-textScrollRatio * 30}px)`,
    opacity: 1 - textScrollRatio * 0.75,
    filter: `blur(${textScrollRatio * 3}px)`,
    transition: 'transform 0.1s linear, opacity 0.1s linear, filter 0.1s linear'
  };

  const radarScrollRatio = Math.min(Math.max(scrollY / 500, 0), 1);
  const radar3DStyle = {
    transform: `perspective(1000px) rotateX(${26 - radarScrollRatio * 12}deg) rotateY(${-14 + radarScrollRatio * 10}deg) scale(${1 - radarScrollRatio * 0.15})`,
    transition: 'transform 0.15s ease-out'
  };

  return (
    <section className="relative pt-12 pb-20 md:pt-16 md:pb-28 overflow-hidden">
      
      {/* Ambient Floating 3D Background Glow Blobs */}
      <div className="absolute top-10 left-1/4 w-96 h-96 rounded-full bg-gradient-to-tr from-[#0C4A3B]/10 to-[#72DFB4]/15 blur-3xl pointer-events-none animate-float-ambient"></div>
      <div className="absolute top-40 right-10 w-80 h-80 rounded-full bg-gradient-to-br from-[#D9532F]/10 to-transparent blur-3xl pointer-events-none animate-float-ambient" style={{ animationDelay: '-6s' }}></div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left Hero Content */}
          <div className="lg:col-span-7 space-y-6 text-left" style={text3DStyle}>
            
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#0C4A3B]/10 border border-[#0C4A3B]/20 shadow-sm backdrop-blur-md">
              <span className="w-2 h-2 rounded-full bg-[#0C4A3B] animate-ping"></span>
              <span className="text-xs font-bold tracking-widest text-[#0C4A3B] uppercase">
                Centralized Emergency Response
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl tracking-tight text-[#1C2B22] font-serif-heading font-medium leading-[1.14]">
              Care that starts{' '}
              <span className="italic font-normal text-[#0C4A3B] relative inline-block">
                before
                <span className="absolute bottom-0 left-0 w-full h-[3px] bg-[#0C4A3B]/30 rounded"></span>
              </span>{' '}
              the ambulance arrives.
            </h1>

            <p className="text-lg text-[#4A554E] max-w-xl leading-relaxed font-normal">
              MedAlert AI reads the emergency, finds the hospital actually equipped to help, and gets everyone moving in the same direction — patient, driver, and doctor.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-4">
              <button
                onClick={() => onOpenAuth('signup', 'patient')}
                className="bg-[#D9532F] text-white text-base font-semibold px-7 py-3.5 rounded-full hover:bg-[#C24522] shadow-md hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 cursor-pointer flex items-center gap-2 group"
              >
                <span>Get Started Free</span>
                <Sparkles className="w-5 h-5 group-hover:rotate-12 transition-transform text-white" />
              </button>

              <a
                href="#for-hospitals"
                className="bg-white/80 backdrop-blur-sm text-[#1C2B22] text-base font-medium px-7 py-3.5 rounded-full border border-[#D5CFB9] hover:border-[#0C4A3B] hover:bg-[#E8F0EC]/80 transition-all duration-200 cursor-pointer text-decoration-none shadow-sm"
              >
                For hospitals
              </a>
            </div>

            {/* Quick Live Feature Indicators */}
            <div className="pt-6 grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 border-t border-[#EBE7DE]">
              <div className="flex items-center gap-2 text-xs text-[#5F6B63]">
                <div className="w-2 h-2 rounded-full bg-[#0C4A3B]"></div>
                <span>AI Emergency Triage Engine</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-[#5F6B63]">
                <div className="w-2 h-2 rounded-full bg-[#D9532F]"></div>
                <span>Live Route Navigation</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-[#5F6B63]">
                <div className="w-2 h-2 rounded-full bg-[#72DFB4]"></div>
                <span>Direct ER Bed Lock</span>
              </div>
            </div>

          </div>

          {/* Right Holographic 3D Tilted Radar Visualization */}
          <div className="lg:col-span-5 flex justify-center items-center">
            <div 
              style={radar3DStyle} 
              className="relative w-[280px] h-[280px] sm:w-[420px] sm:h-[420px] flex items-center justify-center preserve-3d"
            >
              
              {/* Outer Radar Circle 3 with 3D Depth Shadow */}
              <div className="absolute inset-0 rounded-full border border-[#0C4A3B]/20 bg-[#0C4A3B]/[0.03] shadow-2xl backdrop-blur-[2px]"></div>

              {/* Middle Radar Circle 2 */}
              <div className="absolute w-3/4 h-3/4 rounded-full border border-[#0C4A3B]/30 bg-[#0C4A3B]/[0.04]"></div>

              {/* Inner Radar Circle 1 */}
              <div className="absolute w-1/2 h-1/2 rounded-full border border-[#0C4A3B]/40 bg-[#0C4A3B]/[0.06]"></div>

              {/* Crosshair Lines */}
              <div className="absolute inset-0 flex items-center justify-center opacity-25">
                <div className="w-full h-[1.5px] bg-[#0C4A3B]"></div>
                <div className="h-full w-[1.5px] bg-[#0C4A3B] absolute"></div>
              </div>

              {/* Rotating Radar Sweeper Beam */}
              <div className="absolute inset-0 rounded-full overflow-hidden pointer-events-none animate-radar-sweep opacity-40">
                <div className="w-1/2 h-1/2 bg-gradient-to-br from-[#72DFB4] via-[#0C4A3B]/40 to-transparent origin-bottom-right"></div>
              </div>

              {/* Center Patient Signal Dot */}
              <div 
                onMouseEnter={() => setHoveredNode('patient')}
                onMouseLeave={() => setHoveredNode(null)}
                className="relative z-30 w-10 h-10 rounded-full bg-[#D9532F] text-white flex items-center justify-center shadow-2xl cursor-pointer animate-pulse-dot transform translate-z-8"
              >
                <div className="w-3.5 h-3.5 rounded-full bg-white shadow-inner"></div>
                <div className="absolute inset-0 rounded-full border-2 border-[#D9532F] animate-ping opacity-75"></div>

                {/* Hover Tooltip */}
                {hoveredNode === 'patient' && (
                  <div className="absolute bottom-full mb-4 left-1/2 -translate-x-1/2 w-52 p-3 bg-[#1C2B22] text-white text-xs rounded-2xl shadow-2xl z-40 pointer-events-none border border-[#72DFB4]/30 animate-in fade-in zoom-in duration-150">
                    <p className="font-semibold text-[#72DFB4] flex items-center gap-1">
                      <ShieldAlert className="w-3.5 h-3.5 text-[#D9532F]" /> Patient SOS Triggered
                    </p>
                    <p className="text-gray-300 text-[11px] mt-1">Location: 12.9716° N, 77.5946° E</p>
                    <span className="text-[10px] bg-[#D9532F] px-2 py-0.5 rounded-full font-bold uppercase mt-1.5 inline-block shadow">RED Priority</span>
                  </div>
                )}
              </div>

              {/* Node 1: Nearby Ambulance 04 */}
              <div 
                onMouseEnter={() => setHoveredNode('ambulance')}
                onMouseLeave={() => setHoveredNode(null)}
                className="absolute top-12 right-14 z-30 cursor-pointer group transform translate-z-6"
              >
                <div className="relative w-6 h-6 rounded-full bg-[#0C4A3B] border-2 border-white shadow-xl flex items-center justify-center transition-transform group-hover:scale-125">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#72DFB4]"></div>
                </div>

                {hoveredNode === 'ambulance' && (
                  <div className="absolute bottom-full mb-3 right-0 w-48 p-3 bg-[#0C4A3B] text-white text-xs rounded-2xl shadow-2xl z-40 pointer-events-none border border-[#72DFB4]/30">
                    <p className="font-semibold flex items-center gap-1 text-[#72DFB4]">
                      <Ambulance className="w-4 h-4 text-[#72DFB4]"/> Ambulance #04
                    </p>
                    <p className="text-gray-200 text-[11px] mt-1">En Route • 3.2 mins away</p>
                  </div>
                )}
              </div>

              {/* Node 2: City Cardiac Hospital */}
              <div 
                onMouseEnter={() => setHoveredNode('hospital')}
                onMouseLeave={() => setHoveredNode(null)}
                className="absolute left-8 top-1/2 -translate-y-1/2 z-30 cursor-pointer group transform translate-z-6"
              >
                <div className="relative w-6 h-6 rounded-full bg-[#0C4A3B] border-2 border-white shadow-xl flex items-center justify-center transition-transform group-hover:scale-125">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#72DFB4]"></div>
                </div>

                {hoveredNode === 'hospital' && (
                  <div className="absolute top-full mt-3 left-0 w-52 p-3 bg-[#0C4A3B] text-white text-xs rounded-2xl shadow-2xl z-40 pointer-events-none border border-[#72DFB4]/30">
                    <p className="font-semibold flex items-center gap-1 text-[#72DFB4]">
                      <Hospital className="w-4 h-4 text-[#72DFB4]"/> City Cardiac Center
                    </p>
                    <p className="text-gray-200 text-[11px] mt-1">Cardiology Bed #4 Reserved</p>
                  </div>
                )}
              </div>

              {/* Node 3: Metro ER Unit */}
              <div 
                onMouseEnter={() => setHoveredNode('er')}
                onMouseLeave={() => setHoveredNode(null)}
                className="absolute bottom-14 right-20 z-30 cursor-pointer group transform translate-z-6"
              >
                <div className="relative w-6 h-6 rounded-full bg-[#0C4A3B] border-2 border-white shadow-xl flex items-center justify-center transition-transform group-hover:scale-125">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#72DFB4]"></div>
                </div>

                {hoveredNode === 'er' && (
                  <div className="absolute top-full mt-3 right-0 w-48 p-3 bg-[#0C4A3B] text-white text-xs rounded-2xl shadow-2xl z-40 pointer-events-none border border-[#72DFB4]/30">
                    <p className="font-semibold text-[#72DFB4]">Metro ER Unit</p>
                    <p className="text-gray-200 text-[11px] mt-1">Trauma Bay 2 Ready</p>
                  </div>
                )}
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
