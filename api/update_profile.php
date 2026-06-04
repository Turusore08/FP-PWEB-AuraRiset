<?php
// --- UPDATE API: UPDATE USER PROFILE DETAILS ---
session_start();
require_once '../koneksi.php';

if (!isset($_SESSION['user_id'])) {
    header("Location: ../login.php");
    exit;
}

$user_id = $_SESSION['user_id'];

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $username = trim($_POST['username'] ?? '');
    $email    = trim($_POST['email'] ?? '');

    if (empty($username) || empty($email)) {
        header("Location: ../dashboard.php?error=empty_fields");
        exit;
    }

    try {
        // Verify unique username/email excluding current user
        $stmt = $conn->prepare("SELECT id FROM users WHERE (username = :username OR email = :email) AND id != :user_id");
        $stmt->execute([
            ':username' => $username,
            ':email' => $email,
            ':user_id' => $user_id
        ]);

        if ($stmt->fetch()) {
            header("Location: ../dashboard.php?error=duplicate_credentials");
            exit;
        }

        // Update database record
        $stmt = $conn->prepare("UPDATE users SET username = :username, email = :email WHERE id = :user_id");
        $stmt->execute([
            ':username' => $username,
            ':email' => $email,
            ':user_id' => $user_id
        ]);

        // Sync local session states
        $_SESSION['username'] = $username;
        $_SESSION['email'] = $email;

        // Redirect to dashboard with success status
        header("Location: ../dashboard.php?status=profile_updated");
        exit;
    } catch (PDOException $e) {
        header("Location: ../dashboard.php?error=" . urlencode($e->getMessage()));
        exit;
    }
} else {
    header("Location: ../dashboard.php");
    exit;
}
?>
