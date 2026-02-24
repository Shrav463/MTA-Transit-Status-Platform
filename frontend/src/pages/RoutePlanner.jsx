import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getStations, getStationStatus } from "../services/api";

function normalizeStation(raw) {
  const id = raw?.station_id ?? raw?.id ?? raw?.stationId ?? "";
  const name = raw?.station_name ?? raw?.name ?? raw?.stationName ?? "";
  const lines = Array.isArray(raw?.lines) ? raw.lines : [];
  return { id: String(id), name: String(name), lines };
}

// Extract stationId from "Station Name (ID: 123)" entered via picker
function extractStationId(text) {
  const m = String(text || "").match(/\(ID:\s*([^)]+)\)/i);
  return m?.[1] ? String(m[1]).trim() : null;
}
function stripIdLabel(text) {
  return String(text || "").replace(/\s*\(ID:\s*[^)]+\)\s*/i, "").trim();
}

function StatusBadge({ label, value }) {
  const normalized = (value || "").toLowerCase();
  const tone =
    normalized.includes("operational")
      ? "bg-emerald-100 text-emerald-900 ring-emerald-200"
      : normalized.includes("out")
      ? "bg-rose-100 text-rose-900 ring-rose-200"
      : "bg-sky-100 text-sky-900 ring-sky-200";

  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-sm text-slate-200">{label}</span>
      <span className={`text-xs font-semibold px-2 py-1 rounded-full ring-1 ${tone}`}>
        {value || "Unknown"}
      </span>
    </div>
  );
}

