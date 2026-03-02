const { getRegistrationCount } = require('../lib/db');

module.exports = async (req, res) => {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const registeredSeats = await getRegistrationCount();
    const totalSeats = parseInt(process.env.TOTAL_SEATS || '40');

    res.status(200).json({
      totalSeats,
      registeredSeats,
      availableSeats: Math.max(0, totalSeats - registeredSeats)
    });
  } catch (error) {
    console.error('Error in seats endpoint:', error);
    res.status(500).json({ error: 'Failed to fetch seat information' });
  }
};
