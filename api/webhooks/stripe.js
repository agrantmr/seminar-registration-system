const Stripe = require('stripe');
const { addRegistration } = require('../../lib/db');
const { sendConfirmationEmail } = require('../../lib/email');

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

module.exports = async (req, res) => {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      webhookSecret
    );
  } catch (error) {
    console.error('Webhook signature verification failed:', error.message);
    return res.status(400).send(`Webhook Error: ${error.message}`);
  }

  try {
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;

      // Get session details
      const fullSession = await stripe.checkout.sessions.retrieve(session.id);

      if (fullSession.payment_status === 'paid') {
        const attendeeName = fullSession.metadata.attendee_name;
        const attendeeEmail = fullSession.metadata.attendee_email;
        const numSeats = parseInt(fullSession.metadata.num_seats);
        const ipAddress = req.headers['x-forwarded-for']?.split(',')[0].trim() ||
                         req.connection.remoteAddress ||
                         'unknown';

        // Add registrations for each seat
        for (let i = 0; i < numSeats; i++) {
          const seatNumber = i + 1;
          const firstName = numSeats === 1 ? attendeeName : `${attendeeName} (Seat ${seatNumber})`;

          try {
            const result = await addRegistration(firstName, attendeeEmail, ipAddress);

            if (result.success) {
              // Send confirmation email
              try {
                await sendConfirmationEmail(result.registration.first_name, result.registration.email);
              } catch (emailError) {
                console.error('Error sending confirmation email:', emailError);
              }
            }
          } catch (error) {
            console.error('Error adding registration:', error);
          }
        }

        console.log(`✅ Successfully processed payment for ${numSeats} seat(s) - ${attendeeEmail}`);
      }
    }

    res.status(200).json({ received: true });

  } catch (error) {
    console.error('Error processing webhook:', error);
    return res.status(500).json({ error: 'Webhook processing failed' });
  }
};
