import React from 'react';

export default function StatsBar() {
  return (
    <section className="py-12 border-y border-[#EBE7DE] bg-[#FAF8F5]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-[#EBE7DE]">
          
          {/* Stat 1 */}
          <div className="py-6 md:py-0 md:px-8 text-center md:text-left space-y-1">
            <h3 className="text-4xl sm:text-5xl font-serif-heading font-semibold text-[#0C4A3B]">
              6.2 sec
            </h3>
            <p className="text-sm font-medium text-[#5F6B63] tracking-wide">
              average triage time
            </p>
          </div>

          {/* Stat 2 */}
          <div className="py-6 md:py-0 md:px-8 text-center md:text-left space-y-1">
            <h3 className="text-4xl sm:text-5xl font-serif-heading font-semibold text-[#0C4A3B]">
              340+
            </h3>
            <p className="text-sm font-medium text-[#5F6B63] tracking-wide">
              hospitals connected
            </p>
          </div>

          {/* Stat 3 */}
          <div className="py-6 md:py-0 md:px-8 text-center md:text-left space-y-1">
            <h3 className="text-4xl sm:text-5xl font-serif-heading font-semibold text-[#0C4A3B]">
              98%
            </h3>
            <p className="text-sm font-medium text-[#5F6B63] tracking-wide">
              correct department match
            </p>
          </div>

        </div>
      </div>
    </section>
  );
}
