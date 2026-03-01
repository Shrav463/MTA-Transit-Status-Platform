import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getStations, getStationStatus } from "../services/api";
import { useFavorites } from "../hooks/useFavorites";
import heroImg from "../assets/mta_train.jpg";
import MTAChatBot from "../components/MTAChatBot.jsx";

function normalizeStation(raw) {
  const id = raw?.station_id ?? raw?.id ?? raw?.stationId ?? "";
  const name = raw?.station_name ?? raw?.name ?? raw?.stationName ?? "";
  const lines = Array.isArray(raw?.lines) ? raw.lines : [];
  return { id: String(id), name: String(name), lines };
}

function statusMeta(value) {
  const v = (value || "").toLowerCase();
  if (v.includes("operational")) return { cls: "b-green", dot: "dot-ok", label: value };
  if (v.includes("out"))         return { cls: "b-red",   dot: "dot-out", label: value };
  return { cls: "b-ghost", dot: "dot-unknown", label: value || "Unknown" };
}

function StatusRow({ label, value }) {
  const m = statusMeta(value);
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
      <span style={{ fontSize: 12, color: "var(--text-muted)" }}>{label}</span>
      <span className={`badge ${m.cls}`} style={{ fontSize: 11 }}>
        <span className={`dot ${m.dot}`} />
        {m.label}
      </span>
    </div>
  );
}

function LineDots({ lines = [] }) {
  if (!lines?.length) return null;
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginTop: 10 }}>
      {lines.slice(0, 8).map((ln, i) => (
        <span key={`${ln}-${i}`} className="line-circle" title={`Line ${ln}`}>{ln}</span>
      ))}
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="card" style={{ padding: 20 }}>
      <div className="skel" style={{ height: 16, width: "60%", marginBottom: 8 }} />
      <div className="skel" style={{ height: 12, width: "35%" }} />
      <div style={{ marginTop: 14, display: "flex", gap: 4 }}>
        {[1,2,3].map(i => <div key={i} className="skel" style={{ width: 24, height: 24, borderRadius: "50%" }} />)}
      </div>
      <div style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 8 }}>
        <div className="skel" style={{ height: 12 }} />
        <div className="skel" style={{ height: 12 }} />
      </div>
    </div>
  );
}

