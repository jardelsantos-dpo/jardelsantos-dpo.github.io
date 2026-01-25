let paginaAtual = 1;
const itensPorPagina = 3; 

function renderizarArtigos() {
    const container = document.getElementById('container-artigos-dinamico');
    if (!container) return;

    container.innerHTML = "";
    
    // Ordenação por data (mais recente primeiro)
    const ordenados = listaArtigos.sort((a, b) => new Date(b.data) - new Date(a.data));
    
    const inicio = (paginaAtual - 1) * itensPorPagina;
    const fim = inicio + itensPorPagina;
    const exibidos = ordenados.slice(inicio, fim);

    exibidos.forEach(art => {
        if (art.status === "em-breve") {
            container.innerHTML += `
                <article class="article-card" style="opacity: 0.6;">
                    <div style="width: 100%; height: 200px; background: #2c313c; display: flex; align-items: center; justify-content: center;">
                        <i class="fas fa-clock" style="font-size: 3rem; color: #555;"></i>
                    </div>
                    <div class="article-content">
                        <span class="article-category">${art.categoria}</span>
                        <h3>${art.titulo}</h3>
                        <p class="article-excerpt">${art.resumo}</p>
                        <span style="font-size: 0.8rem; font-weight: 600; color: #888;">${art.dataDisponivel}</span>
                    </div>
                </article>`;
        } else {
			const [ano, mes, dia] = art.data.split("-");

			const dataFormatada = new Date(
				Number(ano),
				Number(mes) - 1,
				Number(dia)
			).toLocaleDateString("pt-BR", {
				day: "2-digit",
				month: "long",
				year: "numeric"
			});


			container.innerHTML += `
				<article class="article-card">
					<img src="${art.img}" alt="${art.titulo}" class="article-thumb">
					<div class="article-content">
						<span class="article-category">${art.categoria}</span>

						<span class="article-date">
							<i class="fa-regular fa-calendar"></i>
							${dataFormatada}
						</span>

						<h3>${art.titulo}</h3>
						<p class="article-excerpt">${art.resumo}</p>
						<a href="${art.link}" class="btn-read-more">Saiba Mais</a>
					</div>
				</article>`;
        }
    });

    // Chama a função para criar os botões logo após renderizar os cards
    renderizarPaginacao();
}

// ESTA É A FUNÇÃO QUE ESTAVA FALTANDO:
function renderizarPaginacao() {
    const totalPaginas = Math.ceil(listaArtigos.length / itensPorPagina);
    const controles = document.getElementById('paginacao-controles');
    
    if (!controles) return;

    controles.innerHTML = "";

    // Só exibe o paginador se houver mais de uma página
    if (totalPaginas > 1) {
        for (let i = 1; i <= totalPaginas; i++) {
            controles.innerHTML += `
                <button class="pag-btn ${i === paginaAtual ? 'active' : ''}" 
                        onclick="irParaPagina(${i})">${i}</button>`;
        }
    }
}

function irParaPagina(num) {
    paginaAtual = num;
    renderizarArtigos();
    // Faz o scroll suave de volta para o topo da seção de artigos
    const topo = document.querySelector('.about-container');
    if (topo) topo.scrollIntoView({ behavior: 'smooth' });
}

document.addEventListener("DOMContentLoaded", renderizarArtigos);