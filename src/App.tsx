import { useState, useRef, useEffect } from "react";

type Msg = { r: "bot" | "user"; t: string };

const API_BASE = import.meta.env.VITE_API_BASE_URL as string;
const SESSION_KEY = "pythagon_session_id";

export default function App() {
  const [m, setM] = useState<Msg[]>([
    { r: "bot", t: "Halo, saya Pythagon 0.1. Ketik pesan untuk memulai." },
  ]);
  const [i, setI] = useState("");
  const [l, setL] = useState(false);
  const [sid, setSid] = useState("");
  const [showHistory, setShowHistory] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [historyData, setHistoryData] = useState<Msg[]>([]);
  const [statusData, setStatusData] = useState<{ vocabSize: number; intents: string[] } | null>(null);

  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [m, l]);

  useEffect(() => {
    const existing = localStorage.getItem(SESSION_KEY);
    if (existing) {
      setSid(existing);
    } else {
      startNewSession();
    }
    inputRef.current?.focus();
  }, []);

  const startNewSession = async () => {
    const res = await fetch(`${API_BASE}/session`, { method: "POST" });
    const d = await res.json();
    localStorage.setItem(SESSION_KEY, d.sessionId);
    setSid(d.sessionId);
    setM([{ r: "bot", t: "Halo, saya Pythagon 0.1. Ketik pesan untuk memulai." }]);
  };

  const send = async () => {
    if (!i.trim() || !sid || l) return;
    const q = i.trim();
    setM((prev) => [...prev, { r: "user", t: q }]);
    setI("");
    setL(true);
    try {
      const res = await fetch(`${API_BASE}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: q, userId: sid }),
      });
      const d = await res.json();
      setM((prev) => [...prev, { r: "bot", t: d.reply || "Maaf, tidak ada balasan." }]);
    } catch (err) {
      setM((prev) => [...prev, { r: "bot", t: "Gagal terhubung ke server." }]);
    }
    setL(false);
  };

  const openHistory = async () => {
    if (!sid) return;
    const res = await fetch(`${API_BASE}/history/${sid}`);
    const d = await res.json();
    setHistoryData(d);
    setShowHistory(true);
  };

  const openInfo = async () => {
    const res = await fetch(`${API_BASE}/status`);
    const d = await res.json();
    setStatusData(d);
    setShowInfo(true);
  };

  return (
    <div style={s.page}>
      <div style={s.navbar}>
        <div style={s.navTitle}>Pythagon <span style={s.navVersion}>0.1</span></div>
        <div style={s.navActions}>
          <button style={s.iconBtn} onClick={startNewSession} title="New Chat">
            <PlusIcon />
          </button>
          <button style={s.iconBtn} onClick={openHistory} title="History">
            <ClockIcon />
          </button>
          <button style={s.iconBtn} onClick={openInfo} title="Personality">
            <InfoIcon />
          </button>
        </div>
      </div>

      <div style={s.chatArea}>
        {m.map((x, k) => (
          <div key={k} style={{ ...s.msgRow, justifyContent: x.r === "user" ? "flex-end" : "flex-start" }}>
            <div style={x.r === "user" ? s.userBubble : s.botText}>{x.t}</div>
          </div>
        ))}
        {l && (
          <div style={{ ...s.msgRow, justifyContent: "flex-start" }}>
            <div style={s.botText}>
              <TypingDots />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div style={s.inputBar}>
        <input
          ref={inputRef}
          value={i}
          onChange={(e) => setI(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder="Ketik pesan..."
          style={s.input}
          autoComplete="off"
        />
        <button style={s.sendBtn} onClick={send} disabled={!i.trim() || l}>
          <SendIcon />
        </button>
      </div>

      {showHistory && (
        <Modal title="Riwayat Chat" onClose={() => setShowHistory(false)}>
          {historyData.length === 0 ? (
            <p style={s.modalText}>Belum ada riwayat.</p>
          ) : (
            historyData.map((x, k) => (
              <div key={k} style={s.historyLine}>
                <b style={{ color: x.r === "user" ? "#7aa2ff" : "#7affa2" }}>{x.r === "user" ? "Kamu" : "Pythagon"}:</b>{" "}
                {x.t}
              </div>
            ))
          )}
        </Modal>
      )}

      {showInfo && statusData && (
        <Modal title="Tentang Pythagon" onClose={() => setShowInfo(false)}>
          <p style={s.modalText}>Model: Pythagon 0.1 (Multi-Layer Perceptron)</p>
          <p style={s.modalText}>Ukuran kosakata: {statusData.vocabSize} kata</p>
          <p style={s.modalText}>Kemampuan (intent):</p>
          <ul style={s.modalList}>
            {statusData.intents.map((it) => (
              <li key={it}>{it}</li>
            ))}
          </ul>
        </Modal>
      )}
    </div>
  );
}

function Modal({ title, children, onClose }: { title: string; children: React.ReactNode; onClose: () => void }) {
  return (
    <div style={s.overlay} onClick={onClose}>
      <div style={s.modal} onClick={(e) => e.stopPropagation()}>
        <div style={s.modalHeader}>
          <span>{title}</span>
          <button style={s.closeBtn} onClick={onClose}>✕</button>
        </div>
        <div style={s.modalBody}>{children}</div>
      </div>
    </div>
  );
}

function TypingDots() {
  return <span style={{ opacity: 0.6 }}>Pythagon sedang mengetik...</span>;
}

function PlusIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}
function ClockIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 3" />
    </svg>
  );
}
function InfoIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="9" />
      <line x1="12" y1="16" x2="12" y2="11" />
      <circle cx="12" cy="8" r="0.5" fill="currentColor" />
    </svg>
  );
}
function SendIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M2 21l21-9L2 3v7l15 2-15 2v7z" />
    </svg>
  );
}

const s: Record<string, React.CSSProperties> = {
  page: {
    width: "100%",
    height: "100vh",
    background: "#131313",
    color: "#e8e8e8",
    display: "flex",
    flexDirection: "column",
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  },
  navbar: {
    height: 52,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0 16px",
    borderBottom: "1px solid #232323",
    flexShrink: 0,
  },
  navTitle: { fontSize: 16, fontWeight: 600 },
  navVersion: { color: "#8a8a8a", fontWeight: 400 },
  navActions: { display: "flex", gap: 4 },
  iconBtn: {
    background: "none",
    border: "none",
    color: "#b0b0b0",
    padding: 8,
    borderRadius: 8,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  chatArea: {
    flex: 1,
    overflowY: "auto",
    padding: "16px 12px",
    display: "flex",
    flexDirection: "column",
    gap: 14,
  },
  msgRow: { display: "flex", width: "100%" },
  userBubble: {
    background: "#2b3a55",
    color: "#e8e8e8",
    padding: "10px 14px",
    borderRadius: 16,
    maxWidth: "78%",
    fontSize: 15,
    lineHeight: 1.5,
    whiteSpace: "pre-wrap",
    wordBreak: "break-word",
  },
  botText: {
    color: "#e8e8e8",
    padding: "2px 4px",
    maxWidth: "88%",
    fontSize: 15,
    lineHeight: 1.6,
    whiteSpace: "pre-wrap",
    wordBreak: "break-word",
  },
  inputBar: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    padding: "10px 12px",
    borderTop: "1px solid #232323",
    flexShrink: 0,
  },
  input: {
    flex: 1,
    background: "#1e1e1e",
    border: "1px solid #2e2e2e",
    borderRadius: 20,
    padding: "10px 16px",
    color: "#e8e8e8",
    fontSize: 15,
    outline: "none",
  },
  sendBtn: {
    background: "#4f7fff",
    border: "none",
    color: "white",
    width: 38,
    height: 38,
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    flexShrink: 0,
  },
  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.6)",
    display: "flex",
    alignItems: "flex-end",
    justifyContent: "center",
    zIndex: 10,
  },
  modal: {
    background: "#1a1a1a",
    borderRadius: "16px 16px 0 0",
    width: "100%",
    maxWidth: 480,
    maxHeight: "70vh",
    display: "flex",
    flexDirection: "column",
    border: "1px solid #2e2e2e",
    borderBottom: "none",
  },
  modalHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "14px 16px",
    borderBottom: "1px solid #2e2e2e",
    fontWeight: 600,
  },
  closeBtn: { background: "none", border: "none", color: "#b0b0b0", fontSize: 16, cursor: "pointer" },
  modalBody: { padding: 16, overflowY: "auto" },
  modalText: { fontSize: 14, color: "#c8c8c8", margin: "4px 0" },
  modalList: { fontSize: 14, color: "#c8c8c8", paddingLeft: 20 },
  historyLine: { fontSize: 14, color: "#c8c8c8", marginBottom: 8, lineHeight: 1.5 },
};
