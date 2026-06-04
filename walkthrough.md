# Walkthrough — Progressive Enhancement & CORS Fallback Animation Fix

This walkthrough documents a critical visibility fix made to the **AuraRiset** landing page (`index.html`) to ensure that all layout content is 100% visible and readable under both standard web servers (`http://`) and local offline file browsers (`file://` protocols).

---

## The Problem Identified
When opening `index.html` locally by double-clicking the file in Windows Explorer (the `file://` protocol), modern browsers block ES6 Module script tags (`type="module"`) due to strict **CORS (Cross-Origin Resource Sharing)** security policies.

1. This block prevented `app.js` and all nested feature scripts from executing.
2. Because the original CSS stylesheet defined `.stagger-row` with a default of `opacity: 0` (expecting JavaScript to reveal them dynamically as the user scrolls), the entire page below the header menu appeared **completely blank and empty** when viewed offline.

---

## The Solution: Progressive Enhancement

To solve this issue, we decoupled the initial page layout visibility from the successful execution of JavaScript, ensuring that the interface is always readable even if ES6 modules are blocked.

### 1. Updated CSS Rules (`assets/css/style.css`)
We removed the default `opacity: 0` rule from all `.stagger-row` elements. Instead, the animation state is now only applied if the element also contains a newly defined class `.stagger-init`:

```css
/* Only hide and animate if initialized by JavaScript */
.stagger-row.stagger-init {
  opacity: 0;
  transform: translateY(10px);
  transition: transform 0.4s ease, opacity 0.4s ease;
}

.stagger-row.stagger-init.visible {
  opacity: 1;
  transform: translateY(0);
}
```

### 2. Dynamic Class Injection (`assets/js/modules/navigation.js` & `research.js`)
We modified the scroll animation routines to inject the `.stagger-init` class dynamically on page load and during table injections:

```javascript
document.querySelectorAll('.stagger-row').forEach(el => {
  el.classList.add('stagger-init'); // Apply animation hidden state
  observer.observe(el);             // Observe to fade back in on scroll
});
```

---

## Verification & UX Outcome

* **Standard Web Server (`http://localhost:8000`)**: The Intersection Observer runs perfectly. Elements fade and slide into view with premium micro-animations as the user scrolls down the landing page.
* **Offline Local Files (`file:///.../index.html`)**: If ES6 modules are blocked by the browser, the `.stagger-init` class is never added. All sections (Tentang Kami, Fitur Layanan, Spektrum Visual, FAQ, Contact Form) remain **fully visible (`opacity: 1`) and readable**, eliminating the empty screen layout bug.
