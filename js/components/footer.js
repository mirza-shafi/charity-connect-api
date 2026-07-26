/* Footer Component */

export const Footer = {
  container: null,

  init(containerElement) {
    this.container = containerElement;
    this.render();
  },

  render() {
    if (!this.container) return;

    this.container.innerHTML = `
      <div class="container">
        <div class="footer-grid">
          <div class="footer-col">
            <a href="#/" class="logo" style="margin-bottom: 20px;">
              <i class="fa-solid fa-hand-holding-heart"></i>
              <span>CharityConnect</span>
            </a>
            <p style="margin-bottom: 20px; font-size: 0.9rem;">
              We are dedicated to building sustainable, self-sufficient communities. Your small contribution drives monumental local progress.
            </p>
            <div class="social-links">
              <a href="#" class="social-btn" aria-label="Facebook"><i class="fa-brands fa-facebook-f"></i></a>
              <a href="#" class="social-btn" aria-label="Twitter"><i class="fa-brands fa-x-twitter"></i></a>
              <a href="#" class="social-btn" aria-label="Instagram"><i class="fa-brands fa-instagram"></i></a>
              <a href="#" class="social-btn" aria-label="YouTube"><i class="fa-brands fa-youtube"></i></a>
            </div>
          </div>
          
          <div class="footer-col">
            <h4>Quick Links</h4>
            <ul class="footer-links">
              <li><a href="#/">Home</a></li>
              <li><a href="#/campaigns">Fundraising Campaigns</a></li>
              <li><a href="#/events">Community Events</a></li>
              <li><a href="#/blog">Latest News & Blogs</a></li>
              <li><a href="#/volunteer">Volunteer Registry</a></li>
            </ul>
          </div>
          
          <div class="footer-col">
            <h4>Contact Info</h4>
            <ul class="footer-links" style="pointer-events: none;">
              <li style="margin-bottom: 12px; display: flex; align-items: flex-start; gap: 10px;">
                <i class="fa-solid fa-location-dot" style="color: var(--accent); margin-top: 4px;"></i>
                <span>120 Pine Street, Suite 400<br>San Francisco, CA 94111</span>
              </li>
              <li style="margin-bottom: 12px; display: flex; align-items: center; gap: 10px;">
                <i class="fa-solid fa-phone" style="color: var(--accent);"></i>
                <span>+1 (555) 019-2834</span>
              </li>
              <li style="margin-bottom: 12px; display: flex; align-items: center; gap: 10px;">
                <i class="fa-solid fa-envelope" style="color: var(--accent);"></i>
                <span>contact@charityconnect.org</span>
              </li>
            </ul>
          </div>
          
          <div class="footer-col">
            <h4>Stay Updated</h4>
            <p style="font-size: 0.85rem; margin-bottom: 16px;">
              Subscribe to our monthly impact reports and emergency response announcements.
            </p>
            <form id="newsletter-form" class="newsletter-form">
              <input type="email" placeholder="Your email address" required class="newsletter-input" aria-label="Email address">
              <button type="submit" class="btn btn-primary btn-sm" style="padding: 10px 14px;"><i class="fa-solid fa-paper-plane"></i></button>
            </form>
          </div>
        </div>
        
        <div class="footer-bottom">
          <p>&copy; 2026 Charity Connect. Created for social impact. All rights reserved.</p>
          <div style="display: flex; gap: 20px;">
            <a href="#" style="color: var(--text-light); font-size: 0.8rem;">Privacy Policy</a>
            <a href="#" style="color: var(--text-light); font-size: 0.8rem;">Terms of Service</a>
          </div>
        </div>
      </div>
    `;

    // Bind newsletter event
    const form = this.container.querySelector('#newsletter-form');
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const input = form.querySelector('input');
        const email = input.value.trim();
        if (email) {
          app.showToast("Subscription Success", `Thank you! ${email} has been subscribed to our newsletter list.`, "success");
          input.value = '';
        }
      });
    }
  }
};
export default Footer;
