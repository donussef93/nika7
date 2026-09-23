<?php
/**
 * WHATSAPP ORDER HELPER
 * Generates wa.me link with order details
 */

require_once __DIR__ . '/config.php';
setApiHeaders();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(['error' => 'POST required'], 405);
}

$data = getJsonBody();

$customer = $data['customer'] ?? [];
$items = $data['items'] ?? [];
$payment = $data['payment'] ?? 'cash';
$total = $data['total'] ?? 0;
$lang = $data['language'] ?? 'fr';

if (empty($items)) {
    jsonResponse(['error' => 'No items'], 400);
}

// Build message
$paymentLabels = [
    'credit' => 'Carte bancaire / بطاقة بنكية',
    'bank'   => 'Virement / تحويل بنكي',
    'cash'   => 'Espèces / نقداً'
];

if ($lang === 'ar') {
    $msg = "🛒 *طلب جديد - جيمهوس*\n\n";
    $msg .= "👤 {$customer['name']}\n";
    $msg .= "📞 {$customer['phone']}\n";
    $msg .= "📍 {$customer['city']}, {$customer['address']}\n";
    $msg .= "💳 الدفع: {$paymentLabels[$payment]}\n\n";
    $msg .= "*المنتجات:*\n";
    foreach ($items as $item) {
        $msg .= "• {$item['name']} × {$item['quantity']} = {$item['subtotal']} درهم\n";
    }
    $msg .= "\n*المجموع: {$total} درهم*";
} else {
    $msg = "🛒 *Nouvelle commande - GymHouse*\n\n";
    $msg .= "👤 {$customer['name']}\n";
    $msg .= "📞 {$customer['phone']}\n";
    $msg .= "📍 {$customer['city']}, {$customer['address']}\n";
    $msg .= "💳 Paiement: {$paymentLabels[$payment]}\n\n";
    $msg .= "*Produits:*\n";
    foreach ($items as $item) {
        $msg .= "• {$item['name']} × {$item['quantity']} = {$item['subtotal']} DH\n";
    }
    $msg .= "\n*TOTAL: {$total} DH*";
}

$url = 'https://wa.me/' . WHATSAPP_NUMBER . '?text=' . urlencode($msg);

jsonResponse([
    'success' => true,
    'whatsapp_url' => $url,
    'message' => $msg
]);