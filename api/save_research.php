<?php
// --- CREATE API: SAVE NEW GAP ANALYSIS RECORD ---
session_start();
require_once '../koneksi.php';

header('Content-Type: application/json');

if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(["status" => "error", "message" => "Sesi habis. Silakan login kembali."]);
    exit;
}

$user_id = $_SESSION['user_id'];

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $role = $_SESSION['role'] ?? 'mahasiswa';
    if ($role === 'dosen') {
        http_response_code(403);
        echo json_encode(["status" => "error", "message" => "Akses ditolak: Dosen hanya memiliki hak baca (Read-only)."]);
        exit;
    }

    // Get JSON payload
    $data = json_decode(file_get_contents('php://input'), true);

    $topic = trim($data['topic'] ?? '');
    $results = $data['results'] ?? null;

    if (empty($topic) || empty($results)) {
        http_response_code(400);
        echo json_encode(["status" => "error", "message" => "Data topic dan hasil komparasi harus lengkap!"]);
        exit;
    }

    try {
        // We pack topic + results into JSON and save to PostgreSQL `chat` table as "history_chat"
        $packedData = json_encode([
            "topic" => $topic,
            "results" => $results,
            "created_at" => date('Y-m-d H:i:s')
        ]);

        $stmt = $conn->prepare("INSERT INTO chat (user_id, history_chat) VALUES (:user_id, :history_chat)");
        $stmt->execute([
            ':user_id' => $user_id,
            ':history_chat' => $packedData
        ]);

        echo json_encode([
            "status" => "success",
            "message" => "Riwayat riset berhasil disimpan ke PostgreSQL.",
            "id_chat" => $conn->lastInsertId()
        ]);
        exit;
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(["status" => "error", "message" => "Gagal menulis riwayat ke database: " . $e->getMessage()]);
        exit;
    }
} else {
    http_response_code(405);
    echo json_encode(["status" => "error", "message" => "Metode request tidak diijinkan."]);
}
?>
