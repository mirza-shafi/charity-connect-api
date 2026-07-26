/* Admin Dashboard Page */
import { store } from '../store.js';

export function renderAdmin(container, queryParams) {
  let activeAdminTab = 'overview'; // overview, campaigns, events, volunteers, donations
  
  // Renders the main dashboard dynamic content area
  const renderDashboardContent = () => {
    const mainArea = container.querySelector('#admin-dashboard-main');
    if (!mainArea) return;

    const stats = store.getStats();
    const analytics = store.getAnalytics();

    if (activeAdminTab === 'overview') {
      // 1. Render charts using SVG
      
      // Monthly Bar Chart Config
      const maxVal = Math.max(...analytics.monthlySums, 1000);
      const chartHeight = 180;
      const barSpacing = 70;
      const barsHtml = analytics.monthlySums.map((sum, index) => {
        const barHeight = (sum / maxVal) * chartHeight;
        const x = 50 + index * barSpacing;
        const y = 200 - barHeight;
        return `
          <g>
            <rect class="chart-bar" x="${x}" y="${y}" width="40" height="${barHeight}" />
            <text class="chart-text" x="${x + 20}" y="${y - 8}" font-weight="700" fill="var(--text)">$${Math.round(sum/100)/10}k</text>
            <text class="chart-text" x="${x + 20}" y="220">${analytics.monthlyLabels[index]}</text>
          </g>
        `;
      }).join('');

      // Donut Chart Config (showing share of donations across 3 main campaigns)
      const campaignShares = analytics.campaignsSummary.slice(0, 3);
      const totalCampaignRaised = campaignShares.reduce((s,c) => s + c.raised, 0);
      
      let currentOffset = 0;
      const radius = 50;
      const circumference = 2 * Math.PI * radius; // ~314.16
      const colors = ['var(--primary)', 'var(--accent)', 'var(--info)'];
      
      const donutHtml = campaignShares.map((camp, index) => {
        const share = totalCampaignRaised > 0 ? (camp.raised / totalCampaignRaised) : 0.33;
        const strokeLength = share * circumference;
        const strokeOffset = circumference - currentOffset;
        currentOffset += strokeLength;

        return `
          <circle class="donut-segment" cx="80" cy="80" r="${radius}" 
                  stroke="${colors[index]}" 
                  stroke-dasharray="${strokeLength} ${circumference - strokeLength}" 
                  stroke-dashoffset="${strokeOffset}">
          </circle>
        `;
      }).join('');

      const donutLegendHtml = campaignShares.map((camp, index) => {
        const percent = totalCampaignRaised > 0 ? Math.round((camp.raised / totalCampaignRaised) * 100) : 0;
        return `
          <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px; font-size: 0.85rem;">
            <span style="width: 12px; height: 12px; border-radius: 3px; background: ${colors[index]}; display: inline-block;"></span>
            <span style="font-weight: 600;">${percent}%</span>
            <span style="color: var(--text-muted); text-overflow: ellipsis; white-space: nowrap; overflow: hidden; max-width: 140px;">${camp.name}</span>
          </div>
        `;
      }).join('');

      mainArea.innerHTML = `
        <!-- Analytics Charts -->
        <div class="charts-grid">
          <!-- Monthly donations bar chart -->
          <div class="chart-card">
            <h3 class="chart-title"><i class="fa-solid fa-chart-column"></i> Monthly Contributions (2026)</h3>
            <svg class="svg-chart" viewBox="0 0 500 240" height="200">
              <!-- Gridlines -->
              <line class="chart-gridline" x1="30" y1="200" x2="480" y2="200" />
              <line class="chart-gridline" x1="30" y1="140" x2="480" y2="140" />
              <line class="chart-gridline" x1="30" y1="80" x2="480" y2="80" />
              <line class="chart-gridline" x1="30" y1="20" x2="480" y2="20" />
              ${barsHtml}
            </svg>
          </div>

          <!-- Campaigns comparisons donut chart -->
          <div class="chart-card">
            <h3 class="chart-title"><i class="fa-solid fa-chart-pie"></i> Funding Share</h3>
            <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%;">
              <svg class="svg-chart" viewBox="0 0 160 160" width="120" height="120" style="transform: rotate(-90deg); margin-bottom: 20px;">
                <circle cx="80" cy="80" r="${radius}" fill="none" stroke="var(--border)" stroke-width="14"></circle>
                ${donutHtml}
                <circle class="donut-center" cx="80" cy="80" r="43"></circle>
              </svg>
              <div style="width: 100%;">
                ${donutLegendHtml}
              </div>
            </div>
          </div>
        </div>

        <!-- Recent Activities list -->
        <div style="background: var(--card-bg); border: 1px solid var(--border); border-radius: var(--radius-lg); padding: 24px; box-shadow: var(--shadow-sm);">
          <h3 style="font-size: 1.15rem; font-weight: 700; margin-bottom: 20px;"><i class="fa-solid fa-clock-rotate-left"></i> Live Stream Feed</h3>
          <div class="activity-feed">
            ${store.state.donations.slice(-4).reverse().map(d => `
              <div class="activity-item">
                <span class="activity-time">${new Date(d.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                <span class="activity-text">
                  <strong>${d.name}</strong> contributed <strong style="color: var(--success);">$${d.amount}</strong> to "${d.campaignTitle}" using ${d.paymentMethod}.
                </span>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    } 
    
    else if (activeAdminTab === 'campaigns') {
      // Campaigns Management Dashboard
      const camps = store.state.campaigns;
      
      const rows = camps.map(c => `
        <tr>
          <td><img src="${c.image}" style="width: 50px; height: 35px; object-fit: cover; border-radius: 4px;"></td>
          <td style="font-weight: 700;">${c.title}</td>
          <td>${c.category}</td>
          <td><strong>$${c.raised.toLocaleString()}</strong> / $${c.goal.toLocaleString()}</td>
          <td>
            <span class="status-badge ${c.active ? 'status-approved' : 'status-rejected'}">
              ${c.active ? 'Active' : 'Deactivated'}
            </span>
          </td>
          <td>
            <button class="btn btn-secondary btn-sm edit-camp-btn" data-id="${c.id}"><i class="fa-solid fa-pen-to-square"></i></button>
            <button class="btn btn-danger btn-sm delete-camp-btn" data-id="${c.id}" ${!c.active ? 'disabled' : ''}><i class="fa-solid fa-trash-can"></i></button>
          </td>
        </tr>
      `).join('');

      mainArea.innerHTML = `
        <div style="background: var(--card-bg); border: 1px solid var(--border); border-radius: var(--radius-lg); padding: 30px; box-shadow: var(--shadow-sm);">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
            <h3 style="font-size: 1.25rem; font-weight: 700; margin-bottom: 0;">Fundraising Campaigns Directory</h3>
            <button class="btn btn-accent btn-sm" id="btn-create-camp-trigger"><i class="fa-solid fa-plus"></i> Create Campaign</button>
          </div>

          <div class="table-responsive" style="margin-bottom: 0;">
            <table class="admin-table">
              <thead>
                <tr>
                  <th>Thumbnail</th>
                  <th>Campaign Title</th>
                  <th>Category</th>
                  <th>Raised / Goal</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                ${rows}
              </tbody>
            </table>
          </div>
        </div>
      `;

      // Bind CRUD triggers
      modalCrudCampaignBind();
    }

    else if (activeAdminTab === 'events') {
      // Events Management Dashboard
      const evs = store.state.events;

      const rows = evs.map(e => `
        <tr>
          <td><img src="${e.image}" style="width: 50px; height: 35px; object-fit: cover; border-radius: 4px;"></td>
          <td style="font-weight: 700;">${e.title}</td>
          <td>${e.date}</td>
          <td>${e.location}</td>
          <td><i class="fa-solid fa-users"></i> ${e.registrations.length}</td>
          <td>
            <button class="btn btn-secondary btn-sm edit-ev-btn" data-id="${e.id}"><i class="fa-solid fa-pen-to-square"></i></button>
            <button class="btn btn-danger btn-sm delete-ev-btn" data-id="${e.id}"><i class="fa-solid fa-trash-can"></i></button>
          </td>
        </tr>
      `).join('');

      mainArea.innerHTML = `
        <div style="background: var(--card-bg); border: 1px solid var(--border); border-radius: var(--radius-lg); padding: 30px; box-shadow: var(--shadow-sm);">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
            <h3 style="font-size: 1.25rem; font-weight: 700; margin-bottom: 0;">Upcoming Events Directory</h3>
            <button class="btn btn-accent btn-sm" id="btn-create-ev-trigger"><i class="fa-solid fa-plus"></i> Add Event</button>
          </div>

          <div class="table-responsive" style="margin-bottom: 0;">
            <table class="admin-table">
              <thead>
                <tr>
                  <th>Thumbnail</th>
                  <th>Event Title</th>
                  <th>Date</th>
                  <th>Location</th>
                  <th>Attendee Count</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                ${rows}
              </tbody>
            </table>
          </div>
        </div>
      `;

      modalCrudEventBind();
    }

    else if (activeAdminTab === 'volunteers') {
      // Volunteer Applications approvals queue
      const vols = store.state.volunteers;
      
      const rows = vols.map(v => `
        <tr>
          <td style="font-weight: 700;">${v.name}</td>
          <td>${v.email}<br>${v.phone}</td>
          <td>${v.interest}</td>
          <td style="max-width: 250px; font-size: 0.8rem; color: var(--text-muted); text-overflow: ellipsis; overflow: hidden; white-space: nowrap;">${v.skills}</td>
          <td>
            <span class="status-badge ${v.status === 'approved' ? 'status-approved' : v.status === 'rejected' ? 'status-rejected' : 'status-pending'}">
              ${v.status}
            </span>
          </td>
          <td>
            ${v.status === 'pending' ? `
              <button class="btn btn-primary btn-sm approve-vol-btn" data-id="${v.id}" style="padding: 4px 8px; font-size: 0.75rem;"><i class="fa-solid fa-circle-check"></i> Approve</button>
              <button class="btn btn-danger btn-sm reject-vol-btn" data-id="${v.id}" style="padding: 4px 8px; font-size: 0.75rem;"><i class="fa-solid fa-circle-xmark"></i> Reject</button>
            ` : `
              <span style="font-size: 0.8rem; color: var(--text-light);"><i class="fa-solid fa-lock"></i> Locked</span>
            `}
          </td>
        </tr>
      `).join('');

      mainArea.innerHTML = `
        <div style="background: var(--card-bg); border: 1px solid var(--border); border-radius: var(--radius-lg); padding: 30px; box-shadow: var(--shadow-sm);">
          <h3 style="font-size: 1.25rem; font-weight: 700; margin-bottom: 20px;">Volunteer Registries Queue</h3>
          <div class="table-responsive" style="margin-bottom: 0;">
            <table class="admin-table">
              <thead>
                <tr>
                  <th>Applicant</th>
                  <th>Contact Info</th>
                  <th>Area Interest</th>
                  <th>Skills / Motivation</th>
                  <th>Approval Status</th>
                  <th>Action Menu</th>
                </tr>
              </thead>
              <tbody>
                ${rows === '' ? `<tr><td colspan="6" style="text-align: center; padding: 30px; color: var(--text-muted);">No volunteers registered.</td></tr>` : rows}
              </tbody>
            </table>
          </div>
        </div>
      `;

      // Bind actions
      mainArea.querySelectorAll('.approve-vol-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          store.updateVolunteerStatus(btn.dataset.id, 'approved');
          window.dispatchEvent(new Event('store-changed'));
          app.showToast("Volunteer Approved", "The volunteer has been approved and simulated notifications dispatched.", "success");
          renderDashboardContent();
        });
      });

      mainArea.querySelectorAll('.reject-vol-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          store.updateVolunteerStatus(btn.dataset.id, 'rejected');
          window.dispatchEvent(new Event('store-changed'));
          app.showToast("Volunteer Rejected", "The volunteer application has been rejected.", "info");
          renderDashboardContent();
        });
      });
    }

    else if (activeAdminTab === 'donations') {
      // Donations audit list
      const txs = store.state.donations;

      const rows = txs.map(t => `
        <tr>
          <td style="font-family: monospace; font-weight: 700;">${t.id}</td>
          <td><strong>${t.name}</strong><br>${t.email}</td>
          <td>${t.campaignTitle}</td>
          <td style="font-weight: 700; color: var(--primary);">$${t.amount.toLocaleString()}</td>
          <td>${t.paymentMethod}</td>
          <td>${new Date(t.date).toLocaleDateString()}</td>
        </tr>
      `).join('');

      mainArea.innerHTML = `
        <div style="background: var(--card-bg); border: 1px solid var(--border); border-radius: var(--radius-lg); padding: 30px; box-shadow: var(--shadow-sm);">
          <h3 style="font-size: 1.25rem; font-weight: 700; margin-bottom: 20px;">Financial Ledger & Donations Reports</h3>
          <div class="table-responsive" style="margin-bottom: 0;">
            <table class="admin-table">
              <thead>
                <tr>
                  <th>Tx ID</th>
                  <th>Donor</th>
                  <th>Campaign Cause</th>
                  <th>Gift Sum</th>
                  <th>Payment Type</th>
                  <th>Tx Date</th>
                </tr>
              </thead>
              <tbody>
                ${rows}
              </tbody>
            </table>
          </div>
        </div>
      `;
    }
  };

  // Bind CRUD Campaigns functions
  const modalCrudCampaignBind = () => {
    // Create new campaign
    const trigger = container.querySelector('#btn-create-camp-trigger');
    if (trigger) {
      trigger.addEventListener('click', () => {
        openCampaignCrudModal();
      });
    }

    // Edit campaign
    container.querySelectorAll('.edit-camp-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        openCampaignCrudModal(btn.dataset.id);
      });
    });

    // Deactivate/Delete campaign
    container.querySelectorAll('.delete-camp-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        if (confirm("Are you sure you want to deactivate this fundraising campaign? It will be hidden from donor listings.")) {
          store.deleteCampaign(btn.dataset.id);
          window.dispatchEvent(new Event('store-changed'));
          app.showToast("Campaign Deactivated", "Fundraiser deactivated successfully.", "info");
          renderDashboardContent();
        }
      });
    });
  };

  // Bind CRUD Events functions
  const modalCrudEventBind = () => {
    // Add Event
    const trigger = container.querySelector('#btn-create-ev-trigger');
    if (trigger) {
      trigger.addEventListener('click', () => {
        openEventCrudModal();
      });
    }

    // Edit Event
    container.querySelectorAll('.edit-ev-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        openEventCrudModal(btn.dataset.id);
      });
    });

    // Delete Event
    container.querySelectorAll('.delete-ev-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        if (confirm("Are you sure you want to delete this community event?")) {
          store.deleteEvent(btn.dataset.id);
          window.dispatchEvent(new Event('store-changed'));
          app.showToast("Event Deleted", "Community event removed successfully.", "info");
          renderDashboardContent();
        }
      });
    });
  };

  // Render Campaign Dialog Operator
  const openCampaignCrudModal = (campId = null) => {
    const isEdit = campId !== null;
    const camp = isEdit ? store.getCampaignById(campId) : null;
    
    const modal = document.getElementById('modal-container');
    if (!modal) return;

    modal.classList.remove('hidden');
    modal.innerHTML = `
      <div class="modal-content">
        <div class="modal-header">
          <h3 class="modal-title">${isEdit ? 'Edit Campaign Details' : 'Create New Campaign'}</h3>
          <button class="modal-close" onclick="app.closeModal()">&times;</button>
        </div>
        <form id="crud-campaign-form" style="padding: 24px;">
          <div class="form-group">
            <label class="form-label">Campaign Title</label>
            <input type="text" id="crud-c-title" required class="form-input" placeholder="e.g. Save the Forest" value="${isEdit ? camp.title : ''}">
          </div>
          <div class="form-group">
            <label class="form-label">Description Summary</label>
            <textarea id="crud-c-desc" required class="form-textarea" placeholder="Detail the goals of this fundraiser...">${isEdit ? camp.description : ''}</textarea>
          </div>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
            <div class="form-group">
              <label class="form-label">Category</label>
              <select id="crud-c-category" class="form-select">
                <option value="Environment" ${isEdit && camp.category === 'Environment' ? 'selected' : ''}>Environment</option>
                <option value="Education" ${isEdit && camp.category === 'Education' ? 'selected' : ''}>Education</option>
                <option value="Humanitarian" ${isEdit && camp.category === 'Humanitarian' ? 'selected' : ''}>Humanitarian</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Funding Goal ($)</label>
              <input type="number" id="crud-c-goal" required class="form-input" placeholder="Goal in USD" value="${isEdit ? camp.goal : ''}">
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">Banner Image URL</label>
            <input type="url" id="crud-c-image" class="form-input" placeholder="https://unsplash.com/..." value="${isEdit ? camp.image : ''}">
          </div>
          <div style="display: flex; gap: 10px; margin-top: 24px; justify-content: flex-end;">
            <button type="button" class="btn btn-secondary" onclick="app.closeModal()">Cancel</button>
            <button type="submit" class="btn btn-primary">${isEdit ? 'Save Changes' : 'Launch Campaign'}</button>
          </div>
        </form>
      </div>
    `;

    modal.querySelector('#crud-campaign-form').addEventListener('submit', (e) => {
      e.preventDefault();
      const title = modal.querySelector('#crud-c-title').value;
      const desc = modal.querySelector('#crud-c-desc').value;
      const category = modal.querySelector('#crud-c-category').value;
      const goal = modal.querySelector('#crud-c-goal').value;
      const img = modal.querySelector('#crud-c-image').value;

      try {
        if (isEdit) {
          store.updateCampaign(campId, { title, description: desc, category, goal, image: img });
          app.showToast("Campaign Saved", `"${title}" has been updated.`, "success");
        } else {
          store.createCampaign(title, desc, category, goal, img);
          app.showToast("Campaign Created", `"${title}" is now live on the site.`, "success");
        }
        window.dispatchEvent(new Event('store-changed'));
        app.closeModal();
        renderDashboardContent();
      } catch (err) {
        app.showToast("Operator Failed", err.message, "error");
      }
    });
  };

  // Render Event Dialog Operator
  const openEventCrudModal = (eventId = null) => {
    const isEdit = eventId !== null;
    const ev = isEdit ? store.state.events.find(e => e.id === eventId) : null;
    
    const modal = document.getElementById('modal-container');
    if (!modal) return;

    modal.classList.remove('hidden');
    modal.innerHTML = `
      <div class="modal-content">
        <div class="modal-header">
          <h3 class="modal-title">${isEdit ? 'Modify Event Schedule' : 'Schedule New Event'}</h3>
          <button class="modal-close" onclick="app.closeModal()">&times;</button>
        </div>
        <form id="crud-event-form" style="padding: 24px;">
          <div class="form-group">
            <label class="form-label">Event Name</label>
            <input type="text" id="crud-e-title" required class="form-input" placeholder="e.g. Tree planting meetup" value="${isEdit ? ev.title : ''}">
          </div>
          <div class="form-group">
            <label class="form-label">Event Description</label>
            <textarea id="crud-e-desc" required class="form-textarea" placeholder="Detail scheduled events...">${isEdit ? ev.description : ''}</textarea>
          </div>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
            <div class="form-group">
              <label class="form-label">Calendar Date</label>
              <input type="date" id="crud-e-date" required class="form-input" value="${isEdit ? ev.date : ''}">
            </div>
            <div class="form-group">
              <label class="form-label">Scheduled Time</label>
              <input type="text" id="crud-e-time" required class="form-input" placeholder="09:00 AM - 12:00 PM" value="${isEdit ? ev.time : ''}">
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">Venue Location</label>
            <input type="text" id="crud-e-loc" required class="form-input" placeholder="e.g. Golden Gate Park, SF" value="${isEdit ? ev.location : ''}">
          </div>
          <div class="form-group">
            <label class="form-label">Cover Image URL</label>
            <input type="url" id="crud-e-image" class="form-input" placeholder="https://unsplash.com/..." value="${isEdit ? ev.image : ''}">
          </div>
          <div style="display: flex; gap: 10px; margin-top: 24px; justify-content: flex-end;">
            <button type="button" class="btn btn-secondary" onclick="app.closeModal()">Cancel</button>
            <button type="submit" class="btn btn-primary">${isEdit ? 'Save Changes' : 'Announce Event'}</button>
          </div>
        </form>
      </div>
    `;

    modal.querySelector('#crud-event-form').addEventListener('submit', (e) => {
      e.preventDefault();
      const title = modal.querySelector('#crud-e-title').value;
      const desc = modal.querySelector('#crud-e-desc').value;
      const date = modal.querySelector('#crud-e-date').value;
      const time = modal.querySelector('#crud-e-time').value;
      const location = modal.querySelector('#crud-e-loc').value;
      const img = modal.querySelector('#crud-e-image').value;

      try {
        if (isEdit) {
          store.updateEvent(eventId, { title, description: desc, date, time, location, image: img });
          app.showToast("Event Saved", `"${title}" schedules have been updated.`, "success");
        } else {
          store.createEvent(title, desc, date, time, location, img);
          app.showToast("Event Scheduled", `"${title}" has been announced.`, "success");
        }
        window.dispatchEvent(new Event('store-changed'));
        app.closeModal();
        renderDashboardContent();
      } catch (err) {
        app.showToast("Operator Failed", err.message, "error");
      }
    });
  };

  const stats = store.getStats();

  // Primary Layout container grid
  container.innerHTML = `
    <section class="section" style="background: var(--border-light); flex-grow: 1;">
      <div class="container">
        <h1 style="font-size: 2.25rem; margin-bottom: 30px;"><i class="fa-solid fa-screwdriver-wrench" style="color: var(--accent);"></i> Administrative Controls</h1>
        
        <!-- Summary boxes grid -->
        <div class="dashboard-grid">
          <div class="stat-box">
            <div class="stat-icon"><i class="fa-solid fa-money-check-dollar"></i></div>
            <div class="stat-info">
              <span class="stat-label">Total Gifts</span>
              <div class="stat-value" id="stats-total-money">$${stats.totalDonations.toLocaleString()}</div>
              <span class="stat-trend up"><i class="fa-solid fa-arrow-trend-up"></i> +12% this week</span>
            </div>
          </div>
          <div class="stat-box">
            <div class="stat-icon"><i class="fa-solid fa-users"></i></div>
            <div class="stat-info">
              <span class="stat-label">Unique Donors</span>
              <div class="stat-value" id="stats-donors-count">${stats.uniqueDonors}</div>
              <span class="stat-trend up"><i class="fa-solid fa-arrow-trend-up"></i> +8% month-on-month</span>
            </div>
          </div>
          <div class="stat-box">
            <div class="stat-icon"><i class="fa-solid fa-heart-pulse"></i></div>
            <div class="stat-info">
              <span class="stat-label">Active Causes</span>
              <div class="stat-value" id="stats-active-campaigns">${stats.activeCampaigns}</div>
              <span class="stat-trend" style="color: var(--text-light);">Fully sustainable</span>
            </div>
          </div>
          <div class="stat-box">
            <div class="stat-icon"><i class="fa-solid fa-clipboard-user"></i></div>
            <div class="stat-info">
              <span class="stat-label">Volunteer Queue</span>
              <div class="stat-value" id="stats-pending-vols" style="${stats.pendingVolunteers > 0 ? 'color: var(--warning);' : ''}">${stats.pendingVolunteers}</div>
              <span class="stat-trend ${stats.pendingVolunteers > 0 ? 'up' : ''}" style="${stats.pendingVolunteers === 0 ? 'color: var(--success);' : ''}">
                ${stats.pendingVolunteers > 0 ? `<i class="fa-solid fa-clock"></i> Action required` : `<i class="fa-solid fa-circle-check"></i> Queue clean`}
              </span>
            </div>
          </div>
        </div>

        <!-- Navigation Tabs inside panel -->
        <div class="admin-tabs" style="margin-bottom: 30px;">
          <button class="admin-tab-btn active" data-admin-tab="overview">Performance Overview</button>
          <button class="admin-tab-btn" data-admin-tab="campaigns">Manage Campaigns</button>
          <button class="admin-tab-btn" data-admin-tab="events">Manage Events</button>
          <button class="admin-tab-btn" data-admin-tab="volunteers">Volunteer Requests</button>
          <button class="admin-tab-btn" data-admin-tab="donations">Donation Reports</button>
        </div>

        <!-- Changing content hub -->
        <div id="admin-dashboard-main"></div>
      </div>
    </section>
  `;

  // Attach menu click listeners
  const tabs = container.querySelectorAll('[data-admin-tab]');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => {
        t.classList.remove('active');
        t.style.borderColor = 'transparent';
      });
      tab.classList.add('active');
      tab.style.borderBottomColor = 'var(--primary)';
      
      activeAdminTab = tab.dataset.admin-tab;
      renderDashboardContent();
    });
  });

  // Highlight initial active tab
  const initialActive = container.querySelector('[data-admin-tab="overview"]');
  initialActive.style.borderBottomColor = 'var(--primary)';

  renderDashboardContent();

  // Listen to store-changed events for updating the dashboard metrics instantly
  window.addEventListener('store-changed', () => {
    // Recalculate metrics on the stat cards
    const freshStats = store.getStats();
    const moneyEl = container.querySelector('#stats-total-money');
    const donorsEl = container.querySelector('#stats-donors-count');
    const campsEl = container.querySelector('#stats-active-campaigns');
    const volsEl = container.querySelector('#stats-pending-vols');

    if (moneyEl) moneyEl.textContent = `$${freshStats.totalDonations.toLocaleString()}`;
    if (donorsEl) donorsEl.textContent = freshStats.uniqueDonors;
    if (campsEl) campsEl.textContent = freshStats.activeCampaigns;
    if (volsEl) {
      volsEl.textContent = freshStats.pendingVolunteers;
      volsEl.style.color = freshStats.pendingVolunteers > 0 ? 'var(--warning)' : '';
    }

    renderDashboardContent();
  });
}
export default renderAdmin;
