const { neon } = require('@neondatabase/serverless');

// Enable WebSocket for Vercel
if (typeof WebSocket === 'undefined') {
  global.WebSocket = require('ws');
}

// Create SQL client
const sql = neon(process.env.POSTGRES_URL || process.env.DATABASE_URL);

/**
 * Get the current count of registrations
 */
async function getRegistrationCount() {
  try {
    const result = await sql`SELECT COUNT(*) as count FROM registrations`;
    return parseInt(result[0].count);
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
    return result.length > 0;
  } catch (error) {
    console.error('Error checking email:', error);
    throw error;
  }
}

/**
 * Add a new registration with seat limit checking
 */
async function addRegistration(firstName, email, ipAddress, whereHeard) {
  try {
    // Check seat availability first
    const countResult = await sql`SELECT COUNT(*) as count FROM registrations`;
    const currentCount = parseInt(countResult[0].count);
    const totalSeats = parseInt(process.env.TOTAL_SEATS || '40');

    if (currentCount >= totalSeats) {
      return { success: false, message: 'Event is full' };
    }

    // Try to insert registration
    const result = await sql`
      INSERT INTO registrations (first_name, email, ip_address, where_heard)
      VALUES (${firstName}, ${email.toLowerCase()}, ${ipAddress}, ${whereHeard})
      RETURNING id, first_name, email, registered_at
    `;

    return {
      success: true,
      registration: result[0],
      seatsRemaining: totalSeats - currentCount - 1
    };
  } catch (error) {
    // Handle duplicate email constraint
    if (error.code === '23505') {
      return { success: false, message: 'This email is already registered' };
    }

    console.error('Error adding registration:', error);
    throw error;
  }
}

/**
 * Get all registrations (for admin)
 */
async function getAllRegistrations() {
  try {
    const result = await sql`
      SELECT id, first_name, email, registered_at, where_heard,
             confirmation_sent, week_reminder_sent, day_reminder_sent,
             attended, thankyou_sent
      FROM registrations
      ORDER BY registered_at DESC
    `;
    return result;
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
    return result;
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
    return result;
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

/**
 * Toggle attendance status
 */
async function markAttended(registrationId, attended) {
  try {
    await sql`
      UPDATE registrations
      SET attended = ${attended}
      WHERE id = ${registrationId}
    `;
  } catch (error) {
    console.error('Error marking attended:', error);
    throw error;
  }
}

/**
 * Get attendees for thank-you emails
 */
async function getAttendees() {
  try {
    const result = await sql`
      SELECT id, first_name, email
      FROM registrations
      WHERE attended = true AND thankyou_sent = false
    `;
    return result;
  } catch (error) {
    console.error('Error getting attendees:', error);
    throw error;
  }
}

/**
 * Track thank-you email status
 */
async function markThankyouSent(registrationId) {
  try {
    await sql`
      UPDATE registrations
      SET thankyou_sent = true
      WHERE id = ${registrationId}
    `;
  } catch (error) {
    console.error('Error marking thankyou sent:', error);
    throw error;
  }
}

/**
 * Store feedback submissions
 */
async function addFeedback(name, email, feedback, ipAddress, consent) {
  try {
    const result = await sql`
      INSERT INTO feedback (name, email, feedback, ip_address, consent)
      VALUES (${name}, ${email}, ${feedback}, ${ipAddress}, ${consent})
      RETURNING id, name, submitted_at
    `;
    return { success: true, feedback: result[0] };
  } catch (error) {
    console.error('Error adding feedback:', error);
    throw error;
  }
}

/**
 * Get all feedback submissions (for admin)
 */
async function getAllFeedback() {
  try {
    const result = await sql`
      SELECT id, name, email, feedback, consent, submitted_at
      FROM feedback
      ORDER BY submitted_at DESC
    `;
    return result;
  } catch (error) {
    console.error('Error getting all feedback:', error);
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
  markDayReminderSent,
  markAttended,
  getAttendees,
  markThankyouSent,
  addFeedback,
  getAllFeedback
};
