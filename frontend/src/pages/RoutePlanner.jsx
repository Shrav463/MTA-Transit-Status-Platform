import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getStations, getStationStatus } from "../services/api";
<<<<<<< HEAD
import { normalizeStations } from "../lib/stations";
import { StatusRow } from "../components/StatusBadge";
import { LineBullet } from "../components/LinePills";

// Extract stationId from "Station Name (ID: 123)" entered via picker
=======
import MTAChatBot from "../components/MTAChatBot.jsx"

function normalizeStation(raw) {
  const id = raw?.station_id ?? raw?.id ?? raw?.stationId ?? "";
  const name = raw?.station_name ?? raw?.name ?? raw?.stationName ?? "";
  const lines = Array.isArray(raw?.lines) ? raw.lines : [];
  return { id: String(id), name: String(name), lines };
}

>>>>>>> 3b2721e5055772c6e4d92bd61fd7854c779af0b4
function extractStationId(text) {
  const m = String(text || "").match(/\(ID:\s*([^)]+)\)/i);
  return m?.[1] ? String(m[1]).trim() : null;
}
function stripIdLabel(text) {
  return String(text || "").replace(/\s*\(ID:\s*[^)]+\)\s*/i, "").trim();
}

<<<<<<< HEAD
// Text badge for labels like "Transfer required" — distinct from a line
// bullet, which always represents an actual subway line.
function Tag({ children }) {
  return (
    <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-white/5 text-slate-300 border border-white/10">
      {children}
    </span>
  );
}

function TimelineInline({ stops = [] }) {
  return (
    <div className="mt-4 bg-white/80 border border-slate-200 rounded-2xl p-4">
      <h4 className="text-sm font-bold text-slate-900">Route timeline</h4>
      <div className="mt-3 space-y-3">
        {stops.map((s, idx) => (
          <div key={`${s.title}-${idx}`} className="flex items-start gap-3">
            <div className="mt-1 flex flex-col items-center">
              <div className="h-3 w-3 rounded-full bg-ink" />
              {idx !== stops.length - 1 ? <div className="w-px h-8 bg-slate-300" /> : null}
            </div>
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-semibold text-slate-900">{s.title}</span>
                {s.badges?.map((b) => (
                  <span
                    key={b}
                    className="text-xs font-semibold px-2 py-1 rounded-full bg-slate-100 text-slate-800 ring-1 ring-slate-200"
                  >
                    {b}
                  </span>
                ))}
              </div>
              {s.note ? <div className="text-xs text-slate-600 mt-1">{s.note}</div> : null}
            </div>
          </div>
        ))}
      </div>
=======
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
>>>>>>> 3b2721e5055772c6e4d92bd61fd7854c779af0b4
    </div>
  );
}

<<<<<<< HEAD
/**
 * Custom combobox input (replaces <datalist>)
 * - Always reopens dropdown on click/focus
 * - Uses onMouseDown for selection (prevents blur closing issue)
 */
