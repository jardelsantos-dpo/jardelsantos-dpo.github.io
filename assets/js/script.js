/**
 * Script Principal - Jardel Santos
 * Integração Completa: Carrosséis (Home, Casos de Sucesso, Soft Skills, Certificados) + Filtros
 * Versão Otimizada: Filtro corporativo resiliente para a HashTag Treinamentos.
 */

// Estado Global de Controle (Certificados Dinâmicos)
let certCarouselInterval;
let currentCertIndex = 0;
let certTouchStartX = 0;
let certTouchEndX = 0;
let certificados = [];

document.addEventListener('DOMContentLoaded', () => {
    inicializarCarrosselDestaques();
    inicializarCarrosselCasosSucesso();
    inicializarToggleCertificadosEstaticos();
    inicializarToggleSoftSkills();
    inicializarCarrosselSoftSkillsMobile();
    inicializarCertificadosDinamicos();
    inicializarArtigosHome();
});

/* ==========================================================================
   1. CARROSSEL DE DESTAQUES (index.html)
   ========================================================================== */
function inicializarCarrosselDestaques() {
    const track = document.getElementById('carouselTrack');
    const dotsContainer = document.getElementById('carouselDots');
    const nextButton = document.getElementById('nextBtn');
    const prevButton = document.getElementById('prevBtn');
    
    if (!track) return;

    const slides = Array.from(track.children);
    let currentSlideIndex = 0;
    let autoPlayInterval;
    let touchStartX = 0;

    const setupDots = () => {
        if (!dotsContainer) return;
        dotsContainer.innerHTML = '';
        slides.forEach((_, index) => {
            const dot = document.createElement('div');
            dot.classList.add('dot');
            if (index === 0) dot.classList.add('active');
            dot.addEventListener('click', () => moveToSlide(index));
            dotsContainer.appendChild(dot);
        });
    };

    const updateDots = (index) => {
        const dots = dotsContainer?.querySelectorAll('.dot');
        dots?.forEach((d, i) => d.classList.toggle('active', i === index));
    };

    const moveToSlide = (index) => {
        if (index < 0) index = slides.length - 1;
        if (index >= slides.length) index = 0;
        track.style.transform = `translateX(-${index * 100}%)`;
        currentSlideIndex = index;
        updateDots(index);
    };

    const startAutoPlay = () => {
        stopAutoPlay();
        autoPlayInterval = setInterval(() => moveToSlide(currentSlideIndex + 1), 5000);
    };

    const stopAutoPlay = () => {
        if (autoPlayInterval) clearInterval(autoPlayInterval);
    };

    setupDots();
    startAutoPlay();

    nextButton?.addEventListener('click', () => { moveToSlide(currentSlideIndex + 1); startAutoPlay(); });
    prevButton?.addEventListener('click', () => { moveToSlide(currentSlideIndex - 1); startAutoPlay(); });

    track.addEventListener('touchstart', (e) => { touchStartX = e.touches[0].clientX; stopAutoPlay(); }, { passive: true });
    track.addEventListener('touchend', (e) => {
        const touchEndX = e.changedTouches[0].clientX;
        const swipeDistance = touchStartX - touchEndX;
        if (swipeDistance > 50) moveToSlide(currentSlideIndex + 1);
        else if (swipeDistance < -50) moveToSlide(currentSlideIndex - 1);
        startAutoPlay();
    }, { passive: true });
}

/* ==========================================================================
   2. CARROSSEL DE CASOS DE SUCESSO (index.html)
   ========================================================================== */
