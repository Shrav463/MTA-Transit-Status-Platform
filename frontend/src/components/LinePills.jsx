import { lineStyle } from "../lib/lineColors";

// A "bullet" is the actual term for these on MTA signage — a filled circle
// with the line letter/number in the line's official color.
export function LineBullet({ line, size = "md" }) {
  const dims = size === "sm" ? "h-6 w-6 text-[11px]" : "h-8 w-8 text-sm";
  return (
    <span
      style={lineStyle(line)}
      className={`inline-flex ${dims} items-center justify-center rounded-full font-bold leading-none shrink-0`}
      aria-label={`Line ${line}`}
    >
      {line}
    </span>
  );
}

export function LinePill({ children }) {
  return <LineBullet line={children} size="sm" />;
}

export function LinePills({ lines = [], max = 12, size = "md" }) {
  if (!lines?.length) return null;
  return (
    <div className="flex flex-wrap gap-1.5">
      {lines.slice(0, max).map((line, idx) => (
        <LineBullet key={`${line}-${idx}`} line={line} size={size} />
      ))}
    </div>
  );
}
