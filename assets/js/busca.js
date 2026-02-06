(() => {

    if (document.getElementById("searchModal")) return;

    let controller;
    let debounce;

    // ⭐ MINI ÍNDICE LOCAL (busca imediata)
    const pages = [
		{ url: "index.html", name: "Página Inicial", keywords: "home tecnologia ti segurança cibersegurança consultoria" },

		{ url: "servicos.html", name: "Serviços de TI e Segurança", keywords: "serviços ti consultoria segurança ofensiva defensiva infraestrutura" },

		{ url: "sobre.html", name: "Sobre Jardel Santos", keywords: "especialista segurança ti arquiteto sobre profissional" },

		{ url: "artigos.html", name: "Biblioteca de Artigos", keywords: "blog tecnologia segurança artigos engenharia prompt ia" },

		{ url: "artigos/ciberseguranca-para-pmes.html", name: "Cibersegurança para PMEs", keywords: "pequenas empresas ataques proteção ransomware" },

		{ url: "artigos/lgpd-pme-rj.html", name: "LGPD no Rio de Janeiro", keywords: "lgpd lei dados privacidade empresas compliance" },

		{ url: "artigos/n8n-vulnerabilidade.html", name: "CVE-2026-21858: Falha no n8n", keywords: "cve vulnerabilidade n8n automação falha crítica" },

		{ url: "artigos/automacao-service-desk.html", name: "Como reduzir custos e TMA com IA", keywords: "service desk automação ia suporte tma eficiência" },

		{ url: "artigos/ciberseguranca-2026.html", name: "Segurança na velocidade do ataque: o desafio de 2026", keywords: "tendências segurança ataques futuro ameaças" },

		{ url: "artigos/servicedesk-automacao.html", name: "ITSM inteligente com SaaS, automação e open source", keywords: "itsm automação saas suporte tecnologia" },

		{ url: "artigos/ia-seguranca-corporativa.html", name: "IA Generativa: Desafios de Segurança e Governança", keywords: "ia governança riscos corporativo lgpd" },

		{ url: "artigos/prompts-ia-service-desk-seguranca.html", name: "10 Prompts de IA para potencializar o Service Desk", keywords: "prompts ia service desk produtividade suporte" },

		{ url: "artigos/guia-engenharia-prompt-ia.html", name: "Guia prático para criar prompts eficientes", keywords: "engenharia de prompt ia guia llm" },

		{ url: "artigos/como-criar-agente-ia-auditoria-software.html", name: "Como Usar IA na Auditoria de Software", keywords: "auditoria software ia compliance inventário" },

		{ url: "artigos/tendencias-ciberseguranca-2026.html", name: "Tendências de Cibersegurança para 2026", keywords: "tendências segurança previsões ataques" },

		{ url: "artigos/mdt-opsi-fog.html", name: "MDT descontinuado em jan/2026", keywords: "mdt opsi fog deploy imagem windows" },

		{ url: "artigos/20-prompts-ia-service-desk-seguranca.html", name: "20 prompts de IA para um Service Desk de Elite", keywords: "prompts avançados ia suporte elite" },

		{ url: "legal/privacidade.html", name: "Política de Privacidade", keywords: "privacidade dados lgpd política" },

		{ url: "legal/termo-de-uso.html", name: "Termos de Uso", keywords: "termos uso legal contrato site" }
    ];

    function ready(fn){
        if(document.readyState !== "loading") fn();
        else document.addEventListener("DOMContentLoaded", fn);
    }

    ready(init);

    function init(){

        const btn = document.getElementById("openSearch");

        if(!btn){
            requestAnimationFrame(init);
            return;
        }

        document.body.insertAdjacentHTML("beforeend", modalHTML);

        const modal = document.getElementById("searchModal");
        const input = document.getElementById("searchInput");
        const results = document.getElementById("searchResults");
        const close = document.getElementById("closeSearch");

        btn.onclick = e=>{
            e.preventDefault();
            modal.style.display="flex";
            input.focus();
        };

        close.onclick = ()=>{
            modal.style.display="none";
            results.innerHTML="";
            input.value="";
            controller?.abort();
        };

        input.addEventListener("input", ()=>{
            clearTimeout(debounce);
            debounce=setTimeout(()=>search(input.value, results),180);
        });
    }

    async function search(term, results){

		term = term
			.toLowerCase()
			.trim()
			.normalize("NFD")
			.replace(/[\u0300-\u036f]/g, "");

        results.innerHTML="";

        if(term.length<2) return;

        //*const prefix = (location.pathname.includes("/artigos/") || location.pathname.includes("/legal/")) ? "../":"./";

        // ⭐ FASE 1 — busca instantânea
		const prefix = (location.pathname.includes("/artigos/") || 
						location.pathname.includes("/legal/")) ? "../":"./";

		// ⭐ NOVO MOTOR DE RELEVÂNCIA
		const instant = pages

			.map(p => {

				const name = p.name
					.toLowerCase()
					.normalize("NFD")
					.replace(/[\u0300-\u036f]/g, "");

				const keywords = (p.keywords || "")
					.toLowerCase()
					.normalize("NFD")
					.replace(/[\u0300-\u036f]/g, "");

				return {
					page: p,
					score:
						(name.startsWith(term) ? 4 : 0) +
						(name.includes(term) ? 2 : 0) +
						(keywords.includes(term) ? 1 : 0)
				};
			})
	
			.filter(x => x.score > 0)
			.sort((a,b) => b.score - a.score)
			.map(x => x.page);

		instant.slice(0,6).forEach(p =>
			results.appendChild(createItem(prefix + p.url, p.name))
		);


        // Se já achou bons resultados, nem faz fetch
        if(instant.length>=6) return;

        // ⭐ FASE 2 — busca profunda (abortável)
        controller?.abort();
        controller = new AbortController();

        const added = new Set(instant.map(p=>prefix+p.url));

        for(const page of pages){

            const url = prefix+page.url;
            if(added.has(url)) continue;

            try{

                const res = await fetch(url,{
                    signal:controller.signal,
                    cache:"force-cache"
                });

                if(!res.ok) continue;

                const html = await res.text();
                const text = html.replace(/<[^>]*>/g," ").toLowerCase();

                if(text.includes(term)){
                    results.appendChild(createItem(url,page.name));
                    added.add(url);
                }

            }catch(e){
                if(e.name!=="AbortError")
                    console.error(e);
            }
        }
    }

    function createItem(url,name){

        const li=document.createElement("li");

        li.style.cssText="padding:12px;border-bottom:1px solid #eee;cursor:pointer;";
        li.innerHTML=`<strong style="color:#007bff">${name}</strong>`;

        li.onmouseenter=()=>li.style.background="#f5f7fa";
        li.onmouseleave=()=>li.style.background="transparent";

        li.onclick=()=>location.href=url;

        return li;
    }

    const modalHTML=`
    <div id="searchModal" style="display:none;position:fixed;z-index:10000;left:0;top:0;width:100%;height:100%;background:rgba(0,0,0,.9);justify-content:center;align-items:flex-start;padding-top:60px;">
        <div style="background:#fff;width:90%;max-width:520px;padding:22px;border-radius:12px;">
            <div style="display:flex;gap:10px;border-bottom:1px solid #eee;padding-bottom:10px;">
                <input id="searchInput" placeholder="Buscar..." style="flex:1;padding:10px;border:1px solid #ddd;border-radius:6px;">
                <button id="closeSearch" style="border:none;background:#007bff;color:#fff;padding:6px 14px;border-radius:6px;cursor:pointer;">Fechar</button>
            </div>
            <ul id="searchResults" style="list-style:none;padding:0;margin-top:14px;max-height:60vh;overflow:auto;"></ul>
        </div>
    </div>`;
})();
