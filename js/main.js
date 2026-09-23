// ============================================
// MAIN APPLICATION LOGIC
// ============================================

let currentLang = 'fr';
let currentFilter = 'all';

// ---------- INITIALIZATION ----------
document.addEventListener('DOMContentLoaded', () => {
    const savedLang = localStorage.getItem('gymhouse_lang');
    if (savedLang && (savedLang === 'fr' || savedLang === 'ar')) {
        currentLang = savedLang;
    }
    
    applyLanguage(currentLang);
    renderProducts();
    Cart.init();
    setupEventListeners();
});

// ---------- LANGUAGE ----------
function applyLanguage(lang) {
    currentLang = lang;
    localStorage.setItem('gymhouse_lang', lang);
    
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
        if (t[key]) {
            el.textContent = t[key];
        }
    });
    
    renderProducts();
    renderCategories();
    Cart.renderSidebar();
}

// ---------- PRODUCTS RENDERING ----------
function renderProducts() {
    const grid = document.getElementById('productsGrid');
    if (!grid) return;
    
    const t = translations[currentLang];
    const lang = currentLang;
    
    let filtered = productsDB;
    if (currentFilter !== 'all') {
        filtered = productsDB.filter(p => p.category === currentFilter);
    }
    
    if (filtered.length === 0) {
        grid.innerHTML = `<p style="grid-column: 1/-1; text-align: center; color: var(--text-muted); padding: 3rem 0;">Aucun produit trouvé</p>`;
        return;
    }
    
    grid.innerHTML = filtered.map(product => {
        const name = lang === 'ar' ? product.nameAr : product.nameFr;
        const badgeText = product.badge === 'promo' ? (lang === 'ar' ? 'تخفيض' : 'PROMO') 
                        : product.badge === 'new' ? (lang === 'ar' ? 'جديد' : 'NOUVEAU') 
                        : null;
        
        return `
            <article class="product-card">
                ${badgeText ? `<span class="product-card__badge">${badgeText}</span>` : ''}
                <div class="product-card__image">
                    <i class="fas ${product.icon}"></i>
                </div>
                <h3 class="product-card__title">${name}</h3>
                <div class="product-card__category">
                    <i class="fas fa-star" style="color: var(--accent);"></i> ${product.rating}
                </div>
                <div class="product-card__footer">
                    <div class="product-card__price">
                        ${product.price} <small>${t.currency}</small>
                        ${product.oldPrice ? `<br><small style="text-decoration: line-through; color: var(--text-muted); font-size: 0.75rem;">${product.oldPrice} ${t.currency}</small>` : ''}
                    </div>
                    <button class="product-card__add" onclick="handleAddToCart(${product.id})" aria-label="Add to cart">
                        <i class="fas fa-plus"></i>
                    </button>
                </div>
            </article>
        `;
    }).join('');
}

// ---------- CATEGORIES RENDERING ----------
function renderCategories() {
    const grid = document.getElementById('categoriesGrid');
    if (!grid) return;
    
    const lang = currentLang;
    
    grid.innerHTML = categoriesDB.map(cat => {
        const label = lang === 'ar' ? cat.labelAr : cat.labelFr;
        return `
            <div class="category-card" onclick="filterByCategory('${cat.id}')">
                <i class="fas ${cat.icon}"></i>
                <h3>${label}</h3>
            </div>
        `;
    }).join('');
}

// ---------- FILTER ----------
function filterByCategory(category) {
    currentFilter = category;
    
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.filter === category);
    });
    
    renderProducts();
    document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' });
}

