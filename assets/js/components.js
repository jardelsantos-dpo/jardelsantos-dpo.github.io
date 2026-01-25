/**
 * Gerenciador de Componentes Dinâmicos - Jardel Santos
 * Carrega Header e Footer e ajusta caminhos para subpastas
 */

document.addEventListener("DOMContentLoaded", function() {
    // Detecta se estamos na pasta de artigos para ajustar os caminhos relativos
    const isSubfolder = window.location.pathname.includes('/artigos/');
    const basePath = isSubfolder ? '../' : '';

    // 1. Carregar Header
    fetch(basePath + 'includes/header.html')
        .then(response => {
            if (!response.ok) throw new Error('Erro ao carregar header');
            return response.text();
        })
		
		// ... dentro do fetch do header em components.js
		.then(data => {
			const headerElement = document.querySelector("header");
			let correctedData = data.replace(/href="(?!http|https|#|mailto:|tel:)/g, `href="${basePath}`);
			headerElement.innerHTML = correctedData;
			
			// Inicia o menu mobile
			initMobileMenu();
			
			// NOVIDADE: Inicia a busca logo após carregar o HTML do header
			if (typeof initSearch === "function") {
				initSearch();
			}
		})
        .catch(err => console.error(err));

    // 2. Carregar Footer
    fetch(basePath + 'includes/footer.html')
        .then(response => {
            if (!response.ok) throw new Error('Erro ao carregar footer');
            return response.text();
        })
        .then(data => {
            const footerElement = document.querySelector("footer");
            let correctedData = data.replace(/href="(?!http|https|#|mailto:|tel:)/g, `href="${basePath}`);
            footerElement.innerHTML = correctedData;
        })
        .catch(err => console.error(err));
});

// Função do Menu Mobile (Extraída do seu script.js original)
function initMobileMenu() {
    const hamburger = document.getElementById('hamburger');
    const navLinks = document.getElementById('navLinks');

    if (hamburger && navLinks) {
        hamburger.onclick = () => {
            navLinks.classList.toggle('active');
        };
        
        const links = navLinks.querySelectorAll('a');
        links.forEach(link => {
            link.onclick = () => {
                navLinks.classList.remove('active');
            };
        });
    }
}
