import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { Ambulance, MapPin, Hospital, Navigation, LocateFixed, Zap, Play, Pause, RefreshCw } from 'lucide-react';

export default function RealMapTracker({ activeSOS }) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const ambulanceMarkerRef = useRef(null);
  const animationFrameRef = useRef(null);

  const [isPlaying, setIsPlaying] = useState(true);
  const [progress, setProgress] = useState(0.55); // 55% along path
  const [currentSpeed, setCurrentSpeed] = useState(64);
  const [distanceRemaining, setDistanceRemaining] = useState('1.8 km');
  const [etaRemaining, setEtaRemaining] = useState('3.4 min');

  // Coordinates: Station -> Patient -> Hospital
  // Default coordinates centered around a urban district
  const stationCoords = [12.9820, 77.5890];
  const patientCoords = [12.9716, 77.6010];
  const hospitalCoords = [12.9580, 77.6180];

  // Interpolated Waypoints for smooth route path
  const routeWaypoints = [
    stationCoords,
    [12.9800, 77.5920],
    [12.9770, 77.5950],
    [12.9740, 77.5980],
    patientCoords,
    [12.9680, 77.6050],
    [12.9630, 77.6120],
    hospitalCoords
  ];

  // Helper to interpolate position based on percentage (0 to 1)
  const getPositionAtProgress = (pct) => {
    const totalSegments = routeWaypoints.length - 1;
    const scaledPct = pct * totalSegments;
    const index = Math.min(Math.floor(scaledPct), totalSegments - 1);
    const segmentPct = scaledPct - index;

    const start = routeWaypoints[index];
    const end = routeWaypoints[index + 1];

    const lat = start[0] + (end[0] - start[0]) * segmentPct;
    const lng = start[1] + (end[1] - start[1]) * segmentPct;
    return [lat, lng];
  };

  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return; // Prevent double init

    // Custom Icons using SVG HTML
    const ambulanceIcon = L.divIcon({
      className: 'custom-map-icon',
      html: `
        <div class="relative flex items-center justify-center w-10 h-10 bg-[#D9532F] text-white rounded-full border-2 border-white shadow-xl animate-pulse">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"/>
          </svg>
          <div class="absolute -inset-1 rounded-full bg-[#D9532F]/40 animate-ping pointer-events-none"></div>
        </div>
      `,
      iconSize: [40, 40],
      iconAnchor: [20, 20]
    });

    const patientIcon = L.divIcon({
      className: 'custom-map-icon',
      html: `
        <div class="relative flex items-center justify-center w-10 h-10 bg-[#0C4A3B] text-white rounded-full border-2 border-white shadow-xl">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
          </svg>
        </div>
      `,
      iconSize: [40, 40],
      iconAnchor: [20, 20]
    });

    const hospitalIcon = L.divIcon({
      className: 'custom-map-icon',
      html: `
        <div class="relative flex items-center justify-center w-10 h-10 bg-[#1E3A8A] text-white rounded-full border-2 border-white shadow-xl">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5"/>
          </svg>
        </div>
      `,
      iconSize: [40, 40],
      iconAnchor: [20, 20]
    });

    const stationIcon = L.divIcon({
      className: 'custom-map-icon',
      html: `
        <div class="flex items-center justify-center w-7 h-7 bg-gray-700 text-white rounded-full border border-white shadow">
          <span class="text-[10px] font-bold">DEP</span>
        </div>
      `,
      iconSize: [28, 28],
      iconAnchor: [14, 14]
    });

    // Initialize Map
    const map = L.map(mapContainerRef.current, {
      center: patientCoords,
      zoom: 13,
      zoomControl: false
    });

    mapInstanceRef.current = map;

    // CartoDB Voyager tiles for modern emergency theme
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/">CARTO</a>',
      maxZoom: 19
    }).addTo(map);

    // Draw Route Polylines
    // Station to Patient
    L.polyline(routeWaypoints.slice(0, 5), {
      color: '#D9532F',
      weight: 5,
      opacity: 0.8,
      dashArray: '8, 8'
    }).addTo(map);

    // Patient to Hospital
    L.polyline(routeWaypoints.slice(4), {
      color: '#0C4A3B',
      weight: 4,
      opacity: 0.6,
      dashArray: '4, 4'
    }).addTo(map);

    // Station Marker
    L.marker(stationCoords, { icon: stationIcon })
      .addTo(map)
      .bindPopup('<b>Ambulance Station Base</b><br/>Depot #04');

    // Patient Marker
    L.marker(patientCoords, { icon: patientIcon })
      .addTo(map)
      .bindPopup(`<b>Patient Emergency Location</b><br/>${activeSOS?.location || 'Downtown Sector 4'}`);

    // Hospital Marker
    L.marker(hospitalCoords, { icon: hospitalIcon })
      .addTo(map)
      .bindPopup(`<b>${activeSOS?.hospital?.name || 'City General Hospital'}</b><br/>Bed reserved in ER`);

    // Ambulance Marker
    const initialPos = getPositionAtProgress(0.55);
    const ambMarker = L.marker(initialPos, { icon: ambulanceIcon })
      .addTo(map)
      .bindPopup(`<b>Ambulance #04 En Route</b><br/>Driver: ${activeSOS?.driver?.name || 'Marcus Vance'}`);

    ambulanceMarkerRef.current = ambMarker;

    // Fit bounds to show route
    const bounds = L.latLngBounds(routeWaypoints);
    map.fitBounds(bounds, { padding: [40, 40] });

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Animation Loop for live moving ambulance
  useEffect(() => {
    if (!isPlaying) return;

    let lastTime = performance.now();
    const animate = (time) => {
      const delta = (time - lastTime) / 1000;
      lastTime = time;

      setProgress((prev) => {
        let next = prev + delta * 0.03; // speed of simulation
        if (next > 0.95) next = 0.1; // loop simulation back to start

        const newPos = getPositionAtProgress(next);
        if (ambulanceMarkerRef.current) {
          ambulanceMarkerRef.current.setLatLng(newPos);
        }

        // Dynamic distance calculation
        const totalDist = 4.2; // total route km
        const remainingKm = Math.max(0, (totalDist * (1 - next))).toFixed(1);
        setDistanceRemaining(`${remainingKm} km`);
        
        const estMinutes = Math.max(0.5, (remainingKm * 1.8)).toFixed(1);
        setEtaRemaining(`${estMinutes} min`);

        // Fluctuating speed for realistic driving effect
        const speedVar = 60 + Math.floor(Math.sin(next * 40) * 12);
        setCurrentSpeed(speedVar);

        return next;
      });

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isPlaying]);

  const handleCenterAmbulance = () => {
    if (mapInstanceRef.current && ambulanceMarkerRef.current) {
      mapInstanceRef.current.panTo(ambulanceMarkerRef.current.getLatLng(), { animate: true });
    }
  };

  const handleCenterPatient = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.panTo(patientCoords, { animate: true });
    }
  };

  const handleCenterHospital = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.panTo(hospitalCoords, { animate: true });
    }
  };

  return (
    <div className="relative w-full rounded-2xl overflow-hidden border border-[#E6E2D8] shadow-inner bg-[#FAF8F5]">
      
      {/* Top Floating Telemetry Overlay */}
      <div className="absolute top-3 left-3 right-3 z-[400] flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        
        {/* Distance & ETA Badge */}
        <div className="bg-[#1C2B22]/90 backdrop-blur-md text-white px-3.5 py-2 rounded-xl border border-white/20 shadow-lg pointer-events-auto flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-[#72DFB4]">
            <span className="w-2 h-2 rounded-full bg-[#72DFB4] animate-ping"></span>
            LIVE MAP GPS
          </div>
          <div className="h-3 w-[1px] bg-white/20"></div>
          <div className="text-xs">
            <span className="text-gray-300">Distance: </span>
            <span className="font-mono font-bold text-[#D9532F]">{distanceRemaining}</span>
          </div>
          <div className="h-3 w-[1px] bg-white/20"></div>
          <div className="text-xs">
            <span className="text-gray-300">ETA: </span>
            <span className="font-mono font-bold text-[#72DFB4]">{etaRemaining}</span>
          </div>
        </div>

        {/* Play/Pause Simulation Controls */}
        <div className="bg-white/95 backdrop-blur-md p-1.5 rounded-xl border border-[#E6E2D8] shadow-md pointer-events-auto flex items-center gap-1">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            title={isPlaying ? "Pause Simulation" : "Resume Simulation"}
            className="p-1.5 rounded-lg hover:bg-gray-100 text-[#1C2B22] transition-colors"
          >
            {isPlaying ? <Pause className="w-4 h-4 text-[#D9532F]" /> : <Play className="w-4 h-4 text-[#0C4A3B]" />}
          </button>
          <button
            onClick={() => {
              setProgress(0.1);
              if (ambulanceMarkerRef.current) {
                ambulanceMarkerRef.current.setLatLng(getPositionAtProgress(0.1));
              }
            }}
            title="Reset Simulation Route"
            className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

      </div>

      {/* Actual Interactive Leaflet Map Container */}
      <div 
        ref={mapContainerRef} 
        className="w-full h-[360px] sm:h-[400px] z-10"
      />

      {/* Bottom Floating Control Bar */}
      <div className="absolute bottom-3 left-3 right-3 z-[400] bg-white/95 backdrop-blur-md p-3 rounded-2xl border border-[#E6E2D8] shadow-xl flex flex-wrap items-center justify-between gap-3">
        
        {/* Quick Focus Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleCenterAmbulance}
            className="px-3 py-1.5 rounded-xl bg-[#D9532F]/10 hover:bg-[#D9532F]/20 text-[#D9532F] text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <Ambulance className="w-3.5 h-3.5" />
            Ambulance
          </button>
          <button
            onClick={handleCenterPatient}
            className="px-3 py-1.5 rounded-xl bg-[#0C4A3B]/10 hover:bg-[#0C4A3B]/20 text-[#0C4A3B] text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <MapPin className="w-3.5 h-3.5" />
            Patient
          </button>
          <button
            onClick={handleCenterHospital}
            className="px-3 py-1.5 rounded-xl bg-[#1E3A8A]/10 hover:bg-[#1E3A8A]/20 text-[#1E3A8A] text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <Hospital className="w-3.5 h-3.5" />
            Hospital
          </button>
        </div>

        {/* Live Telemetry Info Pill */}
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5 text-[#1C2B22]">
            <Zap className="w-3.5 h-3.5 text-amber-500" />
            <span className="text-gray-500">Speed:</span>
            <span className="font-bold font-mono">{currentSpeed} km/h</span>
          </div>
          <div className="hidden sm:flex items-center gap-1.5 text-[#0C4A3B] font-semibold bg-[#E8F0EC] px-2.5 py-1 rounded-full text-[11px]">
            Emergency Pre-emption Active
          </div>
        </div>

      </div>

    </div>
  );
}
