import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

function KPICard({ label, value, note }) {
  return (
    <div className="bg-slate-800/60 rounded-2xl border border-slate-700 p-5">
      <div className="text-sm text-slate-300">{label}</div>
      <div className="text-2xl font-bold text-white mt-2">{value}</div>
      {note ? <div className="text-xs text-slate-400 mt-2">{note}</div> : null}
    </div>
  );
}

function RiskBadge({ level }) {
  const l = (level || "").toLowerCase();
  const cls =
    l === "high"
      ? "bg-rose-100 text-rose-900 ring-rose-200"
      : l === "medium"
      ? "bg-amber-100 text-amber-900 ring-amber-200"
      : "bg-emerald-100 text-emerald-900 ring-emerald-200";

  return <span className={`text-xs font-semibold px-2 py-1 rounded-full ring-1 ${cls}`}>{level}</span>;
}

export default function DelayInsights() {
  const navigate = useNavigate();
  const [timeWindow, setTimeWindow] = useState("peak");

  const kpis = useMemo(() => {
    if (timeWindow === "peak") {
      return [
        { label: "Active incidents (demo)", value: "14", note: "Peak hours have higher disruption risk." },
        { label: "Stations with outages (demo)", value: "9", note: "Elevator/escalator outages impact accessibility." },
        { label: "Avg delay risk (demo)", value: "Medium", note: "Computed from demo scoring model." },
        { label: "Most affected zone (demo)", value: "Midtown", note: "High ridership + complex transfers." },
      ];
    }
    if (timeWindow === "offpeak") {
      return [
        { label: "Active incidents (demo)", value: "6", note: "Off-peak typically improves stability." },
        { label: "Stations with outages (demo)", value: "5", note: "Outages still matter for step-free routes." },
        { label: "Avg delay risk (demo)", value: "Low", note: "Lower crowding reduces propagation." },
        { label: "Most affected zone (demo)", value: "Downtown hubs", note: "Transfers can still create delays." },
      ];
    }
    return [
      { label: "Active incidents (demo)", value: "4", note: "Late night: planned work can appear." },
      { label: "Stations with outages (demo)", value: "3", note: "Some stations close entrances late night." },
      { label: "Avg delay risk (demo)", value: "Low–Medium", note: "Depends on maintenance windows." },
      { label: "Most affected zone (demo)", value: "Track work segments", note: "Scheduled maintenance is common." },
    ];
  }, [timeWindow]);

  const top10 = useMemo(() => {
    // Demo top 10 list (later: compute from outage history / alerts)
    const list = [
      { station: "Times Sq - 42 St", level: "High", reason: "Crowding + multi-line transfers" },
      { station: "Grand Central - 42 St", level: "High", reason: "Heavy commuter volume" },
      { station: "Union Sq - 14 St", level: "Medium", reason: "Transfer congestion" },
      { station: "34 St - Penn Station", level: "Medium", reason: "Peak surges + platform constraints" },
      { station: "Fulton St", level: "Medium", reason: "Complex transfers" },
      { station: "Herald Sq", level: "Medium", reason: "Crowding + escalator outages (demo)" },
      { station: "Atlantic Av - Barclays Ctr", level: "Low", reason: "Mostly stable outside peak" },
      { station: "Jackson Hts - Roosevelt Av", level: "Low", reason: "Occasional delays from track work" },
      { station: "Flushing - Main St", level: "Low", reason: "Crowding varies by time" },
      { station: "59 St - Columbus Circle", level: "Low", reason: "Generally stable routes" },
    ];

    // small demo tweak by time window
    if (timeWindow === "offpeak") {
      return list.map((x) => (x.level === "High" ? { ...x, level: "Medium" } : x));
    }
    if (timeWindow === "late") {
      return list.map((x) => (x.level === "Medium" ? { ...x, level: "Low" } : x));
    }
    return list;
  }, [timeWindow]);

  return (
    <div className="min-h-screen bg-slate-900">
      <header className="bg-slate-900 border-b border-slate-800">
        <div className="max-w-5xl mx-auto px-4 py-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-white">Delay Insights</h1>
              <p className="text-slate-300 mt-1">
                Dashboard-style view of delay risk hotspots (demo UI).
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

          <div className="mt-5">
            <label className="block text-sm font-medium text-slate-200 mb-2">Time window</label>
            <select
              value={timeWindow}
              onChange={(e) => setTimeWindow(e.target.value)}
              className="w-full sm:w-72 rounded-xl border border-slate-700 bg-slate-900/40 px-4 py-3 text-white
                         focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-sky-400"
            >
              <option value="peak">Peak hours</option>
              <option value="offpeak">Off-peak</option>
              <option value="late">Late night</option>
            </select>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8 space-y-6">
        {/* KPI row */}
        <section className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {kpis.map((k) => (
            <KPICard key={k.label} label={k.label} value={k.value} note={k.note} />
          ))}
        </section>

        {/* Top 10 risk list */}
        <section className="bg-slate-800/60 rounded-2xl border border-slate-700 p-6">
          <div className="flex items-end justify-between">
            <div>
              <h2 className="text-lg font-semibold text-white">Top 10 risk stations</h2>
              <p className="text-sm text-slate-300 mt-1">
                Ranked using demo scoring (later: AWS outage history + alerts).
              </p>
            </div>
            <span className="text-sm text-slate-400">Mode: Demo</span>
          </div>

          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-sm text-slate-300">
                  <th className="py-2 pr-3">Rank</th>
                  <th className="py-2 pr-3">Station</th>
                  <th className="py-2 pr-3">Risk</th>
                  <th className="py-2">Reason</th>
                </tr>
              </thead>
              <tbody>
                {top10.map((s, idx) => (
                  <tr key={`${s.station}-${idx}`} className="border-t border-slate-700/60">
                    <td className="py-3 pr-3 text-slate-200 font-semibold">#{idx + 1}</td>
                    <td className="py-3 pr-3 text-white">{s.station}</td>
                    <td className="py-3 pr-3">
                      <RiskBadge level={s.level} />
                    </td>
                    <td className="py-3 text-slate-200">{s.reason}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4 text-xs text-slate-400">
            Next step: connect this table to real station IDs and compute risk from outage frequency and time-of-day.
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-800 bg-slate-900">
        <div className="max-w-5xl mx-auto px-4 py-6 text-sm text-slate-400">
          Delay Insights — UI upgrade: KPI cards + Top 10 risk list.
        </div>
      </footer>
    </div>
  );
}