// ============================================
// ADMIN PANEL — FIXED
// ============================================

let allProducts = [];
let allCategories = [];

document.addEventListener('DOMContentLoaded', function () {
    const loginForm = document.getElementById('loginForm');
    const loginScreen = document.getElementById('loginScreen');
    const app = document.getElementById('app');
    const errBox = document.getElementById('loginError');

    // LOGIN
    loginForm.addEventListener('submit', function (e) {
        e.preventDefault();
        const username = document.getElementById('loginUser').value.trim();
        const password = document.getElementById('loginPass').value;
        errBox.textContent = 'Connexion...';

        fetch('api/auth.php?action=login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ username, password })
        })
        .then(r => r.text())
        .then(t => {
            let d;
            try { d = JSON.parse(t); } catch { errBox.textContent = 'Erreur serveur'; console.error(t); return; }
            if (d.success) {
                errBox.textContent = '';
                loginScreen.style.display = 'none';
                app.style.display = 'block';
                document.getElementById('adminName').textContent = d.name || 'Admin';
                loadAllData();
            } else {
                errBox.textContent = d.error || 'Erreur';
            }
        })
        .catch(e => errBox.textContent = 'Erreur: ' + e.message);
    });

    // LOGOUT
    document.getElementById('logoutBtn').addEventListener('click', function () {
        fetch('api/auth.php?action=logout', { credentials: 'include' }).then(() => location.reload());
    });

    // TABS
    document.querySelectorAll('.tab').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
            tab.classList.add('active');
            document.getElementById('tab-' + tab.dataset.tab).classList.add('active');
            if (tab.dataset.tab === 'orders') loadOrders();
        });
    });

    // FORMS
    document.getElementById('productForm').addEventListener('submit', saveProduct);
    document.getElementById('categoryForm').addEventListener('submit', saveCategory);

    // AUTO-LOGIN
    fetch('api/auth.php?action=check', { credentials: 'include' })
        .then(r => r.json())
        .then(d => {
            if (d.logged_in) {
                loginScreen.style.display = 'none';
                app.style.display = 'block';
                document.getElementById('adminName').textContent = d.name || 'Admin';
                loadAllData();
            }
        })
        .catch(() => {});
});

async function loadAllData() {
    await loadCategories();
    await loadProducts();
}

async function loadCategories() {
    try {
        const r = await fetch('api/categories.php');
        allCategories = await r.json();
        document.getElementById('categoryCount').textContent = allCategories.length;

        document.getElementById('categoriesTable').innerHTML = allCategories.map(c =>
            `<tr>
                <td><i class="fas ${c.icon}" style="font-size:1.4rem;color:#0d3b66;"></i></td>
                <td><code>${c.id}</code></td>
                <td>${esc(c.label_fr)}</td>
                <td>${esc(c.label_ar)}</td>
                <td>
                    <div class="actions">
                        <button class="btn-edit" onclick="openCategoryModal('${c.id}')"><i class="fas fa-edit"></i></button>
                        <button class="btn-del" onclick="deleteCategory('${c.id}')"><i class="fas fa-trash"></i></button>
                    </div>
                </td>
            </tr>`
        ).join('') || '<tr><td colspan="5">Aucune</td></tr>';

        const sel = document.getElementById('pCategory');
        if (sel) sel.innerHTML = allCategories.map(c => `<option value="${c.id}">${c.label_fr}</option>`).join('');
    } catch (e) { console.error('cat:', e); }
}

async function loadProducts() {
    try {
        const r = await fetch('api/products.php?admin=1', { credentials: 'include' });
        const text = await r.text();

        // Handle non-JSON errors gracefully
        let data;
        try {
            data = JSON.parse(text);
        } catch (err) {
            console.error('Products API returned non-JSON:', text.substring(0, 500));
            document.getElementById('productsTable').innerHTML =
                '<tr><td colspan="7" style="color:#e74c3c;padding:1rem;">Erreur API — voir console</td></tr>';
            return;
        }

        if (!Array.isArray(data)) {
            console.error('Products API error:', data);
            document.getElementById('productsTable').innerHTML =
                `<tr><td colspan="7" style="color:#e74c3c;padding:1rem;">${data.error || 'Erreur'}</td></tr>`;
            return;
        }

        allProducts = data;
        document.getElementById('productCount').textContent = allProducts.length;

        document.getElementById('productsTable').innerHTML = allProducts.map(p => {
            const img = p.image_path
                ? `<img src="uploads/${p.image_path}" style="width:50px;height:50px;object-fit:cover;border-radius:8px;" onerror="this.outerHTML='<div class=&quot;fallback&quot;><i class=&quot;fas ${p.icon}&quot;></i></div>'">`
                : `<div class="fallback"><i class="fas ${p.icon}"></i></div>`;
            const badge = p.badge ? `<span class="badge-pill ${p.badge}">${p.badge.toUpperCase()}</span>` : '—';
            return `<tr>
                <td>${img}</td>
                <td><strong>${esc(p.name_fr)}</strong><br><small style="color:#6a7e8c;">${esc(p.name_ar)}</small></td>
                <td><strong>${p.price} DH</strong>${p.old_price ? `<br><small style="text-decoration:line-through;color:#999;">${p.old_price} DH</small>` : ''}</td>
                <td>${p.category}</td>
                <td>${p.stock}</td>
                <td>${badge}</td>
                <td><div class="actions">
                    <button class="btn-edit" onclick="openProductModal(${p.id})"><i class="fas fa-edit"></i></button>
                    <button class="btn-del" onclick="deleteProduct(${p.id})"><i class="fas fa-trash"></i></button>
                </div></td>
            </tr>`;
        }).join('') || '<tr><td colspan="7">Aucun produit</td></tr>';
    } catch (e) {
        console.error('products:', e);
    }
}

