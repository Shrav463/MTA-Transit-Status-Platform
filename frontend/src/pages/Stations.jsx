import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getStations, getStationStatus } from "../services/api";
import { useFavorites } from "../hooks/useFavorites";
import { normalizeStations } from "../lib/stations";
import { StatusRow } from "../components/StatusBadge";
import { LinePills } from "../components/LinePills";
import { IconArrowLeft, IconStar } from "../components/icons";

const PAGE_SIZE = 12;

export default function Stations() {
  const navigate = useNavigate();
  const { favorites, toggleFavorite } = useFavorites();

  const [stations, setStations] = useState([]);
  const [loadingStations, setLoadingStations] = useState(true);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [statusById, setStatusById] = useState({});
  const [loadingStatusById, setLoadingStatusById] = useState({});

  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        setLoadingStations(true);
        const list = await getStations();
        if (!mounted) return;
        setStations(normalizeStations(list));
      } catch {
        if (!mounted) return;
        setStations([]);
      } finally {
        if (mounted) setLoadingStations(false);
      }
    }

    load();
    return () => {
      mounted = false;
    };
  }, []);

  const visibleStations = useMemo(
    () => stations.slice(0, visibleCount),
    [stations, visibleCount]
  );

  // Track in-flight status requests so we don't re-fetch a station that's
  // already loading (e.g. re-renders while the user scrolls/paginates).
  const inFlightRef = useRef(new Set());

  useEffect(() => {
    if (!visibleStations.length) return;

    visibleStations.forEach(({ id }) => {
      if (!id || statusById[id] || inFlightRef.current.has(id)) return;

      inFlightRef.current.add(id);
      setLoadingStatusById((prev) => ({ ...prev, [id]: true }));

      getStationStatus(id)
        .then((res) => {
          setStatusById((prev) => ({
            ...prev,
            [id]: {
              elevator_status: res?.elevator_status ?? "Unknown",
              escalator_status: res?.escalator_status ?? "Unknown",
            },
          }));
        })
        .catch(() => {
          setStatusById((prev) => ({
            ...prev,
            [id]: { elevator_status: "Unknown", escalator_status: "Unknown" },
          }));
        })
        .finally(() => {
          inFlightRef.current.delete(id);
          setLoadingStatusById((prev) => ({ ...prev, [id]: false }));
        });
    });
  }, [visibleStations, statusById]);

  return (
    <div className="min-h-screen bg-ink font-sans">
      <header className="bg-ink border-b border-ink-line">
        <div className="max-w-6xl mx-auto px-4 py-6 flex items-start justify-between gap-4">
          <div>
            <button
              onClick={() => navigate("/")}
              className="flex items-center gap-1.5 text-sm font-semibold text-signal hover:text-signal/80 mb-2"
            >
              <IconArrowLeft className="h-4 w-4" />
              Back to home
            </button>
            <h1 className="text-2xl font-extrabold text-white tracking-tight">All Stations</h1>
            <p className="text-slate-400 mt-1 text-sm">
              Showing {Math.min(visibleCount, stations.length)} of {stations.length || 0}
            </p>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {loadingStations ? (
          <p className="text-slate-400">Loading stations…</p>
        ) : stations.length === 0 ? (
          <div className="bg-ink-panel rounded-2xl border border-ink-line p-6">
            <p className="text-white font-semibold">No stations found.</p>
          </div>
        ) : (
          <>
            <div className="grid md:grid-cols-2 gap-4">
              {visibleStations.map((station) => {
                const status = statusById[station.id];
                const isLoading = loadingStatusById[station.id];
                const isFav = favorites.includes(station.id);

                return (
                  <div key={station.id} className="bg-ink-panel border border-ink-line rounded-2xl p-5">
                    <div className="flex justify-between items-start gap-3">
                      <div className="min-w-0">
                        <h3 className="font-bold text-white truncate">{station.name}</h3>
                        <p className="text-xs text-slate-500 font-mono mt-0.5">ID {station.id}</p>
                      </div>
                      <button
                        onClick={() => toggleFavorite(station.id)}
                        aria-label={isFav ? "Remove from favorites" : "Add to favorites"}
                        className={`shrink-0 p-1.5 rounded-lg transition ${
                          isFav ? "text-signal" : "text-slate-600 hover:text-slate-300"
                        }`}
                      >
                        <IconStar filled={isFav} className="h-5 w-5" />
                      </button>
                    </div>

                    <div className="mt-3">
                      <LinePills lines={station.lines} size="sm" />
                    </div>

                    <div className="mt-4 pt-3 border-t border-ink-line space-y-1">
                      <StatusRow label="Elevator" value={isLoading ? "Loading…" : status?.elevator_status} />
                      <StatusRow label="Escalator" value={isLoading ? "Loading…" : status?.escalator_status} />
                    </div>

                    <button
                      onClick={() => navigate(`/station/${station.id}`)}
                      className="mt-4 w-full px-4 py-2 bg-white/5 border border-ink-line rounded-lg text-sm font-semibold text-slate-200
                                 hover:bg-signal/15 hover:text-signal hover:border-signal/30 transition"
                    >
                      View details
                    </button>
                  </div>
                );
              })}
            </div>

            <div className="flex flex-col items-center gap-3 mt-8">
              {stations.length > visibleCount && (
                <button
                  onClick={() => setVisibleCount((c) => Math.min(c + PAGE_SIZE, stations.length))}
                  className="px-6 py-2.5 rounded-full bg-signal text-ink font-semibold hover:bg-signal/90 transition"
                >
                  Show more
                </button>
              )}

              {visibleCount > PAGE_SIZE && (
                <button
                  onClick={() => setVisibleCount(PAGE_SIZE)}
                  className="px-6 py-2.5 rounded-full bg-transparent text-slate-300 border border-ink-line hover:border-slate-500 transition"
                >
                  Show less
                </button>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
