// --- AURARISET TOAST NOTIFICATION SERVICE (FACTORY PATTERN) ---

class Toast {
  constructor(title, message, type = 'success') {
    this.title = title;
    this.message = message;
    this.type = type;
    this.element = null;
    this.timer = null;
  }

  create() {
    let container = document.getElementById('toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      container.style.position = 'fixed';
      container.style.bottom = '2rem';
      container.style.right = '2rem';
      container.style.zIndex = '9999';
      container.style.display = 'flex';
      container.style.flexDirection = 'column';
      container.style.gap = '0.75rem';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = 'toast-item';
    toast.style.background = '#090c15';
    toast.style.border = `1px solid ${this.getBorderColor()}`;
    toast.style.borderRadius = '16px';
    toast.style.padding = '1rem 1.5rem';
    toast.style.color = '#fff';
    toast.style.boxShadow = '0 10px 30px rgba(0,0,0,0.5)';
    toast.style.display = 'flex';
    toast.style.alignItems = 'center';
    toast.style.gap = '1rem';
    toast.style.minWidth = '300px';
    toast.style.maxWidth = '400px';
    toast.style.transform = 'translateY(20px)';
    toast.style.opacity = '0';
    toast.style.transition = 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)';

    toast.innerHTML = `
      <i class="${this.getIconClass()}" style="color: ${this.getIconColor()}; font-size: 1.5rem;"></i>
      <div style="flex-grow: 1;">
        <h4 style="margin: 0 0 0.15rem; font-size: 0.95rem; font-weight: 700; color: ${this.getIconColor()};">${this.title}</h4>
        <p style="margin: 0; font-size: 0.82rem; color: #a0aec0;">${this.message}</p>
      </div>
      <i class="fas fa-times close-btn" style="color: #64748b; cursor: pointer; font-size: 0.85rem;"></i>
    `;

    // Bind close trigger
    toast.querySelector('.close-btn').addEventListener('click', () => {
      this.destroy();
    });

    container.appendChild(toast);
    this.element = toast;

    // Trigger animations
    setTimeout(() => {
      toast.style.transform = 'translateY(0)';
      toast.style.opacity = '1';
    }, 10);

    // Auto destroy after 4 seconds
    this.timer = setTimeout(() => {
      this.destroy();
    }, 4000);
  }

  destroy() {
    if (!this.element) return;
    clearTimeout(this.timer);
    this.element.style.transform = 'translateY(15px)';
    this.element.style.opacity = '0';
    setTimeout(() => {
      this.element.remove();
      this.element = null;
    }, 400);
  }

  getBorderColor() {
    const colors = {
      success: 'var(--color-gold)',
      error: '#ef4444',
      warning: '#f59e0b',
      info: '#4facfe'
    };
    return colors[this.type] || 'var(--color-gold)';
  }

  getIconColor() {
    return this.getBorderColor();
  }

  getIconClass() {
    const icons = {
      success: 'fas fa-check-circle',
      error: 'fas fa-exclamation-circle',
      warning: 'fas fa-exclamation-triangle',
      info: 'fas fa-info-circle'
    };
    return icons[this.type] || 'fas fa-check-circle';
  }
}

// Factory class (Singleton provider for Toast creations)
export class ToastFactory {
  /**
   * Create and trigger a toast notification (Factory design pattern).
   * @param {string} title Toast title header
   * @param {string} message Toast message description
   * @param {string} type 'success', 'error', 'warning', or 'info'
   */
  static show(title, message, type = 'success') {
    const toast = new Toast(title, message, type);
    toast.create();
    return toast;
  }
}