// ---------- ADD TO CART ----------
function handleAddToCart(productId) {
    const success = Cart.add(productId);
    if (success) {
        showToast(translations[currentLang].toastAdded);
        const cartBtn = document.getElementById('cartBtn');
        cartBtn?.classList.add('bounce');
        setTimeout(() => cartBtn?.classList.remove('bounce'), 400);
    }
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
        showToast(translations[currentLang].toastEmptyCart);
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
        const name = lang === 'ar' ? item.product.nameAr : item.product.nameFr;
        return `
            <div class="order-summary__row">
                <span>${name} × ${item.quantity}</span>
                <span>${item.subtotal} ${t.currency}</span>
            </div>
        `;
    }).join('');
    
    html += `
        <div class="order-summary__row">
            <span>${t.orderSubtotal}</span>
            <span>${subtotal} ${t.currency}</span>
        </div>
        <div class="order-summary__row">
            <span>${t.orderShipping}</span>
            <span>${shipping === 0 ? t.orderFree : shipping + ' ' + t.currency}</span>
        </div>
        <div class="order-summary__row order-summary__row--total">
            <span>${t.orderTotal}</span>
            <span>${total} ${t.currency}</span>
        </div>
    `;
    
    container.innerHTML = html;
}

// ---------- ORDER SUBMISSION ----------
function submitOrder(e) {
    e.preventDefault();
    
    const form = e.target;
    const formData = new FormData(form);
    const t = translations[currentLang];
    
    const order = {
        customer: {
            name: formData.get('name'),
            phone: formData.get('phone'),
            city: formData.get('city'),
            address: formData.get('address'),
            notes: formData.get('notes') || ''
        },
        payment: formData.get('payment'),
        items: Cart.getDetailedItems().map(item => ({
            id: item.id,
            name: currentLang === 'ar' ? item.product.nameAr : item.product.nameFr,
            price: item.product.price,
            quantity: item.quantity,
            subtotal: item.subtotal
        })),
        total: Cart.getTotal(),
        date: new Date().toISOString(),
        language: currentLang
    };
    
    saveOrder(order);
    
    closeCheckout();
    Cart.clear();
    
    const waMessage = buildWhatsAppMessage(order);
    const waLink = document.querySelector('#successModal .btn--whatsapp');
    if (waLink) {
        waLink.href = `https://wa.me/212600000000?text=${encodeURIComponent(waMessage)}`;
    }
    
    document.getElementById('successModal')?.classList.add('open');
    document.getElementById('overlay')?.classList.add('active');
    
    form.reset();
}

function saveOrder(order) {
    const orders = JSON.parse(localStorage.getItem('gymhouse_orders') || '[]');
    order.id = 'ORD-' + Date.now();
    orders.push(order);
    localStorage.setItem('gymhouse_orders', JSON.stringify(orders));
    console.log('Order saved:', order);
}

function buildWhatsAppMessage(order) {
    let msg = `*Nouvelle commande GymHouse*\n\n`;
    msg += `👤 ${order.customer.name}\n`;
    msg += `📞 ${order.customer.phone}\n`;
    msg += `📍 ${order.customer.city}, ${order.customer.address}\n`;
    msg += `💳 Paiement: ${order.payment}\n\n`;
    msg += `*Produits:*\n`;
    order.items.forEach(item => {
        msg += `• ${item.name} × ${item.quantity} = ${item.subtotal} DH\n`;
    });
    msg += `\n*TOTAL: ${order.total} DH*`;
    msg += `\n\n_Produits Primo disponibles : PrimoShake, Primopeanut_`;
    return msg;
}

// ---------- TOAST ----------
function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    if (!toast) return;
    
    const icon = type === 'success' ? 'fa-check-circle' : 'fa-info-circle';
    toast.innerHTML = `<i class="fas ${icon}"></i> ${message}`;
    toast.classList.add('show');
    
    clearTimeout(toast._timeout);
    toast._timeout = setTimeout(() => {
        toast.classList.remove('show');
    }, 2500);
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
        closeCart();
        closeCheckout();
    });
    
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            currentFilter = btn.dataset.filter;
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            renderProducts();
        });
    });
    
    document.getElementById('menuToggle')?.addEventListener('click', () => {
        document.getElementById('mainNav')?.classList.toggle('open');
    });
    
    document.querySelectorAll('.nav a').forEach(link => {
        link.addEventListener('click', () => {
            document.getElementById('mainNav')?.classList.remove('open');
        });
    });
    
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeCart();
            closeCheckout();
        }
    });
}

// Add bounce animation dynamically
const style = document.createElement('style');
style.textContent = `
    @keyframes bounce {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.15); }
    }
    .bounce { animation: bounce 0.4s; }
`;
document.head.appendChild(style);