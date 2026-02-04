/**
 * Sistema de Busca Global - Jardel Santos
 * Corrigido para evitar duplicidade de resultados
 */

console.log("Sistema de busca Jardel Santos iniciado...");

let searchController;

function initSearch() {
    const openBtn = document.getElementById("openSearch");
    
    if (!openBtn) {
        console.warn("Botão de busca não encontrado. Reiniciando em 500ms...");
        setTimeout(initSearch, 500);
        return;
    }

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

	const pages = [
		{ url: "index.html", name: "Página Inicial" },
		{ url: "servicos.html", name: "Serviços de TI e Segurança" },
		{ url: "sobre.html", name: "Sobre Jardel Santos" },
		{ url: "artigos.html", name: "Biblioteca de Artigos" },

		// Artigos listados nos dados
		{ url: "artigos/ciberseguranca-para-pmes.html", name: "Cibersegurança para PMEs" },
		{ url: "artigos/lgpd-pme-rj.html", name: "LGPD no Rio de Janeiro" },
		{ url: "artigos/n8n-vulnerabilidade.html", name: "CVE-2026-21858: Falha no n8n" },
		{ url: "artigos/automacao-service-desk.html", name: "Como reduzir custos e TMA com IA" },
		{ url: "artigos/ciberseguranca-2026.html", name: "Segurança na velocidade do ataque: o desafio de 2026" },
		{ url: "artigos/servicedesk-automacao.html", name: "ITSM inteligente com SaaS, automação e open source" },
		{ url: "artigos/ia-seguranca-corporativa.html", name: "IA Generativa: Desafios de Segurança e Governança" },
		{ url: "artigos/prompts-ia-service-desk-seguranca.html", name: "10 Prompts de IA para potencializar o Service Desk" },
		{ url: "artigos/guia-engenharia-prompt-ia.html", name: "Guia prático para criar prompts eficientes" },
		{ url: "artigos/como-criar-agente-ia-auditoria-software.html", name: "Como Usar IA na Auditoria de Software" },
		{ url: "artigos/tendencias-ciberseguranca-2026.html", name: "Tendências de Cibersegurança para 2026" },
		{ url: "artigos/mdt-opsi-fog.html", name: "MDT descontinuado em jan/2026" },

		// Página futura (status: em-breve)
		{ url: "#", name: "20 prompts de IA para um Service Desk de Elite (em breve)" },

		// Páginas legais
		{ url: "legal/privacidade.html", name: "Política de Privacidade" },
		{ url: "legal/termo-de-uso.html", name: "Termos de Uso" }
	];

    const getBasePrefix = () => {
        const path = window.location.pathname;
        return (path.includes('/artigos/') || path.includes('/legal/')) ? "../" : "./";
    };

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

    input.oninput = async () => {
        const query = input.value.toLowerCase().trim();
        if (searchController) searchController.abort();
        searchController = new AbortController();
        
        results.innerHTML = "";
        if (query.length < 3) return;

        const prefix = getBasePrefix();
        
        // Conjunto para rastrear URLs já adicionadas aos resultados
        const addedUrls = new Set();

        for (const page of pages) {
            try {
                const targetUrl = `${prefix}${page.url}`;
                
                // Evita processar a mesma página se ela já foi listada nos resultados
                if (addedUrls.has(targetUrl)) continue;

                const response = await fetch(targetUrl, { signal: searchController.signal });
                if (!response.ok) continue;
                
                const html = await response.text();
                // Limpeza de tags para busca apenas no texto
                const bodyText = html.replace(/<[^>]*>?/gm, '').toLowerCase();
                
                if (bodyText.includes(query)) {
                    addedUrls.add(targetUrl); // Marca como adicionado

                    const li = document.createElement("li");
                    li.style.cssText = "padding:12px; border-bottom:1px solid #eee; cursor:pointer; transition: background 0.2s;";
                    li.innerHTML = `<strong style="color:#007bff; display:block; margin-bottom:2px;">${page.name}</strong>`;
                    
                    li.onmouseover = () => li.style.background = "#f8f9fa";
                    li.onmouseout = () => li.style.background = "transparent";
                    
                    li.onclick = () => window.location.href = targetUrl;
                    results.appendChild(li);
                }
            } catch (err) {
                if (err.name !== 'AbortError') console.error("Erro na busca:", err);
            }
        }
    };
}

initSearch();