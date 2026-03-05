const {
  getRegistrationsForWeekReminder,
  getRegistrationsForDayReminder,
  markWeekReminderSent,
  markDayReminderSent
} = require('../../lib/db');
const { sendWeekReminderEmail, sendDayReminderEmail } = require('../../lib/email');

module.exports = async (req, res) => {
  // Verify cron secret
  const authHeader = req.headers.authorization;
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    let weekSuccessCount = 0;
    let weekFailCount = 0;
    let daySuccessCount = 0;
    let dayFailCount = 0;

    // Send week reminders (7 days before)
    const weekRegistrations = await getRegistrationsForWeekReminder();

    if (weekRegistrations.length > 0) {
      for (const registration of weekRegistrations) {
        try {
          const result = await sendWeekReminderEmail(
            registration.first_name,
            registration.email
          );

          if (result.success) {
            await markWeekReminderSent(registration.id);
            weekSuccessCount++;
          } else {
            weekFailCount++;
          }
        } catch (error) {
          console.error(`Failed to send week reminder to ${registration.email}:`, error);
          weekFailCount++;
        }
      }
    }

    // Send day reminders (1 day before)
    const dayRegistrations = await getRegistrationsForDayReminder();

    if (dayRegistrations.length > 0) {
      for (const registration of dayRegistrations) {
        try {
          const result = await sendDayReminderEmail(
            registration.first_name,
            registration.email
          );

          if (result.success) {
            await markDayReminderSent(registration.id);
            daySuccessCount++;
          } else {
            dayFailCount++;
          }
        } catch (error) {
          console.error(`Failed to send day reminder to ${registration.email}:`, error);
          dayFailCount++;
        }
      }
    }

    res.status(200).json({
      success: true,
      weekReminders: {
        sent: weekSuccessCount,
        failed: weekFailCount,
        total: weekRegistrations.length
      },
      dayReminders: {
        sent: daySuccessCount,
        failed: dayFailCount,
        total: dayRegistrations.length
      }
    });
  } catch (error) {
    console.error('Error in reminder cron:', error);
    res.status(500).json({ error: 'Failed to send reminders' });
  }
};
