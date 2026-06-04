<?php
// --- AURARISET SECURE RESEARCHER DASHBOARD PANEL ---
session_start();

// Strict session check
if (!isset($_SESSION['user_id'])) {
    header("Location: login.php");
    exit;
}

$user_id = $_SESSION['user_id'];
$username = htmlspecialchars($_SESSION['username']);
$email = htmlspecialchars($_SESSION['email']);
?>
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>AuraRiset — Automated Research Gap Analysis Dashboard</title>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
  <link rel="stylesheet" href="assets/css/style.css">
  <script>
    window.USER_SESSION = {
      username: <?php echo json_encode($_SESSION['username']); ?>,
      email: <?php echo json_encode($_SESSION['email']); ?>
    };
  </script>
</head>
<body>

  <!-- Background Orbs and Particles -->
  <div class="aurora-bg">
    <div class="aurora-orb orb-gold"></div>
    <div class="aurora-orb orb-navy"></div>
  </div>
  <canvas id="canvas-particles"></canvas>

  <div class="app-container">

    <!-- 1. SIDEBAR NAVIGATION -->
    <aside class="sidebar">
      <a href="index.html" class="sidebar-logo" id="logo-branding">
        <div class="logo-icon-container">
          <div class="logo-halo"></div>
          <i class="fas fa-book-open logo-book"></i>
        </div>
        <span>AuraRiset</span>
      </a>

      <nav class="sidebar-menu">
        <li class="sidebar-menu-item">
          <button class="sidebar-menu-btn active" data-view="dashboard" id="nav-btn-dashboard">
            <i class="fas fa-chart-pie"></i>
            Dashboard
          </button>
        </li>
        <li class="sidebar-menu-item">
          <button class="sidebar-menu-btn" data-view="research" id="nav-btn-research">
            <i class="fas fa-vial"></i>
            Mulai Penelitian
          </button>
        </li>
        <li class="sidebar-menu-item">
          <button class="sidebar-menu-btn" data-view="history" id="nav-btn-history">
            <i class="fas fa-history"></i>
            Histori
          </button>
        </li>
        <li class="sidebar-menu-item">
          <button class="sidebar-menu-btn" data-view="settings" id="nav-btn-settings">
            <i class="fas fa-user-cog"></i>
            Pengaturan Akun
          </button>
        </li>
      </nav>

      <div class="sidebar-footer">
        <button class="sidebar-menu-btn" data-view="logout" id="nav-btn-logout">
          <i class="fas fa-sign-out-alt"></i>
          Logout
        </button>
      </div>
    </aside>

    <!-- 2. MAIN CONTENT WRAPPER -->
    <main class="main-content">

      <!-- HEADER AREA (COMMON FOR ALL VIEWS) -->
      <header class="main-header">
        <div class="header-title-area">
          <h1 id="view-title">Dashboard</h1>
          <p id="view-subtitle">Kelola studi literatur dan temukan celah riset Anda secara instan</p>
        </div>

        <div class="header-controls">
          <div class="search-bar-container">
            <i class="fas fa-search"></i>
            <input type="text" class="search-input" placeholder="Cari analisis atau paper..." id="search-dashboard-table">
          </div>

          <!-- User Profile Dropdown -->
          <div class="profile-dropdown" id="profile-dropdown">
            <div class="profile-trigger" id="profile-trigger">
              <div class="profile-avatar"><?php echo strtoupper(substr($username, 0, 1)); ?></div>
              <span class="profile-name"><?php echo $username; ?></span>
              <i class="fas fa-chevron-down"></i>
            </div>
            <div class="dropdown-menu">
              <div class="dropdown-header">
                <div class="dropdown-header-name"><?php echo $username; ?></div>
                <div class="dropdown-header-email"><?php echo $email; ?></div>
              </div>
              <a href="#" class="dropdown-link" onclick="document.getElementById('nav-btn-settings').click(); return false;">
                <i class="fas fa-user-circle"></i> Profil Saya
              </a>
              <a href="#" class="dropdown-link" onclick="document.getElementById('nav-btn-settings').click(); return false;">
                <i class="fas fa-cog"></i> Pengaturan
              </a>
              <hr style="border: 0; border-top: 1px solid rgba(255,255,255,0.05); margin: 0.5rem 0;">
              <a href="logout.php" class="dropdown-link" style="color: #ef4444;">
                <i class="fas fa-sign-out-alt"></i> Logout
              </a>
            </div>
          </div>
        </div>
      </header>

      <!-- ==================== VIEW 1: DASHBOARD HUB ==================== -->
      <div id="dashboard-view" class="view-section active">

        <!-- A. STATISTICAL PANEL -->
        <div class="stats-container">
          <!-- Total Penelitian Card -->
          <div class="stat-card stagger-row" id="stat-card-total">
            <div class="stat-header">
              <span class="stat-title">Total Penelitian</span>
              <div class="stat-icon"><i class="fas fa-archive"></i></div>
            </div>
            <div class="stat-value" id="count-total">0</div>
            <div class="stat-chart-container">
              <svg class="sparkline-svg" viewBox="0 0 100 30">
                <path class="sparkline-glow" d="M0,25 Q15,10 30,22 T60,5 T90,20 T100,8" />
                <path class="sparkline-path" d="M0,25 Q15,10 30,22 T60,5 T90,20 T100,8" />
              </svg>
            </div>
          </div>

          <!-- Paper Dianalisis Card -->
          <div class="stat-card stagger-row" id="stat-card-papers">
            <div class="stat-header">
              <span class="stat-title">Paper Dianalisis</span>
              <div class="stat-icon"><i class="fas fa-file-alt"></i></div>
            </div>
            <div class="stat-value" id="count-paper">0</div>
            <!-- 3D paper stack icon -->
            <div class="paper-stack-visual">
              <div class="paper-layer"></div>
              <div class="paper-layer"></div>
              <div class="paper-layer"></div>
            </div>
          </div>

          <!-- Analisis Gap Terbaru Card -->
          <div class="stat-card stagger-row" id="stat-card-gaps">
            <div class="stat-header">
              <span class="stat-title">Analisis Gap Terbaru</span>
              <div class="stat-icon"><i class="fas fa-vector-square"></i></div>
            </div>
            <div class="stat-value" id="count-gap">0</div>
            <div class="stat-chart-container">
              <svg class="sparkline-svg" viewBox="0 0 100 30">
                <path class="sparkline-path sparkline-path-blue" d="M0,28 L15,22 L35,15 L50,18 L65,10 L85,8 L100,2" />
              </svg>
            </div>
          </div>
        </div>

        <!-- B. CENTRAL INTERACTIVE PANEL -->
        <div class="middle-grid">
          <!-- Mulai Penelitian Card -->
          <div class="premium-card stagger-row" id="research-main-card">
            <div class="card-title-container">
              <h2 class="card-title">
                <i class="fas fa-compass"></i>
                Mulai Penelitian Baru
              </h2>
            </div>
            <p class="card-desc">
              Masukkan topik riset spesifik Anda untuk mengekstrak bibliografi, atau unggah draf paper PDF Anda untuk menemukan celah kebaruan (research gap) secara otomatis.
            </p>
            
            <div class="search-action-container">
              <div class="topic-input-wrapper">
                <i class="fas fa-search-plus"></i>
                <input type="text" class="topic-input" placeholder="Masukkan topik atau unggah PDF di bawah..." id="topic-input">
              </div>
              <button class="btn-cta" id="btn-start-analysis">
                Mulai Analisis
                <i class="fas fa-arrow-right"></i>
              </button>
            </div>

            <!-- Upload PDF Area -->
            <div class="drag-drop-zone" id="drag-drop-zone">
              <i class="fas fa-cloud-upload-alt upload-icon"></i>
              <div class="upload-title">Tarik & Lepaskan File PDF</div>
              <div class="upload-subtitle">atau klik untuk menelusuri folder komputer (Maksimal 10 MB)</div>
              <input type="file" id="file-input" class="file-input" accept="application/pdf">
            </div>

            <!-- Upload progress visual -->
            <div class="upload-progress-container" id="upload-progress-container">
              <div class="progress-header">
                <span class="progress-file-name" id="progress-file-name">file_penelitian.pdf</span>
                <span class="progress-percent" id="progress-percent">0%</span>
              </div>
              <div class="progress-bar-bg">
                <div class="progress-bar-fill" id="progress-bar-fill"></div>
              </div>
            </div>
          </div>

          <!-- Histori Terbaru Table -->
          <div class="premium-card stagger-row" id="history-recent-card">
            <div class="card-title-container">
              <h2 class="card-title">
                <i class="fas fa-history"></i>
                Histori Terbaru
              </h2>
            </div>
            
            <div class="table-container">
              <table class="recent-table">
                <thead>
                  <tr>
                    <th>Judul Riset</th>
                    <th>Tanggal</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  <!-- Filled dynamically on boot by retrieveHistory API -->
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- C. TABEL PERBANDINGAN PAPER (BOTTOM) -->
        <div class="premium-card stagger-row" id="comparison-wide-card">
          <div class="card-title-container">
            <h2 class="card-title">
              <i class="fas fa-columns"></i>
              Tabel Perbandingan Paper
            </h2>
          </div>
          
          <div class="bottom-table-container">
            <table class="comparison-table">
              <thead>
                <tr>
                  <th>Tahun</th>
                  <th>Metode</th>
                  <th>Gap Ditemukan</th>
                  <th>OpenAI Integrated Summary</th>
                </tr>
              </thead>
              <tbody>
                <!-- Populated dynamically based on selected research query -->
                <tr class="stagger-row">
                  <td colspan="4" style="text-align: center; color: var(--color-text-muted);">Masukkan tema penelitian di atas untuk memulai pemetaan gap riset...</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

      </div>

      <!-- ==================== VIEW 2: MULAI PENELITIAN VIEW ==================== -->
      <div id="research-view" class="view-section">
        <div class="premium-card section-full-width">
          <div class="card-title-container">
            <h2 class="card-title"><i class="fas fa-paper-plane"></i> Form Parameter Analisis Riset</h2>
          </div>
          <p class="card-desc">Konfigurasikan kedalaman studi pustaka dan batasan paper yang akan diproses oleh AI.</p>

          <form id="detailed-research-form" onsubmit="event.preventDefault(); document.getElementById('btn-start-analysis').click();">
            <div style="display: flex; flex-direction: column; gap: 1.5rem;">
              <div class="input-group">
                <label class="input-label">Tema Utama / Judul Penelitian</label>
                <input type="text" class="form-input" placeholder="Masukkan hipotesis atau tema penelitian..." required id="form-topic-input" oninput="document.getElementById('topic-input').value = this.value">
              </div>

              <div class="config-container">
                <div class="input-group">
                  <label class="input-label">Metode Pencarian</label>
                  <select class="select-custom">
                    <option value="sota">State of the Art (SOTA) Gap Analysis</option>
                    <option value="methodology">Methodological Flaws & Scope</option>
                    <option value="chronological">Chronological Literature Mapping</option>
                  </select>
                </div>
                <div class="input-group">
                  <label class="input-label">Jumlah Paper yang Dianalisis</label>
                  <select class="select-custom">
                    <option value="5">5 Paper Teratas</option>
                    <option value="10">10 Paper Teratas</option>
                    <option value="20">20 Paper Teratas (Deep Scan)</option>
                  </select>
                </div>
              </div>

              <div class="config-container">
                <div class="input-group">
                  <label class="input-label">Rentang Tahun Publikasi</label>
                  <select class="select-custom">
                    <option value="3">3 Tahun Terakhir (2023 - 2026)</option>
                    <option value="5">5 Tahun Terakhir (2021 - 2026)</option>
                    <option value="10">10 Tahun Terakhir (2016 - 2026)</option>
                  </select>
                </div>
                <div class="input-group">
                  <label class="input-label">Integrasi Mesin AI</label>
                  <select class="select-custom">
                    <option value="gpt-4o">OpenAI GPT-4o (Synthesizer Cerdas)</option>
                    <option value="claude-3-5">Claude 3.5 Sonnet (Kontekstual Pustaka)</option>
                  </select>
                </div>
              </div>

              <div style="margin-top: 1rem;">
                <button type="submit" class="btn-cta" style="width: 100%; justify-content: center; padding: 1.1rem;">
                  <i class="fas fa-microscope"></i> Jalankan Ekstraksi AI & Framework Gap
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>

      <!-- ==================== VIEW 3: HISTORY VIEW ==================== -->
      <div id="history-view" class="view-section">
        <div class="history-filter-bar">
          <div class="history-filters">
            <button class="filter-btn active">Semua Analisis</button>
            <button class="filter-btn">Selesai</button>
            <button class="filter-btn">Draf</button>
          </div>
          <span style="font-size: 0.85rem; color: var(--color-text-muted);" id="history-count-text">Menampilkan total 0 riwayat penelitian</span>
        </div>

        <div class="history-card-grid">
          <!-- Loaded dynamically from PostgreSQL DB by api/get_research.php -->
        </div>
      </div>

      <!-- ==================== VIEW 4: SETTINGS VIEW ==================== -->
      <div id="settings-view" class="view-section">
        <div class="settings-grid">
          
          <!-- Avatar Panel -->
          <div class="settings-profile-card">
            <div class="settings-avatar-container">
              <div class="settings-avatar-big"><?php echo strtoupper(substr($username, 0, 1)); ?></div>
              <button class="btn-avatar-edit" title="Unggah Foto"><i class="fas fa-camera"></i></button>
            </div>
            <div class="settings-profile-info">
              <h3><?php echo $username; ?></h3>
              <p>Institusi AuraRiset Global</p>
              <span class="profile-role-badge">Peneliti Utama</span>
            </div>
          </div>

          <!-- Config Form -->
          <div class="premium-card">
            <div class="card-title-container">
              <h2 class="card-title"><i class="fas fa-sliders-h"></i> Informasi Pengguna</h2>
            </div>
            <form id="settings-profile-form" class="settings-form-card" method="POST" action="api/update_profile.php">
              <div class="input-group">
                <label class="input-label">Username Peneliti</label>
                <input type="text" class="form-input" id="set-username" name="username" value="<?php echo $username; ?>" required>
              </div>
              
              <div class="input-group">
                <label class="input-label">Alamat Email</label>
                <input type="email" class="form-input" id="set-email" name="email" value="<?php echo $email; ?>" required>
              </div>

              <div class="input-group">
                <label class="input-label">Institusi</label>
                <input type="text" class="form-input" value="Universitas Pembangunan Web FP" readonly style="opacity: 0.7; cursor: not-allowed;">
              </div>

              <div class="form-actions">
                <button type="button" class="btn-secondary" onclick="window.location.reload();">Reset</button>
                <button type="submit" class="btn-cta">Simpan Perubahan</button>
              </div>
            </form>
          </div>

        </div>
      </div>

    </main>
  </div>

  <!-- 3. REAL-TIME AI SCANNING OVERLAY MODAL -->
  <div class="analysis-overlay" id="analysis-overlay">
    <div class="analyzer-card">
      <div class="scanner-container">
        <div class="scan-ring"></div>
        <div class="scan-pulse"></div>
        <i class="fas fa-brain scan-icon"></i>
      </div>
      
      <h3 class="analysis-status-title">Analisis OpenAI Sedang Berlangsung</h3>
      <p class="analysis-step-desc" id="analysis-step-desc">Menginisiasi analisis kesenjangan pustaka...</p>

      <div class="scanner-progress-bar">
        <div class="scanner-progress-fill" id="scanner-progress-fill"></div>
      </div>

      <div class="status-log-console" id="console-logs">
        <!-- Log messages output dynamically -->
      </div>
    </div>
  </div>

  <!-- JavaScript Modules -->
  <script type="module" src="assets/js/app.js"></script>
</body>
</html>
