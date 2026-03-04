const { requireAuth } = require('../../../lib/auth');
const { neon } = require('@neondatabase/serverless');

// Create SQL client
const sql = neon(process.env.POSTGRES_URL || process.env.DATABASE_URL);

async function handler(req, res) {
  // Only allow DELETE requests
  if (req.method !== 'DELETE') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { id } = req.query;

    if (!id) {
      return res.status(400).json({ error: 'Registration ID is required' });
    }

    // Delete the registration
    const result = await sql`
      DELETE FROM registrations
      WHERE id = ${parseInt(id)}
      RETURNING id, email
    `;

    if (result.length === 0) {
      return res.status(404).json({ error: 'Registration not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Registration deleted successfully',
      deleted: result[0]
    });
  } catch (error) {
    console.error('Error deleting registration:', error);
    res.status(500).json({ error: 'Failed to delete registration' });
  }
}

module.exports = requireAuth(handler);
