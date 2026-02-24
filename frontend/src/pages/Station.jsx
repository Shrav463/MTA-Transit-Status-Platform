import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getStations, getStationStatus } from "../services/api";

/* ---------- helpers ---------- */
function normalizeStation(raw) {
  const id = raw?.station_id ?? raw?.id ?? raw?.stationId ?? "";
  const name = raw?.station_name ?? raw?.name ?? raw?.stationName ?? "";
  const lines = Array.isArray(raw?.lines) ? raw.lines : [];
  return { id: String(id), name: String(name), lines };
}

function StatusPill({ value }) {
  const normalized = (value || "").toLowerCase();
  const cls =
    normalized.includes("operational")
      ? "bg-emerald-100 text-emerald-900 ring-emerald-200"
      : normalized.includes("out")
      ? "bg-rose-100 text-rose-900 ring-rose-200"
      : "bg-sky-100 text-sky-900 ring-sky-200";

  return (
    <span className={`text-xs font-semibold px-2 py-1 rounded-full ring-1 ${cls}`}>
      {value || "Unknown"}
    </span>
  );
}

function LinePill({ children }) {
  return (
    <span className="text-xs font-semibold px-2 py-1 rounded-full bg-sky-500/10 text-sky-800 border border-sky-400/30">
      {children}
    </span>
  );
}

/* ---------- main page ---------- */
export default function Stations() {
  const navigate = useNavigate();
  const PAGE_SIZE = 12;

  const [stations, setStations] = useState([]);
  const [loadingStations, setLoadingStations] = useState(true);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [statusById, setStatusById] = useState({});
  const [loadingStatusById, setLoadingStatusById] = useState({});

  const [favorites, setFavorites] = useState(() => {
    try {
      const saved = localStorage.getItem("mta_favorites");
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  useEffect(() => {
    localStorage.setItem("mta_favorites", JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    let mounted = true;
    async function load() {
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
    load();
    return () => {
      mounted = false;
    };
  }, []);

  const visibleStations = useMemo(() => {
    return stations.slice(0, visibleCount);
  }, [stations, visibleCount]);

  const inFlightRef = useRef(new Set());

  useEffect(() => {
    if (!visibleStations.length) return;

    visibleStations.forEach((st) => {
      const id = st.id;
      if (!id) return;
      if (statusById[id]) return;
      if (inFlightRef.current.has(id)) return;

      inFlightRef.current.add(id);
      setLoadingStatusById((prev) => ({ ...prev, [id]: true }));

      getStationStatus(id)
        .then((res) => {
          setStatusById((prev) => ({
            ...prev,
            [id]: {
              elevator_status: res?.elevator_status ?? "Unknown",
              escalator_status: res?.escalator_status ?? "Unknown",
              last_updated: res?.last_updated ?? new Date().toISOString(),
            },
          }));
        })
        .catch(() => {
          setStatusById((prev) => ({
            ...prev,
            [id]: {
              elevator_status: "Unknown",
              escalator_status: "Unknown",
              last_updated: new Date().toISOString(),
            },
          }));
        })
        .finally(() => {
          inFlightRef.current.delete(id);
          setLoadingStatusById((prev) => ({ ...prev, [id]: false }));
        });
    });
  }, [visibleStations]);

  function toggleFav(id) {
    setFavorites((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  return (
    <div className="min-h-screen bg-slate-900">
      <header className="bg-slate-900 border-b border-slate-800">
        <div className="max-w-6xl mx-auto px-4 py-6 flex justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Stations Status</h1>
            <p className="text-slate-300 mt-1">
              Showing {Math.min(visibleCount, stations.length)} of {stations.length || 0}
            </p>
          </div>
          <button
            onClick={() => navigate("/")}
            className="px-4 py-2 rounded-xl bg-sky-500/20 text-sky-200 border border-sky-400/30
                       hover:bg-sky-500/30 hover:text-white text-sm font-semibold"
          >
            Back to Home
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {loadingStations ? (
          <p className="text-slate-300">Loading stations…</p>
        ) : (
          <>
            <div className="grid md:grid-cols-2 gap-6">
              {visibleStations.map((st) => {
                const status = statusById[st.id];
                const isLoading = loadingStatusById[st.id];
                const isFav = favorites[st.id];

                return (
                  <div key={st.id} className="bg-slate-100 rounded-2xl shadow p-6">
                    <div className="flex justify-between">
                      <div>
                        <h3 className="font-bold text-slate-900">{st.name}</h3>
                        <p className="text-sm text-slate-600">ID: {st.id}</p>
                      </div>
                      <button onClick={() => toggleFav(st.id)}>
                        {isFav ? "★" : "☆"}
                      </button>
                    </div>

                    <div className="mt-3 flex flex-wrap gap-2">
                      {st.lines?.map((ln, idx) => (
                        <LinePill key={idx}>{ln}</LinePill>
                      ))}
                    </div>

                    <div className="mt-4 space-y-2">
                      <StatusPill value={isLoading ? "Loading..." : status?.elevator_status} />
                      <StatusPill value={isLoading ? "Loading..." : status?.escalator_status} />
                    </div>

                    <button
                      onClick={() => navigate(`/station/${st.id}`)}
                      className="mt-4 px-4 py-2 bg-white border rounded-xl"
                    >
                      View
                    </button>
                  </div>
                );
              })}
            </div>

            <div className="flex flex-col items-center gap-3 mt-8">
              {stations.length > visibleCount && (
                <button
                  onClick={() => setVisibleCount((c) => Math.min(c + PAGE_SIZE, stations.length))}
                  className="px-6 py-3 rounded-xl bg-sky-500 text-white font-semibold"
                >
                  Read more
                </button>
              )}

              {visibleCount > PAGE_SIZE && (
                <button
                  onClick={() => setVisibleCount(PAGE_SIZE)}
                  className="px-6 py-3 rounded-xl bg-slate-800 text-white"
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