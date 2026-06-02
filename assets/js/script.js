/**
 * Script Principal - Jardel Santos
 * Integração Completa: Carrosséis (Home, Casos de Sucesso, Soft Skills, Certificados) + Filtros
 */

// Variáveis globais para o Carrossel de Certificados (Mobile)
let certCarouselInterval;
let currentCertIndex = 0;
let certTouchStartX = 0;
let certTouchEndX = 0;
let certificados = [];

document.addEventListener('DOMContentLoaded', () => {
    
    /* ==========================================================================
       1. CARROSSEL DE DESTAQUES (index.html)
       ========================================================================== */
    const track = document.getElementById('carouselTrack');
    if (track) {
        const slides = Array.from(track.children);
        const dotsContainer = document.getElementById('carouselDots');
        const nextButton = document.getElementById('nextBtn');
        const prevButton = document.getElementById('prevBtn');
        let currentSlideIndex = 0;
        let autoPlayInterval;
        let touchStartX = 0;
        let touchEndX = 0;

        function setupDots() {
            if (!dotsContainer) return;
            dotsContainer.innerHTML = '';
            slides.forEach((_, index) => {
                const dot = document.createElement('div');
                dot.classList.add('dot');
                if (index === 0) dot.classList.add('active');
                dot.addEventListener('click', () => moveToSlide(index));
                dotsContainer.appendChild(dot);
            });
        }

        function updateDots(index) {
            const dots = dotsContainer?.querySelectorAll('.dot');
            dots?.forEach((d, i) => d.classList.toggle('active', i === index));
        }

        function moveToSlide(index) {
            if (index < 0) index = slides.length - 1;
            if (index >= slides.length) index = 0;
            track.style.transform = `translateX(-${index * 100}%)`;
            currentSlideIndex = index;
            updateDots(index);
        }

        function startAutoPlay() {
            stopAutoPlay();
            autoPlayInterval = setInterval(() => moveToSlide(currentSlideIndex + 1), 5000);
        }

        function stopAutoPlay() { if (autoPlayInterval) clearInterval(autoPlayInterval); }

        setupDots();
        startAutoPlay();

        nextButton?.addEventListener('click', () => { moveToSlide(currentSlideIndex + 1); startAutoPlay(); });
        prevButton?.addEventListener('click', () => { moveToSlide(currentSlideIndex - 1); startAutoPlay(); });

        track.addEventListener('touchstart', (e) => { touchStartX = e.touches[0].clientX; stopAutoPlay(); }, { passive: true });
        track.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].clientX;
            const swipeDistance = touchStartX - touchEndX;
            if (swipeDistance > 50) moveToSlide(currentSlideIndex + 1);
            else if (swipeDistance < -50) moveToSlide(currentSlideIndex - 1);
            startAutoPlay();
        }, { passive: true });
    }

	/* ==========================================================================
       2. CARROSSEL DE CASOS DE SUCESSO (index.html)
       ========================================================================== */
    const casesTrack = document.getElementById('casesTrack');
    const casesDotsContainer = document.getElementById('casesDots');

    if (casesTrack && casesDotsContainer) {
        const cards = Array.from(casesTrack.children);
        let currentIndex = 0;
        let isPaused = false;
        let tStartX = 0;
        let tEndX = 0;

        // Breakpoint alinhado com o padrão de layout de 992px
        const getItemsPerView = () => window.innerWidth <= 992 ? 1 : 3;
        
        // Define o limite máximo que o índice pode alcançar de forma segura
        const getMaxSteps = () => Math.max(1, cards.length - getItemsPerView() + 1);

		function setupCasesDots() {
            if (!casesDotsContainer) return;
            
            casesDotsContainer.innerHTML = '';
            
            // Força o contêiner de bolinhas a ficar visível como flex no JS
            casesDotsContainer.style.display = 'flex';
            casesDotsContainer.style.justifyContent = 'center';
            casesDotsContainer.style.gap = '8px';
            casesDotsContainer.style.marginTop = '20px';

            const totalSteps = Math.max(1, cards.length - getItemsPerView() + 1);
            
            // Se não houver necessidade de paginação (ex: poucos cards), oculta
            if (totalSteps <= 1) {
                casesDotsContainer.style.display = 'none';
                return;
            }

            for (let i = 0; i < totalSteps; i++) {
                const dot = document.createElement('div');
                // Adicionamos uma classe específica para evitar conflitos globais do CSS
                dot.className = i === 0 ? 'dot case-dot active' : 'dot case-dot';
                
                // Estilização direta de segurança para garantir a exibição física da bolinha
                dot.style.width = '12px';
                dot.style.height = '12px';
                dot.style.borderRadius = '50%';
                dot.style.cursor = 'pointer';
                dot.style.transition = 'all 0.3s ease';
                
                dot.addEventListener('click', () => { 
                    currentIndex = i; 
                    updateCasesCarousel(); 
                    isPaused = true; 
                });
                casesDotsContainer.appendChild(dot);
            }
        }

		function updateCasesCarousel() {
            if (cards.length === 0) return;

            const isMobile = window.innerWidth <= 992;
            const parentWidth = casesTrack.parentElement.clientWidth;
            
            let offset = 0;

            if (isMobile) {
                // No mobile, move exatamente a largura de um contêiner por vez (1 card por tela)
                offset = currentIndex * parentWidth;
            } else {
                // No desktop (3 itens por tela), calcula dinamicamente baseado na largura do card + gap real lido do CSS
                const cardWidth = cards[0].getBoundingClientRect().width;
                const computedStyles = window.getComputedStyle(casesTrack);
                const gap = parseFloat(computedStyles.gap || computedStyles.columnGap || 0) || 0;
                
                offset = currentIndex * (cardWidth + gap);
            }

            casesTrack.style.transform = `translateX(-${offset}px)`;
            
            // Seleção atualizada com a classe específica .case-dot para evitar conflitos globais
            const dots = casesDotsContainer.querySelectorAll('.case-dot');
            dots.forEach((dot, i) => dot.classList.toggle('active', i === currentIndex));
        }
		
        // Eventos de Toque (Swipe Mobile)
        casesTrack.addEventListener('touchstart', e => { 
            tStartX = e.changedTouches[0].screenX; 
            isPaused = true; 
        }, { passive: true });

        casesTrack.addEventListener('touchend', e => {
            tEndX = e.changedTouches[0].screenX;
            const swipeThreshold = 50;
            const steps = getMaxSteps();

            if (tStartX - tEndX > swipeThreshold && currentIndex < steps - 1) {
                currentIndex++; // Swipe para a esquerda (Avança)
            } else if (tEndX - tStartX > swipeThreshold && currentIndex > 0) {
                currentIndex--; // Swipe para a direita (Volta)
            }
            updateCasesCarousel();
        }, { passive: true });

        // Loop de Autoplay corrigido (impede estouro do índice máximo)
        setInterval(() => {
            if (!isPaused && cards.length > getItemsPerView()) {
                const steps = getMaxSteps();
                currentIndex = (currentIndex + 1) % steps;
                updateCasesCarousel();
            }
        }, 6000);

        // Controles de Pausa por Interação do Usuário
        casesTrack.addEventListener('mouseenter', () => isPaused = true);
        casesTrack.addEventListener('mouseleave', () => isPaused = false);
        
        // Ajuste dinâmico responsivo
        window.addEventListener('resize', () => { 
            currentIndex = 0; 
            setupCasesDots(); 
            updateCasesCarousel(); 
        });

        // Inicialização primária da seção
        setupCasesDots();
        updateCasesCarousel();
    }

    /* ==========================================================================
       3. CERTIFICAÇÕES: VER MAIS / VER MENOS (Desktop - Opcional se usar os botões de filtro)
       ========================================================================== */
    const certCardsList = document.querySelectorAll('.cert-card');
    const btnLoadMore = document.getElementById('btnLoadMore');
    const containerLoadMore = document.getElementById('loadMoreContainer');

    if (certCardsList.length && btnLoadMore && containerLoadMore) {
        const DESKTOP_BREAKPOINT = 768;
        const INITIAL_VISIBLE = 4;
        let expanded = false;

        function applyDesktopView() {
            certCardsList.forEach((card, index) => {
                if (!expanded && index >= INITIAL_VISIBLE) card.classList.add('hidden');
                else card.classList.remove('hidden');
            });
            btnLoadMore.textContent = expanded ? 'Ver menos' : 'Ver mais';
            btnLoadMore.setAttribute('aria-expanded', expanded ? 'true' : 'false');
            containerLoadMore.style.display = certCardsList.length > INITIAL_VISIBLE ? 'block' : 'none';
        }

        function applyMobileView() {
            certCardsList.forEach(card => card.classList.remove('hidden'));
            containerLoadMore.style.display = 'none';
            expanded = true;
            btnLoadMore.setAttribute('aria-expanded', 'true');
        }

        function renderCertView() {
            if (window.innerWidth > DESKTOP_BREAKPOINT) {
                if (typeof expanded !== 'boolean') expanded = false;
                applyDesktopView();
            } else applyMobileView();
        }

        btnLoadMore.addEventListener('click', function() {
            if (window.innerWidth > DESKTOP_BREAKPOINT) {
                expanded = !expanded;
                applyDesktopView();
                if (!expanded) document.querySelector('.certifications-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });

        window.addEventListener('resize', renderCertView);
        renderCertView();
    }

    /* ==========================================================================
       4. SOFT SKILLS: VER MAIS / VER MENOS (Desktop)
       ========================================================================== */
    const skillsCards = document.querySelectorAll('#skillsGrid .skill-card');
    const btnSkills = document.getElementById('btnSkillsLoadMore');
    const containerSkills = document.getElementById('skillsLoadMoreContainer');

    if (skillsCards.length && btnSkills && containerSkills) {
        const DESKTOP_BREAKPOINT = 768;
        const INITIAL_VISIBLE = 4;
        let expandedSkills = false;

        function applyDesktopSkills() {
            skillsCards.forEach((card, index) => {
                if (!expandedSkills && index >= INITIAL_VISIBLE) card.classList.add('hidden');
                else card.classList.remove('hidden');
            });
            btnSkills.textContent = expandedSkills ? 'Ver menos' : 'Ver mais';
            btnSkills.setAttribute('aria-expanded', expandedSkills);
            containerSkills.style.display = skillsCards.length > INITIAL_VISIBLE ? 'block' : 'none';
        }

        function applyMobileSkills() {
            skillsCards.forEach(card => card.classList.remove('hidden'));
            containerSkills.style.display = 'none';
            expandedSkills = true;
        }

        function renderSkillsView() {
            if (window.innerWidth > DESKTOP_BREAKPOINT) applyDesktopSkills();
            else applyMobileSkills();
        }

        btnSkills.addEventListener('click', () => {
            if (window.innerWidth > DESKTOP_BREAKPOINT) {
                expandedSkills = !expandedSkills;
                applyDesktopSkills();
                if (!expandedSkills) document.querySelector('.soft-skills-section')?.scrollIntoView({ behavior: 'smooth' });
            }
        });

        window.addEventListener('resize', renderSkillsView);
        renderSkillsView();
    }

    /* ==========================================================================
       5. SOFT SKILLS: CARROSSEL MANUAL (Mobile)
       ========================================================================== */
    const skillsTrack = document.getElementById('skillsGrid');
    const skillsDotsContainer = document.getElementById('skillsDots');
    const btnPrevSkill = document.getElementById('prevSkill');
    const btnNextSkill = document.getElementById('nextSkill');

    if (skillsTrack) {
        let currentSkillIndex = 0;
        let skillTouchStartX = 0;
        let skillTouchEndX = 0;

        function isMobile() { return window.innerWidth <= 768; }
        function getGapPx() {
            const styles = window.getComputedStyle(skillsTrack);
            return parseFloat(styles.gap || styles.columnGap || 0) || 0;
        }
        function getCardWidth() {
            const first = skillsTrack.children[0];
            return first ? first.getBoundingClientRect().width : 0;
        }
        function getMaxIndex() { return Math.max(0, skillsTrack.children.length - 1); }

        function updateNavButtons() {
            if (!btnPrevSkill || !btnNextSkill) return;
            btnPrevSkill.disabled = currentSkillIndex === 0;
            btnNextSkill.disabled = currentSkillIndex === getMaxIndex();
        }

        function updateSkillDots() {
            if (!skillsDotsContainer) return;
            skillsDotsContainer.innerHTML = '';
            const max = getMaxIndex();
            for (let i = 0; i <= max; i++) {
                const dot = document.createElement('div');
                dot.classList.add('dot');
                if (i === currentSkillIndex) dot.classList.add('active');
                dot.addEventListener('click', () => { currentSkillIndex = i; moveSkills(); });
                skillsDotsContainer.appendChild(dot);
            }
        }

        function moveSkills() {
            if (!isMobile()) {
                skillsTrack.style.transform = 'none';
                return;
            }
            const offset = currentSkillIndex * (getCardWidth() + getGapPx());
            skillsTrack.style.transform = `translateX(-${offset}px)`;
            updateSkillDots();
            updateNavButtons();
        }

        btnPrevSkill?.addEventListener('click', () => {
            if (!isMobile() || currentSkillIndex === 0) return;
            currentSkillIndex--;
            moveSkills();
        });

        btnNextSkill?.addEventListener('click', () => {
            if (!isMobile() || currentSkillIndex === getMaxIndex()) return;
            currentSkillIndex++;
            moveSkills();
        });

        skillsTrack.addEventListener('touchstart', e => { skillTouchStartX = e.changedTouches[0].screenX; }, { passive: true });
        skillsTrack.addEventListener('touchend', e => {
            skillTouchEndX = e.changedTouches[0].screenX;
            const threshold = 50;
            if (skillTouchStartX - skillTouchEndX > threshold && currentSkillIndex < getMaxIndex()) currentSkillIndex++;
            else if (skillTouchEndX - skillTouchStartX > threshold && currentSkillIndex > 0) currentSkillIndex--;
            moveSkills();
        }, { passive: true });

        window.addEventListener('resize', () => { currentSkillIndex = 0; moveSkills(); });
        moveSkills();
    }

    /* ==========================================================================
       6. INICIALIZAÇÃO DA SEÇÃO DE CERTIFICADOS DINÂMICOS (sobre.html)
       ========================================================================== */
    const certGridObj = document.getElementById('certGrid');
    if (certGridObj) {
        carregarCertificados();
    }

}); // FIM DO DOMContentLoaded

/* ==========================================================================
   FUNÇÕES GLOBAIS DA SEÇÃO DE CERTIFICADOS
   ========================================================================== */

async function carregarCertificados() {
    try {
        const response = await fetch('assets/data/certificados.json');
        certificados = await response.json();

        // FILTRO CRUCIAL: Remove os itens da TI Exames para não irem para a Grid principal!
        const certificadosGridPrincipal = certificados.filter(cert => !cert.tiExames);

        // 1. Ordena os dados que vão para a grid
        ordenarCertificados(certificadosGridPrincipal);

        // 2. Renderiza APENAS os certificados oficiais na grid
        renderCards(certificadosGridPrincipal);

        // 3. Atualiza os contadores (conta apenas os da Grid)
        atualizarContadoresFiltros(certificadosGridPrincipal);

        // 4. Atualiza o banner da TI Exames (passando a lista COMPLETA para contar os 14+)
        updateTiExamesBanner(certificados);

        // 5. Ativa os eventos de clique nos filtros
        iniciarFiltros();

        // 6. Executa o filtro padrão inicial ("dpo")
        aplicarFiltroPadrao();
		
		// 7. Inicia a interativade do bloco TI Exames
        iniciarFiltrosTiExames();

    } catch (error) {
        console.error('Erro ao carregar certificados:', error);
    }
}

function ordenarCertificados(lista) {
    lista.sort((a, b) => {
        const catA = (a.categoria || '').toLowerCase();
        const catB = (b.categoria || '').toLowerCase();

        if (catA === 'dpo' && catB !== 'dpo') return -1;
        if (catB === 'dpo' && catA !== 'dpo') return 1;
        if (catA === 'dpo' && catB === 'dpo') return (a.id || 0) - (b.id || 0);

        const anoA = parseInt(a.ano) || 0;
        const anoB = parseInt(b.ano) || 0;
        if (anoA !== anoB) return anoB - anoA; 

        const tituloA = (a.titulo || '').toLowerCase();
        const tituloB = (b.titulo || '').toLowerCase();
        return tituloA.localeCompare(tituloB);
    });
}

function renderCards(lista) {
    const certGrid = document.getElementById('certGrid');
    if (!certGrid) return;
    
    certGrid.innerHTML = '';

    lista.forEach(cert => {
        const card = document.createElement('div');
        card.className = cert.highlight ? 'cert-card highlight-card' : 'cert-card';
        card.dataset.category = cert.categoria;

        card.innerHTML = `
            <span class="cert-year">${cert.ano}</span>        
            <span class="cert-tag ${cert.tag}">${cert.tagLabel}</span>
            <img src="${cert.imagem}" alt="${cert.titulo}" loading="lazy" width="180" height="180">
            <h3>${cert.titulo}</h3>
            <a href="${cert.link}" target="_blank" rel="noopener noreferrer" class="btn-verify">
                ${cert.tipoLink}
            </a>
        `;

        certGrid.appendChild(card);
    });
}

function iniciarFiltros() {
    const filterButtons = document.querySelectorAll('.filter-btn');

    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            filterButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');

            const filtro = button.dataset.filter;
            filtrarCards(filtro);
        });
    });
}

