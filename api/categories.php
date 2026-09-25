<?php
require_once __DIR__ . '/config.php';

$db = getDB();
$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $stmt = $db->query("SELECT * FROM categories WHERE is_active = 1 ORDER BY sort_order, id");
    jsonOut($stmt->fetchAll());
}

requireAdmin();

if ($method === 'POST') {
    $d = getJsonBody();
    foreach (['id','icon','label_fr','label_ar'] as $f) {
        if (empty($d[$f])) jsonOut(['error' => "Missing: $f"], 400);
    }
    $stmt = $db->prepare("INSERT INTO categories (id, icon, label_fr, label_ar, sort_order) VALUES (?,?,?,?,?)");
    $stmt->execute([$d['id'], $d['icon'], $d['label_fr'], $d['label_ar'], (int)($d['sort_order'] ?? 0)]);
    jsonOut(['success' => true]);
}

if ($method === 'PUT') {
    $d = getJsonBody();
    if (empty($d['id'])) jsonOut(['error' => 'ID required'], 400);
    $stmt = $db->prepare("UPDATE categories SET icon=?, label_fr=?, label_ar=? WHERE id=?");
    $stmt->execute([$d['icon'], $d['label_fr'], $d['label_ar'], $d['id']]);
    jsonOut(['success' => true]);
}

if ($method === 'DELETE') {
    $id = $_GET['id'] ?? '';
    $stmt = $db->prepare("UPDATE categories SET is_active = 0 WHERE id = ?");
    $stmt->execute([$id]);
    jsonOut(['success' => true]);
}

jsonOut(['error' => 'Method not allowed'], 405);