export default function Home() {
  const navigate = useNavigate();
  const { favorites, toggleFavorite } = useFavorites();
  const PAGE_SIZE = 12;
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [statusPreview, setStatusPreview] = useState({});
  const [error, setError] = useState("");
  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false);

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        setError(""); setLoading(true);
        const list = await getStations();
        if (!mounted) return;
        const normalized = (Array.isArray(list) ? list : []).map(normalizeStation);
        setStations(normalized);
        const top = normalized.slice(0, 8);
        const previews = {};
        await Promise.all(top.map(async (s) => {
          try {
            const st = await getStationStatus(s.id);
            previews[s.id] = { elevator_status: st.elevator_status ?? "Unknown", escalator_status: st.escalator_status ?? "Unknown", last_updated: st.last_updated ?? new Date().toISOString() };
          } catch {
            previews[s.id] = { elevator_status: "Unknown", escalator_status: "Unknown", last_updated: new Date().toISOString() };
          }
        }));
        if (!mounted) return;
        setStatusPreview(previews);
      } catch (e) {
        if (!mounted) return;
        setError(e?.message || "Failed to load stations.");
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => { mounted = false; };
  }, []);

  useEffect(() => { setVisibleCount(PAGE_SIZE); }, [query, showOnlyFavorites, favorites]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = stations;
    if (q) list = list.filter(s => s.name.toLowerCase().includes(q) || s.id.toLowerCase().includes(q));
    if (showOnlyFavorites) list = list.filter(s => favorites.includes(s.id));
    const favSet = new Set(favorites);
    return [...list].sort((a, b) => (favSet.has(b.id) ? 1 : 0) - (favSet.has(a.id) ? 1 : 0));
  }, [query, stations, favorites, showOnlyFavorites]);

  const visibleStations = useMemo(() => filtered.slice(0, visibleCount), [filtered, visibleCount]);

  return (
    <div className="page">
      {/* Orange stripe */}
      <div className="stripe" />

      {/* Nav */}
      <nav className="mta-nav">
        <div className="wrap" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 20px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            {/* MTA-style bullet */}
            <div style={{ width: 36, height: 36, borderRadius: "50%", background: "var(--orange)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <span className="display" style={{ fontSize: 16, color: "#fff", lineHeight: 1 }}>M</span>
            </div>
            <div>
              <div className="display" style={{ fontSize: 22, color: "var(--text)", letterSpacing: "0.06em" }}>
                MTA TRANSIT STATUS
              </div>
              <div style={{ fontSize: 10, color: "var(--text-subtle)", letterSpacing: "0.12em", textTransform: "uppercase", marginTop: -2 }}>
                New York City
              </div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {[["🗺 Map", "/map"], ["🗺 Route", "/route-planner"], ["⚡ Delays", "/delay-insights"], ["☰ Stations", "/stations"]].map(([label, path]) => (
              <button key={path} onClick={() => navigate(path)} className="btn btn-ghost" style={{ padding: "7px 14px", fontSize: 12 }}>{label}</button>
            ))}
          </div>
        </div>
      </nav>

      {/* Hero */}
      <div style={{ position: "relative", overflow: "hidden" }}>
        <img src={heroImg} alt="NYC Subway" style={{ width: "100%", height: 280, objectFit: "cover", display: "block", filter: "brightness(0.45) saturate(0.7)" }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, var(--bg) 0%, transparent 50%)" }} />
        <div className="wrap" style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "0 20px 28px" }}>
          <div className="eyebrow" style={{ marginBottom: 8 }}>Live Service Status</div>
          <div className="display fu" style={{ fontSize: "clamp(2.2rem, 5vw, 4rem)", color: "#fff" }}>
            CHECK YOUR STATION
          </div>
          <p className="fu fu1" style={{ color: "var(--text-muted)", fontSize: 14, marginTop: 6, maxWidth: 480 }}>
            Elevator & escalator availability before you head down.
          </p>
        </div>
      </div>

      {/* Search + filters */}
      <div className="wrap" style={{ padding: "28px 20px 0" }}>
        <div className="fu fu2" style={{ position: "relative" }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-subtle)" strokeWidth="2" strokeLinecap="round"
            style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}>
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search stations — Times Sq, Penn Station, Union Sq…"
            className="inp"
            style={{ paddingLeft: 40, paddingRight: 16, fontSize: 14 }}
          />
        </div>

        <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
          <button onClick={() => setShowOnlyFavorites(false)} className="btn" style={{ padding: "7px 16px", fontSize: 12, background: !showOnlyFavorites ? "var(--orange)" : "var(--surface2)", color: !showOnlyFavorites ? "#fff" : "var(--text-muted)", border: !showOnlyFavorites ? "none" : "1px solid var(--border)" }}>
            All Stations
          </button>
          <button onClick={() => setShowOnlyFavorites(true)} className="btn" style={{ padding: "7px 16px", fontSize: 12, background: showOnlyFavorites ? "var(--orange)" : "var(--surface2)", color: showOnlyFavorites ? "#fff" : "var(--text-muted)", border: showOnlyFavorites ? "none" : "1px solid var(--border)" }}>
            ★ Favorites{favorites.length ? ` (${favorites.length})` : ""}
          </button>
        </div>
      </div>

      {/* Station grid */}
      <main className="wrap" style={{ padding: "20px 20px 48px", flex: 1 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <div style={{ fontSize: 13, color: "var(--text-muted)" }}>
            {loading ? "Loading…" : <><span style={{ color: "var(--text)", fontWeight: 600 }}>{filtered.length}</span> stations</>}
          </div>
          <div className="mono" style={{ fontSize: 11, color: "var(--text-subtle)", letterSpacing: "0.08em" }}>AWS API</div>
        </div>

        {loading ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 12 }}>
            {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : error ? (
          <div className="card" style={{ padding: 28, borderColor: "rgba(255,51,85,.2)", background: "rgba(255,51,85,.04)" }}>
            <div style={{ fontWeight: 700, color: "var(--red)", marginBottom: 6 }}>Connection Error</div>
            <div style={{ color: "var(--text-muted)", fontSize: 13, lineHeight: 1.6 }}>{error}</div>
            <div style={{ marginTop: 12, fontSize: 12, color: "var(--text-subtle)" }}>
              Check that <code style={{ background: "var(--surface2)", padding: "1px 6px", borderRadius: 4, fontFamily: "monospace" }}>VITE_API_BASE</code> is set and your AWS API is deployed.
            </div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="card" style={{ padding: 40, textAlign: "center" }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>{showOnlyFavorites ? "★" : "🔍"}</div>
            <div style={{ fontWeight: 700, marginBottom: 6 }}>{showOnlyFavorites ? "No favorites saved yet" : "No stations found"}</div>
            <div style={{ color: "var(--text-muted)", fontSize: 13 }}>{showOnlyFavorites ? "Tap the star on any station card to save it." : "Try a different search term."}</div>
          </div>
        ) : (
          <>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 12 }}>
              {visibleStations.map((s, idx) => {
                const prev = statusPreview[s.id];
                const isFav = favorites.includes(s.id);
                return (
                  <div
                    key={`${s.id}-${idx}`}
                    className="card card-interactive fu"
                    style={{ padding: 18, animationDelay: `${Math.min(idx, 8) * 0.04}s` }}
                    role="button" tabIndex={0}
                    onClick={() => navigate(`/station/${s.id}`)}
                    onKeyDown={e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); navigate(`/station/${s.id}`); } }}
                  >
                    {/* Header */}
                    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10 }}>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontWeight: 700, fontSize: 15, lineHeight: 1.25, marginBottom: 3 }}>{s.name}</div>
                        <div className="mono" style={{ fontSize: 10, color: "var(--text-subtle)", letterSpacing: "0.06em" }}>ID {s.id}</div>
                      </div>
                      <button
                        type="button"
                        onClick={e => { e.stopPropagation(); toggleFavorite(s.id); }}
                        style={{ background: isFav ? "var(--yellow-dim)" : "var(--surface2)", border: `1px solid ${isFav ? "rgba(255,189,46,.25)" : "var(--border)"}`, color: isFav ? "var(--yellow)" : "var(--text-subtle)", borderRadius: 8, width: 30, height: 30, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0, fontSize: 13, transition: "all .15s" }}
                        aria-label={isFav ? "Remove favorite" : "Add favorite"}
                      >
                        {isFav ? "★" : "☆"}
                      </button>
                    </div>

                    <LineDots lines={s.lines} />

                    <hr className="divider" style={{ margin: "14px 0" }} />

                    <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                      <StatusRow label="Elevator" value={prev?.elevator_status || "—"} />
                      <StatusRow label="Escalator" value={prev?.escalator_status || "—"} />
                    </div>

                    {prev?.last_updated && (
                      <div className="mono" style={{ fontSize: 10, color: "var(--text-subtle)", marginTop: 10 }}>
                        {new Date(prev.last_updated).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10, marginTop: 32 }}>
              {filtered.length > visibleCount ? (
                <button onClick={() => setVisibleCount(c => c + PAGE_SIZE)} className="btn btn-primary" style={{ minWidth: 160 }}>
                  Load more
                </button>
              ) : (
                <div style={{ color: "var(--text-subtle)", fontSize: 12, letterSpacing: "0.1em" }}>END OF LINE</div>
              )}
              {visibleCount > PAGE_SIZE && (
                <button onClick={() => setVisibleCount(PAGE_SIZE)} className="btn btn-subtle" style={{ minWidth: 120, fontSize: 12 }}>
                  Show less
                </button>
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
