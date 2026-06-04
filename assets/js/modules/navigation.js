// --- VIEW ROUTING & NAVIGATION FEATURE ---

import { events } from '../core/events.js';
import { ToastFactory } from '../components/toast.js';

export class Navigation {
  /**
   * Bootstraps all scroll animations and view routers.
   */
  static init() {
    Navigation.initScrollAnimations();
    Navigation.initDashboardRouter();
  }

  /**
   * Scroll animations using IntersectionObserver for Landing Page
   */
  static initScrollAnimations() {
    const isLandingPage = document.querySelector('.landing-navbar') !== null;
    
    if (isLandingPage) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

      document.querySelectorAll('.stagger-row').forEach(el => {
        observer.observe(el);
      });
    }
  }

  /**
   * Dashboard multi-view routing system
   */
  static initDashboardRouter() {
    const buttons = document.querySelectorAll('.sidebar-menu-btn');
    const sections = document.querySelectorAll('.view-section');

    buttons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const targetView = btn.getAttribute('data-view');
        if (!targetView) return;

        if (targetView === 'logout') {
          e.preventDefault();
          ToastFactory.show('Info', 'Mencoba keluar dari sesi sistem...', 'info');
          setTimeout(() => {
            window.location.href = 'login.html';
          }, 1200);
          return;
        }

        // Publish event about view changing (Observer Pattern Event)
        events.publish('view:changed', targetView);

        // Deactivate all
        buttons.forEach(b => b.classList.remove('active'));
        sections.forEach(s => s.classList.remove('active'));

        // Activate clicked & its view
        btn.classList.add('active');
        const targetSec = document.getElementById(`${targetView}-view`);
        if (targetSec) {
          targetSec.classList.add('active');
          
          // Trigger table row staggered entries
          const rows = targetSec.querySelectorAll('.stagger-row');
          rows.forEach((row, i) => {
            row.classList.remove('visible');
            setTimeout(() => {
              row.classList.add('visible');
            }, (i + 1) * 100);
          });

          // Trigger SVG sparkline path drawing
          const path = targetSec.querySelector('.sparkline-path');
          if (path) {
            path.style.animation = 'none';
            path.offsetHeight; /* trigger reflow */
            path.style.animation = null;
          }
        }
      });
    });

    // Highlight default active staggered rows in current viewport
    document.querySelectorAll('.view-section.active .stagger-row').forEach((row, i) => {
      setTimeout(() => {
        row.classList.add('visible');
      }, (i + 1) * 100);
    });
  }
}
