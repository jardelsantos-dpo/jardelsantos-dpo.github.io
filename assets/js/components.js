/**
 * Gerenciador de Componentes Dinâmicos - Jardel Santos
 * Carrega Header e Footer e ajusta caminhos para subpastas
 */
 
document.addEventListener("DOMContentLoaded", function() {
    // Detecta se estamos em QUALQUER subpasta (artigos ou legal)
    // O uso de .some() permite adicionar novas pastas facilmente no futuro
    const subfolders = ['/artigos/', '/legal/'];
    const isSubfolder = subfolders.some(folder => window.location.pathname.includes(folder));
    
    const basePath = isSubfolder ? '../' : '';

    // O restante do seu código de fetch (Header e Footer) permanece o mesmo, 
    // pois ele já utiliza a variável 'basePath' configurada acima.
    
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
