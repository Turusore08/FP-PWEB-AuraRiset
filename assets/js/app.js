// --- AURARISET MAIN BOOTSTRAP ENTRYPOINT (MODULE PATTERN ROOT) ---

import { events } from './core/events.js';
import { store } from './core/store.js';
import { ToastFactory } from './components/toast.js';
import { Accordion } from './components/accordion.js';
import { Particles } from './modules/particles.js';
import { Navigation } from './modules/navigation.js';
import { Research } from './modules/research.js';
import { exportEvaluationsPDF, exportUsersPDF } from './modules/pdfExport.js';

// Bootstrap App Components on Load
document.addEventListener('DOMContentLoaded', () => {
  // Initialize standalone components & systems
  Particles.init();
  Accordion.init();
  Navigation.init();
  Research.init();

  // Initialize UI features
  initProfileDropdown();
  initSettingsForm();
  initTableSearch();
  initAdminDosenPDFExports();

  // Bootstrap Reactive Observers (Observer Pattern)
  setupObservers();
  
  // Set initial UI counts and profile states
  const initialState = store.getState();
  updateProfileUI(initialState);
  
  // Trigger initial reactive numbers animation
  animateStats(initialState.stats);
});

/* --- REACTIVE EVENT OBSERVERS (OBSERVER DESIGN PATTERN) --- */
function setupObservers() {
  // 1. Observer: Listen to store changes (updates stats & profile counters dynamically)
  events.subscribe('state:changed', (state) => {
    updateProfileUI(state);
  });

  // 2. Observer: Listen to research scanning milestones
  events.subscribe('research:started', (topic) => {
    console.log(`%c[Observer] Research analysis started for query: "${topic}"`, 'color: #4facfe; font-weight: bold;');
  });

  // 3. Observer: Listen to research completion triggers
  events.subscribe('research:completed', (match) => {
    console.log(`%c[Observer] Research analysis completed successfully for topic: "${match.topic}"`, 'color: #d4af37; font-weight: bold;');
    
    // Animate stats counter upwards reactively
    const updatedState = store.getState();
    animateStats(updatedState.stats);
  });

  // 4. Observer: Listen to view changes
  events.subscribe('view:changed', (targetView) => {
    if (targetView === 'users') {
      loadAdminUsers();
    } else if (targetView === 'review') {
      loadReviewResearch();
    }
  });
}

/* --- STATS REACTIVE DIGITS ANIMATOR --- */
let activeCounterTimers = {};
function animateStats(targetStats) {
  const statsMapping = [
    { id: 'count-total', value: targetStats.totalResearch, format: true },
    { id: 'count-paper', value: targetStats.papersScanned, format: false },
    { id: 'count-gap', value: targetStats.newGaps, format: false }
  ];

  statsMapping.forEach(item => {
    const el = document.getElementById(item.id);
    if (!el) return;

    // Clear any previous running animation frames on this element
    if (activeCounterTimers[item.id]) {
      cancelAnimationFrame(activeCounterTimers[item.id]);
    }

    let start = parseInt(el.textContent.replace(/,/g, '')) || 0;
    const target = item.value;
    if (start === target) return;

    const duration = 1200; // 1.2s smooth transitions
    const startTime = performance.now();

    function step(timestamp) {
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Quadratic ease out
      const easeProgress = progress * (2 - progress);
      const current = Math.floor(start + easeProgress * (target - start));

      el.textContent = item.format ? current.toLocaleString('en-US') : current;

      if (progress < 1) {
        activeCounterTimers[item.id] = requestAnimationFrame(step);
      } else {
        el.textContent = item.format ? target.toLocaleString('en-US') : target;
      }
    }

    activeCounterTimers[item.id] = requestAnimationFrame(step);
  });
}

/* --- PROFILE UI REACTIVE UPDATER --- */
function updateProfileUI(state) {
  // Update username labels across the UI
  const displayNames = document.querySelectorAll('.profile-name, .settings-profile-info h3');
  displayNames.forEach(el => el.textContent = state.username);

  // Update email label
  const displayEmail = document.querySelector('.dropdown-header-email');
  if (displayEmail) displayEmail.textContent = state.email;

  // Update avatar circle initials
  const initial = state.username.charAt(0).toUpperCase();
  const avatars = document.querySelectorAll('.profile-avatar, .settings-avatar-big');
  avatars.forEach(el => el.textContent = initial);

  // Update form inputs if on settings tab
  const setUsernameInput = document.getElementById('set-username');
  const setEmailInput = document.getElementById('set-email');
  if (setUsernameInput) setUsernameInput.value = state.username;
  if (setEmailInput) setEmailInput.value = state.email;
}

/* --- USER PROFILE DROPDOWN MANAGER --- */
function initProfileDropdown() {
  const trigger = document.getElementById('profile-trigger');
  const dropdown = document.getElementById('profile-dropdown');

  if (!trigger || !dropdown) return;

  trigger.addEventListener('click', (e) => {
    e.stopPropagation();
    dropdown.classList.toggle('open');
  });

  document.addEventListener('click', () => {
    dropdown.classList.remove('open');
  });
}

