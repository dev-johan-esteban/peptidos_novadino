document.addEventListener('DOMContentLoaded', () => {
    
    /* ==========================================================================
       1. INTERRUPTOR MODO OSCURO / MODO CLARO
       ========================================================================== */
    const themeToggle = document.getElementById('themeToggle');
    const themeIcon = document.getElementById('themeIcon');
    const themeLabel = document.getElementById('themeLabel');

    function applyTheme(theme) {
        if (theme === 'dark') {
            document.documentElement.setAttribute('data-theme', 'dark');
            if (themeIcon) themeIcon.textContent = '☀️';
            if (themeLabel) themeLabel.textContent = 'Modo Claro';
        } else {
            document.documentElement.removeAttribute('data-theme');
            if (themeIcon) themeIcon.textContent = '🌙';
            if (themeLabel) themeLabel.textContent = 'Modo Oscuro';
        }
    }

    const savedTheme = localStorage.getItem('theme') || 'light';
    applyTheme(savedTheme);

    if (themeToggle) {
        themeToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            const currentTheme = document.documentElement.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            localStorage.setItem('theme', newTheme);
            applyTheme(newTheme);
        });
    }

    /* ==========================================================================
       2. LÓGICA DE MENÚ HAMBURGUESA Y NAVEGACIÓN
       ========================================================================== */
    const hamburgerBtn = document.getElementById('hamburgerBtn');
    const navLinks = document.getElementById('navLinks');
    const navItems = document.querySelectorAll('.nav-item');
    const sections = document.querySelectorAll('.section-view');
    const indicator = document.getElementById('indicator');
    let isTransitioning = false;

    if (hamburgerBtn) {
        hamburgerBtn.addEventListener('click', () => {
            hamburgerBtn.classList.toggle('open');
            navLinks.classList.toggle('open');
        });
    }

    function updateIndicator(activeElement) {
        if (!activeElement || window.innerWidth <= 768 || !indicator) return;
        indicator.style.width = `${activeElement.offsetWidth}px`;
        indicator.style.left = `${activeElement.offsetLeft}px`;
    }

    const initialActive = document.querySelector('.nav-item.active');
    updateIndicator(initialActive);

    navItems.forEach(item => {
        item.addEventListener('click', () => {
            if (navLinks && navLinks.classList.contains('open')) {
                hamburgerBtn.classList.remove('open');
                navLinks.classList.remove('open');
            }

            const targetId = item.getAttribute('data-target');
            const targetSection = document.getElementById(targetId);
            const currentSection = document.querySelector('.section-view.active');

            if (targetSection === currentSection || isTransitioning) return;

            isTransitioning = true;

            navItems.forEach(nav => nav.classList.remove('active'));
            item.classList.add('active');
            updateIndicator(item);

            if (currentSection) {
                currentSection.classList.add('exit-left');
                currentSection.classList.remove('active');
            }

            setTimeout(() => {
                if (currentSection) {
                    currentSection.classList.remove('exit-left');
                }
                targetSection.classList.add('active');
                isTransitioning = false;
            }, 350);
        });
    });

    // Clic en el logo para volver a Inicio
    const logoBtn = document.querySelector('.logo');
    if (logoBtn) {
        logoBtn.addEventListener('click', () => {
            const inicioNav = document.querySelector('.nav-item[data-target="inicio"]');
            if (inicioNav) inicioNav.click();
        });
    }

    /* REDIRECCIÓN DESDE PREVISUALIZACIÓN EN INICIO HACIA CATÁLOGO */
    const goToCatalogTriggers = document.querySelectorAll('[data-go-catalog], #goToCatalogBtn');
    goToCatalogTriggers.forEach(trigger => {
        trigger.addEventListener('click', () => {
            const catalogNav = document.querySelector('.nav-item[data-target="catalogo"]');
            if (catalogNav) catalogNav.click();
        });
    });

    window.addEventListener('resize', () => {
        const currentActive = document.querySelector('.nav-item.active');
        updateIndicator(currentActive);
        updateCarousel();
    });

    /* ==========================================================================
       3. LÓGICA DEL CARRUSEL DE PRODUCTOS (DESKTOP)
       ========================================================================== */
    const track = document.getElementById('carouselTrack');
    const cards = document.querySelectorAll('.serum-card');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const dotsContainer = document.getElementById('carouselDots');
    const carouselWrapper = document.getElementById('carouselWrapper');

    let currentIndex = 0;
    let autoPlayTimer = null;

    function getVisibleCardsCount() {
        if (window.innerWidth <= 768) return 1;
        return 3;
    }

    function getMaxIndex() {
        return cards.length - getVisibleCardsCount();
    }

    function createDots() {
        if (!dotsContainer || window.innerWidth <= 768) return;
        dotsContainer.innerHTML = '';
        const maxIndex = getMaxIndex();
        
        for (let i = 0; i <= maxIndex; i++) {
            const dot = document.createElement('div');
            dot.classList.add('dot');
            if (i === 0) dot.classList.add('active');
            dot.addEventListener('click', () => {
                currentIndex = i;
                updateCarousel();
                resetAutoPlay();
            });
            dotsContainer.appendChild(dot);
        }
    }

    function updateCarousel() {
        if (!track || cards.length === 0) return;
        if (window.innerWidth <= 768) {
            track.style.transform = 'none';
            return;
        }

        const cardWidth = cards[0].getBoundingClientRect().width;
        const gap = parseFloat(window.getComputedStyle(track).gap) || 20;
        const moveAmount = (cardWidth + gap) * currentIndex;
        
        track.style.transform = `translateX(-${moveAmount}px)`;

        const dots = document.querySelectorAll('.dot');
        dots.forEach((dot, idx) => {
            dot.classList.toggle('active', idx === currentIndex);
        });
    }

    function nextSlide() {
        if (currentIndex < getMaxIndex()) {
            currentIndex++;
        } else {
            currentIndex = 0;
        }
        updateCarousel();
    }

    function prevSlide() {
        if (currentIndex > 0) {
            currentIndex--;
        } else {
            currentIndex = getMaxIndex();
        }
        updateCarousel();
    }

    function startAutoPlay() {
        stopAutoPlay();
        if (window.innerWidth <= 768) return;
        autoPlayTimer = setInterval(nextSlide, 4000);
    }

    function stopAutoPlay() {
        if (autoPlayTimer) clearInterval(autoPlayTimer);
    }

    function resetAutoPlay() {
        stopAutoPlay();
        startAutoPlay();
    }

    if (nextBtn) nextBtn.addEventListener('click', () => { nextSlide(); resetAutoPlay(); });
    if (prevBtn) prevBtn.addEventListener('click', () => { prevSlide(); resetAutoPlay(); });

    if (carouselWrapper) {
        carouselWrapper.addEventListener('mouseenter', stopAutoPlay);
        carouselWrapper.addEventListener('mouseleave', startAutoPlay);
    }

    createDots();
    updateCarousel();
    startAutoPlay();

    /* ==========================================================================
       4. LÓGICA DE AMPLIACIÓN DE IMAGEN (MODAL / LIGHTBOX)
       ========================================================================== */
    const imageModal = document.getElementById('imageModal');
    const modalImg = document.getElementById('modalImg');
    const modalClose = document.getElementById('modalClose');
    const serumImages = document.querySelectorAll('.serum-img');

    serumImages.forEach(img => {
        img.addEventListener('click', () => {
            if (!imageModal || !modalImg) return;
            modalImg.src = img.src;
            modalImg.alt = img.alt;
            imageModal.classList.add('open');
            stopAutoPlay();
        });
    });

    function closeModal() {
        if (imageModal) imageModal.classList.remove('open');
        startAutoPlay();
    }

    if (modalClose) modalClose.addEventListener('click', closeModal);

    if (imageModal) {
        imageModal.addEventListener('click', (e) => {
            if (e.target === imageModal) closeModal();
        });
    }

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && imageModal && imageModal.classList.contains('open')) {
            closeModal();
        }
    });
});