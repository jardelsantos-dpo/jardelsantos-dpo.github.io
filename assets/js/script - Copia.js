/**
 * Script de Funcionalidades Específicas - Jardel Santos
 * Lógica de Carrosséis e Certificações (Sem Menu Mobile)
 */

document.addEventListener('DOMContentLoaded', () => {
    
    // --- 1. CARROSSEL DE DESTAQUES (index.html) ---
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
            autoPlayInterval = setInterval(() => moveToSlide(currentSlideIndex + 1), 6000);
        }

        function stopAutoPlay() { clearInterval(autoPlayInterval); }

        track.addEventListener('touchstart', e => {
            touchStartX = e.changedTouches[0].screenX;
            stopAutoPlay();
        }, {passive: true});

        track.addEventListener('touchend', e => {
            touchEndX = e.changedTouches[0].screenX;
            const threshold = 50;
            if (touchStartX - touchEndX > threshold) moveToSlide(currentSlideIndex + 1);
            else if (touchEndX - touchStartX > threshold) moveToSlide(currentSlideIndex - 1);
            startAutoPlay();
        }, {passive: true});

        if (nextButton) nextButton.addEventListener('click', () => { moveToSlide(currentSlideIndex + 1); startAutoPlay(); });
        if (prevButton) prevButton.addEventListener('click', () => { moveToSlide(currentSlideIndex - 1); startAutoPlay(); });
        
        track.addEventListener('mouseenter', stopAutoPlay);
        track.addEventListener('mouseleave', startAutoPlay);

        setupDots();
        startAutoPlay();
    }

    // --- 2. CARROSSEL DE CASOS DE SUCESSO ---
    const casesTrack = document.getElementById('casesTrack');
    const casesDotsContainer = document.getElementById('casesDots');

    if (casesTrack && casesDotsContainer) {
        const cards = Array.from(casesTrack.children);
        let currentIndex = 0;
        let isPaused = false;
        let tStartX = 0;
        let tEndX = 0;

        const getItemsPerView = () => window.innerWidth <= 992 ? 1 : 3;

        function setupCasesDots() {
            casesDotsContainer.innerHTML = '';
            const totalSteps = cards.length - getItemsPerView() + 1;
            for (let i = 0; i < totalSteps; i++) {
                const dot = document.createElement('div');
                dot.classList.add('dot');
                if (i === 0) dot.classList.add('active');
                dot.addEventListener('click', () => { currentIndex = i; updateCasesCarousel(); isPaused = true; });
                casesDotsContainer.appendChild(dot);
            }
        }

        function updateCasesCarousel() {
            const isMobile = window.innerWidth <= 992;
            const cardWidth = cards[0].getBoundingClientRect().width;
            const gap = isMobile ? 0 : 20; 
            casesTrack.style.transform = `translateX(-${(cardWidth + gap) * currentIndex}px)`;
            const dots = casesDotsContainer.querySelectorAll('.dot');
            dots.forEach((dot, i) => dot.classList.toggle('active', i === currentIndex));
        }

        casesTrack.addEventListener('touchstart', e => { tStartX = e.changedTouches[0].screenX; isPaused = true; }, {passive: true});
        casesTrack.addEventListener('touchend', e => {
            tEndX = e.changedTouches[0].screenX;
            const steps = cards.length - getItemsPerView() + 1;
            if (tStartX - tEndX > 50 && currentIndex < steps - 1) currentIndex++;
            else if (tEndX - tStartX > 50 && currentIndex > 0) currentIndex--;
            updateCasesCarousel();
        }, {passive: true});

        setInterval(() => {
            if (!isPaused) {
                currentIndex = (currentIndex + 1) % (cards.length - getItemsPerView() + 1);
                updateCasesCarousel();
            }
        }, 6000);

        casesTrack.addEventListener('mouseenter', () => isPaused = true);
        casesTrack.addEventListener('mouseleave', () => isPaused = false);
        window.addEventListener('resize', () => { currentIndex = 0; setupCasesDots(); updateCasesCarousel(); });
        setupCasesDots();
    }

    // --- 3. CARROSSEL DE CERTIFICAÇÕES (sobre.html) ---
    const certTrack = document.getElementById('certGrid');
    const certDotsNav = document.getElementById('certDots');

    if (certTrack && certDotsNav) {
        const certs = Array.from(certTrack.children);
        let certIndex = 0;
        let certPaused = false;
        let cTouchStartX = 0;
        let cTouchEndX = 0;

        function setupCertDots() {
            certDotsNav.innerHTML = '';
            if (window.innerWidth <= 992) {
                certs.forEach((_, i) => {
                    const dot = document.createElement('div');
                    dot.classList.add('dot');
                    if (i === 0) dot.classList.add('active');
                    dot.addEventListener('click', () => { certIndex = i; updateCertCarousel(); certPaused = true; });
                    certDotsNav.appendChild(dot);
                });
            }
        }

        function updateCertCarousel() {
            if (window.innerWidth <= 992) {
                certTrack.style.transform = `translateX(-${certIndex * 100}%)`;
                const dots = certDotsNav.querySelectorAll('.dot');
                dots.forEach((dot, i) => dot.classList.toggle('active', i === certIndex));
            } else {
                certTrack.style.transform = 'none';
            }
        }

        certTrack.addEventListener('touchstart', e => { cTouchStartX = e.changedTouches[0].screenX; certPaused = true; }, {passive: true});
        certTrack.addEventListener('touchend', e => {
            cTouchEndX = e.changedTouches[0].screenX;
            if (cTouchStartX - cTouchEndX > 50 && certIndex < certs.length - 1) certIndex++;
            else if (cTouchEndX - cTouchStartX > 50 && certIndex > 0) certIndex--;
            updateCertCarousel();
        }, {passive: true});

        setInterval(() => {
            if (!certPaused && window.innerWidth <= 992) {
                certIndex = (certIndex + 1) % certs.length;
                updateCertCarousel();
            }
        }, 4000);

        certTrack.addEventListener('mouseenter', () => certPaused = true);
        certTrack.addEventListener('mouseleave', () => certPaused = false);
        window.addEventListener('resize', () => { certIndex = 0; setupCertDots(); updateCertCarousel(); });
        setupCertDots();
    }
});

