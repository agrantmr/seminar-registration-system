const {
  getRegistrationsForWeekReminder,
  markWeekReminderSent
} = require('../../lib/db');
const { sendWeekReminderEmail } = require('../../lib/email');

module.exports = async (req, res) => {
  // Verify cron secret
  const authHeader = req.headers.authorization;
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const registrations = await getRegistrationsForWeekReminder();

    if (registrations.length === 0) {
      return res.status(200).json({
        success: true,
        message: 'No reminders to send today',
        sent: 0
      });
    }

    let successCount = 0;
    let failCount = 0;

    // Send emails
    for (const registration of registrations) {
      try {
        const result = await sendWeekReminderEmail(
          registration.first_name,
          registration.email
        );

        if (result.success) {
          await markWeekReminderSent(registration.id);
          successCount++;
        } else {
          failCount++;
        }
      } catch (error) {
        console.error(`Failed to send week reminder to ${registration.email}:`, error);
        failCount++;
      }
    }

    res.status(200).json({
      success: true,
      message: `Week reminders sent`,
      sent: successCount,
      failed: failCount,
      total: registrations.length
    });
  } catch (error) {
    console.error('Error in week reminder cron:', error);
    res.status(500).json({ error: 'Failed to send week reminders' });
  }
};
