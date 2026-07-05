// Small, dependency-free icon set. Deliberately minimal — stroke-based,
// 1.75px weight, 20x20 — rather than pulling in an icon library for six shapes.
const base = {
  width: 20,
  height: 20,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.75,
  strokeLinecap: "round",
  strokeLinejoin: "round",
};

export function IconStar({ filled = false, className = "" }) {
  return (
    <svg {...base} className={className} fill={filled ? "currentColor" : "none"}>
      <path d="M12 3.5l2.6 5.4 5.9.7-4.3 4.1 1.1 5.9L12 16.9l-5.3 2.7 1.1-5.9-4.3-4.1 5.9-.7L12 3.5z" />
    </svg>
  );
}

export function IconArrowLeft({ className = "" }) {
  return (
    <svg {...base} className={className}>
      <path d="M19 12H5" />
      <path d="M11 18l-6-6 6-6" />
    </svg>
  );
}

export function IconSearch({ className = "" }) {
  return (
    <svg {...base} className={className}>
      <circle cx="11" cy="11" r="7" />
      <path d="M21 21l-4.3-4.3" />
    </svg>
  );
}

export function IconMap({ className = "" }) {
  return (
    <svg {...base} className={className}>
      <path d="M9 4l-6 2v14l6-2 6 2 6-2V4l-6 2-6-2z" />
      <path d="M9 4v14" />
      <path d="M15 6v14" />
    </svg>
  );
}

export function IconRoute({ className = "" }) {
  return (
    <svg {...base} className={className}>
      <circle cx="6" cy="19" r="2.25" />
      <circle cx="18" cy="5" r="2.25" />
      <path d="M6 16.75V13a4 4 0 0 1 4-4h4a4 4 0 0 0 4-4" />
    </svg>
  );
}

export function IconTrendingUp({ className = "" }) {
  return (
    <svg {...base} className={className}>
      <path d="M3 17l6-6 4 4 8-8" />
      <path d="M15 7h6v6" />
    </svg>
  );
}

export function IconGrid({ className = "" }) {
  return (
    <svg {...base} className={className}>
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  );
}

export function IconAlert({ className = "" }) {
  return (
    <svg {...base} className={className}>
      <path d="M12 9v4" />
      <path d="M12 17h.01" />
      <path d="M10.3 3.9L2.7 17.1a1.8 1.8 0 0 0 1.55 2.7h15.5a1.8 1.8 0 0 0 1.55-2.7L13.7 3.9a1.8 1.8 0 0 0-3.4 0z" />
    </svg>
  );
}
