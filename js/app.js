/* Core Application Controller & Router */
import { store } from './store.js';
import { Header } from './components/header.js';
import { Footer } from './components/footer.js';
import { Modals } from './components/modals.js';
import { Toast } from './components/toast.js';

// Page Imports
import { renderHome } from './pages/home.js';
import { renderCampaigns } from './pages/campaigns.js';
import { renderEvents } from './pages/events.js';
import { renderBlog } from './pages/blog.js';
import { renderVolunteer } from './pages/volunteer.js';
import { renderContact } from './pages/contact.js';
import { renderProfile } from './pages/profile.js';
import { renderAdmin } from './pages/admin.js';

// Application Registry
class App {
  constructor() {
    this.routes = {
      '#/': renderHome,
      '#/campaigns': renderCampaigns,
      '#/events': renderEvents,
      '#/blog': renderBlog,
      '#/volunteer': renderVolunteer,
      '#/contact': renderContact,
      '#/profile': renderProfile,
      '#/admin': renderAdmin
    };
    
    this.init();
  }

  init() {
    // 1. Theme initialization
    const theme = localStorage.getItem("charity_connect_theme") || "light";
    if (theme === "dark") {
      document.body.classList.add("dark-mode");
    } else {
      document.body.classList.remove("dark-mode");
    }

    // 2. Global DOM hooks
    this.contentArea = document.getElementById("app-content");
    this.modalArea = document.getElementById("modal-container");
    this.headerArea = document.getElementById("main-header");
    this.footerArea = document.getElementById("main-footer");

    // 3. Render Static elements
    Header.init(this.headerArea);
    Footer.init(this.footerArea);
    Modals.init(this.modalArea);

    // 4. Setup Routing listeners
    window.addEventListener('hashchange', () => this.router());
    window.addEventListener('load', () => this.router());

    // 5. Global click helpers (e.g. closing dropdowns)
    document.addEventListener('click', (e) => {
      // Close user dropdown if clicking outside
      const dropdown = document.querySelector('.dropdown-menu');
      const badge = document.querySelector('.user-badge');
      if (dropdown && badge && !badge.contains(e.target) && !dropdown.contains(e.target)) {
        dropdown.classList.remove('show');
      }
    });
  }

  // Routing Handler
  router() {
    let hash = window.location.hash || '#/';
    
    // Normalize sub-routes or detail views if we add them (e.g., campaigns?id=...)
    let cleanHash = hash;
    let queryParams = {};
    
    if (hash.includes('?')) {
      const parts = hash.split('?');
      cleanHash = parts[0];
      const searchParams = new URLSearchParams(parts[1]);
      for (const [key, value] of searchParams.entries()) {
        queryParams[key] = value;
      }
    }

    const renderFunc = this.routes[cleanHash];
    
    // Guard Private pages
    const currentUser = store.getCurrentUser();
    
    if (cleanHash === '#/profile') {
      if (!currentUser) {
        // Redirect to home and show login modal
        window.location.hash = '#/';
        this.showToast("Authentication Required", "Please sign in to view your profile dashboard.", "warning");
        setTimeout(() => this.showAuthModal('login'), 200);
        return;
      }
    }
    
    if (cleanHash === '#/admin') {
      if (!currentUser || currentUser.role !== 'admin') {
        // Gated page
        window.location.hash = '#/';
        this.showToast("Access Denied", "Administrative privileges are required to access this panel.", "error");
        return;
      }
    }

    if (renderFunc) {
      // Scroll to top
      window.scrollTo(0, 0);
      
      // Render page content
      this.contentArea.innerHTML = '';
      renderFunc(this.contentArea, queryParams);
      
      // Update Header links
      Header.updateActiveLink(cleanHash);
    } else {
      // 404 Redirect
      this.contentArea.innerHTML = `
        <div class="container section text-center" style="padding: 120px 0;">
          <h1 style="font-size: 4rem; color: var(--danger);">404</h1>
          <h2 style="margin-bottom: 20px;">Page Not Found</h2>
          <p style="color: var(--text-muted); margin-bottom: 30px;">The page you are looking for does not exist or has been moved.</p>
          <a href="#/" class="btn btn-primary">Go back home</a>
        </div>
      `;
    }
  }

  // Global Dialog controllers
  showAuthModal(activeTab = 'login') {
    Modals.showAuth(activeTab);
  }

  showDonationModal(campaignId = '') {
    Modals.showDonation(campaignId);
  }

  showReceiptModal(receiptId) {
    Modals.showReceipt(receiptId);
  }

  showToast(title, message, type = 'success') {
    Toast.show(title, message, type);
  }

  toggleTheme() {
    const isDark = document.body.classList.toggle("dark-mode");
    localStorage.setItem("charity_connect_theme", isDark ? "dark" : "light");
    
    // Trigger header re-render to update icon
    Header.render();
  }
}

// Instantiate global application controller
export const app = new App();
window.app = app; // Expose globally for HTML inline event triggers
export default app;
