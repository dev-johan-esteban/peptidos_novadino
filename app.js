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


/* ==========================================================================
       5. SISTEMA DE CARRITO DE COMPRAS Y PAGO CONTRA ENTREGA
       ========================================================================== */
let cart = JSON.parse(localStorage.getItem('suero_cart')) || [];

const cartHeaderBtn = document.getElementById('cartHeaderBtn');
const cartBadge = document.getElementById('cartBadge');
const cartDrawer = document.getElementById('cartDrawer');
const cartOverlay = document.getElementById('cartOverlay');
const cartCloseBtn = document.getElementById('cartCloseBtn');
const cartItemsContainer = document.getElementById('cartItemsContainer');
const cartTotalAmount = document.getElementById('cartTotalAmount');
const checkoutBtn = document.getElementById('checkoutBtn');

const checkoutModalOverlay = document.getElementById('checkoutModalOverlay');
const checkoutCloseBtn = document.getElementById('checkoutCloseBtn');
const codForm = document.getElementById('codForm');
const checkoutSummaryList = document.getElementById('checkoutSummaryList');
const checkoutTotal = document.getElementById('checkoutTotal');

function saveCart() {
    localStorage.setItem('suero_cart', JSON.stringify(cart));
    updateCartUI();
}

function formatPrice(amount) {
    return '$ ' + amount.toLocaleString('es-CO');
}

function parsePrice(priceString) {
    return parseInt(priceString.replace(/[^0-9]/g, ''), 10) || 0;
}

function addToCart(title, priceStr, imgSrc) {
    const price = parsePrice(priceStr);
    const existingItem = cart.find(item => item.title === title);

    if (existingItem) {
        existingItem.qty += 1;
    } else {
        cart.push({ title, price, imgSrc, qty: 1 });
    }

    saveCart();
    openCartDrawer();
}

function updateCartUI() {
    const totalItems = cart.reduce((sum, item) => sum + item.qty, 0);
    if (cartBadge) cartBadge.textContent = totalItems;

    if (!cartItemsContainer) return;

    if (cart.length === 0) {
        cartItemsContainer.innerHTML = '<p style="text-align:center; color: var(--text-muted); margin-top:2rem;">Tu carrito está vacío 🛒</p>';
        if (cartTotalAmount) cartTotalAmount.textContent = '$ 0';
        if (checkoutBtn) checkoutBtn.disabled = true;
        return;
    }

    let total = 0;
    cartItemsContainer.innerHTML = '';

    cart.forEach((item, index) => {
        const itemTotal = item.price * item.qty;
        total += itemTotal;

        const div = document.createElement('div');
        div.className = 'cart-item';
        div.innerHTML = `
                <img src="${item.imgSrc}" alt="${item.title}" class="cart-item-img">
                <div class="cart-item-info">
                    <div class="cart-item-title">${item.title}</div>
                    <div class="cart-item-price">${formatPrice(item.price)}</div>
                    <div class="cart-item-controls">
                        <button class="qty-btn" onclick="changeQty(${index}, -1)">-</button>
                        <span>${item.qty}</span>
                        <button class="qty-btn" onclick="changeQty(${index}, 1)">+</button>
                    </div>
                </div>
                <button class="qty-btn" onclick="removeItem(${index})" style="color:red; border:none; background:none;">🗑️</button>
            `;
        cartItemsContainer.appendChild(div);
    });

    if (cartTotalAmount) cartTotalAmount.textContent = formatPrice(total);
    if (checkoutBtn) checkoutBtn.disabled = false;
}

window.changeQty = function (index, change) {
    cart[index].qty += change;
    if (cart[index].qty <= 0) {
        cart.splice(index, 1);
    }
    saveCart();
};

window.removeItem = function (index) {
    cart.splice(index, 1);
    saveCart();
};

// Cambiar comportamiento de los botones de "🛒 Comprar" para añadir al carrito
const buyButtons = document.querySelectorAll('.buy-btn');
buyButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
        e.preventDefault();
        const card = btn.closest('.serum-card');
        if (!card) return;
        const title = card.querySelector('h3').innerText;
        const priceStr = card.querySelector('.price').innerText;
        const imgSrc = card.querySelector('.serum-img').src;

        addToCart(title, priceStr, imgSrc);
    });
});

function openCartDrawer() {
    if (cartDrawer) cartDrawer.classList.add('open');
    if (cartOverlay) cartOverlay.classList.add('active');
}

function closeCartDrawer() {
    if (cartDrawer) cartDrawer.classList.remove('open');
    if (cartOverlay) cartOverlay.classList.remove('active');
}