// --- CERTIFICAÇÕES: Ver mais / Ver menos (Desktop) ---
document.addEventListener("DOMContentLoaded", function() {
  const cards = document.querySelectorAll('.cert-card');               // todos os cards
  const btnLoadMore = document.getElementById('btnLoadMore');          // botão
  const container = document.getElementById('loadMoreContainer');      // wrapper do botão

  if (!cards.length || !btnLoadMore || !container) return;

  const DESKTOP_BREAKPOINT = 768;     // mesmo critério usado no seu CSS/JS
  const INITIAL_VISIBLE = 4;          // quantidade padrão visível no desktop
  let expanded = false;               // estado atual no desktop

  function applyDesktopView() {
    // Mostra só os 4 primeiros no desktop (quando não expandido)
    cards.forEach((card, index) => {
      if (!expanded && index >= INITIAL_VISIBLE) {
        card.classList.add('hidden');
        // Em seu CSS já existe a regra para .cert-card.hidden no desktop
      } else {
        card.classList.remove('hidden');
      }
    });

    // Atualiza texto/atributos do botão
    btnLoadMore.textContent = expanded ? 'Ver menos' : 'Ver mais';
    btnLoadMore.setAttribute('aria-expanded', expanded ? 'true' : 'false');

    // O botão deve aparecer se houver mais do que 4 cards
    const shouldShowButton = cards.length > INITIAL_VISIBLE;
    container.style.display = shouldShowButton ? 'block' : 'none';
  }

  function applyMobileView() {
    // No mobile, mostramos todos e escondemos o botão
    cards.forEach(card => card.classList.remove('hidden'));
    container.style.display = 'none';
    expanded = true; // evita “piscar” se rotacionar para desktop e voltar
    btnLoadMore.setAttribute('aria-expanded', 'true');
  }

  function render() {
    if (window.innerWidth > DESKTOP_BREAKPOINT) {
      // Se voltarmos ao desktop e o estado não existir, garanta o default
      if (typeof expanded !== 'boolean') expanded = false;
      applyDesktopView();
    } else {
      applyMobileView();
    }
  }

  // Clique no botão: alterna o estado no desktop
  btnLoadMore.addEventListener('click', function() {
    if (window.innerWidth > DESKTOP_BREAKPOINT) {
      expanded = !expanded;
      applyDesktopView();
      // Scroll suave até a área dos cards quando fechar
      if (!expanded) {
        document.querySelector('.certifications-section')
          ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  });

  // Reage a redimensionamento / rotação
  window.addEventListener('resize', render);

  // Primeira renderização
  render();
});

// --- SOFT SKILLS: Ver mais / Ver menos (Desktop) ---
document.addEventListener("DOMContentLoaded", function () {

  const cards = document.querySelectorAll('#skillsGrid .skill-card');
  const btn = document.getElementById('btnSkillsLoadMore');
  const container = document.getElementById('skillsLoadMoreContainer');

  if (!cards.length || !btn || !container) return;

  const DESKTOP_BREAKPOINT = 768;
  const INITIAL_VISIBLE = 4;
  let expanded = false;

  function applyDesktopView() {
    cards.forEach((card, index) => {
      if (!expanded && index >= INITIAL_VISIBLE) {
        card.classList.add('hidden');
      } else {
        card.classList.remove('hidden');
      }
    });

    btn.textContent = expanded ? 'Ver menos' : 'Ver mais';
    btn.setAttribute('aria-expanded', expanded);

    container.style.display =
      cards.length > INITIAL_VISIBLE ? 'block' : 'none';
  }

  function applyMobileView() {
    // no mobile: NUNCA esconder cards
    cards.forEach(card => card.classList.remove('hidden'));
    container.style.display = 'none';
    expanded = true;
  }

  function render() {
    if (window.innerWidth > DESKTOP_BREAKPOINT) {
      applyDesktopView();
    } else {
      applyMobileView();
    }
  }

  btn.addEventListener('click', () => {
    if (window.innerWidth > DESKTOP_BREAKPOINT) {
      expanded = !expanded;
      applyDesktopView();

      if (!expanded) {
        document
          .querySelector('.soft-skills-section')
          ?.scrollIntoView({ behavior: 'smooth' });
      }
    }
  });

  window.addEventListener('resize', render);
  render();
});

// ==========================================================
// SOFT SKILLS – CARROSSEL MANUAL (MOBILE)
// ==========================================================
document.addEventListener('DOMContentLoaded', function () {
  const track = document.getElementById('skillsGrid');
  const dotsContainer = document.getElementById('skillsDots');
  const btnPrev = document.getElementById('prevSkill');
  const btnNext = document.getElementById('nextSkill');

  if (!track) return;

  let currentIndex = 0;
  let touchStartX = 0;
  let touchEndX = 0;

  function isMobile() {
    return window.innerWidth <= 768;
  }

  function getGapPx() {
    const styles = window.getComputedStyle(track);
    return parseFloat(styles.gap || styles.columnGap || 0) || 0;
  }

  function getCardWidth() {
    const first = track.children[0];
    return first ? first.getBoundingClientRect().width : 0;
  }

  function getMaxIndex() {
    return Math.max(0, track.children.length - 1);
  }

  /* ===== Atualiza estado dos botões ===== */
  function updateNavButtons() {
    if (!btnPrev || !btnNext) return;

    btnPrev.disabled = currentIndex === 0;
    btnNext.disabled = currentIndex === getMaxIndex();
  }

  function updateDots() {
    if (!dotsContainer) return;

    dotsContainer.innerHTML = '';
    const max = getMaxIndex();

    for (let i = 0; i <= max; i++) {
      const dot = document.createElement('div');
      dot.classList.add('dot');
      if (i === currentIndex) dot.classList.add('active');

      dot.addEventListener('click', () => {
        currentIndex = i;
        move();
      });

      dotsContainer.appendChild(dot);
    }
  }

  function move() {
    if (!isMobile()) {
      track.style.transform = 'none';
      return;
    }

    const offset = currentIndex * (getCardWidth() + getGapPx());
    track.style.transform = `translateX(-${offset}px)`;

    updateDots();
    updateNavButtons();
  }

  /* ===== Botões ===== */
  btnPrev?.addEventListener('click', () => {
    if (!isMobile() || currentIndex === 0) return;
    currentIndex--;
    move();
  });

  btnNext?.addEventListener('click', () => {
    if (!isMobile() || currentIndex === getMaxIndex()) return;
    currentIndex++;
    move();
  });

  /* ===== Swipe ===== */
  track.addEventListener('touchstart', e => {
    touchStartX = e.changedTouches[0].screenX;
  }, { passive: true });

  track.addEventListener('touchend', e => {
    touchEndX = e.changedTouches[0].screenX;
    const threshold = 50;

    if (touchStartX - touchEndX > threshold && currentIndex < getMaxIndex()) {
      currentIndex++;
    } else if (touchEndX - touchStartX > threshold && currentIndex > 0) {
      currentIndex--;
    }

    move();
  }, { passive: true });

  /* ===== Resize ===== */
  window.addEventListener('resize', () => {
    currentIndex = 0;
    move();
  });

  /* ===== Init ===== */
  move();
});

/* Impede a exibição do pop-up de instalação (PWA) 
   ao acessar o site pelo celular.
*/
window.addEventListener('beforeinstallprompt', (e) => {
    // Intercepta o evento de instalação automática
    e.preventDefault();
    // Log opcional para confirmar que o bloqueio funcionou
    console.log('Sugestão de instalação bloqueada pelo sistema.');
});

/* 19-05-2026 */
const certGrid = document.getElementById('certGrid');
let certificados = [];

/* =========================
   CARREGAR JSON
========================= */
async function carregarCertificados() {
    try {
        const response = await fetch('assets/data/certificados.json');
        certificados = await response.json();

        // 1. Ordena os certificados antes de renderizar
        ordenarCertificados(certificados);
        renderCards(certificados);
		atualizarContadoresFiltros(certificados);
		updateTiExamesBanner(certificados);
        iniciarFiltros();
        aplicarFiltroPadrao();

    } catch (error) {
        console.error('Erro ao carregar certificados:', error);
    }
}

/* =========================
   ORDENAR CARDS (DPO Primeiro -> Depois por Ano e Título)
========================= */
function ordenarCertificados(lista) {
    lista.sort((a, b) => {
        const catA = (a.categoria || '').toLowerCase();
        const catB = (b.categoria || '').toLowerCase();

        // 1. REGRA DE OURO: Categoria 'dpo' sempre ganha prioridade máxima e vai para o topo
        if (catA === 'dpo' && catB !== 'dpo') return -1;
        if (catB === 'dpo' && catA !== 'dpo') return 1;

        // 2. Se AMBOS forem DPO, mantém a ordem da trilha EXIN usando o ID
        if (catA === 'dpo' && catB === 'dpo') {
            return (a.id || 0) - (b.id || 0);
        }

        // 3. SEGUNDO CRITÉRIO (Para os demais cards): Ordena por Ano (Decrescente - Mais recente primeiro)
        const anoA = parseInt(a.ano) || 0;
        const anoB = parseInt(b.ano) || 0;
        if (anoA !== anoB) return anoB - anoA; 

        // 4. TERCEIRO CRITÉRIO (Desempate): Ordena por Título (Ordem alfabética de A-Z)
        const tituloA = (a.titulo || '').toLowerCase();
        const tituloB = (b.titulo || '').toLowerCase();
        return tituloA.localeCompare(tituloB);
    });
}

/* =========================
   RENDERIZAR CARDS
========================= */
function renderCards(lista) {
    certGrid.innerHTML = '';

    lista.forEach(cert => {
        const card = document.createElement('div');

        card.className = cert.highlight 
            ? 'cert-card highlight-card' 
            : 'cert-card';

        card.dataset.category = cert.categoria;

        card.innerHTML = `
            <!-- TAG ANO -->
            <span class="cert-year">${cert.ano}</span>        
            <span class="cert-tag ${cert.tag}">${cert.tagLabel}</span>

            <img
                src="${cert.imagem}"
                alt="${cert.titulo}"
                loading="lazy"
                width="180"
                height="180"
            >

            <h3>${cert.titulo}</h3>

            <a
                href="${cert.link}"
                target="_blank"
                rel="noopener noreferrer"
                class="btn-verify"
            >
                ${cert.tipoLink}
            </a>
        `;

        certGrid.appendChild(card);
    });
}

/* =========================
   BANNER TI EXAMES
========================= */
function updateTiExamesBanner(lista) {
    const el = document.getElementById('tiExamesCount');
    if (!el) return;
    
    // Filtra procurando a tag bool que criamos no JSON
    const count = lista.filter(c => c.tiExames === true).length;
    el.textContent = count + '+';
}

/* =========================
   FILTROS
========================= */
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

/* =========================
   FILTRAR
========================= */
/* =========================
   VARIÁVEIS GLOBAIS DO CARROSSEL
========================= */
let certCarouselInterval;
let currentCertIndex = 0;
let touchStartX = 0;
let touchEndX = 0;

/* =========================
   FILTRAR CARDS (Atualizado com UX Desktop e Mobile)
========================= */
function filtrarCards(filtro) {
    const cards = document.querySelectorAll('.cert-card');

    // 1. Filtra os cards (Exibe/Oculta)
    cards.forEach(card => {
        const categoriaCard = card.dataset.category;
        
        // CORREÇÃO: Esta é a linha que faltava! Ela permite que o filtro 
        // leia as classes das tags (ex: 'tag-security', 'tag-privacy')
        const possuiTag = card.querySelector(`.${filtro}`);

        if (filtro === 'all' || categoriaCard === filtro || possuiTag) {
            card.style.display = 'flex';
        } else {
            card.style.display = 'none';
        }
    });

    // 2. Lógica do Botão "Recolher / Voltar para DPO" (Desktop UX)
    let btnVoltar = document.getElementById('btnVoltarDpoContainer');
    if (!btnVoltar) {
        btnVoltar = document.createElement('div');
        btnVoltar.id = 'btnVoltarDpoContainer';
        btnVoltar.className = 'btn-load-more-container desktop-only';
        
        // Adicionei uma margem superior para não ficar grudado nos cards
        btnVoltar.style.marginTop = '40px'; 
        btnVoltar.innerHTML = `<button class="btn-load-more" style="background-color: #d32f2f;">Recolher e Voltar para DPO</button>`;
        
        btnVoltar.querySelector('button').addEventListener('click', () => {
            const btnDpo = document.querySelector('[data-filter="dpo"]');
            if (btnDpo) btnDpo.click();
            document.getElementById('certFilters').scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
        
        const certDots = document.getElementById('certDots');
        if(certDots) certDots.after(btnVoltar);
    }
    
    // Exibe o botão de recolher apenas se o filtro for "Todos"
    btnVoltar.style.display = (filtro === 'all') ? 'block' : 'none';

    // 3. Reinicia o Carrossel Mobile
    if (typeof iniciarCarrosselCertificadosMobile === 'function') {
        iniciarCarrosselCertificadosMobile();
    }
}

/* =========================
   CARROSSEL MOBILE DINÂMICO (Corrigido)
========================= */
function iniciarCarrosselCertificadosMobile() {
    const track = document.getElementById('certGrid');
    const dotsContainer = document.getElementById('certDots');
    if (!track) return;

    // Elemento pai do grid para controlar o corte da tela
    const parentSection = track.parentElement; 
    
    // Para limpar intervalos anteriores
    if (certCarouselInterval) clearInterval(certCarouselInterval);
    
    // Se for Desktop (maior que 992px), remove comportamentos do carrossel
    if (window.innerWidth > 992) {
        track.style.transform = 'none';
        if (parentSection) parentSection.style.overflow = 'visible';
        if (dotsContainer) dotsContainer.innerHTML = '';
        return;
    }

    // --- CONFIGURAÇÃO MOBILE ---
    // Garante que o elemento pai oculte as próximas fotos/cards que estão fora da tela
    if (parentSection) {
        parentSection.style.overflow = 'hidden';
    }

    // Pega apenas os cards que estão visíveis para o filtro selecionado
    const visibleCards = Array.from(track.querySelectorAll('.cert-card')).filter(c => c.style.display !== 'none');

    currentCertIndex = 0;
    track.style.transform = 'translateX(0)';
    
    // Reconstrói as bolinhas indicadoras (dots)
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
        // Move o bloco horizontalmente multiplicando o índice do slide por 100%
        track.style.transform = `translateX(-${currentCertIndex * 100}%)`;
        
        // Atualiza o estado visual das bolinhas
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
            }, 4000); // Avança automaticamente a cada 4 segundos
        }
    }

    // Captura do Arrastar do Dedo (Swipe UX)
    track.onerror = null; // Prevenção de lixo de memória
    
    // Remove listeners antigos para evitar acelerações duplicadas redefinindo os eventos
    track.ontouchstart = e => {
        touchStartX = e.changedTouches[0].screenX;
        if (certCarouselInterval) clearInterval(certCarouselInterval);
    };
    
    track.ontouchend = e => {
        touchEndX = e.changedTouches[0].screenX;
        const threshold = 40; // sensibilidade do toque
        
        if (touchStartX - touchEndX > threshold && currentCertIndex < visibleCards.length - 1) {
            currentCertIndex++; // Dedada para a esquerda -> Próximo Card
        } else if (touchEndX - touchStartX > threshold && currentCertIndex > 0) {
            currentCertIndex--; // Dedada para a direita -> Card Anterior
        }
        
        atualizarPosicaoCarrossel();
        reiniciarAutoPlay();
    };

    // Inicializa a reprodução automática
    reiniciarAutoPlay();
}

