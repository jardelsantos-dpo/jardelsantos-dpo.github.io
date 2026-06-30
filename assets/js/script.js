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
    });7
}

function renderCards(lista) {
    const certGrid = document.getElementById('certGrid');
    if (!certGrid) return;
    
    certGrid.innerHTML = '';

    lista.forEach(cert => {
        const card = document.createElement('div');
        const classes = ['cert-card'];
        if (cert.highlight) classes.push('highlight-card');
        
        // Injeção de flags de plataforma para os filtros funcionarem isolados
        if (cert.hashtag) { classes.push('is-hashtag'); card.dataset.hashtag = "true"; }
        if (cert.dio) { classes.push('is-dio'); card.dataset.dio = "true"; }
        
        card.className = classes.join(' ');
        card.dataset.category = cert.categoria;

        // LÓGICA DO BOTÃO DE VALIDAÇÃO (String vs Array)
        let botaoValidaHtml = '';
        if (Array.isArray(cert.link)) {
            // Se for Array, transforma em string segura e chama a função global
            const linksEscapados = JSON.stringify(cert.link).replace(/"/g, '&quot;');
            botaoValidaHtml = `
                <button onclick="abrirMultiplosLinks(${linksEscapados})" class="btn-verify" style="cursor:pointer; border:none; width:100%; font-family:inherit;">
                    ${cert.tipoLink}
                </button>`;
        } else {
            // Se for string comum, mantém o comportamento padrão de link
            botaoValidaHtml = `
                <a href="${cert.link}" target="_blank" rel="noopener noreferrer" class="btn-verify">
                    ${cert.tipoLink}
                </a>`;
        }

        card.innerHTML = `
            <span class="cert-year">${cert.ano}</span>        
            <span class="cert-tag ${cert.tag}">${cert.tagLabel}</span>
            <img src="${cert.imagem}" alt="${cert.titulo}" loading="lazy" width="180" height="180">
            <h3>${cert.titulo}</h3>
            ${botaoValidaHtml}
        `;
        certGrid.appendChild(card);
    });
}

// FUNÇÃO GLOBAL AUXILIAR: Executa a abertura em lote das abas
window.abrirMultiplosLinks = function(urls) {
    if (Array.isArray(urls)) {
        urls.forEach(url => {
            window.open(url, '_blank');
        });
    }
};

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
        const ehCardDaDio = card.dataset.dio === "true";

        const atendeFiltro = filtrosArray.some(f => {
            const tagLimpa = f.trim().toLowerCase();
            
            if (tagLimpa.includes('hashtag')) return ehCardDaHashtag;
            if (tagLimpa.includes('dio')) return ehCardDaDio; // Ativação do filtro DIO.me
            
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
                    const tagLimpa = f.trim().toLowerCase();
                    if (tagLimpa.includes('hashtag')) return !!cert.hashtag;
                    if (tagLimpa.includes('dio')) return !!cert.dio; // Contagem correta da DIO
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

            const tagAlvo = botao.dataset.tiFilter || '';
            
            // 🔥 ADAPTAÇÃO: Transforma "tag-privacy,tag-lgpd" em um array: ['tag-privacy', 'tag-lgpd']
            // Também remove espaços extras caso digite "tag-privacy, tag-lgpd" por engano
            const listaTagsAlvo = tagAlvo.split(',').map(tag => tag.trim());

            if (tituloTrilha) tituloTrilha.textContent = `Certificados: ${botao.textContent.trim()}`;

            // 🔥 ADAPTAÇÃO: Verifica se a tag OU plataforma do certificado está inclusa no array de alvos
            const certificadosFiltrados = certificados.filter(cert => 
                cert.tiExames === true && (listaTagsAlvo.includes(cert.tag) || listaTagsAlvo.includes(cert.plataforma))
            );

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

    // ✅ Função avançada de geração de texto SVG (Mantida 100% Intacta)
    function gerarTextoBadgeSVG(texto, fontFamily = 'sans-serif') {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        const maxWidth = 150;
        let fontSize;
        if (texto.length <= 12) {
            fontSize = 24;
        } else if (texto.length <= 24) {
            fontSize = 22;
        } else {
            fontSize = 20;
        }
        const minFontSize = 12;

        let linhas = [];

        const quebrarLinhas = (txt, size) => {
            ctx.font = `bold ${size}px ${fontFamily}`;
            const palavras = txt.split(' ');
            let linhas = [];
            let linhaAtual = '';

            palavras.forEach(palavra => {
                const teste = inlineAtual = linhaAtual ? linhaAtual + ' ' + palavra : palavra;
                const largura = ctx.measureText(teste).width;

                if (largura <= maxWidth) {
                    linhaAtual = teste;
                } else {
                    if (linhaAtual) linhas.push(linhaAtual);
                    linhaAtual = palavra;
                }
            });

            if (linhaAtual) linhas.push(linhaAtual);
            return linhas;
        };

        while (fontSize >= minFontSize) {
            linhas = quebrarLinhas(texto, fontSize);
            const larguras = linhas.map(l => ctx.measureText(l).width);
            const maiorLinha = Math.max(...larguras);
            const todasCabem = maiorLinha <= maxWidth;

            if (linhas.length <= 3 && todasCabem) {
                break;
            }
            fontSize -= 0.5;
        }

        if (linhas.length === 1) fontSize = Math.min(fontSize, 24);
        if (linhas.length === 2) fontSize = Math.min(fontSize, 22);
        if (linhas.length === 3) fontSize = Math.min(fontSize, 18);

        const maiorLinha = Math.max(...linhas.map(l => ctx.measureText(l).width));
        const folga = maxWidth - maiorLinha;

        if (folga > 20 && fontSize < 24) {
            fontSize += 1;
        }

        if (linhas.length === 2) {
            const proporcaoOcupacao = Math.max(...linhas.map(l => ctx.measureText(l).width)) / maxWidth;
            if (proporcaoOcupacao > 0.92) fontSize -= 1;
            if (proporcaoOcupacao < 0.75) fontSize += 1;
        }

        const lineHeight =
            linhas.length === 1 ? fontSize * 1.1 :
            linhas.length === 2 ? fontSize * 1.15 :
            fontSize * 1.25;

        const pesos = lines = linhas.map(l => l.length);
        const pesoTotal = pesos.reduce((a, b) => a + b, 0);
        const ajusteOptico = pesos.map(p => p / pesoTotal);
        const totalHeight = linhas.length * lineHeight;

        let startY = 30 - (totalHeight / 2) + (lineHeight / 2);
        const fatorOptico = 6;
        startY += (ajusteOptico[0] - 0.5) * fatorOptico;

        return linhas.map((linha, i) => {
            const y = startY + (i * lineHeight);
            return `
                <text 
                    x="100" 
                    y="${y}" 
                    text-anchor="middle"
                    dominant-baseline="middle"
                    fill="#ffffff"
                    font-weight="bold"
                    font-family="${fontFamily}"
                    font-size="${fontSize}px">
                    ${linha.trim()}
                </text>
            `;
        }).join('');
    }

    // ✅ Renderização dos cards
    lista.forEach(cert => {
        const card = document.createElement('div');

        const caminhoImagem = cert.imagem || 'img/badge-template.webp';
        card.className = cert.highlight ? 'cert-card highlight-card' : 'cert-card';

        const texto = (cert.textoBadge || '').trim().toUpperCase();
        const fontFamily = "'Roboto', sans-serif";
        const conteudoSvg = gerarTextoBadgeSVG(texto, fontFamily);

        // Otimização dos botões: Identifica se é único ou múltiplos
        let botaoValidaHtml = '';
        if (Array.isArray(cert.link)) {
            botaoValidaHtml = cert.link.map((item) => {
                const url = typeof item === 'object' ? item.url : item;
                const label = typeof item === 'object' ? item.label : cert.tipoLink;
                
                // Estilização inline para forçar a divisão cirúrgica do espaço lado a lado
                return `
                    <a href="${url}" 
                       target="_blank" 
                       rel="noopener noreferrer" 
                       class="btn-verify"
                       style="flex: 1; text-align: center; padding: 10px 4px; font-size: 13px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin: 0;">
                       ${label}
                    </a>`;
            }).join('');
        } else {
            // Mantém a estrutura padrão caso o card só tenha um link
            botaoValidaHtml = `
                <a href="${cert.link}" 
                   target="_blank" 
                   rel="noopener noreferrer" 
                   class="btn-verify"
                   style="margin: 0;">
                   ${cert.tipoLink}
                </a>`;
        }

        card.innerHTML = `
            <span class="cert-year">${cert.ano}</span>        
            <span class="cert-tag ${cert.tag}">${cert.tagLabel}</span>

            <div class="badge-wrapper">
                <img src="${caminhoImagem}" 
                     alt="${cert.titulo}" 
                     loading="lazy" 
                     width="180" 
                     height="180">

                <div class="badge-overlay-container">
                    <svg viewBox="0 0 200 60" 
                         preserveAspectRatio="xMidYMid meet" 
                         width="100%" 
                         height="100%">
                        ${conteudoSvg}
                    </svg>
                </div>
            </div>

            <h3>${cert.titulo}</h3>
            
            <!-- Container com Flexbox para gerenciar o alinhamento horizontal perfeito -->
            <div class="cert-buttons-container" style="display: flex; gap: 8px; width: 100%; justify-content: center; margin-top: auto; padding: 0 5px;">
                ${botaoValidaHtml}
            </div>
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


/*==========================================================================
POPUP COLETA DE ENDEREÇO IP - AJUSTADO
============================================================================ */

window.onload = function() {
  const status = localStorage.getItem('privacidadeAceita');
  // Apenas mostra o banner se nunca foi definido. 
  // Se for true ou false, não faz nada automático.
  if (status === null) {
    document.getElementById('privacy-banner').style.display = 'block';
  }
};

function coletarIPParaSeguranca() {
  const emailUsuario = document.getElementById("usuario").value; // Pega o valor atual do input
  const GOOGLE_APP_URL = 'https://script.google.com/macros/s/AKfycbwjp0qfCz5lQRssIH9fDdON-AwmwZa0iL3rB-ldTJ_rO0-NX6Sva5VenZswvIC1bx-3/exec';

  fetch('https://api.ipify.org?format=json')
    .then(response => response.json())
    .then(data => {
      return fetch(GOOGLE_APP_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ 
          acao: "registrarIP", 
          ip: data.ip, 
          email: emailUsuario 
        })
      });
    })
    .catch(err => console.error('Erro na coleta:', err));
}



function aceitarPrivacidade() {
  localStorage.setItem('privacidadeAceita', 'true');
  document.getElementById('privacy-banner').style.display = 'none';
  coletarIPParaSeguranca(); // Coleta agora que foi permitido[cite: 1]
}

function recusarPrivacidade() {
  localStorage.setItem('privacidadeAceita', 'false'); // Registra a recusa[cite: 1]
  
  const msg = document.getElementById('privacy-msg');
  const btns = document.getElementById('privacy-btns');
  const banner = document.getElementById('privacy-banner');
  
  if (msg) msg.innerHTML = "<strong>Privacidade respeitada:</strong> Seu endereço IP não será coletado neste acesso.";
  if (btns) btns.style.display = 'none';
  
  setTimeout(() => { if (banner) banner.style.display = 'none'; }, 4000);
}

/* ==========================================================================
   ESTADO DE LOGIN NO HEADER (login / painel / logout dinâmico)
   ========================================================================== */
//
// Usa a MESMA chave que o login.html e painel.js já gravam no sessionStorage
// ("portalToken"), evitando uma segunda fonte de verdade para o estado de
// autenticação. Não é necessário alterar nada no fluxo de login existente.
//
// IMPORTANTE: esta função NÃO roda em DOMContentLoaded daqui — o header é
// injetado dinamicamente via fetch em components.js, então o elemento
// #login-container só existe no DOM depois desse fetch resolver. Por isso
// inicializarEstadoLoginHeader() é chamada manualmente dentro do .then()
// do fetch do header em components.js, logo após o innerHTML ser definido.

function inicializarEstadoLoginHeader() {
    const containerLogin = document.getElementById('login-container');
    if (!containerLogin) return;

    const linkLogin   = document.getElementById('login-link');
    const iconeLogin  = linkLogin ? linkLogin.querySelector('i') : null;
    const dropdown    = document.getElementById('login-dropdown-menu');
    const btnLogout   = document.getElementById('btn-logout-header');

    function usuarioEstaLogado() {
        return sessionStorage.getItem('portalToken') !== null;
    }

    function fecharDropdown() {
        if (dropdown) dropdown.classList.remove('aberto');
    }

    function renderizarEstado() {
        fecharDropdown();

        if (usuarioEstaLogado()) {
            // --- ESTADO: LOGADO ---
            if (iconeLogin) iconeLogin.className = 'fa-solid fa-user-check';
            if (linkLogin) {
                linkLogin.setAttribute('aria-label', 'Menu da área restrita');
                linkLogin.setAttribute('aria-haspopup', 'true');
                linkLogin.setAttribute('aria-expanded', 'false');
            }
            containerLogin.setAttribute('data-tooltip', 'Acessar painel ou sair');
        } else {
            // --- ESTADO: DESLOGADO ---
            if (iconeLogin) iconeLogin.className = 'fa-solid fa-user-lock';
            if (linkLogin) {
                linkLogin.setAttribute('aria-label', 'Área restrita');
                linkLogin.removeAttribute('aria-haspopup');
                linkLogin.removeAttribute('aria-expanded');
            }
            containerLogin.setAttribute('data-tooltip', 'Área restrita destinada a usuários cadastrados');
        }
    }

    // Clique no ícone: se logado, abre/fecha o dropdown (Painel / Sair) em vez
    // de navegar direto; se deslogado, segue o comportamento normal do link
    // (vai para login.html).
    if (linkLogin) {
        linkLogin.addEventListener('click', function (e) {
            if (!usuarioEstaLogado()) return; // comportamento padrão: navega para login.html

            e.preventDefault();
            const estaAberto = dropdown.classList.toggle('aberto');
            linkLogin.setAttribute('aria-expanded', estaAberto ? 'true' : 'false');
        });
    }

    // Fecha o dropdown ao clicar fora dele
    document.addEventListener('click', function (e) {
        if (!containerLogin.contains(e.target)) fecharDropdown();
    });

    // Fecha o dropdown com a tecla Esc
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') fecharDropdown();
    });

    // Botão "Sair" do dropdown: replica exatamente o efetuarLogout() do painel.js
    // (limpa sessão e redireciona), para manter o mesmo comportamento em
    // qualquer página do site, não só dentro do painel.
    if (btnLogout) {
        btnLogout.addEventListener('click', function (e) {
            e.preventDefault();
            const token = sessionStorage.getItem('portalToken');
            const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwjp0qfCz5lQRssIH9fDdON-AwmwZa0iL3rB-ldTJ_rO0-NX6Sva5VenZswvIC1bx-3/exec";

            if (token) {
                fetch(`${APPS_SCRIPT_URL}?action=logout&token=${token}`).catch(() => {});
            }

            sessionStorage.removeItem('portalToken');
            sessionStorage.removeItem('usuarioLogado');
            sessionStorage.removeItem('tipoUsuario');

            renderizarEstado();
            window.location.href = 'index.html';
        });
    }

    // Sincroniza o header entre abas: se o login/logout acontecer em outra aba
    // (sessionStorage não é compartilhado entre abas, mas o evento 'storage'
    // cobre localStorage; sessionStorage por aba é o comportamento esperado
    // aqui — cada aba reflete sua própria sessão). Mantido por robustez caso
    // o projeto migre para localStorage no futuro.
    window.addEventListener('storage', renderizarEstado);

    renderizarEstado();
}