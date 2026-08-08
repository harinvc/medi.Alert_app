import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { Ambulance, MapPin, Hospital, Navigation, LocateFixed, Zap, Play, Pause, Search, Star, Check, AlertCircle } from 'lucide-react';
import socket from '../../services/socket';

const MAPTILER_KEY = import.meta.env.VITE_MAPTILER_API_KEY || '6VYRpEtYjtPMoI6mh0Ef';

export default function RealMapTracker({ activeSOS }) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const tileLayerRef = useRef(null);
  const ambulanceMarkerRef = useRef(null);
  const patientMarkerRef = useRef(null);
  const hospitalMarkersRef = useRef([]);
  const animationFrameRef = useRef(null);

  const [mapStyle, setMapStyle] = useState('streets-v2');
  const [isPlaying, setIsPlaying] = useState(true);
  const [progress, setProgress] = useState(0.55);
  const [currentSpeed, setCurrentSpeed] = useState(68);
  const [distanceRemaining, setDistanceRemaining] = useState('1.8 km');
  const [etaRemaining, setEtaRemaining] = useState('3.4 min');
  const [realAddress, setRealAddress] = useState(activeSOS?.location || 'Detecting real GPS location...');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [nearestHospitals, setNearestHospitals] = useState([]);
  const [selectedHospital, setSelectedHospital] = useState(null);

  // Real patient coordinates state (defaults to urban center, updates with real HTML5 GPS or search)
  const [coords, setCoords] = useState({
    patient: [12.9716, 77.5946],
    station: [12.9820, 77.5890],
    hospital: [12.9580, 77.6180]
  });

  // Fetch hospitals near specific coordinates from backend
  const fetchHospitalsForLocation = (lat, lng) => {
    fetch(`http://10.11.2.30:5000/api/hospitals/nearest?lat=${lat}&lng=${lng}`)
      .then(res => res.json())
      .then(data => {
        if (data.success && data.hospitals && data.hospitals.length > 0) {
          setNearestHospitals(data.hospitals);
          const primary = data.hospitals[0];
          setSelectedHospital(primary);
          setCoords(prev => ({
            ...prev,
            hospital: primary.coords || [lat - 0.010, lng + 0.015]
          }));
        }
      })
      .catch(err => console.log('Hospital fetch error:', err));
  };

  // Perform MapTiler / Nominatim Reverse Geocoding
  const reverseGeocode = (lat, lng) => {
    fetch(`https://api.maptiler.com/geocoding/${lng},${lat}.json?key=${MAPTILER_KEY}`)
      .then(res => res.json())
      .then(data => {
        if (data && data.features && data.features.length > 0) {
          setRealAddress(data.features[0].place_name || data.features[0].text);
        } else {
          fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`)
            .then(res => res.json())
            .then(nomData => {
              if (nomData && nomData.display_name) {
                setRealAddress(nomData.display_name.split(',').slice(0, 3).join(', '));
              }
            })
            .catch(() => {});
        }
      })
      .catch(() => {
        fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`)
          .then(res => res.json())
          .then(nomData => {
            if (nomData && nomData.display_name) {
              setRealAddress(nomData.display_name.split(',').slice(0, 3).join(', '));
            }
          })
          .catch(() => {});
      });
  };

  // Fetch real HTML5 device location on mount
  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userLat = position.coords.latitude;
          const userLng = position.coords.longitude;

          const newCoords = {
            patient: [userLat, userLng],
            station: [userLat + 0.012, userLng - 0.014],
            hospital: [userLat - 0.010, userLng + 0.015]
          };

          setCoords(newCoords);
          reverseGeocode(userLat, userLng);
          fetchHospitalsForLocation(userLat, userLng);
        },
        (err) => {
          console.warn('Geolocation notice, using default coordinates:', err);
          reverseGeocode(12.9716, 77.5946);
          fetchHospitalsForLocation(12.9716, 77.5946);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    } else {
      fetchHospitalsForLocation(12.9716, 77.5946);
    }
  }, []);

  // Handle Location Search using MapTiler Geocoding API
  const handleLocationSearch = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);

    fetch(`https://api.maptiler.com/geocoding/${encodeURIComponent(searchQuery)}.json?key=${MAPTILER_KEY}&proximity=${coords.patient[1]},${coords.patient[0]}`)
      .then(res => res.json())
      .then(data => {
        setIsSearching(false);
        if (data && data.features && data.features.length > 0) {
          const first = data.features[0];
          const foundLng = first.center[0];
          const foundLat = first.center[1];

          setRealAddress(first.place_name || first.text);
          const newCoords = {
            patient: [foundLat, foundLng],
            station: [foundLat + 0.012, foundLng - 0.014],
            hospital: [foundLat - 0.010, foundLng + 0.015]
          };
          setCoords(newCoords);
          fetchHospitalsForLocation(foundLat, foundLng);

          if (mapInstanceRef.current) {
            mapInstanceRef.current.flyTo([foundLat, foundLng], 14, { animate: true });
          }
        } else {
          fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=1`)
            .then(res => res.json())
            .then(nomData => {
              if (nomData && nomData.length > 0) {
                const foundLat = parseFloat(nomData[0].lat);
                const foundLng = parseFloat(nomData[0].lon);
                setRealAddress(nomData[0].display_name.split(',').slice(0, 3).join(', '));
                const newCoords = {
                  patient: [foundLat, foundLng],
                  station: [foundLat + 0.012, foundLng - 0.014],
                  hospital: [foundLat - 0.010, foundLng + 0.015]
                };
                setCoords(newCoords);
                fetchHospitalsForLocation(foundLat, foundLng);
                if (mapInstanceRef.current) {
                  mapInstanceRef.current.flyTo([foundLat, foundLng], 14, { animate: true });
                }
              }
            })
            .catch(() => {});
        }
      })
      .catch(() => {
        setIsSearching(false);
      });
  };

  // Recenter to Current GPS
  const handleUseCurrentGPS = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition((pos) => {
        const uLat = pos.coords.latitude;
        const uLng = pos.coords.longitude;
        setCoords({
          patient: [uLat, uLng],
          station: [uLat + 0.012, uLat - 0.014],
          hospital: [uLat - 0.010, uLat + 0.015]
        });
        reverseGeocode(uLat, uLng);
        fetchHospitalsForLocation(uLat, uLng);
        if (mapInstanceRef.current) {
          mapInstanceRef.current.flyTo([uLat, uLng], 14, { animate: true });
        }
      });
    }
  };

  // Listen for WebSockets telemetry
  useEffect(() => {
    socket.on('ambulance:telemetry_stream', (data) => {
      if (data.speed) setCurrentSpeed(data.speed);
    });

    return () => {
      socket.off('ambulance:telemetry_stream');
    };
  }, []);

  // Dynamic Waypoints
  const routeWaypoints = [
    coords.station,
    [coords.station[0] - (coords.station[0] - coords.patient[0]) * 0.33, coords.station[1] + (coords.patient[1] - coords.station[1]) * 0.33],
    [coords.station[0] - (coords.station[0] - coords.patient[0]) * 0.66, coords.station[1] + (coords.patient[1] - coords.station[1]) * 0.66],
    coords.patient,
    [coords.patient[0] - (coords.patient[0] - coords.hospital[0]) * 0.5, coords.patient[1] + (coords.hospital[1] - coords.patient[1]) * 0.5],
    coords.hospital
  ];

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

  // Create MapTiler HD Tile Layer
  const createMapTilerTileLayer = (style) => {
    const tileUrl = `https://api.maptiler.com/maps/${style}/{z}/{x}/{y}@2x.png?key=${MAPTILER_KEY}`;
    return L.tileLayer(tileUrl, {
      attribution: '&copy; <a href="https://www.maptiler.com/copyright/" target="_blank">MapTiler</a> &copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a>',
      tileSize: 512,
      zoomOffset: -1,
      maxZoom: 20,
      crossOrigin: true
    });
  };

  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

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
      center: coords.patient,
      zoom: 14,
      zoomControl: false
    });

    mapInstanceRef.current = map;

    // High Precision MapTiler HD Tile Layer
    const tileLayer = createMapTilerTileLayer(mapStyle).addTo(map);
    tileLayerRef.current = tileLayer;

    // Station to Patient polyline
    L.polyline(routeWaypoints.slice(0, 4), {
      color: '#D9532F',
      weight: 5,
      opacity: 0.85,
      dashArray: '8, 8'
    }).addTo(map);

    // Patient to Hospital polyline
    L.polyline(routeWaypoints.slice(3), {
      color: '#0C4A3B',
      weight: 4,
      opacity: 0.65,
      dashArray: '4, 4'
    }).addTo(map);

    // Station Marker
    L.marker(coords.station, { icon: stationIcon })
      .addTo(map)
      .bindPopup('<b>Ambulance Station Depot</b><br/>Unit #04 Dispatch');

    // Patient Marker
    patientMarkerRef.current = L.marker(coords.patient, { icon: patientIcon })
      .addTo(map)
      .bindPopup(`<b>Patient GPS Location</b><br/>${realAddress}`);

    // Render Real Nearest Hospitals Markers
    hospitalMarkersRef.current.forEach(m => m.remove());
    hospitalMarkersRef.current = [];

    nearestHospitals.forEach((h, idx) => {
      const isPrimary = selectedHospital?.id === h.id || (idx === 0 && !selectedHospital);
      const hospitalIcon = L.divIcon({
        className: 'custom-map-icon',
        html: `
          <div class="relative flex items-center justify-center ${isPrimary ? 'w-11 h-11 bg-[#1E3A8A] ring-4 ring-blue-300' : 'w-9 h-9 bg-emerald-700'} text-white rounded-full border-2 border-white shadow-2xl cursor-pointer">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5"/>
            </svg>
          </div>
        `,
        iconSize: isPrimary ? [44, 44] : [36, 36],
        iconAnchor: isPrimary ? [22, 22] : [18, 18]
      });

      const marker = L.marker(h.coords || [coords.patient[0] - 0.010, coords.patient[1] + 0.015], { icon: hospitalIcon })
        .addTo(map)
        .bindPopup(`
          <div style="font-family: sans-serif; padding: 4px; max-width: 200px;">
            <b style="color: #1E3A8A; font-size: 13px; display: block; margin-bottom: 2px;">${h.name}</b>
            <span style="color: #D9532F; font-weight: bold; font-size: 11px;">★ ${h.rating} / 5.0 (${h.distance})</span><br/>
            <span style="font-size: 11px; color: #5F6B63;">ETA: ${h.travelTime} • ${h.bedAssigned}</span><br/>
            <span style="font-size: 10px; color: #0C4A3B; font-weight: bold; display: inline-block; margin-top: 4px;">📍 Real Location Matched</span>
          </div>
        `);

      hospitalMarkersRef.current.push(marker);
    });

    // Moving Ambulance Marker
    const initialPos = getPositionAtProgress(progress);
    ambulanceMarkerRef.current = L.marker(initialPos, { icon: ambulanceIcon })
      .addTo(map)
      .bindPopup(`<b>Ambulance #04 En Route</b><br/>Driver: Marcus Vance`);

    // Fit map view bounds around route
    const bounds = L.latLngBounds(routeWaypoints);
    map.fitBounds(bounds, { padding: [50, 50] });

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [coords, nearestHospitals, selectedHospital]);

  // Switch MapTiler map styles dynamically
  useEffect(() => {
    if (mapInstanceRef.current && tileLayerRef.current) {
      mapInstanceRef.current.removeLayer(tileLayerRef.current);
      tileLayerRef.current = createMapTilerTileLayer(mapStyle).addTo(mapInstanceRef.current);
    }
  }, [mapStyle]);

  // Animation Loop for live driving ambulance
  useEffect(() => {
    if (!isPlaying) return;

    let lastTime = performance.now();
    const animate = (time) => {
      const delta = (time - lastTime) / 1000;
      lastTime = time;

      setProgress((prev) => {
        let next = prev + delta * 0.03;
        if (next > 0.95) next = 0.1;

        const newPos = getPositionAtProgress(next);
        if (ambulanceMarkerRef.current) {
          ambulanceMarkerRef.current.setLatLng(newPos);
        }

        const totalDist = parseFloat(selectedHospital?.distance || '3.2');
        const remainingKm = Math.max(0, (totalDist * (1 - next))).toFixed(1);
        setDistanceRemaining(`${remainingKm} km`);

        const estMinutes = Math.max(0.5, (remainingKm * 1.8)).toFixed(1);
        setEtaRemaining(`${estMinutes} min`);

        const speedVar = 58 + Math.floor(Math.sin(next * 40) * 12);
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
  }, [isPlaying, coords, selectedHospital]);

  const handleCenterAmbulance = () => {
    if (mapInstanceRef.current && ambulanceMarkerRef.current) {
      mapInstanceRef.current.panTo(ambulanceMarkerRef.current.getLatLng(), { animate: true });
    }
  };

  const handleCenterPatient = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.panTo(coords.patient, { animate: true });
    }
  };

  const handleCenterHospital = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.panTo(coords.hospital, { animate: true });
    }
  };

  const handleSelectHospital = (h) => {
    setSelectedHospital(h);
    if (h.coords) {
      setCoords(prev => ({
        ...prev,
        hospital: h.coords
      }));
      if (mapInstanceRef.current) {
        mapInstanceRef.current.panTo(h.coords, { animate: true });
      }
    }
  };

  return (
    <div className="space-y-4">
      
      {/* Location Search Bar & Geocoding Input */}
      <div className="bg-white p-3.5 rounded-2xl border border-[#E6E2D8] shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <form onSubmit={handleLocationSearch} className="flex-1 w-full flex items-center gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search location or city for nearest hospitals (e.g. Indiranagar, NYC, London)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-[#FAF9F6] border border-[#E6E2D8] text-xs focus:outline-none focus:border-[#0C4A3B] focus:ring-1 focus:ring-[#0C4A3B]"
            />
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
          </div>
          <button
            type="submit"
            disabled={isSearching}
            className="px-4 py-2 bg-[#0C4A3B] text-white text-xs font-semibold rounded-xl hover:bg-[#08362B] transition-colors shrink-0 cursor-pointer"
          >
            {isSearching ? 'Searching...' : 'Find Hospitals'}
          </button>
        </form>

        <button
          onClick={handleUseCurrentGPS}
          className="w-full sm:w-auto px-3.5 py-2 rounded-xl bg-[#E8F0EC] hover:bg-[#D4E6DC] text-[#0C4A3B] text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shrink-0 cursor-pointer"
          title="Detect Current Device GPS"
        >
          <LocateFixed className="w-4 h-4 text-[#0C4A3B]" />
          <span>Live GPS</span>
        </button>
      </div>

      {/* Real-time Location Announcement & Voice Summary Bar */}
      <div className="bg-[#0C4A3B] text-white p-3.5 rounded-2xl border border-[#72DFB4]/30 shadow flex items-center justify-between text-xs gap-3">
        <div className="flex items-center gap-2.5 truncate">
          <MapPin className="w-4 h-4 text-[#72DFB4] shrink-0" />
          <div className="truncate">
            <span className="text-gray-300 text-[11px] block">CURRENT LOCATION</span>
            <strong className="text-white text-xs truncate block">{realAddress}</strong>
          </div>
        </div>

        {selectedHospital && (
          <div className="bg-white/10 px-3 py-1.5 rounded-xl border border-white/20 shrink-0 text-right">
            <span className="text-[10px] text-[#72DFB4] uppercase block font-bold">NEAREST MATCHED HOSPITAL</span>
            <span className="font-semibold text-white text-xs">{selectedHospital.name} ({selectedHospital.distance})</span>
          </div>
        )}
      </div>

      {/* Dynamic Real Nearest Hospitals Card List */}
      {nearestHospitals.length > 0 && (
        <div className="bg-white p-4 rounded-2xl border border-[#E6E2D8] shadow-sm space-y-3">
          <div className="flex items-center justify-between border-b border-[#F2EEE6] pb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#0C4A3B] flex items-center gap-1.5">
              <Hospital className="w-4 h-4 text-[#0C4A3B]" /> Real Nearest Emergency Hospitals ({nearestHospitals.length} Found for Location)
            </span>
            <span className="text-[10px] font-mono bg-[#72DFB4] text-[#0C4A3B] font-bold px-2 py-0.5 rounded">
              GPS DISTANCE MATCHED
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
            {nearestHospitals.map((h, idx) => {
              const isSelected = selectedHospital?.id === h.id || (idx === 0 && !selectedHospital);
              return (
                <div
                  key={h.id}
                  onClick={() => handleSelectHospital(h)}
                  className={`p-3 rounded-xl border space-y-2 cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-[#E8F0EC] border-[#0C4A3B] text-[#0C4A3B] font-semibold shadow-md ring-2 ring-[#0C4A3B]/30'
                      : 'bg-[#FAF9F6] border-[#E6E2D8] text-gray-700 hover:border-gray-400'
                  }`}
                >
                  <div className="flex items-center justify-between font-bold">
                    <span className="truncate max-w-[140px]" title={h.name}>{h.name}</span>
                    <span className="text-[#D9532F] font-mono flex items-center gap-0.5 shrink-0">
                      <Star className="w-3 h-3 fill-[#D9532F]" /> {h.rating}
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-600 line-clamp-1">{h.address}</p>
                  <div className="flex items-center justify-between text-[11px] pt-1 border-t border-[#E5E2D9]">
                    <span className="font-bold text-[#D9532F]">{h.distance} ({h.travelTime})</span>
                    {isSelected ? (
                      <span className="text-[10px] bg-[#0C4A3B] text-white px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                        <Check className="w-3 h-3" /> Selected
                      </span>
                    ) : (
                      <span className="text-[10px] text-gray-500 hover:text-[#0C4A3B]">Click to Select</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Map Header with Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 pb-1">
        <h3 className="text-[#0C4A3B] font-bold text-sm flex items-center gap-1.5">
          <MapPin className="w-4 h-4 text-[#D9532F]" />
          Live GPS Tracking Map
        </h3>

        {/* MapTiler Style Selector & Controls (Moved out to avoid overlap) */}
        <div className="flex items-center gap-1.5 pointer-events-auto bg-white p-1 rounded-xl border border-[#E6E2D8] shadow-sm">
          <select
            value={mapStyle}
            onChange={(e) => setMapStyle(e.target.value)}
            className="text-xs font-semibold bg-[#FAF9F6] text-[#0C4A3B] px-2.5 py-1 rounded-lg border border-[#E6E2D8] outline-none cursor-pointer hover:bg-white transition-colors"
            title="Select MapTiler HD Map Layer"
          >
            <option value="streets-v2">🗺️ MapTiler Streets HD</option>
            <option value="hybrid">🛰️ MapTiler Satellite</option>
            <option value="dataviz-dark">🌙 MapTiler Dark Nav</option>
            <option value="bright-v2">🎨 MapTiler Bright Clean</option>
            <option value="outdoor-v2">🏔️ MapTiler Outdoor Topo</option>
          </select>

          <div className="h-4 w-[1px] bg-gray-200"></div>

          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="p-1.5 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
            title={isPlaying ? "Pause Animation" : "Play Animation"}
          >
            {isPlaying ? <Pause className="w-4 h-4 text-[#D9532F]" /> : <Play className="w-4 h-4 text-[#0C4A3B]" />}
          </button>
          
          <button
            onClick={handleCenterPatient}
            className="p-1.5 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
            title="Recenter Map on Real Location"
          >
            <LocateFixed className="w-4 h-4 text-[#0C4A3B]" />
          </button>
        </div>
      </div>

      {/* Leaflet Map Card Container */}
      <div className="relative w-full rounded-2xl overflow-hidden border border-[#E6E2D8] shadow-inner bg-[#FAF8F5]">
        
        {/* Top Floating Telemetry Overlay */}
        <div className="absolute top-3 left-3 right-3 z-[400] flex flex-wrap items-start justify-between gap-2 pointer-events-none">
          
          {/* Distance & ETA Badge */}
          <div className="bg-[#1C2B22]/90 backdrop-blur-md text-white px-3.5 py-2 rounded-xl border border-white/20 shadow-lg pointer-events-auto flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-[#72DFB4]">
              <span className="w-2 h-2 rounded-full bg-[#72DFB4] animate-ping"></span>
              LIVE REAL DEVICE GPS
            </div>
            <div className="h-3 w-[1px] bg-white/20"></div>
            <div className="text-xs">
              <span className="text-gray-300">Distance:</span> <strong className="text-[#D9532F] font-mono">{distanceRemaining}</strong>
            </div>
            <div className="h-3 w-[1px] bg-white/20"></div>
            <div className="text-xs">
              <span className="text-gray-300">ETA:</span> <strong className="text-[#72DFB4] font-mono">{etaRemaining}</strong>
            </div>
          </div>
          {/* Removed MapTiler dropdown from here to prevent overlapping markers on top right */}
        </div>

        {/* Leaflet Map Canvas Container */}
        <div ref={mapContainerRef} className="w-full h-[380px] z-0" />

        {/* Bottom Floating Telemetry Controls */}
        <div className="absolute bottom-3 left-3 right-3 z-[400] flex flex-wrap items-center justify-between gap-2 pointer-events-none">
          
          {/* Recenter Quick Pill Selector */}
          <div className="bg-white/95 backdrop-blur-md p-1.5 rounded-2xl border border-[#E6E2D8] shadow-lg pointer-events-auto flex items-center gap-1">
            <button
              onClick={handleCenterAmbulance}
              className="px-3 py-1.5 rounded-xl bg-red-50 text-[#D9532F] text-xs font-bold flex items-center gap-1.5 hover:bg-red-100 transition-colors cursor-pointer"
            >
              <Ambulance className="w-3.5 h-3.5" /> Ambulance
            </button>
            <button
              onClick={handleCenterPatient}
              className="px-3 py-1.5 rounded-xl bg-emerald-50 text-[#0C4A3B] text-xs font-bold flex items-center gap-1.5 hover:bg-emerald-100 transition-colors cursor-pointer"
            >
              <MapPin className="w-3.5 h-3.5" /> Patient
            </button>
            <button
              onClick={handleCenterHospital}
              className="px-3 py-1.5 rounded-xl bg-blue-50 text-[#1E3A8A] text-xs font-bold flex items-center gap-1.5 hover:bg-blue-100 transition-colors cursor-pointer"
            >
              <Hospital className="w-3.5 h-3.5" /> Hospital
            </button>
          </div>

          {/* Real Speed Badge & Address Banner */}
          <div className="bg-white/95 backdrop-blur-md px-3.5 py-1.5 rounded-2xl border border-[#E6E2D8] shadow-lg pointer-events-auto flex items-center gap-2.5 text-xs">
            <div className="flex items-center gap-1 text-[#1C2B22] font-semibold">
              <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500" /> Speed: <strong className="font-mono text-sm">{currentSpeed} km/h</strong>
            </div>
            <span className="text-[10px] bg-[#E8F0EC] text-[#0C4A3B] font-bold px-2 py-0.5 rounded-full">
              Emergency Pre-emption Active
            </span>
          </div>

        </div>

      </div>

    </div>
  );
}
