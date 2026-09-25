<?php
require_once __DIR__ . '/config.php';

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') jsonOut(['ok' => true]);

$db = getDB();
$method = $_SERVER['REQUEST_METHOD'];

// ---------- CREATE (public) ----------
if ($method === 'POST') {
    $d = getJsonBody();

    $c = $d['customer'] ?? [];
    foreach (['name','phone','city','address'] as $f) {
        if (empty($c[$f])) jsonOut(['error' => "Missing customer.$f"], 400);
    }
    if (empty($d['items']) || !is_array($d['items'])) {
        jsonOut(['error' => 'No items'], 400);
    }

    $db->beginTransaction();
    try {
        // Insert customer
        $stmt = $db->prepare("INSERT INTO customers (name, phone, city, address, notes) VALUES (?,?,?,?,?)");
        $stmt->execute([$c['name'], $c['phone'], $c['city'], $c['address'], $c['notes'] ?? '']);
        $customerId = (int)$db->lastInsertId();

        // Order ref
        $ref = 'PRIMO-' . date('Ymd') . '-' . strtoupper(substr(uniqid(), -5));

        // Insert order
        $stmt = $db->prepare("INSERT INTO orders (order_ref, customer_id, total, payment_method, language) VALUES (?,?,?,?,?)");
        $stmt->execute([
            $ref,
            $customerId,
            (float)$d['total'],
            $d['payment'] ?? 'cash',
            $d['language'] ?? 'fr'
        ]);
        $orderId = (int)$db->lastInsertId();

        // Order items
        $stmt = $db->prepare("INSERT INTO order_items (order_id, product_id, product_name, price, quantity, subtotal) VALUES (?,?,?,?,?,?)");
        foreach ($d['items'] as $it) {
            $stmt->execute([
                $orderId,
                (int)$it['id'],
                $it['name'],
                (float)$it['price'],
                (int)$it['quantity'],
                (float)$it['subtotal'],
            ]);
        }

        $db->commit();
        jsonOut(['success' => true, 'order_ref' => $ref, 'order_id' => $orderId], 201);

    } catch (Throwable $e) {
        $db->rollBack();
        jsonOut(['error' => 'Order failed', 'details' => $e->getMessage()], 500);
    }
}

// ---------- LIST (admin) ----------
if ($method === 'GET') {
    requireAdmin();
    $stmt = $db->query("
        SELECT o.id, o.order_ref, o.total, o.payment_method, o.status, o.language, o.created_at,
               c.name AS customer_name, c.phone, c.city, c.address
        FROM orders o
        JOIN customers c ON c.id = o.customer_id
        ORDER BY o.created_at DESC
        LIMIT 200
    ");
    jsonOut($stmt->fetchAll());
}

// ---------- UPDATE STATUS (admin) ----------
if ($method === 'PUT') {
    requireAdmin();
    $id = (int)($_GET['id'] ?? 0);
    $d = getJsonBody();
    $status = $d['status'] ?? '';
    $allowed = ['pending','confirmed','shipped','delivered','cancelled'];
    if (!in_array($status, $allowed, true)) jsonOut(['error' => 'Invalid status'], 400);

    $stmt = $db->prepare("UPDATE orders SET status = ? WHERE id = ?");
    $stmt->execute([$status, $id]);
    jsonOut(['success' => true]);
}

jsonOut(['error' => 'Method not allowed'], 405);