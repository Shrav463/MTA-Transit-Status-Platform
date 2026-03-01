import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getStations, getStationStatus } from "../services/api";
import MTAChatBot from "../components/MTAChatBot.jsx";

function normalizeStation(raw) {
  const id = raw?.station_id ?? raw?.id ?? raw?.stationId ?? "";
  const name = raw?.station_name ?? raw?.name ?? raw?.stationName ?? "";
  const lines = Array.isArray(raw?.lines) ? raw.lines : [];
  return { id: String(id), name, lines };
}

export default function StationPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [station, setStation] = useState(null);
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        setLoading(true);

        const [stations, stationStatus] = await Promise.all([
          getStations(),
          getStationStatus(id),
        ]);

        if (!mounted) return;

        const normalized = (stations || []).map(normalizeStation);
        const found = normalized.find(s => s.id === id);

        setStation(found || null);
        setStatus(stationStatus || null);
      } catch (err) {
        console.error(err);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();
    return () => { mounted = false };
  }, [id]);

  if (loading) {
    return (
      <div style={{ padding: 40 }}>
        <h2>Loading station...</h2>
      </div>
    );
  }

  if (!station) {
    return (
      <div style={{ padding: 40 }}>
        <h2>Station not found</h2>
        <button onClick={() => navigate("/map")}>← Back to Map</button>
      </div>
    );
  }

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
              <div className="display" style={{ fontSize: 20, letterSpacing: "0.06em" }}>STATION DETAIL</div>
              <div style={{ fontSize: 10, color: "var(--text-subtle)", letterSpacing: "0.1em", textTransform: "uppercase" }}>NYC Subway</div>
            </div>
          </div>
          <button onClick={() => navigate(-1)} className="btn btn-ghost" style={{ fontSize: 12 }}>← Back</button>
        </div>
      </nav>
      <main className="wrap" style={{ padding: "28px 20px 48px", flex: 1 }}>

      <h1 style={{ fontSize: 32, marginBottom: 8 }}>
        {station.name}
      </h1>

      <div style={{ color: "#666", marginBottom: 20 }}>
        Station ID: {station.id}
      </div>

      {/* Lines */}
      <div style={{ marginBottom: 24 }}>
        <h3>Lines</h3>
        {station.lines?.length > 0 ? (
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {station.lines.map((line, i) => (
              <span
                key={i}
                style={{
                  padding: "6px 10px",
                  background: "#ff6b00",
                  color: "#fff",
                  borderRadius: 6,
                  fontWeight: 600
                }}
              >
                {line}
              </span>
            ))}
          </div>
        ) : (
          <div>No line data available</div>
        )}
      </div>

      {/* Accessibility */}
      <div>
        <h3>Accessibility Status</h3>

        <div style={{ marginTop: 10 }}>
          <strong>Elevator:</strong>{" "}
          {status?.elevator_status || "Unknown"}
        </div>

        <div style={{ marginTop: 6 }}>
          <strong>Escalator:</strong>{" "}
          {status?.escalator_status || "Unknown"}
        </div>

        {status?.last_updated && (
          <div style={{ marginTop: 10, fontSize: 12, color: "#888" }}>
            Last Updated: {new Date(status.last_updated).toLocaleString()}
          </div>
        )}
      </div>
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