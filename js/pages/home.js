/* Home Page View */
import { store } from '../store.js';

export function renderHome(container, queryParams) {
  const campaigns = store.getCampaigns().slice(0, 3); // top 3 active campaigns
  const stats = store.getStats();

  // Create Campaign cards HTML
  const campaignsHtml = campaigns.map(c => {
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

  container.innerHTML = `
    <!-- Hero Banner -->
    <section class="hero-section" style="
      background: linear-gradient(135deg, rgba(15, 118, 110, 0.95), rgba(15, 23, 42, 0.9)), url('https://images.unsplash.com/photo-1469571486040-7a9785ad667f?w=1600&auto=format&fit=crop&q=80');
      background-size: cover;
      background-position: center;
      color: #fff;
      padding: 120px 0 100px 0;
      text-align: center;
      position: relative;
    ">
      <div class="container" style="max-width: 800px; position: relative; z-index: 1;">
        <span style="
          background: rgba(245, 158, 11, 0.2); 
          color: var(--accent); 
          font-weight: 700; 
          font-size: 0.85rem; 
          text-transform: uppercase; 
          letter-spacing: 2px;
          padding: 6px 16px;
          border-radius: var(--radius-full);
          border: 1px solid rgba(245, 158, 11, 0.4);
          display: inline-block;
          margin-bottom: 20px;
        ">
          Empowering Communities & Transforming Lives
        </span>
        <h1 style="font-size: 3.5rem; margin-bottom: 20px; font-family: var(--font-display); line-height: 1.1; color: white;">
          Your Gift Can Shape a Better Tomorrow
        </h1>
        <p style="font-size: 1.25rem; margin-bottom: 40px; opacity: 0.9; line-height: 1.6; font-weight: 300;">
          Charity Connect links passionate supporters with sustainable local initiatives. Join our active global community to fight hunger, protect education, and secure clean water.
        </p>
        <div style="display: flex; gap: 16px; justify-content: center; flex-wrap: wrap;">
          <a href="#/campaigns" class="btn btn-accent btn-lg">Explore Campaigns</a>
          <a href="#/volunteer" class="btn btn-outline btn-lg" style="border-color: #fff; color: #fff;">Become Volunteer</a>
        </div>
      </div>
    </section>

    <!-- Impact Numbers Section -->
    <section class="section" style="background: var(--card-bg); border-bottom: 1px solid var(--border); padding: 50px 0;">
      <div class="container">
        <div class="grid grid-4" style="text-align: center;">
          <div style="padding: 10px;">
            <div style="font-size: 3rem; font-family: var(--font-display); font-weight: 800; color: var(--primary);">$${stats.totalDonations.toLocaleString()}</div>
            <div style="font-weight: 600; color: var(--text-muted); text-transform: uppercase; font-size: 0.85rem; letter-spacing: 0.5px;">Total Funds Raised</div>
          </div>
          <div style="padding: 10px;">
            <div style="font-size: 3rem; font-family: var(--font-display); font-weight: 800; color: var(--primary);">${stats.uniqueDonors + 120}</div>
            <div style="font-weight: 600; color: var(--text-muted); text-transform: uppercase; font-size: 0.85rem; letter-spacing: 0.5px;">Global Donors Force</div>
          </div>
          <div style="padding: 10px;">
            <div style="font-size: 3rem; font-family: var(--font-display); font-weight: 800; color: var(--primary);">45+</div>
            <div style="font-weight: 600; color: var(--text-muted); text-transform: uppercase; font-size: 0.85rem; letter-spacing: 0.5px;">Completed Projects</div>
          </div>
          <div style="padding: 10px;">
            <div style="font-size: 3rem; font-family: var(--font-display); font-weight: 800; color: var(--primary);">9,200+</div>
            <div style="font-weight: 600; color: var(--text-muted); text-transform: uppercase; font-size: 0.85rem; letter-spacing: 0.5px;">Families Impacted</div>
          </div>
        </div>
      </div>
    </section>

    <!-- Featured Campaigns Section -->
    <section class="section">
      <div class="container">
        <h2 class="section-title">Featured Campaigns</h2>
        <p class="section-subtitle">Take direct action. Donate to our current, high-priority fundraising drives and help change lives today.</p>
        
        <div class="grid grid-3">
          ${campaignsHtml}
        </div>
        
        <div style="margin-top: 50px; text-align: center;">
          <a href="#/campaigns" class="btn btn-secondary">View All Active Campaigns <i class="fa-solid fa-arrow-right" style="margin-left: 6px;"></i></a>
        </div>
      </div>
    </section>

    <!-- Mission & Core Values Section -->
    <section class="section" style="background: var(--border-light); border-top: 1px solid var(--border); border-bottom: 1px solid var(--border);">
      <div class="container">
        <div class="grid grid-2" style="align-items: center; gap: 60px;">
          <div>
            <h2 style="font-size: 2.25rem; margin-bottom: 20px; text-align: left;">Our Vision, Mission & Goals</h2>
            <p style="margin-bottom: 20px; color: var(--text-muted);">
              Founded in 2020, Charity Connect aims to remove structural wealth inequities and logistics bottlenecks in social aid delivery. We believe that direct, transparent fundraising changes the dynamic of giving.
            </p>
            <div style="display: flex; flex-direction: column; gap: 15px;">
              <div style="display: flex; gap: 15px; align-items: flex-start;">
                <div style="width: 42px; height: 42px; border-radius: 50%; background: var(--primary-alpha); color: var(--primary); display: flex; align-items: center; justify-content: center; flex-shrink: 0;"><i class="fa-solid fa-bullseye"></i></div>
                <div>
                  <h4 style="margin-bottom: 4px;">Direct Giving Model</h4>
                  <p style="font-size: 0.9rem; color: var(--text-muted);">95% of donated funds flow straight to community contractors. No bloated operations.</p>
                </div>
              </div>
              <div style="display: flex; gap: 15px; align-items: flex-start;">
                <div style="width: 42px; height: 42px; border-radius: 50%; background: var(--primary-alpha); color: var(--primary); display: flex; align-items: center; justify-content: center; flex-shrink: 0;"><i class="fa-solid fa-square-poll-vertical"></i></div>
                <div>
                  <h4 style="margin-bottom: 4px;">Dynamic Reports</h4>
                  <p style="font-size: 0.9rem; color: var(--text-muted);">We publish audit reports quarterly showing project completions and geo-location details.</p>
                </div>
              </div>
              <div style="display: flex; gap: 15px; align-items: flex-start;">
                <div style="width: 42px; height: 42px; border-radius: 50%; background: var(--primary-alpha); color: var(--primary); display: flex; align-items: center; justify-content: center; flex-shrink: 0;"><i class="fa-solid fa-shield-halved"></i></div>
                <div>
                  <h4 style="margin-bottom: 4px;">Safe payment system</h4>
                  <p style="font-size: 0.9rem; color: var(--text-muted);">All donation receipts are encrypted and tax-deductible for donors.</p>
                </div>
              </div>
            </div>
          </div>
          <div>
            <div style="position: relative; border-radius: var(--radius-lg); overflow: hidden; box-shadow: var(--shadow-lg);">
              <img src="https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=800&auto=format&fit=crop&q=80" alt="Volunteers in action" style="width: 100%; display: block; object-fit: cover; height: 450px;">
              <div style="
                position: absolute; 
                bottom: 24px; 
                left: 24px; 
                right: 24px; 
                background: var(--glass-bg); 
                backdrop-filter: var(--glass-blur); 
                border: 1px solid var(--glass-border);
                border-radius: var(--radius-md); 
                padding: 20px;
                box-shadow: var(--shadow-md);
              ">
                <h4 style="color: var(--primary-dark); margin-bottom: 6px; font-weight: 700;">"They brought clean drinking water right outside my school door."</h4>
                <p style="font-size: 0.85rem; color: var(--text-muted);">- Amina, Grade 5 student, Rural Kenya</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Volunteer CTA Banner -->
    <section class="section" style="
      background: linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(15, 118, 110, 0.9)), url('https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=1600&auto=format&fit=crop&q=80');
      background-size: cover;
      background-position: center;
      color: white;
      text-align: center;
    ">
      <div class="container" style="max-width: 700px;">
        <h2 style="font-size: 2.25rem; margin-bottom: 16px; color: white;">Ready to Make an Impact?</h2>
        <p style="font-size: 1.1rem; opacity: 0.9; margin-bottom: 30px; line-height: 1.6;">
          Your physical support is just as powerful as financial contributions. Register to join our upcoming disaster relief operations or local community meal prep projects.
        </p>
        <a href="#/volunteer" class="btn btn-accent btn-lg">Apply as a Volunteer</a>
      </div>
    </section>
  `;
}
