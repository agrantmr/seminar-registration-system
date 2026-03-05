const { requireAuth } = require('../../lib/auth');
const { markAttended, getAttendees, markThankyouSent } = require('../../lib/db');
const { sendThankyouEmail } = require('../../lib/email');

async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { action, id, attended } = req.body;

    // Update attendance
    if (action === 'mark-attendance') {
      if (!id) {
        return res.status(400).json({ error: 'Registration ID is required' });
      }

      await markAttended(parseInt(id), attended);

      return res.status(200).json({
        success: true,
        message: 'Attendance updated successfully'
      });
    }

    // Send thank you emails
    if (action === 'send-thankyou') {
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

      return res.status(200).json({
        success: true,
        message: `Thank you emails sent to ${successCount} attendees`,
        sent: successCount,
        failed: failureCount,
        total: attendees.length
      });
    }

    return res.status(400).json({ error: 'Invalid action' });

  } catch (error) {
    console.error('Error in followup handler:', error);
    res.status(500).json({ error: 'Failed to process followup request' });
  }
}

module.exports = requireAuth(handler);
