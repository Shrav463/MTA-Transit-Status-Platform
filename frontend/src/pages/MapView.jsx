import "leaflet/dist/leaflet.css";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import { getStations } from "../services/api";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon   from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
import MTAChatBot from "../components/MTAChatBot.jsx";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({ iconRetinaUrl: markerIcon2x, iconUrl: markerIcon, shadowUrl: markerShadow });

function normalizeStation(raw) {
  const id = raw?.station_id ?? raw?.id ?? raw?.stationId ?? "";
  const name = raw?.station_name ?? raw?.name ?? raw?.stationName ?? "";
  const lines = Array.isArray(raw?.lines) ? raw.lines : [];
  return { id: String(id), name: String(name), lines };
}

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
  const [stations, setStations]     = useState([]);
  const [coordsById, setCoordsById] = useState({});
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState("");

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        setError(""); setLoading(true);
        const [stationList, coordsPayload] = await Promise.all([getStations(), getCoordsFromAws()]);
        if (!mounted) return;
        setStations((Array.isArray(stationList) ? stationList : []).map(normalizeStation));
        setCoordsById(coordsPayload?.coords || {});
      } catch (e) {
        if (!mounted) return;
        setError(e?.message || "Failed to load map data.");
      } finally { if (mounted) setLoading(false); }
    }
    load();
    return () => { mounted = false; };
  }, []);

  const stationsWithCoords = useMemo(() =>
    stations.map(s => { const c = coordsById[s.id]; return c ? { ...s, lat: c.lat, lng: c.lng } : null; }).filter(Boolean),
    [stations, coordsById]);

  const center = useMemo(() => [40.7128, -74.006], []);

  return (
    <div className="page">
      <div className="stripe" />

      <nav className="mta-nav">
        <div className="wrap" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 20px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 36, height: 36, borderRadius: "50%", background: "var(--orange)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span className="display" style={{ fontSize: 16, color: "#fff" }}>M</span>
            </div>
            <div>
              <div className="display" style={{ fontSize: 20, letterSpacing: "0.06em" }}>MAP VIEW</div>
              <div style={{ fontSize: 10, color: "var(--text-subtle)", letterSpacing: "0.1em", textTransform: "uppercase" }}>
                {loading ? "Loading…" : `${stationsWithCoords.length} stations plotted`}
              </div>
            </div>
          </div>
          <button onClick={() => navigate("/")} className="btn btn-ghost" style={{ fontSize: 12 }}>← Home</button>
        </div>
      </nav>

      <main className="wrap" style={{ padding: "28px 20px 48px", flex: 1 }}>
        {loading ? (
          <div className="card" style={{ padding: 32 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div className="skel" style={{ width: 24, height: 24, borderRadius: "50%", flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div className="skel" style={{ height: 14, width: "30%", marginBottom: 8 }} />
                <div className="skel" style={{ height: 11, width: "50%" }} />
              </div>
            </div>
            <div className="skel" style={{ marginTop: 20, height: 400, borderRadius: "var(--r-lg)" }} />
          </div>
        ) : error ? (
          <div className="card fu" style={{ padding: 28, borderColor: "rgba(255,51,85,.2)", background: "rgba(255,51,85,.04)" }}>
            <div style={{ fontWeight: 700, color: "var(--red)", marginBottom: 6 }}>Map failed to load</div>
            <div style={{ color: "var(--text-muted)", fontSize: 13, lineHeight: 1.6 }}>{error}</div>
          </div>
        ) : stationsWithCoords.length === 0 ? (
          <div className="card fu" style={{ padding: 40, textAlign: "center" }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>🗺</div>
            <div style={{ fontWeight: 700, marginBottom: 6 }}>No stations to display on map</div>
            <div style={{ fontSize: 12, color: "var(--text-muted)" }}>Station IDs from your API may not match coordinate IDs.</div>
          </div>
        ) : (
          <div className="fu" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {/* Info row */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div className="eyebrow">NYC Subway Stations</div>
              <div style={{ display: "flex", gap: 8 }}>
                <span className="badge b-orange" style={{ fontSize: 10 }}>
                  <span className="dot dot-ok" />
                  {stationsWithCoords.length} mapped
                </span>
              </div>
            </div>

            {/* Map container */}
            <div style={{
              borderRadius: "var(--r-lg)",
              overflow: "hidden",
              border: "1px solid var(--border)",
              height: "70vh",
              boxShadow: "0 20px 50px rgba(0,0,0,.5)",
              position: "relative"
            }}>
              <MapContainer center={center} zoom={12} style={{ height: "100%", width: "100%" }}>
                <TileLayer
                  attribution='&copy; OpenStreetMap contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
{stationsWithCoords.map(s => (
  <Marker
    key={s.id}
    position={[s.lat, s.lng]}
    eventHandlers={{
      click: () => navigate(`/station/${s.id}`)
    }}
  />
))}
              </MapContainer>
            </div>

            <div style={{ fontSize: 11, color: "var(--text-subtle)" }}>
              Map tiles: OpenStreetMap contributors. Coordinates served via AWS Lambda <code style={{ fontFamily: "monospace", background: "var(--surface2)", padding: "1px 5px", borderRadius: 4 }}>/coords</code>.
            </div>
          </div>
        )}
      </main>

      <MTAChatBot />
      <footer style={{ background: "var(--surface2)", borderTop: "2px solid var(--orange)", marginTop: "auto" }}>
        {/* Top bar */}
        <div style={{ background: "var(--orange)", padding: "10px 20px" }}>
          <div className="wrap" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 28, height: 28, borderRadius: "50%", background: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", border: "1.5px solid rgba(255,255,255,0.4)" }}>
                <span className="display" style={{ fontSize: 13, color: "#fff" }}>M</span>
              </div>
              <span className="display" style={{ fontSize: 14, color: "#fff", letterSpacing: "0.1em" }}>MTA TRANSIT STATUS</span>
            </div>
            <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
              {[["Map", "/map"], ["Route Planner", "/route-planner"], ["Delay Insights", "/delay-insights"], ["Stations", "/stations"]].map(([label, path]) => (
                <a key={path} href={path} style={{ fontSize: 11, color: "rgba(255,255,255,0.85)", textDecoration: "none", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase" }}>{label}</a>
              ))}
            </div>
          </div>
        </div>
        {/* Bottom bar */}
        <div style={{ padding: "14px 20px" }}>
          <div className="wrap" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
            <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
              <div>
                <div style={{ fontSize: 10, color: "var(--text-subtle)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 3 }}>Platform</div>
                <div className="mono" style={{ fontSize: 12, color: "var(--text-muted)", fontWeight: 600 }}>React · AWS Serverless</div>
              </div>
              <div>
                <div style={{ fontSize: 10, color: "var(--text-subtle)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 3 }}>Data</div>
                <div className="mono" style={{ fontSize: 12, color: "var(--text-muted)", fontWeight: 600 }}>MTA Open API</div>
              </div>
              <div>
                <div style={{ fontSize: 10, color: "var(--text-subtle)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 3 }}>Coverage</div>
                <div className="mono" style={{ fontSize: 12, color: "var(--text-muted)", fontWeight: 600 }}>NYC Subway</div>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ width: 7, height: 7, borderRadius: "50%", background: "var(--green)", display: "inline-block", boxShadow: "0 0 6px var(--green)" }} />
              <span style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 600 }}>Systems Operational</span>
            </div>
          </div>
          <div className="wrap" style={{ borderTop: "1px solid var(--border)", marginTop: 12, paddingTop: 12 }}>
            <div style={{ fontSize: 10, color: "var(--text-subtle)", lineHeight: 1.6 }}>
              © {new Date().getFullYear()} MTA Transit Status Platform · Real-time elevator &amp; escalator data · For informational use only · Not an official MTA product
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
