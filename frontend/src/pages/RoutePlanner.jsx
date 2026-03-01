import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getStations, getStationStatus } from "../services/api";
import MTAChatBot from "../components/MTAChatBot.jsx"

function normalizeStation(raw) {
  const id = raw?.station_id ?? raw?.id ?? raw?.stationId ?? "";
  const name = raw?.station_name ?? raw?.name ?? raw?.stationName ?? "";
  const lines = Array.isArray(raw?.lines) ? raw.lines : [];
  return { id: String(id), name: String(name), lines };
}

function extractStationId(text) {
  const m = String(text || "").match(/\(ID:\s*([^)]+)\)/i);
  return m?.[1] ? String(m[1]).trim() : null;
}
function stripIdLabel(text) {
  return String(text || "").replace(/\s*\(ID:\s*[^)]+\)\s*/i, "").trim();
}

function statusMeta(value) {
  const v = (value || "").toLowerCase();
  if (v.includes("operational")) return { cls: "b-green", dot: "dot-ok" };
  if (v.includes("out"))         return { cls: "b-red",   dot: "dot-out" };
  return { cls: "b-ghost", dot: "dot-unknown" };
}

function StatusRow({ label, value }) {
  const m = statusMeta(value);
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
      <span style={{ fontSize: 11, color: "var(--text-muted)" }}>{label}</span>
      <span className={`badge ${m.cls}`} style={{ fontSize: 11 }}>
        <span className={`dot ${m.dot}`} />
        {value || "Unknown"}
      </span>
    </div>
  );
}

