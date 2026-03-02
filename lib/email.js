const { Resend } = require('resend');
const fs = require('fs');
const path = require('path');

const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Load email template and replace variables
 */
function loadTemplate(templateName, variables) {
  const templatePath = path.join(process.cwd(), 'emails', `${templateName}.html`);
  let template = fs.readFileSync(templatePath, 'utf-8');

  // Replace all variables
  Object.keys(variables).forEach(key => {
    const regex = new RegExp(`{{${key}}}`, 'g');
    template = template.replace(regex, variables[key]);
  });

  return template;
}

/**
 * Send confirmation email
 */
async function sendConfirmationEmail(firstName, email) {
  const variables = {
    firstName,
    eventDate: formatEventDate(process.env.EVENT_DATE),
    eventTime: process.env.EVENT_TIME,
    eventLocation: process.env.EVENT_LOCATION
  };

  const html = loadTemplate('confirmation', variables);

  try {
    const result = await resend.emails.send({
      from: process.env.EMAIL_FROM,
      to: email,
      subject: 'Registration Confirmed - A Beginner\'s Guide to AI',
      html
    });

    return { success: true, id: result.id };
  } catch (error) {
    console.error('Error sending confirmation email:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Send week reminder email
 */
async function sendWeekReminderEmail(firstName, email) {
  const variables = {
    firstName,
    eventDate: formatEventDate(process.env.EVENT_DATE),
    eventTime: process.env.EVENT_TIME,
    eventLocation: process.env.EVENT_LOCATION
  };

  const html = loadTemplate('reminder-week', variables);

  try {
    const result = await resend.emails.send({
      from: process.env.EMAIL_FROM,
      to: email,
      subject: 'Reminder: One Week Until A Beginner\'s Guide to AI',
      html
    });

    return { success: true, id: result.id };
  } catch (error) {
    console.error('Error sending week reminder email:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Send day reminder email
 */
async function sendDayReminderEmail(firstName, email) {
  const variables = {
    firstName,
    eventDate: formatEventDate(process.env.EVENT_DATE),
    eventTime: process.env.EVENT_TIME,
    eventLocation: process.env.EVENT_LOCATION
  };

  const html = loadTemplate('reminder-day', variables);

  try {
    const result = await resend.emails.send({
      from: process.env.EMAIL_FROM,
      to: email,
      subject: 'Tomorrow: A Beginner\'s Guide to AI',
      html
    });

    return { success: true, id: result.id };
  } catch (error) {
    console.error('Error sending day reminder email:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Format date for email display
 */
function formatEventDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

module.exports = {
  sendConfirmationEmail,
  sendWeekReminderEmail,
  sendDayReminderEmail
};
