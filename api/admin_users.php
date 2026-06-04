<?php
// --- ADMIN ONLY API: MANAGE USERS ---
session_start();
require_once '../koneksi.php';

header('Content-Type: application/json');

// Strict Admin Gate
if (!isset($_SESSION['user_id']) || ($_SESSION['role'] ?? '') !== 'admin') {
    http_response_code(403);
    echo json_encode(["status" => "error", "message" => "Akses Ditolak: Anda bukan administrator."]);
    exit;
}

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    try {
        // Fetch all users except the current admin
        $stmt = $conn->prepare("SELECT id, username, email, role, created_at FROM users WHERE id != :admin_id ORDER BY id ASC");
        $stmt->execute([':admin_id' => $_SESSION['user_id']]);
        $users = $stmt->fetchAll();

        echo json_encode([
            "status" => "success",
            "users" => $users
        ]);
        exit;
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(["status" => "error", "message" => "Gagal mengambil data user: " . $e->getMessage()]);
        exit;
    }
} elseif ($method === 'POST') {
    // Process JSON input
    $data = json_decode(file_get_contents('php://input'), true);
    $action = $data['action'] ?? '';
    $target_id = $data['user_id'] ?? null;

    if (!$target_id) {
        http_response_code(400);
        echo json_encode(["status" => "error", "message" => "Parameter ID user tidak valid."]);
        exit;
    }

    if ($action === 'update_role') {
        $new_role = $data['role'] ?? '';
        if (!in_array($new_role, ['mahasiswa', 'dosen', 'admin'])) {
            http_response_code(400);
            echo json_encode(["status" => "error", "message" => "Role tidak valid."]);
            exit;
        }

        try {
            $stmt = $conn->prepare("UPDATE users SET role = :role WHERE id = :id");
            $stmt->execute([
                ':role' => $new_role,
                ':id' => $target_id
            ]);

            echo json_encode(["status" => "success", "message" => "Role user berhasil diperbarui."]);
            exit;
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(["status" => "error", "message" => "Gagal memperbarui role: " . $e->getMessage()]);
            exit;
        }
    } elseif ($action === 'delete_user') {
        try {
            // Delete user from DB. Cascading will handle related chat & dokumen entries if database ON DELETE CASCADE is set
            $stmt = $conn->prepare("DELETE FROM users WHERE id = :id");
            $stmt->execute([':id' => $target_id]);

            echo json_encode(["status" => "success", "message" => "User berhasil dihapus dari sistem."]);
            exit;
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(["status" => "error", "message" => "Gagal menghapus user: " . $e->getMessage()]);
            exit;
        }
    } else {
        http_response_code(400);
        echo json_encode(["status" => "error", "message" => "Aksi tidak dikenali."]);
        exit;
    }
} else {
    http_response_code(405);
    echo json_encode(["status" => "error", "message" => "Metode request tidak diijinkan."]);
    exit;
}
?>
