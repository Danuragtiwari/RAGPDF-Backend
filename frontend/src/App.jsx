import { useState, useRef, useEffect, useCallback } from "react";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8000";

// ── Styles ───────────────────────────────────────────────────────────────────
const css = `
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&family=JetBrains+Mono:wght@300;400;500&family=Outfit:wght@300;400;500;600&display=swap');

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

:root {
  --ink: #0d0d0d;
  --ink2: #161618;
  --ink3: #1e1e22;
  --ink4: #28282e;
  --paper: #f0ede6;
  --paper2: #e8e4db;
  --gold: #c9a84c;
  --gold2: #e8c96a;
  --gold3: #f5e4a8;
  --teal: #4ecdc4;
  --rose: #ff6b6b;
  --text: #f0ede6;
  --text2: #a09880;
  --text3: #5a5650;
  --border: rgba(201,168,76,0.15);
  --border2: rgba(201,168,76,0.08);
  --glow: rgba(201,168,76,0.12);
}

html, body, #root {
  height: 100%;
  overflow: hidden;
  background: var(--ink);
  color: var(--text);
  font-family: 'Outfit', sans-serif;
}

/* Noise texture overlay */
body::before {
  content: '';
  position: fixed;
  inset: 0;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E");
  pointer-events: none;
  z-index: 9999;
  opacity: 0.4;
}

.app {
  display: grid;
  grid-template-columns: 320px 1fr;
  height: 100vh;
  position: relative;
}

/* ══ SIDEBAR ══════════════════════════════════════════════════════════════ */
.sidebar {
  background: var(--ink2);
  border-right: 1px solid var(--border);
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
}

.sidebar::before {
  content: '';
  position: absolute;
  top: -100px;
  left: -100px;
  width: 300px;
  height: 300px;
  background: radial-gradient(circle, rgba(201,168,76,0.06) 0%, transparent 70%);
  pointer-events: none;
}

.brand {
  padding: 28px 24px 20px;
  border-bottom: 1px solid var(--border2);
  position: relative;
}

.brand-eyebrow {
  font-family: 'JetBrains Mono', monospace;
  font-size: 9px;
  letter-spacing: 0.25em;
  color: var(--gold);
  text-transform: uppercase;
  margin-bottom: 6px;
  opacity: 0.8;
}

.brand-name {
  font-family: 'Playfair Display', serif;
  font-size: 26px;
  font-weight: 700;
  letter-spacing: -0.5px;
  line-height: 1;
  color: var(--text);
}

.brand-name span {
  color: var(--gold);
  font-style: italic;
}

.brand-tagline {
  font-size: 11px;
  color: var(--text3);
  margin-top: 6px;
  font-weight: 300;
  letter-spacing: 0.02em;
}

/* Upload area */
.upload-section {
  padding: 16px;
  border-bottom: 1px solid var(--border2);
}

.upload-drop {
  position: relative;
  border: 1.5px dashed var(--border);
  border-radius: 16px;
  padding: 24px 16px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  background: var(--border2);
  overflow: hidden;
}

.upload-drop::before {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at 50% 50%, rgba(201,168,76,0.08) 0%, transparent 60%);
  opacity: 0;
  transition: opacity 0.3s;
}

.upload-drop:hover::before,
.upload-drop.drag { opacity: 1; }

.upload-drop:hover,
.upload-drop.drag {
  border-color: rgba(201,168,76,0.5);
  background: rgba(201,168,76,0.04);
  transform: translateY(-1px);
}

.upload-drop input {
  position: absolute;
  inset: 0;
  opacity: 0;
  cursor: pointer;
}

.upload-icon {
  width: 44px;
  height: 44px;
  margin: 0 auto 12px;
  background: linear-gradient(135deg, rgba(201,168,76,0.15), rgba(201,168,76,0.05));
  border: 1px solid var(--border);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  transition: transform 0.3s;
}

.upload-drop:hover .upload-icon { transform: scale(1.1) rotate(-5deg); }

.upload-label {
  font-size: 13px;
  font-weight: 500;
  color: var(--text);
  margin-bottom: 4px;
}

.upload-sub {
  font-family: 'JetBrains Mono', monospace;
  font-size: 10px;
  color: var(--text3);
}

/* Upload progress */
.upload-progress {
  margin-top: 10px;
  height: 2px;
  background: var(--ink4);
  border-radius: 99px;
  overflow: hidden;
}

.upload-progress-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--gold), var(--gold2), var(--teal));
  background-size: 200% 100%;
  border-radius: 99px;
  animation: progressFlow 1.5s linear infinite;
}

@keyframes progressFlow {
  0% { background-position: 200% 0; width: 30%; margin-left: 0; }
  50% { width: 60%; margin-left: 20%; }
  100% { background-position: -200% 0; width: 30%; margin-left: 100%; }
}

/* Mode indicator */
.mode-pill {
  margin: 12px 16px 0;
  padding: 8px 14px;
  border-radius: 99px;
  display: flex;
  align-items: center;
  gap: 8px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 10px;
  letter-spacing: 0.05em;
  transition: all 0.4s;
}

.mode-pill.rag {
  background: rgba(78,205,196,0.08);
  border: 1px solid rgba(78,205,196,0.2);
  color: var(--teal);
}

.mode-pill.normal {
  background: rgba(201,168,76,0.08);
  border: 1px solid rgba(201,168,76,0.2);
  color: var(--gold);
}

.mode-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  flex-shrink: 0;
  animation: pulse 2s infinite;
}

.mode-pill.rag .mode-dot { background: var(--teal); box-shadow: 0 0 6px var(--teal); }
.mode-pill.normal .mode-dot { background: var(--gold); box-shadow: 0 0 6px var(--gold); }

@keyframes pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.6; transform: scale(0.8); }
}

/* PDF List */
.pdf-list {
  flex: 1;
  overflow-y: auto;
  padding: 12px 16px 16px;
}

.pdf-list::-webkit-scrollbar { width: 3px; }
.pdf-list::-webkit-scrollbar-thumb { background: var(--border); border-radius: 99px; }

.pdf-list-title {
  font-family: 'JetBrains Mono', monospace;
  font-size: 9px;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: var(--text3);
  padding: 8px 4px 12px;
}

.pdf-item {
  border-radius: 14px;
  border: 1px solid var(--border2);
  margin-bottom: 8px;
  overflow: hidden;
  transition: all 0.25s;
  cursor: pointer;
}

.pdf-item:hover { border-color: var(--border); }
.pdf-item.active {
  border-color: rgba(201,168,76,0.4);
  background: rgba(201,168,76,0.04);
  box-shadow: 0 0 20px rgba(201,168,76,0.05);
}

.pdf-item-top {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 14px;
}

.pdf-file-icon {
  width: 34px;
  height: 34px;
  background: linear-gradient(135deg, rgba(201,168,76,0.2), rgba(201,168,76,0.05));
  border: 1px solid var(--border);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  flex-shrink: 0;
}

.pdf-item.active .pdf-file-icon {
  background: linear-gradient(135deg, rgba(201,168,76,0.3), rgba(201,168,76,0.1));
  border-color: rgba(201,168,76,0.4);
}

.pdf-info { flex: 1; min-width: 0; }

.pdf-name {
  font-size: 12px;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: var(--text);
  margin-bottom: 2px;
}

.pdf-chunks {
  font-family: 'JetBrains Mono', monospace;
  font-size: 10px;
  color: var(--text3);
}

.pdf-chevron {
  color: var(--text3);
  transition: transform 0.2s;
  flex-shrink: 0;
}

.pdf-chevron.open { transform: rotate(180deg); }

.pdf-actions {
  padding: 0 14px 12px;
  display: flex;
  gap: 8px;
}

.btn-activate {
  flex: 1;
  padding: 7px 12px;
  border-radius: 9px;
  font-size: 11px;
  font-weight: 600;
  font-family: 'Outfit', sans-serif;
  border: 1px solid var(--border);
  background: transparent;
  color: var(--text2);
  cursor: pointer;
  transition: all 0.2s;
  letter-spacing: 0.02em;
}

.btn-activate:hover {
  background: rgba(201,168,76,0.08);
  border-color: rgba(201,168,76,0.3);
  color: var(--gold);
}

.btn-activate.on {
  background: linear-gradient(135deg, rgba(201,168,76,0.2), rgba(201,168,76,0.08));
  border-color: rgba(201,168,76,0.5);
  color: var(--gold2);
}

.btn-del {
  width: 32px;
  height: 32px;
  border-radius: 9px;
  border: 1px solid var(--border2);
  background: transparent;
  color: var(--text3);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  font-size: 14px;
}

.btn-del:hover {
  background: rgba(255,107,107,0.1);
  border-color: rgba(255,107,107,0.3);
  color: var(--rose);
}

/* ══ MAIN CHAT ══════════════════════════════════════════════════════════════ */
.main {
  display: flex;
  flex-direction: column;
  background: var(--ink);
  position: relative;
  overflow: hidden;
}

/* Background decoration */
.main::before {
  content: '';
  position: absolute;
  bottom: -200px;
  right: -200px;
  width: 600px;
  height: 600px;
  background: radial-gradient(circle, rgba(201,168,76,0.03) 0%, transparent 60%);
  pointer-events: none;
}

.main::after {
  content: '';
  position: absolute;
  top: -100px;
  left: 30%;
  width: 400px;
  height: 400px;
  background: radial-gradient(circle, rgba(78,205,196,0.02) 0%, transparent 60%);
  pointer-events: none;
}

/* Header */
.chat-header {
  padding: 20px 32px;
  border-bottom: 1px solid var(--border2);
  display: flex;
  align-items: center;
  justify-content: space-between;
  backdrop-filter: blur(10px);
  position: relative;
  z-index: 10;
}

.header-left {}

.header-title {
  font-family: 'Playfair Display', serif;
  font-size: 18px;
  font-weight: 600;
  color: var(--text);
  display: flex;
  align-items: center;
  gap: 10px;
}

.header-doc-badge {
  font-family: 'JetBrains Mono', monospace;
  font-size: 10px;
  background: rgba(201,168,76,0.1);
  border: 1px solid rgba(201,168,76,0.25);
  color: var(--gold);
  padding: 3px 10px;
  border-radius: 99px;
  font-style: normal;
  letter-spacing: 0.03em;
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.header-sub {
  font-size: 12px;
  color: var(--text3);
  margin-top: 3px;
  font-weight: 300;
}

.btn-clear {
  padding: 7px 16px;
  border-radius: 99px;
  border: 1px solid var(--border2);
  background: transparent;
  color: var(--text3);
  font-size: 11px;
  font-family: 'JetBrains Mono', monospace;
  cursor: pointer;
  letter-spacing: 0.05em;
  transition: all 0.2s;
}

.btn-clear:hover {
  border-color: var(--border);
  color: var(--text2);
}

/* Messages */
.messages {
  flex: 1;
  overflow-y: auto;
  padding: 32px;
  display: flex;
  flex-direction: column;
  gap: 28px;
  position: relative;
  z-index: 1;
}

.messages::-webkit-scrollbar { width: 4px; }
.messages::-webkit-scrollbar-thumb { background: var(--border2); border-radius: 99px; }

/* Empty state */
.empty {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0;
  text-align: center;
  padding: 60px 40px;
  animation: fadeIn 0.6s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(16px); }
  to { opacity: 1; transform: translateY(0); }
}

.empty-ornament {
  font-family: 'Playfair Display', serif;
  font-size: 64px;
  color: var(--gold);
  opacity: 0.12;
  line-height: 1;
  margin-bottom: 20px;
  font-style: italic;
}

.empty-title {
  font-family: 'Playfair Display', serif;
  font-size: 22px;
  font-weight: 600;
  color: var(--text);
  margin-bottom: 10px;
  opacity: 0.7;
}

.empty-desc {
  font-size: 13px;
  color: var(--text3);
  max-width: 360px;
  line-height: 1.7;
  font-weight: 300;
}

.empty-hints {
  display: flex;
  gap: 10px;
  margin-top: 28px;
  flex-wrap: wrap;
  justify-content: center;
}

.hint-chip {
  padding: 8px 16px;
  border: 1px solid var(--border);
  border-radius: 99px;
  font-size: 12px;
  color: var(--text3);
  font-family: 'JetBrains Mono', monospace;
  cursor: pointer;
  transition: all 0.2s;
  background: var(--border2);
}

.hint-chip:hover {
  border-color: rgba(201,168,76,0.3);
  color: var(--gold);
  background: rgba(201,168,76,0.05);
}

/* Message bubbles */
.msg-row {
  display: flex;
  gap: 14px;
  animation: msgIn 0.35s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes msgIn {
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
}

.msg-row.user { flex-direction: row-reverse; }

.avatar {
  width: 36px;
  height: 36px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  font-size: 16px;
  position: relative;
}

.avatar.bot {
  background: linear-gradient(135deg, rgba(201,168,76,0.2), rgba(201,168,76,0.05));
  border: 1px solid rgba(201,168,76,0.25);
}

.avatar.user {
  background: linear-gradient(135deg, rgba(78,205,196,0.2), rgba(78,205,196,0.05));
  border: 1px solid rgba(78,205,196,0.25);
}

.msg-content { max-width: 68%; }

.bubble {
  padding: 14px 18px;
  border-radius: 18px;
  font-size: 14px;
  line-height: 1.7;
  font-weight: 300;
}

.msg-row.bot .bubble {
  background: var(--ink2);
  border: 1px solid var(--border2);
  color: var(--text);
  border-radius: 4px 18px 18px 18px;
}

.msg-row.user .bubble {
  background: linear-gradient(135deg, rgba(201,168,76,0.18), rgba(201,168,76,0.08));
  border: 1px solid rgba(201,168,76,0.25);
  color: var(--text);
  border-radius: 18px 4px 18px 18px;
}

.msg-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 6px;
  padding: 0 4px;
}

.msg-row.user .msg-meta { justify-content: flex-end; }

.tag-rag {
  font-family: 'JetBrains Mono', monospace;
  font-size: 9px;
  padding: 2px 8px;
  border-radius: 99px;
  letter-spacing: 0.08em;
  background: rgba(78,205,196,0.08);
  border: 1px solid rgba(78,205,196,0.2);
  color: var(--teal);
}

.tag-normal {
  font-family: 'JetBrains Mono', monospace;
  font-size: 9px;
  padding: 2px 8px;
  border-radius: 99px;
  letter-spacing: 0.08em;
  background: rgba(201,168,76,0.08);
  border: 1px solid rgba(201,168,76,0.2);
  color: var(--gold);
}

.src-toggle {
  font-family: 'JetBrains Mono', monospace;
  font-size: 10px;
  color: var(--text3);
  cursor: pointer;
  background: none;
  border: none;
  padding: 0;
  display: flex;
  align-items: center;
  gap: 4px;
  transition: color 0.2s;
}

.src-toggle:hover { color: var(--gold); }

.src-box {
  margin-top: 10px;
  background: var(--ink3);
  border: 1px solid var(--border2);
  border-left: 2px solid var(--gold);
  border-radius: 0 12px 12px 12px;
  padding: 12px 14px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px;
  color: var(--text3);
  line-height: 1.65;
  max-height: 140px;
  overflow-y: auto;
  animation: fadeIn 0.2s ease;
}

.src-label {
  font-size: 9px;
  letter-spacing: 0.15em;
  color: var(--gold);
  text-transform: uppercase;
  margin-bottom: 8px;
}

.src-chunk {
  margin-bottom: 8px;
  padding-left: 10px;
  border-left: 1px solid var(--border);
  word-break: break-word;
  white-space: pre-wrap;
}

/* Typing */
.typing-row {
  display: flex;
  gap: 14px;
  animation: msgIn 0.3s ease;
}

.typing-bubble {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 14px 18px;
  background: var(--ink2);
  border: 1px solid var(--border2);
  border-radius: 4px 18px 18px 18px;
}

.typing-dot {
  width: 6px;
  height: 6px;
  background: var(--gold);
  border-radius: 50%;
  animation: typingBounce 1.4s infinite;
  opacity: 0.5;
}

.typing-dot:nth-child(2) { animation-delay: 0.2s; background: var(--gold2); }
.typing-dot:nth-child(3) { animation-delay: 0.4s; background: var(--teal); }

@keyframes typingBounce {
  0%, 60%, 100% { transform: translateY(0); opacity: 0.5; }
  30% { transform: translateY(-7px); opacity: 1; }
}

/* ══ INPUT AREA ══════════════════════════════════════════════════════════════ */
.input-area {
  padding: 20px 32px 24px;
  border-top: 1px solid var(--border2);
  position: relative;
  z-index: 10;
}

.input-box {
  display: flex;
  align-items: flex-end;
  gap: 12px;
  background: var(--ink2);
  border: 1px solid var(--border);
  border-radius: 20px;
  padding: 14px 14px 14px 20px;
  transition: border-color 0.3s, box-shadow 0.3s;
  position: relative;
}

.input-box:focus-within {
  border-color: rgba(201,168,76,0.4);
  box-shadow: 0 0 30px rgba(201,168,76,0.06);
}

.input-box textarea {
  flex: 1;
  background: none;
  border: none;
  outline: none;
  color: var(--text);
  font-family: 'Outfit', sans-serif;
  font-size: 14px;
  font-weight: 300;
  resize: none;
  max-height: 130px;
  line-height: 1.6;
}

.input-box textarea::placeholder {
  color: var(--text3);
  font-style: italic;
}

.send-btn {
  width: 42px;
  height: 42px;
  border-radius: 14px;
  border: none;
  background: linear-gradient(135deg, var(--gold), #a87c2a);
  color: var(--ink);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  font-size: 18px;
}

.send-btn:hover:not(:disabled) {
  transform: scale(1.08) rotate(-5deg);
  box-shadow: 0 4px 20px rgba(201,168,76,0.4);
}

.send-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
  background: var(--ink4);
}

.input-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 10px;
  padding: 0 4px;
}

.input-hint {
  font-family: 'JetBrains Mono', monospace;
  font-size: 10px;
  color: var(--text3);
}

.char-count {
  font-family: 'JetBrains Mono', monospace;
  font-size: 10px;
  color: var(--text3);
}

/* ══ TOAST ═══════════════════════════════════════════════════════════════════ */
.toast-wrap {
  position: fixed;
  bottom: 28px;
  right: 28px;
  z-index: 99999;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.toast {
  padding: 12px 18px;
  border-radius: 14px;
  font-size: 12px;
  font-family: 'JetBrains Mono', monospace;
  display: flex;
  align-items: center;
  gap: 10px;
  animation: toastIn 0.35s cubic-bezier(0.4, 0, 0.2, 1);
  max-width: 320px;
  backdrop-filter: blur(10px);
}

@keyframes toastIn {
  from { opacity: 0; transform: translateX(20px); }
  to { opacity: 1; transform: translateX(0); }
}

.toast.success {
  background: rgba(14,14,14,0.95);
  border: 1px solid rgba(78,205,196,0.3);
  color: var(--teal);
}

.toast.error {
  background: rgba(14,14,14,0.95);
  border: 1px solid rgba(255,107,107,0.3);
  color: var(--rose);
}

.toast.info {
  background: rgba(14,14,14,0.95);
  border: 1px solid var(--border);
  color: var(--gold);
}
`;