function filtrarCards(filtro) {
    const certGrid = document.getElementById('certGrid');
    if (!certGrid) return;

    const cards = certGrid.querySelectorAll('.cert-card');

	// Transforma a string do data-filter em um array (separando pelas vírgulas)
    const filtrosArray = filtro.split(',');

    cards.forEach(card => {
        const categoria = card.dataset.category;
        
        // Verifica se o card atende a pelo menos uma das tags listadas no botão
        const atendeFiltro = filtrosArray.some(f => {
            const tagLimpa = f.trim(); // Remove espaços acidentais
            const possuiTag = card.querySelector(`.${tagLimpa}`);
            return categoria === tagLimpa || possuiTag;
        });

        if (filtro === 'all' || atendeFiltro) {
            card.style.display = 'flex';
        } else {
            card.style.display = 'none';
        }
    });

// 2. Lógica do Botão "Fechar / Voltar para DPO" (Desktop UX)
    let btnVoltar = document.getElementById('btnVoltarDpoContainer');
    if (!btnVoltar) {
        btnVoltar = document.createElement('div');
        btnVoltar.id = 'btnVoltarDpoContainer';
        btnVoltar.className = 'btn-load-more-container desktop-only';
        btnVoltar.style.marginTop = '40px'; 
        btnVoltar.innerHTML = `<button class="btn-load-more" style="background-color: var(--primary-color, #007bff);">Fechar</button>`;
        
        btnVoltar.querySelector('button').addEventListener('click', () => {
            const btnDpo = document.querySelector('[data-filter="dpo"]');
            if (btnDpo) btnDpo.click();
            document.getElementById('certFilters').scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
        
        const certDots = document.getElementById('certDots');
        if (certDots) certDots.after(btnVoltar);
    }
    
    // --- NOVA LOGICA DE EXIBIÇÃO POR LINHAS ---
    // Conta quantos cards estão visíveis após a filtragem atual
    const cardsVisiveis = Array.from(cards).filter(card => card.style.display === 'flex').length;

    // Se o layout tiver 4 cards por linha, a partir de 5 cards já temos 2 linhas ocupadas.
    // (Se o seu layout for de 3 cards por linha, mude o número abaixo para >= 4)
    if (cardsVisiveis >= 5) {
        btnVoltar.style.display = 'block';
    } else {
        btnVoltar.style.display = 'none';
    }

    // Reinicia o Carrossel Mobile adaptado para os cards visíveis
    iniciarCarrosselCertificadosMobile();
}

function iniciarCarrosselCertificadosMobile() {
    const track = document.getElementById('certGrid');
    const dotsContainer = document.getElementById('certDots');
    if (!track) return;

    const parentSection = track.parentElement; 
    
    if (certCarouselInterval) clearInterval(certCarouselInterval);
    
    if (window.innerWidth > 992) {
        track.style.transform = 'none';
        if (parentSection) parentSection.style.overflow = 'visible';
        if (dotsContainer) dotsContainer.innerHTML = '';
        return;
    }

    if (parentSection) parentSection.style.overflow = 'hidden';

    const visibleCards = Array.from(track.querySelectorAll('.cert-card')).filter(c => c.style.display !== 'none');

    currentCertIndex = 0;
    track.style.transform = 'translateX(0)';
    
    if (dotsContainer) {
        dotsContainer.innerHTML = '';
        if (visibleCards.length > 1) {
            visibleCards.forEach((_, i) => {
                const dot = document.createElement('div');
                dot.className = i === 0 ? 'dot active' : 'dot';
                dot.addEventListener('click', () => {
                    currentCertIndex = i;
                    atualizarPosicaoCarrossel();
                    reiniciarAutoPlay();
                });
                dotsContainer.appendChild(dot);
            });
        }
    }

    function atualizarPosicaoCarrossel() {
        if (visibleCards.length === 0) return;
        track.style.transform = `translateX(-${currentCertIndex * 100}%)`;
        
        if (dotsContainer) {
            dotsContainer.querySelectorAll('.dot').forEach((d, i) => {
                d.classList.toggle('active', i === currentCertIndex);
            });
        }
    }

    function reiniciarAutoPlay() {
        if (certCarouselInterval) clearInterval(certCarouselInterval);
        if (visibleCards.length > 1) {
            certCarouselInterval = setInterval(() => {
                currentCertIndex = (currentCertIndex + 1) % visibleCards.length;
                atualizarPosicaoCarrossel();
            }, 4000); 
        }
    }

    track.ontouchstart = e => {
        certTouchStartX = e.changedTouches[0].screenX;
        if (certCarouselInterval) clearInterval(certCarouselInterval);
    };
    
    track.ontouchend = e => {
        certTouchEndX = e.changedTouches[0].screenX;
        const threshold = 40;
        
        if (certTouchStartX - certTouchEndX > threshold && currentCertIndex < visibleCards.length - 1) {
            currentCertIndex++; 
        } else if (certTouchEndX - certTouchStartX > threshold && currentCertIndex > 0) {
            currentCertIndex--; 
        }
        
        atualizarPosicaoCarrossel();
        reiniciarAutoPlay();
    };

    reiniciarAutoPlay();
}

function aplicarFiltroPadrao() {
    const defaultButton = document.querySelector('[data-filter="dpo"]');
    if (defaultButton) defaultButton.click();
}

/* =========================
   ATUALIZAR CONTADORES DOS FILTROS
========================= */
function atualizarContadoresFiltros(lista) {
    const filterButtons = document.querySelectorAll('.filter-btn');
    
    filterButtons.forEach(btn => {
        const filter = btn.dataset.filter;
        let count = 0;

        if (filter === 'all') {
            count = lista.length;
        } else {
            // Divide o filtro por vírgulas (caso seja um botão múltiplo)
            const filtrosArray = filter.split(',');
            
            // Conta quantos certificados batem com qualquer uma das tags do botão
            count = lista.filter(cert => {
                return filtrosArray.some(f => {
                    const tagLimpa = f.trim();
                    // Verifica se a categoria do JSON ou a Tag do JSON correspondem
                    return cert.categoria === tagLimpa || cert.tag === tagLimpa;
                });
            }).length;
        }

        // Limpa o texto original removendo números antigos para evitar duplicações
        const textoLimpo = btn.textContent.replace(/[0-9]+/, '').trim();
        btn.innerHTML = `${textoLimpo} <span class="filter-count">${count}</span>`;
    });
}


function updateTiExamesBanner(listaCompleta) {
    const el = document.getElementById('tiExamesCount');
    if (!el) return;
    const count = listaCompleta.filter(c => c.tiExames === true).length;
    el.textContent = count + '+';
}

/* ==========================================================================
   UTILITÁRIOS GLOBAIS
   ========================================================================== */

// Recalcula o carrossel mobile caso mude o tamanho da tela (ex: rotacionar celular)
window.addEventListener('resize', () => {
    const filtroAtivo = document.querySelector('#certFilters .filter-btn.active');
    if (filtroAtivo) filtrarCards(filtroAtivo.dataset.filter);
});

// Bloqueio do Pop-up nativo de Instalação PWA
window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    console.log('Sugestão de instalação bloqueada pelo sistema.');
});

