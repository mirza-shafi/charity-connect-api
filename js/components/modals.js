/* Modal Dialogs Controller */
import { store } from '../store.js';
import { StripeService } from '../stripe.js';

export const Modals = {
  container: null,

  init(containerElement) {
    this.container = containerElement;
    
    // Bind backdrop click to close modal
    this.container.addEventListener('click', (e) => {
      if (e.target === this.container) {
        this.close();
      }
    });
  },

  close() {
    this.container.classList.add('hidden');
    this.container.innerHTML = '';
  },

  // Renders standard modal template wrapper
  renderModalWrapper(title, bodyHtml, footerHtml = '', extraClass = '') {
    this.container.classList.remove('hidden');
    this.container.innerHTML = `
      <div class="modal-content ${extraClass}">
        <div class="modal-header">
          <h3 class="modal-title">${title}</h3>
          <button class="modal-close" onclick="app.closeModal()">&times;</button>
        </div>
        <div class="modal-body">
          ${bodyHtml}
        </div>
        ${footerHtml ? `<div class="modal-footer">${footerHtml}</div>` : ''}
      </div>
    `;
  },

  /* ========================================================
     1. AUTHENTICATION MODAL (Login / Register / Forgot Password)
     ======================================================== */
  showAuth(activeTab = 'login') {
    const renderAuthBody = (tab) => `
      <div class="admin-tabs" style="margin-bottom: 20px;">
        <button class="admin-tab-btn ${tab === 'login' ? 'active' : ''}" id="tab-login-btn">Sign In</button>
        <button class="admin-tab-btn ${tab === 'register' ? 'active' : ''}" id="tab-register-btn">Register</button>
      </div>

      <!-- Login Panel -->
      <form id="auth-login-form" class="${tab === 'login' ? '' : 'hidden'}">
        <div class="form-group">
          <label class="form-label">Email Address</label>
          <input type="email" id="login-email" required class="form-input" placeholder="e.g. donor@example.com">
        </div>
        <div class="form-group">
          <label class="form-label">Password</label>
          <input type="password" id="login-password" required class="form-input" placeholder="••••••••">
        </div>
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
          <a href="#" id="auth-forgot-trigger" style="font-size: 0.85rem;">Forgot password?</a>
        </div>
        <button type="submit" class="btn btn-primary btn-full">Sign In</button>
      </form>

      <!-- Registration Panel -->
      <form id="auth-register-form" class="${tab === 'register' ? '' : 'hidden'}">
        <div class="form-group">
          <label class="form-label">Full Name</label>
          <input type="text" id="reg-name" required class="form-input" placeholder="e.g. Alex Johnson">
        </div>
        <div class="form-group">
          <label class="form-label">Email Address</label>
          <input type="email" id="reg-email" required class="form-input" placeholder="e.g. alex@example.com">
        </div>
        <div class="form-group">
          <label class="form-label">Create Password</label>
          <input type="password" id="reg-password" required class="form-input" placeholder="At least 6 characters">
        </div>
        <div style="font-size: 0.8rem; margin-bottom: 20px; color: var(--text-muted);">
          <input type="checkbox" required id="reg-consent" style="margin-right: 6px;">
          I consent to Charity Connect collecting my name and email to manage my donations in compliance with data privacy regulations.
        </div>
        <button type="submit" class="btn btn-accent btn-full">Create Account</button>
      </form>

      <!-- Forgot Password Panel -->
      <form id="auth-forgot-form" class="hidden">
        <div style="margin-bottom: 15px; font-size: 0.9rem; color: var(--text-muted);">
          Enter your registered email address below, and we will send you a simulated password reset link.
        </div>
        <div class="form-group">
          <label class="form-label">Email Address</label>
          <input type="email" id="forgot-email" required class="form-input" placeholder="donor@example.com">
        </div>
        <div style="display: flex; gap: 10px; margin-top: 20px;">
          <button type="button" id="forgot-back-btn" class="btn btn-secondary" style="flex: 1;">Back</button>
          <button type="submit" class="btn btn-primary" style="flex: 2;">Reset Password</button>
        </div>
      </form>
    `;

    this.renderModalWrapper("Account Access", renderAuthBody(activeTab));
    this.bindAuthEvents();
  },

  bindAuthEvents() {
    const modalEl = this.container.querySelector('.modal-content');
    const loginForm = modalEl.querySelector('#auth-login-form');
    const regForm = modalEl.querySelector('#auth-register-form');
    const forgotForm = modalEl.querySelector('#auth-forgot-form');

    const tabLogin = modalEl.querySelector('#tab-login-btn');
    const tabRegister = modalEl.querySelector('#tab-register-btn');

    // Tab Toggling
    tabLogin.addEventListener('click', () => {
      tabLogin.classList.add('active');
      tabRegister.classList.remove('active');
      loginForm.classList.remove('hidden');
      regForm.classList.add('hidden');
      forgotForm.classList.add('hidden');
    });

    tabRegister.addEventListener('click', () => {
      tabRegister.classList.add('active');
      tabLogin.classList.remove('active');
      regForm.classList.remove('hidden');
      loginForm.classList.add('hidden');
      forgotForm.classList.add('hidden');
    });

    // Forgot Password Flow
    modalEl.querySelector('#auth-forgot-trigger').addEventListener('click', (e) => {
      e.preventDefault();
      loginForm.classList.add('hidden');
      regForm.classList.add('hidden');
      forgotForm.classList.remove('hidden');
    });

    modalEl.querySelector('#forgot-back-btn').addEventListener('click', () => {
      forgotForm.classList.add('hidden');
      loginForm.classList.remove('hidden');
    });

    // Forms Submissions
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = loginForm.querySelector('#login-email').value;
      const pass = loginForm.querySelector('#login-password').value;
      
      try {
        store.login(email, pass);
        window.dispatchEvent(new Event('store-changed'));
        app.showToast("Welcome Back!", `Signed in successfully.`, "success");
        this.close();
      } catch (err) {
        app.showToast("Sign In Failed", err.message, "error");
      }
    });

    regForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = regForm.querySelector('#reg-name').value;
      const email = regForm.querySelector('#reg-email').value;
      const pass = regForm.querySelector('#reg-password').value;
      
      if (pass.length < 4) {
        app.showToast("Weak Password", "Password should be at least 4 characters for demonstration.", "warning");
        return;
      }

      try {
        store.register(name, email, pass);
        window.dispatchEvent(new Event('store-changed'));
        app.showToast("Registration Success", `Welcome to Charity Connect, ${name}!`, "success");
        this.close();
      } catch (err) {
        app.showToast("Registration Failed", err.message, "error");
      }
    });

    forgotForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = forgotForm.querySelector('#forgot-email').value;
      
      try {
        store.resetPassword(email);
        app.showToast("Reset Link Simulated", `A password reset link instructions email was simulated for ${email}.`, "info");
        forgotForm.classList.add('hidden');
        loginForm.classList.remove('hidden');
      } catch (err) {
        app.showToast("Reset Failed", err.message, "error");
      }
    });
  },

  /* ========================================================
     2. DONATION MODAL (2-Column Zero-Scroll Stripe Checkout)
     ======================================================== */
  showDonation(campaignId = '') {
    const campaigns = store.getCampaigns();
    const currentUser = store.getCurrentUser();
    
    // State
    const checkoutState = {
      campaignId: campaignId || (campaigns[0] ? campaigns[0].id : ''),
      amount: 25,
      type: 'one-time',
      name: currentUser ? currentUser.name : '',
      email: currentUser ? currentUser.email : '',
      paymentMethod: 'card'
    };

    const renderCheckout = () => {
      const campOptions = campaigns.map(c => `
        <option value="${c.id}" ${checkoutState.campaignId === c.id ? 'selected' : ''}>${c.title}</option>
      `).join('');

      const html = `
        <div class="stripe-checkout-grid">
          <!-- LEFT COLUMN: Cause & Amount Selection -->
          <div style="background: var(--border-light); padding: 18px; border-radius: var(--radius-md); border: 1px solid var(--border);">
            <div style="margin-bottom: 14px;">
              <label class="form-label" style="font-size: 0.8rem; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px;">Support Campaign</label>
              <select id="donate-campaign-select" class="form-select" style="font-weight: 600; padding: 10px 12px;">
                ${campOptions}
              </select>
            </div>

            <div style="margin-bottom: 14px;">
              <label class="form-label" style="font-size: 0.8rem; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px;">Frequency</label>
              <div style="display: flex; gap: 8px;">
                <button type="button" class="btn ${checkoutState.type === 'one-time' ? 'btn-primary' : 'btn-secondary'} btn-sm" id="btn-type-onetime" style="flex: 1; padding: 8px;">Give Once</button>
                <button type="button" class="btn ${checkoutState.type === 'recurring' ? 'btn-primary' : 'btn-secondary'} btn-sm" id="btn-type-recurring" style="flex: 1; padding: 8px;">Give Monthly</button>
              </div>
            </div>

            <div style="margin-bottom: 14px;">
              <label class="form-label" style="font-size: 0.8rem; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 6px;">Select Amount (USD)</label>
              <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 6px; margin-bottom: 8px;">
                <button type="button" class="btn ${checkoutState.amount === 10 ? 'btn-accent' : 'btn-secondary'} btn-sm btn-amount-preset" data-val="10">$10</button>
                <button type="button" class="btn ${checkoutState.amount === 25 ? 'btn-accent' : 'btn-secondary'} btn-sm btn-amount-preset" data-val="25">$25</button>
                <button type="button" class="btn ${checkoutState.amount === 50 ? 'btn-accent' : 'btn-secondary'} btn-sm btn-amount-preset" data-val="50">$50</button>
                <button type="button" class="btn ${checkoutState.amount === 100 ? 'btn-accent' : 'btn-secondary'} btn-sm btn-amount-preset" data-val="100">$100</button>
              </div>
              <input type="number" id="donate-amount-custom" class="form-input" placeholder="Or enter custom amount" value="${[10,25,50,100].includes(checkoutState.amount) ? '' : checkoutState.amount}" style="padding: 8px 12px; font-size: 0.9rem;">
            </div>

            <!-- Total Gift Summary -->
            <div style="border-top: 1px dashed var(--border); padding-top: 12px; margin-top: 12px; display: flex; justify-content: space-between; align-items: baseline;">
              <span style="font-size: 0.85rem; color: var(--text-muted); font-weight: 600;">Total Gift:</span>
              <span style="font-size: 1.5rem; font-weight: 800; color: var(--primary);">$${checkoutState.amount.toFixed(2)} <span style="font-size: 0.85rem; color: var(--text-muted); font-weight: 600;">USD</span></span>
            </div>
          </div>

          <!-- RIGHT COLUMN: Donor Info & Separate Card Inputs -->
          <div>
            <!-- Donor Info -->
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 12px;">
              <div>
                <label class="form-label" style="font-size: 0.8rem; margin-bottom: 4px;">Full Name</label>
                <input type="text" id="donor-name" required class="form-input" placeholder="Alex Johnson" value="${checkoutState.name}" style="padding: 8px 12px; font-size: 0.88rem;">
              </div>
              <div>
                <label class="form-label" style="font-size: 0.8rem; margin-bottom: 4px;">Email</label>
                <input type="email" id="donor-email" required class="form-input" placeholder="alex@example.com" value="${checkoutState.email}" style="padding: 8px 12px; font-size: 0.88rem;">
              </div>
            </div>

            <!-- Payment Method Tabs -->
            <div class="admin-tabs" style="margin-bottom: 12px; font-size: 0.8rem;">
              <button class="admin-tab-btn ${checkoutState.paymentMethod === 'card' ? 'active' : ''}" id="pay-tab-card" style="padding: 6px 10px;"><i class="fa-solid fa-credit-card"></i> Card</button>
              <button class="admin-tab-btn ${checkoutState.paymentMethod === 'paypal' ? 'active' : ''}" id="pay-tab-paypal" style="padding: 6px 10px;"><i class="fa-brands fa-paypal"></i> PayPal</button>
              <button class="admin-tab-btn ${checkoutState.paymentMethod === 'mobile' ? 'active' : ''}" id="pay-tab-mobile" style="padding: 6px 10px;"><i class="fa-solid fa-mobile-screen"></i> Wallet</button>
            </div>

            <!-- Card Section (SEPARATE INPUT FIELDS) -->
            <div id="pay-form-card" class="${checkoutState.paymentMethod === 'card' ? '' : 'hidden'}">
              <div style="margin-bottom: 10px;">
                <label class="form-label" style="font-size: 0.8rem; margin-bottom: 4px;">Card Number</label>
                <div id="stripe-card-number-container" style="border: 1.5px solid var(--border); border-radius: var(--radius-md); padding: 9px 12px; background: var(--card-bg);">
                  <!-- Stripe Card Number Element -->
                </div>
              </div>

              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 12px;">
                <div>
                  <label class="form-label" style="font-size: 0.8rem; margin-bottom: 4px;">Expiration Date</label>
                  <div id="stripe-card-expiry-container" style="border: 1.5px solid var(--border); border-radius: var(--radius-md); padding: 9px 12px; background: var(--card-bg);">
                    <!-- Stripe Expiry Element -->
                  </div>
                </div>
                <div>
                  <label class="form-label" style="font-size: 0.8rem; margin-bottom: 4px;">CVC / CVV</label>
                  <div id="stripe-card-cvc-container" style="border: 1.5px solid var(--border); border-radius: var(--radius-md); padding: 9px 12px; background: var(--card-bg);">
                    <!-- Stripe CVC Element -->
                  </div>
                </div>
              </div>
            </div>

            <!-- PayPal Panel -->
            <div id="pay-form-paypal" class="${checkoutState.paymentMethod === 'paypal' ? '' : 'hidden'}">
              <div style="text-align: center; padding: 15px 0;">
                <i class="fa-brands fa-paypal" style="font-size: 2.5rem; color: #003087; margin-bottom: 6px;"></i>
                <p style="font-size: 0.82rem; color: var(--text-muted);">Redirecting to PayPal secure checkout.</p>
              </div>
            </div>

            <!-- Mobile Panel -->
            <div id="pay-form-mobile" class="${checkoutState.paymentMethod === 'mobile' ? '' : 'hidden'}">
              <div style="text-align: center; padding: 15px 0;">
                <i class="fa-solid fa-qrcode" style="font-size: 3rem; color: #0f172a; margin-bottom: 6px;"></i>
                <p style="font-size: 0.82rem; color: var(--text-muted);">Scan via Apple Pay, Google Pay or Mobile App.</p>
              </div>
            </div>

            <!-- Submit Button -->
            <button type="button" id="donate-submit-btn" class="btn btn-accent btn-full" style="background: #635bff; border-color: #635bff; color: #fff; padding: 12px; font-size: 1rem; font-weight: 700; margin-top: 4px; box-shadow: 0 4px 12px rgba(99, 91, 255, 0.3);">
              <i class="fa-solid fa-lock" style="margin-right: 6px; font-size: 0.85rem;"></i> Donate $${checkoutState.amount.toFixed(2)}
            </button>

            <!-- Security Footer -->
            <div style="margin-top: 10px; text-align: center; font-size: 0.75rem; color: var(--text-light); display: flex; align-items: center; justify-content: center; gap: 6px;">
              <i class="fa-solid fa-shield-cat" style="color: #10b981;"></i>
              <span>256-Bit Encrypted Payment • Powered by Stripe</span>
            </div>
          </div>
        </div>
      `;

      this.renderModalWrapper("Complete Donation", html, '', 'stripe-checkout-modal');
      bindEvents();

      if (checkoutState.paymentMethod === 'card') {
        setTimeout(() => {
          StripeService.mountSplitCardElements(
            'stripe-card-number-container',
            'stripe-card-expiry-container',
            'stripe-card-cvc-container'
          );
        }, 50);
      }
    };

    const bindEvents = () => {
      const modalEl = this.container.querySelector('.modal-content');
      
      const selectCamp = modalEl.querySelector('#donate-campaign-select');
      const btnOnetime = modalEl.querySelector('#btn-type-onetime');
      const btnRecurring = modalEl.querySelector('#btn-type-recurring');
      const presets = modalEl.querySelectorAll('.btn-amount-preset');
      const customInput = modalEl.querySelector('#donate-amount-custom');

      const nameInput = modalEl.querySelector('#donor-name');
      const emailInput = modalEl.querySelector('#donor-email');

      const tabCard = modalEl.querySelector('#pay-tab-card');
      const tabPaypal = modalEl.querySelector('#pay-tab-paypal');
      const tabMobile = modalEl.querySelector('#pay-tab-mobile');
      const submitBtn = modalEl.querySelector('#donate-submit-btn');

      selectCamp.addEventListener('change', (e) => {
        checkoutState.campaignId = e.target.value;
      });

      btnOnetime.addEventListener('click', () => {
        checkoutState.type = 'one-time';
        renderCheckout();
      });

      btnRecurring.addEventListener('click', () => {
        checkoutState.type = 'recurring';
        renderCheckout();
      });

      presets.forEach(btn => {
        btn.addEventListener('click', () => {
          checkoutState.amount = parseFloat(btn.dataset.val);
          renderCheckout();
        });
      });

      if (customInput) {
        customInput.addEventListener('input', (e) => {
          const val = parseFloat(e.target.value);
          if (!isNaN(val) && val > 0) {
            checkoutState.amount = val;
            if (submitBtn) {
              submitBtn.innerHTML = `<i class="fa-solid fa-lock" style="margin-right: 6px; font-size: 0.85rem;"></i> Donate $${val.toFixed(2)}`;
            }
          }
        });
      }

      nameInput.addEventListener('input', (e) => {
        checkoutState.name = e.target.value;
      });

      emailInput.addEventListener('input', (e) => {
        checkoutState.email = e.target.value;
      });

      tabCard.addEventListener('click', () => {
        checkoutState.paymentMethod = 'card';
        renderCheckout();
      });

      tabPaypal.addEventListener('click', () => {
        checkoutState.paymentMethod = 'paypal';
        renderCheckout();
      });

      tabMobile.addEventListener('click', () => {
        checkoutState.paymentMethod = 'mobile';
        renderCheckout();
      });

      submitBtn.addEventListener('click', async () => {
        if (!checkoutState.name || !checkoutState.email) {
          app.showToast("Missing Required Info", "Please enter your name and email address.", "warning");
          return;
        }

        submitBtn.disabled = true;
        submitBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Processing Payment...`;

        try {
          let paymentResult;
          if (checkoutState.paymentMethod === 'card') {
            paymentResult = await StripeService.confirmSplitCardPayment({
              amount: checkoutState.amount,
              campaignId: checkoutState.campaignId,
              donorName: checkoutState.name,
              donorEmail: checkoutState.email,
              type: checkoutState.type
            });
          } else {
            paymentResult = await StripeService.confirmAlternativePayment({
              amount: checkoutState.amount,
              campaignId: checkoutState.campaignId,
              donorName: checkoutState.name,
              donorEmail: checkoutState.email,
              method: checkoutState.paymentMethod,
              type: checkoutState.type
            });
          }

          if (paymentResult.success) {
            const campaign = store.getCampaignById(checkoutState.campaignId);
            store.addDonation({
              id: paymentResult.donationId || ('TX-' + Math.floor(100000 + Math.random() * 900000)),
              campaignId: checkoutState.campaignId,
              campaignTitle: campaign ? campaign.title : 'General Fund',
              amount: checkoutState.amount,
              donorName: checkoutState.name,
              email: checkoutState.email,
              paymentMethod: checkoutState.paymentMethod === 'card' ? 'Stripe Credit Card' : checkoutState.paymentMethod.toUpperCase(),
              type: checkoutState.type,
              date: new Date().toISOString()
            });

            window.dispatchEvent(new Event('store-changed'));
            this.close();

            app.showReceiptModal(paymentResult.donationId || ('TX-' + Math.floor(100000 + Math.random() * 900000)));
            app.showToast("Thank You For Your Support!", `Your gift of $${checkoutState.amount.toFixed(2)} was received.`, "success");
          } else {
            throw new Error(paymentResult.error || "Payment gateway rejected transaction.");
          }
        } catch (err) {
          app.showToast("Payment Failed", err.message, "error");
          submitBtn.disabled = false;
          submitBtn.innerHTML = `<i class="fa-solid fa-lock" style="margin-right: 6px; font-size: 0.85rem;"></i> Donate $${checkoutState.amount.toFixed(2)}`;
        }
      });
    };

    renderCheckout();
  },

  /* ========================================================
     3. RECEIPT MODAL
     ======================================================== */
  showReceipt(donationId) {
    const tx = store.state.donations.find(d => d.id === donationId);
    if (!tx) {
      app.showToast("Receipt Not Found", "Specified donation ID does not exist in local records.", "error");
      return;
    }

    const html = `
      <div style="border: 1px solid var(--border); padding: 24px; border-radius: var(--radius-md); background: #fff; color: #1e293b;">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid var(--primary); padding-bottom: 16px; margin-bottom: 20px;">
          <div>
            <h2 style="color: var(--primary); font-family: var(--font-display); font-size: 1.5rem; font-weight: 800;">Charity Connect</h2>
            <p style="font-size: 0.8rem; color: #64748b;">Official Tax Deductible Receipt</p>
          </div>
          <div style="text-align: right;">
            <div style="font-weight: 700; font-size: 0.9rem;">Receipt #${tx.id}</div>
            <div style="font-size: 0.8rem; color: #64748b;">Date: ${new Date(tx.date).toLocaleDateString()}</div>
          </div>
        </div>

        <div style="margin-bottom: 20px; font-size: 0.9rem; line-height: 1.5;">
          <p><strong>Donor Name:</strong> ${tx.donorName}</p>
          <p><strong>Donor Email:</strong> ${tx.email}</p>
          <p><strong>Payment Method:</strong> ${tx.paymentMethod}</p>
          <p><strong>Donation Frequency:</strong> ${tx.type === 'recurring' ? 'Monthly Subscription' : 'One-Time Contribution'}</p>
        </div>

        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin-bottom: 20px;">
          <div style="display: flex; justify-content: space-between; font-weight: 600; margin-bottom: 8px;">
            <span>Supported Campaign:</span>
            <span>${tx.campaignTitle}</span>
          </div>
          <div style="display: flex; justify-content: space-between; font-weight: 800; font-size: 1.25rem; color: var(--primary); border-top: 1px solid #cbd5e1; padding-top: 8px; margin-top: 8px;">
            <span>Total Donated:</span>
            <span>$${tx.amount.toFixed(2)} USD</span>
          </div>
        </div>

        <div style="text-align: center; font-size: 0.75rem; color: #94a3b8; line-height: 1.4;">
          Charity Connect is a registered 501(c)(3) non-profit organization. Tax ID: 84-2910394. No goods or services were provided in exchange for this gift.
        </div>
      </div>
    `;

    const footerHtml = `
      <button class="btn btn-secondary" onclick="window.print()"><i class="fa-solid fa-print"></i> Print Receipt</button>
      <button class="btn btn-primary" onclick="app.closeModal()">Done</button>
    `;

    this.renderModalWrapper("Donation Receipt", html, footerHtml);
  }
};
export default Modals;
