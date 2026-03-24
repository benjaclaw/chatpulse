/* ChatPulse Widget — <script src="…/widget.js" data-chatbot-id="abc123"> */
(function () {
  "use strict";
  var s = document.currentScript || document.querySelector("script[data-chatbot-id]");
  var g = window.ChatPulseConfig || {};
  var id = (s && s.getAttribute("data-chatbot-id")) || g.chatbotId;
  if (!id) { console.error("[ChatPulse] Missing data-chatbot-id."); return; }
  var color = (s && s.getAttribute("data-primary-color")) || g.primaryColor || "#6366f1";
  var pos = (s && s.getAttribute("data-position")) || g.position || "right";
  var base = "https://chatpulse.vercel.app";
  if (s && s.src) { try { base = new URL(s.src).origin; } catch (_) {} }
  var url = base + "/widget/" + encodeURIComponent(id) + "?color=" + encodeURIComponent(color) + "&position=" + encodeURIComponent(pos);
  var isOpen = false;
  var openIcon = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>';
  var closeIcon = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>';

  function toggle(win, btn, open) {
    isOpen = open;
    win.style.transform = open ? "scale(1)" : "scale(0)";
    win.style.opacity = open ? "1" : "0";
    win.style.pointerEvents = open ? "auto" : "none";
    btn.innerHTML = open ? closeIcon : openIcon;
    btn.setAttribute("aria-label", open ? "Lukk chat" : "Åpne chat");
  }

  function init() {
    var c = document.createElement("div");
    c.id = "chatpulse-widget";
    c.style.cssText = "position:fixed;bottom:20px;z-index:2147483647;" + (pos === "left" ? "left:20px;" : "right:20px;");

    var w = document.createElement("div");
    w.style.cssText = "width:370px;height:500px;margin-bottom:16px;border-radius:16px;overflow:hidden;box-shadow:0 8px 32px rgba(0,0,0,.15);transition:transform .25s ease,opacity .25s ease;transform-origin:bottom " + pos + ";transform:scale(0);opacity:0;pointer-events:none;";
    var f = document.createElement("iframe");
    f.src = url;
    f.style.cssText = "width:100%;height:100%;border:none;";
    f.title = "ChatPulse";
    f.allow = "clipboard-write";
    w.appendChild(f);

    var b = document.createElement("button");
    b.setAttribute("aria-label", "Åpne chat");
    b.style.cssText = "width:56px;height:56px;border-radius:50%;border:none;cursor:pointer;background:" + color + ";box-shadow:0 4px 12px rgba(0,0,0,.2);display:flex;align-items:center;justify-content:center;transition:transform .15s ease,box-shadow .15s ease;" + (pos === "left" ? "" : "margin-left:auto;");
    b.innerHTML = openIcon;
    b.onmouseenter = function () { b.style.transform = "scale(1.08)"; b.style.boxShadow = "0 6px 20px rgba(0,0,0,.25)"; };
    b.onmouseleave = function () { b.style.transform = "scale(1)"; b.style.boxShadow = "0 4px 12px rgba(0,0,0,.2)"; };
    b.onclick = function () { toggle(w, b, !isOpen); };

    window.addEventListener("message", function (e) {
      if (e.data && e.data.type === "chatpulse:close") toggle(w, b, false);
    });

    c.appendChild(w);
    c.appendChild(b);
    document.body.appendChild(c);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
