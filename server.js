import express from 'express';
import Stripe from 'stripe';
import cors from 'cors';

const app = express();
const port = 3000;

// User's Stripe Secret Key
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || '';
const stripe = new Stripe(STRIPE_SECRET_KEY);

app.use(cors());
app.use(express.json());

// API Endpoint to Create a Live Stripe PaymentIntent
app.post('/api/create-payment-intent', async (req, res) => {
  try {
    const { amount, currency = 'usd', name, email, campaignTitle, isZakat } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Valid donation amount is required.' });
    }

    // Amount in cents for Stripe API (e.g. $25.00 = 2500)
    const amountInCents = Math.round(amount * 100);

    // Create PaymentIntent via Stripe API
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: currency.toLowerCase(),
      payment_method_types: ['card'],
      description: `Donation: ${campaignTitle || 'Charity Connect Contribution'}`,
      receipt_email: email || undefined,
      metadata: {
        donor_name: name || 'Anonymous Donor',
        donor_email: email || 'donor@example.com',
        campaign: campaignTitle || 'General Charity',
        is_zakat: isZakat ? 'Yes' : 'No'
      }
    });

    console.log(`[Stripe Backend] Created PaymentIntent ${paymentIntent.id} for $${amount}`);

    res.json({
      clientSecret: paymentIntent.client_secret,
      id: paymentIntent.id
    });
  } catch (error) {
    console.error('[Stripe Backend Error]:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// API Endpoint to Confirm/Process Charge live
app.post('/api/process-donation', async (req, res) => {
  try {
    const { amount, name, email, campaignTitle, paymentMethodId } = req.body;

    const amountInCents = Math.round(amount * 100);

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: 'usd',
      confirm: true,
      payment_method: paymentMethodId || 'pm_card_visa',
      return_url: 'http://localhost:5173/',
      description: `Donation: ${campaignTitle || 'Charity Connect'}`,
      receipt_email: email || undefined,
      metadata: { donor_name: name, donor_email: email, campaign: campaignTitle }
    });

    res.json({ success: true, paymentIntent });
  } catch (error) {
    console.error('[Stripe Backend Error]:', error.message);
    res.status(500).json({ error: error.message });
  }
});

app.listen(port, () => {
  console.log(`🚀 Stripe Backend Server listening on http://localhost:${port}`);
});
