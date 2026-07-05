import { useState, useRef, useEffect } from "react";

// ─── Knowledge base & intent matching ────────────────────────────────────────
const FAQS = [
  {
    tags: ["elevator", "lift", "accessible", "accessibility", "wheelchair"],
    q: "How do I check elevator status?",
    a: "You can check live elevator status on any Station card on the Home page, or visit a Station's detail page. Statuses update from the MTA API in real time — look for the 🟢 Operational or 🔴 Out of Service badges.",
  },
  {
    tags: ["escalator", "moving stairs"],
    q: "How do I check escalator status?",
    a: "Escalator status is shown alongside elevator status on every Station card and Station detail page. If an escalator is out of service, a red badge will appear.",
  },
  {
    tags: ["delay", "delays", "disruption", "late", "slow", "incident"],
    q: "Where can I see delay info?",
    a: "Head to the ⚡ Delay Insights page (link in the nav). You'll see live KPIs, time-window toggles (Peak / Off-peak / Late night), and a ranked table of the top 10 delay hotspots.",
  },
  {
    tags: ["route", "plan", "trip", "travel", "directions", "from", "to", "transfer"],
    q: "How do I plan a route?",
    a: "Use the 🗺 Route Planner (link in the nav). Pick a From and To station from the dropdowns. The planner will show you direct lines or flag if a transfer is needed, plus elevator & escalator status at both ends.",
  },
  {
    tags: ["map", "location", "where", "find station", "plot"],
    q: "How do I find a station on the map?",
    a: "Visit the 🗺 Map page. All stations with known coordinates are plotted. Click any marker to jump to that station's detail page.",
  },
  {
    tags: ["favorite", "save", "star", "bookmark"],
    q: "How do I save favorite stations?",
    a: "Tap the ★ star icon on any station card to save it as a favorite. Switch to the 'Favorites' filter on the Home page to see only your saved stations. Favorites persist in your browser.",
  },
  {
    tags: ["line", "train", "which line", "subway line", "a train", "b train"],
    q: "How do I see which lines serve a station?",
    a: "Colored line circles appear on every station card and the station detail page. You'll see all lines that stop at that station. In the Route Planner you can also compare lines between two stations.",
  },
  {
    tags: ["status", "live", "real time", "current"],
    q: "Is the data live / real-time?",
    a: "Yes! Station accessibility data (elevator & escalator) is fetched live from the MTA API via our AWS Lambda backend. Delay Insights uses a demo scoring model — full real-time integration coming soon.",
  },
  {
    tags: ["api", "aws", "backend", "data source", "server"],
    q: "What data source does this use?",
    a: "The platform calls MTA's Open Data API through an AWS Lambda + API Gateway backend. Station list, accessibility status, and coordinates each have dedicated endpoints. Check the .env setup for VITE_API_BASE.",
  },
  {
    tags: ["peak", "off peak", "late night", "hours", "time"],
    q: "What are peak hours?",
    a: "For NYC subway purposes: Peak is roughly 6–9 AM and 4–8 PM weekdays. Off-peak covers midday and evenings. Late night is midnight–5 AM. The Delay Insights page lets you toggle between these windows.",
  },
  {
    tags: ["times square", "42 st", "grand central", "penn station", "union sq", "popular"],
    q: "Which stations have the highest delay risk?",
    a: "The top risk stations are Times Sq–42 St, Grand Central–42 St, Union Sq–14 St, and 34 St–Penn Station — primarily due to crowding and complex multi-line transfers. Check Delay Insights for the full ranked list.",
  },
  {
    tags: ["search", "find", "filter", "lookup"],
    q: "How do I search for a station?",
    a: "Use the search bar on the Home page — type any part of the station name or ID (e.g. 'Times', '42', 'Fulton'). Results filter instantly. You can also browse All Stations page for the full directory.",
  },
  {
    tags: ["help", "hi", "hello", "hey", "start", "what can you do"],
    q: "What can this chatbot help with?",
    a: "I can help you navigate the MTA Transit Status platform! Ask me about checking elevator or escalator status, planning a route, reading delay insights, finding stations on the map, saving favorites, or understanding how the data works.",
  },
];

function matchFAQ(input) {
  const q = input.toLowerCase();
  let best = null;
  let bestScore = 0;
  for (const faq of FAQS) {
    const score = faq.tags.filter(t => q.includes(t)).length;
    if (score > bestScore) { bestScore = score; best = faq; }
  }
  if (bestScore > 0) return best.a;
  // Fuzzy fallback
  if (q.length < 3) return null;
  return "I'm not sure about that one! Try asking about: elevator status, route planning, delay insights, the map, saving favorites, or which lines serve a station.";
}

// ─── Suggested quick questions ────────────────────────────────────────────────
const QUICK_QS = [
  "How do I check elevator status?",
  "Where can I see delay info?",
  "How do I plan a route?",
  "How do I save favorite stations?",
  "Is the data real-time?",
  "Which stations have the highest delay risk?",
];

