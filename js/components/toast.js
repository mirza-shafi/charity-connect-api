/* Toast Notifications Manager */

export const Toast = {
  show(title, message, type = 'success', duration = 4000) {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    // Choose icon based on alert type
    let iconClass = 'fa-circle-check';
    if (type === 'warning') iconClass = 'fa-triangle-exclamation';
    if (type === 'error') iconClass = 'fa-circle-xmark';
    if (type === 'info') iconClass = 'fa-circle-info';

    toast.innerHTML = `
      <div class="toast-icon">
        <i class="fa-solid ${iconClass}"></i>
      </div>
      <div class="toast-content">
        <div class="toast-title">${title}</div>
        <div class="toast-message">${message}</div>
      </div>
      <button class="toast-close" aria-label="Dismiss">
        <i class="fa-solid fa-xmark"></i>
      </button>
      <div class="toast-progress">
        <div class="toast-progress-bar" style="animation-duration: ${duration}ms;"></div>
      </div>
    `;

    container.appendChild(toast);

    // Event listener to close toast manually
    const closeBtn = toast.querySelector('.toast-close');
    closeBtn.addEventListener('click', () => {
      this.dismiss(toast);
    });

    // Auto dismiss
    const timeoutId = setTimeout(() => {
      this.dismiss(toast);
    }, duration);

    toast.dataset.timeoutId = timeoutId;
  },

  dismiss(toast) {
    if (!toast || !toast.parentNode) return;
    
    // Cancel the pending auto-dismiss timeout if closed manually
    if (toast.dataset.timeoutId) {
      clearTimeout(parseInt(toast.dataset.timeoutId));
    }
    
    toast.style.animation = 'toastSlideOut 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards';
    
    // Fade out and slide right before removing
    toast.addEventListener('animationend', (e) => {
      if (e.animationName === 'toastSlideOut') {
        toast.remove();
      }
    });
  }
};

// CSS for slide-out animation (other toast styles in components.css)
const style = document.createElement('style');
style.textContent = `
@keyframes toastSlideOut {
  from {
    transform: translateX(0);
    opacity: 1;
  }
  to {
    transform: translateX(120%);
    opacity: 0;
  }
}
`;
document.head.appendChild(style);

export default Toast;
