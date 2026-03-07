-- Add consent column to feedback table
ALTER TABLE feedback ADD COLUMN consent BOOLEAN DEFAULT FALSE;

-- Add comment
COMMENT ON COLUMN feedback.consent IS 'Whether user consented to feedback being used for promotion';
