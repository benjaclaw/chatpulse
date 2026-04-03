/* ChatPulse Widget v2 — <script async src="…/widget.js" data-chatbot-id="abc123"> */
(function () {
  "use strict";
  var s = document.currentScript || document.querySelector("script[data-chatbot-id]");
  var g = window.ChatPulseConfig || {};
  var id = (s && s.getAttribute("data-chatbot-id")) || g.chatbotId;
  if (!id) { console.error("[ChatPulse] Missing data-chatbot-id."); return; }
  var cacheKey = "chatpulse_cfg_" + id;
  var cached = null;
  try { cached = JSON.parse(localStorage.getItem(cacheKey)); } catch (_) {}
  var color = (s && s.getAttribute("data-color")) || (cached && cached.c) || "#6366f1";
  var pos = (s && s.getAttribute("data-position")) || (cached && cached.p) || "right";
  var lang = (s && s.getAttribute("data-language")) || g.language || document.documentElement.lang || "";
  if (lang) { lang = lang.split("-")[0].toLowerCase(); }
  var base = "https://www.chatpulse.no";
  if (s && s.src) { try { var srcOrigin = new URL(s.src).origin; if (srcOrigin.indexOf("chatpulse") > -1) { base = "https://www.chatpulse.no"; } else { base = srcOrigin; } } catch (_) {} }
  var url = base + "/widget/" + encodeURIComponent(id) + (lang ? "?lang=" + encodeURIComponent(lang) : "");
  var isOpen = false;
  var iframeLoaded = false;
  var unreadCount = 0;
  var openIcon = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>';
  var closeIcon = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>';
  var w, f, badge, closeBtn, b;

  function isMobile() { return window.innerWidth < 480; }

  function applySize() {
    if (!w) return;
    if (isMobile()) {
      w.style.width = "100%";
      w.style.height = "100%";
      w.style.maxHeight = "none";
      w.style.borderRadius = "0";
      w.style.marginBottom = "0";
      if (closeBtn) closeBtn.style.display = isOpen ? "flex" : "none";
    } else {
      w.style.width = "370px";
      w.style.height = "500px";
      w.style.maxHeight = "";
      w.style.borderRadius = "16px";
      w.style.marginBottom = "16px";
      if (closeBtn) closeBtn.style.display = "none";
    }
  }

  function updateBadge() {
    if (!badge) return;
    if (unreadCount > 0 && !isOpen) {
      badge.textContent = unreadCount > 9 ? "9+" : String(unreadCount);
      badge.style.display = "flex";
    } else {
      badge.style.display = "none";
    }
  }

  function positionContainer(c) {
    if (isMobile() && isOpen) {
      /* Fullscreen when open on mobile — use visualViewport to avoid keyboard overlap */
      var vvh = window.visualViewport ? window.visualViewport.height : window.innerHeight;
      var vvTop = window.visualViewport ? window.visualViewport.offsetTop : 0;
      c.style.top = vvTop + "px";
      c.style.left = "0";
      c.style.right = "0";
      c.style.bottom = "auto";
      c.style.height = vvh + "px";
    } else if (isMobile()) {
      /* FAB position on mobile — 16px from edges */
      c.style.top = "";
      c.style.bottom = "16px";
      c.style.height = "auto";
      c.style.left = pos === "left" ? "16px" : "";
      c.style.right = pos === "left" ? "" : "16px";
    } else {
      /* Desktop — 20px from edges */
      c.style.top = "";
      c.style.bottom = "20px";
      c.style.height = "auto";
      c.style.left = pos === "left" ? "20px" : "";
      c.style.right = pos === "left" ? "" : "20px";
    }
  }

  function toggle(btn, open) {
    isOpen = open;
    if (open && !iframeLoaded) {
      f = document.createElement("iframe");
      f.src = url;
      f.style.cssText = "width:100%;height:100%;border:none;";
      f.title = "ChatPulse";
      f.allow = "clipboard-write";
      f.loading = "lazy";
      w.appendChild(f);
      iframeLoaded = true;
    }
    applySize();
    positionContainer(btn.parentElement);
    w.style.display = open ? "block" : "none";
    w.style.transform = open ? "translateY(0)" : "translateY(20px)";
    w.style.opacity = open ? "1" : "0";
    w.style.pointerEvents = open ? "auto" : "none";
    /* On mobile fullscreen, allow container to capture events; otherwise keep passthrough */
    if (isMobile() && open) {
      btn.parentElement.style.pointerEvents = "auto";
    } else {
      btn.parentElement.style.pointerEvents = "none";
    }
    btn.innerHTML = open ? closeIcon : openIcon;
    btn.setAttribute("aria-label", open ? "Lukk chat" : "Åpne chat");
    if (isMobile()) {
      btn.style.display = open ? "none" : "flex";
      if (closeBtn) closeBtn.style.display = open ? "flex" : "none";
    }
    if (open) { unreadCount = 0; updateBadge(); }
  }

  function applyConfig(cfg) {
    var changed = false;
    if (cfg.primaryColor && cfg.primaryColor !== color) { color = cfg.primaryColor; changed = true; }
    if (cfg.position && cfg.position !== pos) { pos = cfg.position; changed = true; }
    if (changed) {
      try { localStorage.setItem(cacheKey, JSON.stringify({ c: color, p: pos })); } catch (_) {}
      if (b) {
        b.style.backgroundColor = color;
        b.style.marginLeft = pos === "left" ? "" : "auto";
      }
      if (b && b.parentElement) { positionContainer(b.parentElement); }
    }
  }

  function fetchConfig(callback) {
    try {
      var xhr = new XMLHttpRequest();
      xhr.open("GET", base + "/api/widget-config?chatbotId=" + encodeURIComponent(id), true);
      xhr.onload = function () {
        if (xhr.status === 200) {
          try {
            var cfg = JSON.parse(xhr.responseText);
            applyConfig(cfg);
          } catch (_) {}
        }
        callback();
      };
      xhr.onerror = function () { callback(); };
      xhr.timeout = 3000;
      xhr.ontimeout = function () { callback(); };
      xhr.send();
    } catch (_) { callback(); }
  }

  function buildUI() {
    if (document.getElementById("chatpulse-widget")) return;

    var c = document.createElement("div");
    c.id = "chatpulse-widget";
    c.style.cssText = "position:fixed;z-index:2147483647;pointer-events:none;";
    positionContainer(c);

    w = document.createElement("div");
    w.style.cssText = "display:none;position:relative;" + (isMobile() ? "width:100%;height:100%;max-height:none;margin-bottom:0;border-radius:0;" : "width:370px;height:500px;margin-bottom:16px;border-radius:16px;") + "overflow:hidden;box-shadow:0 8px 32px rgba(0,0,0,.15);transition:transform .3s cubic-bezier(.4,0,.2,1),opacity .3s cubic-bezier(.4,0,.2,1);transform:translateY(20px);opacity:0;pointer-events:none;background:#fff;";

    closeBtn = document.createElement("button");
    closeBtn.setAttribute("aria-label", "Lukk chat");
    closeBtn.innerHTML = closeIcon;
    closeBtn.style.cssText = "display:none;position:absolute;top:8px;right:8px;z-index:10;width:36px;height:36px;border-radius:50%;border:none;cursor:pointer;background:rgba(0,0,0,.5);align-items:center;justify-content:center;";
    closeBtn.onclick = function () { toggle(b, false); };
    w.appendChild(closeBtn);

    b = document.createElement("button");
    b.setAttribute("aria-label", "Åpne chat");
    b.style.width = "56px";
    b.style.height = "56px";
    b.style.borderRadius = "50%";
    b.style.border = "none";
    b.style.cursor = "pointer";
    b.style.backgroundColor = color;
    b.style.boxShadow = "0 4px 12px rgba(0,0,0,.2)";
    b.style.display = "flex";
    b.style.alignItems = "center";
    b.style.justifyContent = "center";
    b.style.transition = "transform .15s ease,box-shadow .15s ease";
    b.style.position = "relative";
    b.style.pointerEvents = "auto";
    if (pos !== "left") b.style.marginLeft = "auto";
    b.innerHTML = openIcon;
    b.onmouseenter = function () { b.style.transform = "scale(1.08)"; b.style.boxShadow = "0 6px 20px rgba(0,0,0,.25)"; };
    b.onmouseleave = function () { b.style.transform = "scale(1)"; b.style.boxShadow = "0 4px 12px rgba(0,0,0,.2)"; };
    b.onclick = function () { toggle(b, !isOpen); };

    badge = document.createElement("span");
    badge.style.cssText = "display:none;position:absolute;top:-4px;right:-4px;min-width:20px;height:20px;border-radius:10px;background:#ef4444;color:#fff;font-size:12px;font-weight:600;align-items:center;justify-content:center;padding:0 5px;box-shadow:0 2px 4px rgba(0,0,0,.2);pointer-events:none;font-family:system-ui,sans-serif;";
    b.appendChild(badge);

    window.addEventListener("message", function (e) {
      if (e.data && e.data.type === "chatpulse:close") toggle(b, false);
      if (e.data && e.data.type === "chatpulse:resize" && e.data.height) {
        w.style.height = Math.min(Number(e.data.height), 700) + "px";
      }
      if (e.data && e.data.type === "chatpulse:unread" && typeof e.data.count === "number") {
        unreadCount = e.data.count;
        updateBadge();
      }
    });

    window.addEventListener("resize", function () {
      applySize();
      positionContainer(c);
    });

    /* Listen for visual viewport changes (keyboard open/close on mobile) */
    if (window.visualViewport) {
      window.visualViewport.addEventListener("resize", function () {
        if (isOpen && isMobile()) {
          applySize();
          positionContainer(c);
        }
      });
    }

    c.appendChild(w);
    c.appendChild(b);
    document.body.appendChild(c);
  }

  function init() {
    try {
    fetchConfig(buildUI);
    } catch (err) { console.error("[ChatPulse] Widget init failed:", err); }
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
