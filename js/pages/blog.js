/* News & Blog Articles Page */
import { store } from '../store.js';

export function renderBlog(container, queryParams) {
  let activeCategory = 'All';

  const renderGrid = () => {
    const list = store.getArticles(activeCategory);
    const grid = container.querySelector('#blog-grid');
    
    if (!grid) return;

    if (list.length === 0) {
      grid.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 60px 0;">
          <i class="fa-solid fa-folder-open" style="font-size: 3rem; color: var(--text-light); margin-bottom: 16px;"></i>
          <h3>No Articles in Category</h3>
          <p style="color: var(--text-muted); margin-top: 8px;">Check back later for fresh updates and stories.</p>
        </div>
      `;
      return;
    }

    grid.innerHTML = list.map(post => `
      <article class="card" style="cursor: pointer;" data-id="${post.id}">
        <div class="card-img-wrapper" style="height: 180px;">
          <img src="${post.image}" class="card-img" alt="${post.title}">
          <span class="card-badge">${post.category}</span>
        </div>
        <div class="card-body" style="padding: 20px;">
          <div style="font-size: 0.8rem; color: var(--text-light); margin-bottom: 8px; font-weight: 500;">
            <i class="fa-solid fa-calendar-days"></i> ${post.date} &bull; <i class="fa-solid fa-user"></i> By ${post.author}
          </div>
          <h3 class="card-title" style="font-size: 1.15rem; line-height: 1.3; margin-bottom: 8px;">${post.title}</h3>
          <p class="card-description" style="font-size: 0.9rem; -webkit-line-clamp: 2; margin-bottom: 12px;">${post.summary}</p>
          <span style="font-size: 0.85rem; font-weight: 700; color: var(--primary); display: inline-flex; align-items: center; gap: 6px;">
            Read Article <i class="fa-solid fa-chevron-right" style="font-size: 0.75rem;"></i>
          </span>
        </div>
      </article>
    `).join('');

    // Bind click events to open full read modal
    grid.querySelectorAll('article').forEach(card => {
      card.addEventListener('click', () => {
        const id = card.dataset.id;
        openArticleReader(id);
      });
    });
  };

  // Base layout skeleton
  container.innerHTML = `
    <section class="section">
      <div class="container">
        <h1 class="section-title">News & Blog</h1>
        <p class="section-subtitle">Read success stories from the field, look through our audited quarterly reports, and explore organizational news.</p>

        <!-- Category Tabs -->
        <div style="
          display: flex;
          justify-content: center;
          margin-bottom: 40px;
          background: var(--card-bg);
          border: 1px solid var(--border);
          padding: 8px 12px;
          border-radius: var(--radius-md);
          max-width: fit-content;
          margin-left: auto;
          margin-right: auto;
        ">
          <div class="admin-tabs" style="border-bottom: none; margin-bottom: 0; gap: 4px;">
            <button class="admin-tab-btn active" data-filter="All" style="padding: 8px 16px;">All</button>
            <button class="admin-tab-btn" data-filter="Announcements" style="padding: 8px 16px;">Announcements</button>
            <button class="admin-tab-btn" data-filter="Stories" style="padding: 8px 16px;">Stories</button>
            <button class="admin-tab-btn" data-filter="Impact Reports" style="padding: 8px 16px;">Impact Reports</button>
          </div>
        </div>

        <!-- Blog Grid -->
        <div class="grid grid-3" id="blog-grid"></div>
      </div>
    </section>
  `;

  // Bind category filters
  const tabs = container.querySelectorAll('[data-filter]');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      activeCategory = tab.dataset.filter;
      renderGrid();
    });
  });

  renderGrid();
}

// Full screen Article Reader overlay dialog handler
function openArticleReader(postId) {
  const post = store.state.blog.find(b => b.id === postId);
  if (!post) return;

  const modalContainer = document.getElementById('modal-container');
  if (!modalContainer) return;

  modalContainer.classList.remove('hidden');
  modalContainer.innerHTML = `
    <div class="modal-content" style="max-width: 700px;">
      <div class="modal-header">
        <span class="status-badge status-approved" style="text-transform: capitalize;">${post.category}</span>
        <button class="modal-close" onclick="app.closeModal()">&times;</button>
      </div>
      <div class="modal-body" style="padding: 30px;">
        <img src="${post.image}" alt="${post.title}" style="width: 100%; height: 320px; object-fit: cover; border-radius: var(--radius-md); margin-bottom: 20px; background-color: var(--border-light);">
        
        <div style="font-size: 0.85rem; color: var(--text-light); margin-bottom: 12px; font-weight: 500;">
          <i class="fa-solid fa-calendar-days"></i> Published on ${post.date} &bull; <i class="fa-solid fa-user"></i> By ${post.author}
        </div>
        
        <h2 style="font-size: 1.75rem; line-height: 1.3; margin-bottom: 20px; color: var(--text);">${post.title}</h2>
        
        <div class="blog-rich-content" style="line-height: 1.8; color: var(--text); font-size: 1rem; border-top: 1px solid var(--border-light); padding-top: 20px;">
          ${post.content}
        </div>
      </div>
      <div class="modal-footer" style="justify-content: space-between; align-items: center;">
        <div style="display: flex; gap: 8px;">
          <span style="font-size: 0.8rem; font-weight: 600; color: var(--text-muted);">Share:</span>
          <a href="#" onclick="event.preventDefault(); app.showToast('Copied','Article link copied to clipboard.','info')" style="color: var(--primary); font-size: 0.95rem; margin: 0 4px;"><i class="fa-solid fa-link"></i></a>
          <a href="#" onclick="event.preventDefault(); app.showToast('Shared','Shared successfully.','success')" style="color: #1da1f2; font-size: 0.95rem; margin: 0 4px;"><i class="fa-brands fa-x-twitter"></i></a>
        </div>
        <button class="btn btn-secondary" onclick="app.closeModal()">Close Reader</button>
      </div>
    </div>
  `;
}
export default renderBlog;
