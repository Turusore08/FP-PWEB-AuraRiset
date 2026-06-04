// --- AURARISET CENTRAL STATE STORE (SINGLETON PATTERN) ---

import { events } from './events.js';

class Store {
  constructor() {
    // Initial default state (loads from window.USER_SESSION if available, fallback to localStorage)
    const sessionUser = window.USER_SESSION?.username || localStorage.getItem('aurariset_username') || 'Peneliti Utama';
    const sessionEmail = window.USER_SESSION?.email || localStorage.getItem('aurariset_email') || 'peneliti@aurariset.ac.id';
    const sessionRole = window.USER_SESSION?.role || localStorage.getItem('aurariset_role') || 'mahasiswa';

    this.state = {
      username: sessionUser,
      email: sessionEmail,
      role: sessionRole,
      stats: {
        totalResearch: parseInt(localStorage.getItem('aurariset_stat_total') || '0'),
        papersScanned: parseInt(localStorage.getItem('aurariset_stat_papers') || '0'),
        newGaps: parseInt(localStorage.getItem('aurariset_stat_gaps') || '0')
      }
    };
  }

  /**
   * Get the current state (returns deep copy to prevent external direct mutations)
   * @returns {object} deep copy of state
   */
  getState() {
    return JSON.parse(JSON.stringify(this.state));
  }

  /**
   * Safely update state variables and sync with localStorage.
   * Publishes state:changed event on complete.
   * @param {object} newState Object containing updated state properties
   */
  updateState(newState) {
    let changed = false;

    if (newState.username !== undefined && newState.username !== this.state.username) {
      this.state.username = newState.username;
      localStorage.setItem('aurariset_username', newState.username);
      changed = true;
    }
    if (newState.email !== undefined && newState.email !== this.state.email) {
      this.state.email = newState.email;
      localStorage.setItem('aurariset_email', newState.email);
      changed = true;
    }
    if (newState.role !== undefined && newState.role !== this.state.role) {
      this.state.role = newState.role;
      localStorage.setItem('aurariset_role', newState.role);
      changed = true;
    }
    if (newState.stats !== undefined) {
      this.state.stats = { ...this.state.stats, ...newState.stats };
      localStorage.setItem('aurariset_stat_total', this.state.stats.totalResearch.toString());
      localStorage.setItem('aurariset_stat_papers', this.state.stats.papersScanned.toString());
      localStorage.setItem('aurariset_stat_gaps', this.state.stats.newGaps.toString());
      changed = true;
    }

    if (changed) {
      events.publish('state:changed', this.getState());
    }
  }
}

// Export a single global instance (Singleton State Manager)
export const store = new Store();
