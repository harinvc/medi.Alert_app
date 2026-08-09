import React, { useState } from 'react';
import { Users, Plus, Phone, Trash2, Edit3, Send, CheckCircle2, Shield, Heart, MessageCircle } from 'lucide-react';
import TiltCard from '../TiltCard';

export default function EmergencyContacts({ contacts, onUpdateContacts, activeSOS }) {
  const [isAdding, setIsAdding] = useState(false);
  const [name, setName] = useState('');
  const [relationship, setRelationship] = useState('Spouse');
  const [phone, setPhone] = useState('');
  const [notifySms, setNotifySms] = useState(true);
  const [testSentId, setTestSentId] = useState(null);

  const handleAddContact = (e) => {
    e.preventDefault();
    if (!name || !phone) return;

    const newContact = {
      id: `c-${Date.now()}`,
      name,
      relationship,
      phone,
      notifySms
    };

    onUpdateContacts([...contacts, newContact]);
    setName('');
    setPhone('');
    setIsAdding(false);
  };

  const handleRemoveContact = (id) => {
    onUpdateContacts(contacts.filter((c) => c.id !== id));
  };

  const handleSendTestSMS = (contact) => {
    setTestSentId(contact.id);
    setTimeout(() => {
      setTestSentId(null);
    }, 2500);
  };

  const sendEmergencyWhatsApp = (phoneNumber, patientName, hospital, eta) => {
    if (!activeSOS) {
      alert("Please trigger an SOS emergency first to generate a live tracking link.");
      return;
    }
    const trackingId = activeSOS.id;
    const trackingLink = `https://digital-leave-combining-tapes.trycloudflare.com/?track=${trackingId}`;
    const message = `🚨 MEDALERT EMERGENCY ALERT 🚨

Patient: ${patientName}

An emergency has been detected.

🏥 Hospital: ${hospital}
🚑 Ambulance ETA: ${eta}
📍 Live Location & Vitals: ${trackingLink}

Please contact the patient/ambulance immediately.

This is an automated MedAlert AI alert.`;

    // Clean phone number (remove +, spaces, parentheses) for wa.me link
    const cleanPhone = phoneNumber ? phoneNumber.replace(/\D/g, '') : '';
    const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, "_blank");
  };

  return (
    <div className="space-y-6 text-left animate-in fade-in duration-300">
      
      {/* Header Banner */}
      <div className="bg-white/90 backdrop-blur-md p-6 sm:p-8 rounded-3xl border border-[#E6E2D8] shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <span className="text-xs font-bold uppercase tracking-wider text-[#0C4A3B] flex items-center gap-1.5">
            <Users className="w-4 h-4 text-[#0C4A3B]" /> Emergency Contacts & Relatives
          </span>
          <h2 className="text-2xl sm:text-3xl font-serif-heading font-medium text-[#1C2B22]">
            Automatic Family Alert Network
          </h2>
          <p className="text-xs sm:text-sm text-[#5F6B63]">
            When you trigger the SOS button, MedAlert AI automatically dispatches live location SMS alerts to these contacts.
          </p>
        </div>

        <button
          onClick={() => setIsAdding(!isAdding)}
          className="bg-[#0C4A3B] text-white px-5 py-2.5 rounded-full text-xs font-semibold hover:bg-[#08362B] transition-all shadow cursor-pointer flex items-center gap-2 shrink-0 self-start sm:self-center"
        >
          <Plus className="w-4 h-4" />
          <span>Add Emergency Contact</span>
        </button>
      </div>

      {/* Add Contact Form Modal / Drawer */}
      {isAdding && (
        <form onSubmit={handleAddContact} className="bg-[#E8F0EC] p-6 rounded-3xl border border-[#0C4A3B]/30 space-y-4 animate-in fade-in zoom-in duration-200">
          <h3 className="text-base font-serif-heading font-bold text-[#0C4A3B]">Add New Emergency Contact</h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-[#1C2B22]">Contact Name</label>
              <input
                type="text"
                required
                placeholder="Sarah Connor"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-[#E6E2D8] bg-white text-sm focus:outline-none focus:border-[#0C4A3B]"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-semibold text-[#1C2B22]">Relationship</label>
              <select
                value={relationship}
                onChange={(e) => setRelationship(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-[#E6E2D8] bg-white text-sm focus:outline-none focus:border-[#0C4A3B]"
              >
                <option value="Spouse">Spouse / Partner</option>
                <option value="Parent">Parent</option>
                <option value="Child">Son / Daughter</option>
                <option value="Sibling">Brother / Sister</option>
                <option value="Friend">Close Friend / Neighbor</option>
                <option value="Doctor">Personal Physician</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-semibold text-[#1C2B22]">Phone Number</label>
              <input
                type="tel"
                required
                placeholder="+1 (555) 019-2834"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-[#E6E2D8] bg-white text-sm focus:outline-none focus:border-[#0C4A3B]"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <label className="flex items-center gap-2 text-xs text-[#1C2B22] cursor-pointer">
              <input
                type="checkbox"
                checked={notifySms}
                onChange={(e) => setNotifySms(e.target.checked)}
                className="rounded border-[#E6E2D8] text-[#0C4A3B] focus:ring-[#0C4A3B]"
              />
              <span>Send Instant SMS & Live Location Map link during SOS</span>
            </label>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="px-4 py-2 rounded-full text-xs font-semibold text-[#5F6B63] hover:bg-white/50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2 rounded-full bg-[#0C4A3B] text-white text-xs font-semibold hover:bg-[#08362B] transition-colors shadow"
              >
                Save Contact
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Contacts List Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {contacts.map((contact) => (
          <TiltCard
            key={contact.id}
            maxDegree={6}
            className="bg-white/90 backdrop-blur-md rounded-3xl p-6 border border-[#E6E2D8] shadow-md hover:shadow-xl transition-all space-y-4"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-[#E8F0EC] text-[#0C4A3B] flex items-center justify-center font-bold text-lg">
                  {contact.name.charAt(0)}
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#1C2B22]">{contact.name}</h3>
                  <span className="text-xs font-semibold text-[#0C4A3B] bg-[#E8F0EC] px-2.5 py-0.5 rounded-full inline-block mt-0.5">
                    {contact.relationship}
                  </span>
                </div>
              </div>

              <button
                onClick={() => handleRemoveContact(contact.id)}
                className="text-gray-400 hover:text-[#D9532F] p-1.5 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
                title="Remove Contact"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-[#FAF8F5] p-3 rounded-2xl border border-[#E6E2D8] flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-[#1C2B22]">
                <Phone className="w-4 h-4 text-[#0C4A3B]" />
                <span className="font-mono">{contact.phone}</span>
              </div>
              <span className="text-[11px] text-[#0C4A3B] font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#0C4A3B]" /> Auto SMS On
              </span>
            </div>

            {/* Test Alert Button */}
            <div className="pt-2 flex items-center justify-between">
              {testSentId === contact.id ? (
                <span className="text-xs text-[#0C4A3B] font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4 text-[#0C4A3B]" /> Test SMS Sent to {contact.phone}!
                </span>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleSendTestSMS(contact)}
                    className="text-xs text-[#0C4A3B] font-semibold hover:underline flex items-center gap-1.5 cursor-pointer bg-[#E8F0EC] px-3 py-1.5 rounded-full"
                  >
                    <Send className="w-3.5 h-3.5" /> SMS Alert
                  </button>
                  <button
                    onClick={() => sendEmergencyWhatsApp(contact.phone.replace(/\D/g, ''), 'Alex Johnson', 'City Cardiac Institute', '3 mins')}
                    className="text-xs text-[#0C4A3B] font-semibold hover:underline flex items-center gap-1.5 cursor-pointer bg-[#E8F0EC] px-3 py-1.5 rounded-full hover:bg-green-100 hover:text-green-700 transition-colors"
                  >
                    <MessageCircle className="w-3.5 h-3.5" /> WhatsApp
                  </button>
                </div>
              )}
            </div>
          </TiltCard>
        ))}
      </div>

    </div>
  );
}
