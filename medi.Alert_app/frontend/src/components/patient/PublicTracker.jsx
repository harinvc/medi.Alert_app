import React, { useState, useEffect } from 'react';
import LiveAmbulanceTracker from './LiveAmbulanceTracker';
import socket from '../../services/socket';
import { ArrowLeft } from 'lucide-react';

export default function PublicTracker({ trackId }) {
  const [activeSOS, setActiveSOS] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSOS = async () => {
      try {
        const res = await fetch((import.meta.env.VITE_BACKEND_URL || "") + "/api/sos/active");
        const data = await res.json();
        if (data.success && data.sos) {
          if (data.sos.id === trackId) {
            setActiveSOS(data.sos);
          } else {
            setActiveSOS(null);
          }
        }
      } catch (e) {
        console.error("Failed to fetch SOS", e);
        setActiveSOS(null);
      }
      setLoading(false);
    };
    fetchSOS();

    socket.on('sos:broadcast', (newSos) => {
      if (newSos.id === trackId) {
        setActiveSOS(prev => ({ ...prev, ...newSos }));
      }
    });

    return () => {
      socket.off('sos:broadcast');
    };
  }, [trackId]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-[#FAF8F5]">Loading Live Tracker...</div>;
  }

  if (!activeSOS) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#FAF8F5] text-center p-6">
        <h2 className="text-2xl font-serif-heading font-bold text-[#1C2B22] mb-2">Tracking Link Expired or Invalid</h2>
        <p className="text-[#5F6B63] max-w-md mb-6">The emergency tracking link you are trying to access is no longer active or does not exist.</p>
        <a href="/" className="bg-[#0C4A3B] text-white px-6 py-3 rounded-xl font-bold">Return Home</a>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF8F5] p-4 sm:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <a href="/" className="bg-white p-2 rounded-full shadow hover:bg-gray-50 transition-colors">
            <ArrowLeft className="w-5 h-5 text-[#1C2B22]" />
          </a>
          <h1 className="text-2xl font-serif-heading font-bold text-[#1C2B22]">Live Public Tracker</h1>
        </div>
        <LiveAmbulanceTracker activeSOS={activeSOS} />
      </div>
    </div>
  );
}
