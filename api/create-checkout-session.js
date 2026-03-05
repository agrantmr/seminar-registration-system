const Stripe = require('stripe');
const { addRegistration } = require('../lib/db');
const { sendConfirmationEmail } = require('../lib/email');

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

module.exports = async (req, res) => {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { quantity, name, email, paymentMethodId } = req.body;

    // Validate input
    if (!quantity || !name || !email || !paymentMethodId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const numSeats = parseInt(quantity);
    if (numSeats < 1 || numSeats > 10) {
      return res.status(400).json({ error: 'Invalid quantity' });
    }

    // Amount in pence: £5 per seat
    const amountInPence = numSeats * 500;

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInPence,
      currency: 'gbp',
      payment_method: paymentMethodId,
      confirm: true,
      automatic_payment_methods: {
        enabled: false
      },
      description: `Seminar Admission - ${numSeats} seat(s)`,
      receipt_email: email,
      metadata: {
        seminar: 'A Beginners Guide to AI',
        seats: numSeats,
        attendee_name: name
      }
    });

    // Check if payment succeeded
    if (paymentIntent.status !== 'succeeded') {
      return res.status(402).json({
        error: 'Payment failed',
        status: paymentIntent.status
      });
    }

    // Get client IP for registration
    const ipAddress = req.headers['x-forwarded-for']?.split(',')[0].trim() ||
                      req.connection.remoteAddress ||
                      'unknown';

    // Add registrations for each seat
    const registrations = [];
    for (let i = 0; i < numSeats; i++) {
      const seatNumber = i + 1;
      const firstName = numSeats === 1 ? name : `${name} (Seat ${seatNumber})`;

      const result = await addRegistration(firstName, email, ipAddress);

      if (result.success) {
        registrations.push(result.registration);

        // Send confirmation email for this registration
        try {
          await sendConfirmationEmail(result.registration.first_name, result.registration.email);
        } catch (emailError) {
          console.error('Error sending confirmation email:', emailError);
          // Don't fail the whole transaction if email fails
        }
      } else if (result.message === 'Event is full') {
        // Refund the payment if event is full
        await stripe.refunds.create({
          payment_intent: paymentIntent.id
        });

        return res.status(400).json({
          error: 'Event is full. Payment has been refunded.',
          seatsRegistered: i
        });
      } else {
        console.error('Registration error:', result.message);
        // Continue with other registrations
      }
    }

    return res.status(200).json({
      success: true,
      message: `Payment successful! ${registrations.length} seat(s) registered.`,
      paymentIntentId: paymentIntent.id,
      amount: amountInPence / 100,
      seats: registrations.length,
      registrations: registrations
    });

  } catch (error) {
    console.error('Error in create-checkout-session:', error);

    // Handle Stripe-specific errors
    if (error.type === 'StripeCardError') {
      return res.status(402).json({
        error: 'Card declined',
        message: error.message
      });
    }

    if (error.type === 'StripeRateLimitError') {
      return res.status(429).json({
        error: 'Too many requests. Please try again.'
      });
    }

    if (error.type === 'StripeAuthenticationError') {
      return res.status(401).json({
        error: 'Authentication error with payment processor'
      });
    }

    return res.status(500).json({
      error: 'Payment processing failed',
      message: error.message
    });
  }
};
