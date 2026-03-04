const { addRegistration } = require('../lib/db');
const { sendConfirmationEmail } = require('../lib/email');
const { markConfirmationSent } = require('../lib/db');
const {
  isValidEmail,
  sanitizeName,
  checkRateLimit,
  getClientIP
} = require('../lib/utils');

module.exports = async (req, res) => {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { firstName, email } = req.body;

    // Validate input
    if (!firstName || !email) {
      return res.status(400).json({ error: 'First name and email are required' });
    }

    // Sanitize and validate
    const sanitizedName = sanitizeName(firstName);
    const sanitizedEmail = email.trim().toLowerCase();

    if (!sanitizedName || sanitizedName.length < 2) {
      return res.status(400).json({ error: 'Please enter a valid first name' });
    }

    if (!isValidEmail(sanitizedEmail)) {
      return res.status(400).json({ error: 'Please enter a valid email address' });
    }

    // Check rate limit
    const clientIP = getClientIP(req);
    const rateLimit = checkRateLimit(clientIP);

    if (!rateLimit.allowed) {
      const resetMinutes = Math.ceil((rateLimit.resetAt - Date.now()) / 60000);
      return res.status(429).json({
        error: `Too many registration attempts. Please try again in ${resetMinutes} minutes.`
      });
    }

    // Attempt to add registration
    const result = await addRegistration(sanitizedName, sanitizedEmail, clientIP);

    if (!result.success) {
      return res.status(400).json({ error: result.message });
    }

    // Send confirmation email (async, don't wait)
    sendConfirmationEmail(result.registration.first_name, result.registration.email)
      .then(async (emailResult) => {
        if (emailResult.success) {
          console.log('Email sent successfully, marking as sent for ID:', result.registration.id);
          try {
            await markConfirmationSent(result.registration.id);
            console.log('✅ Marked confirmation as sent for ID:', result.registration.id);
          } catch (markError) {
            console.error('❌ Failed to mark confirmation as sent:', markError);
          }
        } else {
          console.error('Email failed to send:', emailResult.error);
        }
      })
      .catch(err => console.error('Failed to send confirmation email:', err));

    // Return success
    res.status(200).json({
      success: true,
      message: 'Registration successful! Check your email for confirmation.',
      seatsRemaining: result.seatsRemaining
    });
  } catch (error) {
    console.error('Error in register endpoint:', error);
    res.status(500).json({ error: 'Registration failed. Please try again.' });
  }
};
