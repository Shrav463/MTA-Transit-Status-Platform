import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getStations, getStationStatus } from "../services/api";
import { useFavorites } from "../hooks/useFavorites";
import { normalizeStations } from "../lib/stations";
import { StatusRow } from "../components/StatusBadge";
import { LinePills } from "../components/LinePills";
import { IconStar, IconMap, IconRoute, IconTrendingUp, IconGrid, IconSearch } from "../components/icons";
import heroImg from "../assets/mta_train.jpg";

const PAGE_SIZE = 12;

const NAV_LINKS = [
  { to: "/map", label: "Map", Icon: IconMap },
  { to: "/route-planner", label: "Route Planner", Icon: IconRoute },
  { to: "/delay-insights", label: "Delay Insights", Icon: IconTrendingUp },
  { to: "/stations", label: "All Stations", Icon: IconGrid },
];

export default function Home() {
  const navigate = useNavigate();
  const { favorites, toggleFavorite } = useFavorites();

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
        setError("");
        setLoading(true);

        const list = await getStations();
        if (!mounted) return;

        const normalized = normalizeStations(list);
        setStations(normalized);

        // Only fetch live status for the first page worth of stations up
        // front — the rest load lazily as the user paginates or searches.
        const preview = normalized.slice(0, 8);
        const previews = {};

        await Promise.all(
          preview.map(async (s) => {
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

  // Jump back to page one whenever the visible set changes shape.
  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [query, showOnlyFavorites]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = stations;

    if (q) {
      list = list.filter(
        (s) => s.name.toLowerCase().includes(q) || s.id.toLowerCase().includes(q)
      );
    }

    if (showOnlyFavorites) {
      list = list.filter((s) => favorites.includes(s.id));
    }

    const favSet = new Set(favorites);
    return [...list].sort((a, b) => {
      const aFav = favSet.has(a.id) ? 1 : 0;
      const bFav = favSet.has(b.id) ? 1 : 0;
      return bFav - aFav;
    });
  }, [query, stations, favorites, showOnlyFavorites]);

  const visibleStations = useMemo(
    () => filtered.slice(0, visibleCount),
    [filtered, visibleCount]
  );

  return (
    <div className="min-h-screen bg-ink font-sans">
      <header className="bg-ink border-b border-ink-line">
        <div className="max-w-5xl mx-auto px-4 py-6">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <span className="h-10 w-10 rounded-full bg-signal text-ink flex items-center justify-center font-black text-lg shrink-0">
                M
              </span>
              <div>
                <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                  Transit Status
                </h1>
                <p className="text-sm text-slate-400 mt-0.5">
                  Live elevator, escalator & service alerts for the NYC subway
                </p>
              </div>
            </div>

            <nav className="flex flex-wrap gap-2">
              {NAV_LINKS.map((link) => {
                const Icon = link.Icon;
                return (
                  <button
                    key={link.to}
                    onClick={() => navigate(link.to)}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white/5 text-slate-200 border border-white/10
                               hover:bg-signal/15 hover:text-signal hover:border-signal/30 text-sm font-semibold transition
                               focus:outline-none focus:ring-2 focus:ring-signal"
                  >
                    <Icon className="h-4 w-4" />
                    {link.label}
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="mt-6 relative overflow-hidden rounded-2xl border border-ink-line">
            <img
              src={heroImg}
              alt="NYC subway train"
              className="w-full h-52 sm:h-72 object-cover grayscale-[15%]"
              loading="lazy"
            />
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink/95 to-transparent px-4 pt-10 pb-3">
              <p className="text-sm text-slate-200">
                Check accessibility status before you travel — updated from live MTA feeds.
              </p>
            </div>
          </div>

          <div className="mt-6">
            <label
              className="block text-xs uppercase tracking-wide text-slate-400 font-semibold mb-2"
              htmlFor="stationSearch"
            >
              Find a station
            </label>
            <div className="relative">
              <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 h-4 w-4" />
              <input
                id="stationSearch"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Union Sq, Penn Station, Times Sq…"
                className="w-full rounded-lg border border-ink-line bg-ink-panel pl-10 pr-4 py-3 text-white placeholder-slate-500
                           focus:outline-none focus:ring-2 focus:ring-signal focus:border-signal"
              />
            </div>
          </div>

          <div className="mt-4 flex items-center gap-2">
            <button
              onClick={() => setShowOnlyFavorites(false)}
              className={`px-3 py-1.5 rounded-full text-sm font-semibold border transition ${
                !showOnlyFavorites
                  ? "bg-signal text-ink border-signal"
                  : "bg-transparent text-slate-300 border-ink-line hover:border-slate-500"
              }`}
            >
              All stations
            </button>

            <button
              onClick={() => setShowOnlyFavorites(true)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold border transition ${
                showOnlyFavorites
                  ? "bg-signal text-ink border-signal"
                  : "bg-transparent text-slate-300 border-ink-line hover:border-slate-500"
              }`}
            >
              <IconStar className="h-3.5 w-3.5" filled={showOnlyFavorites} />
              Favorites {favorites.length ? `(${favorites.length})` : ""}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xs uppercase tracking-wide text-slate-400 font-semibold">
            {filtered.length} station{filtered.length === 1 ? "" : "s"}
          </h2>
        </div>

        {loading ? (
          <div className="bg-ink-panel rounded-2xl border border-ink-line p-6">
            <p className="text-slate-300">Loading stations…</p>
          </div>
        ) : error ? (
          <div className="bg-ink-panel rounded-2xl border border-ink-line p-6">
            <p className="text-white font-semibold">Couldn’t load stations.</p>
            <p className="text-slate-300 mt-1">{error}</p>
            <p className="text-slate-400 text-sm mt-3">
              Tip: make sure{" "}
              <code className="px-1 py-0.5 bg-black/40 border border-ink-line rounded text-slate-300">
                VITE_API_BASE
              </code>{" "}
              points at a running API.
            </p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-ink-panel rounded-2xl border border-ink-line p-6">
            <p className="text-white font-semibold">
              {showOnlyFavorites ? "No favorites yet." : "No stations found."}
            </p>
            <p className="text-slate-400 mt-1 text-sm">
              {showOnlyFavorites ? "Star a station to save it here." : "Try a different search term."}
            </p>
          </div>
        ) : (
          <>
            <div className="grid sm:grid-cols-2 gap-4">
              {visibleStations.map((s) => {
                const preview = statusPreview[s.id];
                const isFav = favorites.includes(s.id);

                return (
                  <div
                    key={s.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => navigate(`/station/${s.id}`)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        navigate(`/station/${s.id}`);
                      }
                    }}
                    className="cursor-pointer text-left bg-ink-panel border border-ink-line rounded-2xl p-5
                               hover:border-signal/40 transition
                               focus:outline-none focus:ring-2 focus:ring-signal"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="pr-2 min-w-0">
                        <h3 className="text-base font-bold text-white truncate">{s.name}</h3>
                        <p className="text-xs text-slate-500 mt-0.5 font-mono">ID {s.id}</p>
                      </div>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          toggleFavorite(s.id);
                        }}
                        className={`shrink-0 p-1.5 rounded-lg transition ${
                          isFav ? "text-signal" : "text-slate-600 hover:text-slate-300"
                        }`}
                        aria-label={isFav ? "Remove from favorites" : "Add to favorites"}
                        title={isFav ? "Remove from favorites" : "Add to favorites"}
                      >
                        <IconStar filled={isFav} className="h-5 w-5" />
                      </button>
                    </div>

                    <div className="mt-3">
                      <LinePills lines={s.lines} size="sm" />
                    </div>

                    <div className="mt-4 pt-3 border-t border-ink-line space-y-1">
                      <StatusRow label="Elevator" value={preview?.elevator_status || "Loading…"} />
                      <StatusRow label="Escalator" value={preview?.escalator_status || "Loading…"} />
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex flex-col items-center gap-3 mt-8">
              {filtered.length > visibleCount ? (
                <button
                  onClick={() => setVisibleCount((c) => Math.min(c + PAGE_SIZE, filtered.length))}
                  className="px-6 py-2.5 rounded-full bg-signal text-ink font-semibold hover:bg-signal/90 transition"
                >
                  Show more
                </button>
              ) : (
                <div className="text-slate-500 text-sm">You’ve reached the end.</div>
              )}

              {visibleCount > PAGE_SIZE ? (
                <button
                  onClick={() => setVisibleCount(PAGE_SIZE)}
                  className="px-6 py-2.5 rounded-full bg-transparent text-slate-300 border border-ink-line hover:border-slate-500 transition"
                >
                  Show less
                </button>
              ) : null}
            </div>
          </>
        )}
      </main>

      <footer className="border-t border-ink-line bg-ink">
        <div className="max-w-5xl mx-auto px-4 py-6 text-sm text-slate-500">
          Built with React + Tailwind, backed by an AWS serverless API.
        </div>
      </footer>
    </div>
  );
}
