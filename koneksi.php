<?php
// --- AURARISET PostgreSQL DATABASE CONNECTION WRAPPER ---

// Load configurations from .env if available
function load_env() {
    $envPath = __DIR__ . '/.env';
    if (file_exists($envPath)) {
        $lines = file($envPath, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
        foreach ($lines as $line) {
            $line = trim($line);
            if (empty($line) || strpos($line, '#') === 0) continue;
            if (strpos($line, '=') !== false) {
                list($name, $value) = explode('=', $line, 2);
                putenv(trim($name) . '=' . trim($value));
            }
        }
    }
}
load_env();

$host = getenv('DB_HOST') ?: "localhost";
$port = getenv('DB_PORT') ?: "5433";
$username = getenv('DB_USER') ?: "postgres";
$password = getenv('DB_PASS') ?: "postgres";
$database = getenv('DB_NAME') ?: "aurariset_db";

try {
    // Create connection to PostgreSQL server
    $conn = new PDO("pgsql:host=$host;port=$port;dbname=$database", $username, $password);
    
    // Enable exceptions on query error for professional debugging
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $conn->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
} catch (PDOException $e) {
    // Fail gracefully with a JSON format error or die in development
    header('HTTP/1.1 500 Internal Server Error');
    die("Koneksi PostgreSQL Gagal: " . $e->getMessage());
}
?>
