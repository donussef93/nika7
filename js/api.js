// ============================================
// API WRAPPER — talks to /api/*.php
// ============================================

const API_BASE = 'api/';

async function apiGet(endpoint, params = {}) {
    const qs = new URLSearchParams(params).toString();
    const url = API_BASE + endpoint + (qs ? '?' + qs : '');
    const res = await fetch(url, { credentials: 'include' });
    if (!res.ok) throw new Error((await res.json().catch(()=>({}))).error || res.statusText);
    return res.json();
}

async function apiPost(endpoint, body = {}) {
    const res = await fetch(API_BASE + endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(body)
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || res.statusText);
    return data;
}

async function apiPut(endpoint, body = {}) {
    const res = await fetch(API_BASE + endpoint, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(body)
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || res.statusText);
    return data;
}

async function apiDelete(endpoint) {
    const res = await fetch(API_BASE + endpoint, {
        method: 'DELETE',
        credentials: 'include'
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || res.statusText);
    return data;
}

async function apiUpload(file) {
    const fd = new FormData();
    fd.append('file', file);
    const res = await fetch(API_BASE + 'upload.php', {
        method: 'POST',
        body: fd,
        credentials: 'include'
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || res.statusText);
    return data;
}

// Expose globally
window.API = { get: apiGet, post: apiPost, put: apiPut, delete: apiDelete, upload: apiUpload };