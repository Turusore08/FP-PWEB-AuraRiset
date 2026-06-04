<?php
// --- AURARISET USER LOGIN CONTROLLER ---
require_once 'koneksi.php';

$error_message = "";
$success_message = "";

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $username_or_email = trim($_POST['username_or_email'] ?? '');
    $password = $_POST['password'] ?? '';

    if (empty($username_or_email) || empty($password)) {
        $error_message = "Harap masukkan username/email dan password!";
    } else {
        try {
            // Find user in users table by username OR email
            $stmt = $conn->prepare("SELECT * FROM users WHERE username = :query OR email = :query");
            $stmt->execute([':query' => $username_or_email]);
            $user = $stmt->fetch();

            if ($user && password_verify($password, $user['password'])) {
                // Initialize session
                session_start();
                $_SESSION['user_id'] = $user['id'];
                $_SESSION['username'] = $user['username'];
                $_SESSION['email'] = $user['email'];
                $_SESSION['role'] = $user['role'];

                $success_message = "Kredensial valid. Mengalihkan ke dashboard...";
            } else {
                $error_message = "Username/Email atau Password Anda salah!";
            }
        } catch (PDOException $e) {
            $error_message = "Gagal memproses login: " . $e->getMessage();
        }
    }
}
?>
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>AuraRiset — Secure Login</title>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
  <link rel="stylesheet" href="assets/css/style.css">
</head>
<body>

  <!-- Background Orbs and Particles -->
  <div class="aurora-bg">
    <div class="aurora-orb orb-gold"></div>
    <div class="aurora-orb orb-navy"></div>
  </div>
  <canvas id="canvas-particles"></canvas>

  <div class="auth-container">
    <div class="auth-card">
      <a href="index.html" class="auth-logo">
        <div class="logo-icon-container">
          <div class="logo-halo"></div>
          <i class="fas fa-book-open logo-book"></i>
        </div>
        <span>AuraRiset</span>
      </a>

      <h2 class="auth-title">Selamat Datang Kembali</h2>
      <p class="auth-subtitle">Masukkan kredensial Anda untuk masuk ke sistem analisis gap riset</p>

      <form id="login-form" class="auth-form" method="POST" action="login.php" onsubmit="return handleLoginSubmit(event)">
        <div class="form-group-relative">
          <input type="text" class="auth-input" name="username_or_email" placeholder="Username atau Email" id="login-username" required>
          <i class="fas fa-user input-icon"></i>
        </div>

        <div class="form-group-relative">
          <input type="password" class="auth-input" name="password" placeholder="Kata Sandi" id="login-password" required>
          <i class="fas fa-lock input-icon"></i>
          <i class="far fa-eye toggle-password" id="toggle-pwd-icon" onclick="togglePasswordVisibility()"></i>
        </div>

        <div class="auth-helpers">
          <label class="remember-me">
            <input type="checkbox" id="remember-check">
            Ingat Sesi Saya
          </label>
          <a href="#" class="forgot-link" onclick="handleForgotPassword(event)">Lupa Kata Sandi?</a>
        </div>

        <button type="submit" class="btn-cta" style="width: 100%; justify-content: center; padding: 1rem; margin-top: 0.75rem;">
          Masuk Sekarang
          <i class="fas fa-sign-in-alt"></i>
        </button>
      </form>

      <p class="auth-footer-text">
        Belum memiliki akun? <a href="register.php">Daftar Peneliti Baru</a>
      </p>
    </div>
  </div>

  <script type="module" src="assets/js/app.js"></script>
  <script>
    window.addEventListener('DOMContentLoaded', () => {
      const err = "<?php echo addslashes($error_message); ?>";
      const succ = "<?php echo addslashes($success_message); ?>";
      if (err) showToast('Error', err, 'error');
      if (succ) {
        showToast('Sukses', succ, 'success');
        setTimeout(() => { window.location.href = 'dashboard.php'; }, 1200);
      }
    });

    function togglePasswordVisibility() {
      const pwdInput = document.getElementById('login-password');
      const icon = document.getElementById('toggle-pwd-icon');
      if (pwdInput.type === 'password') {
        pwdInput.type = 'text';
        icon.className = 'far fa-eye-slash toggle-password';
      } else {
        pwdInput.type = 'password';
        icon.className = 'far fa-eye toggle-password';
      }
    }

    function handleLoginSubmit(event) {
      const user = document.getElementById('login-username').value.trim();
      const pass = document.getElementById('login-password').value;

      if (user === '' || pass === '') {
        event.preventDefault();
        showToast('Error', 'Input tidak boleh kosong!', 'error');
        return false;
      }
      return true;
    }

    function handleForgotPassword(event) {
      event.preventDefault();
      const user = document.getElementById('login-username').value.trim();
      if (!user) {
        showToast('Info', 'Masukkan username/email terlebih dahulu untuk reset password.', 'info');
      } else {
        showToast('Link Terkirim', `Tautan reset kata sandi telah dikirim ke: ${user}`, 'success');
      }
    }
  </script>
</body>
</html>
