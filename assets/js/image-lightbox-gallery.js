(function () {
  "use strict";

  // Quais imagens entram na galeria:
  // - dentro de .example-report (se existir)
  // - ou dentro de figure
  // - ou imagens marcadas com .report-img
  const IMG_SELECTOR = ".example-report img, figure img, img.report-img";

  // Zoom settings
  const ZOOM_MIN = 1;
  const ZOOM_MAX = 4;

  // ====== State ======
  let images = [];
  let currentIndex = 0;

  let scale = 1;
  let startDist = null;
  let startScale = 1;

  let overlay, overlayImg, captionEl, btnPrev, btnNext, btnClose;

  // ====== Setup ======
  function init() {
    collectImages();
    if (!images.length) return;

    injectStyles();
    buildOverlay();
    bindThumbClicks();
  }

  function collectImages() {
    images = Array.from(document.querySelectorAll(IMG_SELECTOR))
      // ignora imagens invisíveis ou com src vazio
      .filter(img => img && img.src);
  }

  function buildOverlay() {
    overlay = document.createElement("div");
    overlay.className = "imglb-overlay";
    overlay.innerHTML = `
      <button class="imglb-close" type="button" aria-label="Fechar">×</button>
      <button class="imglb-nav imglb-prev" type="button" aria-label="Imagem anterior">‹</button>
      <button class="imglb-nav imglb-next" type="button" aria-label="Próxima imagem">›</button>
      <img class="imglb-img" alt="">
      <div class="imglb-caption"></div>
      <div class="imglb-hint">Arraste para o lado • Pinça para zoom • Toque fora para fechar</div>
    `;
    document.body.appendChild(overlay);

    overlayImg = overlay.querySelector(".imglb-img");
    captionEl = overlay.querySelector(".imglb-caption");
    btnPrev = overlay.querySelector(".imglb-prev");
    btnNext = overlay.querySelector(".imglb-next");
    btnClose = overlay.querySelector(".imglb-close");

    // Close behaviors
    btnClose.addEventListener("click", close);
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) close(); // toca no fundo
    });

    // Nav buttons
    btnPrev.addEventListener("click", () => show(currentIndex - 1));
    btnNext.addEventListener("click", () => show(currentIndex + 1));

    // Keyboard
    document.addEventListener("keydown", (e) => {
      if (!overlay.classList.contains("open")) return;
      if (e.key === "Escape") close();
      if (e.key === "ArrowLeft") show(currentIndex - 1);
      if (e.key === "ArrowRight") show(currentIndex + 1);
    });

    // Swipe (touch)
    bindSwipe();

    // Pinch zoom (touch)
    bindPinchZoom();

    // Double tap zoom toggle
    bindDoubleTap();
  }

  function bindThumbClicks() {
    images.forEach((img, idx) => {
      img.style.cursor = "zoom-in";
      img.addEventListener("click", () => open(idx));
    });
  }

  function open(idx) {
    document.body.classList.add("imglb-noscroll");
    overlay.classList.add("open");
    show(idx);
  }

  function close() {
    overlay.classList.remove("open");
    document.body.classList.remove("imglb-noscroll");
    overlayImg.src = "";
    captionEl.textContent = "";
    resetZoom();
  }

  function show(idx) {
    if (!images.length) return;

    currentIndex = (idx + images.length) % images.length;
    const img = images[currentIndex];

    resetZoom();

    overlayImg.src = img.src;
    overlayImg.alt = img.alt || "";

    // legenda: prefere figcaption do figure pai, senão usa alt
    captionEl.textContent = getCaption(img) || img.alt || "";

    // habilita/desabilita botões se quiser "loop infinito" (aqui é loop infinito, sempre habilitado)
    btnPrev.disabled = images.length <= 1;
    btnNext.disabled = images.length <= 1;

    // Preload vizinhas
    preload((currentIndex + 1) % images.length);
    preload((currentIndex - 1 + images.length) % images.length);
  }

  function getCaption(img) {
    const fig = img.closest("figure");
    if (!fig) return "";
    const cap = fig.querySelector("figcaption");
    return cap ? cap.textContent.trim() : "";
  }

  function preload(idx) {
    const i = new Image();
    i.src = images[idx].src;
  }

  // ====== Swipe ======
  function bindSwipe() {
    let startX = 0;
    let startY = 0;
    let dragging = false;

    overlay.addEventListener("touchstart", (e) => {
      if (!overlay.classList.contains("open")) return;
      if (e.touches.length !== 1) return;
      dragging = true;
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
    }, { passive: true });

    overlay.addEventListener("touchend", (e) => {
      if (!overlay.classList.contains("open")) return;
      if (!dragging) return;
      dragging = false;

      const touch = e.changedTouches[0];
      const dx = touch.clientX - startX;
      const dy = touch.clientY - startY;

      // evita conflito com scroll vertical: precisa ser mais horizontal que vertical
      if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) {
        if (dx < 0) show(currentIndex + 1);
        else show(currentIndex - 1);
      }
    }, { passive: true });
  }

  // ====== Pinch Zoom ======
  function bindPinchZoom() {
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
        scale = clamp(startScale * factor, ZOOM_MIN, ZOOM_MAX);
        applyZoom();
        e.preventDefault();
      }
    }, { passive: false });

    overlay.addEventListener("touchend", () => {
      startDist = null;
    });
  }

  function bindDoubleTap() {
    let lastTap = 0;
    overlay.addEventListener("touchend", (e) => {
      if (!overlay.classList.contains("open")) return;
      if (e.changedTouches.length !== 1) return;

      const now = Date.now();
      if (now - lastTap < 260) {
        scale = (scale > 1) ? 1 : 2;
        applyZoom();
      }
      lastTap = now;
    }, { passive: true });
  }

  function applyZoom() {
    overlayImg.style.transform = `translate(-50%, -50%) scale(${scale})`;
  }

  function resetZoom() {
    scale = 1;
    overlayImg.style.transform = "translate(-50%, -50%) scale(1)";
  }

  function distance(t1, t2) {
    const dx = t1.clientX - t2.clientX;
    const dy = t1.clientY - t2.clientY;
    return Math.hypot(dx, dy);
  }

  function clamp(v, min, max) {
    return Math.max(min, Math.min(max, v));
  }

  // ====== Styles ======
  function injectStyles() {
    if (document.getElementById("imglb-gallery-styles")) return;

    const style = document.createElement("style");
    style.id = "imglb-gallery-styles";
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
        max-height:82vh;
        border-radius:10px;
        box-shadow:0 12px 35px rgba(0,0,0,.45);
        touch-action:none;
      }

      .imglb-close{
        position:absolute;
        top:12px; right:12px;
        width:44px; height:44px;
        border-radius:999px;
        border:0;
        background:rgba(255,255,255,.14);
        color:#fff;
        font-size:28px;
        cursor:pointer;
      }

      .imglb-nav{
        position:absolute;
        top:50%;
        transform:translateY(-50%);
        width:46px; height:46px;
        border-radius:999px;
        border:0;
        background:rgba(255,255,255,.14);
        color:#fff;
        font-size:34px;
        cursor:pointer;
        display:flex; align-items:center; justify-content:center;
      }
      .imglb-prev{ left:12px; }
      .imglb-next{ right:12px; }
      .imglb-nav:disabled{ opacity:.35; cursor:default; }

      .imglb-caption{
        position:absolute;
        left:50%; bottom:54px;
        transform:translateX(-50%);
        color:rgba(255,255,255,.9);
        font-size:13px;
        max-width:min(92vw, 820px);
        text-align:center;
        padding:8px 12px;
        border-radius:12px;
        background:rgba(255,255,255,.08);
        font-family: system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif;
      }

      .imglb-hint{
        position:absolute;
        left:50%; bottom:14px;
        transform:translateX(-50%);
        color:rgba(255,255,255,.75);
        font-size:12px;
        text-align:center;
        padding:6px 10px;
        border-radius:999px;
        background:rgba(255,255,255,.08);
        font-family: system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif;
      }

      /* No desktop, deixa setas maiores e sempre visíveis */
      @media (min-width: 992px){
        .imglb-prev{ left:18px; }
        .imglb-next{ right:18px; }
      }
    `;
    document.head.appendChild(style);
  }

  // Start
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();