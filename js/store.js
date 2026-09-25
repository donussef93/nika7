// ============================================
// STORE PAGE — Primo Nutrition
// ============================================

let currentLang = localStorage.getItem('primo_lang') || 'fr';
let currentFilter = 'all';
let productsDB = [];
let categoriesDB = [];

// ---------- INIT ----------
document.addEventListener('DOMContentLoaded', async () => {
    renderCategoryFilters();
    applyLanguage(currentLang);
    setupEventListeners();
    Cart.init();

    try {
        await loadCategories();
        await loadProducts();
    } catch (e) {
        console.error('Load error:', e);
        document.getElementById('productsGrid').innerHTML =
            `<p style="grid-column:1/-1;text-align:center;color:#e74c3c;padding:3rem 0;">Erreur de chargement. Vérifiez l'API.</p>`;
    }
});

async function loadCategories() {
    categoriesDB = await API.get('categories.php');
    renderCategories();
    renderCategoryFilters();
}

async function loadProducts() {
    const params = {};
    if (currentFilter !== 'all') params.category = currentFilter;
    productsDB = await API.get('products.php', params);
    renderProducts();
}

// ---------- LANGUAGE ----------
function applyLanguage(lang) {
    currentLang = lang;
    localStorage.setItem('primo_lang', lang);

    const body = document.getElementById('bodyRoot');
    const t = translations[lang];

    if (lang === 'ar') {
        body.classList.add('rtl');
        document.documentElement.lang = 'ar';
        document.documentElement.dir = 'rtl';
    } else {
        body.classList.remove('rtl');
        document.documentElement.lang = 'fr';
        document.documentElement.dir = 'ltr';
    }

    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.lang === lang);
    });

    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.dataset.i18n;
        if (t[key]) el.textContent = t[key];
    });

    renderCategoryFilters();
    renderProducts();
    renderCategories();
    Cart.renderSidebar();
}

// ---------- RENDER PRODUCTS ----------
function renderProducts() {
    const grid = document.getElementById('productsGrid');
    if (!grid) return;

    const t = translations[currentLang];
    const lang = currentLang;

    if (!productsDB.length) {
        grid.innerHTML = `<p style="grid-column:1/-1;text-align:center;color:var(--text-muted);padding:3rem 0;">${t.noProducts || 'Aucun produit'}</p>`;
        return;
    }

    grid.innerHTML = productsDB.map(product => {
        const name = lang === 'ar' ? product.name_ar : product.name_fr;
        const badgeText = product.badge === 'promo' ? (lang === 'ar' ? 'تخفيض' : 'PROMO')
                        : product.badge === 'new'   ? (lang === 'ar' ? 'جديد' : 'NOUVEAU')
                        : null;

        // Image with fallback
        const imgTag = product.image_path
            ? `<img src="uploads/${product.image_path}" alt="${name}" loading="lazy"
                    onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
               <i class="fas ${product.icon}" style="display:none;"></i>`
            : `<i class="fas ${product.icon}"></i>`;

        return `
            <article class="product-card">
                ${badgeText ? `<span class="product-card__badge">${badgeText}</span>` : ''}
                <div class="product-card__image">${imgTag}</div>
                <h3 class="product-card__title">${name}</h3>
                <div class="product-card__category">
                    <i class="fas fa-star" style="color:var(--accent);"></i> ${product.rating}
                    ${product.unit ? ` · ${product.unit}` : ''}
                </div>
                <div class="product-card__footer">
                    <div class="product-card__price">
                        ${product.price} <small>${t.currency}</small>
                        ${product.old_price ? `<br><small style="text-decoration:line-through;color:var(--text-muted);font-size:0.75rem;">${product.old_price} ${t.currency}</small>` : ''}
                    </div>
                    <button class="product-card__add" onclick="handleAddToCart(${product.id})" aria-label="Add">
                        <i class="fas fa-plus"></i>
                    </button>
                </div>
            </article>
        `;
    }).join('');
}

