<?php
// --- AURARISET USER REGISTRATION CONTROLLER ---
require_once 'koneksi.php';

$error_message = "";
$success_message = "";

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $username = trim($_POST['username'] ?? '');
    $email    = trim($_POST['email'] ?? '');
    $password = $_POST['password'] ?? '';
    
    // Server-side validation
    if (empty($username) || empty($email) || empty($password)) {
        $error_message = "Semua input harus diisi!";
    } elseif (strlen($username) < 3 || preg_match('/\s/', $username)) {
        $error_message = "Username tidak valid (min. 3 karakter & tanpa spasi).";
    } elseif (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        $error_message = "Format email tidak valid.";
    } elseif (strlen($password) < 8 || !preg_match('/[A-Za-z]/', $password) || !preg_match('/[0-9]/', $password)) {
        $error_message = "Password harus minimal 8 karakter dan mengandung huruf & angka.";
    } else {
        try {
            // Check if username/email already exists
            $stmt = $conn->prepare("SELECT id FROM users WHERE username = :username OR email = :email");
            $stmt->execute([':username' => $username, ':email' => $email]);
            if ($stmt->fetch()) {
                $error_message = "Username atau Email sudah terdaftar di sistem!";
            } else {
                // Securely hash password
                $hashed_password = password_hash($password, PASSWORD_BCRYPT);
                
                // Get and validate role selection
                $role = trim($_POST['role'] ?? 'mahasiswa');
                if (!in_array($role, ['mahasiswa', 'dosen', 'admin'])) {
                    $role = 'mahasiswa';
                }

                // Insert new researcher record
                $stmt = $conn->prepare("INSERT INTO users (username, email, password, role) VALUES (:username, :email, :password, :role)");
                $stmt->execute([
                    ':username' => $username,
                    ':email' => $email,
                    ':password' => $hashed_password,
                    ':role' => $role
                ]);
                
                $success_message = "Akun peneliti berhasil dibuat! Mengalihkan...";
                
                // Initialize session
                session_start();
                $_SESSION['user_id'] = $conn->lastInsertId();
                $_SESSION['username'] = $username;
                $_SESSION['email'] = $email;
                $_SESSION['role'] = $role;
            }
        } catch (PDOException $e) {
            $error_message = "Gagal mendaftarkan akun: " . $e->getMessage();
        }
    }
}
?>
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>AuraRiset — Registrasi Peneliti Baru</title>
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

      <h2 class="auth-title">Daftar Akun Baru</h2>
      <p class="auth-subtitle">Gabung bersama ribuan peneliti global untuk mempercepat studi literatur</p>

      <form id="register-form" class="auth-form" method="POST" action="register.php" onsubmit="return handleRegisterSubmit(event)">
        <!-- Username Input -->
        <div class="form-group-relative">
          <input type="text" class="auth-input" name="username" placeholder="Username" id="reg-username" required oninput="validateUsername()">
          <i class="fas fa-user input-icon"></i>
          <div class="validation-hint" id="username-hint">Username harus unik tanpa spasi</div>
        </div>

        <!-- Email Input -->
        <div class="form-group-relative">
          <input type="email" class="auth-input" name="email" placeholder="Alamat Email" id="reg-email" required oninput="validateEmail()">
          <i class="fas fa-envelope input-icon"></i>
          <div class="validation-hint" id="email-hint">Gunakan email aktif institusi atau pribadi</div>
        </div>

        <!-- Password Input -->
        <div class="form-group-relative">
          <input type="password" class="auth-input" name="password" placeholder="Kata Sandi Baru" id="reg-password" required oninput="validatePassword()">
          <i class="fas fa-lock input-icon"></i>
          <i class="far fa-eye toggle-password" id="toggle-pwd-icon" onclick="togglePasswordVisibility('reg-password', 'toggle-pwd-icon')"></i>
          <div class="validation-hint" id="pwd-hint">Minimal 8 karakter, kombinasi huruf & angka</div>
        </div>

        <!-- Confirm Password Input -->
        <div class="form-group-relative">
          <input type="password" class="auth-input" placeholder="Konfirmasi Kata Sandi" id="reg-confirm" required oninput="validateConfirmPassword()">
          <i class="fas fa-shield-alt input-icon"></i>
          <i class="far fa-eye toggle-password" id="toggle-confirm-icon" onclick="togglePasswordVisibility('reg-confirm', 'toggle-confirm-icon')"></i>
          <div class="validation-hint" id="confirm-hint">Ulangi kata sandi di atas dengan persis</div>
        </div>

        <!-- Role Access Selection Input -->
        <div class="form-group-relative">
          <select class="auth-input" name="role" id="reg-role" style="background: rgba(255, 255, 255, 0.05); color: #fff; border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 8px; width: 100%; padding: 0.75rem 1rem 0.75rem 2.5rem; outline: none; height: 50px;">
            <option value="mahasiswa" style="background: #151821; color: #fff;">Mahasiswa (Peneliti)</option>
            <option value="dosen" style="background: #151821; color: #fff;">Dosen (Reviewer)</option>
            <option value="admin" style="background: #151821; color: #fff;">Admin (Administrator)</option>
          </select>
          <i class="fas fa-user-tag input-icon" style="position: absolute; left: 1rem; top: 50%; transform: translateY(-50%); color: var(--color-gold); font-size: 1rem;"></i>
        </div>

        <button type="submit" class="btn-cta" style="width: 100%; justify-content: center; padding: 1rem; margin-top: 0.75rem;">
          Daftarkan Akun
          <i class="fas fa-user-plus"></i>
        </button>
      </form>

      <p class="auth-footer-text">
        Sudah memiliki akun? <a href="login.php">Masuk di sini</a>
      </p>
    </div>
  </div>

  <script type="module" src="assets/js/app.js"></script>
  <script>
    let isUserValid = false;
    let isEmailValid = false;
    let isPwdValid = false;
    let isConfirmValid = false;

    // Display PHP responses reactively inside client UI
    window.addEventListener('DOMContentLoaded', () => {
      const err = "<?php echo addslashes($error_message); ?>";
      const succ = "<?php echo addslashes($success_message); ?>";
      if (err) showToast('Error', err, 'error');
      if (succ) {
        showToast('Registrasi Berhasil', succ, 'success');
        setTimeout(() => { window.location.href = 'dashboard.php'; }, 1500);
      }
    });

    function togglePasswordVisibility(inputId, iconId) {
      const pwdInput = document.getElementById(inputId);
      const icon = document.getElementById(iconId);
      if (pwdInput.type === 'password') {
        pwdInput.type = 'text';
        icon.className = 'far fa-eye-slash toggle-password';
      } else {
        pwdInput.type = 'password';
        icon.className = 'far fa-eye toggle-password';
      }
    }

    function validateUsername() {
      const input = document.getElementById('reg-username');
      const hint = document.getElementById('username-hint');
      const val = input.value.trim();

      if (val.length < 3) {
        input.className = "auth-input is-invalid";
        hint.textContent = "Username terlalu pendek (minimal 3 karakter).";
        hint.className = "validation-hint invalid";
        isUserValid = false;
      } else if (/\s/.test(val)) {
        input.className = "auth-input is-invalid";
        hint.textContent = "Username tidak boleh mengandung spasi.";
        hint.className = "validation-hint invalid";
        isUserValid = false;
      } else {
        input.className = "auth-input is-valid";
        hint.textContent = "Username valid.";
        hint.className = "validation-hint valid";
        isUserValid = true;
      }
    }

    function validateEmail() {
      const input = document.getElementById('reg-email');
      const hint = document.getElementById('email-hint');
      const val = input.value.trim();
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (!emailRegex.test(val)) {
        input.className = "auth-input is-invalid";
        hint.textContent = "Format alamat email tidak valid.";
        hint.className = "validation-hint invalid";
        isEmailValid = false;
      } else {
        input.className = "auth-input is-valid";
        hint.textContent = "Email valid.";
        hint.className = "validation-hint valid";
        isEmailValid = true;
      }
    }

    function validatePassword() {
      const input = document.getElementById('reg-password');
      const hint = document.getElementById('pwd-hint');
      const val = input.value;

      const hasLetter = /[a-zA-Z]/.test(val);
      const hasNumber = /[0-9]/.test(val);

      if (val.length < 8) {
        input.className = "auth-input is-invalid";
        hint.textContent = "Sandi terlalu pendek (minimal 8 karakter).";
        hint.className = "validation-hint invalid";
        isPwdValid = false;
      } else if (!hasLetter || !hasNumber) {
        input.className = "auth-input is-invalid";
        hint.textContent = "Sandi harus mengombinasikan huruf dan angka.";
        hint.className = "validation-hint invalid";
        isPwdValid = false;
      } else {
        input.className = "auth-input is-valid";
        hint.textContent = "Kata sandi kuat.";
        hint.className = "validation-hint valid";
        isPwdValid = true;
      }
      validateConfirmPassword();
    }

    function validateConfirmPassword() {
      const input = document.getElementById('reg-confirm');
      const pwd = document.getElementById('reg-password').value;
      const hint = document.getElementById('confirm-hint');
      const val = input.value;

      if (val === '') {
        input.className = "auth-input";
        hint.textContent = "Ulangi kata sandi di atas dengan persis";
        hint.className = "validation-hint";
        isConfirmValid = false;
      } else if (val !== pwd) {
        input.className = "auth-input is-invalid";
        hint.textContent = "Konfirmasi kata sandi tidak cocok.";
        hint.className = "validation-hint invalid";
        isConfirmValid = false;
      } else {
        input.className = "auth-input is-valid";
        hint.textContent = "Kata sandi cocok.";
        hint.className = "validation-hint valid";
        isConfirmValid = true;
      }
    }

    function handleRegisterSubmit(event) {
      validateUsername();
      validateEmail();
      validatePassword();
      validateConfirmPassword();

      if (!isUserValid || !isEmailValid || !isPwdValid || !isConfirmValid) {
        event.preventDefault();
        showToast('Error', 'Harap periksa validasi form pendaftaran!', 'error');
        return false;
      }
      return true;
    }
  </script>
</body>
</html>
