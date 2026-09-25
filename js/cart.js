// ============================================
// CART — persists in localStorage
// ============================================

const Cart = {
    items: [],

    init() {
        const saved = localStorage.getItem('primo_cart');
        if (saved) {
            try { this.items = JSON.parse(saved); } catch { this.items = []; }
        }
        this.updateUI();
    },

    save() { localStorage.setItem('primo_cart', JSON.stringify(this.items)); },

    add(product) {
        const existing = this.items.find(i => i.id === product.id);
        if (existing) existing.quantity += 1;
        else this.items.push({ id: product.id, quantity: 1 });
        this.save();
        this.updateUI();
    },

    remove(productId) {
        this.items = this.items.filter(i => i.id !== productId);
        this.save();
        this.updateUI();
    },

    updateQuantity(productId, delta) {
        const item = this.items.find(i => i.id === productId);
        if (!item) return;
        item.quantity += delta;
        if (item.quantity <= 0) this.remove(productId);
        else { this.save(); this.updateUI(); }
    },

    getDetailedItems() {
        return this.items.map(item => {
            const product = productsDB.find(p => p.id === item.id);
            if (!product) return null;
            return {
                ...item,
                product,
                subtotal: product.price * item.quantity
            };
        }).filter(Boolean);
    },

    getCount() { return this.items.reduce((s, i) => s + i.quantity, 0); },
    getTotal() { return this.getDetailedItems().reduce((s, i) => s + i.subtotal, 0); },
    clear() { this.items = []; this.save(); this.updateUI(); },

    updateUI() {
        const badge = document.getElementById('cartBadge');
        if (badge) {
            const c = this.getCount();
            badge.textContent = c;
            badge.style.display = c > 0 ? 'flex' : 'none';
        }
        this.renderSidebar();
    },

    renderSidebar() {
        const body = document.getElementById('cartBody');
        const totalEl = document.getElementById('cartTotal');
        const checkoutBtn = document.getElementById('checkoutBtn');
        if (!body) return;

        const t = translations[currentLang];
        const lang = currentLang;
        const items = this.getDetailedItems();

        if (!items.length) {
            body.innerHTML = `<div class="empty-cart">
                <i class="fas fa-shopping-bag"></i>
                <p>${t.cartEmpty}</p>
                <small style="color:var(--text-muted);">${t.cartEmptyHint}</small>
            </div>`;
            if (totalEl) totalEl.textContent = `0 ${t.currency}`;
            if (checkoutBtn) { checkoutBtn.disabled = true; checkoutBtn.style.opacity = '0.6'; }
            return;
        }
        if (checkoutBtn) { checkoutBtn.disabled = false; checkoutBtn.style.opacity = '1'; }

        body.innerHTML = items.map(item => {
            const name = lang === 'ar' ? item.product.name_ar : item.product.name_fr;
            const img = item.product.image_path
                ? `<img src="uploads/${item.product.image_path}" alt="${name}"
                       onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                   <i class="fas ${item.product.icon}" style="display:none;"></i>`
                : `<i class="fas ${item.product.icon}"></i>`;
            return `<div class="cart-item" data-id="${item.id}">
                <div class="cart-item__image">${img}</div>
                <div class="cart-item__info">
                    <div class="cart-item__title">${name}</div>
                    <div class="cart-item__price">${item.product.price} ${t.currency}</div>
                    <div class="cart-item__controls">
                        <button class="qty-btn" onclick="Cart.updateQuantity(${item.id},-1)">−</button>
                        <span class="cart-item__qty">${item.quantity}</span>
                        <button class="qty-btn" onclick="Cart.updateQuantity(${item.id},1)">+</button>
                        <button class="cart-item__remove" onclick="Cart.remove(${item.id})"><i class="fas fa-trash-alt"></i></button>
                    </div>
                </div>
            </div>`;
        }).join('');

        if (totalEl) totalEl.textContent = `${this.getTotal()} ${t.currency}`;
    }
};

window.Cart = Cart;