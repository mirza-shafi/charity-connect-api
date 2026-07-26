/* Profile Dashboard Page */
import { store } from '../store.js';

export function renderProfile(container, queryParams) {
  let activeTab = 'details'; // details, history, cards, notifications

  const renderContent = () => {
    const user = store.getCurrentUser();
    if (!user) return; // Guarded by app router but double-check

    const pageContentEl = container.querySelector('#profile-tab-content');
    if (!pageContentEl) return;

    if (activeTab === 'details') {
      // Personal Details Form
      pageContentEl.innerHTML = `
        <form id="profile-update-form" style="background: var(--card-bg); border: 1px solid var(--border); border-radius: var(--radius-lg); padding: 30px; box-shadow: var(--shadow-sm);">
          <h3 style="font-size: 1.25rem; margin-bottom: 20px; font-weight: 700;">Account Settings</h3>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
            <div class="form-group">
              <label class="form-label">Full Name</label>
              <input type="text" id="prof-name" class="form-input" required value="${user.name}">
            </div>
            <div class="form-group">
              <label class="form-label">Email Address</label>
              <input type="email" class="form-input" disabled value="${user.email}" style="background: var(--border-light); cursor: not-allowed; opacity: 0.85;">
            </div>
          </div>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
            <div class="form-group">
              <label class="form-label">Phone Number</label>
              <input type="text" id="prof-phone" class="form-input" placeholder="e.g. +1 (555) 012-3456" value="${user.phone || ''}">
            </div>
            <div class="form-group">
              <label class="form-label">Office Location / Address</label>
              <input type="text" id="prof-location" class="form-input" placeholder="e.g. San Francisco, CA" value="${user.location || ''}">
            </div>
          </div>
          <hr style="border: none; border-top: 1px solid var(--border); margin: 20px 0;">
          <h3 style="font-size: 1.25rem; margin-bottom: 16px; font-weight: 700;">Update Password</h3>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
            <div class="form-group">
              <label class="form-label">New Password</label>
              <input type="password" id="prof-password" class="form-input" placeholder="Leave blank to keep current password">
            </div>
            <div class="form-group">
              <label class="form-label">Confirm Password</label>
              <input type="password" id="prof-confirm" class="form-input" placeholder="Confirm new password">
            </div>
          </div>
          <button type="submit" class="btn btn-primary" style="margin-top: 10px;">Save Profile Changes</button>
        </form>
      `;

      // Profile Edit Submit
      pageContentEl.querySelector('#profile-update-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const name = pageContentEl.querySelector('#prof-name').value;
        const phone = pageContentEl.querySelector('#prof-phone').value;
        const location = pageContentEl.querySelector('#prof-location').value;
        const pass = pageContentEl.querySelector('#prof-password').value;
        const conf = pageContentEl.querySelector('#prof-confirm').value;

        if (pass && pass !== conf) {
          app.showToast("Mismatch Passwords", "Confirmation password does not match.", "warning");
          return;
        }

        try {
          store.updateProfile(name, phone, location, pass || null);
          window.dispatchEvent(new Event('store-changed'));
          app.showToast("Profile Updated", "Your profile details have been saved.", "success");
        } catch (err) {
          app.showToast("Update Failed", err.message, "error");
        }
      });
    }

    else if (activeTab === 'history') {
      // Donation & Event Registrations History
      const txs = store.state.donations.filter(d => d.email.toLowerCase() === user.email.toLowerCase());
      const evs = store.state.events.filter(e => e.registrations.includes(user.email));

      const txRows = txs.length === 0 
        ? `<tr><td colspan="5" style="text-align: center; color: var(--text-muted); padding: 30px;">You haven't made any donations yet.</td></tr>`
        : txs.map(tx => `
          <tr>
            <td style="font-family: monospace; font-weight: 700;">${tx.id}</td>
            <td>${tx.campaignTitle}</td>
            <td style="font-weight: 700; color: var(--primary);">$${tx.amount.toFixed(2)}</td>
            <td>${tx.paymentMethod}</td>
            <td>
              <button class="btn btn-outline btn-sm view-receipt-btn" data-id="${tx.id}">
                <i class="fa-solid fa-file-invoice-dollar"></i> View Receipt
              </button>
            </td>
          </tr>
        `).join('');

      const evList = evs.length === 0
        ? `<div style="text-align: center; color: var(--text-muted); padding: 20px; border: 1px solid var(--border); border-radius: var(--radius-md); background: var(--card-bg);">You are not registered for any upcoming events.</div>`
        : evs.map(ev => `
          <div style="background: var(--card-bg); border: 1px solid var(--border); border-radius: var(--radius-md); padding: 16px; margin-bottom: 12px; display: flex; align-items: center; justify-content: space-between;">
            <div>
              <h4 style="font-size: 1rem; margin-bottom: 4px;">${ev.title}</h4>
              <p style="font-size: 0.8rem; color: var(--text-muted);">
                <i class="fa-solid fa-calendar"></i> ${ev.date} &bull; <i class="fa-solid fa-clock"></i> ${ev.time}<br>
                <i class="fa-solid fa-location-dot"></i> ${ev.location}
              </p>
            </div>
            <a href="#/events" class="btn btn-secondary btn-sm">View Event</a>
          </div>
        `).join('');

      pageContentEl.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 30px;">
          <!-- Donations Table -->
          <div style="background: var(--card-bg); border: 1px solid var(--border); border-radius: var(--radius-lg); padding: 30px; box-shadow: var(--shadow-sm);">
            <h3 style="font-size: 1.25rem; margin-bottom: 20px; font-weight: 700;">Donation History</h3>
            <div class="table-responsive" style="margin-bottom: 0;">
              <table class="admin-table">
                <thead>
                  <tr>
                    <th>Receipt ID</th>
                    <th>Supported Campaign</th>
                    <th>Amount</th>
                    <th>Method</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  ${txRows}
                </tbody>
              </table>
            </div>
          </div>

          <!-- Registered Events -->
          <div style="background: var(--card-bg); border: 1px solid var(--border); border-radius: var(--radius-lg); padding: 30px; box-shadow: var(--shadow-sm);">
            <h3 style="font-size: 1.25rem; margin-bottom: 20px; font-weight: 700;">Registered Events</h3>
            <div>
              ${evList}
            </div>
          </div>
        </div>
      `;

      // Bind View Receipt click events
      pageContentEl.querySelectorAll('.view-receipt-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          app.showReceiptModal(btn.dataset.id);
        });
      });
    }

    else if (activeTab === 'cards') {
      // Payment Methods Management
      const methods = user.paymentMethods || [];
      
      const cardsHtml = methods.length === 0
        ? `<div style="grid-column: 1 / -1; text-align: center; color: var(--text-muted); padding: 40px; background: var(--card-bg); border: 1px solid var(--border); border-radius: var(--radius-md);">No payment cards saved yet. You can save a card during the donation checkout flow.</div>`
        : methods.map(pm => `
          <div style="
            background: linear-gradient(135deg, var(--primary-dark), var(--primary));
            color: white;
            border-radius: var(--radius-md);
            padding: 24px;
            box-shadow: var(--shadow-md);
            position: relative;
            min-height: 160px;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
          ">
            <div>
              <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                <i class="fa-solid fa-credit-card" style="font-size: 1.8rem; color: var(--accent);"></i>
                <button class="remove-pm-btn" data-id="${pm.id}" style="background: none; border: none; color: rgba(255,255,255,0.7); cursor: pointer; font-size: 1.1rem; transition: color 0.2s;"><i class="fa-solid fa-trash-can"></i></button>
              </div>
              <div style="font-family: monospace; font-size: 1.2rem; margin-top: 20px; letter-spacing: 2px;">
                ${pm.cardNum}
              </div>
            </div>
            
            <div style="display: flex; justify-content: space-between; align-items: flex-end; font-size: 0.8rem;">
              <div>
                <span style="opacity: 0.7; text-transform: uppercase; font-size: 0.6rem; display: block;">Card Holder</span>
                <strong>${pm.name}</strong>
              </div>
              <div style="text-align: right;">
                <span style="opacity: 0.7; text-transform: uppercase; font-size: 0.6rem; display: block;">Expires</span>
                <strong>${pm.expiry}</strong>
              </div>
            </div>
          </div>
        `).join('');

      pageContentEl.innerHTML = `
        <div style="background: var(--card-bg); border: 1px solid var(--border); border-radius: var(--radius-lg); padding: 30px; box-shadow: var(--shadow-sm); margin-bottom: 30px;">
          <h3 style="font-size: 1.25rem; margin-bottom: 20px; font-weight: 700;">Saved Payment Cards</h3>
          <div class="grid grid-2" id="saved-cards-container">
            ${cardsHtml}
          </div>
        </div>
      `;

      // Bind card removal
      pageContentEl.querySelectorAll('.remove-pm-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const id = btn.dataset.id;
          if (confirm("Are you sure you want to delete this payment card?")) {
            store.removePaymentMethod(id);
            window.dispatchEvent(new Event('store-changed'));
            app.showToast("Card Removed", "The payment method has been deleted.", "info");
            renderContent();
          }
        });
      });
    }

    else if (activeTab === 'notifications') {
      // In-App Notifications Feed
      const notifs = store.getNotifications(user.email);
      
      const feedHtml = notifs.length === 0
        ? `<div style="text-align: center; color: var(--text-muted); padding: 40px; background: var(--card-bg); border: 1px solid var(--border); border-radius: var(--radius-md);">Your notification center is empty.</div>`
        : notifs.map(n => `
          <div style="
            background: var(--card-bg); 
            border: 1px solid var(--border); 
            border-left: 4px solid ${n.read ? 'var(--border)' : 'var(--accent)'};
            border-radius: var(--radius-sm);
            padding: 16px;
            margin-bottom: 12px;
            position: relative;
            box-shadow: var(--shadow-sm);
          ">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 4px;">
              <h4 style="font-size: 0.95rem; font-weight: 700; color: ${n.read ? 'var(--text-muted)' : 'var(--text)'};">${n.title}</h4>
              <span style="font-size: 0.75rem; color: var(--text-light);">${new Date(n.date).toLocaleString()}</span>
            </div>
            <p style="font-size: 0.85rem; color: var(--text-muted); line-height: 1.4;">${n.message}</p>
          </div>
        `).join('');

      pageContentEl.innerHTML = `
        <div style="background: var(--card-bg); border: 1px solid var(--border); border-radius: var(--radius-lg); padding: 30px; box-shadow: var(--shadow-sm);">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
            <h3 style="font-size: 1.25rem; font-weight: 700; margin-bottom: 0;">Notification Center</h3>
            ${notifs.some(n => !n.read) ? `<button class="btn btn-secondary btn-sm" id="btn-read-all">Mark All As Read</button>` : ''}
          </div>
          <div>
            ${feedHtml}
          </div>
        </div>
      `;

      // Read all button triggers
      const readAllBtn = pageContentEl.querySelector('#btn-read-all');
      if (readAllBtn) {
        readAllBtn.addEventListener('click', () => {
          store.markNotificationsRead(user.email);
          window.dispatchEvent(new Event('store-changed'));
          app.showToast("Cleared Notifications", "All notifications marked as read.", "success");
          renderContent();
        });
      }
    }
  };

  const user = store.getCurrentUser();
  const personalTxs = store.state.donations.filter(d => d.email.toLowerCase() === user.email.toLowerCase());
  const userTotal = personalTxs.reduce((s,t) => s + t.amount, 0);

  // Outer Shell UI
  container.innerHTML = `
    <section class="section" style="background: var(--border-light); flex-grow: 1;">
      <div class="container">
        <!-- Profile Banner -->
        <div style="
          background: linear-gradient(135deg, var(--primary-dark), var(--primary)); 
          color: white; 
          border-radius: var(--radius-lg);
          padding: 40px;
          margin-bottom: 45px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 30px;
          box-shadow: var(--shadow-md);
        ">
          <div style="display: flex; align-items: center; gap: 20px;">
            <div style="
              width: 80px;
              height: 80px;
              border-radius: 50%;
              background: var(--accent);
              color: white;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 2.25rem;
              font-family: var(--font-display);
              font-weight: 800;
              border: 3px solid rgba(255,255,255,0.2);
            ">
              ${user.name.charAt(0)}
            </div>
            <div>
              <h2 style="color: white; font-size: 1.8rem; font-weight: 700; margin-bottom: 4px;">Hello, ${user.name}!</h2>
              <p style="font-size: 0.9rem; opacity: 0.85;"><i class="fa-solid fa-calendar-day"></i> Supporter since June 2026</p>
            </div>
          </div>
          
          <div style="display: flex; gap: 30px;">
            <div style="text-align: right;">
              <span style="opacity: 0.8; font-size: 0.75rem; text-transform: uppercase; font-weight: 600; display: block;">Total Gifted</span>
              <strong style="font-size: 1.8rem; font-family: var(--font-display); font-weight: 800; color: var(--accent);">$${userTotal.toLocaleString()}</strong>
            </div>
            <div style="text-align: right; border-left: 1px solid rgba(255,255,255,0.2); padding-left: 30px;">
              <span style="opacity: 0.8; font-size: 0.75rem; text-transform: uppercase; font-weight: 600; display: block;">Donations Made</span>
              <strong style="font-size: 1.8rem; font-family: var(--font-display); font-weight: 800; color: white;">${personalTxs.length}</strong>
            </div>
          </div>
        </div>

        <div style="display: grid; grid-template-columns: 240px 1fr; gap: 40px; align-items: flex-start;">
          <!-- Sidebar Nav links -->
          <div style="
            background: var(--card-bg);
            border: 1px solid var(--border);
            border-radius: var(--radius-lg);
            padding: 16px;
            display: flex;
            flex-direction: column;
            gap: 6px;
            box-shadow: var(--shadow-sm);
          ">
            <button class="btn btn-secondary btn-full active" data-tab="details" style="justify-content: flex-start; background: none; font-size: 0.9rem; border-radius: var(--radius-sm); text-align: left; padding: 10px 14px;"><i class="fa-solid fa-gears" style="width: 20px;"></i> Account Details</button>
            <button class="btn btn-secondary btn-full" data-tab="history" style="justify-content: flex-start; background: none; font-size: 0.9rem; border-radius: var(--radius-sm); text-align: left; padding: 10px 14px;"><i class="fa-solid fa-hand-holding-dollar" style="width: 20px;"></i> Gift History</button>
            <button class="btn btn-secondary btn-full" data-tab="cards" style="justify-content: flex-start; background: none; font-size: 0.9rem; border-radius: var(--radius-sm); text-align: left; padding: 10px 14px;"><i class="fa-solid fa-credit-card" style="width: 20px;"></i> Saved Cards</button>
            <button class="btn btn-secondary btn-full" data-tab="notifications" style="justify-content: flex-start; background: none; font-size: 0.9rem; border-radius: var(--radius-sm); text-align: left; padding: 10px 14px; position: relative;"><i class="fa-solid fa-bell" style="width: 20px;"></i> Notifications ${store.getNotifications(user.email).some(n=>!n.read) ? `<span style="position: absolute; right: 12px; width: 8px; height: 8px; border-radius: 50%; background: var(--accent);"></span>` : ''}</button>
          </div>

          <!-- Main Dynamic Details area -->
          <div id="profile-tab-content"></div>
        </div>
      </div>
    </section>
  `;

  // Bind Sidebar clicking
  const sidebarButtons = container.querySelectorAll('[data-tab]');
  sidebarButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      sidebarButtons.forEach(b => {
        b.classList.remove('active');
        b.style.background = 'none';
        b.style.color = 'var(--text)';
      });
      
      btn.classList.add('active');
      btn.style.background = 'var(--primary-alpha)';
      btn.style.color = 'var(--primary)';
      
      activeTab = btn.dataset.tab;
      renderContent();
    });
  });

  // Set initial sidebar styling
  const initialActive = container.querySelector('[data-tab="details"]');
  initialActive.style.background = 'var(--primary-alpha)';
  initialActive.style.color = 'var(--primary)';

  renderContent();

  // Listen to store-changed events (updates notifications count and values instantly)
  window.addEventListener('store-changed', () => renderContent());
}
export default renderProfile;
