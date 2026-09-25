<?php
require_once __DIR__ . '/config.php';

$db = getDB();
$method = $_SERVER['REQUEST_METHOD'];

// GET
if ($method === 'GET') {
    if (!empty($_GET['id'])) {
        $stmt = $db->prepare("SELECT * FROM products WHERE id = ?");
        $stmt->execute([(int)$_GET['id']]);
        $p = $stmt->fetch();
        if (!$p) jsonOut(['error' => 'Not found'], 404);
        jsonOut($p);
    }

    if (($_GET['admin'] ?? '') === '1') {
        requireAdmin();
        $stmt = $db->query("SELECT * FROM products ORDER BY sort_order ASC, id ASC");
        jsonOut($stmt->fetchAll());
    }

    $sql = "SELECT * FROM products WHERE is_active = 1";
    $params = [];
    if (!empty($_GET['category'])) {
        $sql .= " AND category = ?";
        $params[] = $_GET['category'];
    }
    $sql .= " ORDER BY sort_order ASC, id ASC";
    $stmt = $db->prepare($sql);
    $stmt->execute($params);
    jsonOut($stmt->fetchAll());
}

// POST (create)
if ($method === 'POST') {
    requireAdmin();
    $d = getJsonBody();

    foreach (['name_fr','name_ar','price','category'] as $f) {
        if (empty($d[$f])) jsonOut(['error' => "Missing: $f"], 400);
    }

    try {
        $stmt = $db->prepare("
            INSERT INTO products
            (name_fr, name_ar, description_fr, description_ar, price, old_price,
             category, icon, image_path, badge, rating, stock, unit, protein_info, sort_order)
            VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
        ");
        $stmt->execute([
            $d['name_fr'],
            $d['name_ar'],
            $d['description_fr'] ?? '',
            $d['description_ar'] ?? '',
            (float)$d['price'],
            !empty($d['old_price']) ? (float)$d['old_price'] : null,
            $d['category'],
            $d['icon']         ?? 'fa-flask',
            !empty($d['image_path']) ? $d['image_path'] : null,
            !empty($d['badge']) ? $d['badge'] : null,
            (float)($d['rating'] ?? 5.0),
            (int)($d['stock']   ?? 0),
            !empty($d['unit']) ? $d['unit'] : null,
            !empty($d['protein_info']) ? $d['protein_info'] : null,
            (int)($d['sort_order'] ?? 0)
        ]);
        jsonOut(['success' => true, 'id' => (int)$db->lastInsertId()]);
    } catch (Exception $e) {
        jsonOut(['error' => 'Insert failed', 'detail' => $e->getMessage()], 500);
    }
}

// PUT (update)
if ($method === 'PUT') {
    requireAdmin();
    if (empty($_GET['id'])) jsonOut(['error' => 'ID required'], 400);

    $d = getJsonBody();
    $allowed = ['name_fr','name_ar','description_fr','description_ar','price','old_price',
                'category','icon','image_path','badge','rating','stock','unit','protein_info',
                'sort_order','is_active'];
    $fields = [];
    $values = [];
    foreach ($allowed as $f) {
        if (array_key_exists($f, $d)) {
            $fields[] = "$f = ?";
            $values[] = ($d[$f] === '') ? null : $d[$f];
        }
    }
    if (!$fields) jsonOut(['error' => 'Nothing to update'], 400);

    $values[] = (int)$_GET['id'];
    try {
        $stmt = $db->prepare("UPDATE products SET " . implode(', ', $fields) . " WHERE id = ?");
        $stmt->execute($values);
        jsonOut(['success' => true]);
    } catch (Exception $e) {
        jsonOut(['error' => 'Update failed', 'detail' => $e->getMessage()], 500);
    }
}

// DELETE
if ($method === 'DELETE') {
    requireAdmin();
    if (empty($_GET['id'])) jsonOut(['error' => 'ID required'], 400);
    $stmt = $db->prepare("DELETE FROM products WHERE id = ?");
    $stmt->execute([(int)$_GET['id']]);
    jsonOut(['success' => true]);
}

jsonOut(['error' => 'Method not allowed'], 405);