function LineDots({ lines = [], label }) {
  return (
    <div>
      {label && <div style={{ fontSize: 10, color: "var(--text-subtle)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 6 }}>{label}</div>}
      {lines.length ? (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
          {lines.map((ln, i) => <span key={`${ln}-${i}`} className="line-circle">{ln}</span>)}
        </div>
      ) : (
        <div style={{ fontSize: 12, color: "var(--text-subtle)" }}>No lines found</div>
      )}
    </div>
  );
}

function StationCombo({ label, helper, value, setValue, options, loading, placeholder }) {
  const wrapRef = useRef(null);
  const [open, setOpen] = useState(false);

  const filtered = useMemo(() => {
    const q = (value || "").trim().toLowerCase();
    if (!q) return options;
    return options.filter(o => o.label.toLowerCase().includes(q));
  }, [options, value]);

  useEffect(() => {
    function onDown(e) {
      if (!wrapRef.current?.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  return (
 <div
  ref={wrapRef}
  style={{
    position: "relative",
    width: "100%"
  }}
>
      <div style={{
        fontSize: 11,
        fontWeight: 700,
        color: "var(--text-muted)",
        letterSpacing: "0.1em",
        textTransform: "uppercase",
        marginBottom: 6
      }}>
        {label}
      </div>

<div
  style={{
    position: "relative",
    width: "100%"
  }}
>
        <input
          value={value}
          onChange={e => { setValue(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          onClick={() => setOpen(true)}
          placeholder={placeholder}
          className="inp"
          style={{ paddingRight: 80, fontSize: 13 }}
        />

        {value?.trim() && (
          <button
            type="button"
            onClick={() => { setValue(""); setOpen(true); }}
            style={{
              position: "absolute",
              right: 36,
              top: "50%",
              transform: "translateY(-50%)",
              background: "var(--surface3)",
              border: "1px solid var(--border)",
              color: "var(--text-muted)",
              borderRadius: 6,
              width: 28,
              height: 28,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              fontSize: 11
            }}
          >
            ✕
          </button>
        )}

        <button
          type="button"
          onClick={() => setOpen(v => !v)}
          style={{
            position: "absolute",
            right: 4,
            top: "50%",
            transform: "translateY(-50%)",
            background: "var(--surface3)",
            border: "1px solid var(--border)",
            color: "var(--text-muted)",
            borderRadius: 6,
            width: 28,
            height: 28,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            fontSize: 11
          }}
        >
          ▾
        </button>
      </div>

      {helper && (
        <div style={{ fontSize: 11, color: "var(--text-subtle)", marginTop: 5 }}>
          {helper}
        </div>
      )}

   {open && (
  <div
    style={{
      position: "absolute",
      top: "calc(100% + 6px)",
      left: 0,
      width: "100%",
      zIndex: 100,
      background: "var(--surface2)",
      border: "1px solid var(--border2)",
      borderRadius: "12px",
      boxShadow: "0 20px 50px rgba(0,0,0,.6)",
      maxHeight: 280,
      overflowY: "auto"
    }}
  >
          {loading ? (
            <div style={{ padding: "12px 16px", fontSize: 12, color: "var(--text-muted)" }}>
              Loading stations…
            </div>
          ) : !filtered.length ? (
            <div style={{ padding: "12px 16px", fontSize: 12, color: "var(--text-muted)" }}>
              No matching stations.
            </div>
          ) : (
            <ul style={{ listStyle: "none", margin: 0, padding: "4px 0" }}>
              {filtered.slice(0, 200).map(opt => (
                <li
                  key={opt.id}
                  onMouseDown={() => {
                    setValue(opt.label);
                    setOpen(false);
                  }}
                  style={{
                    padding: "9px 14px",
                    cursor: "pointer",
                    transition: "background .1s"
                  }}
                  onMouseEnter={e =>
                    e.currentTarget.style.background = "var(--surface3)"
                  }
                  onMouseLeave={e =>
                    e.currentTarget.style.background = "transparent"
                  }
                >
                  <div style={{ fontWeight: 600, fontSize: 13 }}>
                    {opt.name}
                  </div>
                  <div
                    className="mono"
                    style={{ fontSize: 10, color: "var(--text-subtle)", marginTop: 1 }}
                  >
                    ID {opt.id}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

function Timeline({ stops = [] }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 0, marginTop: 16 }}>
      {stops.map((s, idx) => (
        <div key={idx} style={{ display: "flex", gap: 12 }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            <div className="tl-node" style={{ marginTop: 2 }} />
            {idx !== stops.length - 1 && (
              <div style={{ width: 2, flex: 1, background: "linear-gradient(var(--orange), var(--surface3))", minHeight: 32, borderRadius: 99 }} />
            )}
          </div>
          <div style={{ paddingBottom: idx !== stops.length - 1 ? 24 : 0, minWidth: 0 }}>
            <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 6 }}>
              <span style={{ fontWeight: 700, fontSize: 14 }}>{s.title}</span>
              {s.badges?.map(b => <span key={b} className="badge b-ghost" style={{ fontSize: 10 }}>{b}</span>)}
            </div>
            {s.note && <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 3 }}>{s.note}</div>}
          </div>
        </div>
      ))}
    </div>
  );
}

export default function RoutePlanner() {
  const navigate = useNavigate();
  const [stations, setStations]           = useState([]);
  const [loadingStations, setLoadingStations] = useState(true);
  const [fromText, setFromText]           = useState("");
  const [toText, setToText]               = useState("");
  const [selected, setSelected]           = useState("Recommended");
  const [showDetails, setShowDetails]     = useState(false);
  const [statusById, setStatusById]       = useState({});
  const [loadingStatus, setLoadingStatus] = useState(false);

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

  useEffect(() => {
    if (!showDetails) return;
    const onKeyDown = e => { if (e.key === "Escape") setShowDetails(false); };
    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", onKeyDown); document.body.style.overflow = ""; };
  }, [showDetails]);

  const stationOptions = useMemo(() =>
    stations.filter(s => s.name && s.id)
      .map(s => ({ id: s.id, label: `${s.name} (ID: ${s.id})`, name: s.name }))
      .sort((a, b) => a.name.localeCompare(b.name)),
    [stations]);

  const fromId   = extractStationId(fromText);
  const toId     = extractStationId(toText);
  const fromName = stripIdLabel(fromText);
  const toName   = stripIdLabel(toText);

  const fromStation = useMemo(() => fromId ? stations.find(s => s.id === fromId) : null, [fromId, stations]);
  const toStation   = useMemo(() => toId   ? stations.find(s => s.id === toId)   : null, [toId, stations]);

  const fromLines   = fromStation?.lines || [];
  const toLines     = toStation?.lines   || [];
  const directLines = useMemo(() => {
    const set = new Set(fromLines.map(x => String(x)));
    return toLines.map(x => String(x)).filter(x => set.has(x));
  }, [fromLines, toLines]);

  const canShow = fromText.trim().length > 0 && toText.trim().length > 0;

  useEffect(() => {
    let mounted = true;
    async function loadStatuses() {
      if (!showDetails) return;
      const ids = [fromId, toId].filter(Boolean);
      if (!ids.length) return;
      try {
        setLoadingStatus(true);
        const updates = {};
        await Promise.all(ids.map(async id => {
          try {
            const st = await getStationStatus(id);
            updates[id] = { elevator_status: st?.elevator_status ?? "Unknown", escalator_status: st?.escalator_status ?? "Unknown", last_updated: st?.last_updated ?? new Date().toISOString() };
          } catch {
            updates[id] = { elevator_status: "Unknown", escalator_status: "Unknown", last_updated: new Date().toISOString() };
          }
        }));
        if (!mounted) return;
        setStatusById(prev => ({ ...prev, ...updates }));
      } finally { if (mounted) setLoadingStatus(false); }
    }
    loadStatuses();
    return () => { mounted = false; };
  }, [showDetails, fromId, toId]);

  const fromStatus = fromId ? statusById[fromId] : null;
  const toStatus   = toId   ? statusById[toId]   : null;

  const timeline = useMemo(() => {
    if (!canShow) return [];
    const direct = directLines.length > 0;
    return [
      { title: fromName || fromText, badges: ["Depart"], note: direct ? "Board a direct train." : "Start at this station." },
      { title: direct ? "Direct train" : "Transfer required", badges: [direct ? "Ride" : "Change"], note: direct ? `Take: ${directLines.join(", ")}` : "Board the best line and transfer mid-route." },
      { title: toName || toText, badges: ["Arrive"], note: "Your destination." },
    ];
  }, [canShow, fromName, toName, fromText, toText, directLines]);

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
              <div className="display" style={{ fontSize: 20, letterSpacing: "0.06em" }}>ROUTE PLANNER</div>
              <div style={{ fontSize: 10, color: "var(--text-subtle)", letterSpacing: "0.1em", textTransform: "uppercase" }}>
                {loadingStations ? "Loading…" : `${stationOptions.length} stations`}
              </div>
            </div>
          </div>
          <button onClick={() => navigate("/")} className="btn btn-ghost" style={{ fontSize: 12 }}>← Home</button>
        </div>
      </nav>

      <main className="wrap" style={{ padding: "28px 20px 48px", flex: 1, display: "flex", flexDirection: "column", gap: 20 }}>

        {/* Trip inputs */}
       <section
  className="card fu"
  style={{
    padding: 22,
    position: "relative",
    zIndex: 10
  }}
>
          <div className="eyebrow" style={{ marginBottom: 14 }}>Trip details</div>
         <div
  style={{
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 16,
    alignItems: "start"
  }}
>
            <StationCombo
              label="From"
              helper="Select from dropdown for accurate line data"
              value={fromText} setValue={setFromText}
              options={stationOptions} loading={loadingStations}
              placeholder="Origin station…"
            />
            <StationCombo
              label="To"
              helper="Pick a destination station"
              value={toText} setValue={setToText}
              options={stationOptions} loading={loadingStations}
              placeholder="Destination station…"
            />
          </div>
        </section>

        {!canShow ? (
         <section
  className="card fu fu1"
  style={{
    padding: 32,
    textAlign: "center",
    position: "relative",
    zIndex: 1
  }}
>
            <div style={{ fontSize: 28, marginBottom: 10 }}>🚇</div>
            <div style={{ fontWeight: 700, marginBottom: 6 }}>Select stations above to plan your route</div>
            <div style={{ fontSize: 12, color: "var(--text-muted)" }}>Choose a From and To station from the dropdowns to see available lines.</div>
          </section>
        ) : (
          <section style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>

            {/* Left: route analysis */}
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {/* Direct lines result */}
              <div className="card fu" style={{ padding: 20 }}>
                <div className="eyebrow" style={{ marginBottom: 10 }}>Route analysis</div>
                {directLines.length > 0 ? (
                  <>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                      <span style={{ fontSize: 18 }}>✅</span>
                      <span style={{ fontWeight: 700, fontSize: 14, color: "var(--green)" }}>Direct trains available</span>
                    </div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                      {directLines.map((t, i) => (
                        <span key={i} className="line-circle" style={{ width: 30, height: 30, fontSize: 12, background: "var(--orange-dim)", border: "1.5px solid var(--orange)", color: "var(--orange)" }}>{t}</span>
                      ))}
                    </div>
                  </>
                ) : (
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 18 }}>↔️</span>
                    <span style={{ fontWeight: 600, fontSize: 13, color: "var(--yellow)" }}>Transfer required — no shared line</span>
                  </div>
                )}
                <div style={{ fontSize: 11, color: "var(--text-subtle)", marginTop: 12, lineHeight: 1.5 }}>
                  Based on AWS station metadata, not live schedules.
                </div>
              </div>

              {/* Station lines */}
              <div className="card fu fu1" style={{ padding: 20 }}>
                <div className="eyebrow" style={{ marginBottom: 14 }}>Station lines</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  <LineDots lines={fromLines} label={fromName || "From"} />
                  <hr className="divider" />
                  <LineDots lines={toLines}   label={toName || "To"} />
                </div>
              </div>
            </div>

            {/* Right: timeline + CTA */}
            <div className="card fu fu1" style={{ padding: 22 }}>
              <div className="eyebrow" style={{ marginBottom: 6 }}>Trip guidance</div>
              <div style={{ fontWeight: 700, fontSize: 15 }}>
                {fromName || "Origin"} → {toName || "Destination"}
              </div>
              <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 4, marginBottom: 4 }}>
                {directLines.length > 0 ? "Direct lines detected — no transfer needed." : "No shared line — you'll need at least one transfer."}
              </div>

              <Timeline stops={timeline} />

              <button
                type="button"
                onClick={() => setShowDetails(true)}
                className="btn btn-primary"
                style={{ marginTop: 20, width: "100%" }}
              >
                Open route details →
              </button>
            </div>
          </section>
        )}
      </main>

      {/* Details modal */}
      {showDetails && canShow && (
        <div
          style={{ position: "fixed", inset: 0, zIndex: 50, background: "rgba(0,0,0,.7)", padding: "24px 16px", display: "flex", alignItems: "flex-start", justifyContent: "center", overflowY: "auto" }}
          onClick={() => setShowDetails(false)}
        >
          <div
            style={{ width: "100%", maxWidth: 560, background: "var(--surface)", border: "1px solid var(--border2)", borderRadius: "var(--r-lg)", boxShadow: "0 24px 60px rgba(0,0,0,.6)", overflow: "hidden", maxHeight: "88vh", display: "flex", flexDirection: "column" }}
            onClick={e => e.stopPropagation()}
          >
            {/* Modal header */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 20px", borderBottom: "1px solid var(--border)", flexShrink: 0 }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: 15 }}>Route Details</div>
                <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>Lines · elevator & escalator availability</div>
              </div>
              <button
                onClick={() => setShowDetails(false)}
                style={{ background: "var(--surface2)", border: "1px solid var(--border)", color: "var(--text-muted)", borderRadius: 8, width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: 14, flexShrink: 0 }}
              >✕</button>
            </div>

            <div style={{ padding: 20, overflow: "auto", display: "flex", flexDirection: "column", gap: 16 }}>
              {/* Direct trains */}
              <div className="card" style={{ padding: 16 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 10 }}>Shared lines</div>
                {directLines.length ? (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                    {directLines.map(t => <span key={t} className="line-circle" style={{ width: 30, height: 30, fontSize: 12 }}>{t}</span>)}
                  </div>
                ) : (
                  <div style={{ fontSize: 13, color: "var(--text-muted)" }}>No direct shared line. Transfer required.</div>
                )}
              </div>

              {/* Elevator / Escalator */}
              <div className="card" style={{ padding: 16 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", letterSpacing: "0.08em", textTransform: "uppercase" }}>Accessibility</div>
                  <div style={{ fontSize: 10, color: "var(--text-subtle)" }}>{loadingStatus ? "Checking…" : "Live data"}</div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  {[
                    { label: fromName || "From", status: fromStatus, id: fromId },
                    { label: toName   || "To",   status: toStatus,   id: toId   },
                  ].map(({ label, status, id }) => (
                    <div key={label} style={{ background: "var(--surface2)", borderRadius: "var(--r)", padding: 14, border: "1px solid var(--border)" }}>
                      <div style={{ fontWeight: 700, fontSize: 12, marginBottom: 10, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{label}</div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                        <StatusRow label="Elevator"  value={status?.elevator_status  || (id ? "Loading…" : "—")} />
                        <StatusRow label="Escalator" value={status?.escalator_status || (id ? "Loading…" : "—")} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <button onClick={() => setShowDetails(false)} className="btn btn-ghost" style={{ alignSelf: "flex-start" }}>Done</button>
            </div>
          </div>
        </div>
      )}

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
