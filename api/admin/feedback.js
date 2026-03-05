const { requireAuth } = require('../../lib/auth');
const { getAllFeedback } = require('../../lib/db');

async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const feedback = await getAllFeedback();

    res.status(200).json({
      success: true,
      feedback
    });
  } catch (error) {
    console.error('Error in feedback endpoint:', error);
    res.status(500).json({ error: 'Failed to fetch feedback' });
  }
}

module.exports = requireAuth(handler);
