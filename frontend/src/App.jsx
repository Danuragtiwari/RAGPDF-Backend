import { useState, useRef, useEffect } from "react";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8000";

// ── Icons ────────────────────────────────────────────────────────────────────
const UploadIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
    <polyline points="17 8 12 3 7 8"/>
    <line x1="12" y1="3" x2="12" y2="15"/>
  </svg>
);

const TrashIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="3 6 5 6 21 6"/>
    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
    <path d="M10 11v6M14 11v6"/>
  </svg>
);

const SendIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="22" y1="2" x2="11" y2="13"/>
    <polygon points="22 2 15 22 11 13 2 9 22 2"/>
  </svg>
);

const FileIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
    <polyline points="14 2 14 8 20 8"/>
  </svg>
);

const BotIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="11" width="18" height="10" rx="2"/>
    <circle cx="12" cy="5" r="2"/>
    <path d="M12 7v4"/>
    <line x1="8" y1="16" x2="8" y2="16"/>
    <line x1="16" y1="16" x2="16" y2="16"/>
  </svg>
);

const UserIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
    <circle cx="12" cy="7" r="4"/>
  </svg>
);

const ChevronIcon = ({ open }) => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
    style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s" }}>
    <polyline points="6 9 12 15 18 9"/>
  </svg>
);

