import React, { useState } from 'react';
import { ShieldCheck, HeartPulse, AlertCircle, FileText, User, Edit3, CheckCircle2 } from 'lucide-react';
import TiltCard from '../TiltCard';

export default function MedicalProfile({ profile, onUpdateProfile }) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ ...profile });
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    onUpdateProfile(formData);
    setIsEditing(false);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <div className="space-y-6 text-left animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="bg-white/90 backdrop-blur-md p-6 sm:p-8 rounded-3xl border border-[#E6E2D8] shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <span className="text-xs font-bold uppercase tracking-wider text-[#0C4A3B] flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-[#0C4A3B]" /> Medical Profile & Emergency Passport
          </span>
          <h2 className="text-2xl sm:text-3xl font-serif-heading font-medium text-[#1C2B22]">
            Critical Health Information
          </h2>
          <p className="text-xs sm:text-sm text-[#5F6B63]">
            This data is encrypted and shared directly with ER paramedics and attending doctors when an SOS is activated.
          </p>
        </div>

        <button
          onClick={() => setIsEditing(!isEditing)}
          className="bg-[#0C4A3B] text-white px-5 py-2.5 rounded-full text-xs font-semibold hover:bg-[#08362B] transition-all shadow cursor-pointer flex items-center gap-2 shrink-0 self-start sm:self-center"
        >
          <Edit3 className="w-4 h-4" />
          <span>{isEditing ? 'Cancel Edit' : 'Edit Medical Profile'}</span>
        </button>
      </div>

      {savedSuccess && (
        <div className="bg-[#E8F0EC] border border-[#0C4A3B]/30 p-4 rounded-2xl flex items-center gap-2 text-xs font-bold text-[#0C4A3B] animate-in fade-in duration-200">
          <CheckCircle2 className="w-4 h-4" /> Medical Profile Updated Successfully!
        </div>
      )}

      {isEditing ? (
        /* Edit Mode Form */
        <form onSubmit={handleSubmit} className="bg-white p-6 sm:p-8 rounded-3xl border border-[#E6E2D8] shadow-xl space-y-6">
          <h3 className="text-lg font-serif-heading font-bold text-[#1C2B22]">Edit Medical Details</h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-[#1C2B22]">Blood Group</label>
              <select
                value={formData.bloodGroup}
                onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-[#E6E2D8] bg-[#FAF8F5] text-sm focus:outline-none focus:border-[#0C4A3B]"
              >
                {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((bg) => (
                  <option key={bg} value={bg}>{bg}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-semibold text-[#1C2B22]">Organ Donor Status</label>
              <select
                value={formData.organDonor ? 'Yes' : 'No'}
                onChange={(e) => setFormData({ ...formData, organDonor: e.target.value === 'Yes' })}
                className="w-full px-4 py-2.5 rounded-xl border border-[#E6E2D8] bg-[#FAF8F5] text-sm focus:outline-none focus:border-[#0C4A3B]"
              >
                <option value="Yes">Registered Organ Donor</option>
                <option value="No">Not Registered</option>
              </select>
            </div>

            <div className="space-y-1 sm:col-span-2">
              <label className="block text-xs font-semibold text-[#1C2B22]">Known Allergies (Penicillin, Latex, Nuts, etc.)</label>
              <input
                type="text"
                value={formData.allergies}
                onChange={(e) => setFormData({ ...formData, allergies: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-[#E6E2D8] bg-[#FAF8F5] text-sm focus:outline-none focus:border-[#0C4A3B]"
              />
            </div>

            <div className="space-y-1 sm:col-span-2">
              <label className="block text-xs font-semibold text-[#1C2B22]">Chronic Conditions / Past Surgeries</label>
              <textarea
                rows="2"
                value={formData.chronicConditions}
                onChange={(e) => setFormData({ ...formData, chronicConditions: e.target.value })}
                className="w-full p-3 rounded-xl border border-[#E6E2D8] bg-[#FAF8F5] text-sm focus:outline-none focus:border-[#0C4A3B]"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-semibold text-[#1C2B22]">Primary Physician Name</label>
              <input
                type="text"
                value={formData.physicianName}
                onChange={(e) => setFormData({ ...formData, physicianName: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-[#E6E2D8] bg-[#FAF8F5] text-sm focus:outline-none focus:border-[#0C4A3B]"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-semibold text-[#1C2B22]">Physician Phone</label>
              <input
                type="tel"
                value={formData.physicianPhone}
                onChange={(e) => setFormData({ ...formData, physicianPhone: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-[#E6E2D8] bg-[#FAF8F5] text-sm focus:outline-none focus:border-[#0C4A3B]"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="px-5 py-2.5 rounded-full text-xs font-semibold text-[#5F6B63] hover:bg-[#EBE7DE]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-7 py-2.5 rounded-full bg-[#0C4A3B] text-white text-xs font-semibold hover:bg-[#08362B] transition-colors shadow"
            >
              Save Profile Changes
            </button>
          </div>
        </form>
      ) : (
        /* Read-Only Passport Card Grid */
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Blood Type & Donor Status Card */}
          <TiltCard maxDegree={6} className="bg-white/90 backdrop-blur-md rounded-3xl p-6 border border-[#E6E2D8] shadow-md space-y-4">
            <span className="text-[10px] font-bold text-[#0C4A3B] uppercase tracking-wider block">Vital Profile</span>
            
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-[#D9532F] text-white flex flex-col items-center justify-center font-bold shadow-lg">
                <span className="text-xs uppercase text-white/80">Blood</span>
                <span className="text-2xl">{formData.bloodGroup}</span>
              </div>
              <div className="space-y-1">
                <span className="text-xs font-semibold text-[#0C4A3B] bg-[#E8F0EC] px-2.5 py-0.5 rounded-full inline-block">
                  {formData.organDonor ? 'Registered Organ Donor' : 'Not Registered'}
                </span>
                <p className="text-xs text-[#5F6B63]">Emergency Blood Card Verified</p>
              </div>
            </div>
          </TiltCard>

          {/* Allergies Card */}
          <TiltCard maxDegree={6} className="bg-white/90 backdrop-blur-md rounded-3xl p-6 border border-[#E6E2D8] shadow-md space-y-3">
            <span className="text-[10px] font-bold text-[#D9532F] uppercase tracking-wider block flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5 text-[#D9532F]" /> Severe Allergies
            </span>
            <p className="text-sm font-semibold text-[#1C2B22]">{formData.allergies || 'No known allergies listed'}</p>
            <p className="text-xs text-[#5F6B63]">Auto-flagged for ER Anesthesiologists</p>
          </TiltCard>

          {/* Chronic Conditions Card */}
          <TiltCard maxDegree={6} className="bg-white/90 backdrop-blur-md rounded-3xl p-6 border border-[#E6E2D8] shadow-md space-y-3">
            <span className="text-[10px] font-bold text-[#0C4A3B] uppercase tracking-wider block">Medical History</span>
            <p className="text-xs text-[#1C2B22] leading-relaxed font-medium">{formData.chronicConditions}</p>
            <p className="text-[11px] text-[#5F6B63]">Primary Doctor: {formData.physicianName} ({formData.physicianPhone})</p>
          </TiltCard>

        </div>
      )}

    </div>
  );
}