function StationCombo({
  label,
  helper,
  value,
  setValue,
  options,
  loading,
  placeholder = "Choose a station…",
}) {
=======
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
>>>>>>> 3b2721e5055772c6e4d92bd61fd7854c779af0b4
  const wrapRef = useRef(null);
  const [open, setOpen] = useState(false);

  const filtered = useMemo(() => {
    const q = (value || "").trim().toLowerCase();
    if (!q) return options;
<<<<<<< HEAD
    return options.filter((o) => o.label.toLowerCase().includes(q));
  }, [options, value]);

  // Close on outside click
  useEffect(() => {
    function onDocMouseDown(e) {
      if (!wrapRef.current) return;
      if (!wrapRef.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", onDocMouseDown);
    return () => document.removeEventListener("mousedown", onDocMouseDown);
  }, []);

  const showEmpty = !loading && open && filtered.length === 0;

  return (
    <div ref={wrapRef} className="relative">
      <label className="block text-sm font-medium text-slate-200 mb-2">{label}</label>

      <div className="relative">
        <input
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onClick={() => setOpen(true)}
          placeholder={placeholder}
          className="w-full rounded-xl border border-ink-line bg-ink/40 px-4 py-3 text-white placeholder-slate-400
                     focus:outline-none focus:ring-2 focus:ring-signal focus:border-signal pr-20"
        />

        {/* Clear button */}
        {value?.trim() ? (
          <button
            type="button"
            onClick={() => {
              setValue("");
              setOpen(true);
            }}
            className="absolute right-10 top-1/2 -translate-y-1/2 h-9 w-9 rounded-xl
                       bg-slate-800 text-slate-200 border border-ink-line
                       hover:bg-signal/15 hover:text-signal transition"
            aria-label={`Clear ${label}`}
            title="Clear"
          >
            ✕
          </button>
        ) : null}

        {/* Chevron */}
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="absolute right-2 top-1/2 -translate-y-1/2 h-9 w-9 rounded-xl
                     bg-slate-800 text-slate-200 border border-ink-line
                     hover:bg-signal/15 hover:text-signal transition"
          aria-label={`Toggle ${label} dropdown`}
          title="Toggle"
=======
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
>>>>>>> 3b2721e5055772c6e4d92bd61fd7854c779af0b4
        >
          ▾
        </button>
      </div>

<<<<<<< HEAD
      <p className="text-xs text-slate-400 mt-2">{helper}</p>

      {/* Dropdown */}
      {open ? (
        <div
          className="absolute z-50 mt-2 w-full max-h-72 overflow-auto rounded-2xl
                     border border-ink-line bg-slate-950/95 shadow-2xl"
        >
          {loading ? (
            <div className="p-3 text-sm text-slate-300">Loading stations…</div>
          ) : showEmpty ? (
            <div className="p-3 text-sm text-slate-300">No matching stations.</div>
          ) : (
            <ul className="py-1">
              {filtered.slice(0, 200).map((opt) => (
=======
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
>>>>>>> 3b2721e5055772c6e4d92bd61fd7854c779af0b4
                <li
                  key={opt.id}
                  onMouseDown={() => {
                    setValue(opt.label);
                    setOpen(false);
                  }}
<<<<<<< HEAD
                  className="px-4 py-2 cursor-pointer text-sm text-slate-200 hover:bg-slate-800/70"
                >
                  <div className="font-semibold">{opt.name}</div>
                  <div className="text-xs text-slate-400">ID: {opt.id}</div>
=======
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
>>>>>>> 3b2721e5055772c6e4d92bd61fd7854c779af0b4
                </li>
              ))}
            </ul>
          )}
        </div>
<<<<<<< HEAD
      ) : null}
=======
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
>>>>>>> 3b2721e5055772c6e4d92bd61fd7854c779af0b4
    </div>
  );
}

export default function RoutePlanner() {
  const navigate = useNavigate();
<<<<<<< HEAD

  const [stations, setStations] = useState([]);
  const [loadingStations, setLoadingStations] = useState(true);

  const [fromText, setFromText] = useState("");
  const [toText, setToText] = useState("");

  const [selected, setSelected] = useState("Recommended");
  const [showDetails, setShowDetails] = useState(false);

  const [statusById, setStatusById] = useState({});
  const [loadingStatus, setLoadingStatus] = useState(false);

  // Load stations (AWS)
  useEffect(() => {
    let mounted = true;
    async function loadStations() {
=======
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
>>>>>>> 3b2721e5055772c6e4d92bd61fd7854c779af0b4
      try {
        setLoadingStations(true);
        const list = await getStations();
        if (!mounted) return;
<<<<<<< HEAD
        setStations(normalizeStations(list));
      } catch {
        if (!mounted) return;
        setStations([]);
      } finally {
        if (mounted) setLoadingStations(false);
      }
    }
    loadStations();
    return () => {
      mounted = false;
    };
  }, []);

  // Close on ESC + prevent background scroll
  useEffect(() => {
    if (!showDetails) return;
    const onKeyDown = (e) => {
      if (e.key === "Escape") setShowDetails(false);
    };
    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [showDetails]);

  const stationOptions = useMemo(() => {
    return stations
      .filter((s) => s.name && s.id)
      .map((s) => ({ id: s.id, label: `${s.name} (ID: ${s.id})`, name: s.name }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [stations]);

  const fromId = extractStationId(fromText);
  const toId = extractStationId(toText);

  const fromName = stripIdLabel(fromText);
  const toName = stripIdLabel(toText);

  const fromStation = useMemo(() => (fromId ? stations.find((s) => s.id === fromId) : null), [fromId, stations]);
  const toStation = useMemo(() => (toId ? stations.find((s) => s.id === toId) : null), [toId, stations]);

  const fromLines = fromStation?.lines || [];
  const toLines = toStation?.lines || [];

  const directLines = useMemo(() => {
    const set = new Set(fromLines.map((x) => String(x)));
    return toLines.map((x) => String(x)).filter((x) => set.has(x));
=======
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
>>>>>>> 3b2721e5055772c6e4d92bd61fd7854c779af0b4
  }, [fromLines, toLines]);

  const canShow = fromText.trim().length > 0 && toText.trim().length > 0;

<<<<<<< HEAD
  // Route cards
  const routes = useMemo(() => {
    if (!canShow) return [];
    const direct = directLines.length > 0;

    return [
      {
        title: "Recommended",
        badge: direct ? "Direct trains available" : "Transfer required",
        trains: direct ? directLines : [],
        note: direct
          ? "These trains stop at both stations (based on AWS station lines)."
          : "No single train line is shared by both stations. You’ll likely need a transfer.",
      },
      {
        title: "Show From/To Lines",
        badge: "Station routes",
        trains: [],
        note: "Shows all train lines for your selected From and To stations (from AWS).",
      },
    ];
  }, [canShow, directLines]);

  // Load elevator/escalator status for From/To when modal opens
  useEffect(() => {
    let mounted = true;

    async function loadStatuses() {
      if (!showDetails) return;
      const ids = [fromId, toId].filter(Boolean);
      if (ids.length === 0) return;

      try {
        setLoadingStatus(true);
        const updates = {};

        await Promise.all(
          ids.map(async (id) => {
            try {
              const st = await getStationStatus(id);
              updates[id] = {
                elevator_status: st?.elevator_status ?? "Unknown",
                escalator_status: st?.escalator_status ?? "Unknown",
                last_updated: st?.last_updated ?? new Date().toISOString(),
              };
            } catch {
              updates[id] = {
                elevator_status: "Unknown",
                escalator_status: "Unknown",
                last_updated: new Date().toISOString(),
              };
            }
          })
        );

        if (!mounted) return;
        setStatusById((prev) => ({ ...prev, ...updates }));
      } finally {
        if (mounted) setLoadingStatus(false);
      }
    }

    loadStatuses();
    return () => {
      mounted = false;
    };
  }, [showDetails, fromId, toId]);

  const fromStatus = fromId ? statusById[fromId] : null;
  const toStatus = toId ? statusById[toId] : null;

  // Timeline
=======
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

>>>>>>> 3b2721e5055772c6e4d92bd61fd7854c779af0b4
  const timeline = useMemo(() => {
    if (!canShow) return [];
    const direct = directLines.length > 0;
    return [
<<<<<<< HEAD
      {
        title: fromName || fromText,
        badges: ["Start"],
        note: direct ? "Take a direct line if available." : "Start at your From station.",
      },
      {
        title: direct ? "Ride (Direct)" : "Transfer (if needed)",
        badges: [direct ? "Ride" : "Transfer"],
        note: direct
          ? `Take: ${directLines.join(", ")}`
          : "Pick a line from From station and transfer to a line that reaches your To station.",
      },
      { title: toName || toText, badges: ["Arrive"], note: "Arrive at destination station." },
=======
      { title: fromName || fromText, badges: ["Depart"], note: direct ? "Board a direct train." : "Start at this station." },
      { title: direct ? "Direct train" : "Transfer required", badges: [direct ? "Ride" : "Change"], note: direct ? `Take: ${directLines.join(", ")}` : "Board the best line and transfer mid-route." },
      { title: toName || toText, badges: ["Arrive"], note: "Your destination." },
>>>>>>> 3b2721e5055772c6e4d92bd61fd7854c779af0b4
    ];
  }, [canShow, fromName, toName, fromText, toText, directLines]);

  return (
<<<<<<< HEAD
    <div className="min-h-screen bg-ink">
      <header className="bg-ink border-b border-ink-line">
        <div className="max-w-5xl mx-auto px-4 py-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-white">Smart Route Planner</h1>
              <p className="text-slate-300 mt-1">
                Uses AWS station lines to show correct train routes for selected stations.
              </p>
            </div>

            <button
              onClick={() => navigate("/")}
              className="shrink-0 px-4 py-2 rounded-xl bg-white/5 text-slate-200 border border-white/10
                         hover:bg-signal/15 hover:text-signal hover:border-signal/30 text-sm font-semibold transition
                         focus:outline-none focus:ring-2 focus:ring-signal"
            >
              Back to Home
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8 space-y-6">
        {/* Inputs */}
        <section className="bg-ink-panel rounded-2xl border border-ink-line p-6">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-lg font-semibold text-white">Trip details</h2>
            <span className="text-xs text-slate-400">
              {loadingStations ? "Loading stations…" : `${stationOptions.length} stations loaded`}
            </span>
          </div>

          <div className="grid sm:grid-cols-2 gap-4 mt-4">
            <StationCombo
              label="From"
              helper="Pick from dropdown to get correct station lines."
              value={fromText}
              setValue={setFromText}
              options={stationOptions}
              loading={loadingStations}
              placeholder="Choose a station from dropdown…"
            />

            <StationCombo
              label="To"
              helper="Then open route details for elevator/escalator availability."
              value={toText}
              setValue={setToText}
              options={stationOptions}
              loading={loadingStations}
              placeholder="Choose a station from dropdown…"
=======
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
>>>>>>> 3b2721e5055772c6e4d92bd61fd7854c779af0b4
            />
          </div>
        </section>

        {!canShow ? (
<<<<<<< HEAD
          <section className="bg-ink-panel rounded-2xl border border-ink-line p-6">
            <p className="text-white font-semibold">Select From and To stations to see routes.</p>
            <p className="text-slate-300 mt-1">
              This planner shows correct train lines for the chosen stations (from AWS).
            </p>
          </section>
        ) : (
          <section className="grid lg:grid-cols-2 gap-5">
            {/* Route cards */}
            <div className="space-y-4">
              <div className="flex items-end justify-between">
                <h2 className="text-lg font-semibold text-white">Route summary</h2>
                <span className="text-sm text-slate-400">AWS-based</span>
              </div>

              <div className="grid gap-4">
                {routes.map((r) => {
                  const isActive = r.title === selected;
                  return (
                    <button
                      key={r.title}
                      type="button"
                      onClick={() => setSelected(r.title)}
                      className={`text-left bg-ink-panel border rounded-2xl p-5 transition
                        ${isActive ? "border-signal ring-2 ring-signal/30" : "border-ink-line hover:border-slate-500"}`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h3 className="text-base font-bold text-white">{r.title}</h3>
                          <div className="mt-2 flex flex-wrap gap-2">
                            <Tag>{r.badge}</Tag>
                          </div>
                          <p className="text-sm text-slate-300 mt-3">{r.note}</p>
                        </div>
                      </div>

                      {r.trains?.length ? (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {r.trains.map((t) => (
                            <LineBullet key={t} line={t} size="sm" />
                          ))}
                        </div>
                      ) : null}
                    </button>
                  );
                })}
              </div>

              {/* Always show From/To lines */}
              <div className="bg-ink-panel border border-ink-line rounded-2xl p-5">
                <h3 className="text-base font-bold text-white">Station lines</h3>

                <div className="mt-3">
                  <div className="text-sm font-semibold text-slate-200">From: {fromName || fromText}</div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {fromLines.length ? (
                      fromLines.map((ln, i) => <LineBullet key={`${ln}-${i}`} line={ln} size="sm" />)
                    ) : (
                      <span className="text-sm text-slate-400">No lines found.</span>
                    )}
                  </div>
                </div>

                <div className="mt-4">
                  <div className="text-sm font-semibold text-slate-200">To: {toName || toText}</div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {toLines.length ? (
                      toLines.map((ln, i) => <LineBullet key={`${ln}-${i}`} line={ln} size="sm" />)
                    ) : (
                      <span className="text-sm text-slate-400">No lines found.</span>
                    )}
                  </div>
=======
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
>>>>>>> 3b2721e5055772c6e4d92bd61fd7854c779af0b4
                </div>
              </div>
            </div>

<<<<<<< HEAD
            {/* Timeline + details */}
            <div className="bg-ink-panel rounded-2xl border border-ink-line p-6">
              <h2 className="text-lg font-semibold text-white">Trip guidance</h2>
              <p className="text-sm text-slate-300 mt-1">
                If there are shared lines, take those trains. If not, you’ll need a transfer.
              </p>

              <TimelineInline stops={timeline} />
=======
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
>>>>>>> 3b2721e5055772c6e4d92bd61fd7854c779af0b4

              <button
                type="button"
                onClick={() => setShowDetails(true)}
<<<<<<< HEAD
                className="mt-5 w-full px-4 py-3 rounded-xl bg-signal text-ink font-semibold hover:bg-signal/90 transition"
              >
                Open route details
=======
                className="btn btn-primary"
                style={{ marginTop: 20, width: "100%" }}
              >
                Open route details →
>>>>>>> 3b2721e5055772c6e4d92bd61fd7854c779af0b4
              </button>
            </div>
          </section>
        )}
      </main>

<<<<<<< HEAD
      {/* Modal */}
      {showDetails && canShow ? (
        <div
          className="fixed inset-0 z-50 bg-black/60 px-4 py-6"
          role="dialog"
          aria-modal="true"
          onClick={() => setShowDetails(false)}
        >
          <div
            className="mx-auto w-full max-w-2xl rounded-2xl bg-ink border border-ink-line shadow-2xl overflow-hidden
                       max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 z-10 flex items-start justify-between gap-4 p-5 border-b border-ink-line bg-ink">
              <div>
                <h3 className="text-lg font-bold text-white">Route Details</h3>
                <p className="text-sm text-slate-300 mt-1">
                  Station lines + elevator/escalator availability (From/To).
                </p>
              </div>

              <button
                onClick={() => setShowDetails(false)}
                className="shrink-0 inline-flex items-center justify-center h-10 w-10 rounded-xl
                           bg-slate-800 text-slate-200 border border-ink-line
                           hover:bg-signal/15 hover:text-signal font-bold transition"
                aria-label="Close"
                title="Close"
              >
                ✕
              </button>
            </div>

            <div className="p-5 space-y-5 overflow-y-auto">
              {/* Recommended trains */}
              <div className="rounded-2xl bg-ink-panel border border-ink-line p-4">
                <div className="text-sm font-semibold text-white">Direct trains (shared lines)</div>
                {directLines.length ? (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {directLines.map((t) => (
                      <LineBullet key={t} line={t} size="sm" />
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-slate-300 mt-2">
                    No direct shared train line between these stations. Transfer required.
                  </p>
                )}
                <p className="text-xs text-slate-400 mt-2">
                  Based on AWS station “lines” metadata (not schedule routing).
                </p>
              </div>

              {/* Elevator / Escalator */}
              <div className="rounded-2xl bg-ink-panel border border-ink-line p-4">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-semibold text-white">Elevator / Escalator availability</div>
                  <div className="text-xs text-slate-400">{loadingStatus ? "Checking…" : "Live (From/To)"}</div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4 mt-4">
                  <div className="rounded-2xl bg-ink/40 border border-ink-line p-4">
                    <div className="text-sm font-semibold text-white">From: {fromName || fromText}</div>
                    <div className="mt-3 space-y-2">
                      <StatusRow
                        label="Elevator"
                        value={fromStatus?.elevator_status || (fromId ? "Loading…" : "Pick from dropdown")}
                      />
                      <StatusRow
                        label="Escalator"
                        value={fromStatus?.escalator_status || (fromId ? "Loading…" : "Pick from dropdown")}
                      />
                    </div>
                  </div>

                  <div className="rounded-2xl bg-ink/40 border border-ink-line p-4">
                    <div className="text-sm font-semibold text-white">To: {toName || toText}</div>
                    <div className="mt-3 space-y-2">
                      <StatusRow
                        label="Elevator"
                        value={toStatus?.elevator_status || (toId ? "Loading…" : "Pick from dropdown")}
                      />
                      <StatusRow
                        label="Escalator"
                        value={toStatus?.escalator_status || (toId ? "Loading…" : "Pick from dropdown")}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setShowDetails(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-200 border border-ink-line
                             hover:bg-signal/15 hover:text-signal font-semibold transition"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      <footer className="border-t border-ink-line bg-ink">
        <div className="max-w-5xl mx-auto px-4 py-6 text-sm text-slate-400">
          Route Planner — correct station lines shown using AWS station metadata.
=======
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
>>>>>>> 3b2721e5055772c6e4d92bd61fd7854c779af0b4
        </div>
      </footer>
    </div>
  );
<<<<<<< HEAD
}
=======
}
>>>>>>> 3b2721e5055772c6e4d92bd61fd7854c779af0b4