/* ==========================================================================
   LÓGICA DE EXPANSÃO E FILTRO: TI EXAMES (MOTOR DE ORDENAÇÃO MATRIZ BLINDADO)
   ========================================================================== */
function iniciarFiltrosTiExames() {
    const botoesTrilha = document.querySelectorAll('.ti-tag-btn');
    const containerExpansao = document.getElementById('tiExamesContainer');
    const gridExames = document.getElementById('tiExamesGrid');
    const btnFechar = document.getElementById('closeTiExamesBtn');
    const tituloTrilha = document.getElementById('tiExamesTitle');

    if (!botoesTrilha.length || !containerExpansao) return;

    botoesTrilha.forEach(botao => {
        botao.addEventListener('click', () => {
            botoesTrilha.forEach(b => b.classList.remove('active'));
            botao.classList.add('active');

            const tagAlvo = botao.dataset.tiFilter;
            const nomeTrilha = botao.textContent;
            
            if (tituloTrilha) tituloTrilha.textContent = `Certificados: ${nomeTrilha}`;

            // 1. Coleta e filtra os dados do array global
            let certificadosFiltrados = certificados.filter(cert => 
                cert.tiExames === true && cert.tag === tagAlvo
            );

            // 2. APLICAÇÃO DA MATRIZ DE ORDENAÇÃO SEM FALHAS (Conversão Explícita)
            certificadosFiltrados.sort((a, b) => {
                // Força a conversão para booleano puro (true ou false), mesmo se for undefined no JSON
                const isHighA = !!a.highlight;
                const isHighB = !!b.highlight;

                // 1ª Regra: Se os status de Highlight forem diferentes, o true (1) subtrai o false (0)
                // Invertemos a ordem (b - a) para que o true (1) fique no topo (índice menor)
                if (isHighA !== isHighB) {
                    return isHighB - isHighA; 
                }

                // 2ª Regra: Empate no Highlight? Ordena por Ano (Mais recente primeiro)
                const anoA = parseInt(a.ano) || 0;
                const anoB = parseInt(b.ano) || 0;
                if (anoA !== anoB) {
                    return anoB - anoA;
                }

                // 3ª Regra: Empate no Ano? Ordena por Título (Ordem Alfabética estrita A-Z)
                const tituloA = (a.titulo || '').trim().toLowerCase();
                const tituloB = (b.titulo || '').trim().toLowerCase();
                return tituloA.localeCompare(tituloB, 'pt-BR');
            });

            // 3. Renderiza os cards na tela na ordem exata calculada
            renderizarCardsTiExames(certificadosFiltrados, gridExames);
			
			// ---> ADICIONE ESTA LINHA AQUI <---
            iniciarCarrosselTiExamesMobile();

            // 4. Exibe e rola a tela suavemente
            containerExpansao.style.display = 'block';
            setTimeout(() => {
                containerExpansao.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }, 100);
        });
    });

    btnFechar?.addEventListener('click', () => {
        containerExpansao.style.display = 'none';
        botoesTrilha.forEach(b => b.classList.remove('active'));
    });
}

