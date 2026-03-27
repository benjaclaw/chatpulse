/* ChatPulse Widget v2 — <script async src="…/widget.js" data-chatbot-id="abc123"> */
(function () {
  "use strict";
  var s = document.currentScript || document.querySelector("script[data-chatbot-id]");
  var g = window.ChatPulseConfig || {};
  var id = (s && s.getAttribute("data-chatbot-id")) || g.chatbotId;
  if (!id) { console.error("[ChatPulse] Missing data-chatbot-id."); return; }
  var color = (s && s.getAttribute("data-primary-color")) || g.primaryColor || "#6366f1";
  var pos = (s && s.getAttribute("data-position")) || g.position || "right";
  var lang = (s && s.getAttribute("data-language")) || g.language || document.documentElement.lang || "";
  if (lang) { lang = lang.split("-")[0].toLowerCase(); }
  var base = "https://chatpulse.no";
  if (s && s.src) { try { base = new URL(s.src).origin; } catch (_) {} }
  var url = base + "/widget/" + encodeURIComponent(id) + "?color=" + encodeURIComponent(color) + "&position=" + encodeURIComponent(pos) + (lang ? "&lang=" + encodeURIComponent(lang) : "");
  var isOpen = false;
  var iframeLoaded = false;
  var unreadCount = 0;
  var openIcon = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>';
  var closeIcon = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>';
  var w, f, badge;

  function updateBadge() {
    if (!badge) return;
    if (unreadCount > 0 && !isOpen) {
      badge.textContent = unreadCount > 9 ? "9+" : String(unreadCount);
      badge.style.display = "flex";
    } else {
      badge.style.display = "none";
    }
  }

  function toggle(btn, open) {
    isOpen = open;
    /* Lazy-load iframe on first open — zero cost until user clicks */
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
    w.style.transform = open ? "translateY(0)" : "translateY(20px)";
    w.style.opacity = open ? "1" : "0";
    w.style.pointerEvents = open ? "auto" : "none";
    btn.innerHTML = open ? closeIcon : openIcon;
    btn.setAttribute("aria-label", open ? "Lukk chat" : "Åpne chat");
    if (open) { unreadCount = 0; updateBadge(); }
  }

  function init() {
    var c = document.createElement("div");
    c.id = "chatpulse-widget";
    c.style.cssText = "position:fixed;bottom:20px;z-index:2147483647;" + (pos === "left" ? "left:20px;" : "right:20px;");

    w = document.createElement("div");
    var isMobile = window.innerWidth < 480;
    w.style.cssText = (isMobile ? "width:calc(100vw - 32px);height:calc(100vh - 100px);max-height:600px;" : "width:370px;height:500px;") + "margin-bottom:16px;border-radius:16px;overflow:hidden;box-shadow:0 8px 32px rgba(0,0,0,.15);transition:transform .3s cubic-bezier(.4,0,.2,1),opacity .3s cubic-bezier(.4,0,.2,1);transform:translateY(20px);opacity:0;pointer-events:none;background:#fff;";

    var b = document.createElement("button");
    b.setAttribute("aria-label", "Åpne chat");
    b.style.cssText = "width:56px;height:56px;border-radius:50%;border:none;cursor:pointer;background:" + color + ";box-shadow:0 4px 12px rgba(0,0,0,.2);display:flex;align-items:center;justify-content:center;transition:transform .15s ease,box-shadow .15s ease;" + (pos === "left" ? "" : "margin-left:auto;");
    b.innerHTML = openIcon;
    b.onmouseenter = function () { b.style.transform = "scale(1.08)"; b.style.boxShadow = "0 6px 20px rgba(0,0,0,.25)"; };
    b.onmouseleave = function () { b.style.transform = "scale(1)"; b.style.boxShadow = "0 4px 12px rgba(0,0,0,.2)"; };
    b.onclick = function () { toggle(b, !isOpen); };
    b.style.position = "relative";

    badge = document.createElement("span");
    badge.style.cssText = "display:none;position:absolute;top:-4px;right:-4px;min-width:20px;height:20px;border-radius:10px;background:#ef4444;color:#fff;font-size:12px;font-weight:600;align-items:center;justify-content:center;padding:0 5px;box-shadow:0 2px 4px rgba(0,0,0,.2);pointer-events:none;font-family:system-ui,sans-serif;";
    b.appendChild(badge);

    window.addEventListener("message", function (e) {
      if (e.data && e.data.type === "chatpulse:close") toggle(b, false);
      if (e.data && e.data.type === "chatpulse:unread" && typeof e.data.count === "number") {
        unreadCount = e.data.count;
        updateBadge();
      }
    });

    c.appendChild(w);
    c.appendChild(b);
    document.body.appendChild(c);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
