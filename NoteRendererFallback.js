// content/NoteRenderer.js — DOM layer.
// Creates a Shadow DOM host so note styles never conflict with the host page.
// Exposes window.WS.NoteRenderer

window.WS = window.WS || {};

// ─── Styles (scoped inside Shadow DOM) ────────────────────────────────────────
const WS_STYLES = `
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :host { all: initial; }

  .ws-note {
    position: absolute;
    width: 248px;
    min-height: 160px;
    border-radius: 14px;
    box-shadow: 0 8px 30px rgba(0,0,0,0.16), 0 2px 8px rgba(0,0,0,0.10);
    display: flex;
    flex-direction: column;
    pointer-events: all;
    font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
    transition: box-shadow 0.2s ease, transform 0.15s ease;
    z-index: 2147483647;
    animation: ws-pop 0.25s cubic-bezier(0.34,1.56,0.64,1);
    overflow: hidden;
  }

  .ws-note:hover {
    box-shadow: 0 16px 48px rgba(0,0,0,0.20), 0 4px 12px rgba(0,0,0,0.12);
    transform: translateY(-2px);
  }

  .ws-note.ws-dragging {
    box-shadow: 0 24px 60px rgba(0,0,0,0.28);
    transform: rotate(1.5deg) scale(1.02);
    transition: none;
    opacity: 0.92;
    cursor: grabbing !important;
  }

  @keyframes ws-pop {
    from { opacity: 0; transform: scale(0.85) translateY(10px); }
    to   { opacity: 1; transform: scale(1)    translateY(0);    }
  }

  /* ── Header ── */
  .ws-note-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 9px 10px 8px;
    cursor: grab;
    user-select: none;
    border-radius: 14px 14px 0 0;
    flex-shrink: 0;
  }
  .ws-note-header:active { cursor: grabbing; }

  .ws-note-icon { font-size: 13px; line-height: 1; }

  /* ── Author avatar ── */
  .ws-note-left { display: flex; align-items: center; gap: 6px; }

  .ws-avatar {
    position: relative;
    width: 20px; height: 20px;
    border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    font-size: 8px; font-weight: 800;
    color: #fff;
    letter-spacing: -0.3px;
    flex-shrink: 0;
    cursor: default;
    box-shadow: 0 1px 4px rgba(0,0,0,0.28);
  }
  /* Tooltip via CSS attr() — zero extra DOM */
  .ws-avatar::after {
    content: attr(data-name);
    position: absolute;
    bottom: calc(100% + 5px);
    left: 50%;
    transform: translateX(-50%);
    background: rgba(10,10,10,0.88);
    color: #fff;
    font-size: 10px;
    font-weight: 500;
    letter-spacing: 0;
    padding: 3px 8px;
    border-radius: 5px;
    white-space: nowrap;
    pointer-events: none;
    opacity: 0;
    transition: opacity 0.18s;
    z-index: 10;
  }
  .ws-avatar:hover::after { opacity: 1; }

  .ws-note-actions { display: flex; gap: 5px; align-items: center; }

  .ws-btn {
    width: 20px; height: 20px;
    border: none; border-radius: 50%;
    cursor: pointer;
    font-size: 13px; line-height: 1;
    display: flex; align-items: center; justify-content: center;
    background: rgba(0,0,0,0.13);
    color: rgba(0,0,0,0.6);
    transition: background 0.15s, transform 0.15s, color 0.15s;
    pointer-events: all;
    padding: 0;
  }
  .ws-btn {
    background: transparent; border: none;
    cursor: pointer; opacity: 0.4; transition: opacity 0.2s, background 0.2s;
    width: 24px; height: 24px; border-radius: 4px;
    display: flex; align-items: center; justify-content: center;
    color: #18181b; padding: 0;
  }
  .ws-btn svg { width: 14px; height: 14px; stroke-width: 2px; }
  .ws-btn:hover { opacity: 0.8; background: rgba(0,0,0,0.08); }
  .ws-btn:active { background: rgba(0,0,0,0.12); }

  /* ── Body ── */
  .ws-note-body {
    flex: 1; position: relative; display: flex; flex-direction: column; min-height: 0;
  }
  .ws-note-text {
    flex: 1; width: 100%; border: none; background: transparent;
    resize: none; padding: 12px; font-family: inherit; font-size: 14px;
    line-height: 1.5; color: #18181b; outline: none;
    min-height: 60px; position: relative; z-index: 1;
  }
  .ws-note-text::placeholder { color: rgba(0,0,0,0.3); }
  /* When media present, keep text always full-height and accessible */
  .ws-note.ws-has-media .ws-note-text { flex: 1; min-height: 60px; }

  /* ── Footer ── */
  .ws-note-footer {
    display: flex; justify-content: space-between; align-items: center;
    padding: 8px 12px; border-top: 1px solid rgba(0,0,0,0.04);
    background: rgba(0,0,0,0.02); gap: 8px;
  }
  .ws-color-picker { display: flex; gap: 5px; flex: 1; align-items: center; }

  .ws-color-dot {
    width: 13px; height: 13px;
    border-radius: 50%;
    border: 2px solid transparent;
    cursor: pointer;
    transition: transform 0.15s, border-color 0.15s;
    padding: 0;
    outline: none;
  }
  .ws-color-dot:hover,
  .ws-color-dot.ws-active { transform: scale(1.4); border-color: rgba(0,0,0,0.45); }
  .ws-color-dot[data-color="yellow"] { background: #f9c900; }
  .ws-color-dot[data-color="pink"]   { background: #e91e8c; }
  .ws-color-dot[data-color="blue"]   { background: #1976d2; }
  .ws-color-dot[data-color="green"]  { background: #388e3c; }
  .ws-color-dot[data-color="purple"] { background: #7b1fa2; }

  .ws-note-date {
    font-size: 10px;
    color: rgba(0,0,0,0.38);
    white-space: nowrap;
  }

  /* ── Minimized ── */
  .ws-note.ws-minimized .ws-note-body,
  .ws-note.ws-minimized .ws-note-footer { display: none; }
  .ws-note.ws-minimized { min-height: 0; border-radius: 14px; }
  .ws-note.ws-minimized .ws-note-header { border-radius: 14px; }

  /* ── Color Themes ── */
  .ws-note[data-color="yellow"] { background: #fffde7; }
  .ws-note[data-color="yellow"] .ws-note-header { background: #fff176; }

  .ws-note[data-color="pink"] { background: #fce4ec; }
  .ws-note[data-color="pink"] .ws-note-header { background: #f8bbd0; }

  .ws-note[data-color="blue"] { background: #e3f2fd; }
  .ws-note[data-color="blue"] .ws-note-header { background: #bbdefb; }

  .ws-note[data-color="green"] { background: #e8f5e9; }
  .ws-note[data-color="green"] .ws-note-header { background: #c8e6c9; }

  .ws-note[data-color="purple"] { background: #ede7f6; }
  .ws-note[data-color="purple"] .ws-note-header { background: #d1c4e9; }

  /* ── Resize handle ── */
  .ws-resize-handle {
    position: absolute;
    bottom: 0; right: 0;
    width: 14px; height: 14px;
    cursor: se-resize;
    opacity: 0.3;
    background: linear-gradient(135deg, transparent 50%, rgba(0,0,0,0.5) 50%);
    border-radius: 0 0 14px 0;
    transition: opacity 0.15s;
  }
  .ws-note:hover .ws-resize-handle { opacity: 0.6; }

  /* ── Media Menu ── */
  .ws-media-menu-container {
    position: relative;
    display: flex; align-items: center; justify-content: center;
  }
  .ws-media-menu-btn {
    background: transparent; border: none; cursor: pointer;
    opacity: 0.5; transition: opacity 0.2s, background 0.2s;
    width: 22px; height: 22px; border-radius: 4px;
    display: flex; align-items: center; justify-content: center;
    color: #18181b; padding: 0;
  }
  .ws-media-menu-btn:hover { opacity: 0.8; background: rgba(0,0,0,0.06); }
  .ws-media-menu-btn svg { width: 14px; height: 14px; }
  
  .ws-media-dropdown {
    position: absolute; bottom: 100%; right: 0; margin-bottom: 6px;
    background: #fff; border-radius: 8px; box-shadow: 0 4px 16px rgba(0,0,0,0.15);
    display: flex; flex-direction: column; padding: 4px;
    opacity: 0; pointer-events: none; transform: translateY(4px);
    transition: opacity 0.2s, transform 0.2s; z-index: 10;
    min-width: 110px; border: 1px solid rgba(0,0,0,0.08);
  }
  .ws-media-menu-container:hover .ws-media-dropdown,
  .ws-media-menu-container:focus-within .ws-media-dropdown {
    opacity: 1; pointer-events: all; transform: translateY(0);
  }
  
  .ws-media-item {
    background: transparent; border: none; border-radius: 4px;
    padding: 6px 10px; font-size: 13px; font-family: inherit;
    cursor: pointer; display: flex; align-items: center; gap: 8px;
    color: #3f3f46; transition: background 0.15s; width: 100%;
    text-align: left;
  }
  .ws-media-item:hover { background: #f4f4f5; color: #18181b; }
  .ws-media-item svg { width: 14px; height: 14px; opacity: 0.7; }

  /* ── Floating Media Zone (absolutely positioned within note body) ── */
  .ws-media-zone {
    position: absolute;
    z-index: 3;
    top: 8px; right: 8px;
    width: 140px; height: 110px;
    min-width: 80px; min-height: 60px;
    border-radius: 10px;
    overflow: hidden;
    box-shadow: 0 6px 24px rgba(0,0,0,0.28), 0 2px 6px rgba(0,0,0,0.18);
    display: none; /* hidden until media added */
    background: #000;
    cursor: default;
    transition: box-shadow 0.15s;
  }
  .ws-note.ws-has-media .ws-media-zone { display: block; }
  .ws-media-zone:hover {
    box-shadow: 0 10px 32px rgba(0,0,0,0.36), 0 2px 8px rgba(0,0,0,0.2);
  }
  .ws-media-zone img  { width: 100%; height: 100%; object-fit: cover; display: block; }
  .ws-media-zone video { width: 100%; height: 100%; border: none; display: block; object-fit: cover; }
  .ws-media-zone iframe { width: 100%; height: 100%; border: none; display: block; }

  /* Toolbar (drag handle + remove btn, shown on hover) */
  .ws-media-toolbar {
    position: absolute; top: 0; left: 0; right: 0;
    height: 28px;
    background: linear-gradient(to bottom, rgba(0,0,0,0.72) 0%, transparent 100%);
    display: flex; align-items: center; justify-content: space-between;
    padding: 0 5px;
    opacity: 0; transition: opacity 0.18s;
    z-index: 4; cursor: grab;
    border-radius: 10px 10px 0 0;
  }
  .ws-media-toolbar:active { cursor: grabbing; }
  .ws-media-zone:hover .ws-media-toolbar { opacity: 1; }

  .ws-media-grip {
    color: rgba(255,255,255,0.75);
    font-size: 12px; letter-spacing: 1.5px;
    user-select: none; pointer-events: none; line-height: 1;
  }
  .ws-media-remove {
    width: 18px; height: 18px; border-radius: 4px;
    background: rgba(220,38,38,0.85); border: none;
    color: #fff; cursor: pointer; font-size: 11px; line-height: 1;
    display: flex; align-items: center; justify-content: center;
    transition: background 0.15s, transform 0.1s;
    flex-shrink: 0;
  }
  .ws-media-remove:hover { background: #dc2626; transform: scale(1.12); }

  /* Resize grip (bottom-right corner of media) */
  .ws-media-resizer {
    position: absolute; bottom: 0; right: 0;
    width: 22px; height: 22px; cursor: se-resize;
    background: linear-gradient(135deg, transparent 40%, rgba(255,255,255,0.7) 40%);
    opacity: 0.3; transition: opacity 0.18s;
    z-index: 5;
    border-radius: 0 0 10px 0;
  }
  .ws-media-zone:hover .ws-media-resizer { opacity: 1; }

  /* ── Navigation spotlight ── */
  .ws-note.ws-spotlight {
    box-shadow: 0 0 0 3px #facc15, 0 20px 60px rgba(0,0,0,0.35) !important;
    transform: scale(1.03) translateY(-3px) !important;
    transition: box-shadow 0.3s ease, transform 0.3s ease, opacity 0.3s ease !important;
    z-index: 10;
    opacity: 1 !important;
  }
  .ws-note.ws-dimmed {
    opacity: 0.28;
    filter: blur(0.8px);
    transform: scale(0.99) !important;
    transition: opacity 0.3s ease, filter 0.3s ease, transform 0.3s ease !important;
  }
  @keyframes ws-flash {
    0%   { box-shadow: 0 8px 30px rgba(0,0,0,0.16), 0 0 0 0px  rgba(250,204,21,0.9); }
    30%  { box-shadow: 0 8px 30px rgba(0,0,0,0.16), 0 0 0 5px  rgba(250,204,21,0.7); }
    70%  { box-shadow: 0 8px 30px rgba(0,0,0,0.16), 0 0 0 5px  rgba(250,204,21,0.3); }
    100% { box-shadow: 0 8px 30px rgba(0,0,0,0.16), 0 0 0 0px  rgba(250,204,21,0); }
  }
  .ws-note.ws-flash { animation: ws-flash 1.8s ease forwards; }
`;


