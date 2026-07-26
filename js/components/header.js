/* Header Component */
import { store } from '../store.js';

export const Header = {
  container: null,

  init(containerElement) {
    this.container = containerElement;
    this.render();
    
    // Listen for custom login/logout/update actions to re-render header
    window.addEventListener('store-changed', () => this.render());
  },

  render() {
    if (!this.container) return;
    
    const currentUser = store.getCurrentUser();
    const isDark = document.body.classList.contains("dark-mode");
    
    let userControlsHtml = '';
    if (currentUser) {
      // User is logged in
      const isAdmin = currentUser.role === 'admin';
      userControlsHtml = `
        <div class="user-menu">
          <div class="user-badge" onclick="this.nextElementSibling.classList.toggle('show')">
            <i class="fa-solid fa-user"></i>
            <span>${currentUser.name.split(' ')[0]}</span>
            <i class="fa-solid fa-chevron-down" style="font-size: 0.75rem;"></i>
          </div>
          <div class="dropdown-menu">
            <div class="dropdown-item" style="pointer-events: none; opacity: 0.75; font-size: 0.8rem; border-bottom: 1px solid var(--border-light); padding-bottom: 8px;">
              ${currentUser.email}
            </div>
            <a href="#/profile" class="dropdown-item">
              <i class="fa-solid fa-id-card"></i> Profile Dashboard
            </a>
            ${isAdmin ? `
              <a href="#/admin" class="dropdown-item">
                <i class="fa-solid fa-chart-line"></i> Admin Panel
              </a>
            ` : ''}
            <div class="dropdown-divider"></div>
            <a href="#/" class="dropdown-item" style="color: var(--danger);" id="header-logout-btn">
              <i class="fa-solid fa-right-from-bracket"></i> Sign Out
            </a>
          </div>
        </div>
      `;
    } else {
      // Guest user
      userControlsHtml = `
        <button class="btn btn-secondary btn-sm" onclick="app.showAuthModal('login')">Sign In</button>
      `;
    }

    this.container.innerHTML = `
      <div class="header-container">
        <a href="#/" class="logo">
          <i class="fa-solid fa-hand-holding-heart"></i>
          <span>CharityConnect</span>
        </a>
        
        <nav>
          <ul class="nav-menu">
            <li><a href="#/" class="nav-link active" data-hash="#/">Home</a></li>
            <li><a href="#/campaigns" class="nav-link" data-hash="#/campaigns">Campaigns</a></li>
            <li><a href="#/events" class="nav-link" data-hash="#/events">Events</a></li>
            <li><a href="#/blog" class="nav-link" data-hash="#/blog">News</a></li>
            <li><a href="#/volunteer" class="nav-link" data-hash="#/volunteer">Volunteer</a></li>
            <li><a href="#/contact" class="nav-link" data-hash="#/contact">Contact</a></li>
          </ul>
        </nav>
        
        <div class="header-actions">
          <button class="theme-toggle" onclick="app.toggleTheme()" aria-label="Toggle Theme">
            <i class="fa-solid ${isDark ? 'fa-sun' : 'fa-moon'}"></i>
          </button>
          ${userControlsHtml}
          <button class="btn btn-accent btn-sm" onclick="app.showDonationModal()">Donate Now</button>
          
          <!-- Mobile Menu Toggle -->
          <button class="theme-toggle" id="mobile-nav-toggle" style="display: none; font-size: 1.5rem;" aria-label="Toggle Menu">
            <i class="fa-solid fa-bars"></i>
          </button>
        </div>
      </div>
    `;

    // Bind Logout event
    const logoutBtn = this.container.querySelector('#header-logout-btn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', (e) => {
        e.preventDefault();
        store.logout();
        window.dispatchEvent(new Event('store-changed'));
        app.showToast("Signed Out", "You have logged out of your account.", "info");
        window.location.hash = '#/';
      });
    }

    // Mobile navigation toggle handling
    const mobileToggle = this.container.querySelector('#mobile-nav-toggle');
    const navMenu = this.container.querySelector('.nav-menu');
    
    // Media Query listener
    const handleMediaQuery = (mq) => {
      if (mq.matches) {
        mobileToggle.style.display = 'block';
        navMenu.style.display = 'none';
        navMenu.style.position = 'absolute';
        navMenu.style.top = 'var(--header-height)';
        navMenu.style.left = '0';
        navMenu.style.width = '100%';
        navMenu.style.flexDirection = 'column';
        navMenu.style.background = 'var(--card-bg)';
        navMenu.style.borderBottom = '1px solid var(--border)';
        navMenu.style.padding = '20px';
        navMenu.style.gap = '15px';
        navMenu.style.boxShadow = 'var(--shadow-md)';
      } else {
        mobileToggle.style.display = 'none';
        navMenu.style.display = 'flex';
        navMenu.style.position = 'static';
        navMenu.style.width = 'auto';
        navMenu.style.flexDirection = 'row';
        navMenu.style.background = 'none';
        navMenu.style.borderBottom = 'none';
        navMenu.style.padding = '0';
        navMenu.style.gap = '32px';
        navMenu.style.boxShadow = 'none';
      }
    };
    
    const mq = window.matchMedia("(max-width: 768px)");
    handleMediaQuery(mq);
    // Compatibility for older browsers
    try {
      mq.addEventListener('change', handleMediaQuery);
    } catch(e) {
      mq.addListener(handleMediaQuery);
    }

    mobileToggle.addEventListener('click', () => {
      const isVisible = navMenu.style.display === 'flex';
      navMenu.style.display = isVisible ? 'none' : 'flex';
      mobileToggle.innerHTML = isVisible ? '<i class="fa-solid fa-bars"></i>' : '<i class="fa-solid fa-xmark"></i>';
    });

    // Close mobile nav menu on link clicks
    navMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        if (window.innerWidth <= 768) {
          navMenu.style.display = 'none';
          mobileToggle.innerHTML = '<i class="fa-solid fa-bars"></i>';
        }
      });
    });
  },

  updateActiveLink(hash) {
    if (!this.container) return;
    const links = this.container.querySelectorAll('.nav-link');
    links.forEach(link => {
      const match = link.getAttribute('data-hash') === hash;
      if (match) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });
  }
};
export default Header;
