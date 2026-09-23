<?php
/**
 * ORDERS API
 * POST /api/orders.php   -> create new order
 * GET  /api/orders.php   -> list all orders (admin)
 */

require_once __DIR__ . '/config.php';
setApiHeaders();

$db = getDB();
$method = $_SERVER['REQUEST_METHOD'];

try {
    if ($method === 'POST') {
        $data = getJsonBody();
        
        // Validate
        $required = ['customer', 'items', 'payment', 'total'];
        foreach ($required as $field) {
            if (empty($data[$field])) {
                jsonResponse(['error' => "Missing field: $field"], 400);
            }
        }
        
        $customer = $data['customer'];
        foreach (['name', 'phone', 'city', 'address'] as $f) {
            if (empty($customer[$f])) {
                jsonResponse(['error' => "Missing customer field: $f"], 400);
            }
        }
        
        if (!in_array($data['payment'], ['credit', 'bank', 'cash'])) {
            jsonResponse(['error' => 'Invalid payment method'], 400);
        }
        
        $db->beginTransaction();
        
        // Insert customer
        $stmt = $db->prepare("INSERT INTO customers (name, phone, city, address) VALUES (?, ?, ?, ?)");
        $stmt->execute([
            clean($customer['name']),
            clean($customer['phone']),
            clean($customer['city']),
            clean($customer['address'])
        ]);
        $customerId = $db->lastInsertId();
        
        // Generate order reference
        $orderRef = 'GH-' . date('Ymd') . '-' . strtoupper(substr(uniqid(), -5));
        
        // Insert order
        $stmt = $db->prepare("
            INSERT INTO orders (order_ref, customer_id, total, payment_method, notes, language, status)
            VALUES (?, ?, ?, ?, ?, ?, 'pending')
        ");
        $stmt->execute([
            $orderRef,
            $customerId,
            (float)$data['total'],
            $data['payment'],
            clean($customer['notes'] ?? ''),
            in_array($data['language'] ?? 'fr', ['fr', 'ar']) ? $data['language'] : 'fr'
        ]);
        $orderId = $db->lastInsertId();
        
        // Insert order items
        $stmt = $db->prepare("
            INSERT INTO order_items (order_id, product_id, product_name, price, quantity, subtotal)
            VALUES (?, ?, ?, ?, ?, ?)
        ");
        foreach ($data['items'] as $item) {
            $stmt->execute([
                $orderId,
                (int)$item['id'],
                clean($item['name']),
                (float)$item['price'],
                (int)$item['quantity'],
                (float)$item['subtotal']
            ]);
        }
        
        $db->commit();
        
        jsonResponse([
            'success' => true,
            'order_ref' => $orderRef,
            'order_id' => $orderId,
            'message' => 'Order created successfully'
        ], 201);
    }
    
    if ($method === 'GET') {
        $stmt = $db->query("SELECT * FROM v_orders_full ORDER BY created_at DESC LIMIT 100");
        jsonResponse($stmt->fetchAll());
    }
    
    jsonResponse(['error' => 'Method not allowed'], 405);
    
} catch (Exception $e) {
    if ($db->inTransaction()) $db->rollBack();
    jsonResponse(['error' => 'Server error', 'details' => $e->getMessage()], 500);
}