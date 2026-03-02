const { requireAuth } = require('../../lib/auth');
const { getAllRegistrations } = require('../../lib/db');

async function handler(req, res) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const registrations = await getAllRegistrations();

    res.status(200).json({
      success: true,
      registrations
    });
  } catch (error) {
    console.error('Error in registrations endpoint:', error);
    res.status(500).json({ error: 'Failed to fetch registrations' });
  }
}

module.exports = requireAuth(handler);
