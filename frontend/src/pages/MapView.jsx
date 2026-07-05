import "leaflet/dist/leaflet.css";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import { getStations } from "../services/api";
import { normalizeStations } from "../lib/stations";

// Fix marker icons for Vite
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

async function getCoordsFromAws() {
  const BASE = import.meta.env.VITE_API_BASE;
  const res = await fetch(`${BASE}/coords`, { headers: { Accept: "application/json" } });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Coords endpoint failed (${res.status}). ${text}`);
  }
  return res.json();
}

export default function MapView() {
  const navigate = useNavigate();

  const [stations, setStations] = useState([]);
  const [coordsById, setCoordsById] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        setError("");
        setLoading(true);

        const [stationList, coordsPayload] = await Promise.all([getStations(), getCoordsFromAws()]);

        const normalized = normalizeStations(stationList);
        const coords = coordsPayload?.coords || {};

        if (!mounted) return;
        setStations(normalized);
        setCoordsById(coords);
      } catch (e) {
        if (!mounted) return;
        setError(e?.message || "Failed to load map data.");
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();
    return () => {
      mounted = false;
    };
  }, []);

  const stationsWithCoords = useMemo(() => {
    return stations
      .map((s) => {
        const c = coordsById[s.id];
        if (!c) return null;
        return { ...s, lat: c.lat, lng: c.lng };
      })
      .filter(Boolean);
  }, [stations, coordsById]);

  const center = useMemo(() => [40.7128, -74.006], []);

  return (
    <div className="min-h-screen bg-ink">
      <header className="bg-ink border-b border-ink-line">
        <div className="max-w-6xl mx-auto px-4 py-6 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white">Map View</h1>
            <p className="text-slate-300 mt-1">Stations plotted using coordinates served from your AWS API.</p>
          </div>

          <button
            onClick={() => navigate("/")}
            className="shrink-0 px-4 py-2 rounded-xl bg-white/5 text-slate-200 border border-white/10
                       hover:bg-signal/15 hover:text-signal hover:border-signal/30 text-sm font-semibold transition
                       focus:outline-none focus:ring-2 focus:ring-signal"
          >
            Back to List
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6">
        {loading ? (
          <div className="bg-ink-panel rounded-2xl border border-ink-line p-6">
            <p className="text-slate-300">Loading map…</p>
          </div>
        ) : error ? (
          <div className="bg-ink-panel rounded-2xl border border-ink-line p-6">
            <p className="text-white font-semibold">Couldn’t load map.</p>
            <p className="text-slate-300 mt-1">{error}</p>
          </div>
        ) : stationsWithCoords.length === 0 ? (
          <div className="bg-ink-panel rounded-2xl border border-ink-line p-6">
            <p className="text-white font-semibold">No markers to display.</p>
            <p className="text-slate-300 mt-1">
              Your /stations IDs might not match coordinate complex IDs.
            </p>
          </div>
        ) : (
          <div className="bg-ink-panel rounded-2xl border border-ink-line overflow-hidden shadow-xl h-[75vh]">
            <MapContainer center={center} zoom={12} style={{ height: "100%", width: "100%" }}>
              <TileLayer
                attribution='&copy; OpenStreetMap contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              {stationsWithCoords.map((s) => (
                <Marker key={s.id} position={[s.lat, s.lng]}>
                  <Popup>
                    <div className="min-w-[220px]">
                      <div className="font-bold text-slate-900">{s.name}</div>
                      <div className="text-xs text-slate-600 mt-1">Station ID: {s.id}</div>

                      {s.lines?.length ? (
                        <div className="text-xs text-slate-700 mt-2">
                          Lines: <span className="font-semibold">{s.lines.join(", ")}</span>
                        </div>
                      ) : null}

                      <button
                        onClick={() => navigate(`/station/${s.id}`)}
                        className="mt-3 w-full px-3 py-2 rounded-xl bg-signal text-ink text-sm font-semibold hover:bg-signal/90 transition"
                      >
                        Open station page
                      </button>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>
        )}
      </main>

      <footer className="border-t border-ink-line bg-ink">
        <div className="max-w-6xl mx-auto px-4 py-6 text-sm text-slate-400">
          Map tiles: OpenStreetMap. Coordinates: served via your AWS Lambda (/coords).
        </div>
      </footer>
    </div>
  );
}