function inicializarCarrosselCasosSucesso() {
    const casesTrack = document.getElementById('casesTrack');
    const casesDotsContainer = document.getElementById('casesDots');

    if (!casesTrack || !casesDotsContainer) return;

    const cards = Array.from(casesTrack.children);
    let currentIndex = 0;
    let isPaused = false;
    let tStartX = 0;

    const getItemsPerView = () => window.innerWidth <= 992 ? 1 : 3;
    const getMaxSteps = () => Math.max(1, cards.length - getItemsPerView() + 1);

    const setupCasesDots = () => {
        casesDotsContainer.innerHTML = '';
        casesDotsContainer.removeAttribute('style');
        
        const totalSteps = getMaxSteps();
        if (totalSteps <= 1) {
            casesDotsContainer.style.display = 'none';
            return;
        }

        casesDotsContainer.style.display = 'flex';
        for (let i = 0; i < totalSteps; i++) {
            const dot = document.createElement('div');
            dot.className = i === 0 ? 'dot case-dot active' : 'dot case-dot';
            dot.addEventListener('click', () => { 
                currentIndex = i; 
                updateCasesCarousel(); 
                isPaused = true; 
            });
            casesDotsContainer.appendChild(dot);
        }
    };

    const updateCasesCarousel = () => {
        if (cards.length === 0) return;

        const isMobile = window.innerWidth <= 992;
        const parentWidth = casesTrack.parentElement.clientWidth;
        let offset = 0;

        if (isMobile) {
            offset = currentIndex * parentWidth;
        } else {
            const cardWidth = cards[0].getBoundingClientRect().width;
            const computedStyles = window.getComputedStyle(casesTrack);
            const gap = parseFloat(computedStyles.gap || computedStyles.columnGap || 0) || 0;
            offset = currentIndex * (cardWidth + gap);
        }

        casesTrack.style.transform = `translateX(-${offset}px)`;
        const dots = casesDotsContainer.querySelectorAll('.case-dot');
        dots.forEach((dot, i) => dot.classList.toggle('active', i === currentIndex));
    };

    casesTrack.addEventListener('touchstart', e => { 
        tStartX = e.changedTouches[0].screenX; 
        isPaused = true; 
    }, { passive: true });

    casesTrack.addEventListener('touchend', e => {
        const tEndX = e.changedTouches[0].screenX;
        const swipeThreshold = 50;
        const steps = getMaxSteps();

        if (tStartX - tEndX > swipeThreshold && currentIndex < steps - 1) currentIndex++;
        else if (tEndX - tStartX > swipeThreshold && currentIndex > 0) currentIndex--;
        
        updateCasesCarousel();
    }, { passive: true });

    setInterval(() => {
        if (!isPaused && cards.length > getItemsPerView()) {
            currentIndex = (currentIndex + 1) % getMaxSteps();
            updateCasesCarousel();
        }
    }, 6000);

    casesTrack.addEventListener('mouseenter', () => isPaused = true);
    casesTrack.addEventListener('mouseleave', () => isPaused = false);
    
    window.addEventListener('resize', () => { 
        currentIndex = 0; 
        setupCasesDots(); 
        updateCasesCarousel(); 
    });

    setupCasesDots();
    updateCasesCarousel();
}

/* ==========================================================================
   3. CERTIFICAÇÕES: VER MAIS / VER MENOS (Desktop Estático)
   ========================================================================== */
