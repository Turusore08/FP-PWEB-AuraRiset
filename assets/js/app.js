// --- AURARISET MAIN BOOTSTRAP ENTRYPOINT (MODULE PATTERN ROOT) ---

import { events } from './core/events.js';
import { store } from './core/store.js';
import { ToastFactory } from './components/toast.js';
import { Accordion } from './components/accordion.js';
import { Particles } from './modules/particles.js';
import { Navigation } from './modules/navigation.js';
import { Research } from './modules/research.js';

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

// Expose Toast system globally to maintain backward compatibility with static forms
window.showToast = ToastFactory.show;