if (cartHeaderBtn) cartHeaderBtn.addEventListener('click', openCartDrawer);
if (cartCloseBtn) cartCloseBtn.addEventListener('click', closeCartDrawer);
if (cartOverlay) cartOverlay.addEventListener('click', closeCartDrawer);

/* MODAL CHECKOUT PAGO CONTRA ENTREGA */
if (checkoutBtn) {
    checkoutBtn.addEventListener('click', () => {
        closeCartDrawer();
        renderCheckoutSummary();
        if (checkoutModalOverlay) checkoutModalOverlay.classList.add('active');
    });
}

if (checkoutCloseBtn) {
    checkoutCloseBtn.addEventListener('click', () => {
        if (checkoutModalOverlay) checkoutModalOverlay.classList.remove('active');
    });
}

function renderCheckoutSummary() {
    if (!checkoutSummaryList) return;
    checkoutSummaryList.innerHTML = '';
    let total = 0;

    cart.forEach(item => {
        const subtotal = item.price * item.qty;
        total += subtotal;
        const p = document.createElement('p');
        p.style.fontSize = '0.85rem';
        p.style.margin = '4px 0';
        p.innerHTML = `• ${item.title} x${item.qty} - <strong>${formatPrice(subtotal)}</strong>`;
        checkoutSummaryList.appendChild(p);
    });

    if (checkoutTotal) checkoutTotal.textContent = formatPrice(total);
}

/* ENVÍO DE PEDIDO POR WHATSAPP */
if (codForm) {
    codForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const name = document.getElementById('clientName').value;
        const phone = document.getElementById('clientPhone').value;
        const city = document.getElementById('clientCity').value;
        const address = document.getElementById('clientAddress').value;
        const notes = document.getElementById('clientNotes').value;

        let total = 0;
        let itemsMessage = '';

        cart.forEach(item => {
            const subtotal = item.price * item.qty;
            total += subtotal;
            itemsMessage += `\n- ${item.title} (x${item.qty}) : ${formatPrice(subtotal)}`;
        });

        const message = `🚚 *NUEVO PEDIDO - PAGO CONTRA ENTREGA*%0A%0A` +
            `👤 *Cliente:* ${name}%0A` +
            `📱 *Teléfono:* ${phone}%0A` +
            `📍 *Ciudad:* ${city}%0A` +
            `🏠 *Dirección:* ${address}%0A` +
            (notes ? `📝 *Notas:* ${notes}%0A` : '') +
            `%0A📦 *PRODUCTOS:*${itemsMessage}%0A%0A` +
            `💰 *TOTAL A PAGAR AL REPARTIDOR:* ${formatPrice(total)}`;

        const whatsappNumber = '573246100086';
        const url = `https://wa.me/${whatsappNumber}?text=${message}`;

        // Vaciar carrito tras la compra
        cart = [];
        saveCart();

        if (checkoutModalOverlay) checkoutModalOverlay.classList.remove('active');
        window.open(url, '_blank');
    });
}

// Inicializar UI al cargar la página
updateCartUI();

/* ==========================================================================
       6. MAPA DINÁMICO DE GOOGLE MAPS EN CHECKOUT
       ========================================================================== */
    const clientAddressInput = document.getElementById('clientAddress');
    const clientCityInput = document.getElementById('clientCity');
    const mapContainer = document.getElementById('mapContainer');
    const googleMap = document.getElementById('googleMap');

    let typingTimer;
    const doneTypingInterval = 1000; // Espera 1 segundo después de que el usuario deje de escribir

    function updateMap() {
        const address = clientAddressInput.value.trim();
        const city = clientCityInput.value.trim();

        // Solo muestra el mapa si el usuario ha escrito al menos la dirección y la ciudad
        if (address.length > 5 && city.length > 3) {
            // Unimos la dirección, la ciudad y el país (Colombia) para mayor precisión
            const query = encodeURIComponent(`${address}, ${city}, Colombia`);
            
            // Actualizamos el iframe con la URL de búsqueda de Google Maps
            googleMap.src = `https://maps.google.com/maps?q=${query}&t=m&z=15&output=embed&iwloc=near`;
            mapContainer.style.display = 'block';
        } else {
            mapContainer.style.display = 'none';
        }
    }

    if (clientAddressInput && clientCityInput) {
        // Escuchar cuando el usuario escribe en la dirección
        clientAddressInput.addEventListener('input', () => {
            clearTimeout(typingTimer);
            typingTimer = setTimeout(updateMap, doneTypingInterval);
        });

        // Escuchar cuando el usuario escribe en la ciudad
        clientCityInput.addEventListener('input', () => {
            clearTimeout(typingTimer);
            typingTimer = setTimeout(updateMap, doneTypingInterval);
        });
    }
});