function inicializarToggleCertificadosEstaticos() {
    const certCardsList = document.querySelectorAll('.cert-card');
    const btnLoadMore = document.getElementById('btnLoadMore');
    const containerLoadMore = document.getElementById('loadMoreContainer');

    if (!certCardsList.length || !btnLoadMore || !containerLoadMore) return;

    const DESKTOP_BREAKPOINT = 768;
    const INITIAL_VISIBLE = 4;
    let expanded = false;

    const renderCertView = () => {
        if (window.innerWidth > DESKTOP_BREAKPOINT) {
            certCardsList.forEach((card, index) => {
                card.classList.toggle('hidden', !expanded && index >= INITIAL_VISIBLE);
            });
            btnLoadMore.textContent = expanded ? 'Ver menos' : 'Ver mais';
            btnLoadMore.setAttribute('aria-expanded', expanded);
            containerLoadMore.style.display = certCardsList.length > INITIAL_VISIBLE ? 'block' : 'none';
        } else {
            certCardsList.forEach(card => card.classList.remove('hidden'));
            containerLoadMore.style.display = 'none';
        }
    };

    btnLoadMore.addEventListener('click', () => {
        if (window.innerWidth > DESKTOP_BREAKPOINT) {
            expanded = !expanded;
            renderCertView();
            if (!expanded) document.querySelector('.certifications-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    });

    window.addEventListener('resize', renderCertView);
    renderCertView();
}

/* ==========================================================================
   4. SOFT SKILLS: VER MAIS / VER MENOS (Desktop)
   ========================================================================== */
function inicializarToggleSoftSkills() {
    const skillsCards = document.querySelectorAll('#skillsGrid .skill-card');
    const btnSkills = document.getElementById('btnSkillsLoadMore');
    const containerSkills = document.getElementById('skillsLoadMoreContainer');

    if (!skillsCards.length || !btnSkills || !containerSkills) return;

    const DESKTOP_BREAKPOINT = 768;
    const INITIAL_VISIBLE = 4;
    let expandedSkills = false;

    const renderSkillsView = () => {
        if (window.innerWidth > DESKTOP_BREAKPOINT) {
            skillsCards.forEach((card, index) => {
                card.classList.toggle('hidden', !expandedSkills && index >= INITIAL_VISIBLE);
            });
            btnSkills.textContent = expandedSkills ? 'Ver menos' : 'Ver mais';
            btnSkills.setAttribute('aria-expanded', expandedSkills);
            containerSkills.style.display = skillsCards.length > INITIAL_VISIBLE ? 'block' : 'none';
        } else {
            skillsCards.forEach(card => card.classList.remove('hidden'));
            containerSkills.style.display = 'none';
        }
    };

    btnSkills.addEventListener('click', () => {
        if (window.innerWidth > DESKTOP_BREAKPOINT) {
            expandedSkills = !expandedSkills;
            renderSkillsView();
            if (!expandedSkills) document.querySelector('.soft-skills-section')?.scrollIntoView({ behavior: 'smooth' });
        }
    });

    window.addEventListener('resize', renderSkillsView);
    renderSkillsView();
}

/* ==========================================================================
   5. SOFT SKILLS: CARROSSEL MANUAL (Mobile)
   ========================================================================== */
function inicializarCarrosselSoftSkillsMobile() {
    const skillsTrack = document.getElementById('skillsGrid');
    const skillsDotsContainer = document.getElementById('skillsDots');
    const btnPrevSkill = document.getElementById('prevSkill');
    const btnNextSkill = document.getElementById('nextSkill');

    if (!skillsTrack) return;

    let currentSkillIndex = 0;
    let skillTouchStartX = 0;

    const isMobile = () => window.innerWidth <= 768;
    const getGapPx = () => parseFloat(window.getComputedStyle(skillsTrack).gap) || 0;
    const getCardWidth = () => skillsTrack.children[0]?.getBoundingClientRect().width || 0;
    const getMaxIndex = () => Math.max(0, skillsTrack.children.length - 1);

    const updateControls = () => {
        if (btnPrevSkill) btnPrevSkill.disabled = currentSkillIndex === 0;
        if (btnNextSkill) btnNextSkill.disabled = currentSkillIndex === getMaxIndex();
        
        if (!skillsDotsContainer) return;
        skillsDotsContainer.innerHTML = '';
        for (let i = 0; i <= getMaxIndex(); i++) {
            const dot = document.createElement('div');
            dot.className = i === currentSkillIndex ? 'dot active' : 'dot';
            dot.addEventListener('click', () => { currentSkillIndex = i; moveSkills(); });
            skillsDotsContainer.appendChild(dot);
        }
    };

    const moveSkills = () => {
        if (!isMobile()) {
            skillsTrack.style.transform = 'none';
            return;
        }
        const offset = currentSkillIndex * (getCardWidth() + getGapPx());
        skillsTrack.style.transform = `translateX(-${offset}px)`;
        updateControls();
    };

    btnPrevSkill?.addEventListener('click', () => { if (currentSkillIndex > 0) { currentSkillIndex--; moveSkills(); } });
    btnNextSkill?.addEventListener('click', () => { if (currentSkillIndex < getMaxIndex()) { currentSkillIndex++; moveSkills(); } });

    skillsTrack.addEventListener('touchstart', e => { skillTouchStartX = e.changedTouches[0].screenX; }, { passive: true });
    skillsTrack.addEventListener('touchend', e => {
        const skillTouchEndX = e.changedTouches[0].screenX;
        const threshold = 50;
        if (skillTouchStartX - skillTouchEndX > threshold && currentSkillIndex < getMaxIndex()) currentSkillIndex++;
        else if (skillTouchEndX - skillTouchStartX > threshold && currentSkillIndex > 0) currentSkillIndex--;
        moveSkills();
    }, { passive: true });

    window.addEventListener('resize', () => { currentSkillIndex = 0; moveSkills(); });
    moveSkills();
}

/* ==========================================================================
   6. SEÇÃO DE CERTIFICADOS DINÂMICOS & FILTROS (sobre.html)
   ========================================================================== */
function inicializarCertificadosDinamicos() {
    if (document.getElementById('certGrid')) {
        carregarCertificados();
    }
}

async function carregarCertificados() {
    try {
        const response = await fetch('assets/data/certificados.json');
        certificados = await response.json();

        const certificadosGridPrincipal = certificados.filter(cert => !cert.tiExames);

        ordenarCertificados(certificadosGridPrincipal);
        renderCards(certificadosGridPrincipal);
        atualizarContadoresFiltros(certificadosGridPrincipal);
        updateTiExamesBanner(certificados);
        iniciarFiltros();
        aplicarFiltroPadrao();
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

        return (a.titulo || '').toLowerCase().localeCompare((b.titulo || '').toLowerCase());
    });
}

function renderCards(lista) {
    const certGrid = document.getElementById('certGrid');
    if (!certGrid) return;
    
    certGrid.innerHTML = '';

    lista.forEach(cert => {
        const card = document.createElement('div');
        
        const classes = ['cert-card'];
        if (cert.highlight) classes.push('highlight-card');
        
        // CORREÇÃO UX BLINDADA: Injeta ambas as classes possíveis para evitar falhas de digitação no HTML
        if (cert.hashtag) {
            classes.push('is-hashtag');
            classes.push('tag-hashtag');
        }
        
        card.className = classes.join(' ');
        card.dataset.category = cert.categoria;
        
        // Guarda o estado original do JSON diretamente no DOM do card
        if (cert.hashtag) {
            card.dataset.hashtag = "true";
        }

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
            filtrarCards(button.dataset.filter);
        });
    });
}

function filtrarCards(filtro) {
    const certGrid = document.getElementById('certGrid');
    if (!certGrid) return;

    const cards = certGrid.querySelectorAll('.cert-card');
    const filtrosArray = filtro.split(',');

    cards.forEach(card => {
        const categoria = card.dataset.category;
        const ehCardDaHashtag = card.dataset.hashtag === "true";

        const atendeFiltro = filtrosArray.some(f => {
            const tagLimpa = f.trim();
            
            // BLINDAGEM DA FILTRAGEM: Se a string do botão contiver 'hashtag', valida via dataset direto
            if (tagLimpa.includes('hashtag')) {
                return ehCardDaHashtag;
            }
            
            // Lógica legada/padrão para as outras tags
            const possuiTagInterna = card.querySelector(`.${tagLimpa}`);
            const possuiClasseCard = card.classList.contains(tagLimpa);
            return categoria === tagLimpa || possuiTagInterna || possuiClasseCard;
        });

        card.style.display = (filtro === 'all' || atendeFiltro) ? 'flex' : 'none';
    });

    gerenciarBotaoVoltarDpo(cards);
    iniciarCarrosselCertificadosMobile();
}

function gerenciarBotaoVoltarDpo(cards) {
    let btnVoltar = document.getElementById('btnVoltarDpoContainer');
    if (!btnVoltar) {
        btnVoltar = document.createElement('div');
        btnVoltar.id = 'btnVoltarDpoContainer';
        btnVoltar.className = 'btn-load-more-container desktop-only';
        btnVoltar.style.marginTop = '40px'; 
        btnVoltar.innerHTML = `<button class="btn-load-more" style="background-color: var(--primary-color, #007bff);">Fechar</button>`;
        
        btnVoltar.querySelector('button').addEventListener('click', () => {
            const btnDpo = document.querySelector('[data-filter="dpo"]');
            btnDpo?.click();
            document.getElementById('certFilters')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
        
        document.getElementById('certDots')?.after(btnVoltar);
    }
    
    const cardsVisiveis = Array.from(cards).filter(card => card.style.display === 'flex').length;
    btnVoltar.style.display = cardsVisiveis >= 5 ? 'block' : 'none';
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

    const atualizarPosicaoCarrossel = () => {
        if (visibleCards.length === 0) return;
        track.style.transform = `translateX(-${currentCertIndex * 100}%)`;
        dotsContainer?.querySelectorAll('.dot').forEach((d, i) => d.classList.toggle('active', i === currentCertIndex));
    };

    const reiniciarAutoPlay = () => {
        if (certCarouselInterval) clearInterval(certCarouselInterval);
        if (visibleCards.length > 1) {
            certCarouselInterval = setInterval(() => {
                currentCertIndex = (currentCertIndex + 1) % visibleCards.length;
                atualizarPosicaoCarrossel();
            }, 4000); 
        }
    };

    track.ontouchstart = e => {
        certTouchStartX = e.changedTouches[0].screenX;
        if (certCarouselInterval) clearInterval(certCarouselInterval);
    };
    
    track.ontouchend = e => {
        certTouchEndX = e.changedTouches[0].screenX;
        const threshold = 40;
        if (certTouchStartX - certTouchEndX > threshold && currentCertIndex < visibleCards.length - 1) currentCertIndex++; 
        else if (certTouchEndX - certTouchStartX > threshold && currentCertIndex > 0) currentCertIndex--; 
        
        atualizarPosicaoCarrossel();
        reiniciarAutoPlay();
    };

    reiniciarAutoPlay();
}

function aplicarFiltroPadrao() {
    document.querySelector('[data-filter="dpo"]')?.click();
}

function atualizarContadoresFiltros(lista) {
    const filterButtons = document.querySelectorAll('.filter-btn');
    
    filterButtons.forEach(btn => {
        const filter = btn.dataset.filter;
        if (!filter) return;
        
        let count = 0;

        if (filter === 'all') {
            count = lista.length;
        } else {
            const filtrosArray = filter.split(',');
            count = lista.filter(cert => {
                return filtrosArray.some(f => {
                    const tagLimpa = f.trim();
                    // BLINDAGEM DO CONTADOR: Se contiver 'hashtag', lê direto a flag bool do objeto JSON
                    if (tagLimpa.includes('hashtag')) {
                        return !!cert.hashtag;
                    }
                    return cert.categoria === tagLimpa || cert.tag === tagLimpa;
                });
            }).length;
        }

        const textoLimpo = btn.textContent.replace(/[0-9]+/, '').trim();
        btn.innerHTML = `${textoLimpo} <span class="filter-count">${count}</span>`;
    });
}

function updateTiExamesBanner(listaCompleta) {
    const el = document.getElementById('tiExamesCount');
    if (el) el.textContent = listaCompleta.filter(c => c.tiExames === true).length + '+';
}

/* ==========================================================================
   7. LÓGICA DE TRILHAS DA TI EXAMES
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
            if (tituloTrilha) tituloTrilha.textContent = `Certificados: ${botao.textContent}`;

            const certificadosFiltrados = certificados.filter(cert => cert.tiExames === true && cert.tag === tagAlvo);

            certificadosFiltrados.sort((a, b) => {
                const isHighA = !!a.highlight;
                const isHighB = !!b.highlight;
                if (isHighA !== isHighB) return isHighB - isHighA; 

                const anoA = parseInt(a.ano) || 0;
                const anoB = parseInt(b.ano) || 0;
                if (anoA !== anoB) return anoB - anoA;

                return (a.titulo || '').trim().toLowerCase().localeCompare((b.titulo || '').trim().toLowerCase(), 'pt-BR');
            });

            renderizarCardsTiExames(certificadosFiltrados, gridExames);
            iniciarCarrosselTiExamesMobile();

            containerExpansao.style.display = 'block';
            setTimeout(() => containerExpansao.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 100);
        });
    });

    btnFechar?.addEventListener('click', () => {
        containerExpansao.style.display = 'none';
        botoesTrilha.forEach(b => b.classList.remove('active'));
    });
}

function renderizarCardsTiExames(lista, elementoDestino) {
    if (!elementoDestino) return;
    elementoDestino.innerHTML = '';

    if (lista.length === 0) {
        elementoDestino.innerHTML = `<p style="color: #a0a0a0; padding: 20px; grid-column: 1 / -1; text-align: center;">Nenhuma evidência localizada para esta trilha.</p>`;
        return;
    }

    lista.forEach(cert => {
        const card = document.createElement('div');
        card.className = cert.highlight ? 'cert-card highlight-card' : 'cert-card'; 
        card.innerHTML = `
            <span class="cert-year">${cert.ano}</span>        
            <span class="cert-tag ${cert.tag}">${cert.tagLabel}</span>
            
            <div class="badge-wrapper">
                <img src="${cert.imagem}" alt="${cert.titulo}" loading="lazy" width="180" height="180">
                <div class="badge-overlay-text">${cert.textoBadge || ''}</div>
            </div>
            
            <h3>${cert.titulo}</h3>
            <a href="${cert.link}" target="_blank" rel="noopener noreferrer" class="btn-verify">
                ${cert.tipoLink}
            </a>
        `;
        elementoDestino.appendChild(card);
    });
}

let currentTiIndex = 0;
let tiTouchStartX = 0;

function iniciarCarrosselTiExamesMobile() {
    const track = document.getElementById('tiExamesGrid');
    const swipeHint = document.getElementById('tiSwipeHint');
    const controls = document.getElementById('tiControls');
    const btnPrev = document.getElementById('prevTi');
    const btnNext = document.getElementById('nextTi');
    const dotsContainer = document.getElementById('tiExamesDots');

    if (!track) return;

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

    const moverTiCarrossel = () => {
        if (cards.length === 0) return;
        const larguraExata = track.parentElement.clientWidth; 
        track.style.transform = `translateX(-${currentTiIndex * larguraExata}px)`;
        atualizarBotoesNavegacao();
        dotsContainer?.querySelectorAll('.dot').forEach((d, i) => d.classList.toggle('active', i === currentTiIndex));
    };

    const atualizarBotoesNavegacao = () => {
        if (!btnPrev || !btnNext) return;
        btnPrev.disabled = currentTiIndex === 0;
        btnPrev.style.opacity = currentTiIndex === 0 ? '0.3' : '1';
        btnNext.disabled = currentTiIndex === cards.length - 1;
        btnNext.style.opacity = currentTiIndex === cards.length - 1 ? '0.3' : '1';
    };

    if (cards.length > 1) {
        if (swipeHint) swipeHint.style.display = 'flex';
        if (controls) controls.style.display = 'flex';
        
        if (dotsContainer) {
            dotsContainer.innerHTML = '';
            cards.forEach((_, i) => {
                const dot = document.createElement('div');
                dot.className = i === 0 ? 'dot active' : 'dot';
                dot.addEventListener('click', () => { currentTiIndex = i; moverTiCarrossel(); });
                dotsContainer.appendChild(dot);
            });
        }
        atualizarBotoesNavegacao();
    } else {
        if (swipeHint) swipeHint.style.display = 'none';
        if (controls) controls.style.display = 'none';
        if (dotsContainer) dotsContainer.innerHTML = '';
    }

    if (btnPrev) btnPrev.onclick = () => { if (currentTiIndex > 0) { currentTiIndex--; moverTiCarrossel(); } };
    if (btnNext) btnNext.onclick = () => { if (currentTiIndex < cards.length - 1) { currentTiIndex++; moverTiCarrossel(); } };

    track.ontouchstart = (e) => { tiTouchStartX = e.changedTouches[0].screenX; };
    track.ontouchend = (e) => {
        const tiTouchEndX = e.changedTouches[0].screenX;
        const threshold = 40;
        // CORREÇÃO DE DIGITAÇÃO: Altera a variável global errada anterior para manipular o slider correto
        if (tiTouchStartX - tiTouchEndX > threshold && currentTiIndex < cards.length - 1) currentTiIndex++; 
        else if (tiTouchEndX - tiTouchStartX > threshold && currentTiIndex > 0) currentTiIndex--;
        moverTiCarrossel();
    };
}

/* ==========================================================================
   8. RENDERIZAÇÃO DINÂMICA DE ARTIGOS (Home)
   ========================================================================== */
function inicializarArtigosHome() {
    renderizarArtigosNaHome();
}

function renderizarArtigosNaHome() {
    const gridArtigos = document.getElementById('dynamicArticlesGrid');
    if (!gridArtigos || typeof listaArtigos === 'undefined') return;

    gridArtigos.innerHTML = '';
    const artigosPublicados = listaArtigos.filter(a => a.status !== 'em-breve');
    const artigosEmbaralhados = [...artigosPublicados].sort(() => 0.5 - Math.random());

    const quantidade = window.innerWidth < 768 ? 1 : 3;
    const artigosSelecionados = artigosEmbaralhados.slice(0, quantidade);

    artigosSelecionados.forEach(artigo => {
        gridArtigos.innerHTML += `
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
    });
}

/* ==========================================================================
   LISTENERS GLOBAIS DE REDIMENSIONAMENTO
   ========================================================================== */
window.addEventListener('resize', () => {
    const filtroAtivo = document.querySelector('#certFilters .filter-btn.active');
    if (filtroAtivo) filtrarCards(filtroAtivo.dataset.filter);
    iniciarCarrosselTiExamesMobile();
    renderizarArtigosNaHome();
});

window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
});