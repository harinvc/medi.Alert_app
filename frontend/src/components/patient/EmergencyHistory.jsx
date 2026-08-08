import React from 'react';
import { Clock, CheckCircle2, AlertTriangle, FileText, ChevronRight, Sparkles, Hospital, Ambulance } from 'lucide-react';
import TiltCard from '../TiltCard';

export default function EmergencyHistory({ historyLogs }) {
  return (
    <div className="space-y-6 text-left animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="bg-white/90 backdrop-blur-md p-6 sm:p-8 rounded-3xl border border-[#E6E2D8] shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <span className="text-xs font-bold uppercase tracking-wider text-[#0C4A3B] flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-[#0C4A3B]" /> Emergency Logs & Archived Cases
          </span>
          <h2 className="text-2xl sm:text-3xl font-serif-heading font-medium text-[#1C2B22]">
            Incident History & Medical Summaries
          </h2>
          <p className="text-xs sm:text-sm text-[#5F6B63]">
            Complete record of past SOS dispatches, MedAlert AI case summaries, and emergency response metrics.
          </p>
        </div>
      </div>

      {/* History Items List */}
      <div className="space-y-4">
        {historyLogs.map((log) => (
          <TiltCard
            key={log.id}
            maxDegree={4}
            className="bg-white/90 backdrop-blur-md rounded-3xl p-6 border border-[#E6E2D8] shadow-md hover:shadow-xl transition-all space-y-4"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#F2EEE6] pb-3">
              <div className="flex items-center gap-3">
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                  log.priority === 'RED' ? 'bg-[#FCEBE6] text-[#D9532F] border border-[#F5C2B8]' : 'bg-[#FEF3D6] text-[#B45309]'
                }`}>
                  {log.priority} Priority
                </span>
                <span className="text-sm font-bold text-[#1C2B22] font-mono">{log.id}</span>
                <span className="text-xs text-[#5F6B63]">{log.date} at {log.time}</span>
              </div>

              <span className="text-xs font-semibold text-[#0C4A3B] bg-[#E8F0EC] px-3 py-1 rounded-full self-start sm:self-center">
                Completed • Response Time: {log.responseTime}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">Reported Emergency</span>
                <h4 className="text-base font-bold text-[#1C2B22]">{log.emergencyType}</h4>
                <p className="text-xs text-[#5F6B63]">{log.location}</p>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#0C4A3B] block flex items-center gap-1">
                  <Hospital className="w-3.5 h-3.5" /> Admitting Hospital
                </span>
                <h4 className="text-sm font-bold text-[#1C2B22]">{log.hospitalName}</h4>
                <p className="text-xs text-[#0C4A3B] font-medium">{log.department}</p>
              </div>
            </div>

            {/* AI Summary Box */}
            <div className="bg-[#FAF8F5] p-4 rounded-2xl border border-[#E6E2D8] space-y-1">
              <span className="text-[10px] font-bold text-[#0C4A3B] uppercase flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-[#0C4A3B]" /> MedAlert AI Medical Case Log
              </span>
              <p className="text-xs text-[#1C2B22] leading-relaxed">{log.aiSummary}</p>
            </div>
          </TiltCard>
        ))}
      </div>

    </div>
  );
}
