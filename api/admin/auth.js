const { verifyAdminPassword, generateToken } = require('../../lib/auth');

module.exports = async (req, res) => {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({ error: 'Password is required' });
    }

    const isValid = await verifyAdminPassword(password);

    if (!isValid) {
      return res.status(401).json({ error: 'Invalid password' });
    }

    const token = generateToken();

    res.status(200).json({
      success: true,
      token
    });
  } catch (error) {
    console.error('Error in admin auth endpoint:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
};
