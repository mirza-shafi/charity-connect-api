/* Events Directory Page */
import { store } from '../store.js';

export function renderEvents(container, queryParams) {
  let searchQuery = '';

  const renderList = () => {
    const list = store.getEvents(searchQuery);
    const grid = container.querySelector('#events-grid');
    const curUser = store.getCurrentUser();
    
    if (!grid) return;

    if (list.length === 0) {
      grid.innerHTML = `
        <div style="text-align: center; padding: 60px 0; grid-column: 1 / -1;">
          <i class="fa-solid fa-calendar-xmark" style="font-size: 3rem; color: var(--text-light); margin-bottom: 16px;"></i>
          <h3>No Upcoming Events</h3>
          <p style="color: var(--text-muted); margin-top: 8px;">Try searching for a different keyword or checking back later.</p>
        </div>
      `;
      return;
    }

    grid.innerHTML = list.map(ev => {
      // Split date
      const eventDate = new Date(ev.date);
      const day = eventDate.getDate();
      const month = eventDate.toLocaleString('default', { month: 'short' });
      
      const isRegistered = curUser ? ev.registrations.includes(curUser.email) : false;

      return `
        <div class="event-card">
          <div class="event-date-badge">
            <span class="event-date-day">${day}</span>
            <span class="event-date-month">${month}</span>
          </div>
          <div class="event-content">
            <h3 class="event-title">${ev.title}</h3>
            <div class="event-meta">
              <span><i class="fa-solid fa-clock"></i> ${ev.time}</span>
              <span><i class="fa-solid fa-location-dot"></i> ${ev.location}</span>
            </div>
            <p class="event-desc">${ev.description}</p>
            <div style="margin-top: auto; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 10px;">
              <span style="font-size: 0.8rem; font-weight: 600; color: var(--text-light);">
                <i class="fa-solid fa-users"></i> ${ev.registrations.length} Attending
              </span>
              ${isRegistered ? `
                <button class="btn btn-secondary btn-sm" disabled style="cursor: default; opacity: 0.8;">
                  <i class="fa-solid fa-circle-check" style="color: var(--success);"></i> Registered
                </button>
              ` : `
                <button class="btn btn-primary btn-sm btn-event-register" data-id="${ev.id}">Register Now</button>
              `}
            </div>
          </div>
        </div>
      `;
    }).join('');

    // Bind registration actions
    const btns = grid.querySelectorAll('.btn-event-register');
    btns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = btn.dataset.id;
        
        if (!curUser) {
          app.showToast("Authentication Required", "Please sign in to register for community events.", "warning");
          setTimeout(() => app.showAuthModal('login'), 200);
          return;
        }

        try {
          store.registerEvent(id, curUser.email);
          app.showToast(
            "Event Confirmation", 
            "Registration confirmed. A confirmation message has been simulated in your notifications.", 
            "success"
          );
          
          // Simulation Email Notification popup
          showEmailSimulationPopup(id, curUser);
          
          renderList();
        } catch (err) {
          app.showToast("Registration Failed", err.message, "error");
        }
      });
    });
  };

  // Base layout skeleton
  container.innerHTML = `
    <section class="section">
      <div class="container">
        <h1 class="section-title">Community Events</h1>
        <p class="section-subtitle">Join our hands-on operations, charity galas, and awareness workshops. Register online to book your spot.</p>

        <!-- Search and filters -->
        <div style="
          display: flex; 
          gap: 20px; 
          margin-bottom: 40px; 
          align-items: center; 
          justify-content: flex-end;
          background: var(--card-bg);
          border: 1px solid var(--border);
          padding: 16px 24px;
          border-radius: var(--radius-md);
        ">
          <!-- Search box -->
          <div style="position: relative; width: 100%; max-width: 320px;">
            <input type="text" id="event-search-input" class="form-input" placeholder="Search events..." style="padding-left: 40px; padding-right: 16px; margin-bottom: 0;">
            <i class="fa-solid fa-magnifying-glass" style="position: absolute; left: 14px; top: 50%; transform: translateY(-50%); color: var(--text-light);"></i>
          </div>
        </div>

        <!-- Events Container -->
        <div class="grid grid-2" id="events-grid"></div>
      </div>
    </section>
  `;

  // Bind query inputs
  const input = container.querySelector('#event-search-input');
  input.addEventListener('input', (e) => {
    searchQuery = e.target.value;
    renderList();
  });

  renderList();
}

// Private helper to render a beautiful pop-up mock email notification
function showEmailSimulationPopup(eventId, user) {
  const ev = store.state.events.find(e => e.id === eventId);
  if (!ev) return;

  const mockMail = document.createElement('div');
  mockMail.style.cssText = `
    position: fixed;
    bottom: 30px;
    left: 30px;
    z-index: 1500;
    max-width: 380px;
    background: var(--card-bg);
    border: 1px solid var(--primary);
    border-radius: var(--radius-md);
    box-shadow: var(--shadow-lg);
    overflow: hidden;
    animation: slideInLeft 0.4s ease-out;
  `;

  mockMail.innerHTML = `
    <div style="background: var(--primary); color: white; padding: 12px 16px; display: flex; align-items: center; justify-content: space-between;">
      <span style="font-weight: 700; font-size: 0.85rem;"><i class="fa-solid fa-envelope"></i> Simulated Mail Client</span>
      <button class="mock-mail-close" style="background: none; border: none; color: white; cursor: pointer; font-size: 1rem;">&times;</button>
    </div>
    <div style="padding: 16px; font-size: 0.85rem; line-height: 1.4;">
      <div style="margin-bottom: 8px;"><strong>From:</strong> updates@charityconnect.org</div>
      <div style="margin-bottom: 8px;"><strong>To:</strong> ${user.email}</div>
      <div style="margin-bottom: 12px; border-bottom: 1px solid var(--border-light); padding-bottom: 8px;">
        <strong>Subject:</strong> Registration Confirmed: ${ev.title}
      </div>
      <p style="margin-bottom: 10px;">Hi ${user.name.split(' ')[0]},</p>
      <p style="margin-bottom: 10px;">We have received your registration for <strong>${ev.title}</strong>.</p>
      <p style="background: var(--border-light); padding: 8px; border-radius: 4px; font-size: 0.8rem; margin-bottom: 10px;">
        <strong>Date:</strong> ${ev.date}<br>
        <strong>Time:</strong> ${ev.time}<br>
        <strong>Location:</strong> ${ev.location}
      </p>
      <p>We look forward to seeing you there! Bring a bottle of water and your QR pass.</p>
    </div>
  `;

  // Inject animation style helper
  const styleEl = document.createElement('style');
  styleEl.textContent = `
    @keyframes slideInLeft {
      from { transform: translateX(-120%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
  `;
  document.head.appendChild(styleEl);

  document.body.appendChild(mockMail);

  mockMail.querySelector('.mock-mail-close').addEventListener('click', () => {
    mockMail.remove();
  });

  // Auto remove mock mail notification after 8s
  setTimeout(() => {
    if (mockMail.parentNode) {
      mockMail.remove();
    }
  }, 8000);
}
export default renderEvents;
