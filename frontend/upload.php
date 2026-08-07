<?php
/**
 * Hostinger Media Upload Bridge for Global Awaaz
 * Uploads media files directly into public_html/public/uploads/
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Headers: X-Api-Key, Content-Type');
header('Access-Control-Allow-Methods: POST, OPTIONS');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// 1. Security Secret Key check
$SECRET_KEY = "GlobalAwaazMediaSecret2026";
$headers = getallheaders();
$apiKey = isset($headers['X-Api-Key']) ? $headers['X-Api-Key'] : (isset($_SERVER['HTTP_X_API_KEY']) ? $_SERVER['HTTP_X_API_KEY'] : '');

if ($apiKey !== $SECRET_KEY) {
    http_response_code(403);
    echo json_encode(["success" => false, "message" => "Unauthorized API Key"]);
    exit;
}

// 2. Target upload directory
$uploadDir = __DIR__ . '/public/uploads/';
if (!file_exists($uploadDir)) {
    mkdir($uploadDir, 0755, true);
}

if (!isset($_FILES['file'])) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "No file uploaded"]);
    exit;
}

$file = $_FILES['file'];
$filename = basename($file['name']);
$targetFilePath = $uploadDir . $filename;

// Move file to public/uploads/
if (move_uploaded_file($file['tmp_name'], $targetFilePath)) {
    // Generate public HTTP URL
    $protocol = (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on') ? "https" : "http";
    $host = $_SERVER['HTTP_HOST'];
    $publicUrl = "$protocol://$host/public/uploads/$filename";

    http_response_code(200);
    echo json_encode([
        "success" => true,
        "url" => $publicUrl,
        "filename" => $filename
    ]);
} else {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Failed to save file to Hostinger disk"]);
}