function Pill({ children }) {
  return (
    <span className="text-xs font-semibold px-2 py-1 rounded-full bg-sky-500/20 text-sky-200 border border-sky-400/30">
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
              <div className="h-3 w-3 rounded-full bg-slate-900" />
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
    </div>
  );
}

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
  const wrapRef = useRef(null);
  const [open, setOpen] = useState(false);

  const filtered = useMemo(() => {
    const q = (value || "").trim().toLowerCase();
    if (!q) return options;
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
          className="w-full rounded-xl border border-slate-700 bg-slate-900/40 px-4 py-3 text-white placeholder-slate-400
                     focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-sky-400 pr-20"
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
                       bg-slate-800 text-slate-200 border border-slate-700
                       hover:bg-slate-700 hover:text-white transition"
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
                     bg-slate-800 text-slate-200 border border-slate-700
                     hover:bg-slate-700 hover:text-white transition"
          aria-label={`Toggle ${label} dropdown`}
          title="Toggle"
        >
          ▾
        </button>
      </div>

      <p className="text-xs text-slate-400 mt-2">{helper}</p>

      {/* Dropdown */}
      {open ? (
        <div
          className="absolute z-50 mt-2 w-full max-h-72 overflow-auto rounded-2xl
                     border border-slate-700 bg-slate-950/95 shadow-2xl"
        >
          {loading ? (
            <div className="p-3 text-sm text-slate-300">Loading stations…</div>
          ) : showEmpty ? (
            <div className="p-3 text-sm text-slate-300">No matching stations.</div>
          ) : (
            <ul className="py-1">
              {filtered.slice(0, 200).map((opt) => (
                <li
                  key={opt.id}
                  onMouseDown={() => {
                    setValue(opt.label);
                    setOpen(false);
                  }}
                  className="px-4 py-2 cursor-pointer text-sm text-slate-200 hover:bg-slate-800/70"
                >
                  <div className="font-semibold">{opt.name}</div>
                  <div className="text-xs text-slate-400">ID: {opt.id}</div>
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : null}
    </div>
  );
}

export default function RoutePlanner() {
  const navigate = useNavigate();

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
      try {
        setLoadingStations(true);
        const list = await getStations();
        if (!mounted) return;
        const normalized = (Array.isArray(list) ? list : []).map(normalizeStation);
        setStations(normalized);
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
  }, [fromLines, toLines]);

  const canShow = fromText.trim().length > 0 && toText.trim().length > 0;

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
  const timeline = useMemo(() => {
    if (!canShow) return [];
    const direct = directLines.length > 0;
    return [
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
    ];
  }, [canShow, fromName, toName, fromText, toText, directLines]);

  return (
    <div className="min-h-screen bg-slate-900">
      <header className="bg-slate-900 border-b border-slate-800">
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
              className="shrink-0 px-4 py-2 rounded-xl bg-sky-500/20 text-sky-200 border border-sky-400/30
                         hover:bg-sky-500/30 hover:text-white text-sm font-semibold transition
                         focus:outline-none focus:ring-2 focus:ring-sky-400"
            >
              Back to Home
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8 space-y-6">
        {/* Inputs */}
        <section className="bg-slate-800/60 rounded-2xl border border-slate-700 p-6">
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
            />
          </div>
        </section>

        {!canShow ? (
          <section className="bg-slate-800/60 rounded-2xl border border-slate-700 p-6">
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
                      className={`text-left bg-slate-800/60 border rounded-2xl p-5 transition
                        ${isActive ? "border-sky-400 ring-2 ring-sky-400/40" : "border-slate-700 hover:border-slate-500"}`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h3 className="text-base font-bold text-white">{r.title}</h3>
                          <div className="mt-2 flex flex-wrap gap-2">
                            <Pill>{r.badge}</Pill>
                          </div>
                          <p className="text-sm text-slate-300 mt-3">{r.note}</p>
                        </div>
                      </div>

                      {r.trains?.length ? (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {r.trains.map((t) => (
                            <Pill key={t}>{t}</Pill>
                          ))}
                        </div>
                      ) : null}
                    </button>
                  );
                })}
              </div>

              {/* Always show From/To lines */}
              <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-5">
                <h3 className="text-base font-bold text-white">Station lines</h3>

                <div className="mt-3">
                  <div className="text-sm font-semibold text-slate-200">From: {fromName || fromText}</div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {fromLines.length ? (
                      fromLines.map((ln, i) => <Pill key={`${ln}-${i}`}>{ln}</Pill>)
                    ) : (
                      <span className="text-sm text-slate-400">No lines found.</span>
                    )}
                  </div>
                </div>

                <div className="mt-4">
                  <div className="text-sm font-semibold text-slate-200">To: {toName || toText}</div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {toLines.length ? (
                      toLines.map((ln, i) => <Pill key={`${ln}-${i}`}>{ln}</Pill>)
                    ) : (
                      <span className="text-sm text-slate-400">No lines found.</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Timeline + details */}
            <div className="bg-slate-800/60 rounded-2xl border border-slate-700 p-6">
              <h2 className="text-lg font-semibold text-white">Trip guidance</h2>
              <p className="text-sm text-slate-300 mt-1">
                If there are shared lines, take those trains. If not, you’ll need a transfer.
              </p>

              <TimelineInline stops={timeline} />

              <button
                type="button"
                onClick={() => setShowDetails(true)}
                className="mt-5 w-full px-4 py-3 rounded-xl bg-sky-500 text-white font-semibold hover:bg-sky-400 transition"
              >
                Open route details
              </button>
            </div>
          </section>
        )}
      </main>

      {/* Modal */}
      {showDetails && canShow ? (
        <div
          className="fixed inset-0 z-50 bg-black/60 px-4 py-6"
          role="dialog"
          aria-modal="true"
          onClick={() => setShowDetails(false)}
        >
          <div
            className="mx-auto w-full max-w-2xl rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl overflow-hidden
                       max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 z-10 flex items-start justify-between gap-4 p-5 border-b border-slate-800 bg-slate-900">
              <div>
                <h3 className="text-lg font-bold text-white">Route Details</h3>
                <p className="text-sm text-slate-300 mt-1">
                  Station lines + elevator/escalator availability (From/To).
                </p>
              </div>

              <button
                onClick={() => setShowDetails(false)}
                className="shrink-0 inline-flex items-center justify-center h-10 w-10 rounded-xl
                           bg-slate-800 text-slate-200 border border-slate-700
                           hover:bg-slate-700 hover:text-white font-bold transition"
                aria-label="Close"
                title="Close"
              >
                ✕
              </button>
            </div>

            <div className="p-5 space-y-5 overflow-y-auto">
              {/* Recommended trains */}
              <div className="rounded-2xl bg-slate-800/60 border border-slate-700 p-4">
                <div className="text-sm font-semibold text-white">Direct trains (shared lines)</div>
                {directLines.length ? (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {directLines.map((t) => (
                      <Pill key={t}>{t}</Pill>
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
              <div className="rounded-2xl bg-slate-800/60 border border-slate-700 p-4">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-semibold text-white">Elevator / Escalator availability</div>
                  <div className="text-xs text-slate-400">{loadingStatus ? "Checking…" : "Live (From/To)"}</div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4 mt-4">
                  <div className="rounded-2xl bg-slate-900/40 border border-slate-700 p-4">
                    <div className="text-sm font-semibold text-white">From: {fromName || fromText}</div>
                    <div className="mt-3 space-y-2">
                      <StatusBadge
                        label="Elevator"
                        value={fromStatus?.elevator_status || (fromId ? "Loading…" : "Pick from dropdown")}
                      />
                      <StatusBadge
                        label="Escalator"
                        value={fromStatus?.escalator_status || (fromId ? "Loading…" : "Pick from dropdown")}
                      />
                    </div>
                  </div>

                  <div className="rounded-2xl bg-slate-900/40 border border-slate-700 p-4">
                    <div className="text-sm font-semibold text-white">To: {toName || toText}</div>
                    <div className="mt-3 space-y-2">
                      <StatusBadge
                        label="Elevator"
                        value={toStatus?.elevator_status || (toId ? "Loading…" : "Pick from dropdown")}
                      />
                      <StatusBadge
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
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-200 border border-slate-700
                             hover:bg-slate-700 hover:text-white font-semibold transition"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      <footer className="border-t border-slate-800 bg-slate-900">
        <div className="max-w-5xl mx-auto px-4 py-6 text-sm text-slate-400">
          Route Planner — correct station lines shown using AWS station metadata.
        </div>
      </footer>
    </div>
  );
}