// ── Utility Components ────────────────────────────────────────────────────────
function Toast({ toasts }) {
  return (
    <div className="toast-wrap">
      {toasts.map(t => (
        <div key={t.id} className={`toast ${t.type}`}>
          <span>{t.type === 'success' ? '✦' : t.type === 'error' ? '✕' : '◈'}</span>
          {t.msg}
        </div>
      ))}
    </div>
  );
}

function SourceBox({ sources }) {
  const [open, setOpen] = useState(false);
  if (!sources?.length) return null;
  return (
    <>
      <button className="src-toggle" onClick={() => setOpen(o => !o)}>
        {open ? '▴' : '▾'} {open ? 'hide sources' : `view sources (${sources.length})`}
      </button>
      {open && (
        <div className="src-box">
          <div className="src-label">Retrieved Context</div>
          {sources.map((s, i) => (
            <div key={i} className="src-chunk">
              {s.slice(0, 280)}{s.length > 280 ? '…' : ''}
            </div>
          ))}
        </div>
      )}
    </>
  );
}

function Message({ msg }) {
  const isUser = msg.role === 'user';
  return (
    <div className={`msg-row ${isUser ? 'user' : 'bot'}`}>
      <div className={`avatar ${isUser ? 'user' : 'bot'}`}>
        {isUser ? '◎' : '✦'}
      </div>
      <div className="msg-content">
        <div className="bubble">{msg.content}</div>
        {!isUser && (
          <div className="msg-meta">
            {msg.mode === 'rag'
              ? <span className="tag-rag">◈ RAG</span>
              : <span className="tag-normal">◇ General</span>
            }
            <SourceBox sources={msg.sources} />
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main App ──────────────────────────────────────────────────────────────────
const HINTS = [
  'Summarize this document',
  'What are the key points?',
  'Explain in simple terms',
  'List the main topics',
];

export default function App() {
  const [pdfs, setPdfs] = useState([]);
  const [activePdf, setActivePdf] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [uploading, setUploading] = useState(false);
  const [thinking, setThinking] = useState(false);
  const [expanded, setExpanded] = useState(null);
  const [drag, setDrag] = useState(false);
  const [toasts, setToasts] = useState([]);
  const endRef = useRef(null);
  const taRef = useRef(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, thinking]);

  const toast = useCallback((msg, type = 'info') => {
    const id = Date.now();
    setToasts(p => [...p, { id, msg, type }]);
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 3500);
  }, []);

  const handleFile = async (file) => {
    if (!file?.name.endsWith('.pdf')) return toast('Only PDF files allowed', 'error');
    setUploading(true);
    const fd = new FormData();
    fd.append('file', file);
    try {
      const res = await fetch(`${API_BASE}/upload-pdf`, { method: 'POST', body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail);
      const newPdf = { pdf_id: data.pdf_id, name: data.filename, chunks: data.chunks_count };
      setPdfs(p => [...p, newPdf]);
      setActivePdf(newPdf.pdf_id);
      setExpanded(newPdf.pdf_id);
      toast(`${data.filename} — ${data.chunks_count} chunks created`, 'success');
    } catch (e) {
      toast(e.message, 'error');
    } finally {
      setUploading(false);
    }
  };

  const removePdf = async (pdf_id) => {
    try {
      await fetch(`${API_BASE}/remove-pdf/${pdf_id}`, { method: 'DELETE' });
      setPdfs(p => p.filter(x => x.pdf_id !== pdf_id));
      if (activePdf === pdf_id) setActivePdf(null);
      toast('PDF removed — switched to general mode', 'info');
    } catch (e) {
      toast(e.message, 'error');
    }
  };

  const send = async (text) => {
    const q = (text || input).trim();
    if (!q || thinking) return;
    setMessages(p => [...p, { role: 'user', content: q }]);
    setInput('');
    if (taRef.current) taRef.current.style.height = 'auto';
    setThinking(true);
    try {
      const res = await fetch(`${API_BASE}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: q,
          pdf_id: activePdf || null,
          chat_history: messages.map(m => ({ role: m.role, content: m.content })),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail);
      setMessages(p => [...p, { role: 'assistant', content: data.answer, mode: data.mode, sources: data.sources }]);
    } catch (e) {
      setMessages(p => [...p, { role: 'assistant', content: `Error: ${e.message}`, mode: 'normal', sources: [] }]);
    } finally {
      setThinking(false);
    }
  };

  const activePdfInfo = pdfs.find(p => p.pdf_id === activePdf);
  const isRag = !!activePdf && !!activePdfInfo;

  return (
    <>
      <style>{css}</style>
      <div className="app">

        {/* ── SIDEBAR ── */}
        <aside className="sidebar">
          <div className="brand">
            <div className="brand-eyebrow">Retrieval Augmented Generation</div>
            <div className="brand-name">Doc<span>Mind</span></div>
            <div className="brand-tagline">Intelligent document conversations</div>
          </div>

          <div className="upload-section">
            <div
              className={`upload-drop ${drag ? 'drag' : ''}`}
              onDragOver={e => { e.preventDefault(); setDrag(true); }}
              onDragLeave={() => setDrag(false)}
              onDrop={e => { e.preventDefault(); setDrag(false); handleFile(e.dataTransfer.files[0]); }}
            >
              <input type="file" accept=".pdf" onChange={e => handleFile(e.target.files[0])} disabled={uploading} />
              <div className="upload-icon">{uploading ? '⟳' : '📄'}</div>
              <div className="upload-label">{uploading ? 'Processing…' : 'Upload PDF'}</div>
              <div className="upload-sub">{uploading ? 'chunking · embedding · indexing' : 'drag & drop or click to browse'}</div>
              {uploading && <div className="upload-progress"><div className="upload-progress-fill" /></div>}
            </div>
          </div>

          <div className={`mode-pill ${isRag ? 'rag' : 'normal'}`}>
            <div className="mode-dot" />
            {isRag
              ? `RAG · ${activePdfInfo?.name?.slice(0, 18)}${activePdfInfo?.name?.length > 18 ? '…' : ''}`
              : 'General Knowledge Mode'}
          </div>

          <div className="pdf-list">
            {pdfs.length > 0 && <div className="pdf-list-title">Documents</div>}
            {pdfs.map(pdf => (
              <div key={pdf.pdf_id} className={`pdf-item ${activePdf === pdf.pdf_id ? 'active' : ''}`}>
                <div className="pdf-item-top" onClick={() => setExpanded(e => e === pdf.pdf_id ? null : pdf.pdf_id)}>
                  <div className="pdf-file-icon">📑</div>
                  <div className="pdf-info">
                    <div className="pdf-name">{pdf.name}</div>
                    <div className="pdf-chunks">{pdf.chunks} chunks · sliding window</div>
                  </div>
                  <span className={`pdf-chevron ${expanded === pdf.pdf_id ? 'open' : ''}`}>⌄</span>
                </div>
                {expanded === pdf.pdf_id && (
                  <div className="pdf-actions">
                    <button
                      className={`btn-activate ${activePdf === pdf.pdf_id ? 'on' : ''}`}
                      onClick={() => setActivePdf(activePdf === pdf.pdf_id ? null : pdf.pdf_id)}
                    >
                      {activePdf === pdf.pdf_id ? '✦ Active' : 'Activate'}
                    </button>
                    <button className="btn-del" onClick={() => removePdf(pdf.pdf_id)}>✕</button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </aside>

        {/* ── CHAT MAIN ── */}
        <main className="main">
          <div className="chat-header">
            <div className="header-left">
              <div className="header-title">
                {isRag ? (
                  <>Chatting with <span className="header-doc-badge">{activePdfInfo?.name}</span></>
                ) : (
                  'General Assistant'
                )}
              </div>
              <div className="header-sub">
                {isRag
                  ? `RAG mode · sliding window retrieval · ${activePdfInfo?.chunks} indexed chunks`
                  : 'Upload a PDF to enable document Q&A mode'}
              </div>
            </div>
            {messages.length > 0 && (
              <button className="btn-clear" onClick={() => setMessages([])}>clear chat</button>
            )}
          </div>

          <div className="messages">
            {messages.length === 0 ? (
              <div className="empty">
                <div className="empty-ornament">❝</div>
                <div className="empty-title">
                  {isRag ? 'Ask anything about your document' : 'Start a conversation'}
                </div>
                <div className="empty-desc">
                  {isRag
                    ? 'DocMind will search through your PDF using sliding window RAG to find the most relevant context and craft a precise answer.'
                    : 'Upload a PDF from the sidebar to enable document intelligence mode, or ask me anything in general mode.'}
                </div>
                {isRag && (
                  <div className="empty-hints">
                    {HINTS.map(h => (
                      <div key={h} className="hint-chip" onClick={() => send(h)}>{h}</div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              messages.map((m, i) => <Message key={i} msg={m} />)
            )}
            {thinking && (
              <div className="typing-row">
                <div className="avatar bot">✦</div>
                <div className="typing-bubble">
                  <div className="typing-dot" />
                  <div className="typing-dot" />
                  <div className="typing-dot" />
                </div>
              </div>
            )}
            <div ref={endRef} />
          </div>

          <div className="input-area">
            <div className="input-box">
              <textarea
                ref={taRef}
                rows={1}
                placeholder={isRag ? 'Ask about your document…' : 'Ask me anything…'}
                value={input}
                onChange={e => {
                  setInput(e.target.value);
                  e.target.style.height = 'auto';
                  e.target.style.height = Math.min(e.target.scrollHeight, 130) + 'px';
                }}
                onKeyDown={e => {
                  if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
                }}
              />
              <button className="send-btn" onClick={() => send()} disabled={!input.trim() || thinking}>
                ➤
              </button>
            </div>
            <div className="input-footer">
              <span className="input-hint">↵ send · shift+↵ newline · {isRag ? '◈ rag mode' : '◇ general mode'}</span>
              <span className="char-count">{input.length}</span>
            </div>
          </div>
        </main>
      </div>

      <Toast toasts={toasts} />
    </>
  );
}