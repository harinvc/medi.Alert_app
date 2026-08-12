import React, { createContext, useContext, useState, useEffect } from 'react';

const LocationContext = createContext();

export function LocationProvider({ children, enableHighAccuracy = true }) {
  const [location, setLocation] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.');
      setLoading(false);
      return;
    }

    const watcher = navigator.geolocation.watchPosition(
      (position) => {
        setLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy,
        });
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.error("Location watch error:", err);
        setError(err.message || "Could not get your location.");
        setLoading(false);
      },
      {
        enableHighAccuracy,
        maximumAge: 0,
        timeout: 10000,
      }
    );

    return () => {
      navigator.geolocation.clearWatch(watcher);
    };
  }, [enableHighAccuracy]);

  const forceRefresh = () => {
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy,
        });
        setLoading(false);
        setError(null);
      },
      (err) => {
        setError(err.message || "Could not get your location.");
        setLoading(false);
      },
      {
        enableHighAccuracy,
        maximumAge: 0,
        timeout: 10000,
      }
    );
  };

  return (
    <LocationContext.Provider value={{ location, error, loading, forceRefresh }}>
      {children}
    </LocationContext.Provider>
  );
}

export default function useLocation() {
  return useContext(LocationContext);
}
