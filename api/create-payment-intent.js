import Stripe from 'stripe';

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || '';
const stripe = new Stripe(STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
    const { amount, currency = 'usd', name, email, campaignTitle, isZakat } = body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Valid donation amount is required.' });
    }

    const amountInCents = Math.round(amount * 100);

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

    return res.status(200).json({
      clientSecret: paymentIntent.client_secret,
      id: paymentIntent.id
    });
  } catch (error) {
    console.error('Stripe Vercel Serverless Function Error:', error.message);
    return res.status(500).json({ error: error.message });
  }
}
