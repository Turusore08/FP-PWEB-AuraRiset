<?php
// --- READ API: RETRIEVE ALL USER SCANS ---
session_start();
require_once '../koneksi.php';

header('Content-Type: application/json');

if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(["status" => "error", "message" => "Sesi habis."]);
    exit;
}

$user_id = $_SESSION['user_id'];

try {
    // Read chats and documents counts from PostgreSQL
    $stmt = $conn->prepare("SELECT id_chat, history_chat FROM chat WHERE user_id = :user_id ORDER BY id_chat DESC");
    $stmt->execute([':user_id' => $user_id]);
    $chats = $stmt->fetchAll();

    // Get count of uploaded documents
    $stmtDoc = $conn->prepare("SELECT COUNT(*) as count FROM dokumen WHERE user_id = :user_id");
    $stmtDoc->execute([':user_id' => $user_id]);
    $docCount = $stmtDoc->fetch()['count'];

    $historyList = [];
    foreach ($chats as $row) {
        $decoded = json_decode($row['history_chat'], true);
        if ($decoded) {
            $historyList[] = [
                "id_chat" => $row['id_chat'],
                "topic" => $decoded['topic'],
                "results" => $decoded['results'],
                "created_at" => $decoded['created_at'] ?? date('Y-m-d H:i:s')
            ];
        }
    }

    echo json_encode([
        "status" => "success",
        "docCount" => (int)$docCount,
        "history" => $historyList
    ]);
    exit;
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => "Gagal mengambil data riwayat: " . $e->getMessage()]);
    exit;
}
?>
