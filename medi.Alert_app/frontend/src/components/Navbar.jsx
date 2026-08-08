import React, { useState } from 'react';
import { Activity, Menu, X } from 'lucide-react';

export default function Navbar({ onOpenAuth }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-[#FAF8F5]/90 backdrop-blur-md border-b border-[#EBE7DE] transition-all">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        
        {/* Brand Logo */}
        <a href="#" className="flex items-center gap-2 group text-decoration-none">
          <div className="w-10 h-10 rounded-xl bg-[#0C4A3B] text-white flex items-center justify-center shadow-md transition-transform group-hover:scale-105">
            <Activity className="w-6 h-6 text-[#72DFB4]" />
          </div>
          <div className="flex items-baseline gap-1">
            <span className="font-serif-heading text-2xl font-bold text-[#0C4A3B] tracking-tight">MedAlert</span>
            <span className="text-xs font-semibold uppercase tracking-wider text-[#D9532F] bg-[#D9532F]/10 px-1.5 py-0.5 rounded">AI</span>
          </div>
        </a>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          <a href="#platform" className="text-sm font-medium text-[#4A554E] hover:text-[#0C4A3B] transition-colors">
            Platform
          </a>
          <a href="#for-hospitals" className="text-sm font-medium text-[#4A554E] hover:text-[#0C4A3B] transition-colors">
            For hospitals
          </a>
          <a href="#for-ambulances" className="text-sm font-medium text-[#4A554E] hover:text-[#0C4A3B] transition-colors">
            For ambulance teams
          </a>
          <a href="#about" className="text-sm font-medium text-[#4A554E] hover:text-[#0C4A3B] transition-colors">
            About
          </a>
        </nav>

        {/* Right CTA Actions */}
        <div className="hidden md:flex items-center gap-3">
          <button 
            onClick={() => onOpenAuth('signin')}
            className="text-sm font-medium text-[#0C4A3B] hover:text-[#063328] px-4 py-2 rounded-full hover:bg-[#E8F0EC] transition-all cursor-pointer"
          >
            Sign in
          </button>
          
          <button 
            onClick={() => onOpenAuth('signup', 'patient')}
            className="bg-[#0C4A3B] text-white text-sm font-semibold px-5 py-2.5 rounded-full hover:bg-[#08362B] shadow-sm hover:shadow transition-all cursor-pointer flex items-center gap-1.5"
          >
            Get Started
          </button>
        </div>

        {/* Mobile Menu Button */}
        <button 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden text-[#0C4A3B] p-2 rounded-lg hover:bg-[#E8F0EC]"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#FAF8F5] border-b border-[#EBE7DE] px-4 pt-2 pb-6 space-y-3">
          <a href="#platform" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-base font-medium text-[#4A554E]">Platform</a>
          <a href="#for-hospitals" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-base font-medium text-[#4A554E]">For hospitals</a>
          <a href="#for-ambulances" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-base font-medium text-[#4A554E]">For ambulance teams</a>
          <a href="#about" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-base font-medium text-[#4A554E]">About</a>
          <div className="pt-4 flex flex-col gap-2">
            <button 
              onClick={() => { setMobileMenuOpen(false); onOpenAuth('signin'); }}
              className="w-full text-center py-2.5 rounded-full border border-[#0C4A3B] text-[#0C4A3B] font-medium"
            >
              Sign in
            </button>
            <button 
              onClick={() => { setMobileMenuOpen(false); onOpenAuth('signup', 'patient'); }}
              className="w-full text-center py-2.5 rounded-full bg-[#0C4A3B] text-white font-medium shadow"
            >
              Create Account
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
