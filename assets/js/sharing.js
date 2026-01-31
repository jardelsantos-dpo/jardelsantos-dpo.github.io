/*!
 * sharing-sticky.js (FINAL PRINT-SAFE)
 * - Desktop: barra vertical fixa à esquerda
 * - Mobile: barra fixa no rodapé
 * - Inclui botão "Imprimir / PDF" na barra
 * - Mantém botão flutuante .btn-print-floating e evita sobreposição no mobile
 * - NÃO imprime a barra de sharing (print-safe)
 * - Neutraliza fundos/“background graphics” via CSS de impressão (não dá para desmarcar checkbox por código)
 *
 * Página anexada tem .btn-print-floating e #share-bar-location [1](https://fontawesome.com/icons/x-twitter)
 */
(function () {
  "use strict";

  const cfg = Object.assign(
    {
      // Você mencionou "#about-container", mas no HTML anexado existe #artigo e .about-container [1](https://fontawesome.com/icons/x-twitter)
      //articleSelector: "#about-container",
	  articleSelector: "article.article-body",
      fallbackArticleSelectors: ["#artigo", ".about-container", "article.article-body"],

      mobileBreakpoint: 991,

      // Desktop: mostrar quando topo do artigo entra na viewport
      startAfterArticleTop: true,
      desktopShowWhenArticleTopBelow: 1.0,
      startOffsetPx: 0,

      // Mobile: barra sempre visível
      mobileStartAfterArticleTop: false,

      // Layout
      gap: 20, // aproxima a barra do conteúdo (ajuste aqui se quiser mais perto ainda)
      minViewportPadding: 12,

      // Animações
      animateIn: true,
      staggerButtons: true,

      // Botões (inclui print)
      networks: ["facebook", "twitter", "linkedin", "whatsapp", "telegram", "email", "copy", "print"],

      labels: {
        facebook: "Compartilhar no Facebook",
        twitter: "Compartilhar no X/Twitter",
        linkedin: "Compartilhar no LinkedIn",
        whatsapp: "Compartilhar no WhatsApp",
        telegram: "Compartilhar no Telegram",
        email: "Compartilhar por e-mail",
        copy: "Copiar link",
        print: "Imprimir / Salvar em PDF"
      },

      getShareTitle: () => document.title,
      getShareUrl: () => {
        const og = document.querySelector('meta[property="og:url"]');
        return og && og.content ? og.content : window.location.href;
      },

      // Botão flutuante já existente no HTML [1](https://fontawesome.com/icons/x-twitter)
      keepFloatingPrintButton: true,
      liftFloatingPrintOnMobile: true,
      floatingPrintSelector: ".btn-print-floating",
      printExtraBottomPx: 12
    },
    window.ShareBarConfig || {}
  );

  const state = {
    desktop: null,
    mobile: null,
    style: null,
    mq: null,
    toastTimer: null,
    printingClass: "ssb-is-printing"
  };

  function init() {
    injectStyles();
    render();
    bind();
    updateModeAndVisibility();
    positionDesktop();
    adjustFloatingPrintButton();

    // Fallback do ícone X -> Twitter (quando fa-x-twitter não existir na versão do FA)
    setTimeout(applyXIconFallback, 0);
    setTimeout(applyXIconFallback, 300);
    setTimeout(applyXIconFallback, 1200);

    // Eventos de impressão: garantem esconder a UI durante print/preview
    setupPrintEvents();
  }

  function injectStyles() {
    if (state.style) return;

    const css = `
      .ssb { position: fixed; z-index: 99999; font-family: system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif; }
      .ssb-hidden { display: none !important; }

      /* Desktop: vertical */
      .ssb-desktop { top: 50%; transform: translateY(-50%); }
      .ssb-desktop .ssb-wrap { display: flex; flex-direction: column; gap: 10px; }

      /* Mobile: bottom bar */
      .ssb-mobile {
        left: 0; right: 0; bottom: 0;
        padding: 10px 12px calc(10px + env(safe-area-inset-bottom));
        background: rgba(255,255,255,.92);
        backdrop-filter: blur(10px);
        border-top: 1px solid rgba(0,0,0,.08);
      }
      .ssb-mobile .ssb-wrap {
        display: flex; justify-content: space-between; gap: 10px;
        max-width: 860px; margin: 0 auto;
      }

      /* Buttons */
      .ssb-btn {
        width: 44px; height: 44px;
        border-radius: 999px; border: 0;
        cursor: pointer;
        display: inline-flex; align-items: center; justify-content: center;
        box-shadow: 0 10px 22px rgba(0,0,0,.14);
        transition: transform .12s ease, filter .12s ease, opacity .12s ease;
      }
      .ssb-btn i { color: #fff; font-size: 18px; line-height: 1; }
      .ssb-btn:hover { filter: brightness(1.05); transform: translateY(-2px); }
      .ssb-btn:active { transform: scale(.96); }

      /* Colors */
      .ssb-facebook { background: #1877F2; }
      .ssb-twitter  { background: #111; }
      .ssb-linkedin { background: #0A66C2; }
      .ssb-whatsapp { background: #25D366; }
      .ssb-telegram { background: #229ED9; }
      .ssb-email    { background: #F44336; }
      .ssb-copy     { background: #6B7280; }
      .ssb-print    { background: #334155; }

      .ssb-overlap { opacity: .78; }

      /* Animations */
      .ssb-anim { opacity: 0; pointer-events: none; transition: opacity .22s ease, transform .22s ease; }
      .ssb-desktop.ssb-anim { transform: translateY(-50%) translateX(-12px); }
      .ssb-desktop.ssb-anim.is-visible { opacity: 1; transform: translateY(-50%) translateX(0); pointer-events: auto; }
      .ssb-mobile.ssb-anim { transform: translateY(14px); }
      .ssb-mobile.ssb-anim.is-visible { opacity: 1; transform: translateY(0); pointer-events: auto; }

      .ssb-anim .ssb-btn { opacity: 0; transform: translateY(6px); transition: opacity .22s ease, transform .22s ease; }
      .ssb-anim.is-visible .ssb-btn { opacity: 1; transform: translateY(0); }

      /* Toast */
      .ssb-toast {
        position: fixed; left: 50%; bottom: 88px;
        transform: translateX(-50%);
        background: rgba(17,17,17,.92); color: #fff;
        padding: 10px 14px; border-radius: 999px;
        font-size: 14px; opacity: 0; pointer-events: none;
        transition: opacity .18s ease, transform .18s ease;
        z-index: 100000;
      }
      .ssb-toast-show { opacity: 1; transform: translateX(-50%) translateY(-4px); }

      /* ========= PRINT RULES ========= */
      @media print {
        /* 1) NUNCA imprimir barras/elementos flutuantes */
        .ssb, .ssb-desktop, .ssb-mobile { display: none !important; }
        .btn-print-floating { display: none !important; }

        /* 2) “Neutralizar” fundos/sombras para equivaler a background graphics desmarcado */
		/* background: transparent !important; */
        * {
          box-shadow: none !important;
          text-shadow: none !important;
          
          filter: none !important;
        }

        /* Ajustes comuns para impressão (opcionais) */
        a[href]:after { content: "" !important; } /* evita imprimir URLs longas */
      }

      /* Ajuda adicional durante preview/print (classe aplicada via JS) */
      html.${state.printingClass} .ssb,
      html.${state.printingClass} .btn-print-floating {
        display: none !important;
      }

      @media (max-width: 420px) {
        .ssb-btn { width: 42px; height: 42px; }
        .ssb-btn i { font-size: 17px; }
      }
    `;

    state.style = document.createElement("style");
    state.style.setAttribute("data-ssb", "true");
    state.style.appendChild(document.createTextNode(css));
    document.head.appendChild(state.style);
  }

  function render() {
    if (state.desktop) state.desktop.remove();
    if (state.mobile) state.mobile.remove();

    state.desktop = document.createElement("div");
    state.desktop.className = "ssb ssb-desktop";
    state.desktop.setAttribute("aria-label", "Barra de compartilhamento");

    state.mobile = document.createElement("div");
    state.mobile.className = "ssb ssb-mobile";
    state.mobile.setAttribute("aria-label", "Barra de compartilhamento");

    if (cfg.animateIn) {
      state.desktop.classList.add("ssb-anim");
      state.mobile.classList.add("ssb-anim");
    }

    const dWrap = document.createElement("div");
    dWrap.className = "ssb-wrap";
    const mWrap = document.createElement("div");
    mWrap.className = "ssb-wrap";

    cfg.networks.forEach((net, idx) => {
      const b = createButton(net);
      if (cfg.staggerButtons) b.style.transitionDelay = `${idx * 35}ms`;
      dWrap.appendChild(b);
    });

    cfg.networks.forEach((net, idx) => {
      const b = createButton(net);
      if (cfg.staggerButtons) b.style.transitionDelay = `${idx * 25}ms`;
      mWrap.appendChild(b);
    });

    state.desktop.appendChild(dWrap);
    state.mobile.appendChild(mWrap);

    document.body.appendChild(state.desktop);
    document.body.appendChild(state.mobile);

    // Limpa placeholder legacy se existir (na página anexada existe #share-bar-location) [1](https://fontawesome.com/icons/x-twitter)
    const legacy = document.querySelector("#share-bar-location");
    if (legacy) legacy.innerHTML = "";
  }

  function createButton(action) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = `ssb-btn ssb-${action}`;
    btn.title = cfg.labels[action] || "Ação";
    btn.setAttribute("aria-label", cfg.labels[action] || "Ação");
    btn.innerHTML = `<i class="${iconClass(action)}" aria-hidden="true"></i>`;
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      handleAction(action);
    });
    return btn;
  }

  // Font Awesome 6: tenta X primeiro; fallback converte para fa-twitter se não houver glifo.
  function iconClass(action) {
    switch (action) {
      case "facebook": return "fa-brands fa-facebook-f";
      case "twitter":  return "fa-brands fa-x-twitter ssb-x";
      case "linkedin": return "fa-brands fa-linkedin-in";
      case "whatsapp": return "fa-brands fa-whatsapp";
      case "telegram": return "fa-brands fa-telegram";
      case "email":    return "fa-solid fa-envelope";
      case "copy":     return "fa-solid fa-link";
      case "print":    return "fa-solid fa-print";
      default:         return "fa-solid fa-share-nodes";
    }
  }

  async function handleAction(action) {
    const url = cfg.getShareUrl();
    const title = cfg.getShareTitle();

    // Web Share API no mobile (não para copy/email/print)
    if (navigator.share && isMobile()) {
      if (action !== "copy" && action !== "email" && action !== "print") {
        try { await navigator.share({ title, url }); return; } catch (_) {}
      }
    }

    switch (action) {
      case "facebook":
        popup(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`);
        break;
      case "twitter":
        popup(`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`);
        break;
      case "linkedin":
        popup(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`);
        break;
      case "whatsapp":
        popup(`https://wa.me/?text=${encodeURIComponent(title + " " + url)}`);
        break;
      case "telegram":
        popup(`https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`);
        break;
      case "email":
        window.location.href = `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(url)}`;
        break;
      case "copy":
        await copyToClipboard(url);
        toast("Link copiado!");
        break;
      case "print":
        // garante esconder UI no preview/print (além do @media print)
        document.documentElement.classList.add(state.printingClass);
        setTimeout(() => window.print(), 0);
        break;
      default:
        popup(url);
    }
  }

  function popup(shareUrl) {
    const w = 600, h = 520;
    const left = (window.screenX || 0) + (window.innerWidth - w) / 2;
    const top = (window.screenY || 0) + (window.innerHeight - h) / 2;
    window.open(shareUrl, "_blank",
      `scrollbars=yes,resizable=yes,toolbar=no,location=yes,width=${w},height=${h},top=${top},left=${left}`);
  }

  async function copyToClipboard(text) {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
        return true;
      }
    } catch (_) {}
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.style.position = "fixed";
    ta.style.top = "-9999px";
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand("copy"); return true; }
    finally { ta.remove(); }
  }

  function toast(msg) {
    let t = document.querySelector(".ssb-toast");
    if (!t) {
      t = document.createElement("div");
      t.className = "ssb-toast";
      document.body.appendChild(t);
    }
    t.textContent = msg;
    t.classList.add("ssb-toast-show");
    clearTimeout(state.toastTimer);
    state.toastTimer = setTimeout(() => t.classList.remove("ssb-toast-show"), 1400);
  }

  function bind() {
    state.mq = window.matchMedia(`(max-width: ${cfg.mobileBreakpoint}px)`);

    const onChange = throttle(() => {
      updateModeAndVisibility();
      positionDesktop();
      adjustFloatingPrintButton();
      applyXIconFallback();
    }, 60);

    window.addEventListener("resize", onChange, { passive: true });
    window.addEventListener("scroll", onChange, { passive: true });
    window.addEventListener("orientationchange", onChange, { passive: true });

    if (state.mq.addEventListener) state.mq.addEventListener("change", onChange);
    else if (state.mq.addListener) state.mq.addListener(onChange);
  }

  function updateModeAndVisibility() {
    if (isMobile()) {
      state.desktop.classList.add("ssb-hidden");
      state.mobile.classList.remove("ssb-hidden");

      const showMobile = cfg.mobileStartAfterArticleTop ? shouldShowAfterTop(1.0) : true;
      if (cfg.animateIn) state.mobile.classList.toggle("is-visible", showMobile);
      else state.mobile.classList.toggle("ssb-hidden", !showMobile);
      return;
    }

    state.mobile.classList.add("ssb-hidden");
    state.desktop.classList.remove("ssb-hidden");

    let showDesktop = true;
    if (cfg.startAfterArticleTop) showDesktop = shouldShowAfterTop(cfg.desktopShowWhenArticleTopBelow);

    if (cfg.animateIn) state.desktop.classList.toggle("is-visible", showDesktop);
    else state.desktop.classList.toggle("ssb-hidden", !showDesktop);
  }

  function shouldShowAfterTop(ratio) {
    const anchor = getAnchorEl();
    if (!anchor) return true;

    const rect = anchor.getBoundingClientRect();
    const triggerLine = (window.innerHeight || 0) * (typeof ratio === "number" ? ratio : 1.0);
    return rect.top <= (triggerLine + (cfg.startOffsetPx || 0));
  }

  function isMobile() {
    return state.mq ? state.mq.matches : window.innerWidth <= cfg.mobileBreakpoint;
  }

  function getAnchorEl() {
    let el = document.querySelector(cfg.articleSelector);
    if (el) return el;

    for (const s of (cfg.fallbackArticleSelectors || [])) {
      el = document.querySelector(s);
      if (el) return el;
    }
    return null;
  }

  function positionDesktop() {
    if (!state.desktop) return;
    if (state.desktop.classList.contains("ssb-hidden")) return;
    if (cfg.animateIn && !state.desktop.classList.contains("is-visible")) return;

    const anchor = getAnchorEl();
    if (!anchor) {
      state.desktop.style.left = `${cfg.minViewportPadding}px`;
      state.desktop.classList.add("ssb-overlap");
      return;
    }

    const rect = anchor.getBoundingClientRect();
    const barWidth = 46;
    const desiredLeft = rect.left - barWidth - (typeof cfg.gap === "number" ? cfg.gap : 6);

    const left = Math.max(cfg.minViewportPadding, desiredLeft);
    const tooClose = desiredLeft < cfg.minViewportPadding + 2;

    state.desktop.style.left = `${Math.round(left)}px`;
    state.desktop.classList.toggle("ssb-overlap", tooClose);
  }

  // ===== Mantém botão flutuante e sobe no mobile =====
  function getMobileShareBarHeight() {
    if (!state.mobile) return 0;
    if (state.mobile.classList.contains("ssb-hidden")) return 0;
    if (cfg.animateIn && !state.mobile.classList.contains("is-visible")) return 0;
    return state.mobile.offsetHeight || 0;
  }

  function adjustFloatingPrintButton() {
    if (!cfg.keepFloatingPrintButton) return;

    const btn = document.querySelector(cfg.floatingPrintSelector);
    if (!btn) return; // existe no HTML anexado [1](https://fontawesome.com/icons/x-twitter)

    if (!isMobile() || !cfg.liftFloatingPrintOnMobile) {
      if (btn.dataset.ssbOriginalBottom) {
        btn.style.bottom = btn.dataset.ssbOriginalBottom;
        delete btn.dataset.ssbOriginalBottom;
      }
      return;
    }

    const liftBy = getMobileShareBarHeight() + (cfg.printExtraBottomPx || 0);
    if (!liftBy) return;

    if (!btn.dataset.ssbOriginalBottom) {
      btn.dataset.ssbOriginalBottom = window.getComputedStyle(btn).bottom || "0px";
    }

    btn.style.bottom = `${liftBy}px`;
  }

  // ===== Fallback ícone X -> Twitter =====
  function faIconIsAvailable(iEl) {
    const content = window.getComputedStyle(iEl, "::before").getPropertyValue("content");
    return content && content !== "none" && content !== '""';
  }

  function applyXIconFallback() {
    document.querySelectorAll("i.ssb-x").forEach((iEl) => {
      if (!faIconIsAvailable(iEl)) {
        iEl.classList.remove("fa-x-twitter");
        iEl.classList.add("fa-twitter");
        iEl.classList.remove("ssb-x");
      }
    });
  }

  // ===== Print events =====
  function setupPrintEvents() {
    window.addEventListener("beforeprint", () => {
      document.documentElement.classList.add(state.printingClass);
    });

    window.addEventListener("afterprint", () => {
      document.documentElement.classList.remove(state.printingClass);
    });

    // Se o usuário clicar no botão flutuante existente (onclick="window.print()"), também escondemos
    const floatingBtn = document.querySelector(cfg.floatingPrintSelector);
    if (floatingBtn) {
      floatingBtn.addEventListener("click", () => {
        document.documentElement.classList.add(state.printingClass);
        // afterprint removerá
      });
    }
  }

  function throttle(fn, wait) {
    let last = 0, timer = null;
    return function () {
      const now = Date.now();
      const remaining = wait - (now - last);
      if (remaining <= 0) {
        if (timer) { clearTimeout(timer); timer = null; }
        last = now;
        fn();
      } else if (!timer) {
        timer = setTimeout(() => {
          last = Date.now();
          timer = null;
          fn();
        }, remaining);
      }
    };
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();