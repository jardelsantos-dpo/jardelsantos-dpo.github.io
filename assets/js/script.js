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