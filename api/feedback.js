const { addFeedback } = require('../lib/db');
const { sanitizeName, isValidEmail, checkRateLimit, getClientIP } = require('../lib/utils');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { name, email, feedback, consent } = req.body;

    // Validate input
    if (!name || !email || !feedback || !consent) {
      return res.status(400).json({ error: 'Name, email, feedback, and consent are required' });
    }

    const sanitizedName = sanitizeName(name);
    const sanitizedEmail = email.trim().toLowerCase();

    if (!sanitizedName || sanitizedName.length < 2) {
      return res.status(400).json({ error: 'Please enter a valid name' });
    }

    if (!isValidEmail(sanitizedEmail)) {
      return res.status(400).json({ error: 'Please enter a valid email address' });
    }

    if (!feedback.trim() || feedback.trim().length < 10) {
      return res.status(400).json({ error: 'Please provide meaningful feedback (at least 10 characters)' });
    }

    if (consent !== true) {
      return res.status(400).json({ error: 'You must consent to feedback submission' });
    }

    // Check rate limit
    const clientIP = getClientIP(req);
    const rateLimit = checkRateLimit(clientIP);

    if (!rateLimit.allowed) {
      const resetMinutes = Math.ceil((rateLimit.resetAt - Date.now()) / 60000);
      return res.status(429).json({
        error: `Too many submissions. Please try again in ${resetMinutes} minutes.`
      });
    }

    const result = await addFeedback(sanitizedName, sanitizedEmail, feedback.trim(), clientIP, consent);

    res.status(200).json({
      success: true,
      message: 'Thank you for your feedback!'
    });
  } catch (error) {
    console.error('Error in feedback endpoint:', error);
    res.status(500).json({ error: 'Failed to submit feedback. Please try again.' });
  }
};
