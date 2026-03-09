const { addRegistration, markConfirmationSent, getRegistrationCount } = require('../lib/db');
const { sendConfirmationEmail, sendAdminNotificationEmail } = require('../lib/email');
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
    const { firstName, email, whereHeard } = req.body;

    // Validate input
    if (!firstName || !email || !whereHeard) {
      return res.status(400).json({ error: 'First name, email, and where you heard about us are required' });
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
    const result = await addRegistration(sanitizedName, sanitizedEmail, clientIP, whereHeard);

    if (!result.success) {
      return res.status(400).json({ error: result.message });
    }

    // Send confirmation email and mark as sent
    const emailResult = await sendConfirmationEmail(result.registration.first_name, result.registration.email);

    if (emailResult.success) {
      console.log('✉️ Email sent successfully for ID:', result.registration.id);
      try {
        await markConfirmationSent(result.registration.id);
        console.log('✅ Database updated - confirmation_sent = true');
      } catch (markError) {
        console.error('❌ Failed to update database:', markError);
      }
    } else {
      console.error('❌ Email failed:', emailResult.error);
    }

    // Send admin notification
    try {
      const totalRegistrations = await getRegistrationCount();
      const adminNotification = await sendAdminNotificationEmail(
        result.registration.first_name,
        result.registration.email,
        totalRegistrations
      );

      if (adminNotification.success) {
        console.log('✉️ Admin notification sent successfully');
      } else {
        console.error('❌ Admin notification failed:', adminNotification.error);
      }
    } catch (adminError) {
      console.error('❌ Error sending admin notification:', adminError);
      // Don't fail the registration if admin notification fails
    }

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
