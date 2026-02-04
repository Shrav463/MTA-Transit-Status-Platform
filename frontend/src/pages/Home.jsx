import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getStations, getStationStatus } from "../services/api";
import { useFavorites } from "../hooks/useFavorites";

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
      <span className="text-sm text-slate-700">{label}</span>
      <span className={`text-xs font-semibold px-2 py-1 rounded-full ring-1 ${tone}`}>
        {value}
      </span>
    </div>
  );
}

function LinePills({ lines = [] }) {
  if (!lines?.length) return null;
  return (
    <div className="flex flex-wrap gap-2 mt-3">
      {lines.slice(0, 10).map((ln, idx) => (
        <span
          key={`${ln}-${idx}`}
          className="text-xs font-semibold px-2 py-1 rounded-full bg-sky-100 text-sky-900 ring-1 ring-sky-200"
          aria-label={`Line ${ln}`}
        >
          {ln}
        </span>
      ))}
    </div>
  );
}

function normalizeStation(raw) {
  const id = raw?.station_id ?? raw?.id ?? raw?.stationId ?? "";
  const name = raw?.station_name ?? raw?.name ?? raw?.stationName ?? "";
  const lines = Array.isArray(raw?.lines) ? raw.lines : [];
  return { id: String(id), name: String(name), lines };
}

