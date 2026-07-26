/* Contact Us & FAQ Page */

export function renderContact(container, queryParams) {
  const faqs = [
    {
      q: "Where do my donations go?",
      a: "At Charity Connect, 95% of all incoming donations go directly to project execution, including equipment purchases, local contractor payments, and community raw material supplies. The remaining 5% goes toward merchant transaction fees and basic maintenance of this platform. We publish full financial records quarterly."
    },
    {
      q: "Are donations tax-deductible?",
      a: "Yes! Charity Connect is a registered 501(c)(3) organization. Every donation you make generates a digital tax receipt automatically, which you can download from your Profile dashboard at any time to claim tax write-offs."
    },
    {
      q: "How can I set up monthly recurring giving?",
      a: "When you click 'Donate Now', select 'Monthly Recurring' under the Donation Type section. Your specified payment method will be charged automatically on the same day every month. You can cancel or modify this at any time in your Profile settings."
    },
    {
      q: "How do I sign up as a volunteer?",
      a: "Head to our 'Volunteer' page, review our active positions, and fill in the registration form. Once submitted, our moderators will review your application. You will receive an status update in your notification stream within 2-3 business days."
    },
    {
      q: "Can I sponsor a specific community campaign?",
      a: "Absolutely! Our Donation Modal allows you to choose exactly which active fundraising campaign you would like to support. You can track the progress of that specific campaign on our 'Campaigns' page."
    }
  ];

  const renderFaqHtml = () => {
    return faqs.map((faq, index) => `
      <div class="faq-item" style="
        border: 1px solid var(--border);
        border-radius: var(--radius-md);
        background: var(--card-bg);
        margin-bottom: 12px;
        overflow: hidden;
      ">
        <button type="button" class="faq-trigger" style="
          width: 100%;
          text-align: left;
          background: none;
          border: none;
          padding: 16px 20px;
          font-size: 1rem;
          font-weight: 700;
          color: var(--text);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-family: inherit;
        }">
          <span>${faq.q}</span>
          <i class="fa-solid fa-plus faq-icon" style="transition: transform var(--transition-fast); color: var(--primary);"></i>
        </button>
        <div class="faq-answer hidden" style="
          padding: 0 20px 20px 20px;
          font-size: 0.95rem;
          color: var(--text-muted);
          line-height: 1.5;
          border-top: 1px solid transparent;
        ">
          ${faq.a}
        </div>
      </div>
    `).join('');
  };

  container.innerHTML = `
    <section class="section">
      <div class="container">
        <h1 class="section-title">Get in Touch</h1>
        <p class="section-subtitle">Have questions about our campaigns, events, or tax certificates? Contact our support staff or read our FAQ guide.</p>

        <div class="grid grid-2" style="gap: 50px; align-items: flex-start; margin-bottom: 60px;">
          <!-- Left: Contact Details & Map Mockup -->
          <div>
            <h2 style="font-size: 1.75rem; margin-bottom: 24px;">Office Location</h2>
            <div style="
              background: var(--card-bg);
              border: 1px solid var(--border);
              border-radius: var(--radius-lg);
              overflow: hidden;
              box-shadow: var(--shadow-sm);
              margin-bottom: 30px;
            ">
              <!-- Map Mockup -->
              <div style="
                height: 250px;
                background-color: #cbd5e1;
                background-image: radial-gradient(var(--border) 15%, transparent 16%), radial-gradient(var(--border) 15%, transparent 16%);
                background-size: 20px 20px;
                background-position: 0 0, 10px 10px;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                position: relative;
              ">
                <i class="fa-solid fa-map-location-dot" style="font-size: 4rem; color: var(--primary-alpha); margin-bottom: 10px;"></i>
                <div style="
                  background: var(--card-bg);
                  padding: 8px 16px;
                  border-radius: var(--radius-full);
                  border: 1px solid var(--border);
                  font-size: 0.8rem;
                  font-weight: 700;
                  display: flex;
                  align-items: center;
                  gap: 8px;
                  box-shadow: var(--shadow-md);
                ">
                  <i class="fa-solid fa-location-pin" style="color: var(--danger);"></i>
                  120 Pine Street, SF
                </div>
              </div>
              <div style="padding: 24px; display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                <div>
                  <h4 style="margin-bottom: 6px;"><i class="fa-solid fa-phone" style="color: var(--accent); margin-right: 6px;"></i> Call Us</h4>
                  <p style="font-size: 0.85rem; color: var(--text-muted);">+1 (555) 019-2834<br>Mon-Fri, 9AM - 5PM PST</p>
                </div>
                <div>
                  <h4 style="margin-bottom: 6px;"><i class="fa-solid fa-envelope" style="color: var(--accent); margin-right: 6px;"></i> Email Us</h4>
                  <p style="font-size: 0.85rem; color: var(--text-muted);">support@charityconnect.org<br>Average reply: 24 hours</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Right: Contact Form -->
          <div style="background: var(--card-bg); border: 1px solid var(--border); border-radius: var(--radius-lg); padding: 30px; box-shadow: var(--shadow-md);">
            <h2 style="font-size: 1.75rem; margin-bottom: 12px;">Send an Inquiry</h2>
            <p style="color: var(--text-muted); font-size: 0.9rem; margin-bottom: 24px;">Send us a message using the form below. We will get back to you as soon as possible.</p>
            
            <form id="contact-inquiry-form">
              <div class="form-group">
                <label class="form-label">Your Name</label>
                <input type="text" id="contact-name" required class="form-input" placeholder="e.g. Alex Johnson">
              </div>
              <div class="form-group">
                <label class="form-label">Email Address</label>
                <input type="email" id="contact-email" required class="form-input" placeholder="e.g. alex@example.com">
              </div>
              <div class="form-group">
                <label class="form-label">Subject</label>
                <input type="text" id="contact-subject" required class="form-input" placeholder="How can we help you?">
              </div>
              <div class="form-group">
                <label class="form-label">Message Details</label>
                <textarea id="contact-message" required class="form-textarea" placeholder="Write your message here..."></textarea>
              </div>
              <button type="submit" class="btn btn-primary btn-full" style="margin-top: 10px;">Send Message</button>
            </form>
          </div>
        </div>

        <!-- FAQ Section -->
        <div style="max-width: 800px; margin: 0 auto;">
          <h2 class="section-title">Frequently Asked Questions</h2>
          <p class="section-subtitle">Find quick answers to common questions about donation tax benefits, community registration, and fund delivery models.</p>
          
          <div id="faq-accordions" style="margin-top: 30px;">
            ${renderFaqHtml()}
          </div>
        </div>
      </div>
    </section>
  `;

  // Bind FAQ accordion toggles
  const items = container.querySelectorAll('.faq-item');
  items.forEach(item => {
    const trigger = item.querySelector('.faq-trigger');
    const answer = item.querySelector('.faq-answer');
    const icon = item.querySelector('.faq-icon');

    trigger.addEventListener('click', () => {
      const isHidden = answer.classList.contains('hidden');
      
      // Close other accordions
      container.querySelectorAll('.faq-answer').forEach(ans => ans.classList.add('hidden'));
      container.querySelectorAll('.faq-icon').forEach(ico => ico.className = 'fa-solid fa-plus faq-icon');
      container.querySelectorAll('.faq-answer').forEach(ans => ans.style.borderTopColor = 'transparent');
      
      if (isHidden) {
        answer.classList.remove('hidden');
        answer.style.borderTopColor = 'var(--border)';
        icon.className = 'fa-solid fa-minus faq-icon';
      }
    });
  });

  // Submit Inquiry handler
  const form = container.querySelector('#contact-inquiry-form');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = container.querySelector('#contact-name').value;
    const email = container.querySelector('#contact-email').value;
    const subject = container.querySelector('#contact-subject').value;
    
    app.showToast(
      "Inquiry Received", 
      `Thank you ${name}! We have received your inquiry regarding "${subject}" and sent a copy to ${email}.`, 
      "success"
    );
    form.reset();
  });
}
export default renderContact;
