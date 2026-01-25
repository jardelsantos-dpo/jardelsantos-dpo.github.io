console.log("Sistema de busca Jardel Santos iniciado...");

let searchController;

function initSearch() {
    const openBtn = document.getElementById("openSearch");
    if (!openBtn) return;

    // Modal de busca adaptado para suas cores (#007bff)
    if (!document.getElementById("searchModal")) {
        const modalHTML = `
            <div id="searchModal" style="display:none; position:fixed; z-index:10000; left:0; top:0; width:100%; height:100%; background:rgba(0,0,0,0.9); justify-content:center; align-items:flex-start; padding-top:50px;">
                <div style="background:#fff; width:90%; max-width:500px; padding:20px; border-radius:10px; color:#333; margin: 0 auto;">
                    <div style="display:flex; flex-wrap: wrap; gap: 10px; border-bottom:1px solid #eee; padding-bottom:10px;">
                        <input type="text" id="searchInput" placeholder="Buscar artigos ou serviços..." style="flex:1; min-width:180px; border:1px solid #ddd; padding:10px; border-radius:5px;">
                        <button id="closeSearch" style="border:none; background:#007bff; color:#fff; padding:5px 15px; border-radius:5px; cursor:pointer; font-size:14px; height: 40px;">Fechar</button>
                    </div>
                    <ul id="searchResults" style="list-style:none; padding:0; margin-top:15px; max-height:60vh; overflow-y:auto;"></ul>
                </div>
            </div>`;
        document.body.insertAdjacentHTML('beforeend', modalHTML);
    }

    const modal = document.getElementById("searchModal");
    const input = document.getElementById("searchInput");
    const results = document.getElementById("searchResults");
    const closeBtn = document.getElementById("closeSearch");

    // Lista atualizada com as suas páginas
    const pages = [
        { url: "index.html", name: "Página Inicial" },
        { url: "servicos.html", name: "Serviços de TI e Segurança" },
        { url: "sobre.html", name: "Sobre Jardel Santos" },
        { url: "artigos.html", name: "Biblioteca de Artigos" },
        { url: "artigos/artigo-ciberseguranca-para-pmes.html", name: "Cibersegurança para PMEs" },
        { url: "artigos/artigo-lgpd-pme-rj.html", name: "LGPD no Rio de Janeiro" },
        { url: "artigos/artigo-n8n-vulnerabilidade.html", name: "Vulnerabilidade n8n" },
        { url: "artigos/artigo-automacao-service-desk.html", name: "Automação de Service Desk" },
        { url: "artigos/artigo-ciberseguranca-2026.html", name: "Desafios Cibersegurança 2026" },
        { url: "artigos/artigo-servicedesk-automacao.html", name: "ITSM e Automação" },
        { url: "artigos/artigo-ia-seguranca-corporativa.html", name: "IA Generativa e Governança" }
    ];

    const getBasePrefix = () => {
        return window.location.pathname.includes('/artigos/') ? "../" : "./";
    };

    openBtn.addEventListener("click", (e) => {
        e.preventDefault();
        modal.style.display = "flex";
        input.focus();
    });

    closeBtn.onclick = () => { 
        modal.style.display = "none";
        input.value = "";
        results.innerHTML = "";
    };

    input.addEventListener("input", async () => {
        const query = input.value.toLowerCase().trim();
        if (searchController) searchController.abort();
        searchController = new AbortController();
        const signal = searchController.signal;

        results.innerHTML = "";
        if (query.length < 3) return;

        const prefix = getBasePrefix();

        for (const page of pages) {
            try {
                const response = await fetch(`${prefix}${page.url}`, { signal });
                if (!response.ok) continue;
                const html = await response.text();
                
                if (html.toLowerCase().includes(query)) {
                    if (!Array.from(results.querySelectorAll('strong')).some(el => el.textContent === page.name)) {
                        const li = document.createElement("li");
                        li.style.cssText = "padding:12px; border-bottom:1px solid #eee; cursor:pointer; transition: background 0.2s;";
                        li.innerHTML = `<strong>${page.name}</strong>`;
                        li.onmouseover = () => li.style.background = "#f8f9fa";
                        li.onmouseout = () => li.style.background = "transparent";
                        li.onclick = () => window.location.href = `${prefix}${page.url}`;
                        results.appendChild(li);
                    }
                }
            } catch (err) {
                if (err.name !== 'AbortError') console.error("Erro na busca:", err);
            }
        }
    });
}

