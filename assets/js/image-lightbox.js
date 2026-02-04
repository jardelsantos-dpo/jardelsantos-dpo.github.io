(function () {
  "use strict";

  // Seletores das imagens que terão lightbox
  const IMG_SELECTOR = ".example-report img, figure img, .report-img";

  // Ativa também no "long press" (pressionar e segurar)?
  const ENABLE_LONG_PRESS = false; // mude para true se quiser

  // Estado do zoom
  let scale = 1;
  let startDist = null;
  let startScale = 1;

  function createLightbox() {
    const overlay = document.createElement("div");
    overlay.className = "imglb-overlay";
    overlay.innerHTML = `
      <button class="imglb-close" type="button" aria-label="Fechar">×</button>
      <img class="imglb-img" alt="">
      <div class="imglb-hint">Toque para fechar • Pinça para zoom</div>
    `;
    document.body.appendChild(overlay);

    const img = overlay.querySelector(".imglb-img");
    const closeBtn = overlay.querySelector(".imglb-close");

    function close() {
      overlay.classList.remove("open");
      document.body.classList.remove("imglb-noscroll");
      img.src = "";
      img.style.transform = "translate(-50%, -50%) scale(1)";
      scale = 1;
    }

    overlay.addEventListener("click", (e) => {
      // fecha ao tocar no fundo (não na imagem)
      if (e.target === overlay) close();
    });

    closeBtn.addEventListener("click", close);

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && overlay.classList.contains("open")) close();
    });

    // Pinch-to-zoom (touch)
    overlay.addEventListener("touchstart", (e) => {
      if (!overlay.classList.contains("open")) return;
      if (e.touches.length === 2) {
        startDist = distance(e.touches[0], e.touches[1]);
        startScale = scale;
        e.preventDefault();
      }
    }, { passive: false });

    overlay.addEventListener("touchmove", (e) => {
      if (!overlay.classList.contains("open")) return;
      if (e.touches.length === 2 && startDist) {
        const newDist = distance(e.touches[0], e.touches[1]);
        const factor = newDist / startDist;
        scale = clamp(startScale * factor, 1, 4);
        img.style.transform = `translate(-50%, -50%) scale(${scale})`;
        e.preventDefault();
      }
    }, { passive: false });

    overlay.addEventListener("touchend", () => {
      startDist = null;
    });

    // Double tap para alternar zoom 1x / 2x
    let lastTap = 0;
    overlay.addEventListener("touchend", (e) => {
      if (!overlay.classList.contains("open")) return;
      if (e.changedTouches.length !== 1) return;

      const now = Date.now();
      if (now - lastTap < 260) {
        scale = (scale > 1) ? 1 : 2;
        img.style.transform = `translate(-50%, -50%) scale(${scale})`;
      }
      lastTap = now;
    });

    return { overlay, img, open: (src, alt) => {
      img.src = src;
      img.alt = alt || "";
      overlay.classList.add("open");
      document.body.classList.add("imglb-noscroll");
      img.style.transform = "translate(-50%, -50%) scale(1)";
      scale = 1;
    }};
  }

  function injectStyles() {
    if (document.getElementById("imglb-styles")) return;
    const style = document.createElement("style");
    style.id = "imglb-styles";
    style.textContent = `
      .imglb-noscroll{ overflow:hidden !important; }
      .imglb-overlay{
        position:fixed; inset:0;
        background:rgba(0,0,0,.92);
        z-index:999999;
        display:none;
      }
      .imglb-overlay.open{ display:block; }
      .imglb-img{
        position:absolute;
        top:50%; left:50%;
        transform:translate(-50%,-50%) scale(1);
        max-width:95vw;
        max-height:90vh;
        border-radius:10px;
        box-shadow:0 12px 35px rgba(0,0,0,.45);
        touch-action: none; /* essencial para pinch funcionar */
      }
      .imglb-close{
        position:absolute;
        top:12px; right:12px;
        width:44px; height:44px;
        border-radius:999px;
        border:0;
        background:rgba(255,255,255,.15);
        color:#fff;
        font-size:28px;
        cursor:pointer;
      }
      .imglb-hint{
        position:absolute;
        left:50%; bottom:14px;
        transform:translateX(-50%);
        color:rgba(255,255,255,.75);
        font-size:13px;
        font-family: system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif;
        text-align:center;
        padding:6px 10px;
        border-radius:999px;
        background:rgba(255,255,255,.08);
      }
      /* Cursor de zoom para desktop */
      ${IMG_SELECTOR}{ cursor: zoom-in; }
    `;
    document.head.appendChild(style);
  }

  function clamp(v, min, max){ return Math.max(min, Math.min(max, v)); }
  function distance(t1, t2){
    const dx = t1.clientX - t2.clientX;
    const dy = t1.clientY - t2.clientY;
    return Math.hypot(dx, dy);
  }

  function addHandlers(lb) {
    const imgs = document.querySelectorAll(IMG_SELECTOR);
    imgs.forEach((el) => {
      // Clique/tap normal
      el.addEventListener("click", () => lb.open(el.src, el.alt));

      // Long press opcional
      if (ENABLE_LONG_PRESS) {
        let timer = null;
        el.addEventListener("touchstart", () => {
          timer = setTimeout(() => lb.open(el.src, el.alt), 450);
        }, { passive: true });
        el.addEventListener("touchend", () => clearTimeout(timer));
        el.addEventListener("touchmove", () => clearTimeout(timer));
      }
    });
  }

  function start() {
    injectStyles();
    const lb = createLightbox();
    addHandlers(lb);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start);
  } else {
    start();
  }
})();