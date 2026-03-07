-- Add where_heard column to registrations table
ALTER TABLE registrations ADD COLUMN where_heard VARCHAR(255);

-- Add comment
COMMENT ON COLUMN registrations.where_heard IS 'Where the registrant heard about this seminar';
