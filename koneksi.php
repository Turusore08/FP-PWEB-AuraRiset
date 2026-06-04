<?php
// --- AURARISET PostgreSQL DATABASE CONNECTION WRAPPER ---

$host = "localhost";
$port = "5433";
$username = "postgres";
$password = "postgres"; // Adjust password to match your local installation if needed
$database = "aurariset_db";

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
