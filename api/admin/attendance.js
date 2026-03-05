const { requireAuth } = require('../../lib/auth');
const { markAttended } = require('../../lib/db');

async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { id, attended } = req.body;

    if (!id) {
      return res.status(400).json({ error: 'Registration ID is required' });
    }

    await markAttended(parseInt(id), attended);

    res.status(200).json({
      success: true,
      message: 'Attendance updated successfully'
    });
  } catch (error) {
    console.error('Error updating attendance:', error);
    res.status(500).json({ error: 'Failed to update attendance' });
  }
}

module.exports = requireAuth(handler);
