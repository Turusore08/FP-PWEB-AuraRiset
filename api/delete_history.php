<?php
// --- DELETE API: REMOVE PAST RESEARCH ENTRY ---
session_start();
require_once '../koneksi.php';

header('Content-Type: application/json');

if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(["status" => "error", "message" => "Sesi habis."]);
    exit;
}

$user_id = $_SESSION['user_id'];

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    $id_chat = $data['id_chat'] ?? null;

    if (!$id_chat) {
        http_response_code(400);
        echo json_encode(["status" => "error", "message" => "Parameter ID chat tidak valid."]);
        exit;
    }

    $role = $_SESSION['role'] ?? 'mahasiswa';
    if ($role === 'dosen') {
        http_response_code(403);
        echo json_encode(["status" => "error", "message" => "Akses ditolak: Dosen tidak diizinkan menghapus data riset."]);
        exit;
    }

    try {
        if ($role === 'admin') {
            // Admin can delete any chat
            $stmt = $conn->prepare("DELETE FROM chat WHERE id_chat = :id_chat");
            $stmt->execute([':id_chat' => $id_chat]);
        } else {
            // Mahasiswa can delete only their own
            $stmt = $conn->prepare("DELETE FROM chat WHERE id_chat = :id_chat AND user_id = :user_id");
            $stmt->execute([
                ':id_chat' => $id_chat,
                ':user_id' => $user_id
            ]);
        }

        if ($stmt->rowCount() > 0) {
            echo json_encode(["status" => "success", "message" => "Riwayat riset berhasil dihapus dari database."]);
        } else {
            http_response_code(404);
            echo json_encode(["status" => "error", "message" => "Data tidak ditemukan atau Anda tidak memiliki akses."]);
        }
        exit;
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(["status" => "error", "message" => "Gagal menghapus data: " . $e->getMessage()]);
        exit;
    }
} else {
    http_response_code(405);
    echo json_encode(["status" => "error", "message" => "Metode request tidak diijinkan."]);
}
?>