// Escuta o redimensionamento da tela para ligar/desligar o carrossel se girar o celular/abrir no PC
window.addEventListener('resize', () => {
    // Busca qual filtro está ativo no momento para refazer o carrossel
    const filtroAtivo = document.querySelector('#certFilters .filter-btn.active');
    if (filtroAtivo) {
        filtrarCards(filtroAtivo.dataset.filter);
    }
});

/* =========================
   FILTRO PADRÃO
========================= */
function aplicarFiltroPadrao() {
    const defaultButton = document.querySelector('[data-filter="dpo"]');
    if (defaultButton) {
        defaultButton.click();
    }
}

/* =========================
   ATUALIZAR CONTADORES DOS FILTROS
========================= */
function atualizarContadoresFiltros(lista) {
    // 1. Mapear as quantidades por filtro
    const contagens = { 'all': lista.length, 'dpo': 0 };
    
    lista.forEach(cert => {
        // Conta os da trilha DPO
        if (cert.categoria === 'dpo') contagens['dpo']++;
        
        // Conta pelas Tags
        if (cert.tag) {
            contagens[cert.tag] = (contagens[cert.tag] || 0) + 1;
        }
    });

    // 2. Inserir os números nos botões HTML
    const filterButtons = document.querySelectorAll('.filter-btn');
    
    filterButtons.forEach(btn => {
        const filter = btn.dataset.filter;
        const count = contagens[filter] || 0;
        
        // Evita duplicar spans se a função rodar mais de uma vez
        const textoLimpo = btn.textContent.replace(/[0-9]+/, '').trim();
        
        btn.innerHTML = `${textoLimpo} <span class="filter-count">${count}</span>`;
    });
}

/* =========================
   INIT
========================= */
carregarCertificados();