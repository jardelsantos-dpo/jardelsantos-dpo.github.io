document.addEventListener('DOMContentLoaded', function () {
  (function () {
    // ========= CONFIG =========
    const CFG = {
      postUrl: 'https://www.instagram.com/p/DTqioVFmGmY/',
      imageUrl: 'https://jardelsantos-dpo.github.io/img/badge-dpo.webp',
      handle: '@jardelsantos.dpo',
      publishedAt: '2026-01-18T16:30:00-03:00',
      showDelayMs: 800,
      autoCloseMs: 5000,
      hideForHours: 24,
      maxWidth: 320
    };

    function timeSince(dateString) {
      const published = new Date(dateString).getTime();
      const now = Date.now();
      if (isNaN(published) || published > now) return 'agora mesmo';
      const seconds = Math.floor((now - published) / 1000);
      const intervals = [
        { label: 'ano', seconds: 31536000 },
        { label: 'mês', seconds: 2592000 },
        { label: 'dia', seconds: 86400 },
        { label: 'hora', seconds: 3600 },
        { label: 'minuto', seconds: 60 }
      ];
      for (const i of intervals) {
        const count = Math.floor(seconds / i.seconds);
        if (count >= 1) return `há ${count} ${i.label}${count > 1 ? 's' : ''}`;
      }
      return 'há poucos segundos';
    }

    const KEY = 'igPopupDismissedAt';
    const last = localStorage.getItem(KEY);
    if (last && (Date.now() - Number(last)) < CFG.hideForHours * 3600 * 1000) return;

    const style = document.createElement('style');
    style.textContent = `
      .igp-fixed { position: fixed; right: 16px; bottom: 16px; z-index: 9999; font-family: system-ui,-apple-system,sans-serif; }
      .igp-card { width: 92vw; max-width: ${CFG.maxWidth}px; background: #fff; color: #111; border-radius: 12px; border: 1px solid rgba(0,0,0,.06); box-shadow: 0 10px 30px rgba(0,0,0,.18); position: relative; }
      .igp-link { display: flex; align-items: center; gap: 12px; padding: 10px 42px 10px 10px; text-decoration: none; color: inherit; }
      .igp-thumb { width: 64px; height: 64px; border-radius: 8px; object-fit: cover; background: #eee; flex: 0 0 64px; }
      .igp-body { display: flex; flex-direction: column; gap: 4px; min-width: 0; }
      .igp-handle { font-weight: 600; font-size: 14px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
      .igp-meta { font-size: 12px; color: #666; }
      .igp-x { position: absolute; top: 6px; right: 6px; width: 26px; height: 26px; border: none; border-radius: 8px; background: transparent; cursor: pointer; display: grid; place-items: center; color: #555; }
      .igp-x:hover { background: rgba(0,0,0,.06); }
      @media (max-width:420px) { .igp-fixed { right: 8px; bottom: 8px; } }
    `;
    document.head.appendChild(style);

    const root = document.createElement('div');
    root.className = 'igp-fixed';
    const card = document.createElement('div');
    card.className = 'igp-card';
    const link = document.createElement('a');
    link.className = 'igp-link';
    link.href = CFG.postUrl;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    const img = document.createElement('img');
    img.className = 'igp-thumb';
    const body = document.createElement('div');
    body.className = 'igp-body';
    body.innerHTML = `
      <div class="igp-handle">${CFG.handle}</div>
      <div class="igp-meta">${timeSince(CFG.publishedAt)}</div>
      <div class="igp-meta" style="font-size:11px;color:#9aa3b2;">Instagram</div>
    `;
    const closeBtn = document.createElement('button');
    closeBtn.className = 'igp-x';
    closeBtn.innerHTML = `<svg viewBox="0 0 24 24" width="14" height="14"><path fill="currentColor" d="M18.3 5.7a1 1 0 0 0-1.4 0L12 10.6 7.1 5.7a1 1 0 1 0-1.4 1.4L10.6 12l-4.9 4.9a1 1 0 1 0 1.4 1.4L12 13.4l4.9 4.9a1 1 0 0 0 1.4-1.4L13.4 12l4.9-4.9a1 1 0 0 0 0-1.4Z"/></svg>`;

    let autoCloseTimer;
    function closePopup(store) {
      if (store) localStorage.setItem(KEY, Date.now().toString());
      if (autoCloseTimer) clearTimeout(autoCloseTimer);
      root.remove();
    }
    closeBtn.addEventListener('click', (e) => { e.stopPropagation(); closePopup(true); });

    const probe = new Image();
    probe.src = CFG.imageUrl;
    function mount(thumb) {
      link.prepend(thumb);
      link.appendChild(body);
      card.appendChild(link);
      card.appendChild(closeBtn);
      root.appendChild(card);
      setTimeout(() => {
        document.body.appendChild(root);
        if (CFG.autoCloseMs > 0) autoCloseTimer = setTimeout(() => closePopup(false), CFG.autoCloseMs);
      }, CFG.showDelayMs);
    }
    probe.onload = () => { img.src = CFG.imageUrl; mount(img); };
    probe.onerror = () => {
      const fb = document.createElement('div');
      fb.className = 'igp-thumb'; fb.style.display = 'grid'; fb.style.placeItems = 'center'; fb.textContent = '📷';
      mount(fb);
    };
  })();
});