window.WS=window.WS||{};window.WS.NoteManager={notes:[1,2,3],create:async()=>{const e="ws-demo-custom-"+Date.now(),t=window.innerWidth,o=window.innerHeight,a={id:e,metadata:{color:"yellow"},author:{name:"You",initials:"U",color:"#6366f1"},text:"",x:t/2-124+(Math.random()*40-20),y:window.scrollY+o/2-80+(Math.random()*40-20),createdAt:new Date().toISOString()};localStorage.setItem(`ws_demo_note_${e}`,JSON.stringify(a));const d=`ws_demo_custom_ids_${window.location.pathname}`;let n=JSON.parse(localStorage.getItem(d)||"[]");n.push(e),localStorage.setItem(d,JSON.stringify(n)),window.WS.NoteRenderer.renderNote(a),setTimeout(()=>{const s=window.WS.NoteRenderer.noteEls.get(e);s&&s.querySelector(".ws-note-text").focus()},300)},update:async(e,t)=>{const o=`ws_demo_note_${e}`;let a=JSON.parse(localStorage.getItem(o)||"{}");t.metadata&&(a.metadata={...a.metadata,...t.metadata},delete t.metadata),a={...a,...t},localStorage.setItem(o,JSON.stringify(a))},delete:async e=>{localStorage.removeItem(`ws_demo_note_${e}`);const t=`ws_demo_custom_ids_${window.location.pathname}`;let o=JSON.parse(localStorage.getItem(t)||"[]");o=o.filter(a=>a!==e),localStorage.setItem(t,JSON.stringify(o))}};const p=`
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
    .ws-btn:hover { transform: scale(1.25); }
    .ws-btn-delete:hover { background: #e53935; color: #fff; }
    .ws-btn-minimize:hover { background: rgba(0,0,0,0.22); color: rgba(0,0,0,0.8); }
    .ws-note-body {
      flex: 1;
      padding: 8px 12px 4px;
      display: flex;
      flex-direction: column;
    }
    .ws-note-text {
      width: 100%;
      min-height: 72px;
      border: none;
      background: transparent;
      resize: none;
      font-size: 13px;
      line-height: 1.55;
      color: rgba(0,0,0,0.72);
      font-family: inherit;
      outline: none;
      cursor: text;
    }
    .ws-note-text::placeholder { color: rgba(0,0,0,0.30); }
    .ws-note-footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 6px 10px 8px;
      flex-shrink: 0;
    }
    .ws-color-picker { display: flex; gap: 5px; align-items: center; }
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
    .ws-note-date { font-size: 10px; color: rgba(0,0,0,0.38); white-space: nowrap; }
    .ws-note.ws-minimized .ws-note-body,
    .ws-note.ws-minimized .ws-note-footer { display: none; }
    .ws-note.ws-minimized { min-height: 0; border-radius: 14px; }
    .ws-note.ws-minimized .ws-note-header { border-radius: 14px; }
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
  `;function m(e){return"Just now"}window.WS.NoteRenderer={shadowHost:null,shadowRoot:null,noteEls:new Map,init(){if(this.shadowHost)return;this.shadowHost=document.createElement("div"),this.shadowHost.id="webstickly-host",Object.assign(this.shadowHost.style,{position:"absolute",top:"0",left:"0",width:"0",height:"0",zIndex:"2147483647",pointerEvents:"none",overflow:"visible"}),document.body.appendChild(this.shadowHost),this.shadowRoot=this.shadowHost.attachShadow({mode:"open"});const e=document.createElement("style");e.textContent=p,this.shadowRoot.appendChild(e)},renderAll(e){e.forEach(t=>this.renderNote(t))},renderNote(e){if(this.noteEls.has(e.id))return;const t=e.metadata?.color||"yellow",o=e.metadata?.minimized||!1,a=e.author||null,d=a?`<div class="ws-avatar" style="background:${a.color}" data-name="${a.name}">${a.initials}</div>`:"",n=document.createElement("div");n.className=`ws-note${o?" ws-minimized":""}`,n.dataset.color=t,n.dataset.id=e.id,n.style.left=`${Math.max(0,e.x)}px`,n.style.top=`${Math.max(0,e.y)}px`,n.innerHTML=`
        <div class="ws-note-header" title="Drag to move">
          <div class="ws-note-left">
            <span class="ws-note-icon">📌</span>
            ${d}
            ${window.location.pathname.includes("/webstickly")?"":'<a href="/webstickly" style="font-size:10px; font-weight:700; color:rgba(0,0,0,0.5); text-decoration:none; margin-left:6px; background:rgba(0,0,0,0.06); padding:2px 6px; border-radius:4px; pointer-events:all;" target="_blank">Get WebStickly</a>'}
          </div>
          <div class="ws-note-actions">
            <button class="ws-btn ws-btn-copy" title="Copy text">📋</button>
            <button class="ws-btn ws-btn-minimize" title="${o?"Expand":"Minimize"}">${o?"+":"−"}</button>
            <button class="ws-btn ws-btn-delete" title="Delete note">✕</button>
          </div>
        </div>
        <div class="ws-note-body">
          <textarea class="ws-note-text" placeholder="Write your note here…" maxlength="2000">${e.text||""}</textarea>
        </div>
        <div class="ws-note-footer">
          <div class="ws-color-picker">
            ${["yellow","pink","blue","green","purple"].map(s=>`<button class="ws-color-dot${s===t?" ws-active":""}" data-color="${s}" title="${s}" aria-label="Set color ${s}"></button>`).join("")}
          </div>
          <span class="ws-note-date">${m(e.createdAt)}</span>
        </div>
        <div class="ws-resize-handle" title="Resize"></div>
      `,this._attachEvents(n,e),this.shadowRoot.appendChild(n),this.noteEls.set(e.id,n)},removeNote(e){const t=this.noteEls.get(e);t&&(t.style.animation="none",t.style.transition="opacity 0.2s, transform 0.2s",t.style.opacity="0",t.style.transform="scale(0.85)",setTimeout(()=>{t.remove()},200),this.noteEls.delete(e))},_attachEvents(e,t){const o=t.id,a=e.querySelector(".ws-note-header");this._makeDraggable(e,a,o);const d=e.querySelector(".ws-resize-handle");this._makeResizable(e,d,o);const n=e.querySelector(".ws-note-text");let s=null;n.addEventListener("input",()=>{clearTimeout(s),s=setTimeout(()=>{window.WS.NoteManager.update(o,{text:n.value})},600)});const i=e.querySelector(".ws-btn-copy");i?.addEventListener("click",l=>{l.stopPropagation();const c=n?.value||t.text||"";navigator.clipboard.writeText(c).then(()=>{const w=i.textContent;i.textContent="✓",setTimeout(()=>{i.textContent=w},1200)})});const r=e.querySelector(".ws-btn-minimize");r.addEventListener("click",async()=>{const l=e.classList.toggle("ws-minimized");r.textContent=l?"+":"−",await window.WS.NoteManager.update(o,{metadata:{minimized:l}})}),e.querySelector(".ws-btn-delete").addEventListener("click",async()=>{this.removeNote(o),await window.WS.NoteManager.delete(o)}),e.querySelectorAll(".ws-color-dot").forEach(l=>{l.addEventListener("click",async()=>{const c=l.dataset.color;e.dataset.color=c,e.querySelectorAll(".ws-color-dot").forEach(w=>w.classList.remove("ws-active")),l.classList.add("ws-active"),await window.WS.NoteManager.update(o,{metadata:{color:c}})})})},_makeDraggable(e,t,o){let a,d,n,s,i=!1;t.addEventListener("mousedown",r=>{r.target.closest(".ws-note-actions")||(i=!0,a=r.clientX,d=r.clientY,n=parseInt(e.style.left)||0,s=parseInt(e.style.top)||0,e.classList.add("ws-dragging"),r.preventDefault())}),document.addEventListener("mousemove",r=>{if(!i)return;const l=Math.max(0,n+r.clientX-a),c=Math.max(0,s+r.clientY-d);e.style.left=`${l}px`,e.style.top=`${c}px`}),document.addEventListener("mouseup",async r=>{i&&(i=!1,e.classList.remove("ws-dragging"),await window.WS.NoteManager.update(o,{x:parseInt(e.style.left),y:parseInt(e.style.top)}))})},_makeResizable(e,t,o){let a,d,n,s,i=!1;t.addEventListener("mousedown",r=>{i=!0,a=r.clientX,d=r.clientY,n=e.offsetWidth,s=e.offsetHeight,r.preventDefault(),r.stopPropagation()}),document.addEventListener("mousemove",r=>{if(!i)return;const l=Math.max(200,n+r.clientX-a),c=Math.max(120,s+r.clientY-d);e.style.width=`${l}px`,e.style.height=`${c}px`}),document.addEventListener("mouseup",async()=>{i&&(i=!1)})}};function u(){window.WS.NoteRenderer.init();const e=window.innerWidth;let t=[];window.location.pathname.endsWith("/webstickly")||window.location.pathname.endsWith("/webstickly/")?t=[{id:"ws-demo-1",metadata:{color:"yellow"},author:{name:"Utkarsh",initials:"UK",color:"#10b981"},text:`📌 Welcome to WebStickly 1.0.0!
Drag this note anywhere on the screen. It will remember its position.`,x:e>800?50:20,y:120},{id:"ws-demo-2",metadata:{color:"blue"},author:{name:"Reviewer",initials:"CR",color:"#3b82f6"},text:"⚡ AES-GCM 256-bit encrypted backup tested. Local storage logic working perfectly.",x:e>800?e-300:20,y:350},{id:"ws-demo-3",metadata:{color:"pink"},author:{name:"WebStickly",initials:"WS",color:"#ec4899"},text:"💡 Try pressing Alt + N anywhere on the page to trigger the shortcut notification!",x:e>800?e/2-120:20,y:window.innerHeight>800?window.innerHeight-250:600}]:window.location.pathname.includes("/privacy")?t=[{id:"ws-privacy-1",metadata:{color:"green"},author:{name:"Privacy",initials:"P",color:"#4ade80"},text:`🔒 Fun Fact: This note (and any note you create) is stored entirely in your browser's local storage.

We couldn't read it even if we wanted to!`,x:e>800?e-320:20,y:220},{id:"ws-privacy-2",metadata:{color:"purple"},author:{name:"Local",initials:"L",color:"#a78bfa"},text:`No databases.
No telemetry.
No tracking.

Try pressing Alt + N to make your own completely private note right now.`,x:e>800?50:20,y:450}]:t=[{id:"ws-portfolio-1",metadata:{color:"green"},author:{name:"Utkarsh",initials:"UK",color:"#10b981"},text:`Hi! Did you know you can leave sticky notes on my portfolio?

Press Alt + N to try it out!`,x:e>800?e-320:20,y:120}];const o=t.map(s=>{const i=localStorage.getItem(`ws_demo_note_${s.id}`);if(i){const r=JSON.parse(i);return{...s,...r,metadata:{...s.metadata,...r.metadata}}}return s}),a=`ws_demo_custom_ids_${window.location.pathname}`,n=JSON.parse(localStorage.getItem(a)||"[]").map(s=>{const i=localStorage.getItem(`ws_demo_note_${s}`);return i?JSON.parse(i):null}).filter(Boolean);window.WS.NoteRenderer.renderAll([...o,...n])}function g(){document.getElementById("hero-install-btn")?.addEventListener("click",()=>{alert("WebStickly v1.0.0 has been submitted and is currently under review on the Chrome Web Store! Check back soon.")}),window.addEventListener("keydown",t=>{t.altKey&&(t.key==="n"||t.key==="N")&&(t.preventDefault(),window.WS.NoteManager.create())})}document.addEventListener("DOMContentLoaded",()=>{u(),g()});