// ---------- RENDER CATEGORIES ----------
function renderCategories() {
    const grid = document.getElementById('categoriesGrid');
    if (!grid) return;

    const lang = currentLang;
    grid.innerHTML = categoriesDB.map(cat => {
        const label = lang === 'ar' ? cat.label_ar : cat.label_fr;
        return `
            <div class="category-card" onclick="filterByCategory('${cat.id}')">
                <i class="fas ${cat.icon}"></i>
                <h3>${label}</h3>
            </div>
        `;
    }).join('');
}

// ---------- FILTER BUTTONS ----------
function renderCategoryFilters() {
    const container = document.getElementById('filterContainer');
    if (!container) return;

    const t = translations[currentLang];
    const lang = currentLang;

    let html = `<button class="filter-btn ${currentFilter === 'all' ? 'active' : ''}" data-filter="all">${t.filterAll || 'Tous'}</button>`;
    categoriesDB.forEach(cat => {
        const label = lang === 'ar' ? cat.label_ar : cat.label_fr;
        html += `<button class="filter-btn ${currentFilter === cat.id ? 'active' : ''}" data-filter="${cat.id}">${label}</button>`;
    });
    container.innerHTML = html;

    container.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', async () => {
            currentFilter = btn.dataset.filter;
            container.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            await loadProducts();
        });
    });
}

// ---------- FILTER BY CLICKING CATEGORY ----------
async function filterByCategory(category) {
    currentFilter = category;
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.filter === category);
    });
    await loadProducts();
    document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' });
}

// ---------- ADD TO CART ----------
function handleAddToCart(productId) {
    const product = productsDB.find(p => p.id === productId);
    if (!product) return;
    Cart.add(product);
    showToast(translations[currentLang].toastAdded || 'Ajouté au panier');
    const btn = document.getElementById('cartBtn');
    btn?.classList.add('bounce');
    setTimeout(() => btn?.classList.remove('bounce'), 400);
}

// ---------- CART SIDEBAR ----------
function openCart() {
    document.getElementById('cartSidebar')?.classList.add('open');
    document.getElementById('overlay')?.classList.add('active');
    document.body.style.overflow = 'hidden';
}
function closeCart() {
    document.getElementById('cartSidebar')?.classList.remove('open');
    document.getElementById('overlay')?.classList.remove('active');
    document.body.style.overflow = '';
}

// ---------- CHECKOUT ----------
function openCheckout() {
    if (Cart.getCount() === 0) {
        showToast(translations[currentLang].toastEmptyCart || 'Panier vide');
        return;
    }
    closeCart();
    renderOrderSummary();
    document.getElementById('checkoutModal')?.classList.add('open');
    document.getElementById('overlay')?.classList.add('active');
    document.body.style.overflow = 'hidden';
}
function closeCheckout() {
    document.getElementById('checkoutModal')?.classList.remove('open');
    document.getElementById('overlay')?.classList.remove('active');
    document.body.style.overflow = '';
}

function renderOrderSummary() {
    const container = document.getElementById('orderSummary');
    if (!container) return;

    const t = translations[currentLang];
    const items = Cart.getDetailedItems();
    const subtotal = Cart.getTotal();
    const shipping = subtotal >= 500 ? 0 : 40;
    const total = subtotal + shipping;
    const lang = currentLang;

    let html = items.map(item => {
        const name = lang === 'ar' ? item.product.name_ar : item.product.name_fr;
        return `<div class="order-summary__row">
            <span>${name} × ${item.quantity}</span>
            <span>${item.subtotal} ${t.currency}</span>
        </div>`;
    }).join('');

    html += `
        <div class="order-summary__row"><span>${t.orderSubtotal}</span><span>${subtotal} ${t.currency}</span></div>
        <div class="order-summary__row"><span>${t.orderShipping}</span><span>${shipping === 0 ? t.orderFree : shipping + ' ' + t.currency}</span></div>
        <div class="order-summary__row order-summary__row--total"><span>${t.orderTotal}</span><span>${total} ${t.currency}</span></div>
    `;
    container.innerHTML = html;
}

