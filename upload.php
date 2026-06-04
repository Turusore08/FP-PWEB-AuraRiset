<?php
// --- AURARISET PDF UPLOADER ENGINE ---
session_start();
require_once 'koneksi.php';

header('Content-Type: application/json');

// Ensure user is authenticated
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
        echo json_encode(["status" => "error", "message" => "Akses ditolak: Dosen tidak diizinkan mengunggah file penelitian."]);
        exit;
    }

    if (!isset($_FILES['file'])) {
        http_response_code(400);
        echo json_encode(["status" => "error", "message" => "Tidak ada file yang diunggah."]);
        exit;
    }

    $file = $_FILES['file'];
    $fileName = $file['name'];
    $fileTmpName = $file['tmp_name'];
    $fileSize = $file['size'];
    $fileError = $file['error'];
    
    // Extract file extension securely
    $fileExt = strtolower(pathinfo($fileName, PATHINFO_EXTENSION));

    // 1. Validate PDF extension and MIME-type
    $allowedExts = ['pdf'];
    if (function_exists('finfo_open')) {
        $finfo = finfo_open(FILEINFO_MIME_TYPE);
        $mimeType = finfo_file($finfo, $fileTmpName);
    } else {
        $mimeType = $file['type']; // Fallback to client-provided MIME type if extension is disabled
    }

    if (!in_match_pdf($fileExt, $mimeType)) {
        http_response_code(400);
        echo json_encode(["status" => "error", "message" => "Hanya file dengan ekstensi PDF yang diperbolehkan!"]);
        exit;
    }

    // 2. Validate error triggers
    if ($fileError !== 0) {
        http_response_code(400);
        echo json_encode(["status" => "error", "message" => "Terjadi kesalahan saat mengunggah file."]);
        exit;
    }

    // 3. Validate file size (10 MB = 10,485,760 bytes)
    $maxSize = 10 * 1024 * 1024;
    if ($fileSize > $maxSize) {
        http_response_code(400);
        echo json_encode(["status" => "error", "message" => "Ukuran file melebihi batas maksimal 10 MB!"]);
        exit;
    }

    // 4. Secure Rename & Move (prevents path traversal / malicious binary execution)
    $secureNewName = uniqid('pdf_', true) . '_' . bin2hex(random_bytes(8)) . '.pdf';
    $uploadDirectory = __DIR__ . '/uploads/';
    $destinationPath = $uploadDirectory . $secureNewName;

    if (move_uploaded_file($fileTmpName, $destinationPath)) {
        try {
            // Save file mapping details inside PostgreSQL dokumen table
            $stmt = $conn->prepare("INSERT INTO dokumen (user_id, isi_dokumen) VALUES (:user_id, :isi_dokumen)");
            // Store the secure filename / path for parsing
            $stmt->execute([
                ':user_id' => $user_id,
                ':isi_dokumen' => 'uploads/' . $secureNewName
            ]);
            
            // Return JSON details for frontend API to proceed with AI Gap scan simulation
            echo json_encode([
                "status" => "success", 
                "message" => "File berhasil diunggah dan disimpan ke database.",
                "fileName" => $fileName,
                "securePath" => 'uploads/' . $secureNewName
            ]);
            exit;
        } catch (PDOException $e) {
            // Delete physical file if DB insertion failed
            if (file_exists($destinationPath)) {
                unlink($destinationPath);
            }
            http_response_code(500);
            echo json_encode(["status" => "error", "message" => "Gagal menyimpan dokumen ke database: " . $e->getMessage()]);
            exit;
        }
    } else {
        http_response_code(500);
        echo json_encode(["status" => "error", "message" => "Gagal memindahkan file ke folder uploads."]);
        exit;
    }
} else {
    http_response_code(405);
    echo json_encode(["status" => "error", "message" => "Metode request tidak diijinkan."]);
}

/**
 * Validate if files are strictly PDFs
 */
function in_match_pdf($ext, $mime) {
    return ($ext === 'pdf' && ($mime === 'application/pdf' || $mime === 'application/x-pdf'));
}
?>