function renderizarCardsTiExames(lista, elementoDestino) {
    elementoDestino.innerHTML = '';

    if (lista.length === 0) {
        elementoDestino.innerHTML = `<p style="color: #a0a0a0; padding: 20px; grid-column: 1 / -1; text-align: center;">Nenhuma evidência localizada para esta trilha.</p>`;
        return;
    }

    lista.forEach(cert => {
        const card = document.createElement('div');
        // Injeta a classe correta baseada no highlight para aplicar a borda luminosa/destaque do seu CSS
        card.className = cert.highlight ? 'cert-card highlight-card' : 'cert-card'; 
        
        card.innerHTML = `
            <span class="cert-year">${cert.ano}</span>        
            <span class="cert-tag ${cert.tag}">${cert.tagLabel}</span>
            <img src="${cert.imagem}" alt="${cert.titulo}" loading="lazy" width="180" height="180">
            <h3>${cert.titulo}</h3>
            <a href="${cert.link}" target="_blank" rel="noopener noreferrer" class="btn-verify">
                ${cert.tipoLink}
            </a>
        `;
        elementoDestino.appendChild(card);
    });
}

/* ==========================================================================
   CARROSSEL MOBILE - ÁREA DE TI EXAMES
   ========================================================================== */
let currentTiIndex = 0;
let tiTouchStartX = 0;
let tiTouchEndX = 0;

