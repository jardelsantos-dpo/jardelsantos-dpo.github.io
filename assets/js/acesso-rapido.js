function inserirAcessoRapido() {
    if (typeof listaArtigos === "undefined") return;

    const path = window.location.pathname;
    const arquivoAtual = path.substring(path.lastIndexOf("/") + 1);

    const dadosArtigo = listaArtigos.find(a => a.link.includes(arquivoAtual));
    if (!dadosArtigo) return;

    // 1. Criar um Array de palavras-chave do artigo atual
    const termosParaIgnorar = ["e", "de", "com", "&", "da", "do", "para"];
    const tagsAtuais = dadosArtigo.categoria.toLowerCase()
        .split(/[ ,&]+/)
        .filter(termo => termo.length > 2 && !termosParaIgnorar.includes(termo));

    // 2. Filtrar e ORDENAR artigos que compartilham pelo menos uma dessas tags
		const relacionados = listaArtigos.filter(artigo => {
			// Regras básicas: não ser o mesmo artigo e estar publicado
			if (artigo.link.includes(arquivoAtual) || artigo.status === "em-breve") return false;

			const tagsLista = artigo.categoria.toLowerCase();
			
			// Verifica se compartilha tags com o artigo atual
			return tagsAtuais.some(tag => tagsLista.includes(tag));
		})
		// ORDENAÇÃO: Do mais recente para o mais antigo
		.sort((a, b) => new Date(b.data) - new Date(a.data)) 
		// LIMITAÇÃO: Exibe os 6 primeiros após a ordenação
		.slice(0, 6); // <--- ALTERE ESTA LINHA PARA DEFINIR A QUANTIDADE DE ARTIGOS EXIBIDOS

    if (relacionados.length === 0) return;

    // --- NOVIDADE: Lógica para formatar o título com múltiplas categorias ---
    // Pegamos a string original, dividimos por delimitadores e limpamos os espaços
    const categoriasArray = dadosArtigo.categoria.split(/[&,]+/).map(c => c.trim());
    
    let textoCategorias = "";
    if (categoriasArray.length > 1) {
        // Se houver mais de uma, separa por vírgula e coloca "e" na última
        const ultima = categoriasArray.pop();
        textoCategorias = categoriasArray.join(", ") + " e " + ultima;
    } else {
        textoCategorias = categoriasArray[0];
    }

    // 3. Injeção de CSS
    const style = document.createElement("style");
    style.textContent = `
        .related-articles-box { margin: 40px 0 30px 0; }
        .related-articles-box h3 { font-size: 1.25rem; color: #ffffff; margin-bottom: 20px; display: flex; align-items: center; gap: 10px; line-height: 1.4; }
        .related-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 16px; }
        .related-card { display: flex; align-items: center; gap: 15px; background: #ffffff; padding: 12px; border-radius: 10px; text-decoration: none; border: 1px solid #e2e8f0; transition: all 0.3s ease; height: 100%; }
        .related-card:hover { transform: translateY(-3px); box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1); border-color: #2563eb; }
        .related-img { width: 75px; height: 75px; object-fit: cover; border-radius: 6px; flex-shrink: 0; }
        .related-info { display: flex; flex-direction: column; }
        .related-cat { font-size: 0.65rem; text-transform: uppercase; font-weight: 700; color: #2563eb; margin-bottom: 4px; }
        .related-title { font-size: 0.95rem; font-weight: 600; color: #334155; line-height: 1.3; margin: 0; }
    `;
    document.head.appendChild(style);

    // 4. Montagem do HTML
    const container = document.createElement("div");
    container.className = "related-articles-box";
    
    // O título agora reflete todas as categorias encontradas
    let html = `<h3>🔗 Continue aprendendo sobre ${textoCategorias}</h3>`;
    html += `<div class="related-grid">`;

    relacionados.forEach(artigo => {
        const linkAjustado = artigo.link.replace("artigos/", "");
        const urlImagem = artigo.img.startsWith("http") ? artigo.img : `../${artigo.img}`;
        
        html += `
            <a href="${linkAjustado}" class="related-card">
                <img src="${urlImagem}" alt="${artigo.titulo}" class="related-img" loading="lazy">
                <div class="related-info">
                    <span class="related-cat">${artigo.categoria}</span>
                    <h4 class="related-title">${artigo.titulo}</h4>
                </div>
            </a>
        `;
    });

    html += `</div>`;
    container.innerHTML = html;

    const localInsercao = document.querySelector(".source-list") || document.querySelector("article");
    if (localInsercao && localInsercao.className === "source-list") {
        localInsercao.parentNode.insertBefore(container, localInsercao);
    } else if (localInsercao) {
        localInsercao.appendChild(container);
    }
}

document.addEventListener("DOMContentLoaded", inserirAcessoRapido);