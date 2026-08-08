import React from 'react';
import { Activity, Heart, Shield } from 'lucide-react';

export default function Footer({ onOpenAuth }) {
  return (
    <footer className="bg-[#FAF8F5] border-t border-[#EBE7DE] py-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 text-left">
        
        {/* Main Footer Headline */}
        <div className="text-center py-6">
          <p className="text-lg sm:text-xl font-serif-heading font-normal text-[#4A554E]">
            MedAlert AI — built so the right help finds you faster.
          </p>
        </div>

        {/* Footer Navigation Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pt-8 border-t border-[#EBE7DE]">
          
          {/* Brand Col */}
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#0C4A3B] text-white flex items-center justify-center">
                <Activity className="w-5 h-5 text-[#72DFB4]" />
              </div>
              <span className="font-serif-heading text-xl font-bold text-[#0C4A3B]">MedAlert</span>
            </div>
            <p className="text-xs text-[#5F6B63] leading-relaxed">
              AI-powered centralized medical emergency response and triage alert network.
            </p>
          </div>

          {/* Platform Links */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#0C4A3B]">Platform</h4>
            <ul className="space-y-1.5 text-xs text-[#5F6B63]">
              <li><a href="#platform" className="hover:text-[#0C4A3B]">Emergency Triage Engine</a></li>
              <li><a href="#platform" className="hover:text-[#0C4A3B]">Hospital Matching Engine</a></li>
              <li><a href="#platform" className="hover:text-[#0C4A3B]">Live Ambulance Dispatch</a></li>
              <li><a href="#platform" className="hover:text-[#0C4A3B]">Family SMS Alerts</a></li>
            </ul>
          </div>

          {/* Accounts Links */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#0C4A3B]">Accounts & Portals</h4>
            <ul className="space-y-1.5 text-xs text-[#5F6B63]">
              <li><button onClick={() => onOpenAuth('signup', 'patient')} className="hover:text-[#0C4A3B] cursor-pointer">Patient Registration</button></li>
              <li><button onClick={() => onOpenAuth('signup', 'ambulance')} className="hover:text-[#0C4A3B] cursor-pointer">Ambulance Driver Signup (License Upload)</button></li>
              <li><button onClick={() => onOpenAuth('signup', 'doctor')} className="hover:text-[#0C4A3B] cursor-pointer">Doctor & ER Registration (Proof Upload)</button></li>
              <li><button onClick={() => onOpenAuth('signin')} className="hover:text-[#0C4A3B] cursor-pointer">Member Sign In</button></li>
            </ul>
          </div>

          {/* Compliance & Tech */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#0C4A3B]">Technology Stack</h4>
            <ul className="space-y-1.5 text-xs text-[#5F6B63]">
              <li>AI Emergency Triage Engine</li>
              <li>Google Maps & Routes API</li>
              <li>React 19 + Tailwind CSS</li>
              <li>PHP MySQL Backend Services</li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-[#EBE7DE] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#5F6B63]">
          <p>© {new Date().getFullYear()} MedAlert AI. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <a href="#" className="hover:text-[#0C4A3B]">Privacy Policy</a>
            <a href="#" className="hover:text-[#0C4A3B]">Terms of Service</a>
            <a href="#" className="hover:text-[#0C4A3B]">Emergency Hotline</a>
          </div>
        </div>

      </div>
    </footer>
  );
}