// ---------- SUBMIT ORDER ----------
async function submitOrder(e) {
    e.preventDefault();
    const form = e.target;
    const fd = new FormData(form);
    const t = translations[currentLang];

    const order = {
        customer: {
            name: fd.get('name'),
            phone: fd.get('phone'),
            city: fd.get('city'),
            address: fd.get('address'),
            notes: fd.get('notes') || ''
        },
        payment: fd.get('payment'),
        items: Cart.getDetailedItems().map(it => ({
            id: it.product.id,
            name: currentLang === 'ar' ? it.product.name_ar : it.product.name_fr,
            price: it.product.price,
            quantity: it.quantity,
            subtotal: it.subtotal
        })),
        total: Cart.getTotal(),
        language: currentLang
    };

    try {
        const res = await API.post('orders.php', order);
        closeCheckout();
        Cart.clear();

        const waMsg = buildWhatsAppMessage(order, res.order_ref);
        const waLink = document.querySelector('#successModal .btn--whatsapp');
        if (waLink) waLink.href = `https://wa.me/212600000000?text=${encodeURIComponent(waMsg)}`;

        document.getElementById('successModal')?.classList.add('open');
        document.getElementById('overlay')?.classList.add('active');
        form.reset();
    } catch (err) {
        alert('Erreur: ' + err.message);
    }
}

function buildWhatsAppMessage(order, ref) {
    let msg = `*Nouvelle commande Primo*\nRéf: ${ref}\n\n`;
    msg += `👤 ${order.customer.name}\n📞 ${order.customer.phone}\n📍 ${order.customer.city}, ${order.customer.address}\n💳 ${order.payment}\n\n`;
    order.items.forEach(it => msg += `• ${it.name} × ${it.quantity} = ${it.subtotal} DH\n`);
    msg += `\n*TOTAL: ${order.total} DH*`;
    return msg;
}

// ---------- TOAST ----------
function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    if (!toast) return;
    const icon = type === 'success' ? 'fa-check-circle' : 'fa-info-circle';
    toast.innerHTML = `<i class="fas ${icon}"></i> ${message}`;
    toast.classList.add('show');
    clearTimeout(toast._t);
    toast._t = setTimeout(() => toast.classList.remove('show'), 2500);
}

// ---------- EVENT LISTENERS ----------
function setupEventListeners() {
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.addEventListener('click', () => applyLanguage(btn.dataset.lang));
    });

    document.getElementById('cartBtn')?.addEventListener('click', openCart);
    document.getElementById('closeCart')?.addEventListener('click', closeCart);
    document.getElementById('checkoutBtn')?.addEventListener('click', openCheckout);
    document.getElementById('closeCheckout')?.addEventListener('click', closeCheckout);
    document.getElementById('checkoutForm')?.addEventListener('submit', submitOrder);

    document.getElementById('closeSuccess')?.addEventListener('click', () => {
        document.getElementById('successModal')?.classList.remove('open');
        document.getElementById('overlay')?.classList.remove('active');
        document.body.style.overflow = '';
    });

    document.getElementById('overlay')?.addEventListener('click', () => {
        closeCart(); closeCheckout();
    });

    document.getElementById('menuToggle')?.addEventListener('click', () => {
        document.getElementById('mainNav')?.classList.toggle('open');
    });

    document.querySelectorAll('.nav a').forEach(a => {
        a.addEventListener('click', () => document.getElementById('mainNav')?.classList.remove('open'));
    });

    document.addEventListener('keydown', e => {
        if (e.key === 'Escape') { closeCart(); closeCheckout(); }
    });
}

// Bounce animation
const _style = document.createElement('style');
_style.textContent = `@keyframes bounce {0%,100%{transform:scale(1)}50%{transform:scale(1.15)}} .bounce{animation:bounce .4s}`;
document.head.appendChild(_style);

window.filterByCategory = filterByCategory;
window.handleAddToCart = handleAddToCart;