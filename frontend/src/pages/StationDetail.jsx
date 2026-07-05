import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getStations, getStationStatus } from "../services/api";
import { useFavorites } from "../hooks/useFavorites";
import { normalizeStations, normalizeStatus } from "../lib/stations";
import { StatusRow } from "../components/StatusBadge";
import { LinePills } from "../components/LinePills";
import { IconArrowLeft, IconStar, IconAlert } from "../components/icons";

export default function StationDetail() {
  const { stationId } = useParams();
  const navigate = useNavigate();
  const { favorites, toggleFavorite } = useFavorites();

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

        const [stationList, statusRes] = await Promise.all([
          getStations(),
          getStationStatus(stationId),
        ]);

        if (!mounted) return;

        const match = normalizeStations(stationList).find(
          (s) => s.id === stationId
        );

        if (!match) {
          setError(`No station found with ID "${stationId}".`);
        } else {
          setStation(match);
        }

        setStatus(normalizeStatus(statusRes));
      } catch (e) {
        if (!mounted) return;
        setError(e?.message || "Failed to load station.");
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();

    return () => {
      mounted = false;
    };
  }, [stationId]);

  const isFav = favorites.includes(stationId);

  return (
    <div className="min-h-screen bg-ink font-sans">
      <header className="bg-ink border-b border-ink-line">
        <div className="max-w-3xl mx-auto px-4 py-6 flex items-start justify-between gap-4">
          <div className="min-w-0">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-1.5 text-sm font-semibold text-signal hover:text-signal/80 mb-2"
            >
              <IconArrowLeft className="h-4 w-4" />
              Back
            </button>

            <h1 className="text-2xl font-extrabold text-white tracking-tight truncate">
              {loading ? "Loading station…" : station?.name || "Station"}
            </h1>

            <p className="text-slate-500 mt-1 text-xs font-mono">
              Station ID {stationId}
            </p>
          </div>

          {!loading && station && (
            <button
              onClick={() => toggleFavorite(stationId)}
              className={`shrink-0 p-2.5 rounded-lg border transition ${
                isFav
                  ? "text-signal border-signal/30 bg-signal/10"
                  : "text-slate-500 border-ink-line hover:text-slate-300"
              }`}
              title={
                isFav ? "Remove from favorites" : "Add to favorites"
              }
            >
              <IconStar filled={isFav} className="h-5 w-5" />
            </button>
          )}
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8">
        {loading ? (
          <div className="bg-ink-panel rounded-2xl border border-ink-line p-6">
            <p className="text-slate-300">Loading station details…</p>
          </div>
        ) : error ? (
          <div className="bg-ink-panel rounded-2xl border border-ink-line p-6">
            <p className="text-white font-semibold">
              Couldn't load this station.
            </p>
            <p className="text-slate-400 mt-1 text-sm">{error}</p>
          </div>
        ) : (
          <div className="space-y-4">

            {station.lines.length > 0 && (
              <div className="bg-ink-panel rounded-2xl border border-ink-line p-5">
                <h2 className="text-xs uppercase tracking-wide text-slate-400 font-semibold mb-3">
                  Lines Served
                </h2>
                <LinePills lines={station.lines} />
              </div>
            )}

            <div className="bg-ink-panel rounded-2xl border border-ink-line p-5 space-y-2">
              <h2 className="text-xs uppercase tracking-wide text-slate-400 font-semibold mb-2">
                Accessibility Status
              </h2>

              <StatusRow
                label="Elevator"
                value={status?.elevator_status}
              />

              <StatusRow
                label="Escalator"
                value={status?.escalator_status}
              />

              <p className="text-xs text-slate-500 pt-2 font-mono">
                Updated{" "}
                {status?.last_updated
                  ? new Date(status.last_updated).toLocaleString()
                  : "--"}
              </p>
            </div>

            {/* ---------------- SERVICE ALERTS ---------------- */}

            <div className="bg-ink-panel rounded-2xl border border-ink-line p-5">
              <h2 className="text-xs uppercase tracking-wide text-slate-400 font-semibold mb-4">
                Service Alerts
              </h2>

              {status?.alerts?.length ? (
                <div className="space-y-4">
                  {status.alerts.map((alert, idx) => (
                    <div
                      key={idx}
                      className="rounded-xl border border-yellow-500/30 bg-yellow-500/5 p-4"
                    >
                      <div className="flex gap-3">
                        <IconAlert className="h-5 w-5 text-yellow-400 mt-1 shrink-0" />

                        <div className="flex-1">
                          <h3 className="text-white font-semibold">
                            {alert.equipment_type === "EL"
                              ? "Elevator"
                              : "Escalator"}{" "}
                            {alert.equipment_id}
                          </h3>

                          <p className="text-slate-300 mt-2">
                            <span className="font-semibold">Reason:</span>{" "}
                            {alert.reason}
                          </p>

                          <p className="text-slate-400 text-sm mt-1">
                            <span className="font-semibold">
                              Out of Service:
                            </span>{" "}
                            {new Date(
                              alert.outagedate
                            ).toLocaleString()}
                          </p>

                          <p className="text-slate-400 text-sm mt-1">
                            <span className="font-semibold">
                              Expected Return:
                            </span>{" "}
                            {new Date(
                              alert.estimatedreturntoservice
                            ).toLocaleString()}
                          </p>

                          <div className="mt-3 flex gap-2">
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                alert.is_active
                                  ? "bg-red-500/20 text-red-300"
                                  : "bg-blue-500/20 text-blue-300"
                              }`}
                            >
                              {alert.is_active
                                ? "Active"
                                : "Upcoming"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-500 text-sm">
                  No active service alerts for this station.
                </p>
              )}
            </div>

          </div>
        )}
      </main>
    </div>
  );
}