function toneFor(value) {
  const normalized = (value || "").toLowerCase();
  if (normalized.includes("operational")) {
    return { dot: "bg-service-go", text: "text-service-go" };
  }
  if (normalized.includes("out")) {
    return { dot: "bg-service-stop", text: "text-service-stop" };
  }
  return { dot: "bg-service-unknown", text: "text-service-unknown" };
}

// Signage-style status line: a solid dot + uppercase label, the same
// vocabulary as the "GOOD SERVICE / DELAYS" language on real MTA boards.
export function StatusRow({ label, value }) {
  const tone = toneFor(value);
  return (
    <div className="flex items-center justify-between gap-3 py-1">
      <span className="text-xs uppercase tracking-wide text-slate-400 font-semibold">{label}</span>
      <span className={`flex items-center gap-1.5 text-sm font-semibold ${tone.text}`}>
        <span className={`h-2 w-2 rounded-full ${tone.dot}`} />
        {value || "Unknown"}
      </span>
    </div>
  );
}

export function StatusPill({ value }) {
  const tone = toneFor(value);
  return (
    <span className={`flex items-center gap-1.5 text-xs font-semibold ${tone.text}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${tone.dot}`} />
      {value || "Unknown"}
    </span>
  );
}
