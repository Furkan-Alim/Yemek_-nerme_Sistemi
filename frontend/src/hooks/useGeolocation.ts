import { useCallback, useState } from "react";

export interface GeoCoords {
  lat: number;
  lng: number;
}

export function useGeolocation() {
  const [coords, setCoords] = useState<GeoCoords | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const request = useCallback(() => {
    if (!("geolocation" in navigator)) {
      setError("Tarayıcı konum desteği yok.");
      return;
    }
    setLoading(true);
    setError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
        setLoading(false);
      },
      (err) => {
        console.warn("[geolocation]", err.code, err.message);
        setError(
          err.code === 1
            ? "Konum izni verilmedi."
            : "Konum alınamadı; platformlar yine kendi konumuna göre listeler."
        );
        setLoading(false);
      },
      { enableHighAccuracy: false, timeout: 12_000, maximumAge: 300_000 }
    );
  }, []);

  return { coords, error, loading, request };
}
