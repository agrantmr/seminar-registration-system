const Stripe = require('stripe');
const { addRegistration, getRegistrationCount } = require('../lib/db');

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

module.exports = async (req, res) => {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { quantity, name, email } = req.body;

    // Validate input
    if (!quantity || !name || !email) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const numSeats = parseInt(quantity);
    if (numSeats < 1 || numSeats > 10) {
      return res.status(400).json({ error: 'Invalid quantity' });
    }

    // Check seat availability
    const registeredSeats = await getRegistrationCount();
    const totalSeats = parseInt(process.env.TOTAL_SEATS || '40');

    if (registeredSeats + numSeats > totalSeats) {
      return res.status(400).json({
        error: `Not enough seats available. ${totalSeats - registeredSeats} seats remaining.`
      });
    }

    // Create Stripe Checkout Session
    const baseUrl = process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : process.env.BASE_URL || 'https://proseminars.org';

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: 'price_1T7eoXGf2Q3g0T8EJI646DCP',
          quantity: numSeats
        }
      ],
      customer_email: email,
      mode: 'payment',
      success_url: `${baseUrl}/payment-success.html?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/pay.html`,
      metadata: {
        attendee_name: name,
        attendee_email: email,
        num_seats: numSeats
      }
    });

    return res.status(200).json({
      success: true,
      sessionUrl: session.url,
      sessionId: session.id
    });

  } catch (error) {
    console.error('Error creating checkout session:', error);

    return res.status(500).json({
      error: 'Failed to create payment session',
      message: error.message
    });
  }
};
