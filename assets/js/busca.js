(() => {

    if (document.getElementById("searchModal")) return;

    let controller;
    let debounce;

    //------------------------------------------------
    // NORMALIZADOR (anti-acentos + case insensitive)
    //------------------------------------------------
    const normalize = str =>
        (str || "")
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "");

    //------------------------------------------------
    // MINI ÍNDICE LOCAL (BUSCA IMEDIATA)
    //------------------------------------------------
    const pages = [

        { url: "index.html", name: "Página Inicial", keywords: "home tecnologia ti segurança" },
        { url: "servicos.html", name: "Serviços de TI e Segurança", keywords: "consultoria segurança infraestrutura" },
        { url: "sobre.html", name: "Sobre Jardel Santos", keywords: "especialista arquiteto segurança" },
        { url: "artigos.html", name: "Biblioteca de Artigos", keywords: "blog tecnologia engenharia prompt ia" },

        { url: "artigos/ciberseguranca-para-pmes.html", name: "Cibersegurança para PMEs", keywords: "ransomware proteção empresas" },
        { url: "artigos/lgpd-pme-rj.html", name: "LGPD no Rio de Janeiro", keywords: "privacidade compliance dados" },
        { url: "artigos/n8n-vulnerabilidade.html", name: "CVE-2026-21858: Falha no n8n", keywords: "cve vulnerabilidade automação" },
        { url: "artigos/automacao-service-desk.html", name: "Como reduzir custos e TMA com IA", keywords: "service desk automação ia" },
        { url: "artigos/ciberseguranca-2026.html", name: "Segurança na velocidade do ataque", keywords: "tendências ameaças futuro" },
        { url: "artigos/servicedesk-automacao.html", name: "ITSM inteligente", keywords: "itsm saas open source" },
        { url: "artigos/ia-seguranca-corporativa.html", name: "IA Generativa: Segurança e Governança", keywords: "ia riscos lgpd" },
        { url: "artigos/prompts-ia-service-desk-seguranca.html", name: "10 Prompts de IA", keywords: "prompts produtividade suporte" },
        { url: "artigos/guia-engenharia-prompt-ia.html", name: "Guia de Engenharia de Prompt", keywords: "llm guia ia" },
        { url: "artigos/como-criar-agente-ia-auditoria-software.html", name: "IA na Auditoria de Software", keywords: "inventário compliance" },
        { url: "artigos/tendencias-ciberseguranca-2026.html", name: "Tendências de Cibersegurança", keywords: "previsões ataques" },
        { url: "artigos/mdt-opsi-fog.html", name: "MDT descontinuado", keywords: "deploy imagem windows" },
        { url: "artigos/20-prompts-ia-service-desk-seguranca.html", name: "20 Prompts de IA", keywords: "prompts avançados" },

        { url: "legal/privacidade.html", name: "Política de Privacidade", keywords: "lgpd dados política" },
        { url: "legal/termo-de-uso.html", name: "Termos de Uso", keywords: "contrato legal site" }
    ];

    //------------------------------------------------
    // PREFIXO AUTOMÁTICO
    //------------------------------------------------
    const getPrefix = () => {

        const path = location.pathname;

        return (path.includes("/artigos/") || path.includes("/legal/"))
            ? "../"
            : "./";
    };

    //------------------------------------------------
    // CRIAR ITEM
    //------------------------------------------------
    function createItem(url, name) {

        const li = document.createElement("li");

        li.style.cssText =
            "padding:12px;border-bottom:1px solid #eee;cursor:pointer;";

        li.innerHTML = `<strong style="color:#007bff">${name}</strong>`;

        li.onmouseenter = () => li.style.background = "#f5f7fa";
        li.onmouseleave = () => li.style.background = "transparent";

        li.onclick = () => location.href = url;

        return li;
    }

    //------------------------------------------------
    // SEARCH ENGINE
    //------------------------------------------------
    async function search(term, results) {

        term = normalize(term.trim());

        results.innerHTML = "";

        if (term.length < 2) return;

        const prefix = getPrefix();

        //--------------------------------------------
        // FASE 1 — BUSCA INSTANTÂNEA
        //--------------------------------------------
        const ranked = pages
            .map(p => {

                const name = normalize(p.name);
                const keywords = normalize(p.keywords);

                return {
                    page: p,
                    score:
                        (name.startsWith(term) ? 5 : 0) +
                        (name.includes(term) ? 3 : 0) +
                        (keywords.includes(term) ? 2 : 0)
                };
            })
            .filter(x => x.score > 0)
            .sort((a, b) => b.score - a.score)
            .map(x => x.page);

        const added = new Set();

        ranked.slice(0, 6).forEach(p => {

            const url = prefix + p.url;

            added.add(url);

            results.appendChild(createItem(url, p.name));
        });

        if (added.size >= 6) return;

        //--------------------------------------------
        // FASE 2 — BUSCA PROFUNDA (fetch)
        //--------------------------------------------
        controller?.abort();
        controller = new AbortController();

        for (const page of pages) {

            const url = prefix + page.url;

            if (added.has(url)) continue;

            try {

                const res = await fetch(url, {
                    signal: controller.signal,
                    cache: "force-cache"
                });

                if (!res.ok) continue;

                const html = await res.text();

                const text = normalize(
                    html.replace(/<[^>]*>/g, " ")
                );

                if (text.includes(term)) {

                    added.add(url);

                    results.appendChild(
                        createItem(url, page.name)
                    );

                    if (added.size >= 10) break;
                }

            } catch (e) {

                if (e.name !== "AbortError")
                    console.error(e);
            }
        }
    }

    //------------------------------------------------
    // MODAL
    //------------------------------------------------
    const modalHTML = `
    <div id="searchModal" style="display:none;position:fixed;z-index:10000;left:0;top:0;width:100%;height:100%;background:rgba(0,0,0,.9);justify-content:center;align-items:flex-start;padding-top:60px;">
        <div style="background:#fff;width:90%;max-width:520px;padding:22px;border-radius:12px;">
            <div style="display:flex;gap:10px;border-bottom:1px solid #eee;padding-bottom:10px;">
                <input id="searchInput" placeholder="Buscar..." style="flex:1;padding:10px;border:1px solid #ddd;border-radius:6px;">
                <button id="closeSearch" style="border:none;background:#007bff;color:#fff;padding:6px 14px;border-radius:6px;cursor:pointer;">Fechar</button>
            </div>
            <ul id="searchResults" style="list-style:none;padding:0;margin-top:14px;max-height:60vh;overflow:auto;"></ul>
        </div>
    </div>`;

    //------------------------------------------------
    // INIT
    //------------------------------------------------
    function init() {

        const btn = document.getElementById("openSearch");

        if (!btn) {
            requestAnimationFrame(init);
            return;
        }

        document.body.insertAdjacentHTML("beforeend", modalHTML);

        const modal = document.getElementById("searchModal");
        const input = document.getElementById("searchInput");
        const results = document.getElementById("searchResults");
        const close = document.getElementById("closeSearch");

        btn.onclick = e => {
            e.preventDefault();
            modal.style.display = "flex";
            input.focus();
        };

        close.onclick = () => {
            modal.style.display = "none";
            input.value = "";
            results.innerHTML = "";
            controller?.abort();
        };

        input.addEventListener("input", () => {

            clearTimeout(debounce);

            debounce = setTimeout(() => {
                search(input.value, results);
            }, 220);
        });
    }

    if (document.readyState !== "loading")
        init();
    else
        document.addEventListener("DOMContentLoaded", init);

})();
