/**
 * Script Consolidado - Jardel Santos
 * Abrange: Index, Sobre, Serviços, Artigos e Páginas de Conteúdo
 */

document.addEventListener('DOMContentLoaded', () => {
    
    // --- 1. MENU MOBILE (Universal) ---
    const hamburger = document.getElementById('hamburger');
    const navLinks = document.getElementById('navLinks');

    if (hamburger && navLinks) {
        hamburger.addEventListener('click', () => {
            navLinks.classList.toggle('active');
        });
        
        // Fecha o menu ao clicar em um link (útil para links com âncoras #)
        const links = navLinks.querySelectorAll('a');
        links.forEach(link => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('active');
            });
        });
    }

    // --- 2. CARROSSEL DE DESTAQUES (index.html) ---
    const track = document.getElementById('carouselTrack');
    if (track) {
        const slides = Array.from(track.children);
        const nextButton = document.getElementById('nextBtn');
        const prevButton = document.getElementById('prevBtn');
        const dotsContainer = document.getElementById('carouselDots');
        let currentSlideIndex = 0;

        // Limpeza e criação de dots
        if (dotsContainer) {
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
            const dots = document.querySelectorAll('.dot');
            dots.forEach(d => d.classList.remove('active'));
            if(dots[index]) dots[index].classList.add('active');
        }

        function moveToSlide(index) {
            if (index < 0) index = slides.length - 1;
            if (index >= slides.length) index = 0;
            track.style.transform = `translateX(-${index * 100}%)`;
            currentSlideIndex = index;
            updateDots(index);
        }

        if (nextButton) nextButton.addEventListener('click', () => moveToSlide(currentSlideIndex + 1));
        if (prevButton) prevButton.addEventListener('click', () => moveToSlide(currentSlideIndex - 1));

        // Auto-play
        let autoPlay = setInterval(() => moveToSlide(currentSlideIndex + 1), 6000);
        track.addEventListener('mouseenter', () => clearInterval(autoPlay));
        track.addEventListener('mouseleave', () => {
            autoPlay = setInterval(() => moveToSlide(currentSlideIndex + 1), 6000);
        });
    }

    // --- 3. SCROLL DE CERTIFICAÇÕES E CARDS (Páginas Diversas) ---
    // Atua em .certifications-grid ou .article-grid se houver id certDots
    const grid = document.querySelector('.certifications-grid') || document.querySelector('.article-grid');
    const dotsNav = document.getElementById('certDots');

    if (grid && dotsNav) {
        const cards = grid.children;
        
        // Gera dots dinamicamente
        Array.from(cards).forEach((_, i) => {
            const dot = document.createElement('div');
            dot.classList.add('dot');
            if (i === 0) dot.classList.add('active');
            dot.addEventListener('click', () => {
                const gap = 20;
                const scrollPos = i * (cards[0].offsetWidth + gap);
                grid.scrollTo({ left: scrollPos, behavior: 'smooth' });
            });
            dotsNav.appendChild(dot);
        });

        // Sincroniza dots com o scroll manual
        grid.addEventListener('scroll', () => {
            const gap = 20;
            const index = Math.round(grid.scrollLeft / (cards[0].offsetWidth + gap));
            const dots = dotsNav.querySelectorAll('.dot');
            dots.forEach((d, i) => d.classList.toggle('active', i === index));
        });
    }
});