// ─── Component ────────────────────────────────────────────────────────────────
export default function MTAChatBot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: "bot",
      text: "👋 Hey! I'm the MTA Status Assistant. Ask me anything about the platform — elevator status, route planning, delays, and more!",
      ts: Date.now(),
    },
  ]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [unread, setUnread] = useState(0);
  const [showQuick, setShowQuick] = useState(true);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (open) {
      setUnread(0);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);

  useEffect(() => {
    if (open) bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing, open]);

  function sendMessage(text) {
    const userText = text || input.trim();
    if (!userText) return;
    setInput("");
    setShowQuick(false);
    setMessages(prev => [...prev, { role: "user", text: userText, ts: Date.now() }]);
    setTyping(true);

    setTimeout(() => {
      const answer = matchFAQ(userText);
      setTyping(false);
      const botMsg = {
        role: "bot",
        text: answer || "I didn't quite catch that. Try asking about elevator status, routes, delays, or favorites!",
        ts: Date.now(),
      };
      setMessages(prev => [...prev, botMsg]);
      if (!open) setUnread(u => u + 1);
    }, 700 + Math.random() * 400);
  }

  function handleKey(e) {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  }

  const bubbleBase = {
    maxWidth: "82%",
    padding: "10px 14px",
    borderRadius: 16,
    fontSize: 13,
    lineHeight: 1.55,
    wordBreak: "break-word",
  };

  return (
    <>
      {/* ── Floating toggle button ── */}
      <button
        onClick={() => setOpen(v => !v)}
        aria-label="Toggle chat assistant"
        style={{
          position: "fixed",
          bottom: 24,
          right: 24,
          zIndex: 1000,
          width: 56,
          height: 56,
          borderRadius: "50%",
          background: open ? "var(--surface2)" : "var(--orange)",
          border: open ? "2px solid var(--orange)" : "none",
          color: "#fff",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: open
            ? "0 4px 20px rgba(0,0,0,0.4)"
            : "0 4px 24px rgba(255,107,0,0.5), 0 0 0 0 rgba(255,107,0,0.3)",
          transition: "all 0.25s cubic-bezier(0.34,1.56,0.64,1)",
          transform: open ? "scale(0.95)" : "scale(1)",
          animation: open ? "none" : "chatPulse 2.5s ease-in-out infinite",
        }}
      >
        {open ? (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--orange)" strokeWidth="2.5" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        ) : (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
          </svg>
        )}
        {/* Unread badge */}
        {unread > 0 && !open && (
          <span style={{
            position: "absolute",
            top: -4,
            right: -4,
            background: "var(--red, #ff3355)",
            color: "#fff",
            borderRadius: "50%",
            width: 20,
            height: 20,
            fontSize: 11,
            fontWeight: 700,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            border: "2px solid var(--bg)",
          }}>{unread}</span>
        )}
      </button>

      {/* ── Chat window ── */}
      <div
        style={{
          position: "fixed",
          bottom: 92,
          right: 24,
          zIndex: 999,
          width: 360,
          maxWidth: "calc(100vw - 48px)",
          height: open ? 520 : 0,
          maxHeight: "calc(100vh - 120px)",
          background: "var(--surface)",
          border: "1px solid var(--border2, var(--border))",
          borderRadius: 20,
          boxShadow: "0 24px 60px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,107,0,0.12)",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          opacity: open ? 1 : 0,
          pointerEvents: open ? "all" : "none",
          transition: "height 0.3s cubic-bezier(0.34,1.2,0.64,1), opacity 0.2s ease",
        }}
      >
        {/* Header */}
        <div style={{
          background: "var(--orange)",
          padding: "14px 16px",
          display: "flex",
          alignItems: "center",
          gap: 10,
          flexShrink: 0,
        }}>
          <div style={{
            width: 36,
            height: 36,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.2)",
            border: "1.5px solid rgba(255,255,255,0.4)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 18,
            flexShrink: 0,
          }}>🚇</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 700, fontSize: 14, color: "#fff", letterSpacing: "0.03em" }}>MTA Status Assistant</div>
            <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 2 }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#4fffb0", display: "inline-block", boxShadow: "0 0 6px #4fffb0" }} />
              <span style={{ fontSize: 10, color: "rgba(255,255,255,0.85)", letterSpacing: "0.08em", textTransform: "uppercase" }}>Online</span>
            </div>
          </div>
          <button
            onClick={() => setOpen(false)}
            style={{ background: "rgba(255,255,255,0.15)", border: "none", color: "#fff", borderRadius: 8, width: 28, height: 28, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {/* Messages */}
        <div style={{
          flex: 1,
          overflowY: "auto",
          padding: "16px 14px",
          display: "flex",
          flexDirection: "column",
          gap: 10,
          scrollbarWidth: "thin",
          scrollbarColor: "var(--border) transparent",
        }}>
          {messages.map((msg, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                justifyContent: msg.role === "user" ? "flex-end" : "flex-start",
                alignItems: "flex-end",
                gap: 6,
                animation: "msgIn 0.2s ease",
              }}
            >
              {msg.role === "bot" && (
                <div style={{
                  width: 26,
                  height: 26,
                  borderRadius: "50%",
                  background: "var(--orange)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 12,
                  flexShrink: 0,
                  marginBottom: 2,
                }}>🚇</div>
              )}
              <div style={{
                ...bubbleBase,
                background: msg.role === "user"
                  ? "var(--orange)"
                  : "var(--surface2)",
                color: msg.role === "user" ? "#fff" : "var(--text)",
                border: msg.role === "bot" ? "1px solid var(--border)" : "none",
                borderBottomLeftRadius: msg.role === "bot" ? 4 : 16,
                borderBottomRightRadius: msg.role === "user" ? 4 : 16,
              }}>
                {msg.text}
              </div>
            </div>
          ))}

          {/* Typing indicator */}
          {typing && (
            <div style={{ display: "flex", alignItems: "flex-end", gap: 6, animation: "msgIn 0.2s ease" }}>
              <div style={{ width: 26, height: 26, borderRadius: "50%", background: "var(--orange)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, flexShrink: 0 }}>🚇</div>
              <div style={{
                ...bubbleBase,
                background: "var(--surface2)",
                border: "1px solid var(--border)",
                borderBottomLeftRadius: 4,
                padding: "12px 16px",
                display: "flex",
                gap: 4,
                alignItems: "center",
              }}>
                {[0, 1, 2].map(i => (
                  <span key={i} style={{
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    background: "var(--text-subtle)",
                    display: "inline-block",
                    animation: `typingDot 1.2s ease-in-out ${i * 0.2}s infinite`,
                  }} />
                ))}
              </div>
            </div>
          )}

          {/* Quick questions */}
          {showQuick && !typing && (
            <div style={{ marginTop: 6 }}>
              <div style={{ fontSize: 10, color: "var(--text-subtle)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 8, paddingLeft: 32 }}>
                Suggested questions
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6, paddingLeft: 32 }}>
                {QUICK_QS.map((q, i) => (
                  <button
                    key={i}
                    onClick={() => sendMessage(q)}
                    style={{
                      textAlign: "left",
                      background: "var(--surface2)",
                      border: "1px solid var(--border)",
                      borderRadius: 10,
                      padding: "8px 12px",
                      fontSize: 12,
                      color: "var(--text-muted)",
                      cursor: "pointer",
                      transition: "all 0.15s",
                      lineHeight: 1.4,
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.borderColor = "var(--orange)";
                      e.currentTarget.style.color = "var(--orange)";
                      e.currentTarget.style.background = "var(--orange-dim, rgba(255,107,0,0.08))";
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.borderColor = "var(--border)";
                      e.currentTarget.style.color = "var(--text-muted)";
                      e.currentTarget.style.background = "var(--surface2)";
                    }}
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div style={{
          borderTop: "1px solid var(--border)",
          padding: "10px 12px",
          display: "flex",
          gap: 8,
          alignItems: "flex-end",
          flexShrink: 0,
          background: "var(--surface2)",
        }}>
          <textarea
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Ask about stations, routes, delays…"
            rows={1}
            style={{
              flex: 1,
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: 12,
              padding: "9px 12px",
              fontSize: 13,
              color: "var(--text)",
              resize: "none",
              outline: "none",
              fontFamily: "inherit",
              lineHeight: 1.4,
              maxHeight: 80,
              overflowY: "auto",
              transition: "border-color 0.15s",
            }}
            onFocus={e => e.target.style.borderColor = "var(--orange)"}
            onBlur={e => e.target.style.borderColor = "var(--border)"}
          />
          <button
            onClick={() => sendMessage()}
            disabled={!input.trim() || typing}
            style={{
              width: 38,
              height: 38,
              borderRadius: 12,
              background: input.trim() && !typing ? "var(--orange)" : "var(--surface3, var(--surface))",
              border: "1px solid var(--border)",
              color: input.trim() && !typing ? "#fff" : "var(--text-subtle)",
              cursor: input.trim() && !typing ? "pointer" : "default",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              transition: "all 0.15s",
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
            </svg>
          </button>
        </div>
      </div>

      {/* Keyframe styles */}
      <style>{`
        @keyframes chatPulse {
          0%, 100% { box-shadow: 0 4px 24px rgba(255,107,0,0.5), 0 0 0 0 rgba(255,107,0,0.3); }
          50% { box-shadow: 0 4px 24px rgba(255,107,0,0.6), 0 0 0 10px rgba(255,107,0,0); }
        }
        @keyframes typingDot {
          0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
          30% { transform: translateY(-4px); opacity: 1; }
        }
        @keyframes msgIn {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </>
  );
}