function iniciarCarrosselTiExamesMobile() {
    const track = document.getElementById('tiExamesGrid');
    const swipeHint = document.getElementById('tiSwipeHint');
    const controls = document.getElementById('tiControls');
    const btnPrev = document.getElementById('prevTi');
    const btnNext = document.getElementById('nextTi');
    const dotsContainer = document.getElementById('tiExamesDots');

    if (!track) return;

    // Se for Desktop, reseta os estilos e oculta as dicas de swipe
    if (window.innerWidth > 768) {
        track.style.transform = 'none';
        if (swipeHint) swipeHint.style.display = 'none';
        if (controls) controls.style.display = 'none';
        if (dotsContainer) dotsContainer.innerHTML = '';
        return;
    }

    const cards = Array.from(track.children);
    currentTiIndex = 0;
    track.style.transform = 'translateX(0)';

    // Só ativa o carrossel se tiver mais de 1 card
    if (cards.length > 1) {
        if (swipeHint) swipeHint.style.display = 'flex';
        if (controls) controls.style.display = 'flex';
        
        // Cria os Dots (bolinhas)
        if (dotsContainer) {
            dotsContainer.innerHTML = '';
            cards.forEach((_, i) => {
                const dot = document.createElement('div');
                dot.className = i === 0 ? 'dot active' : 'dot';
                dot.addEventListener('click', () => {
                    currentTiIndex = i;
                    moverTiCarrossel();
                });
                dotsContainer.appendChild(dot);
            });
        }
        
        atualizarBotoesNavegacao();
    } else {
        if (swipeHint) swipeHint.style.display = 'none';
        if (controls) controls.style.display = 'none';
        if (dotsContainer) dotsContainer.innerHTML = '';
    }

  	// Função de Movimento Corrigida (Pixel Perfect)
    function moverTiCarrossel() {
        if (cards.length === 0) return;
        
        // Mede a largura exata do container na tela do usuário naquele momento
        const larguraExata = track.parentElement.clientWidth; 
        
        // Move usando pixels exatos, ignorando conflitos de porcentagem
        track.style.transform = `translateX(-${currentTiIndex * larguraExata}px)`;
        
        atualizarBotoesNavegacao();

        // Atualiza as bolinhas (dots)
        if (dotsContainer) {
            dotsContainer.querySelectorAll('.dot').forEach((d, i) => {
                d.classList.toggle('active', i === currentTiIndex);
            });
        }
    }

    // Gerencia o estado "desabilitado" das setas
    function atualizarBotoesNavegacao() {
        if (!btnPrev || !btnNext) return;
        btnPrev.disabled = currentTiIndex === 0;
        btnPrev.style.opacity = currentTiIndex === 0 ? '0.3' : '1';
        
        btnNext.disabled = currentTiIndex === cards.length - 1;
        btnNext.style.opacity = currentTiIndex === cards.length - 1 ? '0.3' : '1';
    }

    // Eventos dos Botões ❮ ❯
    if (btnPrev) {
        btnPrev.onclick = () => {
            if (currentTiIndex > 0) {
                currentTiIndex--;
                moverTiCarrossel();
            }
        };
    }
    if (btnNext) {
        btnNext.onclick = () => {
            if (currentTiIndex < cards.length - 1) {
                currentTiIndex++;
                moverTiCarrossel();
            }
        };
    }

    // Eventos de Swipe (Toque na Tela)
    track.ontouchstart = (e) => {
        tiTouchStartX = e.changedTouches[0].screenX;
    };

    track.ontouchend = (e) => {
        tiTouchEndX = e.changedTouches[0].screenX;
        const threshold = 40; // Sensibilidade do arraste

        if (tiTouchStartX - tiTouchEndX > threshold && currentTiIndex < cards.length - 1) {
            currentTiIndex++; // Arrasta para esquerda
        } else if (tiTouchEndX - tiTouchStartX > threshold && currentTiIndex > 0) {
            currentTiIndex--; // Arrasta para direita
        }
        moverTiCarrossel();
    };
}

