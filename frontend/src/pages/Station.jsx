import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getStations, getStationStatus } from "../services/api";
import MTAChatBot from "../components/MTAChatBot.jsx";

function normalizeStation(raw) {
  const id = raw?.station_id ?? raw?.id ?? raw?.stationId ?? "";
  const name = raw?.station_name ?? raw?.name ?? raw?.stationName ?? "";
  const lines = Array.isArray(raw?.lines) ? raw.lines : [];
  return { id: String(id), name: String(name), lines };
}

function statusMeta(value) {
  const v = (value || "").toLowerCase();
  if (v.includes("operational")) return { cls: "b-green", dot: "dot-ok" };
  if (v.includes("out"))         return { cls: "b-red",   dot: "dot-out" };
  return { cls: "b-ghost", dot: "dot-unknown" };
}

function StatusRow({ label, value, loading }) {
  const display = loading ? "Checking…" : (value || "Unknown");
  const m = statusMeta(display);
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
      <span style={{ fontSize: 11, color: "var(--text-muted)" }}>{label}</span>
      <span className={`badge ${m.cls}`} style={{ fontSize: 11 }}>
        <span className={`dot ${m.dot}`} />
        {display}
      </span>
    </div>
  );
}

function LineDots({ lines = [] }) {
  if (!lines?.length) return null;
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginTop: 10 }}>
      {lines.slice(0, 8).map((ln, i) => (
        <span key={`${ln}-${i}`} className="line-circle">{ln}</span>
      ))}
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="card" style={{ padding: 18 }}>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <div style={{ flex: 1 }}>
          <div className="skel" style={{ height: 15, width: "65%", marginBottom: 7 }} />
          <div className="skel" style={{ height: 11, width: "30%" }} />
        </div>
        <div className="skel" style={{ width: 28, height: 28, borderRadius: 8 }} />
      </div>
      <div style={{ display: "flex", gap: 4, marginTop: 12 }}>
        {[1,2,3].map(i => <div key={i} className="skel" style={{ width: 24, height: 24, borderRadius: "50%" }} />)}
      </div>
      <hr className="divider" style={{ margin: "13px 0" }} />
      <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
        <div className="skel" style={{ height: 11 }} />
        <div className="skel" style={{ height: 11 }} />
      </div>
    </div>
  );
}

