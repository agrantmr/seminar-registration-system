const { requireAuth } = require('../../lib/auth');
const { getAttendees, markThankyouSent } = require('../../lib/db');
const { sendThankyouEmail } = require('../../lib/email');

async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const attendees = await getAttendees();

    if (attendees.length === 0) {
      return res.status(200).json({
        success: true,
        message: 'No attendees to send emails to',
        sent: 0,
        failed: 0,
        total: 0
      });
    }

    let successCount = 0;
    let failureCount = 0;

    for (const attendee of attendees) {
      const emailResult = await sendThankyouEmail(attendee.first_name, attendee.email);

      if (emailResult.success) {
        await markThankyouSent(attendee.id);
        successCount++;
      } else {
        failureCount++;
      }
    }

    res.status(200).json({
      success: true,
      message: `Thank you emails sent to ${successCount} attendees`,
      sent: successCount,
      failed: failureCount,
      total: attendees.length
    });
  } catch (error) {
    console.error('Error sending thank you emails:', error);
    res.status(500).json({ error: 'Failed to send thank you emails' });
  }
}

module.exports = requireAuth(handler);
