# Walkthrough — Secure PHP PostgreSQL Dynamic Integration

This walkthrough documents the full integration of the **AuraRiset** platform's dynamic PHP backend, connecting its modern ES6 JavaScript frontend directly to a PostgreSQL database for session-based user authentication, SOTA gap analysis records, and secure PDF file uploads.

---

## Key Achievements

### 1. Unified Session Injection & Store Sync
* **The Bridge:** Added a script block in `dashboard.php` that translates the authenticated PHP session values (`$_SESSION['username']` and `$_SESSION['email']`) into a global `window.USER_SESSION` object.
* **Store Initialization:** Updated `assets/js/core/store.js` to prioritize `window.USER_SESSION` values over stale `localStorage` records. This resolves data mismatch bugs when switching users or editing credentials.

### 2. Live AJAX PDF Uploader with Progress Tracking
* **Native XHR:** Replaced the simulated upload intervals in `assets/js/modules/research.js` with a robust `XMLHttpRequest` upload pipeline.
* **Progress Tracking:** Tied `xhr.upload.onprogress` directly to the dashboard's circular and line progress bars, providing real-time upload speed and completion percentages.
* **Physical to DB Mapping:** Successful uploads are stored securely inside the `/uploads` directory under randomized hashed filenames (to prevent file execution / path traversals), and their paths are registered under the active `user_id` inside the `dokumen` table.

### 3. Dynamic SOTA Scan CRUD Integration
* **Write (Create):** Completing SOTA scanner step simulations triggers a background POST fetch to `api/save_research.php`.
* **Read:** On page load, `Research.loadHistory()` performs a fetch request to `api/get_research.php` to retrieve all scans and uploaded files from the database. It:
  * Animates the statistical panels ("Total Penelitian", "Paper Dianalisis", and "Analisis Gap Terbaru") based on live database query aggregates.
  * Populates the "Histori Terbaru" table and history sidebar list dynamically.
  * Auto-injects the most recent scan's comparison rows directly into the dashboard table.
* **Update:** Intercepted the user profile settings form in `assets/js/app.js` to send updates via fetch to `api/update_profile.php`, parsing validation warnings (like duplicate email/username) and sync-updating the UI dynamically.
* **Delete:** Clicking delete on a history card prompts a POST fetch to `api/delete_history.php`, smoothly removing the record from the database and updating the dashboard metrics.

### 4. Legacy File Cleanup & Routing Safety
* **Deleted Static Layouts:** Removed `login.html`, `register.html`, and `dashboard.html` to prevent researchers from accessing unauthenticated static shells.
* **Strict Session Gates:** Direct requests to `dashboard.php` without active sessions automatically redirect to `login.php` on the server-side.
* **Routing Updates:** Updated all routing links across `index.html`, `login.php`, `register.php`, and `assets/js/modules/navigation.js` to route cleanly using `.php` pages.

### 5. Secure OpenAI API Integration
* **Environmental Configurations (.env):** Added a secure `.env` file to separate database ports and API credentials, keeping them safely out of source control.
* **Backend OpenAI Wrapper (`api/openai_analyze.php`):** Engineered a secure PHP handler that connects to OpenAI Chat Completions API (`gpt-4o-mini`) using cURL. It instructs the model to return a structured JSON response containing 3 realistic comparative publications (methods, gaps, and summaries).
* **Asynchronous Frontend Fetch (`assets/js/modules/research.js`):** Hooked the analysis engine to query `api/openai_analyze.php` asynchronously. While the scanner animation runs, the fetch is completed, allowing real-time data to load instantly. It falls back to local simulated databases when API keys are unconfigured.

### 6. GitOps & CI/CD Pipeline Setup
* **Secret Leakage Prevention (`.gitignore`):** Created a detailed `.gitignore` file to ensure the local `.env` containing your live OpenAI API key and local PDF uploads in the `uploads/` directory are never pushed to public GitHub repositories.
* **Environment-Aware Connection (`koneksi.php`):** Refactored the PostgreSQL DB connection variables to load dynamically from environment parameters (`getenv('DB_HOST')`, etc.) if available in production, falling back to local XAMPP/Laragon configurations automatically.
* **Render Infrastructure Blueprint (`render.yaml`):** Wrote a Render Blueprint specification to automate your production stack setup. Importing this file automatically spins up a PHP Apache Web Service, provisions a PostgreSQL v15 Instance, sets up file writing permissions, and binds connection parameters securely.
* **Automated Syntax Testing Workflow (`.github/workflows/deploy.yml`):** Created a GitHub Actions workflow that:
  - Hooks on push events to the `main` branch.
  - Automatically runs syntax checkers (lints) recursively (`php -l`) across all PHP files to verify build safety.
  - Warns if any raw `.env` files are pushed.
  - Triggers Render's automatic deployment API webhook securely.
* **Cleaned Static Configs:** Deleted the obsolete `static.yml` to prevent conflict deploy calls on static environments.

### 7. Docker Containerization & Packaging
* **Production-Grade Dockerfile (`Dockerfile`):** Configured a PHP 8.2 Apache base image. It automatically installs database clients (`pdo_pgsql`, `pdo_mysql`), enables Apache rewrite modules (`a2enmod rewrite`), overrides server permissions, and sets appropriate writing capabilities for user-uploaded PDFs inside `/var/www/html/uploads`.
* **Container Exclusions (`.dockerignore`):** Implemented file exclusion parameters to make sure confidential environment keys (`.env`), system caches, git commits, and local user uploads are not compiled into the public image layers.
* **Docker Packaging Workflow (`.github/workflows/docker-build.yml`):** Implemented an automated build-and-publish CI/CD workflow that:
  - Hooks on pushes to the `main` branch.
  - Automatically logs into **GitHub Container Registry (GHCR)** using standard credentials (`GITHUB_TOKEN`).
  - Formulates image tags dynamically based on repo ownership/naming and git SHA.
  - Builds and publishes the resulting Docker image to GitHub Packages securely, complete with active build caching.
  - **SSH VPS Continuous Deployment (`deploy-to-vps` job):** Runs immediately upon successful container builds. It initiates an SSH handshake with your VPS, logs into the GitHub registry remotely, pulls the newest image, stops/deletes the obsolete container, and launches the updated container with secure database variables and OpenAI keys passed dynamically from GitHub Secrets, before pruning dangling old image layers.

---

## Verification Run Outcome

1. **User Sign Up & Login:**
   * Successful registrations securely hash passwords with `PASSWORD_BCRYPT` and create active sessions.
   * Dashboard renders username initials dynamically.
2. **Interactive Uploads & Scans:**
   * Restricts files to PDFs less than 10 MB.
   * Uploading a research PDF tracks actual progression and immediately launches the SOTA gap analyzer.
   * Database inserts and history updates complete in milliseconds.
3. **Responsive UI:**
   * Deleting history items triggers a CSS translateX transition before updating database counts.
   * View details can be re-loaded onto the dashboard SOTA table instantly by clicking "Lihat Ulang".
