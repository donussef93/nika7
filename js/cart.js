// ============================================
// SHOPPING CART MODULE - PRIMO NUTRITION
// ============================================

const Cart = {
    items: [],
    
    init() {
        const saved = localStorage.getItem('primo_cart');
        if (saved) {
            try {
                this.items = JSON.parse(saved);
            } catch (e) {
                this.items = [];
            }
        }
        this.updateUI();
    },
    
    save() {
        localStorage.setItem('primo_cart', JSON.stringify(this.items));
    },
    
    add(productId) {
        const product = productsDB.find(p => p.id === productId);
        if (!product) return false;
        
        const existing = this.items.find(item => item.id === productId);
        if (existing) {
            existing.quantity += 1;
        } else {
            this.items.push({ id: productId, quantity: 1 });
        }
        this.save();
        this.updateUI();
        return true;
    },
    
    remove(productId) {
        this.items = this.items.filter(item => item.id !== productId);
        this.save();
        this.updateUI();
    },
    
    updateQuantity(productId, delta) {
        const item = this.items.find(item => item.id === productId);
        if (!item) return;
        
        item.quantity += delta;
        if (item.quantity <= 0) {
            this.remove(productId);
        } else {
            this.save();
            this.updateUI();
        }
    },
    
    getDetailedItems() {
        return this.items.map(item => {
            const product = productsDB.find(p => p.id === item.id);
            return {
                ...item,
                product: product,
                subtotal: product ? product.price * item.quantity : 0
            };
        }).filter(item => item.product);
    },
    
    getCount() {
        return this.items.reduce((sum, item) => sum + item.quantity, 0);
    },
    
    getTotal() {
        return this.getDetailedItems().reduce((sum, item) => sum + item.subtotal, 0);
    },
    
    clear() {
        this.items = [];
        this.save();
        this.updateUI();
    },
    
    updateUI() {
        const badge = document.getElementById('cartBadge');
        if (badge) {
            const count = this.getCount();
            badge.textContent = count;
            badge.style.display = count > 0 ? 'flex' : 'none';
        }
        this.renderSidebar();
    },
    
    renderSidebar() {
        const body = document.getElementById('cartBody');
        const totalEl = document.getElementById('cartTotal');
        const checkoutBtn = document.getElementById('checkoutBtn');
        const t = translations[currentLang];
        const lang = currentLang;
        
        if (!body) return;
        
        const items = this.getDetailedItems();
        
        if (items.length === 0) {
            body.innerHTML = `
                <div class="empty-cart">
                    <i class="fas fa-shopping-bag"></i>
                    <p>${t.cartEmpty}</p>
                    <small style="color: var(--text-muted);">${t.cartEmptyHint}</small>
                </div>
            `;
            if (totalEl) totalEl.textContent = `0 ${t.currency}`;
            if (checkoutBtn) {
                checkoutBtn.disabled = true;
                checkoutBtn.style.opacity = '0.6';
            }
            return;
        }
        
        if (checkoutBtn) {
            checkoutBtn.disabled = false;
            checkoutBtn.style.opacity = '1';
        }
        
        body.innerHTML = items.map(item => {
            const name = lang === 'ar' ? item.product.nameAr : item.product.nameFr;
            const imgTag = item.product.image 
                ? `<img src="${item.product.image}" alt="${name}" onerror="this.onerror=null; this.parentElement.innerHTML='<i class=\\'fas ${item.product.icon}\\'></i>';">`
                : `<i class="fas ${item.product.icon}"></i>`;
            
            return `
                <div class="cart-item" data-id="${item.id}">
                    <div class="cart-item__image">
                        ${imgTag}
                    </div>
                    <div class="cart-item__info">
                        <div class="cart-item__title">${name}</div>
                        <div class="cart-item__price">${item.product.price} ${t.currency}</div>
                        <div class="cart-item__controls">
                            <button class="qty-btn" onclick="Cart.updateQuantity(${item.id}, -1)">−</button>
                            <span class="cart-item__qty">${item.quantity}</span>
                            <button class="qty-btn" onclick="Cart.updateQuantity(${item.id}, 1)">+</button>
                            <button class="cart-item__remove" onclick="Cart.remove(${item.id})">
                                <i class="fas fa-trash-alt"></i>
                            </button>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
        
        if (totalEl) {
            totalEl.textContent = `${this.getTotal()} ${t.currency}`;
        }
    }
};

window.Cart = Cart;