function openProductModal(id) {
    const modal = document.getElementById('productModal');
    document.getElementById('productForm').reset();
    document.getElementById('pImagePath').value = '';
    document.getElementById('pImgPreview').innerHTML = '<i class="fas fa-image"></i>';
    document.getElementById('pImgName').textContent = 'Aucune image';

    const select = document.getElementById('pCategory');
    select.innerHTML = allCategories.map(c => `<option value="${c.id}">${c.label_fr}</option>`).join('');

    if (id) {
        const p = allProducts.find(x => x.id === id);
        if (!p) return;
        document.getElementById('productModalTitle').textContent = 'Modifier';
        document.getElementById('pId').value = p.id;
        document.getElementById('pNameFr').value = p.name_fr || '';
        document.getElementById('pNameAr').value = p.name_ar || '';
        document.getElementById('pPrice').value = p.price || '';
        document.getElementById('pOldPrice').value = p.old_price || '';
        document.getElementById('pCategory').value = p.category || '';
        document.getElementById('pUnit').value = p.unit || '';
        document.getElementById('pStock').value = p.stock || 0;
        document.getElementById('pRating').value = p.rating || 5;
        document.getElementById('pBadge').value = p.badge || '';
        document.getElementById('pProtein').value = p.protein_info || '';
        document.getElementById('pDescFr').value = p.description_fr || '';
        document.getElementById('pDescAr').value = p.description_ar || '';
        if (p.image_path) {
            document.getElementById('pImagePath').value = p.image_path;
            document.getElementById('pImgPreview').innerHTML = `<img src="uploads/${p.image_path}">`;
            document.getElementById('pImgName').textContent = p.image_path;
        }
    } else {
        document.getElementById('productModalTitle').textContent = 'Ajouter un produit';
        document.getElementById('pId').value = '';
    }
    modal.classList.add('open');
}

async function uploadProductImage(input) {
    if (!input.files || !input.files[0]) return;
    showToast('Upload en cours...', 'info');
    const fd = new FormData();
    fd.append('file', input.files[0]);
    try {
        const r = await fetch('api/upload.php', { method: 'POST', body: fd, credentials: 'include' });
        const d = await r.json();
        if (d.success) {
            document.getElementById('pImagePath').value = d.filename;
            document.getElementById('pImgPreview').innerHTML = `<img src="uploads/${d.filename}">`;
            document.getElementById('pImgName').textContent = d.filename;
            showToast('Image uploadée ✅');
        } else {
            showToast('Erreur: ' + d.error, 'error');
        }
    } catch (e) { showToast('Erreur: ' + e.message, 'error'); }
}

async function saveProduct(e) {
    e.preventDefault();
    const id = document.getElementById('pId').value;

    const data = {
        name_fr: document.getElementById('pNameFr').value,
        name_ar: document.getElementById('pNameAr').value,
        price: parseFloat(document.getElementById('pPrice').value),
        old_price: document.getElementById('pOldPrice').value ? parseFloat(document.getElementById('pOldPrice').value) : null,
        category: document.getElementById('pCategory').value,
        unit: document.getElementById('pUnit').value || null,
        stock: parseInt(document.getElementById('pStock').value) || 0,
        rating: parseFloat(document.getElementById('pRating').value) || 5.0,
        badge: document.getElementById('pBadge').value || null,
        protein_info: document.getElementById('pProtein').value || null,
        description_fr: document.getElementById('pDescFr').value,
        description_ar: document.getElementById('pDescAr').value,
        image_path: document.getElementById('pImagePath').value || null
    };

    try {
        const url = id ? 'api/products.php?id=' + id : 'api/products.php';
        const method = id ? 'PUT' : 'POST';
        const r = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify(data)
        });
        const text = await r.text();
        let result;
        try { result = JSON.parse(text); } catch { showToast('Erreur serveur', 'error'); console.error(text); return; }

        if (result.success) {
            showToast(id ? 'Produit modifié ✅' : 'Produit ajouté ✅');
            closeModal('productModal');
            await loadProducts();
        } else {
            showToast('Erreur: ' + (result.error || '') + (result.detail ? ' — ' + result.detail : ''), 'error');
            console.error(result);
        }
    } catch (e) { showToast('Erreur: ' + e.message, 'error'); }
}

