<<<<<<< HEAD
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

function KPICard({ label, value, note }) {
  return (
    <div className="bg-ink-panel rounded-2xl border border-ink-line p-5">
      <div className="text-sm text-slate-300">{label}</div>
      <div className="text-2xl font-bold text-white mt-2">{value}</div>
      {note ? <div className="text-xs text-slate-400 mt-2">{note}</div> : null}
=======
import { useMemo, useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";


const GLOBAL_CSS = `
  :root {
    --bg:        #0a0a0c;
    --surface:   #111114;
    --surface2:  #18181d;
    --surface3:  #222228;
    --orange:    #ff6b00;
    --orange-dim: rgba(255,107,0,0.12);
    --green:     #22d47a;
    --red:       #ff3355;
    --yellow:    #ffbd2e;
    --yellow-dim: rgba(255,189,46,0.12);
    --text:      #f0f0f5;
    --text-muted:#8888a0;
    --text-subtle:#55556a;
    --border:    rgba(255,255,255,0.08);
    --border2:   rgba(255,255,255,0.13);
    --r:         10px;
    --r-lg:      16px;
  }
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html, body, #root { height: 100%; background: var(--bg); color: var(--text); font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; -webkit-font-smoothing: antialiased; }
  button { font-family: inherit; cursor: pointer; }
  input, textarea { font-family: inherit; }

  .di-page  { min-height: 100vh; display: flex; flex-direction: column; background: var(--bg); }
  .di-wrap  { width: 100%; max-width: 1200px; margin: 0 auto; }

  .di-stripe { height: 3px; background: linear-gradient(90deg,var(--orange),#ff9500,var(--orange)); background-size:200%; animation: stripeAnim 4s linear infinite; }
  @keyframes stripeAnim { to { background-position: 200% 0; } }

  .di-nav { background: var(--surface); border-bottom: 1px solid var(--border); position: sticky; top: 0; z-index: 50; backdrop-filter: blur(12px); }

  .di-card { background: var(--surface2); border: 1px solid var(--border); border-radius: var(--r-lg); overflow: hidden; }
  .di-kpi  { background: var(--surface2); border: 1px solid var(--border); border-radius: var(--r-lg); padding: 20px; }

  .di-btn  { display:inline-flex; align-items:center; justify-content:center; gap:6px; border-radius:var(--r); padding:8px 16px; font-size:13px; font-weight:600; cursor:pointer; transition:all .15s; border:none; white-space:nowrap; }
  .di-btn-ghost { background:transparent; color:var(--text-muted); border:1px solid var(--border); }
  .di-btn-ghost:hover { border-color:var(--border2); color:var(--text); background:var(--surface2); }

  .di-badge { display:inline-flex; align-items:center; gap:5px; padding:3px 8px; border-radius:6px; font-size:11px; font-weight:600; border:1px solid transparent; white-space:nowrap; }
  .b-green  { background:rgba(34,212,122,0.12);  color:#22d47a; border-color:rgba(34,212,122,0.2);  }
  .b-red    { background:rgba(255,51,85,0.12);   color:#ff3355; border-color:rgba(255,51,85,0.2);   }
  .b-yellow { background:rgba(255,189,46,0.12);  color:#ffbd2e; border-color:rgba(255,189,46,0.2);  }
  .b-orange { background:rgba(255,107,0,0.12);   color:#ff6b00; border-color:rgba(255,107,0,0.2);   }

  .di-display { font-family: 'Bebas Neue', 'Arial Black', sans-serif; letter-spacing: 0.04em; line-height: 1; }
  .di-mono    { font-family: 'JetBrains Mono', 'Courier New', monospace; }
  .di-eyebrow { font-size:10px; font-weight:700; letter-spacing:0.14em; text-transform:uppercase; color:var(--text-subtle); }
  .di-divider { border:none; border-top:1px solid var(--border); }

  .di-fu  { animation: diUp .4s ease both; }
  .di-fu1 { animation-delay:.08s; }
  .di-fu2 { animation-delay:.14s; }
  @keyframes diUp { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }

  /* Chatbot */
  @keyframes chatPulse { 0%,100%{box-shadow:0 4px 24px rgba(255,107,0,.5),0 0 0 0 rgba(255,107,0,.3)} 50%{box-shadow:0 4px 24px rgba(255,107,0,.6),0 0 0 10px rgba(255,107,0,0)} }
  @keyframes typingDot { 0%,60%,100%{transform:translateY(0);opacity:.4} 30%{transform:translateY(-4px);opacity:1} }
  @keyframes msgIn { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:translateY(0)} }
  .chat-scroll::-webkit-scrollbar{width:4px} .chat-scroll::-webkit-scrollbar-thumb{background:var(--surface3);border-radius:99px}
`;

function InjectCSS() {
  useEffect(() => {
    const id = "di-global-css";
    if (!document.getElementById(id)) {
      const s = document.createElement("style");
      s.id = id;
      s.textContent = GLOBAL_CSS;
      document.head.appendChild(s);
    }
  }, []);
  return null;
}


const FAQS = [
  { tags: ["elevator","lift","accessible","wheelchair"],        a: "Elevator status is shown live on every Station card and the Station detail page. Look for the 🟢 Operational or 🔴 Out of Service badge." },
  { tags: ["escalator","moving stairs"],                        a: "Escalator status appears alongside elevator info on every Station card and detail page." },
  { tags: ["delay","delays","disruption","late","incident"],    a: "You're already on it! Toggle between Peak / Off-peak / Late night to see how risk levels shift. The table ranks the top 10 hotspot stations." },
  { tags: ["route","plan","trip","transfer","directions"],      a: "Use the 🗺 Route Planner (link in the nav). Pick From & To stations — it shows direct lines or flags a transfer, plus accessibility status at both ends." },
  { tags: ["map","location","where","find station"],            a: "The 🗺 Map page plots all stations with known coordinates. Click any marker to open that station's detail page." },
  { tags: ["favorite","save","star","bookmark"],                a: "Tap ★ on any station card to save it. Use the Favorites filter on the Home page to see only your saved stations — stored in your browser." },
  { tags: ["line","train","which line","subway"],               a: "Colored line circles appear on every station card and detail page, showing all lines that stop there." },
  { tags: ["live","real time","current","status"],              a: "Elevator & escalator data is fetched live from the MTA API via AWS Lambda. Delay Insights uses a demo scoring model — real-time integration coming soon." },
  { tags: ["peak","off peak","late night","hours"],             a: "Peak = 6–9 AM & 4–8 PM weekdays. Off-peak = midday/evenings. Late night = midnight–5 AM. Toggle between them above the table on this page." },
  { tags: ["times square","grand central","penn station","worst","highest risk"], a: "Times Sq–42 St and Grand Central–42 St are the top two risk stations, mainly due to crowding and complex multi-line transfers. See the full table on this page!" },
  { tags: ["search","find","filter","lookup"],                  a: "Use the search bar on the Home page — type any part of the station name or ID. The All Stations page also has the full directory." },
  { tags: ["help","hi","hello","hey","what can you do","start"], a: "Hi! I can help you navigate the MTA Transit Status platform. Ask about elevators, escalators, route planning, delay insights, the map, or saving favorites." },
  { tags: ["api","aws","backend","data source"],                 a: "The platform calls the MTA Open Data API via an AWS Lambda + API Gateway backend. Station list, accessibility status, and coordinates each have dedicated endpoints." },
];

const QUICK_QS = [
  "Which stations have the highest risk?",
  "How do I check elevator status?",
  "How do I plan a route?",
  "What's the difference between peak and off-peak?",
  "Is the data real-time?",
  "How do I save favorite stations?",
];

function matchFAQ(input) {
  const q = input.toLowerCase();
  let best = null, bestScore = 0;
  for (const faq of FAQS) {
    const score = faq.tags.filter(t => q.includes(t)).length;
    if (score > bestScore) { bestScore = score; best = faq; }
  }
  if (bestScore > 0) return best.a;
  if (q.length < 3) return null;
  return "I'm not sure about that one! Try asking about: elevator status, route planning, delay insights, the map, or saving favorites.";
}

function ChatBot() {
  const [open, setOpen]       = useState(false);
  const [msgs, setMsgs]       = useState([{ role: "bot", text: "👋 Hey! I'm the MTA Status Assistant. Ask me anything about the platform — delays, elevators, route planning and more!", ts: 0 }]);
  const [input, setInput]     = useState("");
  const [typing, setTyping]   = useState(false);
  const [unread, setUnread]   = useState(0);
  const [showQ, setShowQ]     = useState(true);
  const bottomRef             = useRef(null);
  const inputRef              = useRef(null);

  useEffect(() => { if (open) { setUnread(0); setTimeout(() => inputRef.current?.focus(), 120); } }, [open]);
  useEffect(() => { if (open) bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs, typing, open]);

  function send(text) {
    const t = (text || input).trim();
    if (!t) return;
    setInput(""); setShowQ(false);
    setMsgs(p => [...p, { role: "user", text: t, ts: Date.now() }]);
    setTyping(true);
    setTimeout(() => {
      setTyping(false);
      const ans = matchFAQ(t) || "I didn't quite catch that. Try asking about elevators, routes, or delays!";
      setMsgs(p => [...p, { role: "bot", text: ans, ts: Date.now() }]);
      if (!open) setUnread(u => u + 1);
    }, 700 + Math.random() * 400);
  }

  const bb = { maxWidth: "82%", padding: "10px 14px", borderRadius: 16, fontSize: 13, lineHeight: 1.55, wordBreak: "break-word" };

  return (
    <>
      {/* Toggle button */}
      <button
        onClick={() => setOpen(v => !v)}
        style={{
          position:"fixed", bottom:24, right:24, zIndex:1000,
          width:56, height:56, borderRadius:"50%",
          background: open ? "var(--surface2)" : "var(--orange)",
          border: open ? "2px solid var(--orange)" : "none",
          color:"#fff", display:"flex", alignItems:"center", justifyContent:"center",
          boxShadow: open ? "0 4px 20px rgba(0,0,0,.4)" : "0 4px 24px rgba(255,107,0,.5)",
          transition:"all 0.25s cubic-bezier(0.34,1.56,0.64,1)",
          animation: open ? "none" : "chatPulse 2.5s ease-in-out infinite",
        }}
      >
        {open
          ? <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--orange)" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          : <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
        }
        {unread > 0 && !open && (
          <span style={{ position:"absolute", top:-4, right:-4, background:"#ff3355", color:"#fff", borderRadius:"50%", width:20, height:20, fontSize:11, fontWeight:700, display:"flex", alignItems:"center", justifyContent:"center", border:"2px solid var(--bg)" }}>
            {unread}
          </span>
        )}
      </button>

      {/* Chat window */}
      <div style={{
        position:"fixed", bottom:92, right:24, zIndex:999,
        width:360, maxWidth:"calc(100vw - 48px)",
        height: open ? 520 : 0, maxHeight:"calc(100vh - 120px)",
        background:"var(--surface)",
        border:"1px solid var(--border2, var(--border))",
        borderRadius:20,
        boxShadow:"0 24px 60px rgba(0,0,0,.55), 0 0 0 1px rgba(255,107,0,.1)",
        display:"flex", flexDirection:"column", overflow:"hidden",
        opacity: open ? 1 : 0, pointerEvents: open ? "all" : "none",
        transition:"height 0.3s cubic-bezier(0.34,1.2,0.64,1), opacity 0.2s ease",
      }}>
        {/* Header */}
        <div style={{ background:"var(--orange)", padding:"14px 16px", display:"flex", alignItems:"center", gap:10, flexShrink:0 }}>
          <div style={{ width:36, height:36, borderRadius:"50%", background:"rgba(255,255,255,.2)", border:"1.5px solid rgba(255,255,255,.4)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:18, flexShrink:0 }}>🚇</div>
          <div style={{ flex:1 }}>
            <div style={{ fontWeight:700, fontSize:14, color:"#fff" }}>MTA Status Assistant</div>
            <div style={{ display:"flex", alignItems:"center", gap:5, marginTop:2 }}>
              <span style={{ width:6, height:6, borderRadius:"50%", background:"#4fffb0", display:"inline-block", boxShadow:"0 0 6px #4fffb0" }}/>
              <span style={{ fontSize:10, color:"rgba(255,255,255,.85)", textTransform:"uppercase", letterSpacing:"0.08em" }}>Online</span>
            </div>
          </div>
          <button onClick={() => setOpen(false)} style={{ background:"rgba(255,255,255,.15)", border:"none", color:"#fff", borderRadius:8, width:28, height:28, display:"flex", alignItems:"center", justifyContent:"center" }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        {/* Messages */}
        <div className="chat-scroll" style={{ flex:1, overflowY:"auto", padding:"16px 14px", display:"flex", flexDirection:"column", gap:10 }}>
          {msgs.map((m, i) => (
            <div key={i} style={{ display:"flex", justifyContent: m.role==="user"?"flex-end":"flex-start", alignItems:"flex-end", gap:6, animation:"msgIn 0.2s ease" }}>
              {m.role==="bot" && (
                <div style={{ width:26, height:26, borderRadius:"50%", background:"var(--orange)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:12, flexShrink:0 }}>🚇</div>
              )}
              <div style={{
                ...bb,
                background: m.role==="user" ? "var(--orange)" : "var(--surface2)",
                color: m.role==="user" ? "#fff" : "var(--text)",
                border: m.role==="bot" ? "1px solid var(--border)" : "none",
                borderBottomLeftRadius:  m.role==="bot"  ? 4 : 16,
                borderBottomRightRadius: m.role==="user" ? 4 : 16,
              }}>{m.text}</div>
            </div>
          ))}

          {/* Typing dots */}
          {typing && (
            <div style={{ display:"flex", alignItems:"flex-end", gap:6, animation:"msgIn 0.2s ease" }}>
              <div style={{ width:26, height:26, borderRadius:"50%", background:"var(--orange)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:12 }}>🚇</div>
              <div style={{ ...bb, background:"var(--surface2)", border:"1px solid var(--border)", borderBottomLeftRadius:4, padding:"12px 16px", display:"flex", gap:4, alignItems:"center" }}>
                {[0,1,2].map(i => (
                  <span key={i} style={{ width:6, height:6, borderRadius:"50%", background:"var(--text-subtle)", display:"inline-block", animation:`typingDot 1.2s ease-in-out ${i*0.2}s infinite` }}/>
                ))}
              </div>
            </div>
          )}

          {/* Quick questions */}
          {showQ && !typing && (
            <div style={{ marginTop:4 }}>
              <div style={{ fontSize:10, color:"var(--text-subtle)", letterSpacing:"0.1em", textTransform:"uppercase", marginBottom:8, paddingLeft:32 }}>Suggested questions</div>
              <div style={{ display:"flex", flexDirection:"column", gap:6, paddingLeft:32 }}>
                {QUICK_QS.map((q, i) => (
                  <button key={i} onClick={() => send(q)} style={{
                    textAlign:"left", background:"var(--surface2)", border:"1px solid var(--border)",
                    borderRadius:10, padding:"8px 12px", fontSize:12, color:"var(--text-muted)", transition:"all .15s", lineHeight:1.4,
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor="var(--orange)"; e.currentTarget.style.color="var(--orange)"; e.currentTarget.style.background="rgba(255,107,0,0.08)"; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor="var(--border)"; e.currentTarget.style.color="var(--text-muted)"; e.currentTarget.style.background="var(--surface2)"; }}
                  >{q}</button>
                ))}
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div style={{ borderTop:"1px solid var(--border)", padding:"10px 12px", display:"flex", gap:8, alignItems:"flex-end", flexShrink:0, background:"var(--surface2)" }}>
          <textarea
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key==="Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
            placeholder="Ask about delays, routes, stations…"
            rows={1}
            style={{ flex:1, background:"var(--surface)", border:"1px solid var(--border)", borderRadius:12, padding:"9px 12px", fontSize:13, color:"var(--text)", resize:"none", outline:"none", lineHeight:1.4, maxHeight:80, overflowY:"auto", transition:"border-color .15s" }}
            onFocus={e => e.target.style.borderColor="var(--orange)"}
            onBlur={e  => e.target.style.borderColor="var(--border)"}
          />
          <button
            onClick={() => send()}
            disabled={!input.trim() || typing}
            style={{ width:38, height:38, borderRadius:12, background: input.trim()&&!typing?"var(--orange)":"var(--surface3, #222)", border:"1px solid var(--border)", color: input.trim()&&!typing?"#fff":"var(--text-subtle)", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, transition:"all .15s" }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
            </svg>
          </button>
        </div>
      </div>
    </>
  );
}


function riskMeta(level) {
  const l = (level || "").toLowerCase();
  if (l === "high")   return { cls: "b-red",    bar: "#ff3355", w: "85%" };
  if (l === "medium") return { cls: "b-yellow",  bar: "#ffbd2e", w: "52%" };
  return                     { cls: "b-green",   bar: "#22d47a", w: "22%" };
}

function KPICard({ label, value, note, icon, delay = 0 }) {
  return (
    <div className="di-kpi di-fu" style={{ animationDelay: `${delay}s` }}>
      <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", gap:8 }}>
        <div className="di-eyebrow">{label}</div>
        {icon && <div style={{ fontSize:18, opacity:.5, lineHeight:1 }}>{icon}</div>}
      </div>
      <div className="di-display" style={{ fontSize:38, color:"var(--orange)", marginTop:8 }}>{value}</div>
      {note && <div style={{ fontSize:11, color:"var(--text-muted)", marginTop:6, lineHeight:1.5 }}>{note}</div>}
>>>>>>> 3b2721e5055772c6e4d92bd61fd7854c779af0b4
    </div>
  );
}

<<<<<<< HEAD
function RiskBadge({ level }) {
  const l = (level || "").toLowerCase();
  const dot = l === "high" ? "bg-service-stop" : l === "medium" ? "bg-signal" : "bg-service-go";
  const text = l === "high" ? "text-service-stop" : l === "medium" ? "text-signal" : "text-service-go";

  return (
    <span className={`flex items-center gap-1.5 text-xs font-semibold ${text}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${dot}`} />
      {level}
    </span>
  );
}

=======
function RiskBar({ level }) {
  const m = riskMeta(level);
  return (
    <div style={{ display:"flex", alignItems:"center", gap:8, flex:1 }}>
      <div style={{ flex:1, height:4, background:"var(--surface3)", borderRadius:99, overflow:"hidden" }}>
        <div style={{ height:"100%", width:m.w, background:m.bar, borderRadius:99, transition:"width .4s ease" }}/>
      </div>
      <span className={`di-badge ${m.cls}`} style={{ fontSize:10, minWidth:52, justifyContent:"center" }}>{level}</span>
    </div>
  );
}

const ALL_TOP10 = [
  { station:"Times Sq - 42 St",        level:"High",   reason:"Crowding + multi-line transfers" },
  { station:"Grand Central - 42 St",   level:"High",   reason:"Heavy commuter volume" },
  { station:"Union Sq - 14 St",        level:"Medium", reason:"Transfer congestion" },
  { station:"34 St - Penn Station",    level:"Medium", reason:"Peak surges + platform constraints" },
  { station:"Fulton St",               level:"Medium", reason:"Complex transfers" },
  { station:"Herald Sq",               level:"Medium", reason:"Crowding + escalator outages (demo)" },
  { station:"Atlantic Av - Barclays",  level:"Low",    reason:"Mostly stable outside peak" },
  { station:"Jackson Hts - Roosevelt", level:"Low",    reason:"Occasional delays from track work" },
  { station:"Flushing - Main St",      level:"Low",    reason:"Crowding varies by time" },
  { station:"59 St - Columbus Circle", level:"Low",    reason:"Generally stable routes" },
];

const TWS = [
  { value:"peak",    label:"Peak" },
  { value:"offpeak", label:"Off-peak" },
  { value:"late",    label:"Late night" },
];

const FOOTER_LINKS = [["Map","/map"],["Route Planner","/route-planner"],["Delay Insights","/delay-insights"],["Stations","/stations"]];


>>>>>>> 3b2721e5055772c6e4d92bd61fd7854c779af0b4
export default function DelayInsights() {
  const navigate = useNavigate();
  const [timeWindow, setTimeWindow] = useState("peak");

  const kpis = useMemo(() => {
<<<<<<< HEAD
    if (timeWindow === "peak") {
      return [
        { label: "Active incidents (demo)", value: "14", note: "Peak hours have higher disruption risk." },
        { label: "Stations with outages (demo)", value: "9", note: "Elevator/escalator outages impact accessibility." },
        { label: "Avg delay risk (demo)", value: "Medium", note: "Computed from demo scoring model." },
        { label: "Most affected zone (demo)", value: "Midtown", note: "High ridership + complex transfers." },
      ];
    }
    if (timeWindow === "offpeak") {
      return [
        { label: "Active incidents (demo)", value: "6", note: "Off-peak typically improves stability." },
        { label: "Stations with outages (demo)", value: "5", note: "Outages still matter for step-free routes." },
        { label: "Avg delay risk (demo)", value: "Low", note: "Lower crowding reduces propagation." },
        { label: "Most affected zone (demo)", value: "Downtown hubs", note: "Transfers can still create delays." },
      ];
    }
    return [
      { label: "Active incidents (demo)", value: "4", note: "Late night: planned work can appear." },
      { label: "Stations with outages (demo)", value: "3", note: "Some stations close entrances late night." },
      { label: "Avg delay risk (demo)", value: "Low–Medium", note: "Depends on maintenance windows." },
      { label: "Most affected zone (demo)", value: "Track work segments", note: "Scheduled maintenance is common." },
=======
    if (timeWindow==="peak") return [
      { label:"Active incidents",      value:"14",      note:"Peak hours have higher disruption risk.",          icon:"⚠️" },
      { label:"Stations with outages", value:"9",       note:"Elevator/escalator outages impact accessibility.", icon:"🛗" },
      { label:"Avg delay risk",        value:"Med",     note:"Computed from demo scoring model.",                icon:"📊" },
      { label:"Most affected zone",    value:"Midtown", note:"High ridership + complex transfers.",              icon:"📍" },
    ];
    if (timeWindow==="offpeak") return [
      { label:"Active incidents",      value:"6",     note:"Off-peak typically improves stability.",          icon:"⚠️" },
      { label:"Stations with outages", value:"5",     note:"Outages still matter for step-free routes.",      icon:"🛗" },
      { label:"Avg delay risk",        value:"Low",   note:"Lower crowding reduces propagation.",             icon:"📊" },
      { label:"Most affected zone",    value:"Dtown", note:"Transfers can still create delays.",              icon:"📍" },
    ];
    return [
      { label:"Active incidents",      value:"4",      note:"Late night: planned work can appear.",       icon:"⚠️" },
      { label:"Stations with outages", value:"3",      note:"Some stations close entrances late night.",  icon:"🛗" },
      { label:"Avg delay risk",        value:"L–M",    note:"Depends on maintenance windows.",           icon:"📊" },
      { label:"Most affected zone",    value:"Tracks", note:"Scheduled maintenance is common.",         icon:"📍" },
>>>>>>> 3b2721e5055772c6e4d92bd61fd7854c779af0b4
    ];
  }, [timeWindow]);

  const top10 = useMemo(() => {
<<<<<<< HEAD
    // Demo top 10 list (later: compute from outage history / alerts)
    const list = [
      { station: "Times Sq - 42 St", level: "High", reason: "Crowding + multi-line transfers" },
      { station: "Grand Central - 42 St", level: "High", reason: "Heavy commuter volume" },
      { station: "Union Sq - 14 St", level: "Medium", reason: "Transfer congestion" },
      { station: "34 St - Penn Station", level: "Medium", reason: "Peak surges + platform constraints" },
      { station: "Fulton St", level: "Medium", reason: "Complex transfers" },
      { station: "Herald Sq", level: "Medium", reason: "Crowding + escalator outages (demo)" },
      { station: "Atlantic Av - Barclays Ctr", level: "Low", reason: "Mostly stable outside peak" },
      { station: "Jackson Hts - Roosevelt Av", level: "Low", reason: "Occasional delays from track work" },
      { station: "Flushing - Main St", level: "Low", reason: "Crowding varies by time" },
      { station: "59 St - Columbus Circle", level: "Low", reason: "Generally stable routes" },
    ];

    // small demo tweak by time window
    if (timeWindow === "offpeak") {
      return list.map((x) => (x.level === "High" ? { ...x, level: "Medium" } : x));
    }
    if (timeWindow === "late") {
      return list.map((x) => (x.level === "Medium" ? { ...x, level: "Low" } : x));
    }
    return list;
  }, [timeWindow]);

  return (
    <div className="min-h-screen bg-ink">
      <header className="bg-ink border-b border-ink-line">
        <div className="max-w-5xl mx-auto px-4 py-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-white">Delay Insights</h1>
              <p className="text-slate-300 mt-1">
                Dashboard-style view of delay risk hotspots (demo UI).
              </p>
            </div>

            <button
              onClick={() => navigate("/")}
              className="shrink-0 px-4 py-2 rounded-xl bg-white/5 text-slate-200 border border-white/10
                         hover:bg-signal/15 hover:text-signal hover:border-signal/30 text-sm font-semibold transition
                         focus:outline-none focus:ring-2 focus:ring-signal"
            >
              Back to Home
            </button>
          </div>

          <div className="mt-5">
            <label className="block text-sm font-medium text-slate-200 mb-2">Time window</label>
            <select
              value={timeWindow}
              onChange={(e) => setTimeWindow(e.target.value)}
              className="w-full sm:w-72 rounded-xl border border-ink-line bg-ink/40 px-4 py-3 text-white
                         focus:outline-none focus:ring-2 focus:ring-signal focus:border-signal"
            >
              <option value="peak">Peak hours</option>
              <option value="offpeak">Off-peak</option>
              <option value="late">Late night</option>
            </select>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8 space-y-6">
        {/* KPI row */}
        <section className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {kpis.map((k) => (
            <KPICard key={k.label} label={k.label} value={k.value} note={k.note} />
          ))}
        </section>

        {/* Top 10 risk list */}
        <section className="bg-ink-panel rounded-2xl border border-ink-line p-6">
          <div className="flex items-end justify-between">
            <div>
              <h2 className="text-lg font-semibold text-white">Top 10 risk stations</h2>
              <p className="text-sm text-slate-300 mt-1">
                Ranked using demo scoring (later: AWS outage history + alerts).
              </p>
            </div>
            <span className="text-sm text-slate-400">Mode: Demo</span>
          </div>

          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-sm text-slate-300">
                  <th className="py-2 pr-3">Rank</th>
                  <th className="py-2 pr-3">Station</th>
                  <th className="py-2 pr-3">Risk</th>
                  <th className="py-2">Reason</th>
                </tr>
              </thead>
              <tbody>
                {top10.map((s, idx) => (
                  <tr key={`${s.station}-${idx}`} className="border-t border-ink-line/60">
                    <td className="py-3 pr-3 text-slate-200 font-semibold">#{idx + 1}</td>
                    <td className="py-3 pr-3 text-white">{s.station}</td>
                    <td className="py-3 pr-3">
                      <RiskBadge level={s.level} />
                    </td>
                    <td className="py-3 text-slate-200">{s.reason}</td>
=======
    if (timeWindow==="offpeak") return ALL_TOP10.map(x => x.level==="High"   ? {...x, level:"Medium"} : x);
    if (timeWindow==="late")    return ALL_TOP10.map(x => x.level==="Medium" ? {...x, level:"Low"}    : x);
    return ALL_TOP10;
  }, [timeWindow]);

  return (
    <div className="di-page">
      <InjectCSS />
      <div className="di-stripe" />

      {/* ── Nav ── */}
      <nav className="di-nav">
        <div className="di-wrap" style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"14px 20px" }}>
          <div style={{ display:"flex", alignItems:"center", gap:12 }}>
            <div style={{ width:36, height:36, borderRadius:"50%", background:"var(--orange)", display:"flex", alignItems:"center", justifyContent:"center" }}>
              <span className="di-display" style={{ fontSize:16, color:"#fff" }}>M</span>
            </div>
            <div>
              <div className="di-display" style={{ fontSize:20, letterSpacing:"0.06em" }}>DELAY INSIGHTS</div>
              <div style={{ fontSize:10, color:"var(--text-subtle)", letterSpacing:"0.1em", textTransform:"uppercase" }}>Risk dashboard — demo</div>
            </div>
          </div>
          <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
            {[["🗺 Map","/map"],["🗺 Route","/route-planner"],["☰ Stations","/stations"]].map(([l,p])=>(
              <button key={p} onClick={()=>navigate(p)} className="di-btn di-btn-ghost" style={{ padding:"7px 12px", fontSize:12 }}>{l}</button>
            ))}
            <button onClick={() => navigate("/")} className="di-btn di-btn-ghost" style={{ fontSize:12 }}>← Home</button>
          </div>
        </div>
      </nav>

      {/* ── Time window toggle ── */}
      <div className="di-wrap" style={{ padding:"24px 20px 0" }}>
        <div style={{ display:"flex", gap:2, background:"var(--surface2)", borderRadius:"var(--r)", padding:3, width:"fit-content", border:"1px solid var(--border)" }}>
          {TWS.map(tw => (
            <button key={tw.value} onClick={() => setTimeWindow(tw.value)} style={{
              padding:"6px 18px", borderRadius:8, fontSize:12, fontWeight:600, cursor:"pointer", border:"none", transition:"all .15s",
              background: timeWindow===tw.value ? "var(--orange)" : "transparent",
              color:      timeWindow===tw.value ? "#fff" : "var(--text-muted)",
            }}>{tw.label}</button>
          ))}
        </div>
      </div>

      {/* ── Main ── */}
      <main className="di-wrap" style={{ padding:"24px 20px 48px", flex:1, display:"flex", flexDirection:"column", gap:24 }}>

        {/* KPI grid */}
        <section style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(200px, 1fr))", gap:12 }}>
          {kpis.map((k,i) => <KPICard key={k.label} {...k} delay={i*0.06}/>)}
        </section>

        {/* Hotspots table */}
        <section className="di-card di-fu di-fu2">
          <div style={{ padding:"20px 20px 0", display:"flex", alignItems:"flex-start", justifyContent:"space-between" }}>
            <div>
              <div className="di-eyebrow" style={{ marginBottom:4 }}>Risk stations</div>
              <div style={{ fontWeight:700, fontSize:16 }}>Top 10 Delay Hotspots</div>
              <div style={{ fontSize:12, color:"var(--text-muted)", marginTop:4 }}>
                Ranked by demo scoring model · {timeWindow==="peak" ? "Peak hours" : timeWindow==="offpeak" ? "Off-peak" : "Late night"}
              </div>
            </div>
            <span className="di-badge b-orange" style={{ fontSize:10, marginTop:4 }}>DEMO</span>
          </div>

          <div style={{ overflowX:"auto", marginTop:16 }}>
            <table style={{ width:"100%", borderCollapse:"collapse" }}>
              <thead>
                <tr style={{ borderBottom:"1px solid var(--border)" }}>
                  {["#","Station","Risk level","Reason"].map(h=>(
                    <th key={h} style={{ padding:"8px 16px 10px", textAlign:"left", fontSize:10, fontWeight:700, color:"var(--text-subtle)", letterSpacing:"0.1em", textTransform:"uppercase", whiteSpace:"nowrap" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {top10.map((s,idx) => (
                  <tr key={`${s.station}-${idx}`}
                    style={{ borderBottom:"1px solid var(--border)", transition:"background .1s" }}
                    onMouseEnter={e => e.currentTarget.style.background="var(--surface2)"}
                    onMouseLeave={e => e.currentTarget.style.background="transparent"}
                  >
                    <td style={{ padding:"13px 16px" }}>
                      <div className="di-mono" style={{ fontSize:11, color:"var(--text-subtle)", width:24 }}>{String(idx+1).padStart(2,"0")}</div>
                    </td>
                    <td style={{ padding:"13px 16px" }}>
                      <div style={{ fontWeight:600, fontSize:13 }}>{s.station}</div>
                    </td>
                    <td style={{ padding:"13px 16px", minWidth:160 }}>
                      <RiskBar level={s.level}/>
                    </td>
                    <td style={{ padding:"13px 16px" }}>
                      <div style={{ fontSize:12, color:"var(--text-muted)" }}>{s.reason}</div>
                    </td>
>>>>>>> 3b2721e5055772c6e4d92bd61fd7854c779af0b4
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

<<<<<<< HEAD
          <div className="mt-4 text-xs text-slate-400">
            Next step: connect this table to real station IDs and compute risk from outage frequency and time-of-day.
=======
          <div style={{ padding:"14px 20px 20px" }}>
            <div style={{ fontSize:11, color:"var(--text-subtle)", lineHeight:1.6 }}>
              Demo data only — connect to real station IDs and compute risk from outage frequency and time-of-day patterns.
            </div>
>>>>>>> 3b2721e5055772c6e4d92bd61fd7854c779af0b4
          </div>
        </section>
      </main>

<<<<<<< HEAD
      <footer className="border-t border-ink-line bg-ink">
        <div className="max-w-5xl mx-auto px-4 py-6 text-sm text-slate-400">
          Delay Insights — UI upgrade: KPI cards + Top 10 risk list.
=======
      {/* ── Chatbot ── */}
      <ChatBot />

      {/* ── Footer ── */}
      <footer style={{ background:"var(--surface2)", borderTop:"2px solid var(--orange)" }}>
        {/* Orange top bar */}
        <div style={{ background:"var(--orange)", padding:"10px 20px" }}>
          <div className="di-wrap" style={{ display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:8 }}>
            <div style={{ display:"flex", alignItems:"center", gap:10 }}>
              <div style={{ width:28, height:28, borderRadius:"50%", background:"rgba(255,255,255,.2)", display:"flex", alignItems:"center", justifyContent:"center", border:"1.5px solid rgba(255,255,255,.4)" }}>
                <span className="di-display" style={{ fontSize:13, color:"#fff" }}>M</span>
              </div>
              <span className="di-display" style={{ fontSize:14, color:"#fff", letterSpacing:"0.1em" }}>MTA TRANSIT STATUS</span>
            </div>
            <div style={{ display:"flex", gap:16, flexWrap:"wrap" }}>
              {FOOTER_LINKS.map(([label,path]) => (
                <a key={path} href={path} style={{ fontSize:11, color:"rgba(255,255,255,.85)", textDecoration:"none", fontWeight:600, letterSpacing:"0.06em", textTransform:"uppercase" }}>{label}</a>
              ))}
            </div>
          </div>
        </div>
        {/* Info bar */}
        <div style={{ padding:"14px 20px" }}>
          <div className="di-wrap" style={{ display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:10 }}>
            <div style={{ display:"flex", gap:20, flexWrap:"wrap" }}>
              {[["Platform","React · AWS Serverless"],["Data","MTA Open API"],["Coverage","NYC Subway"]].map(([label,value])=>(
                <div key={label}>
                  <div style={{ fontSize:10, color:"var(--text-subtle)", letterSpacing:"0.1em", textTransform:"uppercase", marginBottom:3 }}>{label}</div>
                  <div className="di-mono" style={{ fontSize:12, color:"var(--text-muted)", fontWeight:600 }}>{value}</div>
                </div>
              ))}
            </div>
            <div style={{ display:"flex", alignItems:"center", gap:6 }}>
              <span style={{ width:7, height:7, borderRadius:"50%", background:"var(--green)", display:"inline-block", boxShadow:"0 0 6px var(--green)" }}/>
              <span style={{ fontSize:11, color:"var(--text-muted)", fontWeight:600 }}>Systems Operational</span>
            </div>
          </div>
          <div className="di-wrap" style={{ borderTop:"1px solid var(--border)", marginTop:12, paddingTop:12 }}>
            <div style={{ fontSize:10, color:"var(--text-subtle)", lineHeight:1.6 }}>
              © {new Date().getFullYear()} MTA Transit Status Platform · Real-time elevator &amp; escalator data · For informational use only · Not an official MTA product
            </div>
          </div>
>>>>>>> 3b2721e5055772c6e4d92bd61fd7854c779af0b4
        </div>
      </footer>
    </div>
  );
<<<<<<< HEAD
}
=======
}
>>>>>>> 3b2721e5055772c6e4d92bd61fd7854c779af0b4
