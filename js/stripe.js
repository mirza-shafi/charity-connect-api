/* Stripe Payment Service Module */

const STRIPE_PUBLISHABLE_KEY = 'pk_test_51Tw3QlPSvul6NvRotKN9rtUtHqrc5bD3TNt1FjPwB8s1vbqAqAZvvlJSKYcMM3fTosTEX37TqgyND9NXtrnt1gAV00bx4YDYyj';

class StripeServiceClass {
  constructor() {
    this.stripe = null;
    this.elements = null;
    this.cardElement = null;
    this.initialized = false;
  }

  /**
   * Initialize Stripe.js with the publishable key.
   * Called once when the app loads.
   */
  init() {
    if (this.initialized) return;
    
    if (typeof Stripe === 'undefined') {
      console.warn('Stripe.js not loaded. Payment features will be unavailable.');
      return;
    }

    try {
      this.stripe = Stripe(STRIPE_PUBLISHABLE_KEY);
      this.initialized = true;
    } catch (e) {
      console.error('Failed to initialize Stripe:', e);
    }
  }

  /**
   * Mount a Stripe Card Element into a DOM container.
   * @param {string} containerId - The id of the DOM element to mount into
   * @param {Function} [onChangeCallback] - Optional callback for real-time validation events
   * @returns {boolean} True if mounted successfully
   */
  mountCardElement(containerId, onChangeCallback) {
    if (!this.initialized) {
      this.init();
    }

    if (!this.stripe) {
      console.error('Stripe not available.');
      return false;
    }

    // Unmount any previous element
    this.unmount();

    const container = document.getElementById(containerId);
    if (!container) {
      console.error(`Container #${containerId} not found in DOM.`);
      return false;
    }

    // Detect dark mode for styling
    const isDark = document.body.classList.contains('dark-mode');
    
    // Create Elements instance with custom styling
    this.elements = this.stripe.elements({
      fonts: [
        {
          cssSrc: 'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600&display=swap'
        }
      ]
    });

    // Stripe Element style config matching our theme
    const style = {
      base: {
        fontFamily: '"Plus Jakarta Sans", sans-serif',
        fontSize: '16px',
        fontWeight: '500',
        color: isDark ? '#e2e8f0' : '#1e293b',
        letterSpacing: '0.025em',
        '::placeholder': {
          color: isDark ? '#64748b' : '#94a3b8',
        },
        iconColor: isDark ? '#e2e8f0' : '#475569',
      },
      invalid: {
        color: '#ef4444',
        iconColor: '#ef4444',
      },
      complete: {
        iconColor: '#10b981',
      }
    };

    // Create the single-line card element (number, expiry, CVC all in one)
    this.cardElement = this.elements.create('card', {
      style: style,
      hidePostalCode: true,
    });

    // Mount into the container
    this.cardElement.mount(`#${containerId}`);
    return true;
  }

  /**
   * Mount separate split Stripe Elements for Card Number, Expiration Date, and CVC
   */
  mountSplitCardElements(numId, expId, cvcId) {
    if (!this.initialized || !this.stripe) {
      this.init();
    }
    if (!this.stripe) return false;

    this.unmount();
    this.elements = this.stripe.elements();

    const style = {
      base: {
        color: '#1e293b',
        fontFamily: 'Inter, system-ui, sans-serif',
        fontSmoothing: 'antialiased',
        fontSize: '14px',
        lineHeight: '22px',
        '::placeholder': { color: '#94a3b8' }
      },
      invalid: {
        color: '#ef4444'
      }
    };

    try {
      this.cardNumber = this.elements.create('cardNumber', { style });
      this.cardNumber.mount(`#${numId}`);

      this.cardExpiry = this.elements.create('cardExpiry', { style });
      this.cardExpiry.mount(`#${expId}`);

      this.cardCvc = this.elements.create('cardCvc', { style });
      this.cardCvc.mount(`#${cvcId}`);

      this.cardElement = this.cardNumber;
      return true;
    } catch (e) {
      console.warn('Split card mount fallback:', e.message);
      return false;
    }
  }

  /**
   * Listen for card change validation
   */

  /**
   * Create a Stripe Token from the mounted card element.
   * This validates the card details and returns a token.
   * @param {Object} [additionalData] - Optional data like name, address
   * @returns {Promise<{token: Object|null, error: Object|null}>}
   */
  async createToken(additionalData = {}) {
    if (!this.stripe || !this.cardElement) {
      return {
        token: null,
        error: { message: 'Stripe payment form is not initialized. Please refresh the page.' }
      };
    }

    try {
      const result = await this.stripe.createToken(this.cardElement, additionalData);
      
      if (result.error) {
        return { token: null, error: result.error };
      }
      
      return { token: result.token, error: null };
    } catch (e) {
      return {
        token: null,
        error: { message: 'An unexpected error occurred during payment processing. Please try again.' }
      };
    }
  }

  /**
   * Unmount and destroy the current card element.
   */
  unmount() {
    if (this.cardElement) {
      try {
        this.cardElement.unmount();
        this.cardElement.destroy();
      } catch (e) {
        // Element may already be destroyed
      }
      this.cardElement = null;
    }
    this.elements = null;
  }

  /**
   * Send donation to live Stripe Backend server to log in Stripe Dashboard
   */
  async processStripeDonation({ amount, name, email, campaignTitle, isZakat }) {
    try {
      const response = await fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount, name, email, campaignTitle, isZakat })
      });
      const data = await response.json();
      if (data.error) {
        console.error('Stripe Backend Error:', data.error);
        return { success: false, error: data.error };
      }
      return { success: true, data };
    } catch (e) {
      console.warn('Stripe Backend connection error:', e.message);
      return { success: false, error: e.message };
    }
  }

  /**
   * Check if Stripe is available and initialized.
   * @returns {boolean}
   */
  isAvailable() {
    return this.initialized && this.stripe !== null;
  }
}

export const StripeService = new StripeServiceClass();
export default StripeService;
