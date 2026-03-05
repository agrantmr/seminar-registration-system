const Stripe = require('stripe');

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

module.exports = async (req, res) => {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { sessionId } = req.body;

    if (!sessionId) {
      return res.status(400).json({ error: 'Missing session ID' });
    }

    // Retrieve the checkout session
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status !== 'paid') {
      return res.status(400).json({
        success: false,
        error: 'Payment not completed'
      });
    }

    // Calculate amount in pounds
    const amountInPence = session.amount_total;
    const amountInPounds = amountInPence / 100;

    return res.status(200).json({
      success: true,
      seats: parseInt(session.metadata.num_seats),
      amount: amountInPounds,
      email: session.customer_email || session.metadata.attendee_email,
      status: session.payment_status
    });

  } catch (error) {
    console.error('Error verifying checkout session:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to verify session'
    });
  }
};
