/**
 * Sistema de Busca Global - Jardel Santos
 * Corrigido para carregar mesmo com Header Dinâmico
 */

console.log("Sistema de busca Jardel Santos iniciado...");

let searchController;

function initSearch() {
    const openBtn = document.getElementById("openSearch");
    
    // Se o botão ainda não existe (Header não carregou), tentamos novamente em 500ms
    if (!openBtn) {
        console.warn("Botão de busca não encontrado. Reentando em 500ms...");
        setTimeout(initSearch, 500);
        return;
    }

    // 1. Criação do Modal (apenas se não existir)
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

    // 2. Lista de Páginas
    const pages = [
        { url: "index.html", name: "Página Inicial" },
        { url: "servicos.html", name: "Serviços de TI e Segurança" },
        { url: "sobre.html", name: "Sobre Jardel Santos" },
        { url: "artigos.html", name: "Biblioteca de Artigos" },
        { url: "artigos/ciberseguranca-para-pmes.html", name: "Cibersegurança para PMEs" },
        { url: "artigos/lgpd-pme-rj.html", name: "LGPD no Rio de Janeiro" },
        { url: "artigos/n8n-vulnerabilidade.html", name: "Vulnerabilidade n8n" },
        { url: "artigos/automacao-service-desk.html", name: "Automação de Service Desk" },
        { url: "artigos/ciberseguranca-2026.html", name: "Desafios Cibersegurança 2026" },
        { url: "artigos/servicedesk-automacao.html", name: "ITSM e Automação" },
        { url: "artigos/ia-seguranca-corporativa.html", name: "IA Generativa e Governança" },
        { url: "artigos/prompts-ia-service-desk-seguranca.html", name: "Prompts para Service Desk" },
        { url: "legal/privacidade.html", name: "Política de Privacidade" },
        { url: "legal/termo-de-uso.html", name: "Termos de Uso" }
    ];

    const getBasePrefix = () => {
        const path = window.location.pathname;
        return (path.includes('/artigos/') || path.includes('/legal/')) ? "../" : "./";
    };

    // 3. Atribuição do Evento de Clique
    openBtn.onclick = (e) => {
        e.preventDefault();
        modal.style.display = "flex";
        input.focus();
    };

    closeBtn.onclick = () => { 
        modal.style.display = "none";
        input.value = "";
        results.innerHTML = "";
    };

    // 4. Lógica de Fetch e Busca
    input.oninput = async () => {
        const query = input.value.toLowerCase().trim();
        if (searchController) searchController.abort();
        searchController = new AbortController();
        
        results.innerHTML = "";
        if (query.length < 3) return;

        const prefix = getBasePrefix();

        for (const page of pages) {
            try {
                const targetUrl = `${prefix}${page.url}`;
                const response = await fetch(targetUrl, { signal: searchController.signal });
                if (!response.ok) continue;
                
                const html = await response.text();
                const bodyText = html.replace(/<[^>]*>?/gm, '').toLowerCase();
                
                if (bodyText.includes(query)) {
                    const li = document.createElement("li");
                    li.style.cssText = "padding:12px; border-bottom:1px solid #eee; cursor:pointer;";
                    li.innerHTML = `<strong style="color:#007bff;">${page.name}</strong>`;
                    li.onclick = () => window.location.href = targetUrl;
                    results.appendChild(li);
                }
            } catch (err) {
                if (err.name !== 'AbortError') console.error("Erro na busca:", err);
            }
        }
    };
}

// Inicia a função
initSearch();