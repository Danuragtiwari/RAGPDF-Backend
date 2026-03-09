import { useState, useRef, useEffect, useCallback } from "react";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8000";

const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Cabinet+Grotesk:wght@300;400;500;700;800;900&family=Instrument+Serif:ital@0;1&family=Geist+Mono:wght@300;400;500&display=swap');

    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    :root {
      --bg: #060608;
      --s1: #0e0e12;
      --s2: #14141a;
      --s3: #1c1c24;
      --s4: #24242e;
      --border: rgba(255,255,255,0.06);
      --border-hi: rgba(255,255,255,0.12);
      --c1: #7b6ef6;
      --c2: #e879f9;
      --c3: #06b6d4;
      --c4: #f59e0b;
      --c5: #10b981;
      --text: #f1f0f8;
      --text2: #9896b0;
      --text3: #4a4860;
      --glass: rgba(255,255,255,0.03);
      --glass-hi: rgba(255,255,255,0.06);
      --rad: 16px;
    }

    html, body, #root {
      height: 100%;
      overflow: hidden;
      background: var(--bg);
      font-family: 'Cabinet Grotesk', sans-serif;
      color: var(--text);
      -webkit-font-smoothing: antialiased;
    }

    /* ── Animated mesh background ── */
    .mesh-bg {
      position: fixed;
      inset: 0;
      pointer-events: none;
      z-index: 0;
      overflow: hidden;
    }

    .mesh-orb {
      position: absolute;
      border-radius: 50%;
      filter: blur(80px);
      opacity: 0.12;
      animation: orbFloat linear infinite;
    }

    .orb1 { width:500px;height:500px;background:var(--c1);top:-100px;left:-150px;animation-duration:18s; }
    .orb2 { width:400px;height:400px;background:var(--c2);top:20%;right:-100px;animation-duration:24s;animation-delay:-8s; }
    .orb3 { width:350px;height:350px;background:var(--c3);bottom:-50px;left:30%;animation-duration:20s;animation-delay:-5s; }
    .orb4 { width:250px;height:250px;background:var(--c4);bottom:20%;right:20%;animation-duration:15s;animation-delay:-12s; }

    @keyframes orbFloat {
      0%,100% { transform: translate(0,0) scale(1); }
      25% { transform: translate(30px,-40px) scale(1.05); }
      50% { transform: translate(-20px,30px) scale(0.95); }
      75% { transform: translate(40px,20px) scale(1.02); }
    }

    /* Grid overlay */
    .grid-overlay {
      position: fixed;
      inset: 0;
      pointer-events: none;
      z-index: 0;
      background-image:
        linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px),
        linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px);
      background-size: 48px 48px;
    }

    /* ── App Layout ── */
    .app {
      display: grid;
      grid-template-columns: 300px 1fr;
      height: 100vh;
      position: relative;
      z-index: 1;
    }

    /* ══════════════════════════════════════════
       SIDEBAR
    ══════════════════════════════════════════ */
    .sidebar {
      display: flex;
      flex-direction: column;
      background: rgba(10,10,14,0.8);
      backdrop-filter: blur(24px);
      -webkit-backdrop-filter: blur(24px);
      border-right: 1px solid var(--border);
      position: relative;
      overflow: hidden;
    }

    /* Brand */
    .brand {
      padding: 24px 20px 18px;
      border-bottom: 1px solid var(--border);
    }

    .brand-logo {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 4px;
    }

    .brand-icon {
      width: 36px;
      height: 36px;
      background: linear-gradient(135deg, var(--c1), var(--c2));
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 18px;
      flex-shrink: 0;
      box-shadow: 0 0 20px rgba(123,110,246,0.4);
      animation: iconPulse 3s ease-in-out infinite;
    }

    @keyframes iconPulse {
      0%,100% { box-shadow: 0 0 20px rgba(123,110,246,0.4); }
      50% { box-shadow: 0 0 35px rgba(232,121,249,0.5); }
    }

    .brand-name {
      font-size: 20px;
      font-weight: 900;
      letter-spacing: -0.5px;
      background: linear-gradient(135deg, var(--c1) 0%, var(--c2) 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    .brand-sub {
      font-family: 'Geist Mono', monospace;
      font-size: 10px;
      color: var(--text3);
      letter-spacing: 0.08em;
    }

    /* Status bar */
    .status-bar {
      display: flex;
      align-items: center;
      gap: 8px;
      margin: 14px 20px 0;
      padding: 8px 14px;
      background: var(--glass);
      border: 1px solid var(--border);
      border-radius: 99px;
      font-family: 'Geist Mono', monospace;
      font-size: 10px;
      transition: all 0.4s cubic-bezier(0.4,0,0.2,1);
    }

    .status-bar.rag {
      background: rgba(16,185,129,0.06);
      border-color: rgba(16,185,129,0.2);
      color: var(--c5);
    }

    .status-bar.normal {
      background: rgba(123,110,246,0.06);
      border-color: rgba(123,110,246,0.2);
      color: var(--c1);
    }

    .status-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      flex-shrink: 0;
    }

    .status-bar.rag .status-dot {
      background: var(--c5);
      box-shadow: 0 0 8px var(--c5);
      animation: blink 1.5s ease infinite;
    }

    .status-bar.normal .status-dot {
      background: var(--c1);
      box-shadow: 0 0 8px var(--c1);
      animation: blink 2s ease infinite;
    }

    @keyframes blink {
      0%,100% { opacity:1; }
      50% { opacity:0.4; }
    }

    /* Upload zone */
    .upload-wrap {
      padding: 14px 16px;
      border-bottom: 1px solid var(--border);
    }

    .upload-zone {
      position: relative;
      border: 1.5px dashed rgba(255,255,255,0.1);
      border-radius: 14px;
      padding: 20px 14px;
      text-align: center;
      cursor: pointer;
      transition: all 0.3s cubic-bezier(0.4,0,0.2,1);
      background: var(--glass);
      overflow: hidden;
    }

    .upload-zone::before {
      content: '';
      position: absolute;
      inset: 0;
      background: linear-gradient(135deg, rgba(123,110,246,0.1), rgba(232,121,249,0.1));
      opacity: 0;
      transition: opacity 0.3s;
      border-radius: 14px;
    }

    .upload-zone:hover::before,
    .upload-zone.drag::before { opacity: 1; }

    .upload-zone:hover,
    .upload-zone.drag {
      border-color: rgba(123,110,246,0.5);
      transform: translateY(-2px);
      box-shadow: 0 8px 32px rgba(123,110,246,0.15);
    }

    .upload-zone input {
      position: absolute;
      inset: 0;
      opacity: 0;
      cursor: pointer;
    }

    .upload-icon-ring {
      width: 52px;
      height: 52px;
      margin: 0 auto 12px;
      position: relative;
    }

    .upload-icon-ring::before {
      content: '';
      position: absolute;
      inset: -4px;
      border-radius: 50%;
      border: 1.5px solid transparent;
      background: linear-gradient(135deg, var(--c1), var(--c2)) border-box;
      -webkit-mask: linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0);
      -webkit-mask-composite: destination-out;
      mask-composite: exclude;
      opacity: 0.6;
      animation: spin 4s linear infinite;
    }

    @keyframes spin { to { transform: rotate(360deg); } }

    .upload-icon-inner {
      width: 52px;
      height: 52px;
      background: linear-gradient(135deg, rgba(123,110,246,0.15), rgba(232,121,249,0.15));
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 22px;
    }

    .upload-title {
      font-size: 13px;
      font-weight: 700;
      color: var(--text);
      margin-bottom: 3px;
    }

    .upload-hint {
      font-family: 'Geist Mono', monospace;
      font-size: 10px;
      color: var(--text3);
    }

    .upload-progress {
      margin-top: 10px;
      height: 3px;
      background: var(--s3);
      border-radius: 99px;
      overflow: hidden;
    }

    .upload-progress-bar {
      height: 100%;
      background: linear-gradient(90deg, var(--c1), var(--c2), var(--c3));
      background-size: 200% 100%;
      border-radius: 99px;
      animation: progressAnim 1.2s linear infinite;
    }

    @keyframes progressAnim {
      0% { width:0%;margin-left:0;background-position:0% 50%; }
      50% { width:60%;margin-left:20%;background-position:100% 50%; }
      100% { width:0%;margin-left:100%;background-position:0% 50%; }
    }

    /* PDF list */
    .pdf-section {
      flex: 1;
      overflow-y: auto;
      padding: 10px 12px 16px;
      scrollbar-width: thin;
      scrollbar-color: var(--s4) transparent;
    }

    .pdf-section-label {
      font-family: 'Geist Mono', monospace;
      font-size: 9px;
      letter-spacing: 0.18em;
      text-transform: uppercase;
      color: var(--text3);
      padding: 6px 8px 10px;
    }

    .pdf-card {
      border-radius: 14px;
      background: var(--glass);
      border: 1px solid var(--border);
      margin-bottom: 8px;
      overflow: hidden;
      cursor: pointer;
      transition: all 0.25s cubic-bezier(0.4,0,0.2,1);
    }

    .pdf-card:hover {
      border-color: var(--border-hi);
      background: var(--glass-hi);
      transform: translateX(2px);
    }

    .pdf-card.active {
      border-color: rgba(123,110,246,0.4);
      background: rgba(123,110,246,0.06);
      box-shadow: 0 0 24px rgba(123,110,246,0.08), inset 0 0 0 1px rgba(123,110,246,0.1);
    }

    .pdf-card-head {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 11px 13px;
    }

    .pdf-thumb {
      width: 36px;
      height: 36px;
      border-radius: 10px;
      background: linear-gradient(135deg, rgba(123,110,246,0.2), rgba(232,121,249,0.1));
      border: 1px solid rgba(123,110,246,0.2);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 17px;
      flex-shrink: 0;
      transition: transform 0.2s;
    }

    .pdf-card:hover .pdf-thumb { transform: scale(1.08) rotate(-3deg); }
    .pdf-card.active .pdf-thumb {
      background: linear-gradient(135deg, rgba(123,110,246,0.3), rgba(232,121,249,0.2));
      border-color: rgba(123,110,246,0.4);
    }

    .pdf-info { flex: 1; min-width: 0; }

    .pdf-fname {
      font-size: 12px;
      font-weight: 600;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      color: var(--text);
    }

    .pdf-meta {
      font-family: 'Geist Mono', monospace;
      font-size: 10px;
      color: var(--text3);
      margin-top: 2px;
    }

    .pdf-chevron {
      font-size: 12px;
      color: var(--text3);
      transition: transform 0.25s;
    }

    .pdf-chevron.open { transform: rotate(180deg); }

    .pdf-body {
      padding: 0 13px 12px;
      display: flex;
      gap: 8px;
      animation: slideDown 0.2s ease;
    }

    @keyframes slideDown {
      from { opacity:0; transform:translateY(-6px); }
      to { opacity:1; transform:translateY(0); }
    }

    .btn-activate {
      flex: 1;
      padding: 7px 0;
      border-radius: 10px;
      font-size: 11px;
      font-weight: 700;
      font-family: 'Cabinet Grotesk', sans-serif;
      letter-spacing: 0.02em;
      border: 1px solid var(--border-hi);
      background: var(--glass);
      color: var(--text2);
      cursor: pointer;
      transition: all 0.2s;
    }

    .btn-activate:hover {
      background: rgba(123,110,246,0.12);
      border-color: rgba(123,110,246,0.4);
      color: var(--c1);
    }

    .btn-activate.on {
      background: linear-gradient(135deg, rgba(123,110,246,0.2), rgba(232,121,249,0.1));
      border-color: rgba(123,110,246,0.5);
      color: #a89ff8;
    }

    .btn-del {
      width: 34px;
      height: 34px;
      border-radius: 10px;
      border: 1px solid var(--border);
      background: var(--glass);
      color: var(--text3);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 14px;
      transition: all 0.2s;
    }

    .btn-del:hover {
      background: rgba(239,68,68,0.1);
      border-color: rgba(239,68,68,0.3);
      color: #f87171;
      transform: scale(1.05);
    }

    /* ══════════════════════════════════════════
       MAIN CHAT
    ══════════════════════════════════════════ */
    .main {
      display: flex;
      flex-direction: column;
      position: relative;
      overflow: hidden;
    }

    /* Header */
    .chat-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 16px 28px;
      background: rgba(6,6,8,0.6);
      backdrop-filter: blur(20px);
      border-bottom: 1px solid var(--border);
      position: relative;
      z-index: 10;
    }

    .header-info {}

    .header-title {
      font-size: 16px;
      font-weight: 800;
      letter-spacing: -0.3px;
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .active-pdf-chip {
      font-size: 11px;
      font-weight: 500;
      padding: 3px 12px;
      background: rgba(123,110,246,0.1);
      border: 1px solid rgba(123,110,246,0.25);
      border-radius: 99px;
      color: #a89ff8;
      max-width: 200px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      font-family: 'Geist Mono', monospace;
    }

    .header-sub {
      font-size: 12px;
      color: var(--text3);
      margin-top: 2px;
      font-weight: 400;
    }

    .header-actions { display: flex; gap: 8px; }

    .btn-ghost {
      padding: 7px 16px;
      border-radius: 10px;
      border: 1px solid var(--border);
      background: var(--glass);
      color: var(--text3);
      font-size: 11px;
      font-family: 'Geist Mono', monospace;
      cursor: pointer;
      letter-spacing: 0.05em;
      transition: all 0.2s;
    }

    .btn-ghost:hover {
      background: var(--glass-hi);
      border-color: var(--border-hi);
      color: var(--text2);
    }

    /* Messages */
    .messages-wrap {
      flex: 1;
      overflow-y: auto;
      padding: 28px;
      display: flex;
      flex-direction: column;
      gap: 20px;
      scrollbar-width: thin;
      scrollbar-color: var(--s4) transparent;
      position: relative;
      z-index: 1;
    }

    /* Empty state */
    .empty {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      flex: 1;
      gap: 0;
      padding: 40px;
      text-align: center;
      animation: fadeSlideUp 0.6s cubic-bezier(0.4,0,0.2,1);
    }

    @keyframes fadeSlideUp {
      from { opacity:0; transform:translateY(24px); }
      to { opacity:1; transform:translateY(0); }
    }

    .empty-glyph {
      font-family: 'Instrument Serif', serif;
      font-style: italic;
      font-size: 72px;
      background: linear-gradient(135deg, var(--c1), var(--c2));
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      opacity: 0.25;
      line-height: 1;
      margin-bottom: 20px;
    }

    .empty-headline {
      font-size: 22px;
      font-weight: 800;
      letter-spacing: -0.5px;
      color: var(--text);
      margin-bottom: 10px;
    }

    .empty-desc {
      font-size: 13px;
      color: var(--text3);
      max-width: 380px;
      line-height: 1.75;
      font-weight: 400;
    }

    .suggestion-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 8px;
      margin-top: 28px;
      width: 100%;
      max-width: 480px;
    }

    .suggestion-card {
      padding: 12px 16px;
      background: var(--glass);
      border: 1px solid var(--border);
      border-radius: 12px;
      cursor: pointer;
      transition: all 0.25s cubic-bezier(0.4,0,0.2,1);
      text-align: left;
    }

    .suggestion-card:hover {
      background: var(--glass-hi);
      border-color: rgba(123,110,246,0.3);
      transform: translateY(-2px);
      box-shadow: 0 8px 24px rgba(0,0,0,0.3);
    }

    .suggestion-icon { font-size: 18px; margin-bottom: 6px; }

    .suggestion-text {
      font-size: 12px;
      font-weight: 600;
      color: var(--text2);
    }

    /* Messages */
    .msg-row {
      display: flex;
      gap: 12px;
      animation: msgSlide 0.35s cubic-bezier(0.4,0,0.2,1);
    }

    @keyframes msgSlide {
      from { opacity:0; transform:translateY(10px) scale(0.98); }
      to { opacity:1; transform:translateY(0) scale(1); }
    }

    .msg-row.user { flex-direction: row-reverse; }

    .msg-avatar {
      width: 34px;
      height: 34px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 16px;
      flex-shrink: 0;
    }

    .msg-avatar.ai {
      background: linear-gradient(135deg, rgba(123,110,246,0.2), rgba(232,121,249,0.1));
      border: 1px solid rgba(123,110,246,0.2);
    }

    .msg-avatar.human {
      background: linear-gradient(135deg, rgba(6,182,212,0.2), rgba(16,185,129,0.1));
      border: 1px solid rgba(6,182,212,0.2);
    }

    .msg-body { max-width: 72%; display: flex; flex-direction: column; gap: 6px; }
    .msg-row.user .msg-body { align-items: flex-end; }

    .bubble {
      padding: 13px 17px;
      border-radius: 16px;
      font-size: 14px;
      line-height: 1.7;
      font-weight: 400;
      word-break: break-word;
    }

    .bubble.ai {
      background: rgba(255,255,255,0.04);
      border: 1px solid var(--border);
      color: var(--text);
      border-radius: 4px 16px 16px 16px;
      backdrop-filter: blur(8px);
    }

    .bubble.human {
      background: linear-gradient(135deg, rgba(123,110,246,0.22), rgba(232,121,249,0.12));
      border: 1px solid rgba(123,110,246,0.3);
      color: var(--text);
      border-radius: 16px 4px 16px 16px;
    }

    .msg-footer {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 0 2px;
    }

    .msg-row.user .msg-footer { flex-direction: row-reverse; }

    .mode-tag {
      font-family: 'Geist Mono', monospace;
      font-size: 9px;
      padding: 2px 8px;
      border-radius: 99px;
      letter-spacing: 0.06em;
      font-weight: 500;
    }

    .mode-tag.rag {
      background: rgba(16,185,129,0.1);
      border: 1px solid rgba(16,185,129,0.25);
      color: var(--c5);
    }

    .mode-tag.normal {
      background: rgba(123,110,246,0.1);
      border: 1px solid rgba(123,110,246,0.25);
      color: var(--c1);
    }

    .src-btn {
      font-family: 'Geist Mono', monospace;
      font-size: 10px;
      color: var(--text3);
      background: none;
      border: none;
      cursor: pointer;
      padding: 0;
      display: flex;
      align-items: center;
      gap: 4px;
      transition: color 0.2s;
    }

    .src-btn:hover { color: var(--c1); }

    .src-panel {
      background: var(--s2);
      border: 1px solid var(--border);
      border-left: 2px solid var(--c1);
      border-radius: 0 12px 12px 12px;
      padding: 12px 14px;
      font-family: 'Geist Mono', monospace;
      font-size: 10.5px;
      color: var(--text3);
      line-height: 1.6;
      max-height: 150px;
      overflow-y: auto;
      animation: slideDown 0.2s ease;
    }

    .src-title {
      font-size: 9px;
      letter-spacing: 0.15em;
      color: var(--c1);
      text-transform: uppercase;
      margin-bottom: 8px;
      font-weight: 500;
    }

    .src-chunk {
      padding: 6px 10px;
      background: rgba(255,255,255,0.02);
      border-radius: 8px;
      margin-bottom: 6px;
      word-break: break-word;
      white-space: pre-wrap;
    }

    /* Typing indicator */
    .typing-row {
      display: flex;
      gap: 12px;
      animation: msgSlide 0.3s ease;
    }

    .typing-bubble {
      display: flex;
      align-items: center;
      gap: 5px;
      padding: 14px 18px;
      background: rgba(255,255,255,0.04);
      border: 1px solid var(--border);
      border-radius: 4px 16px 16px 16px;
      backdrop-filter: blur(8px);
    }

    .tdot {
      width: 7px;
      height: 7px;
      border-radius: 50%;
      animation: tdotBounce 1.4s ease infinite;
    }

    .tdot:nth-child(1) { background: var(--c1); animation-delay: 0s; }
    .tdot:nth-child(2) { background: var(--c2); animation-delay: 0.18s; }
    .tdot:nth-child(3) { background: var(--c3); animation-delay: 0.36s; }

    @keyframes tdotBounce {
      0%,60%,100% { transform:translateY(0); opacity:0.5; }
      30% { transform:translateY(-8px); opacity:1; }
    }

    /* ── INPUT AREA ── */
    .input-area {
      padding: 16px 28px 20px;
      background: rgba(6,6,8,0.7);
      backdrop-filter: blur(20px);
      border-top: 1px solid var(--border);
      position: relative;
      z-index: 10;
    }

    .input-shell {
      background: rgba(255,255,255,0.04);
      border: 1px solid var(--border-hi);
      border-radius: 20px;
      padding: 12px 12px 12px 20px;
      display: flex;
      align-items: flex-end;
      gap: 10px;
      transition: border-color 0.3s, box-shadow 0.3s;
      position: relative;
    }

    .input-shell:focus-within {
      border-color: rgba(123,110,246,0.5);
      box-shadow: 0 0 0 3px rgba(123,110,246,0.08), 0 8px 32px rgba(0,0,0,0.3);
    }

    .input-shell textarea {
      flex: 1;
      background: none;
      border: none;
      outline: none;
      font-family: 'Cabinet Grotesk', sans-serif;
      font-size: 14px;
      font-weight: 400;
      color: var(--text);
      resize: none;
      max-height: 140px;
      line-height: 1.6;
    }

    .input-shell textarea::placeholder { color: var(--text3); }

    .input-actions { display: flex; gap: 8px; align-items: center; }

    .send-btn {
      width: 42px;
      height: 42px;
      border-radius: 14px;
      border: none;
      background: linear-gradient(135deg, var(--c1), var(--c2));
      color: white;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 17px;
      flex-shrink: 0;
      transition: all 0.25s cubic-bezier(0.4,0,0.2,1);
      box-shadow: 0 4px 16px rgba(123,110,246,0.3);
    }

    .send-btn:hover:not(:disabled) {
      transform: scale(1.08) rotate(-8deg);
      box-shadow: 0 6px 24px rgba(123,110,246,0.5);
    }

    .send-btn:disabled {
      opacity: 0.3;
      cursor: not-allowed;
      background: var(--s4);
      box-shadow: none;
      transform: none;
    }

    .input-bar-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 8px;
      padding: 0 4px;
    }

    .input-shortcut {
      font-family: 'Geist Mono', monospace;
      font-size: 10px;
      color: var(--text3);
    }

    kbd {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: 1px 5px;
      background: var(--s3);
      border: 1px solid var(--s4);
      border-radius: 4px;
      font-family: 'Geist Mono', monospace;
      font-size: 9px;
      color: var(--text3);
      margin: 0 2px;
    }

    /* ── TOASTS ── */
    .toast-stack {
      position: fixed;
      bottom: 24px;
      right: 24px;
      z-index: 9999;
      display: flex;
      flex-direction: column;
      gap: 8px;
      pointer-events: none;
    }

    .toast {
      padding: 12px 18px;
      border-radius: 14px;
      font-size: 12px;
      font-family: 'Geist Mono', monospace;
      display: flex;
      align-items: center;
      gap: 10px;
      animation: toastEnter 0.4s cubic-bezier(0.4,0,0.2,1);
      max-width: 340px;
      backdrop-filter: blur(20px);
      pointer-events: all;
    }

    @keyframes toastEnter {
      from { opacity:0; transform:translateX(24px) scale(0.95); }
      to { opacity:1; transform:translateX(0) scale(1); }
    }

    .toast.success {
      background: rgba(16,185,129,0.12);
      border: 1px solid rgba(16,185,129,0.3);
      color: #6ee7b7;
    }

    .toast.error {
      background: rgba(239,68,68,0.12);
      border: 1px solid rgba(239,68,68,0.3);
      color: #fca5a5;
    }

    .toast.info {
      background: rgba(123,110,246,0.12);
      border: 1px solid rgba(123,110,246,0.3);
      color: #a89ff8;
    }

    /* scrollbar */
    ::-webkit-scrollbar { width: 4px; }
    ::-webkit-scrollbar-track { background: transparent; }
    ::-webkit-scrollbar-thumb { background: var(--s4); border-radius: 99px; }
  `}</style>
);

// ── Sub components ────────────────────────────────────────────────────────────
function SourcePanel({ sources }) {
  const [open, setOpen] = useState(false);
  if (!sources?.length) return null;
  return (
    <>
      <button className="src-btn" onClick={() => setOpen(o => !o)}>
        {open ? "▲" : "▼"} {open ? "hide context" : `${sources.length} source${sources.length > 1 ? "s" : ""}`}
      </button>
      {open && (
        <div className="src-panel">
          <div className="src-title">Retrieved Context</div>
          {sources.map((s, i) => (
            <div key={i} className="src-chunk">
              {s.slice(0, 320)}{s.length > 320 ? "…" : ""}
            </div>
          ))}
        </div>
      )}
    </>
  );
}

function Msg({ m }) {
  const isUser = m.role === "user";
  return (
    <div className={`msg-row ${isUser ? "user" : ""}`}>
      <div className={`msg-avatar ${isUser ? "human" : "ai"}`}>
        {isUser ? "◎" : "✦"}
      </div>
      <div className="msg-body">
        <div className={`bubble ${isUser ? "human" : "ai"}`}>{m.content}</div>
        {!isUser && (
          <div className="msg-footer">
            <span className={`mode-tag ${m.mode}`}>
              {m.mode === "rag" ? "⟡ RAG" : "◇ General"}
            </span>
            <SourcePanel sources={m.sources} />
          </div>
        )}
      </div>
    </div>
  );
}

const SUGGESTIONS = [
  { icon: "📋", text: "Summarize key points" },
  { icon: "🔍", text: "Find specific info" },
  { icon: "💡", text: "Explain concepts" },
  { icon: "📊", text: "List main topics" },
];

// ── Main App ──────────────────────────────────────────────────────────────────
export default function App() {
  const [pdfs, setPdfs] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [expanded, setExpanded] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [uploading, setUploading] = useState(false);
  const [thinking, setThinking] = useState(false);
  const [drag, setDrag] = useState(false);
  const [toasts, setToasts] = useState([]);
  const endRef = useRef(null);
  const taRef = useRef(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, thinking]);

  const notify = useCallback((msg, type = "info") => {
    const id = Date.now() + Math.random();
    setToasts(p => [...p, { id, msg, type }]);
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 3800);
  }, []);

  const upload = async (file) => {
    if (!file?.name.endsWith(".pdf")) return notify("Only PDF files!", "error");
    setUploading(true);
    const fd = new FormData();
    fd.append("file", file);
    try {
      const r = await fetch(`${API_BASE}/upload-pdf`, { method: "POST", body: fd });
      const d = await r.json();
      if (!r.ok) throw new Error(d.detail);
      const pdf = { pdf_id: d.pdf_id, name: d.filename, chunks: d.chunks_count };
      setPdfs(p => [...p, pdf]);
      setActiveId(d.pdf_id);
      setExpanded(d.pdf_id);
      notify(`✓ ${d.filename} — ${d.chunks_count} chunks`, "success");
    } catch (e) { notify(e.message, "error"); }
    finally { setUploading(false); }
  };

  const removePdf = async (id) => {
    try {
      await fetch(`${API_BASE}/remove-pdf/${id}`, { method: "DELETE" });
      setPdfs(p => p.filter(x => x.pdf_id !== id));
      if (activeId === id) setActiveId(null);
      notify("PDF removed · general mode", "info");
    } catch (e) { notify(e.message, "error"); }
  };

  const send = async (text) => {
    const q = (text || input).trim();
    if (!q || thinking) return;
    setMessages(p => [...p, { role: "user", content: q }]);
    setInput("");
    if (taRef.current) { taRef.current.style.height = "auto"; }
    setThinking(true);
    try {
      const r = await fetch(`${API_BASE}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: q,
          pdf_id: activeId || null,
          chat_history: messages.slice(-6).map(m => ({ role: m.role, content: m.content })),
        }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.detail);
      setMessages(p => [...p, { role: "assistant", content: d.answer, mode: d.mode, sources: d.sources }]);
    } catch (e) {
      setMessages(p => [...p, { role: "assistant", content: `Error: ${e.message}`, mode: "normal", sources: [] }]);
    } finally { setThinking(false); }
  };

  const activePdf = pdfs.find(p => p.pdf_id === activeId);
  const isRag = !!activeId && !!activePdf;

  return (
    <>
      <GlobalStyles />

      {/* Animated background */}
      <div className="mesh-bg">
        <div className="mesh-orb orb1" />
        <div className="mesh-orb orb2" />
        <div className="mesh-orb orb3" />
        <div className="mesh-orb orb4" />
      </div>
      <div className="grid-overlay" />

      <div className="app">
        {/* ── SIDEBAR ── */}
        <aside className="sidebar">
          {/* Brand */}
          <div className="brand">
            <div className="brand-logo">
              <div className="brand-icon">✦</div>
              <div>
                <div className="brand-name">DocMind</div>
              </div>
            </div>
            <div className="brand-sub">RAG · PDF Intelligence</div>
          </div>

          {/* Status */}
          <div className={`status-bar ${isRag ? "rag" : "normal"}`}>
            <div className="status-dot" />
            {isRag
              ? `RAG · ${activePdf.name.slice(0, 20)}${activePdf.name.length > 20 ? "…" : ""}`
              : "General Mode · No PDF Active"}
          </div>

          {/* Upload */}
          <div className="upload-wrap">
            <div
              className={`upload-zone ${drag ? "drag" : ""}`}
              onDragOver={e => { e.preventDefault(); setDrag(true); }}
              onDragLeave={() => setDrag(false)}
              onDrop={e => { e.preventDefault(); setDrag(false); upload(e.dataTransfer.files[0]); }}
            >
              <input type="file" accept=".pdf" disabled={uploading}
                onChange={e => upload(e.target.files[0])} />
              <div className="upload-icon-ring">
                <div className="upload-icon-inner">
                  {uploading ? "⟳" : "📄"}
                </div>
              </div>
              <div className="upload-title">{uploading ? "Processing…" : "Upload PDF"}</div>
              <div className="upload-hint">
                {uploading ? "chunking · embedding · indexing" : "drag & drop or click"}
              </div>
              {uploading && (
                <div className="upload-progress">
                  <div className="upload-progress-bar" />
                </div>
              )}
            </div>
          </div>

          {/* PDF list */}
          <div className="pdf-section">
            {pdfs.length > 0 && (
              <div className="pdf-section-label">Documents ({pdfs.length})</div>
            )}
            {pdfs.map(pdf => (
              <div
                key={pdf.pdf_id}
                className={`pdf-card ${activeId === pdf.pdf_id ? "active" : ""}`}
              >
                <div className="pdf-card-head"
                  onClick={() => setExpanded(e => e === pdf.pdf_id ? null : pdf.pdf_id)}>
                  <div className="pdf-thumb">📑</div>
                  <div className="pdf-info">
                    <div className="pdf-fname">{pdf.name}</div>
                    <div className="pdf-meta">{pdf.chunks} chunks</div>
                  </div>
                  <span className={`pdf-chevron ${expanded === pdf.pdf_id ? "open" : ""}`}>⌄</span>
                </div>
                {expanded === pdf.pdf_id && (
                  <div className="pdf-body">
                    <button
                      className={`btn-activate ${activeId === pdf.pdf_id ? "on" : ""}`}
                      onClick={() => setActiveId(activeId === pdf.pdf_id ? null : pdf.pdf_id)}
                    >
                      {activeId === pdf.pdf_id ? "✦ Active" : "Activate"}
                    </button>
                    <button className="btn-del" onClick={() => removePdf(pdf.pdf_id)}>✕</button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </aside>

        {/* ── MAIN ── */}
        <main className="main">
          {/* Header */}
          <div className="chat-header">
            <div className="header-info">
              <div className="header-title">
                {isRag ? (
                  <>Chat <span className="active-pdf-chip">{activePdf.name}</span></>
                ) : "AI Assistant"}
              </div>
              <div className="header-sub">
                {isRag
                  ? `Sliding window RAG · ${activePdf.chunks} indexed chunks`
                  : "Upload a PDF to unlock document intelligence"}
              </div>
            </div>
            <div className="header-actions">
              {messages.length > 0 && (
                <button className="btn-ghost" onClick={() => setMessages([])}>
                  clear chat
                </button>
              )}
            </div>
          </div>

          {/* Messages */}
          <div className="messages-wrap">
            {messages.length === 0 ? (
              <div className="empty">
                <div className="empty-glyph">✦</div>
                <div className="empty-headline">
                  {isRag ? "What would you like to know?" : "How can I help?"}
                </div>
                <div className="empty-desc">
                  {isRag
                    ? `DocMind will intelligently retrieve the most relevant passages from your PDF using sliding window RAG and craft a precise answer.`
                    : "Upload a PDF from the sidebar to chat with your documents, or ask me anything in general mode."}
                </div>
                {isRag && (
                  <div className="suggestion-grid">
                    {SUGGESTIONS.map(s => (
                      <div key={s.text} className="suggestion-card" onClick={() => send(s.text)}>
                        <div className="suggestion-icon">{s.icon}</div>
                        <div className="suggestion-text">{s.text}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              messages.map((m, i) => <Msg key={i} m={m} />)
            )}
            {thinking && (
              <div className="typing-row">
                <div className="msg-avatar ai">✦</div>
                <div className="typing-bubble">
                  <div className="tdot" /><div className="tdot" /><div className="tdot" />
                </div>
              </div>
            )}
            <div ref={endRef} />
          </div>

          {/* Input */}
          <div className="input-area">
            <div className="input-shell">
              <textarea
                ref={taRef}
                rows={1}
                placeholder={isRag ? "Ask about your document…" : "Ask anything…"}
                value={input}
                onChange={e => {
                  setInput(e.target.value);
                  e.target.style.height = "auto";
                  e.target.style.height = Math.min(e.target.scrollHeight, 140) + "px";
                }}
                onKeyDown={e => {
                  if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); }
                }}
              />
              <div className="input-actions">
                <button
                  className="send-btn"
                  onClick={() => send()}
                  disabled={!input.trim() || thinking}
                >
                  ➤
                </button>
              </div>
            </div>
            <div className="input-bar-footer">
              <span className="input-shortcut">
                <kbd>↵</kbd> send &nbsp;·&nbsp; <kbd>⇧↵</kbd> newline
              </span>
              <span className="input-shortcut">{input.length > 0 ? `${input.length} chars` : ""}</span>
            </div>
          </div>
        </main>
      </div>

      {/* Toasts */}
      <div className="toast-stack">
        {toasts.map(t => (
          <div key={t.id} className={`toast ${t.type}`}>
            <span>{t.type === "success" ? "✓" : t.type === "error" ? "✕" : "◈"}</span>
            {t.msg}
          </div>
        ))}
      </div>
    </>
  );
}