(function() {
    const initSharing = () => {
        // 1. Define o local onde a barra será inserida
        // O script procura por um elemento com id="share-bar-location"
        const container = document.getElementById('share-bar-location');
        if (!container) return;

        const url = encodeURIComponent(window.location.href);
        const title = encodeURIComponent(document.title);

        // 2. O HTML que você quer que apareça em todos os artigos
        container.innerHTML = `
            <div class="share-container">
                <span class="share-label" style="font-size: 0.85rem; display: flex; align-items: center;">Compartilhar:</span>
                <a id="share-whatsapp" class="share-btn" aria-label="WhatsApp" target="_blank" rel="noopener">
                    <img src="https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/whatsapp.svg" alt="WhatsApp">
                </a>
                <a id="share-x" class="share-btn" aria-label="X" target="_blank" rel="noopener">
                    <img src="https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/x.svg" alt="X">
                </a>
                <a id="share-facebook" class="share-btn" aria-label="Facebook" target="_blank" rel="noopener">
                    <img src="https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/facebook.svg" alt="Facebook">
                </a>
                <a id="share-linkedin" class="share-btn" aria-label="LinkedIn" target="_blank" rel="noopener">
                    <img src="https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/linkedin.svg" alt="LinkedIn">
                </a>
                <a id="share-email" class="share-btn" aria-label="Email">
                    <img src="https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/maildotru.svg" alt="Email">
                </a>
                <button id="btn-print" class="share-btn" aria-label="Imprimir">
				<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-printer" viewBox="0 0 16 16">
				  <path d="M2.5 8a.5.5 0 1 0 0-1 .5.5 0 0 0 0 1"/>
				  <path d="M5 1a2 2 0 0 0-2 2v2H2a2 2 0 0 0-2 2v3a2 2 0 0 0 2 2h1v1a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2v-1h1a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-1V3a2 2 0 0 0-2-2zM4 3a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2H4zm1 5a2 2 0 0 0-2 2v1H2a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1v-1a2 2 0 0 0-2-2zm7 2v3a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1"/>
				</svg>
				</button>
            </div>
        `;

        // 3. Configura os Links Dinâmicos
        const config = {
			'share-whatsapp': `https://api.whatsapp.com/send?text=${title}%20%0A%0A${url}`,
            'share-x': `https://x.com/intent/tweet?url=${url}&text=${title}`,
            'share-facebook': `https://www.facebook.com/sharer/sharer.php?u=${url}`,
            'share-linkedin': `https://www.linkedin.com/sharing/share-offsite/?url=${url}`,
            'share-email': `mailto:?subject=${title}&body=Confira este artigo: ${url}`
        };

        Object.entries(config).forEach(([id, href]) => {
            const el = document.getElementById(id);
            if (el) el.setAttribute('href', href);
        });

        // 4. Lógica de Impressão
        const printBtn = document.getElementById('btn-print');
        if (printBtn) {
            printBtn.onclick = (e) => { e.preventDefault(); window.print(); };
        }
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initSharing);
    } else {
        initSharing();
    }
})();