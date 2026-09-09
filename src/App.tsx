import { useState, useRef, useEffect } from "react";

type Msg = { r: "bot" | "user"; t: string };

const API_BASE = import.meta.env.VITE_API_BASE_URL as string;

export default function App() {
  const [m, setM] = useState<Msg[]>([{ r: "bot", t: "Pythagon v0.1 online. Ketik pesan untuk memulai." }]);
  const [i, setI] = useState("");
  const [l, setL] = useState(false);
  const [sid, setSid] = useState("");
  const ref = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    ref.current?.scrollIntoView({ behavior: "smooth" });
  }, [m, l]);

  useEffect(() => {
    fetch(`${API_BASE}/session`, { method: "POST" })
      .then((r) => r.json())
      .then((d) => setSid(d.sessionId));
    inputRef.current?.focus();
  }, []);

  const send = async () => {
    if (!i || !sid) return;
    setM((prev) => [...prev, { r: "user", t: i }]);
    const q = i;
    setI("");
    setL(true);
    const res = await fetch(`${API_BASE}/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: q, userId: sid }),
    });
    const d = await res.json();
    setM((prev) => [...prev, { r: "bot", t: d.reply || "error: no response" }]);
    setL(false);
  };

  return (
    <div style={styles.page}>
      <div style={styles.terminal}>
        <div style={styles.titlebar}>
          <div style={styles.dots}>
            <span style={{ ...styles.dot, background: "#ff5f56" }} />
            <span style={{ ...styles.dot, background: "#ffbd2e" }} />
            <span style={{ ...styles.dot, background: "#27c93f" }} />
          </div>
          <div style={styles.titleText}>pythagon@0.1 — chat</div>
        </div>

        <div style={styles.screen}>
          {m.map((x, k) => (
            <div key={k} style={styles.line}>
              <span style={{ color: x.r === "user" ? "#00e5ff" : "#39ff14" }}>
                {x.r === "user" ? "you>" : "ai>"}
              </span>{" "}
              <span style={styles.text}>{x.t}</span>
            </div>
          ))}
          {l && (
            <div style={styles.line}>
              <span style={{ color: "#39ff14" }}>ai&gt;</span>{" "}
              <span style={styles.cursor}>▊</span>
            </div>
          )}
          <div ref={ref} />
        </div>

        <div style={styles.inputRow}>
          <span style={{ color: "#00e5ff" }}>you&gt;</span>
          <input
            ref={inputRef}
            value={i}
            onChange={(e) => setI(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send()}
            placeholder="ketik pesan..."
            style={styles.input}
            autoComplete="off"
            spellCheck={false}
          />
        </div>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    width: "100%",
    height: "100vh",
    background: "#050505",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: "'JetBrains Mono', 'Courier New', monospace",
  },
  terminal: {
    width: "100%",
    maxWidth: 720,
    height: "88vh",
    maxHeight: 820,
    background: "#0a0e0a",
    border: "1px solid #1a3d1a",
    borderRadius: 8,
    boxShadow: "0 0 24px rgba(57,255,20,0.12), 0 0 2px rgba(57,255,20,0.4)",
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
  },
  titlebar: {
    height: 36,
    background: "#111511",
    borderBottom: "1px solid #1a3d1a",
    display: "flex",
    alignItems: "center",
    padding: "0 12px",
    gap: 12,
  },
  dots: { display: "flex", gap: 6 },
  dot: { width: 10, height: 10, borderRadius: "50%", opacity: 0.8 },
  titleText: { color: "#4a7a4a", fontSize: 12, letterSpacing: 0.5 },
  screen: {
    flex: 1,
    padding: 16,
    overflowY: "auto",
    display: "flex",
    flexDirection: "column",
    gap: 6,
  },
  line: {
    fontSize: 14,
    lineHeight: 1.6,
    wordBreak: "break-word",
    whiteSpace: "pre-wrap",
  },
  text: { color: "#c8ffc8" },
  cursor: { color: "#39ff14", animation: "blink 1s step-end infinite" },
  inputRow: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    padding: "12px 16px",
    borderTop: "1px solid #1a3d1a",
    background: "#0a0e0a",
  },
  input: {
    flex: 1,
    background: "transparent",
    border: "none",
    outline: "none",
    color: "#c8ffc8",
    fontFamily: "inherit",
    fontSize: 14,
    caretColor: "#39ff14",
  },
};
