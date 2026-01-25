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
		{ url: "servicos.html", name: "Serviços" },
		{ url: "sobre.html", name: "Sobre" },
		{ url: "artigos.html", name: "Artigos" },
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

	// Função aprimorada para detectar a profundidade atual
	const getBasePrefix = () => {
		const subfolders = ['/artigos/', '/legal/'];
		return subfolders.some(f => window.location.pathname.includes(f)) ? "../" : "./";
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
				// O segredo está aqui: o fetch usa o prefixo calculado
				const fetchUrl = `${prefix}${page.url}`;
				
				const response = await fetch(fetchUrl, { signal });
				if (!response.ok) continue;
				
				const html = await response.text();
				
				// Remove scripts e tags HTML da busca para evitar falsos positivos
				const cleanText = html.replace(/<[^>]*>?/gm, '').toLowerCase();

				if (cleanText.includes(query)) {
					const li = document.createElement("li");
					li.style.cssText = "padding:12px; border-bottom:1px solid #eee; cursor:pointer;";
					li.innerHTML = `<strong>${page.name}</strong>`;
					
					// O redirecionamento também deve usar o prefixo
					li.onclick = () => window.location.href = fetchUrl;
					
					results.appendChild(li);
				}
			} catch (err) {
				if (err.name !== 'AbortError') console.error("Erro ao buscar em:", page.url, err);
			}
		}
	});
}

