const { requireAuth } = require('../../lib/auth');
const { getAllRegistrations } = require('../../lib/db');

async function handler(req, res) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const registrations = await getAllRegistrations();

    // Generate CSV
    const headers = [
      'ID',
      'First Name',
      'Email',
      'Where Heard',
      'Number of Seats',
      'Registered At',
      'Confirmation Sent',
      'Week Reminder Sent',
      'Day Reminder Sent',
      'Attended',
      'Thank You Sent'
    ];

    const rows = registrations.map(reg => [
      reg.id,
      reg.first_name,
      reg.email,
      reg.where_heard || '',
      reg.num_seats || 1,
      new Date(reg.registered_at).toISOString(),
      reg.confirmation_sent ? 'Yes' : 'No',
      reg.week_reminder_sent ? 'Yes' : 'No',
      reg.day_reminder_sent ? 'Yes' : 'No',
      reg.attended ? 'Yes' : 'No',
      reg.thankyou_sent ? 'Yes' : 'No'
    ]);

    const csv = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=registrations.csv');
    res.status(200).send(csv);
  } catch (error) {
    console.error('Error in export endpoint:', error);
    res.status(500).json({ error: 'Failed to export registrations' });
  }
}

module.exports = requireAuth(handler);