// Escuta a rotação da tela para recalcular se deve ou não exibir o carrossel
window.addEventListener('resize', iniciarCarrosselTiExamesMobile);

/* ==========================================================================
   RENDERIZAÇÃO DINÂMICA DE ARTIGOS (ALEATÓRIA)
   ========================================================================== */

function renderizarArtigosNaHome() {
    const gridArtigos = document.getElementById('dynamicArticlesGrid');
    if (!gridArtigos || typeof listaArtigos === 'undefined') return;

    gridArtigos.innerHTML = '';

    // Filtra artigos publicados
    const artigosPublicados = listaArtigos.filter(a => a.status !== 'em-breve');
    
    // Embaralha
    const artigosEmbaralhados = [...artigosPublicados].sort(() => 0.5 - Math.random());

    // Define a quantidade: 1 se for mobile (menor que 768px), 3 se for desktop
    const quantidade = window.innerWidth < 768 ? 1 : 3;
    const artigosSelecionados = artigosEmbaralhados.slice(0, quantidade);

    artigosSelecionados.forEach(artigo => {
        const cardHTML = `
            <article class="article-card">
                <div class="article-image">
                    <img src="${artigo.img}" alt="${artigo.titulo}" loading="lazy">
                </div>
                <div class="article-content">
                    <span class="category">${artigo.categoria}</span>
                    <h3>${artigo.titulo}</h3>
                    <p class="article-excerpt">${artigo.resumo}</p>
                    <a href="${artigo.link}" class="read-more">Ler artigo completo <i class="fas fa-arrow-right"></i></a>
                </div>
            </article>
        `;
        gridArtigos.innerHTML += cardHTML;
    });
}

// Dispara na carga e recarrega caso o usuário rotacione o celular
document.addEventListener('DOMContentLoaded', renderizarArtigosNaHome);
window.addEventListener('resize', renderizarArtigosNaHome);




