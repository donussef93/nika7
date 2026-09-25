<?php
require_once __DIR__ . '/config.php';

$action = $_GET['action'] ?? '';

if ($action === 'login') {
    $d = getJsonBody();
    $u = trim($d['username'] ?? '');
    $p = (string)($d['password'] ?? '');

    if ($u === '' || $p === '') jsonOut(['error' => 'Missing credentials'], 400);

    $stmt = getDB()->prepare("SELECT * FROM admin_users WHERE username = ? LIMIT 1");
    $stmt->execute([$u]);
    $user = $stmt->fetch();

    if (!$user || $p !== $user['password']) {
        jsonOut(['error' => 'Invalid username or password'], 401);
    }

    $_SESSION['admin_id']   = $user['id'];
    $_SESSION['admin_name'] = $user['full_name'];
    $_SESSION['admin_role'] = $user['role'];

    jsonOut(['success' => true, 'name' => $user['full_name'], 'role' => $user['role']]);
}

if ($action === 'logout') {
    session_destroy();
    jsonOut(['success' => true]);
}

if ($action === 'check') {
    jsonOut([
        'logged_in' => !empty($_SESSION['admin_id']),
        'name'      => $_SESSION['admin_name'] ?? null,
        'role'      => $_SESSION['admin_role'] ?? null
    ]);
}

jsonOut(['error' => 'Unknown action'], 400);