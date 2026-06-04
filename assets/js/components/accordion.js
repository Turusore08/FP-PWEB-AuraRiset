// --- FAQ ACCORDION CONTROLLER MODULE ---

export class Accordion {
  /**
   * Initialize FAQ Accordion hooks and expose handlers to global scope
   */
  static init() {
    // Bind toggleFaq to the global window scope to maintain compatibility with HTML inline onclick triggers.
    window.toggleFaq = Accordion.toggle;
  }

  /**
   * Toggle accordion active height and chevron rotation
   * @param {HTMLElement} button Accordion trigger element
   */
  static toggle(button) {
    const item = button.parentElement;
    const wrapper = button.nextElementSibling;
    
    const isActive = item.classList.contains('active');
    
    // Close all other FAQ items for a clean single-open accordion experience
    const allItems = document.querySelectorAll('.faq-item');
    allItems.forEach(i => {
      i.classList.remove('active');
      const wrap = i.querySelector('.faq-answer-wrapper');
      if (wrap) wrap.style.maxHeight = null;
    });
    
    if (!isActive) {
      item.classList.add('active');
      wrapper.style.maxHeight = wrapper.scrollHeight + 'px';
    }
  }
}
