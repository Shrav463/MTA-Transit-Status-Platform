const BASE = import.meta.env.VITE_API_BASE;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function fallback() {
  return {
    elevator_status: "Unknown",
    escalator_status: "Unknown",
    alerts: [],
    last_updated: new Date().toISOString(),
  };
}

export async function getStations() {
  await sleep(150);

  if (!BASE) {
    throw new Error("VITE_API_BASE is missing. Add it in frontend/.env and restart the dev server.");
  }

  const res = await fetch(`${BASE}/stations`, {
    headers: { Accept: "application/json" },
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Failed to load stations (${res.status}). ${text}`);
  }

  return res.json();
}

export async function getStationStatus(stationId) {
  await sleep(150);

  if (!BASE) {
    throw new Error("VITE_API_BASE is missing. Add it in frontend/.env and restart the dev server.");
  }

  if (!stationId) return fallback();

  const res = await fetch(`${BASE}/status?stationId=${encodeURIComponent(stationId)}`, {
    headers: { Accept: "application/json" },
  });

  if (!res.ok) return fallback();

  const data = await res.json().catch(() => null);
  if (!data) return fallback();

  // If backend returns your UI-ready shape already
  if (data.elevator_status || data.escalator_status) {
    return {
      elevator_status: data.elevator_status ?? "Unknown",
      escalator_status: data.escalator_status ?? "Unknown",
      alerts: Array.isArray(data.alerts) ? data.alerts : [],
      last_updated: data.last_updated ?? new Date().toISOString(),
    };
  }

  // If backend returns { elevators: [...], escalators: [...], updatedAt }
  if (data.elevators || data.escalators) {
    const hasElevOut = (data.elevators || []).some((e) =>
      String(e.status || "").toUpperCase().includes("OUT")
    );
    const hasEscOut = (data.escalators || []).some((e) =>
      String(e.status || "").toUpperCase().includes("OUT")
    );

    return {
      elevator_status: hasElevOut
        ? "Out of Service"
        : (data.elevators || []).length
        ? "Operational"
        : "Unknown",
      escalator_status: hasEscOut
        ? "Out of Service"
        : (data.escalators || []).length
        ? "Operational"
        : "Unknown",
      alerts: [],
      last_updated: data.updatedAt || new Date().toISOString(),
    };
  }

  return fallback();
}
