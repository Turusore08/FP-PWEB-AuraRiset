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