export default function Stations() {
  const navigate = useNavigate();
  const PAGE_SIZE = 12;

  const [stations, setStations]             = useState([]);
  const [loadingStations, setLoadingStations] = useState(true);
  const [visibleCount, setVisibleCount]     = useState(PAGE_SIZE);
  const [statusById, setStatusById]         = useState({});
  const [loadingStatusById, setLoadingStatusById] = useState({});

  const [favorites, setFavorites] = useState(() => {
    try { return JSON.parse(localStorage.getItem("mta_favorites") || "{}"); } catch { return {}; }
  });
  useEffect(() => { localStorage.setItem("mta_favorites", JSON.stringify(favorites)); }, [favorites]);

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        setLoadingStations(true);
        const list = await getStations();
        if (!mounted) return;
        setStations((Array.isArray(list) ? list : []).map(normalizeStation));
      } catch { if (!mounted) return; setStations([]); }
      finally { if (mounted) setLoadingStations(false); }
    }
    load();
    return () => { mounted = false; };
  }, []);

  const visibleStations = useMemo(() => stations.slice(0, visibleCount), [stations, visibleCount]);
  const inFlightRef = useRef(new Set());

  useEffect(() => {
    if (!visibleStations.length) return;
    visibleStations.forEach(st => {
      const id = st.id;
      if (!id || statusById[id] || inFlightRef.current.has(id)) return;
      inFlightRef.current.add(id);
      setLoadingStatusById(prev => ({ ...prev, [id]: true }));
      getStationStatus(id)
        .then(res => setStatusById(prev => ({
          ...prev,
          [id]: { elevator_status: res?.elevator_status ?? "Unknown", escalator_status: res?.escalator_status ?? "Unknown", last_updated: res?.last_updated ?? new Date().toISOString() }
        })))
        .catch(() => setStatusById(prev => ({
          ...prev,
          [id]: { elevator_status: "Unknown", escalator_status: "Unknown", last_updated: new Date().toISOString() }
        })))
        .finally(() => { inFlightRef.current.delete(id); setLoadingStatusById(prev => ({ ...prev, [id]: false })); });
    });
  }, [visibleStations]);

  const toggleFav = id => setFavorites(prev => ({ ...prev, [id]: !prev[id] }));

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
              <div className="display" style={{ fontSize: 20, letterSpacing: "0.06em" }}>ALL STATIONS</div>
              <div style={{ fontSize: 10, color: "var(--text-subtle)", letterSpacing: "0.1em", textTransform: "uppercase" }}>
                {loadingStations ? "Loading…" : `${stations.length} stations`}
              </div>
            </div>
          </div>
          <button onClick={() => navigate("/")} className="btn btn-ghost" style={{ fontSize: 12 }}>← Home</button>
        </div>
      </nav>

      <main className="wrap" style={{ padding: "28px 20px 48px", flex: 1 }}>
        {loadingStations ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 12 }}>
            {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : (
          <>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
              <div className="eyebrow">Station directory</div>
              <div className="mono" style={{ fontSize: 11, color: "var(--text-subtle)" }}>
                {Math.min(visibleCount, stations.length)} / {stations.length}
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 12 }}>
              {visibleStations.map((st, idx) => {
                const status    = statusById[st.id];
                const isLoading = loadingStatusById[st.id];
                const isFav     = favorites[st.id];
                return (
                  <div
                    key={st.id}
                    className="card card-interactive fu"
                    style={{ padding: 18, animationDelay: `${Math.min(idx, 10) * 0.035}s` }}
                  >
                    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8 }}>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontWeight: 700, fontSize: 14, lineHeight: 1.3, marginBottom: 3 }}>{st.name}</div>
                        <div className="mono" style={{ fontSize: 10, color: "var(--text-subtle)", letterSpacing: "0.06em" }}>ID {st.id}</div>
                      </div>
                      <button
                        onClick={() => toggleFav(st.id)}
                        style={{ background: isFav ? "var(--yellow-dim)" : "var(--surface2)", border: `1px solid ${isFav ? "rgba(255,189,46,.25)" : "var(--border)"}`, color: isFav ? "var(--yellow)" : "var(--text-subtle)", borderRadius: 8, width: 28, height: 28, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0, fontSize: 12, transition: "all .15s" }}
                        aria-label="Toggle favorite"
                      >
                        {isFav ? "★" : "☆"}
                      </button>
                    </div>

                    <LineDots lines={st.lines} />

                    <hr className="divider" style={{ margin: "12px 0" }} />

                    <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                      <StatusRow label="Elevator"  value={status?.elevator_status}  loading={isLoading} />
                      <StatusRow label="Escalator" value={status?.escalator_status} loading={isLoading} />
                    </div>

                    <button
                      onClick={() => navigate(`/station/${st.id}`)}
                      className="btn btn-ghost"
                      style={{ marginTop: 14, width: "100%", fontSize: 12, padding: "7px 12px" }}
                    >
                      View station →
                    </button>
                  </div>
                );
              })}
            </div>

            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10, marginTop: 32 }}>
              {stations.length > visibleCount ? (
                <button onClick={() => setVisibleCount(c => Math.min(c + PAGE_SIZE, stations.length))} className="btn btn-primary" style={{ minWidth: 160 }}>Load more</button>
              ) : (
                <div style={{ color: "var(--text-subtle)", fontSize: 12, letterSpacing: "0.1em" }}>END OF LINE</div>
              )}
              {visibleCount > PAGE_SIZE && (
                <button onClick={() => setVisibleCount(PAGE_SIZE)} className="btn btn-subtle" style={{ fontSize: 12 }}>Show less</button>
              )}
            </div>
          </>
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