export default function Home() {
  const navigate = useNavigate();
  const { favorites, toggleFavorite } = useFavorites();

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
        setError("");
        setLoading(true);

        const list = await getStations();
        if (!mounted) return;

        const normalized = (Array.isArray(list) ? list : []).map(normalizeStation);
        setStations(normalized);

        const top = normalized.slice(0, 8);
        const previews = {};

        await Promise.all(
          top.map(async (s) => {
            try {
              const st = await getStationStatus(s.id);
              previews[s.id] = {
                elevator_status: st.elevator_status ?? "Unknown",
                escalator_status: st.escalator_status ?? "Unknown",
                last_updated: st.last_updated ?? new Date().toISOString(),
              };
            } catch {
              previews[s.id] = {
                elevator_status: "Unknown",
                escalator_status: "Unknown",
                last_updated: new Date().toISOString(),
              };
            }
          })
        );

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
    return () => {
      mounted = false;
    };
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = stations;

    if (q) {
      list = list.filter((s) => {
        const name = (s.name || "").toLowerCase();
        const id = (s.id || "").toLowerCase();
        return name.includes(q) || id.includes(q);
      });
    }

    if (showOnlyFavorites) {
      list = list.filter((s) => favorites.includes(s.id));
    }

    // Favorites first
    const favSet = new Set(favorites);
    list = [...list].sort((a, b) => {
      const af = favSet.has(a.id) ? 1 : 0;
      const bf = favSet.has(b.id) ? 1 : 0;
      return bf - af;
    });

    return list;
  }, [query, stations, favorites, showOnlyFavorites]);

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header */}
      <header className="bg-slate-900 border-b border-slate-800">
        <div className="max-w-5xl mx-auto px-4 py-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-white">MTA Transit Status</h1>
              <p className="text-slate-300 mt-1">
                Search a station to view elevator/escalator status and service alerts.
              </p>
            </div>

            <button
              onClick={() => navigate("/map")}
              className="shrink-0 px-4 py-2 rounded-xl bg-sky-500/20 text-sky-200 border border-sky-400/30
                         hover:bg-sky-500/30 hover:text-white text-sm font-semibold transition
                         focus:outline-none focus:ring-2 focus:ring-sky-400"
            >
              Map View
            </button>
          </div>

          {/* Search */}
          <div className="mt-5">
            <label className="block text-sm font-medium text-slate-200 mb-2" htmlFor="stationSearch">
              Station search
            </label>
            <input
              id="stationSearch"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Try: Union Sq, Penn Station, Times Sq..."
              className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-white placeholder-slate-400
                         focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-sky-400"
            />
          </div>

          {/* Favorites toggle */}
          <div className="mt-4 flex items-center gap-3">
            <button
              onClick={() => setShowOnlyFavorites(false)}
              className={`px-3 py-2 rounded-xl text-sm font-semibold border transition ${
                !showOnlyFavorites
                  ? "bg-sky-500 text-white border-sky-500"
                  : "bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-700"
              }`}
            >
              All Stations
            </button>

            <button
              onClick={() => setShowOnlyFavorites(true)}
              className={`px-3 py-2 rounded-xl text-sm font-semibold border transition ${
                showOnlyFavorites
                  ? "bg-sky-500 text-white border-sky-500"
                  : "bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-700"
              }`}
            >
              Favorites {favorites.length ? `(${favorites.length})` : ""}
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">
            Stations {filtered.length ? <span className="text-slate-300">({filtered.length})</span> : null}
          </h2>
          <span className="text-sm text-slate-400">Data source: AWS API</span>
        </div>

        {loading ? (
          <div className="bg-slate-800/60 rounded-2xl border border-slate-700 p-6">
            <p className="text-slate-300">Loading stations…</p>
          </div>
        ) : error ? (
          <div className="bg-slate-800/60 rounded-2xl border border-slate-700 p-6">
            <p className="text-white font-semibold">Couldn’t load stations.</p>
            <p className="text-slate-300 mt-1">{error}</p>
            <p className="text-slate-300 mt-3">
              Tip: Make sure your{" "}
              <code className="px-1 py-0.5 bg-slate-900/60 border border-slate-700 rounded">
                VITE_API_BASE
              </code>{" "}
              is correct and your AWS API is deployed.
            </p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-slate-800/60 rounded-2xl border border-slate-700 p-6">
            <p className="text-white font-semibold">
              {showOnlyFavorites ? "No favorites yet." : "No stations found."}
            </p>
            <p className="text-slate-300 mt-1">
              {showOnlyFavorites ? "Star a station to save it here." : "Try a different search keyword."}
            </p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-5">
            {filtered.map((s, idx) => {
              const prev = statusPreview[s.id];
              const isFav = favorites.includes(s.id);
              const safeKey = `${s.id}-${idx}`;

              return (
                <div
                  key={safeKey}
                  role="button"
                  tabIndex={0}
                  onClick={() => navigate(`/station/${s.id}`)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      navigate(`/station/${s.id}`);
                    }
                  }}
                  className="cursor-pointer text-left bg-sky-50/95 border border-sky-200 rounded-2xl p-5
                             shadow-md hover:shadow-xl hover:-translate-y-0.5 transition
                             focus:outline-none focus:ring-2 focus:ring-sky-400"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="pr-2">
                      <h3 className="text-base font-bold text-slate-900">{s.name}</h3>
                      <p className="text-sm text-slate-600 mt-1">Station ID: {s.id}</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          toggleFavorite(s.id);
                        }}
                        className={`text-xl leading-none px-2 py-1 rounded-lg ring-1 transition ${
                          isFav
                            ? "bg-yellow-50 text-yellow-600 ring-yellow-200"
                            : "bg-white/80 text-slate-500 ring-slate-200 hover:bg-white"
                        }`}
                        aria-label={isFav ? "Remove from favorites" : "Add to favorites"}
                        title={isFav ? "Remove from favorites" : "Add to favorites"}
                      >
                        {isFav ? "⭐" : "☆"}
                      </button>

                      <span className="text-xs font-semibold px-2 py-1 rounded-full bg-white/80 text-slate-700 ring-1 ring-slate-200">
                        View
                      </span>
                    </div>
                  </div>

                  <LinePills lines={s.lines} />

                  <div className="mt-4 space-y-2">
                    <StatusBadge label="Elevator" value={prev?.elevator_status || "Loading…"} />
                    <StatusBadge label="Escalator" value={prev?.escalator_status || "Loading…"} />
                    {prev?.last_updated ? (
                      <p className="text-xs text-slate-500 mt-3">
                        Updated: {new Date(prev.last_updated).toLocaleString()}
                      </p>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-slate-900">
        <div className="max-w-5xl mx-auto px-4 py-6 text-sm text-slate-400">
          Built as a portfolio project using React + Tailwind and AWS serverless architecture.
        </div>
      </footer>
    </div>
  );
}
