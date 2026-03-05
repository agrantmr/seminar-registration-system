-- Database schema for seminar registration system
-- Run this SQL in your Vercel Postgres database

CREATE TABLE registrations (
  id SERIAL PRIMARY KEY,
  first_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  confirmation_sent BOOLEAN DEFAULT FALSE,
  week_reminder_sent BOOLEAN DEFAULT FALSE,
  day_reminder_sent BOOLEAN DEFAULT FALSE,
  attended BOOLEAN DEFAULT FALSE,
  thankyou_sent BOOLEAN DEFAULT FALSE,
  ip_address VARCHAR(45),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for better query performance
CREATE INDEX idx_email ON registrations(email);
CREATE INDEX idx_registered_at ON registrations(registered_at);

-- Feedback table for post-seminar feedback
CREATE TABLE feedback (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL,
  feedback TEXT NOT NULL,
  ip_address VARCHAR(45),
  submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_feedback_submitted_at ON feedback(submitted_at);

-- Optional: Add comments to document the schema
COMMENT ON TABLE registrations IS 'Stores all seminar registrations';
COMMENT ON COLUMN registrations.first_name IS 'Registrant first name';
COMMENT ON COLUMN registrations.email IS 'Registrant email address (unique)';
COMMENT ON COLUMN registrations.registered_at IS 'Timestamp of registration';
COMMENT ON COLUMN registrations.confirmation_sent IS 'Whether confirmation email was sent';
COMMENT ON COLUMN registrations.week_reminder_sent IS 'Whether 1-week reminder was sent';
COMMENT ON COLUMN registrations.day_reminder_sent IS 'Whether 1-day reminder was sent';
COMMENT ON COLUMN registrations.attended IS 'Whether registrant actually attended the event';
COMMENT ON COLUMN registrations.thankyou_sent IS 'Whether thank you email was sent';
COMMENT ON COLUMN registrations.ip_address IS 'IP address for rate limiting';

COMMENT ON TABLE feedback IS 'Stores post-seminar feedback submissions';
COMMENT ON COLUMN feedback.name IS 'Name of person submitting feedback';
COMMENT ON COLUMN feedback.email IS 'Email of person submitting feedback';
COMMENT ON COLUMN feedback.feedback IS 'Feedback content';
COMMENT ON COLUMN feedback.ip_address IS 'IP address for rate limiting';
COMMENT ON COLUMN feedback.submitted_at IS 'Timestamp of submission';
