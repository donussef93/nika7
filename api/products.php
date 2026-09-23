<?php
/**
 * PRODUCTS API
 * GET  /api/products.php            -> list all active products
 * GET  /api/products.php?id=1       -> single product
 * GET  /api/products.php?category=force
 * POST /api/products.php            -> create (admin)
 * PUT  /api/products.php?id=1       -> update (admin)
 * DELETE /api/products.php?id=1     -> delete (admin)
 */

require_once __DIR__ . '/config.php';
setApiHeaders();

$db = getDB();
$method = $_SERVER['REQUEST_METHOD'];

try {
    switch ($method) {
        case 'GET':
            if (isset($_GET['id'])) {
                $stmt = $db->prepare("SELECT * FROM products WHERE id = ? AND is_active = 1");
                $stmt->execute([(int)$_GET['id']]);
                $product = $stmt->fetch();
                if (!$product) jsonResponse(['error' => 'Product not found'], 404);
                jsonResponse($product);
            }
            
            $sql = "SELECT * FROM products WHERE is_active = 1";
            $params = [];
            
            if (!empty($_GET['category'])) {
                $sql .= " AND category = ?";
                $params[] = clean($_GET['category']);
            }
            
            $sql .= " ORDER BY created_at DESC";
            $stmt = $db->prepare($sql);
            $stmt->execute($params);
            jsonResponse($stmt->fetchAll());
            break;
        
        case 'POST':
            $data = getJsonBody();
            
            $required = ['name_fr', 'name_ar', 'price', 'category'];
            foreach ($required as $field) {
                if (empty($data[$field])) {
                    jsonResponse(['error' => "Missing field: $field"], 400);
                }
            }
            
            $stmt = $db->prepare("
                INSERT INTO products 
                (name_fr, name_ar, description_fr, description_ar, price, old_price, category, icon, badge, rating, stock)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ");
            $stmt->execute([
                clean($data['name_fr']),
                clean($data['name_ar']),
                clean($data['description_fr'] ?? ''),
                clean($data['description_ar'] ?? ''),
                (float)$data['price'],
                !empty($data['old_price']) ? (float)$data['old_price'] : null,
                clean($data['category']),
                clean($data['icon'] ?? 'fa-dumbbell'),
                $data['badge'] ?? null,
                (float)($data['rating'] ?? 5.0),
                (int)($data['stock'] ?? 0)
            ]);
            
            jsonResponse([
                'success' => true,
                'id' => $db->lastInsertId(),
                'message' => 'Product created'
            ], 201);
            break;
        
        case 'PUT':
            if (!isset($_GET['id'])) jsonResponse(['error' => 'ID required'], 400);
            $data = getJsonBody();
            $id = (int)$_GET['id'];
            
            $fields = [];
            $values = [];
            $allowed = ['name_fr', 'name_ar', 'description_fr', 'description_ar', 
                        'price', 'old_price', 'category', 'icon', 'badge', 'rating', 'stock', 'is_active'];
            
            foreach ($allowed as $field) {
                if (array_key_exists($field, $data)) {
                    $fields[] = "$field = ?";
                    $values[] = $data[$field];
                }
            }
            
            if (empty($fields)) jsonResponse(['error' => 'No fields to update'], 400);
            
            $values[] = $id;
            $stmt = $db->prepare("UPDATE products SET " . implode(', ', $fields) . " WHERE id = ?");
            $stmt->execute($values);
            
            jsonResponse(['success' => true, 'message' => 'Product updated']);
            break;
        
        case 'DELETE':
            if (!isset($_GET['id'])) jsonResponse(['error' => 'ID required'], 400);
            $stmt = $db->prepare("UPDATE products SET is_active = 0 WHERE id = ?");
            $stmt->execute([(int)$_GET['id']]);
            jsonResponse(['success' => true, 'message' => 'Product deleted']);
            break;
        
        default:
            jsonResponse(['error' => 'Method not allowed'], 405);
    }
} catch (Exception $e) {
    jsonResponse(['error' => 'Server error', 'details' => $e->getMessage()], 500);
}