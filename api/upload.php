<?php
require_once __DIR__ . '/config.php';
requireAdmin();

if (empty($_FILES['file'])) jsonOut(['error' => 'No file'], 400);

$file = $_FILES['file'];
if ($file['error'] !== UPLOAD_ERR_OK) jsonOut(['error' => 'Upload error ' . $file['error']], 400);

$ext = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
if (!in_array($ext, ['jpg','jpeg','png','webp','gif'])) {
    jsonOut(['error' => 'Invalid type'], 400);
}
if ($file['size'] > 5 * 1024 * 1024) jsonOut(['error' => 'Max 5MB'], 400);

if (!is_dir(UPLOAD_DIR)) mkdir(UPLOAD_DIR, 0755, true);

$filename = 'img_' . uniqid() . '.' . $ext;
$target = UPLOAD_DIR . $filename;

if (!move_uploaded_file($file['tmp_name'], $target)) {
    jsonOut(['error' => 'Save failed'], 500);
}
@chmod($target, 0644);

jsonOut(['success' => true, 'filename' => $filename, 'url' => UPLOAD_URL . $filename]);