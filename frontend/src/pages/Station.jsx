import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getStations, getStationStatus } from "../services/api";

function Badge({ value }) {
  const normalized = (value || "").toLowerCase();
  const tone =
    normalized.includes("operational")
      ? "bg-emerald-100 text-emerald-900 ring-emerald-200"
      : normalized.includes("out")
      ? "bg-rose-100 text-rose-900 ring-rose-200"
      : "bg-sky-100 text-sky-900 ring-sky-200";

  return (
    <span className={`inline-flex text-xs font-semibold px-3 py-1 rounded-full ring-1 ${tone}`}>
      {value}
    </span>
  );
}

function normalizeStation(raw) {
  const id = raw?.station_id ?? raw?.id ?? raw?.stationId ?? "";
  const name = raw?.station_name ?? raw?.name ?? raw?.stationName ?? "Station";
  const lines = Array.isArray(raw?.lines) ? raw.lines : [];
  return { id: String(id), name: String(name), lines };
}

function formatAlert(a) {
  const id = a?.equipment_id || "—";
  const type = a?.equipment_type === "EL" ? "Elevator" : a?.equipment_type === "ES" ? "Escalator" : (a?.equipment_type || "Equipment");
  const reason = a?.reason || "No reason provided";
  const outage = a?.outagedate || "—";
  const rts = a?.estimatedreturntoservice || "—";
  const upcoming = a?.is_upcoming ? "Upcoming" : "Current";
  const active = a?.is_active ? "Active" : "Not active";

  return { id, type, reason, outage, rts, upcoming, active };
}

export default function Station() {
  const { stationId } = useParams();

  const [station, setStation] = useState(null);
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        setError("");
        setLoading(true);

        const list = await getStations();
        const normalized = (Array.isArray(list) ? list : []).map(normalizeStation);

        const found =
          normalized.find((s) => s.id === stationId) ||
          { id: stationId, name: "Station", lines: [] };

        const st = await getStationStatus(stationId);

        if (!mounted) return;
        setStation(found);
        setStatus(st);
      } catch (e) {
        if (!mounted) return;
        setError(e?.message || "Failed to load station details.");
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();
    return () => {
      mounted = false;
    };
  }, [stationId]);

  const alerts = useMemo(() => {
    const arr = Array.isArray(status?.alerts) ? status.alerts : [];
    // stable key: equipment_id + index fallback
    return arr.map((a, idx) => ({ a, idx, view: formatAlert(a) }));
  }, [status]);

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header */}
      <header className="bg-slate-900 border-b border-slate-800">
        <div className="max-w-5xl mx-auto px-4 py-6">
          <Link to="/" className="text-sm font-semibold text-sky-200 hover:text-white hover:underline">
            ← Back
          </Link>

          <h1 className="text-2xl font-bold text-white mt-2">
            {station?.name || "Station"} <span className="text-slate-300">({stationId})</span>
          </h1>

          <p className="text-slate-300 mt-1">
            Detailed accessibility + service status for this station.
          </p>

          {station?.lines?.length ? (
            <div className="flex flex-wrap gap-2 mt-3">
              {station.lines.slice(0, 12).map((ln, idx) => (
                <span
                  key={`${ln}-${idx}`}
                  className="text-xs font-semibold px-2 py-1 rounded-full bg-sky-500/20 text-sky-200 border border-sky-400/30"
                >
                  {ln}
                </span>
              ))}
            </div>
          ) : null}
        </div>
      </header>

      {/* Content */}
      <main className="max-w-5xl mx-auto px-4 py-8">
        {loading ? (
          <div className="bg-slate-800/60 rounded-2xl border border-slate-700 p-6 text-slate-200">
            Loading station status…
          </div>
        ) : error ? (
          <div className="bg-slate-800/60 rounded-2xl border border-slate-700 p-6">
            <p className="text-white font-semibold">Couldn’t load station.</p>
            <p className="text-slate-300 mt-1">{error}</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-sky-50/95 rounded-2xl border border-sky-200 p-5 shadow-md">
              <h2 className="font-semibold text-slate-900">Elevator</h2>
              <div className="mt-3">
                <Badge value={status?.elevator_status || "Unknown"} />
              </div>
            </div>

            <div className="bg-sky-50/95 rounded-2xl border border-sky-200 p-5 shadow-md">
              <h2 className="font-semibold text-slate-900">Escalator</h2>
              <div className="mt-3">
                <Badge value={status?.escalator_status || "Unknown"} />
              </div>
            </div>

            <div className="bg-sky-50/95 rounded-2xl border border-sky-200 p-5 shadow-md">
              <h2 className="font-semibold text-slate-900">Last Updated</h2>
              <p className="mt-3 text-sm text-slate-700">
                {status?.last_updated ? new Date(status.last_updated).toLocaleString() : "N/A"}
              </p>
            </div>

            <div className="md:col-span-3 bg-sky-50/95 rounded-2xl border border-sky-200 p-5 shadow-md">
              <h2 className="font-semibold text-slate-900">Alerts</h2>

              {alerts.length ? (
                <ul className="mt-3 space-y-3">
                  {alerts.map(({ a, idx, view }) => (
                    <li
                      key={`${a?.equipment_id || "alert"}-${idx}`}
                      className="text-sm bg-white/80 border border-slate-200 rounded-xl p-4"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="font-semibold text-slate-900">
                            {view.type} • {view.id}
                          </div>
                          <div className="text-slate-700 mt-1">{view.reason}</div>
                        </div>

                        <div className="flex flex-col items-end gap-2">
                          <span className="text-xs font-semibold px-2 py-1 rounded-full bg-slate-100 text-slate-700 ring-1 ring-slate-200">
                            {view.upcoming}
                          </span>
                          <span className="text-xs font-semibold px-2 py-1 rounded-full bg-slate-100 text-slate-700 ring-1 ring-slate-200">
                            {view.active}
                          </span>
                        </div>
                      </div>

                      <div className="mt-3 grid sm:grid-cols-2 gap-2 text-xs text-slate-600">
                        <div className="bg-slate-50 border border-slate-200 rounded-lg p-2">
                          <span className="font-semibold text-slate-700">Outage:</span> {view.outage}
                        </div>
                        <div className="bg-slate-50 border border-slate-200 rounded-lg p-2">
                          <span className="font-semibold text-slate-700">Return:</span> {view.rts}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-3 text-sm text-slate-700">No active alerts.</p>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
