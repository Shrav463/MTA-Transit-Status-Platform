// The real bullet colors the MTA uses on signage, grouped by trunk line.
// Falling back to a neutral grey for anything we don't recognize (shuttles,
// SIR, or data quirks in the feed) rather than guessing.
const LINE_COLORS = {
  "1": "#EE352E", "2": "#EE352E", "3": "#EE352E",
  "4": "#00933C", "5": "#00933C", "6": "#00933C", "6X": "#00933C",
  "7": "#B933AD", "7X": "#B933AD",
  A: "#0039A6", C: "#0039A6", E: "#0039A6",
  B: "#FF6319", D: "#FF6319", F: "#FF6319", M: "#FF6319",
  N: "#FCCC0A", Q: "#FCCC0A", R: "#FCCC0A", W: "#FCCC0A",
  G: "#6CBE45",
  J: "#996633", Z: "#996633",
  L: "#A7A9AC",
  S: "#808183",
  SIR: "#0039A6",
};

const LIGHT_TEXT_LINES = new Set(["N", "Q", "R", "W"]); // yellow bullets need dark text

export function lineStyle(line) {
  const key = String(line || "").toUpperCase();
  const bg = LINE_COLORS[key] || "#4B5058";
  return {
    backgroundColor: bg,
    color: LIGHT_TEXT_LINES.has(key) ? "#0B0D10" : "#FFFFFF",
  };
}
