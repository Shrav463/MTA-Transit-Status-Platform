// The AWS API and the local mock data don't agree on field names
// (station_id vs id vs stationId), so every screen that renders a
// station list needs to go through here first.
export function normalizeStation(raw) {
  const id = raw?.station_id ?? raw?.id ?? raw?.stationId ?? "";
  const name = raw?.station_name ?? raw?.name ?? raw?.stationName ?? "";
  const lines = Array.isArray(raw?.lines) ? raw.lines : [];
  return { id: String(id), name: String(name), lines };
}

export function normalizeStations(list) {
  return (Array.isArray(list) ? list : []).map(normalizeStation);
}

const FALLBACK_STATUS = () => ({
  elevator_status: "Unknown",
  escalator_status: "Unknown",
  alerts: [],
  last_updated: new Date().toISOString(),
});

export function normalizeStatus(raw) {
  if (!raw) return FALLBACK_STATUS();
  return {
    elevator_status: raw.elevator_status ?? "Unknown",
    escalator_status: raw.escalator_status ?? "Unknown",
    alerts: Array.isArray(raw.alerts) ? raw.alerts : [],
    last_updated: raw.last_updated ?? new Date().toISOString(),
  };
}
