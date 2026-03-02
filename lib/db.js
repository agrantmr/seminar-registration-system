const { sql } = require('@vercel/postgres');

/**
 * Get the current count of registrations
 */
async function getRegistrationCount() {
  try {
    const result = await sql`SELECT COUNT(*) as count FROM registrations`;
    return parseInt(result.rows[0].count);
  } catch (error) {
    console.error('Error getting registration count:', error);
    throw error;
  }
}

/**
 * Check if an email is already registered
 */
async function isEmailRegistered(email) {
  try {
    const result = await sql`
      SELECT id FROM registrations
      WHERE email = ${email.toLowerCase()}
    `;
    return result.rows.length > 0;
  } catch (error) {
    console.error('Error checking email:', error);
    throw error;
  }
}

/**
 * Add a new registration with transaction safety for seat limits
 */
async function addRegistration(firstName, email, ipAddress) {
  const client = await sql.connect();

  try {
    // Start transaction
    await client.query('BEGIN');

    // Lock table and check count
    const countResult = await client.query(
      'SELECT COUNT(*) as count FROM registrations FOR UPDATE'
    );
    const currentCount = parseInt(countResult.rows[0].count);
    const totalSeats = parseInt(process.env.TOTAL_SEATS || '40');

    if (currentCount >= totalSeats) {
      await client.query('ROLLBACK');
      return { success: false, message: 'Event is full' };
    }

    // Insert registration
    const result = await client.query(
      `INSERT INTO registrations (first_name, email, ip_address)
       VALUES ($1, $2, $3)
       RETURNING id, first_name, email, registered_at`,
      [firstName, email.toLowerCase(), ipAddress]
    );

    await client.query('COMMIT');

    return {
      success: true,
      registration: result.rows[0],
      seatsRemaining: totalSeats - currentCount - 1
    };
  } catch (error) {
    await client.query('ROLLBACK');

    // Handle duplicate email constraint
    if (error.code === '23505') {
      return { success: false, message: 'This email is already registered' };
    }

    console.error('Error adding registration:', error);
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Get all registrations (for admin)
 */
async function getAllRegistrations() {
  try {
    const result = await sql`
      SELECT id, first_name, email, registered_at,
             confirmation_sent, week_reminder_sent, day_reminder_sent
      FROM registrations
      ORDER BY registered_at DESC
    `;
    return result.rows;
  } catch (error) {
    console.error('Error getting all registrations:', error);
    throw error;
  }
}

/**
 * Get registrations that need week reminder (7 days before event)
 */
async function getRegistrationsForWeekReminder() {
  const eventDate = new Date(process.env.EVENT_DATE);
  const reminderDate = new Date(eventDate);
  reminderDate.setDate(reminderDate.getDate() - 7);

  // Check if today is the reminder date (comparing just the date, not time)
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  reminderDate.setHours(0, 0, 0, 0);

  if (today.getTime() !== reminderDate.getTime()) {
    return []; // Not the right day for reminders
  }

  try {
    const result = await sql`
      SELECT id, first_name, email
      FROM registrations
      WHERE week_reminder_sent = false
    `;
    return result.rows;
  } catch (error) {
    console.error('Error getting week reminder registrations:', error);
    throw error;
  }
}

/**
 * Get registrations that need day reminder (1 day before event)
 */
async function getRegistrationsForDayReminder() {
  const eventDate = new Date(process.env.EVENT_DATE);
  const reminderDate = new Date(eventDate);
  reminderDate.setDate(reminderDate.getDate() - 1);

  // Check if today is the reminder date
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  reminderDate.setHours(0, 0, 0, 0);

  if (today.getTime() !== reminderDate.getTime()) {
    return [];
  }

  try {
    const result = await sql`
      SELECT id, first_name, email
      FROM registrations
      WHERE day_reminder_sent = false
    `;
    return result.rows;
  } catch (error) {
    console.error('Error getting day reminder registrations:', error);
    throw error;
  }
}

/**
 * Mark confirmation email as sent
 */
async function markConfirmationSent(registrationId) {
  try {
    await sql`
      UPDATE registrations
      SET confirmation_sent = true
      WHERE id = ${registrationId}
    `;
  } catch (error) {
    console.error('Error marking confirmation sent:', error);
    throw error;
  }
}

/**
 * Mark week reminder as sent
 */
async function markWeekReminderSent(registrationId) {
  try {
    await sql`
      UPDATE registrations
      SET week_reminder_sent = true
      WHERE id = ${registrationId}
    `;
  } catch (error) {
    console.error('Error marking week reminder sent:', error);
    throw error;
  }
}

/**
 * Mark day reminder as sent
 */
async function markDayReminderSent(registrationId) {
  try {
    await sql`
      UPDATE registrations
      SET day_reminder_sent = true
      WHERE id = ${registrationId}
    `;
  } catch (error) {
    console.error('Error marking day reminder sent:', error);
    throw error;
  }
}

module.exports = {
  getRegistrationCount,
  isEmailRegistered,
  addRegistration,
  getAllRegistrations,
  getRegistrationsForWeekReminder,
  getRegistrationsForDayReminder,
  markConfirmationSent,
  markWeekReminderSent,
  markDayReminderSent
};
