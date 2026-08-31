import { useEffect, useRef, useState } from "react";
interface LocationPickerProps {
  latitude?: number | null;
  longitude?: number | null;
  formattedAddress?: string | null;
  placeId?: string | null;
  onChange: (data: { latitude: number; longitude: number; formattedAddress: string; placeId?: string }) => void;
  readOnly?: boolean;
}
declare global {
  interface Window {
    google?: {
      maps: {
        Map: new (element: HTMLElement, options: unknown) => { setCenter: (latLng: { lat: number; lng: number }) => void };
        Marker: new (options: unknown) => { setMap: (map: unknown) => void };
        places: {
          Autocomplete: new (input: HTMLInputElement, options: unknown) => { addListener: (event: string, callback: () => void) => void; getPlace: () => { geometry?: { location?: { lat: () => number; lng: () => number } }; formatted_address?: string; place_id?: string } };
        };
      };
    };
  }
}
export function LocationPicker({ latitude, longitude, formattedAddress, onChange, readOnly = false }: LocationPickerProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [address, setAddress] = useState(formattedAddress ?? "");
  useEffect(() => {
    if (readOnly || !window.google?.maps || !mapRef.current || !inputRef.current) return;
    const map = new window.google.maps.Map(mapRef.current, {
      center: { lat: latitude ?? 4.75, lng: longitude ?? 6.25 },
      zoom: 14,
      disableDefaultUI: false,
    });
    if (latitude && longitude) {
      new window.google.maps.Marker({
        position: { lat: latitude, lng: longitude },
        map,
        draggable: true,
      });
    }
    const autocomplete = new window.google.maps.places.Autocomplete(inputRef.current, {
      fields: ["geometry", "formatted_address", "place_id"],
    });
    autocomplete.addListener("place_changed", () => {
      const place = autocomplete.getPlace();
      if (place.geometry?.location) {
        const lat = place.geometry.location.lat();
        const lng = place.geometry.location.lng();
        onChange({
          latitude: lat,
          longitude: lng,
          formattedAddress: place.formatted_address ?? "",
          placeId: place.place_id,
        });
        map.setCenter({ lat, lng });
      }
    });
    if (latitude && longitude) {
      map.setCenter({ lat: latitude, lng: longitude });
    }
  }, [readOnly, latitude, longitude, onChange]);
  return (
    <div className="space-y-3">
      <input
        ref={inputRef}
        type="text"
        value={address}
        onChange={(e) => setAddress(e.target.value)}
        placeholder="Search address or landmark..."
        disabled={readOnly}
        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm disabled:bg-slate-50"
      />
      <div ref={mapRef} className="h-64 w-full rounded-lg border border-slate-300 bg-slate-50" />
      {!readOnly && (
        <p className="text-xs text-slate-500">
          Search for the address, then drag the marker to fine-tune the exact location.
        </p>
      )}
    </div>
  );
}