/* --- PROFILE SETTINGS FORM HANDLER --- */
function initSettingsForm() {
  const form = document.getElementById('settings-profile-form');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const username = document.getElementById('set-username').value.trim();
    const email = document.getElementById('set-email').value.trim();

    if (!username || !email) {
      ToastFactory.show('Error', 'Username dan Email tidak boleh kosong!', 'error');
      return;
    }

    const formData = new FormData(form);

    try {
      const response = await fetch('api/update_profile.php', {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        const finalUrl = new URL(response.url);
        const errorParam = finalUrl.searchParams.get('error');

        if (errorParam) {
          if (errorParam === 'duplicate_credentials') {
            ToastFactory.show('Error', 'Username atau Email sudah terdaftar!', 'error');
          } else {
            ToastFactory.show('Error', 'Gagal memperbarui profil: ' + decodeURIComponent(errorParam), 'error');
          }
        } else {
          // Update global state store (Singleton automatically triggers event notifications)
          store.updateState({ username, email });
          ToastFactory.show('Berhasil', 'Pengaturan akun peneliti diperbarui!', 'success');
        }
      } else {
        ToastFactory.show('Error', 'Gagal menyimpan perubahan ke server.', 'error');
      }
    } catch (err) {
      ToastFactory.show('Error', 'Terjadi kesalahan jaringan.', 'error');
    }
  });
}

/* --- TABLE FILTER SEARCH MANAGER --- */
function initTableSearch() {
  const input = document.getElementById('search-dashboard-table');
  if (!input) return;

  input.addEventListener('keyup', () => {
    const filter = input.value.toLowerCase();
    const rows = document.querySelectorAll('.recent-table tbody tr, .comparison-table tbody tr');

    rows.forEach(row => {
      const text = row.textContent.toLowerCase();
      if (text.includes(filter)) {
        row.style.display = '';
      } else {
        row.style.display = 'none';
      }
    });
  });
}

/* --- ADMIN & DOSEN PDF EXPORTS WIREUP --- */
function initAdminDosenPDFExports() {
  const btnEvals = document.getElementById('btn-export-evaluations-pdf');
  const btnUsers = document.getElementById('btn-export-users-pdf');

  if (btnEvals) {
    btnEvals.addEventListener('click', async () => {
      try {
        const response = await fetch('api/get_research.php');
        const data = await response.json();
        if (data.status === 'success' && data.history.length > 0) {
          exportEvaluationsPDF(data.history);
        } else {
          ToastFactory.show('Peringatan', 'Tidak ada data evaluasi mahasiswa untuk diekspor.', 'warning');
        }
      } catch (err) {
        ToastFactory.show('Error', 'Gagal memuat evaluasi mahasiswa.', 'error');
      }
    });
  }

  if (btnUsers) {
    btnUsers.addEventListener('click', async () => {
      try {
        const response = await fetch('api/admin_users.php');
        const data = await response.json();
        if (data.status === 'success' && data.users.length > 0) {
          exportUsersPDF(data.users);
        } else {
          ToastFactory.show('Peringatan', 'Tidak ada data pengguna untuk diekspor.', 'warning');
        }
      } catch (err) {
        ToastFactory.show('Error', 'Gagal memuat data pengguna.', 'error');
      }
    });
  }
}

// Expose Toast system globally to maintain backward compatibility with static forms
window.showToast = ToastFactory.show;