// ─── Color palette metadata ────────────────────────────────────────────────────
const COLORS = ['yellow', 'pink', 'blue', 'green', 'purple'];

// ─── Helper: format relative time ─────────────────────────────────────────────
function relativeTime(isoString) {
  const diff = Date.now() - new Date(isoString).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'Just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

// ─── Renderer ─────────────────────────────────────────────────────────────────
window.WS.NoteRenderer = {
  shadowHost: null,
  shadowRoot: null,
  noteEls: new Map(), // id → HTMLElement
  _toolbar: null,
  _allVisible: true,

  /** Bootstrap: create shadow host and attach shadow root. */
  init() {
    if (this.shadowHost) return; // already initialized

    this.shadowHost = document.createElement('div');
    this.shadowHost.id = 'webstickly-host';
    // position:absolute + top/left:0 makes this host the coordinate origin
    // for all absolutely-positioned notes inside the shadow root.
    // Notes therefore scroll with the page — anchored to content, not the viewport.
    Object.assign(this.shadowHost.style, {
      position: 'absolute',
      top: '0', left: '0',
      width: '0', height: '0',
      zIndex: '2147483647',
      pointerEvents: 'none',
      overflow: 'visible',
    });
    document.body.appendChild(this.shadowHost);

    this.shadowRoot = this.shadowHost.attachShadow({ mode: 'open' });

    const style = document.createElement('style');
    style.textContent = WS_STYLES;
    this.shadowRoot.appendChild(style);

    // this._initToolbar(); // <-- Commented out to fix Uncaught TypeError
  },

  /** Re-attach shadow host to body (or inner scrolling container) if an SPA replaced it. */
  reattachIfNeeded() {
    if (!this.shadowHost) { this.init(); return; }
    
    let container = document.body;
    let maxArea = 0;
    
    // If body or html naturally scrolls, stick to body
    const bodyScrolls = document.body.scrollHeight > document.innerHeight || document.documentElement.scrollHeight > window.innerHeight;
    
    if (!bodyScrolls) {
      // Find the largest scrolling div/main (for SPAs like ChatGPT)
      const els = document.querySelectorAll('div, main, section');
      for (const el of els) {
        if (el.scrollHeight > el.clientHeight && el.clientHeight > 0) {
          const style = window.getComputedStyle(el);
          if (style.overflowY === 'auto' || style.overflowY === 'scroll' || style.overflowY === 'overlay') {
            const area = el.clientWidth * el.clientHeight;
            if (area > maxArea) {
              maxArea = area;
              container = el;
            }
          }
        }
      }
    }
    
    // Ensure container is relative so absolute notes anchor to its content
    if (container !== document.body) {
      const style = window.getComputedStyle(container);
      if (style.position === 'static') container.style.position = 'relative';
    }
    
    if (!container.contains(this.shadowHost)) {
      container.appendChild(this.shadowHost);
    }
  },


  /** Render an array of notes (on page load). */
  renderAll(notes) {
    notes.forEach((note) => this.renderNote(note));
  },

  /** Render a single note card into the shadow DOM. */
  renderNote(note) {
    if (this.noteEls.has(note.id)) return;

    const color    = note.metadata?.color || 'yellow';
    const minimized = note.metadata?.minimized || false;
    const author    = note.author || null;
    const hasMedia  = !!note.metadata?.media;
    
    const avatarHtml = author
      ? `<div class="ws-avatar" style="background:${author.color}" data-name="${author.name}">${author.initials}</div>`
      : '';

    if (note.metadata?.hidden) return;

    const el = document.createElement('div');
    el.className = `ws-note${minimized ? ' ws-minimized' : ''}${hasMedia ? ' ws-has-media' : ''}`;
    el.dataset.color = color;
    el.dataset.id = note.id;
    el.style.left = `${Math.max(0, note.x)}px`;
    el.style.top  = `${Math.max(0, note.y)}px`;
    if (note.width)  el.style.width  = `${note.width}px`;
    if (note.height) el.style.height = `${note.height}px`;

    const mediaHtml = this._buildMediaHtml(note.metadata?.media);
    
    // Lucide SVG Icons
    const ICONS = {
      pin: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="17" x2="12" y2="22"></line><path d="M5 17h14v-1.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.68V6a3 3 0 0 0-3-3 3 3 0 0 0-3 3v4.68a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24Z"></path></svg>',
      copy: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>',
      min: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line></svg>',
      max: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>',
      del: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>',
      img: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>',
      vid: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="23 7 16 12 23 17 23 7"></polygon><rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect></svg>',
      menu: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="1"></circle><circle cx="12" cy="5" r="1"></circle><circle cx="12" cy="19" r="1"></circle></svg>'
    };

    el.innerHTML = `
      <div class="ws-note-header" title="Drag to move">
        <div class="ws-note-left">
          <span class="ws-note-icon">${ICONS.pin}</span>
          ${avatarHtml}
        </div>
        <div class="ws-note-actions">
          <button class="ws-btn ws-btn-copy" title="Copy text">${ICONS.copy}</button>
          <button class="ws-btn ws-btn-minimize" title="${minimized ? 'Expand' : 'Minimize'}">${minimized ? ICONS.max : ICONS.min}</button>
          <button class="ws-btn ws-btn-delete" title="Delete note">${ICONS.del}</button>
        </div>
      </div>
      <div class="ws-note-body">
        <textarea class="ws-note-text" placeholder="Write your note here…" maxlength="2000">${note.text || ''}</textarea>
      </div>
      <div class="ws-media-zone" id="mz-${note.id}">${mediaHtml ? `
        <div class="ws-media-toolbar"><span class="ws-media-grip">⠿⠿</span><button class="ws-media-remove" title="Remove">✕</button></div>
        ${mediaHtml}
        <div class="ws-media-resizer"></div>` : ''}</div>
      <div class="ws-note-footer">
        <div class="ws-color-picker">
          ${COLORS.map((c) => `<button class="ws-color-dot${c === color ? ' ws-active' : ''}" data-color="${c}" title="${c}" aria-label="Set color ${c}"></button>`).join('')}
        </div>
        
        <div class="ws-media-menu-container">
          <button class="ws-media-menu-btn" title="Add Media">${ICONS.menu}</button>
          <div class="ws-media-dropdown">
            <button class="ws-media-item ws-media-btn-img">${ICONS.img} Image</button>
            <button class="ws-media-item ws-media-btn-vid">${ICONS.vid} Video</button>
          </div>
        </div>

        <span class="ws-note-date">${relativeTime(note.createdAt)}</span>
      </div>
      <div class="ws-resize-handle" title="Resize"></div>
    `;

    this._attachEvents(el, note);
    this.shadowRoot.appendChild(el);
    this.noteEls.set(note.id, el);
  },

  _buildMediaHtml(media) {
    if (!media) return '';
    if (media.type === 'image') return `<img src="${media.src}" alt="note image" />`;
    if (media.type === 'video') {
      const yt = media.src.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]+)/);
      const vm = media.src.match(/vimeo\.com\/(\d+)/);
      if (yt) return `<iframe src="https://www.youtube.com/embed/${yt[1]}" allowfullscreen></iframe>`;
      if (vm) return `<iframe src="https://player.vimeo.com/video/${vm[1]}" allowfullscreen></iframe>`;
      return `<video src="${media.src}" controls></video>`;
    }
    return '';
  },

  /** Un-hide a note that was hidden (metadata.hidden=true). */
  showHiddenNote(id) {
    window.WS.NoteManager.update(id, { metadata: { hidden: false } }).then(note => {
      if (note) this.renderNote(note);
    });
  },

  /** Remove a note element from the DOM. */
  removeNote(id) {
    const el = this.noteEls.get(id);
    if (!el) return;
    el.style.animation = 'none';
    el.style.transition = 'opacity 0.2s, transform 0.2s';
    el.style.opacity = '0';
    el.style.transform = 'scale(0.85)';
    setTimeout(() => { el.remove(); }, 200);
    this.noteEls.delete(id);
  },

  /** Remove all note elements from the DOM. */
  clearAll() {
    this.noteEls.forEach((el) => el.remove());
    this.noteEls.clear();
  },

  /**
   * Show or hide all notes globally (on/off toggle).
   * Uses opacity + pointer-events for a smooth feel.
   */
  setVisible(visible) {
    if (!this.shadowHost) return;
    this.shadowHost.style.transition = 'opacity 0.25s ease';
    this.shadowHost.style.opacity    = visible ? '1' : '0';
    this.shadowHost.style.pointerEvents = visible ? 'none' : 'none';
    // Fully remove from interaction when hidden
    setTimeout(() => {
      if (!this.shadowHost) return;
      this.shadowHost.style.display = visible ? '' : 'none';
    }, visible ? 0 : 260);
  },

  // ─── Private: wire up all event listeners ──────────────────────────────────

  _attachEvents(el, note) {
    const id = note.id;

    // ── Drag ──────────────────────────────────────────────────────────────────
    const header = el.querySelector('.ws-note-header');
    this._makeDraggable(el, header, id);

    // ── Resize ────────────────────────────────────────────────────────────────
    const resizeHandle = el.querySelector('.ws-resize-handle');
    this._makeResizable(el, resizeHandle, id);

    // ── Text edit (debounced save) ─────────────────────────────────────────────
    const textarea = el.querySelector('.ws-note-text');
    let saveTimer = null;
    textarea.addEventListener('input', () => {
      clearTimeout(saveTimer);
      saveTimer = setTimeout(() => {
        window.WS.NoteManager.update(id, { text: textarea.value });
      }, 600);
    });

    // ── Copy button ────────────────────────────────────────────────────────────
    const copyBtn = el.querySelector('.ws-btn-copy');
    copyBtn?.addEventListener('click', (e) => {
      e.stopPropagation();
      const text = textarea?.value || note.text || '';
      navigator.clipboard.writeText(text).then(() => {
        const origText = copyBtn.innerHTML;
        copyBtn.textContent = '✓';
        setTimeout(() => { copyBtn.innerHTML = origText; }, 1200);
      });
    });

    // ── Minimize / Expand button ───────────────────────────────────────────────
    const ICON_MIN = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line></svg>';
    const ICON_MAX = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>';
    const minBtn = el.querySelector('.ws-btn-minimize');
    minBtn?.addEventListener('click', async (e) => {
      e.stopPropagation();
      const isMinimized = el.classList.toggle('ws-minimized');
      minBtn.innerHTML = isMinimized ? ICON_MAX : ICON_MIN;
      minBtn.title = isMinimized ? 'Expand' : 'Minimize';
      await window.WS.NoteManager.update(id, { metadata: { minimized: isMinimized } });
    });

    // ── Delete button ──────────────────────────────────────────────────────────
    const delBtn = el.querySelector('.ws-btn-delete');
    delBtn?.addEventListener('click', async (e) => {
      e.stopPropagation();
      await window.WS.NoteManager.delete(id);
      this.removeNote(id);
    });

    // ── Media helpers ──────────────────────────────────────────────────────────
    const noteBody = el.querySelector('.ws-note-body');

    // Restore saved media position on initial render (if note already has media)
    const existingZone = el.querySelector('.ws-media-zone');
    if (existingZone && note.metadata?.media && note.metadata?.mediaPos) {
      const p = note.metadata.mediaPos;
      Object.assign(existingZone.style, {
        left: `${p.x}px`, top: `${p.y}px`, right: 'auto',
        width: `${p.w}px`, height: `${p.h}px`,
      });
    }
    if (existingZone && note.metadata?.media) {
      const toolbar = existingZone.querySelector('.ws-media-toolbar');
      const resizer  = existingZone.querySelector('.ws-media-resizer');
      const removeBtn = existingZone.querySelector('.ws-media-remove');
      if (removeBtn) removeBtn.addEventListener('click', async (e) => {
        e.stopPropagation();
        el.classList.remove('ws-has-media');
        existingZone.innerHTML = '';
        this._resetMediaZone(existingZone);
        await window.WS.NoteManager.update(id, { metadata: { media: null, mediaPos: null } });
      });
      if (toolbar) this._makeMediaDraggable(existingZone, toolbar, noteBody, id);
      if (resizer)  this._makeMediaResizable(existingZone, resizer, noteBody, id);
    }

    const _setMedia = async (noteId, mediaObj) => {
      const mediaZone = el.querySelector('.ws-media-zone');
      if (!mediaZone) return;
      const contentHtml = this._buildMediaHtml(mediaObj);
      if (!contentHtml) return;

      // Reset to default position (top-right)
      this._resetMediaZone(mediaZone);

      mediaZone.innerHTML =
        `<div class="ws-media-toolbar"><span class="ws-media-grip">⠿⠿</span>` +
        `<button class="ws-media-remove" title="Remove">✕</button></div>` +
        contentHtml +
        `<div class="ws-media-resizer"></div>`;

      el.classList.add('ws-has-media');

      mediaZone.querySelector('.ws-media-remove').addEventListener('click', async (e) => {
        e.stopPropagation();
        el.classList.remove('ws-has-media');
        mediaZone.innerHTML = '';
        this._resetMediaZone(mediaZone);
        await window.WS.NoteManager.update(noteId, { metadata: { media: null, mediaPos: null } });
      });

      this._makeMediaDraggable(mediaZone, mediaZone.querySelector('.ws-media-toolbar'), noteBody, noteId);
      this._makeMediaResizable(mediaZone, mediaZone.querySelector('.ws-media-resizer'), noteBody, noteId);

      await window.WS.NoteManager.update(noteId, { metadata: { media: mediaObj } });
    };

    el.querySelector('.ws-media-btn-img').addEventListener('click', () => {
      const choice = prompt('Enter image URL, or type "file" to upload:');
      if (choice === null) return;
      if (choice.trim().toLowerCase() === 'file') {
        const inp = document.createElement('input');
        inp.type = 'file'; inp.accept = 'image/*';
        inp.onchange = async () => {
          const file = inp.files[0];
          if (!file) return;
          if (file.size > 600_000) { alert('Image too large (max 600KB).'); return; }
          const reader = new FileReader();
          reader.onload = async (e) => {
            const src = e.target.result;
            await _setMedia(id, { type: 'image', src });
          };
          reader.readAsDataURL(file);
        };
        inp.click();
      } else if (choice.trim() !== '') {
        _setMedia(id, { type: 'image', src: choice.trim() });
      }
    });

    el.querySelector('.ws-media-btn-vid').addEventListener('click', async () => {
      const url = prompt('Enter YouTube, Vimeo, or video URL:');
      if (!url) return;
      await _setMedia(id, { type: 'video', src: url });
    });

    // ── Color picker ───────────────────────────────────────────────────────────
    el.querySelectorAll('.ws-color-dot').forEach((btn) => {
      btn.addEventListener('click', async () => {
        const color = btn.dataset.color;
        el.dataset.color = color;
        el.querySelectorAll('.ws-color-dot').forEach((b) => b.classList.remove('ws-active'));
        btn.classList.add('ws-active');
        await window.WS.NoteManager.update(id, { metadata: { color } });
      });
    });
  },

  _makeDraggable(el, handle, id) {
    const THRESHOLD = 6;

    handle.addEventListener('mousedown', (e) => {
      if (e.target.closest('.ws-note-actions')) return;
      e.preventDefault();

      const startX   = e.clientX;
      const startY   = e.clientY;
      const origLeft = parseInt(el.style.left) || 0;
      const origTop  = parseInt(el.style.top)  || 0;
      let dragging   = false;

      const onMove = (e) => {
        const dx = e.clientX - startX;
        const dy = e.clientY - startY;
        if (!dragging) {
          if (Math.abs(dx) < THRESHOLD && Math.abs(dy) < THRESHOLD) return;
          dragging = true;
          el.classList.add('ws-dragging');
        }
        el.style.left = `${Math.max(0, origLeft + dx)}px`;
        el.style.top  = `${Math.max(0, origTop  + dy)}px`;
      };

      const onUp = async () => {
        document.removeEventListener('mousemove', onMove);
        document.removeEventListener('mouseup', onUp);
        if (!dragging) return;
        el.classList.remove('ws-dragging');
        await window.WS.NoteManager.update(id, {
          x: parseInt(el.style.left),
          y: parseInt(el.style.top),
        });
      };

      document.addEventListener('mousemove', onMove);
      document.addEventListener('mouseup', onUp);
    });
  },

  _makeResizable(el, handle, id) {
    handle.addEventListener('mousedown', (e) => {
      e.preventDefault(); e.stopPropagation();

      const startX = e.clientX;
      const startY = e.clientY;
      const origW  = el.offsetWidth;
      const origH  = el.offsetHeight;

      const onMove = (e) => {
        el.style.width  = `${Math.max(200, origW + e.clientX - startX)}px`;
        el.style.height = `${Math.max(120, origH + e.clientY - startY)}px`;
      };

      const onUp = async () => {
        document.removeEventListener('mousemove', onMove);
        document.removeEventListener('mouseup', onUp);
        await window.WS.NoteManager.update(id, {
          width:  parseInt(el.style.width)  || null,
          height: parseInt(el.style.height) || null,
        });
      };

      document.addEventListener('mousemove', onMove);
      document.addEventListener('mouseup', onUp);
    });
  },

  /** Reset media zone to default size and position (top-right corner). */
  _resetMediaZone(zone) {
    zone.style.left   = '';
    zone.style.top    = '8px';
    zone.style.right  = '8px';
    zone.style.width  = '140px';
    zone.style.height = '110px';
  },

  /** Make the floating media zone draggable within the note body. */
  _makeMediaDraggable(mediaEl, handle, container, noteId) {
    const THRESHOLD = 6;

    handle.addEventListener('mousedown', (e) => {
      e.stopPropagation(); e.preventDefault();

      const startX = e.clientX;
      const startY = e.clientY;
      // Snapshot position from actual rendered position (handles right: 8px default too)
      const rect  = mediaEl.getBoundingClientRect();
      const cRect = container.getBoundingClientRect();
      const origLeft = rect.left - cRect.left;
      const origTop  = rect.top  - cRect.top;
      let dragging = false;

      const onMove = (e) => {
        const dx = e.clientX - startX;
        const dy = e.clientY - startY;
        if (!dragging) {
          if (Math.abs(dx) < THRESHOLD && Math.abs(dy) < THRESHOLD) return;
          // Commit absolute position before first move so element doesn't snap
          dragging = true;
          mediaEl.style.right = 'auto';
          mediaEl.style.left  = `${origLeft}px`;
          mediaEl.style.top   = `${origTop}px`;
          handle.style.cursor = 'grabbing';
        }
        const maxLeft = container.offsetWidth  - mediaEl.offsetWidth;
        const maxTop  = container.offsetHeight - mediaEl.offsetHeight;
        mediaEl.style.left = `${Math.max(0, Math.min(maxLeft, origLeft + dx))}px`;
        mediaEl.style.top  = `${Math.max(0, Math.min(Math.max(maxTop, 0), origTop + dy))}px`;
      };

      const onUp = async () => {
        document.removeEventListener('mousemove', onMove);
        document.removeEventListener('mouseup', onUp);
        handle.style.cursor = 'grab';
        if (!dragging) return;
        await window.WS.NoteManager.update(noteId, { metadata: { mediaPos: {
          x: Math.round(parseFloat(mediaEl.style.left)),
          y: Math.round(parseFloat(mediaEl.style.top)),
          w: mediaEl.offsetWidth,
          h: mediaEl.offsetHeight,
        }}});
      };

      document.addEventListener('mousemove', onMove);
      document.addEventListener('mouseup', onUp);
    });
  },

  /** Make the floating media zone resizable. */
  _makeMediaResizable(mediaEl, handle, container, noteId) {
    handle.addEventListener('mousedown', (e) => {
      e.stopPropagation(); e.preventDefault();

      const startX = e.clientX;
      const startY = e.clientY;
      const origW  = mediaEl.offsetWidth;
      const origH  = mediaEl.offsetHeight;

      const onMove = (e) => {
        mediaEl.style.width  = `${Math.max(80, origW + e.clientX - startX)}px`;
        mediaEl.style.height = `${Math.max(60, origH + e.clientY - startY)}px`;
      };

      const onUp = async () => {
        document.removeEventListener('mousemove', onMove);
        document.removeEventListener('mouseup', onUp);
        await window.WS.NoteManager.update(noteId, { metadata: { mediaPos: {
          x: Math.round(parseFloat(mediaEl.style.left) || 0),
          y: Math.round(parseFloat(mediaEl.style.top)  || 0),
          w: mediaEl.offsetWidth,
          h: mediaEl.offsetHeight,
        }}});
      };

      document.addEventListener('mousemove', onMove);
      document.addEventListener('mouseup', onUp);
    });
  },
};
