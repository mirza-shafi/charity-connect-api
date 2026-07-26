/* Volunteer Opportunities and Registration Page */
import { store } from '../store.js';

export function renderVolunteer(container, queryParams) {
  const campaigns = store.getCampaigns();
  
  // List of active mock volunteer postings
  const positions = [
    {
      title: "Community Outreach Organizer",
      time: "Part-time (5 hours/week)",
      desc: "Help organize food distributions, verify regional local delivery points, and manage local volunteers on site.",
      interest: "Zero Hunger Project"
    },
    {
      title: "Digital Advocacy Advocate",
      time: "Remote (Flexible)",
      desc: "Share updates, write success stories, edit photos, and help moderate our digital communication platforms.",
      interest: "Bright Minds Scholarship"
    },
    {
      title: "Logistics Specialist",
      time: "On-call / Weekend Operations",
      desc: "Assist in sorting donations, packing emergency disaster response containers, and coordinating truck transfers.",
      interest: "Emergency Disaster Response"
    }
  ];

  const renderPositions = () => {
    return positions.map(pos => `
      <div style="background: var(--card-bg); border: 1px solid var(--border); border-radius: var(--radius-md); padding: 20px; box-shadow: var(--shadow-sm); display: flex; flex-direction: column; justify-content: space-between;">
        <div>
          <span class="status-badge status-approved" style="font-size: 0.7rem; margin-bottom: 8px;">${pos.time}</span>
          <h3 style="font-size: 1.15rem; margin-bottom: 8px;">${pos.title}</h3>
          <p style="font-size: 0.9rem; color: var(--text-muted); line-height: 1.4; margin-bottom: 15px;">${pos.desc}</p>
        </div>
        <button class="btn btn-outline btn-sm apply-preset-btn" data-interest="${pos.interest}" style="margin-top: auto; align-self: flex-start;">Apply for this role</button>
      </div>
    `).join('');
  };

  const currentEmail = store.getCurrentUser() ? store.getCurrentUser().email : '';
  const currentName = store.getCurrentUser() ? store.getCurrentUser().name : '';

  // Page structure HTML
  container.innerHTML = `
    <section class="section">
      <div class="container">
        <h1 class="section-title">Volunteer Registry</h1>
        <p class="section-subtitle">Be the change in the field. Join our force of passionate volunteers and work directly on our projects.</p>

        <div class="grid grid-2" style="gap: 50px; align-items: flex-start;">
          <!-- Left: Opportunities list -->
          <div>
            <h2 style="font-size: 1.75rem; margin-bottom: 24px;">Current Opportunities</h2>
            <div style="display: flex; flex-direction: column; gap: 20px;">
              ${renderPositions()}
            </div>
          </div>

          <!-- Right: Registration Form -->
          <div style="background: var(--card-bg); border: 1px solid var(--border); border-radius: var(--radius-lg); padding: 30px; box-shadow: var(--shadow-md);">
            <h2 style="font-size: 1.75rem; margin-bottom: 12px;">Volunteer Online</h2>
            <p style="color: var(--text-muted); font-size: 0.9rem; margin-bottom: 24px;">
              Fill in your details below, and our community moderators will schedule a quick introductory interview with you.
            </p>

            <form id="volunteer-reg-form">
              <div class="form-group">
                <label class="form-label">Full Name</label>
                <input type="text" id="vol-name" required class="form-input" placeholder="e.g. Jane Smith" value="${currentName}">
              </div>
              
              <div class="form-group">
                <label class="form-label">Email Address</label>
                <input type="email" id="vol-email" required class="form-input" placeholder="e.g. jane@example.com" value="${currentEmail}">
              </div>

              <div class="form-group">
                <label class="form-label">Phone Number</label>
                <input type="tel" id="vol-phone" required class="form-input" placeholder="e.g. +1 (555) 019-2834">
              </div>

              <div class="form-group">
                <label class="form-label">Preferred Focus Area</label>
                <select id="vol-interest" class="form-select">
                  <option value="General Volunteer Help">General / Anywhere Needed</option>
                  ${campaigns.map(c => `<option value="${c.title}">${c.title}</option>`).join('')}
                </select>
              </div>

              <div class="form-group">
                <label class="form-label">Skills & Qualifications</label>
                <textarea id="vol-skills" class="form-textarea" placeholder="Tell us about your background, relevant qualifications, or what drives you to volunteer..." required></textarea>
              </div>

              <button type="submit" class="btn btn-accent btn-full" style="margin-top: 10px;">Submit Application</button>
            </form>
          </div>
        </div>
      </div>
    </section>
  `;

  const form = container.querySelector('#volunteer-reg-form');
  const interestSelect = container.querySelector('#vol-interest');

  // Apply preset button event triggers
  container.querySelectorAll('.apply-preset-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const interest = btn.dataset.interest;
      interestSelect.value = interest;
      // Scroll form into view
      form.scrollIntoView({ behavior: 'smooth' });
      
      // Focus on skills textarea
      container.querySelector('#vol-skills').focus();
    });
  });

  // Submit volunteer application
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = container.querySelector('#vol-name').value;
    const email = container.querySelector('#vol-email').value;
    const phone = container.querySelector('#vol-phone').value;
    const interest = interestSelect.value;
    const skills = container.querySelector('#vol-skills').value;

    try {
      store.applyVolunteer(name, email, phone, skills, interest);
      
      app.showToast(
        "Application Received", 
        "Your volunteer registration was sent. An email status update was simulated.", 
        "success"
      );
      
      // Reset form
      form.reset();
      
      // Auto prefill if still logged in
      const reUser = store.getCurrentUser();
      if (reUser) {
        container.querySelector('#vol-name').value = reUser.name;
        container.querySelector('#vol-email').value = reUser.email;
      }
    } catch (err) {
      app.showToast("Submission Failed", err.message, "error");
    }
  });
}
export default renderVolunteer;