/* --- ADMIN & DOSEN DATA LOADERS --- */
async function loadAdminUsers() {
  const tbody = document.querySelector('#admin-users-table tbody');
  if (!tbody) return;

  tbody.innerHTML = `<tr><td colspan="5" style="text-align: center; color: var(--color-text-muted); padding: 2rem;">Memuat data pengguna...</td></tr>`;

  try {
    const response = await fetch('api/admin_users.php');
    const data = await response.json();

    if (data.status === 'success') {
      tbody.innerHTML = '';
      if (data.users.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" style="text-align: center; color: var(--color-text-muted); padding: 2rem;">Tidak ada pengguna lain terdaftar.</td></tr>`;
        return;
      }

      data.users.forEach(user => {
        const tr = document.createElement('tr');
        tr.className = 'stagger-row visible';
        tr.innerHTML = `
          <td>${user.id}</td>
          <td><strong>${user.username}</strong></td>
          <td>${user.email}</td>
          <td>
            <select class="select-custom user-role-select" data-id="${user.id}" style="padding: 0.4rem 0.8rem; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 6px; color: #fff; width: 150px; outline: none; cursor: pointer;">
              <option value="mahasiswa" ${user.role === 'mahasiswa' ? 'selected' : ''} style="background: #151821; color: #fff;">Mahasiswa</option>
              <option value="dosen" ${user.role === 'dosen' ? 'selected' : ''} style="background: #151821; color: #fff;">Dosen</option>
              <option value="admin" ${user.role === 'admin' ? 'selected' : ''} style="background: #151821; color: #fff;">Admin</option>
            </select>
          </td>
          <td>
            <button class="btn-icon delete btn-delete-user" data-id="${user.id}" title="Hapus Akun" style="width: 32px; height: 32px; display: inline-flex; align-items: center; justify-content: center; border-radius: 6px; background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.2); color: #ef4444; cursor: pointer;"><i class="fas fa-trash-alt"></i></button>
          </td>
        `;
        tbody.appendChild(tr);
      });

      // Bind role change
      tbody.querySelectorAll('.user-role-select').forEach(select => {
        select.addEventListener('change', async (e) => {
          const userId = e.target.getAttribute('data-id');
          const newRole = e.target.value;
          await updateUserRole(userId, newRole);
        });
      });

      // Bind user delete
      tbody.querySelectorAll('.btn-delete-user').forEach(btn => {
        btn.addEventListener('click', async (e) => {
          const userId = btn.getAttribute('data-id');
          if (confirm('Apakah Anda yakin ingin menghapus user ini beserta seluruh datanya?')) {
            await deleteUser(userId);
          }
        });
      });
    } else {
      tbody.innerHTML = `<tr><td colspan="5" style="text-align: center; color: #ef4444; padding: 2rem;">Error: ${data.message}</td></tr>`;
    }
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="5" style="text-align: center; color: #ef4444; padding: 2rem;">Gagal memuat data pengguna dari database.</td></tr>`;
  }
}

async function updateUserRole(userId, role) {
  try {
    const response = await fetch('api/admin_users.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'update_role', user_id: userId, role })
    });
    const result = await response.json();
    if (result.status === 'success') {
      ToastFactory.show('Berhasil', 'Hak akses user diperbarui!', 'success');
    } else {
      ToastFactory.show('Error', result.message || 'Gagal merubah role.', 'error');
    }
  } catch (err) {
    ToastFactory.show('Error', 'Terjadi kesalahan jaringan.', 'error');
  }
}

async function deleteUser(userId) {
  try {
    const response = await fetch('api/admin_users.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'delete_user', user_id: userId })
    });
    const result = await response.json();
    if (result.status === 'success') {
      ToastFactory.show('Dihapus', 'User berhasil dihapus dari sistem.', 'info');
      loadAdminUsers();
    } else {
      ToastFactory.show('Error', result.message || 'Gagal menghapus user.', 'error');
    }
  } catch (err) {
    ToastFactory.show('Error', 'Terjadi kesalahan jaringan.', 'error');
  }
}

async function loadReviewResearch() {
  const tbody = document.querySelector('#review-table tbody');
  if (!tbody) return;

  tbody.innerHTML = `<tr><td colspan="4" style="text-align: center; color: var(--color-text-muted); padding: 2rem;">Memuat riwayat riset mahasiswa...</td></tr>`;

  try {
    const response = await fetch('api/get_research.php');
    const data = await response.json();

    if (data.status === 'success') {
      tbody.innerHTML = '';
      if (data.history.length === 0) {
        tbody.innerHTML = `<tr><td colspan="4" style="text-align: center; color: var(--color-text-muted); padding: 2rem;">Belum ada riwayat riset yang tersimpan.</td></tr>`;
        return;
      }

      data.history.forEach(item => {
        const date = new Date(item.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
        const tr = document.createElement('tr');
        tr.className = 'stagger-row visible';
        tr.innerHTML = `
          <td><strong>${item.author || 'Mahasiswa'}</strong></td>
          <td>${item.topic}</td>
          <td>${date}</td>
          <td>
            <button class="btn-icon btn-view-review" style="padding: 0.4rem 0.8rem; border-radius: 6px; background: rgba(212, 175, 55, 0.1); border: 1px solid rgba(212, 175, 55, 0.2); color: var(--color-gold); font-size: 0.85rem; display: inline-flex; align-items: center; gap: 0.4rem; cursor: pointer;"><i class="fas fa-eye"></i> Tinjau</button>
          </td>
        `;
        tbody.appendChild(tr);

        tr.querySelector('.btn-view-review').addEventListener('click', () => {
          // Switch to dashboard
          const dashBtn = document.querySelector('.sidebar-menu-btn[data-view="dashboard"]');
          if (dashBtn) dashBtn.click();
          
          // Inject comparison table with research.js Comparison renderer
          const tbodyComp = document.querySelector('.comparison-table tbody');
          if (tbodyComp && item.results) {
            tbodyComp.innerHTML = '';
            item.results.forEach((res) => {
              const trComp = document.createElement('tr');
              trComp.className = 'stagger-row visible';
              trComp.innerHTML = `
                <td class="year-cell">${res.year}</td>
                <td class="method-cell">${res.method}</td>
                <td class="gap-cell">${res.gap}</td>
                <td class="ai-summary-cell">${res.summary}</td>
              `;
              tbodyComp.appendChild(trComp);
            });
            ToastFactory.show('Peneliti: ' + (item.author || 'Mahasiswa'), `Memuat gap riset: "${item.topic}"`, 'success');
          }
        });
      });
    } else {
      tbody.innerHTML = `<tr><td colspan="4" style="text-align: center; color: #ef4444; padding: 2rem;">Error: ${data.message}</td></tr>`;
    }
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="4" style="text-align: center; color: #ef4444; padding: 2rem;">Gagal memuat data riset dari server.</td></tr>`;
  }
}
