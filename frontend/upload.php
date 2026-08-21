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
$SECRET_KEY = getenv('HOSTINGER_MEDIA_SECRET') ?: "GlobalAwaazMediaSecret2026";
$headers = getallheaders();
$apiKey = isset($headers['X-Api-Key']) ? $headers['X-Api-Key'] : (isset($_SERVER['HTTP_X_API_KEY']) ? $_SERVER['HTTP_X_API_KEY'] : '');

if ($apiKey !== $SECRET_KEY) {
    http_response_code(403);
    echo json_encode(["success" => false, "message" => "Unauthorized API Key"]);
    exit;
}

// 2. Target upload directories
$uploadDir = __DIR__ . '/uploads/';
if (!file_exists($uploadDir)) {
    mkdir($uploadDir, 0755, true);
}
$publicUploadDir = __DIR__ . '/public/uploads/';
if (!file_exists($publicUploadDir)) {
    mkdir($publicUploadDir, 0755, true);
}

if (!isset($_FILES['file'])) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "No file uploaded"]);
    exit;
}

$file = $_FILES['file'];
$rawFilename = basename($file['name']);
$filename = preg_replace('/[^a-zA-Z0-9._-]/', '-', strtolower($rawFilename));
$filename = preg_replace('/-+/', '-', $filename);

$targetFilePath = $uploadDir . $filename;
$targetPublicFilePath = $publicUploadDir . $filename;

// Move file to uploads/ and mirror to public/uploads/
if (move_uploaded_file($file['tmp_name'], $targetFilePath)) {
    @copy($targetFilePath, $targetPublicFilePath);
    
    // Return relative public path so frontend uses its own domain and hides backend host
    $relativeUrl = "/uploads/$filename";

    http_response_code(200);
    echo json_encode([
        "success" => true,
        "url" => $relativeUrl,
        "filename" => $filename
    ]);
} else {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Failed to save file to Hostinger disk"]);
}
