import React, { useState } from 'react';
import { Lock, Mail, ArrowRight, CheckCircle2 } from 'lucide-react';
import TiltCard from './TiltCard';
import { useScroll3D } from '../hooks/useScroll3D';

export default function AuthSection({ onOpenAuth }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [signedIn, setSignedIn] = useState(false);
  const { scrollY } = useScroll3D();

  // Scroll perspective
  const scrollProgress = Math.min(Math.max((scrollY - 800) / 500, 0), 1);
  const text3DStyle = {
    transform: `perspective(1000px) rotateX(${(1 - scrollProgress) * 12}deg) translateZ(${(1 - scrollProgress) * -30}px)`,
    opacity: 0.4 + scrollProgress * 0.6,
    transition: 'transform 0.2s ease-out, opacity 0.2s ease-out'
  };

  const handleInlineLogin = (e) => {
    e.preventDefault();
    setSignedIn(true);
    setTimeout(() => setSignedIn(false), 3000);
  };

  return (
    <section className="py-20 bg-[#FAF8F5] border-t border-[#EBE7DE] relative overflow-hidden">
      
      {/* Background Ambient Glow */}
      <div className="absolute right-0 top-1/3 w-80 h-80 rounded-full bg-[#D9532F]/5 blur-3xl pointer-events-none"></div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Text Column with 3D Scroll Perspective */}
          <div className="lg:col-span-6 text-left space-y-6" style={text3DStyle}>
            <h2 className="text-4xl sm:text-5xl font-serif-heading font-medium text-[#1C2B22] leading-tight">
              Signing in should be the calmest part.
            </h2>
            <p className="text-lg text-[#4A554E] max-w-lg leading-relaxed">
              Clean, familiar, no friction — because everything urgent happens after this screen, not on it.
            </p>
            
            <div className="pt-4 flex flex-wrap gap-4">
              <div className="flex items-center gap-2 text-xs font-semibold text-[#0C4A3B] bg-[#E8F0EC] px-3.5 py-1.5 rounded-full shadow-sm">
                <CheckCircle2 className="w-4 h-4" />
                <span>Single Sign-On (SSO) Ready</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-semibold text-[#0C4A3B] bg-[#E8F0EC] px-3.5 py-1.5 rounded-full shadow-sm">
                <CheckCircle2 className="w-4 h-4" />
                <span>HIPAA & GDPR Compliant</span>
              </div>
            </div>
          </div>

          {/* Right Inline Sign-In Card with 3D TiltCard Wrapper */}
          <div className="lg:col-span-6 flex justify-center lg:justify-end">
            <TiltCard 
              maxDegree={10} 
              className="bg-white/90 backdrop-blur-md max-w-md w-full rounded-3xl p-8 border border-[#E6E2D8] shadow-xl text-left space-y-6"
            >
              
              <div className="space-y-1">
                <h3 className="text-2xl font-serif-heading font-semibold text-[#1C2B22]">
                  Welcome back
                </h3>
                <p className="text-xs text-[#5F6B63]">
                  Sign in to your MedAlert account
                </p>
              </div>

              {signedIn ? (
                <div className="py-8 text-center space-y-3 bg-[#E8F0EC] rounded-2xl p-4 border border-[#0C4A3B]/20 animate-in fade-in zoom-in duration-200">
                  <CheckCircle2 className="w-8 h-8 text-[#0C4A3B] mx-auto" />
                  <p className="text-sm font-semibold text-[#0C4A3B]">Access Authorized</p>
                  <p className="text-xs text-[#5F6B63]">Loading live dispatch queue...</p>
                </div>
              ) : (
                <form onSubmit={handleInlineLogin} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-[#1C2B22]">Email</label>
                    <input 
                      type="email"
                      required
                      placeholder="name@hospital.org"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-[#E6E2D8] bg-[#FAF8F5] text-sm focus:outline-none focus:border-[#0C4A3B] focus:ring-1 focus:ring-[#0C4A3B] transition-colors"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-[#1C2B22]">Password</label>
                    <input 
                      type="password"
                      required
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-[#E6E2D8] bg-[#FAF8F5] text-sm focus:outline-none focus:border-[#0C4A3B] focus:ring-1 focus:ring-[#0C4A3B] transition-colors"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-[#0C4A3B] text-white py-3.5 rounded-2xl font-semibold text-sm hover:bg-[#08362B] transition-all shadow-md hover:shadow-xl cursor-pointer mt-2"
                  >
                    Sign in
                  </button>

                  <div className="pt-2 text-center text-xs text-[#5F6B63] space-x-2">
                    <a href="#" className="hover:underline text-gray-500">Forgot password?</a>
                    <span>·</span>
                    <button 
                      type="button" 
                      onClick={() => onOpenAuth('signup', 'patient')}
                      className="text-[#0C4A3B] font-semibold hover:underline cursor-pointer"
                    >
                      New user? Create an account
                    </button>
                  </div>
                </form>
              )}

            </TiltCard>
          </div>

        </div>
      </div>
    </section>
  );
}
