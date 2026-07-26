/* Campaigns Library Page */
import { store } from '../store.js';

export function renderCampaigns(container, queryParams) {
  let activeCategory = 'All';
  let searchQuery = '';

  const renderList = () => {
    const list = store.getCampaigns(searchQuery, activeCategory);
    const grid = container.querySelector('#campaigns-grid');
    
    if (!grid) return;
    
    if (list.length === 0) {
      grid.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 60px 0;">
          <i class="fa-solid fa-magnifying-glass" style="font-size: 3rem; color: var(--text-light); margin-bottom: 16px;"></i>
          <h3>No Campaigns Found</h3>
          <p style="color: var(--text-muted); margin-top: 8px;">Try searching for a different keyword or checking other categories.</p>
        </div>
      `;
      return;
    }

    grid.innerHTML = list.map(c => {
      const percent = Math.min(100, Math.round((c.raised / c.goal) * 100));
      return `
        <div class="card">
          <div class="card-img-wrapper">
            <img src="${c.image}" class="card-img" alt="${c.title}">
            <span class="card-badge">${c.category}</span>
          </div>
          <div class="card-body">
            <h3 class="card-title">${c.title}</h3>
            <p class="card-description">${c.description}</p>
            <div class="progress-container">
              <div class="progress-labels">
                <span>Raised: $${c.raised.toLocaleString()}</span>
                <span>${percent}%</span>
              </div>
              <div class="progress-bar-bg">
                <div class="progress-bar-fill" style="width: ${percent}%;"></div>
              </div>
              <div class="progress-labels" style="margin-top: 6px; font-weight: 500; font-size: 0.8rem; color: var(--text-light);">
                <span>Goal: $${c.goal.toLocaleString()}</span>
              </div>
            </div>
          </div>
          <div class="card-footer">
            <button class="btn btn-primary btn-full" onclick="app.showDonationModal('${c.id}')">Donate Now</button>
          </div>
        </div>
      `;
    }).join('');
  };

  // Base structure containing headers, query inputs, and layout wrappers
  container.innerHTML = `
    <section class="section">
      <div class="container">
        <h1 class="section-title">Fundraising Campaigns</h1>
        <p class="section-subtitle">Support specific global projects or emergency relief funds. Your gifts help communities establish resilience.</p>
        
        <!-- Search and Filter Bar -->
        <div style="
          display: flex; 
          gap: 20px; 
          margin-bottom: 40px; 
          align-items: center; 
          justify-content: space-between; 
          flex-wrap: wrap;
          background: var(--card-bg);
          border: 1px solid var(--border);
          padding: 16px 24px;
          border-radius: var(--radius-md);
        ">
          <!-- Filter Pills -->
          <div class="admin-tabs" style="border-bottom: none; margin-bottom: 0; gap: 8px;">
            <button class="admin-tab-btn active" data-cat="All" style="padding: 8px 16px;">All Causes</button>
            <button class="admin-tab-btn" data-cat="Environment" style="padding: 8px 16px;">Environment</button>
            <button class="admin-tab-btn" data-cat="Education" style="padding: 8px 16px;">Education</button>
            <button class="admin-tab-btn" data-cat="Humanitarian" style="padding: 8px 16px;">Humanitarian</button>
          </div>
          
          <!-- Search box -->
          <div style="position: relative; width: 100%; max-width: 320px;">
            <input type="text" id="campaign-search-input" class="form-input" placeholder="Search campaigns..." style="padding-left: 40px; padding-right: 16px; margin-bottom: 0;">
            <i class="fa-solid fa-magnifying-glass" style="position: absolute; left: 14px; top: 50%; transform: translateY(-50%); color: var(--text-light);"></i>
          </div>
        </div>

        <!-- Campaigns cards container -->
        <div class="grid grid-3" id="campaigns-grid"></div>
      </div>
    </section>
  `;

  // Attach search listeners
  const searchInput = container.querySelector('#campaign-search-input');
  searchInput.addEventListener('input', (e) => {
    searchQuery = e.target.value;
    renderList();
  });

  // Attach category clicks
  const pills = container.querySelectorAll('[data-cat]');
  pills.forEach(pill => {
    pill.addEventListener('click', (e) => {
      pills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      activeCategory = pill.dataset.cat;
      renderList();
    });
  });

  // Initial load
  renderList();

  // Listen to store-changed events for live raised amount updates
  window.addEventListener('store-changed', () => renderList());
}
export default renderCampaigns;