async function deleteProduct(id) {
    if (!confirm('Supprimer ce produit ?')) return;
    try {
        const r = await fetch('api/products.php?id=' + id, { method: 'DELETE', credentials: 'include' });
        const d = await r.json();
        if (d.success) { showToast('Supprimé'); await loadProducts(); }
        else showToast('Erreur: ' + d.error, 'error');
    } catch (e) { showToast('Erreur: ' + e.message, 'error'); }
}

function openCategoryModal(id) {
    document.getElementById('categoryForm').reset();
    if (id) {
        const c = allCategories.find(x => x.id === id);
        if (!c) return;
        document.getElementById('categoryModalTitle').textContent = 'Modifier';
        document.getElementById('cId').value = c.id;
        document.getElementById('cIdInput').value = c.id;
        document.getElementById('cIdInput').disabled = true;
        document.getElementById('cLabelFr').value = c.label_fr;
        document.getElementById('cLabelAr').value = c.label_ar;
        document.getElementById('cIcon').value = c.icon;
    } else {
        document.getElementById('categoryModalTitle').textContent = 'Ajouter une catégorie';
        document.getElementById('cId').value = '';
        document.getElementById('cIdInput').disabled = false;
    }
    document.getElementById('categoryModal').classList.add('open');
}

async function saveCategory(e) {
    e.preventDefault();
    const orig = document.getElementById('cId').value;
    const data = {
        id: document.getElementById('cIdInput').value,
        label_fr: document.getElementById('cLabelFr').value,
        label_ar: document.getElementById('cLabelAr').value,
        icon: document.getElementById('cIcon').value
    };
    try {
        const r = await fetch('api/categories.php', {
            method: orig ? 'PUT' : 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify(data)
        });
        const result = await r.json();
        if (result.success) {
            showToast(orig ? 'Modifiée ✅' : 'Ajoutée ✅');
            closeModal('categoryModal');
            await loadCategories();
        } else showToast('Erreur: ' + result.error, 'error');
    } catch (e) { showToast('Erreur: ' + e.message, 'error'); }
}

async function deleteCategory(id) {
    if (!confirm('Supprimer ?')) return;
    const r = await fetch('api/categories.php?id=' + encodeURIComponent(id), { method: 'DELETE', credentials: 'include' });
    const d = await r.json();
    if (d.success) { showToast('Supprimée'); await loadCategories(); }
    else showToast('Erreur: ' + d.error, 'error');
}

async function loadOrders() {
    try {
        const r = await fetch('api/orders.php', { credentials: 'include' });
        const orders = await r.json();
        if (!Array.isArray(orders) || !orders.length) {
            document.getElementById('ordersTable').innerHTML = '<tr><td colspan="9" style="text-align:center;padding:2rem;">Aucune commande</td></tr>';
            return;
        }
        document.getElementById('ordersTable').innerHTML = orders.map(o => `<tr>
            <td><code>${o.order_ref}</code></td>
            <td>${esc(o.customer_name)}</td>
            <td>${esc(o.phone)}</td>
            <td>${esc(o.city)}</td>
            <td><strong>${o.total} DH</strong></td>
            <td>${o.payment_method}</td>
            <td><select onchange="updateOrderStatus(${o.id}, this.value)">
                ${['pending','confirmed','shipped','delivered','cancelled'].map(s => `<option value="${s}"${o.status === s ? ' selected' : ''}>${s}</option>`).join('')}
            </select></td>
            <td>${new Date(o.created_at).toLocaleString('fr-FR')}</td>
            <td>—</td>
        </tr>`).join('');
    } catch (e) {
        document.getElementById('ordersTable').innerHTML = '<tr><td colspan="9">Erreur</td></tr>';
    }
}

async function updateOrderStatus(id, status) {
    await fetch('api/orders.php?id=' + id, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status })
    });
    showToast('Statut mis à jour');
}

function closeModal(id) { document.getElementById(id).classList.remove('open'); }

function showToast(msg, type) {
    const t = document.getElementById('toast');
    const ic = type === 'error' ? 'fa-exclamation-circle' : type === 'info' ? 'fa-info-circle' : 'fa-check-circle';
    t.innerHTML = `<i class="fas ${ic}"></i> ${msg}`;
    t.classList.add('show');
    clearTimeout(t._t);
    t._t = setTimeout(() => t.classList.remove('show'), 2500);
}

function esc(s) {
    if (!s) return '';
    return String(s).replace(/[&<>"']/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c]));
}

// Expose globally for inline onclick handlers
window.openProductModal = openProductModal;
window.deleteProduct = deleteProduct;
window.uploadProductImage = uploadProductImage;
window.openCategoryModal = openCategoryModal;
window.deleteCategory = deleteCategory;
window.updateOrderStatus = updateOrderStatus;
window.closeModal = closeModal;