// ── Styles ───────────────────────────────────────────────────────────────────
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Mono:ital,wght@0,300;0,400;1,300&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --bg: #0a0a0f;
    --surface: #12121a;
    --surface2: #1a1a26;
    --surface3: #222232;
    --border: #2a2a3e;
    --accent: #7c6af7;
    --accent2: #f7a26a;
    --accent3: #6af7d4;
    --text: #e8e8f0;
    --text2: #9898b0;
    --text3: #5a5a78;
    --rag: #6af7d4;
    --normal: #f7a26a;
    --danger: #f76a6a;
  }

  body {
    font-family: 'Syne', sans-serif;
    background: var(--bg);
    color: var(--text);
    height: 100vh;
    overflow: hidden;
  }

  .app {
    display: grid;
    grid-template-columns: 300px 1fr;
    height: 100vh;
    position: relative;
  }

  /* ── Sidebar ── */
  .sidebar {
    background: var(--surface);
    border-right: 1px solid var(--border);
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  .sidebar-header {
    padding: 24px 20px 16px;
    border-bottom: 1px solid var(--border);
  }

  .logo {
    font-size: 20px;
    font-weight: 800;
    letter-spacing: -0.5px;
    background: linear-gradient(135deg, var(--accent) 0%, var(--accent3) 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    margin-bottom: 4px;
  }

  .logo-sub {
    font-size: 11px;
    font-family: 'DM Mono', monospace;
    color: var(--text3);
    letter-spacing: 0.05em;
  }

  .upload-zone {
    margin: 16px;
    border: 1.5px dashed var(--border);
    border-radius: 12px;
    padding: 20px 16px;
    text-align: center;
    cursor: pointer;
    transition: all 0.2s;
    position: relative;
    overflow: hidden;
  }

  .upload-zone:hover, .upload-zone.drag-over {
    border-color: var(--accent);
    background: rgba(124, 106, 247, 0.05);
  }

  .upload-zone input {
    position: absolute;
    inset: 0;
    opacity: 0;
    cursor: pointer;
    width: 100%;
    height: 100%;
  }

  .upload-icon-wrap {
    width: 40px;
    height: 40px;
    background: rgba(124, 106, 247, 0.12);
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 10px;
    color: var(--accent);
  }

  .upload-title {
    font-size: 13px;
    font-weight: 600;
    color: var(--text);
    margin-bottom: 3px;
  }

  .upload-sub {
    font-size: 11px;
    font-family: 'DM Mono', monospace;
    color: var(--text3);
  }

  .uploading-bar {
    margin: 8px 0 0;
    height: 3px;
    background: var(--surface3);
    border-radius: 99px;
    overflow: hidden;
  }

  .uploading-bar-fill {
    height: 100%;
    background: linear-gradient(90deg, var(--accent), var(--accent3));
    border-radius: 99px;
    animation: shimmer 1.2s infinite;
  }

  @keyframes shimmer {
    0% { width: 0%; margin-left: 0; }
    50% { width: 60%; margin-left: 20%; }
    100% { width: 0%; margin-left: 100%; }
  }

  .pdfs-section {
    flex: 1;
    overflow-y: auto;
    padding: 8px 12px 16px;
  }

  .pdfs-title {
    font-size: 10px;
    font-family: 'DM Mono', monospace;
    color: var(--text3);
    letter-spacing: 0.1em;
    text-transform: uppercase;
    padding: 8px 8px 10px;
  }

  .pdf-card {
    border-radius: 10px;
    border: 1px solid var(--border);
    margin-bottom: 6px;
    overflow: hidden;
    transition: border-color 0.2s;
  }

  .pdf-card.active {
    border-color: var(--accent);
    background: rgba(124, 106, 247, 0.04);
  }

  .pdf-card-header {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 12px;
    cursor: pointer;
  }

  .pdf-icon {
    color: var(--accent);
    flex-shrink: 0;
  }

  .pdf-name {
    flex: 1;
    font-size: 12px;
    font-weight: 600;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    color: var(--text);
  }

  .pdf-meta {
    font-family: 'DM Mono', monospace;
    font-size: 10px;
    color: var(--text3);
    padding: 0 12px 8px;
  }

  .pdf-actions {
    display: flex;
    gap: 6px;
    padding: 0 12px 10px;
  }

  .btn-use {
    flex: 1;
    padding: 6px 10px;
    border-radius: 7px;
    font-size: 11px;
    font-weight: 600;
    font-family: 'Syne', sans-serif;
    border: none;
    cursor: pointer;
    background: var(--accent);
    color: white;
    transition: opacity 0.2s;
  }

  .btn-use:hover { opacity: 0.85; }

  .btn-use.active {
    background: var(--accent3);
    color: var(--bg);
  }

  .btn-delete {
    padding: 6px 8px;
    border-radius: 7px;
    border: 1px solid var(--border);
    background: transparent;
    color: var(--danger);
    cursor: pointer;
    transition: all 0.2s;
    display: flex;
    align-items: center;
  }

  .btn-delete:hover {
    background: rgba(247, 106, 106, 0.1);
    border-color: var(--danger);
  }

  .mode-badge {
    margin: 0 12px 16px;
    padding: 8px 12px;
    border-radius: 8px;
    font-size: 11px;
    font-family: 'DM Mono', monospace;
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .mode-badge.rag {
    background: rgba(106, 247, 212, 0.08);
    border: 1px solid rgba(106, 247, 212, 0.2);
    color: var(--rag);
  }

  .mode-badge.normal {
    background: rgba(247, 162, 106, 0.08);
    border: 1px solid rgba(247, 162, 106, 0.2);
    color: var(--normal);
  }

  .mode-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    flex-shrink: 0;
  }

  .mode-badge.rag .mode-dot { background: var(--rag); }
  .mode-badge.normal .mode-dot { background: var(--normal); }

  /* ── Chat Area ── */
  .chat-area {
    display: flex;
    flex-direction: column;
    background: var(--bg);
    position: relative;
  }

  .chat-header {
    padding: 18px 28px;
    border-bottom: 1px solid var(--border);
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .chat-title {
    font-size: 15px;
    font-weight: 700;
  }

  .chat-subtitle {
    font-size: 11px;
    font-family: 'DM Mono', monospace;
    color: var(--text3);
    margin-top: 2px;
  }

  .messages {
    flex: 1;
    overflow-y: auto;
    padding: 24px 28px;
    display: flex;
    flex-direction: column;
    gap: 20px;
    scroll-behavior: smooth;
  }

  .messages::-webkit-scrollbar { width: 4px; }
  .messages::-webkit-scrollbar-track { background: transparent; }
  .messages::-webkit-scrollbar-thumb { background: var(--border); border-radius: 99px; }

  .empty-state {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 12px;
    color: var(--text3);
    text-align: center;
    padding: 40px;
  }

  .empty-icon {
    font-size: 48px;
    opacity: 0.3;
  }

  .empty-title {
    font-size: 16px;
    font-weight: 700;
    color: var(--text2);
  }

  .empty-sub {
    font-size: 12px;
    font-family: 'DM Mono', monospace;
    max-width: 300px;
    line-height: 1.6;
  }

  .message {
    display: flex;
    gap: 12px;
    animation: fadeUp 0.3s ease;
  }

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(8px); }
    to { opacity: 1; transform: translateY(0); }
  }

  .message.user { flex-direction: row-reverse; }

  .avatar {
    width: 32px;
    height: 32px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .avatar.bot {
    background: rgba(124, 106, 247, 0.15);
    color: var(--accent);
    border: 1px solid rgba(124, 106, 247, 0.2);
  }

  .avatar.user {
    background: rgba(247, 162, 106, 0.15);
    color: var(--accent2);
    border: 1px solid rgba(247, 162, 106, 0.2);
  }

  .message-content { max-width: 70%; }

  .message-bubble {
    padding: 12px 16px;
    border-radius: 12px;
    font-size: 14px;
    line-height: 1.65;
  }

  .message.bot .message-bubble {
    background: var(--surface);
    border: 1px solid var(--border);
    color: var(--text);
    border-radius: 4px 12px 12px 12px;
  }

  .message.user .message-bubble {
    background: var(--accent);
    color: white;
    border-radius: 12px 4px 12px 12px;
  }

  .message-meta {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-top: 5px;
    padding: 0 4px;
  }

  .message.user .message-meta { justify-content: flex-end; }

  .msg-mode {
    font-size: 10px;
    font-family: 'DM Mono', monospace;
    padding: 2px 6px;
    border-radius: 4px;
  }

  .msg-mode.rag {
    background: rgba(106, 247, 212, 0.1);
    color: var(--rag);
  }

  .msg-mode.normal {
    background: rgba(247, 162, 106, 0.1);
    color: var(--normal);
  }

  .sources-toggle {
    font-size: 10px;
    font-family: 'DM Mono', monospace;
    color: var(--text3);
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 3px;
    background: none;
    border: none;
    padding: 0;
  }

  .sources-toggle:hover { color: var(--text2); }

  .sources-box {
    margin-top: 8px;
    background: var(--surface2);
    border: 1px solid var(--border);
    border-radius: 8px;
    padding: 10px 12px;
    font-size: 11px;
    font-family: 'DM Mono', monospace;
    color: var(--text3);
    line-height: 1.6;
    max-height: 120px;
    overflow-y: auto;
  }

  .sources-label {
    font-size: 10px;
    color: var(--rag);
    margin-bottom: 6px;
    font-weight: 600;
  }

  .source-chunk {
    border-left: 2px solid var(--border);
    padding-left: 8px;
    margin-bottom: 8px;
    white-space: pre-wrap;
    word-break: break-word;
  }

  /* Typing indicator */
  .typing {
    display: flex;
    gap: 4px;
    padding: 14px 16px;
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 4px 12px 12px 12px;
    width: fit-content;
  }

  .typing span {
    width: 7px;
    height: 7px;
    background: var(--text3);
    border-radius: 50%;
    animation: bounce 1.2s infinite;
  }

  .typing span:nth-child(2) { animation-delay: 0.2s; }
  .typing span:nth-child(3) { animation-delay: 0.4s; }

  @keyframes bounce {
    0%, 60%, 100% { transform: translateY(0); }
    30% { transform: translateY(-6px); }
  }

  /* Input */
  .input-area {
    padding: 16px 28px 20px;
    border-top: 1px solid var(--border);
    background: var(--bg);
  }

  .input-wrap {
    display: flex;
    gap: 10px;
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 14px;
    padding: 10px 10px 10px 16px;
    transition: border-color 0.2s;
  }

  .input-wrap:focus-within { border-color: var(--accent); }

  .input-wrap textarea {
    flex: 1;
    background: none;
    border: none;
    outline: none;
    color: var(--text);
    font-family: 'Syne', sans-serif;
    font-size: 14px;
    resize: none;
    max-height: 120px;
    line-height: 1.5;
  }

  .input-wrap textarea::placeholder { color: var(--text3); }

  .send-btn {
    width: 38px;
    height: 38px;
    border-radius: 10px;
    border: none;
    background: var(--accent);
    color: white;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    transition: all 0.2s;
    align-self: flex-end;
  }

  .send-btn:hover { background: #6a58e0; transform: scale(1.05); }
  .send-btn:disabled { opacity: 0.4; cursor: not-allowed; transform: none; }

  .input-hint {
    font-size: 10px;
    font-family: 'DM Mono', monospace;
    color: var(--text3);
    margin-top: 8px;
    text-align: center;
  }

  /* Toast */
  .toast {
    position: fixed;
    bottom: 24px;
    right: 24px;
    background: var(--surface2);
    border: 1px solid var(--border);
    border-radius: 10px;
    padding: 12px 16px;
    font-size: 13px;
    font-family: 'DM Mono', monospace;
    color: var(--text);
    z-index: 999;
    animation: slideIn 0.3s ease;
    max-width: 300px;
  }

  .toast.error { border-color: var(--danger); color: var(--danger); }
  .toast.success { border-color: var(--rag); color: var(--rag); }

  @keyframes slideIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }

  .pdfs-section::-webkit-scrollbar { width: 3px; }
  .pdfs-section::-webkit-scrollbar-thumb { background: var(--border); border-radius: 99px; }
`;

// ── Toast ─────────────────────────────────────────────────────────────────────
function Toast({ message, type, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3000);
    return () => clearTimeout(t);
  }, [onClose]);
  return <div className={`toast ${type}`}>{message}</div>;
}

// ── Message Component ─────────────────────────────────────────────────────────
function Message({ msg }) {
  const [showSources, setShowSources] = useState(false);
  const isBot = msg.role === "assistant";

  return (
    <div className={`message ${isBot ? "bot" : "user"}`}>
      <div className={`avatar ${isBot ? "bot" : "user"}`}>
        {isBot ? <BotIcon /> : <UserIcon />}
      </div>
      <div className="message-content">
        <div className="message-bubble">{msg.content}</div>
        {isBot && (
          <div className="message-meta">
            {msg.mode && (
              <span className={`msg-mode ${msg.mode}`}>
                {msg.mode === "rag" ? "📄 RAG" : "💬 Normal"}
              </span>
            )}
            {msg.sources && msg.sources.length > 0 && (
              <button className="sources-toggle" onClick={() => setShowSources(!showSources)}>
                sources <ChevronIcon open={showSources} />
              </button>
            )}
          </div>
        )}
        {showSources && msg.sources && msg.sources.length > 0 && (
          <div className="sources-box">
            <div className="sources-label">Retrieved Context</div>
            {msg.sources.map((s, i) => (
              <div key={i} className="source-chunk">{s.slice(0, 300)}{s.length > 300 ? "..." : ""}</div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main App ──────────────────────────────────────────────────────────────────
export default function App() {
  const [pdfs, setPdfs] = useState([]);
  const [activePdfId, setActivePdfId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [uploading, setUploading] = useState(false);
  const [thinking, setThinking] = useState(false);
  const [toast, setToast] = useState(null);
  const [expandedPdf, setExpandedPdf] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  const activePdf = pdfs.find(p => p.pdf_id === activePdfId);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, thinking]);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
  };

  const handleUpload = async (file) => {
    if (!file || !file.name.endsWith(".pdf")) {
      showToast("Only PDF files allowed!", "error");
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch(`${API_BASE}/upload-pdf`, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Upload failed");

      const newPdf = {
        pdf_id: data.pdf_id,
        name: data.filename,
        chunks_count: data.chunks_count,
      };
      setPdfs(prev => [...prev, newPdf]);
      setActivePdfId(data.pdf_id);
      setExpandedPdf(data.pdf_id);
      showToast(`✓ ${data.filename} — ${data.chunks_count} chunks created`, "success");
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setUploading(false);
    }
  };

  const handleRemovePdf = async (pdf_id) => {
    try {
      const res = await fetch(`${API_BASE}/remove-pdf/${pdf_id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Remove failed");
      setPdfs(prev => prev.filter(p => p.pdf_id !== pdf_id));
      if (activePdfId === pdf_id) setActivePdfId(null);
      showToast("PDF removed. Switching to normal chat.", "success");
    } catch (err) {
      showToast(err.message, "error");
    }
  };

  const handleSend = async () => {
    const query = input.trim();
    if (!query || thinking) return;

    const userMsg = { role: "user", content: query };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setThinking(true);

    try {
      const res = await fetch(`${API_BASE}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query,
          pdf_id: activePdfId || null,
          chat_history: messages.map(m => ({ role: m.role, content: m.content })),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Chat failed");

      setMessages(prev => [...prev, {
        role: "assistant",
        content: data.answer,
        mode: data.mode,
        sources: data.sources || [],
      }]);
    } catch (err) {
      setMessages(prev => [...prev, {
        role: "assistant",
        content: `Error: ${err.message}`,
        mode: "normal",
        sources: [],
      }]);
    } finally {
      setThinking(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleUpload(file);
  };

  return (
    <>
      <style>{styles}</style>
      <div className="app">

        {/* ── Sidebar ── */}
        <div className="sidebar">
          <div className="sidebar-header">
            <div className="logo">RAG·PDF</div>
            <div className="logo-sub">Retrieval Augmented Generation</div>
          </div>

          {/* Upload Zone */}
          <div
            className={`upload-zone ${dragOver ? "drag-over" : ""}`}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
          >
            <input
              type="file"
              accept=".pdf"
              onChange={(e) => handleUpload(e.target.files[0])}
              disabled={uploading}
            />
            <div className="upload-icon-wrap">
              <UploadIcon />
            </div>
            <div className="upload-title">{uploading ? "Processing PDF..." : "Upload PDF"}</div>
            <div className="upload-sub">{uploading ? "Chunking + Embedding..." : "drag & drop or click"}</div>
            {uploading && (
              <div className="uploading-bar">
                <div className="uploading-bar-fill" />
              </div>
            )}
          </div>

          {/* Mode Badge */}
          <div className={`mode-badge ${activePdfId ? "rag" : "normal"}`}>
            <div className="mode-dot" />
            {activePdfId
              ? `RAG Mode — ${activePdf?.name?.slice(0, 20) || "PDF"}...`
              : "Normal Chat Mode"}
          </div>

          {/* PDF List */}
          <div className="pdfs-section">
            {pdfs.length > 0 && <div className="pdfs-title">Uploaded PDFs</div>}
            {pdfs.map(pdf => (
              <div
                key={pdf.pdf_id}
                className={`pdf-card ${activePdfId === pdf.pdf_id ? "active" : ""}`}
              >
                <div className="pdf-card-header" onClick={() =>
                  setExpandedPdf(expandedPdf === pdf.pdf_id ? null : pdf.pdf_id)
                }>
                  <span className="pdf-icon"><FileIcon /></span>
                  <span className="pdf-name">{pdf.name}</span>
                  <ChevronIcon open={expandedPdf === pdf.pdf_id} />
                </div>
                {expandedPdf === pdf.pdf_id && (
                  <>
                    <div className="pdf-meta">{pdf.chunks_count} chunks · sliding window</div>
                    <div className="pdf-actions">
                      <button
                        className={`btn-use ${activePdfId === pdf.pdf_id ? "active" : ""}`}
                        onClick={() => setActivePdfId(activePdfId === pdf.pdf_id ? null : pdf.pdf_id)}
                      >
                        {activePdfId === pdf.pdf_id ? "✓ Active" : "Use this PDF"}
                      </button>
                      <button className="btn-delete" onClick={() => handleRemovePdf(pdf.pdf_id)}>
                        <TrashIcon />
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* ── Chat Area ── */}
        <div className="chat-area">
          <div className="chat-header">
            <div>
              <div className="chat-title">
                {activePdfId ? `Chatting with: ${activePdf?.name || "PDF"}` : "AI Assistant"}
              </div>
              <div className="chat-subtitle">
                {activePdfId
                  ? "Answers based on your PDF document"
                  : "General knowledge mode — upload a PDF to enable RAG"}
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="messages">
            {messages.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">✦</div>
                <div className="empty-title">
                  {activePdfId ? "Ask anything about your PDF" : "Start a conversation"}
                </div>
                <div className="empty-sub">
                  {activePdfId
                    ? "I'll search through your document using sliding window RAG to find the most relevant context."
                    : "Upload a PDF from the sidebar to enable RAG mode, or just chat normally."}
                </div>
              </div>
            ) : (
              messages.map((msg, i) => <Message key={i} msg={msg} />)
            )}
            {thinking && (
              <div className="message bot">
                <div className="avatar bot"><BotIcon /></div>
                <div className="typing">
                  <span /><span /><span />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="input-area">
            <div className="input-wrap">
              <textarea
                ref={textareaRef}
                rows={1}
                placeholder={activePdfId ? "Ask about your PDF..." : "Ask me anything..."}
                value={input}
                onChange={(e) => {
                  setInput(e.target.value);
                  e.target.style.height = "auto";
                  e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px";
                }}
                onKeyDown={handleKeyDown}
              />
              <button className="send-btn" onClick={handleSend} disabled={!input.trim() || thinking}>
                <SendIcon />
              </button>
            </div>
            <div className="input-hint">
              Enter to send · Shift+Enter for new line ·{" "}
              {activePdfId ? "RAG mode active" : "Normal mode"}
            </div>
          </div>
        </div>
      </div>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </>
  );
}