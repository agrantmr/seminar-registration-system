-- Add num_seats column to track number of seats per registration
-- This allows people to register for multiple seats (e.g., bringing a partner or friends)

ALTER TABLE registrations
ADD COLUMN num_seats INTEGER NOT NULL DEFAULT 1;

-- Add a check constraint to ensure num_seats is between 1 and 10
ALTER TABLE registrations
ADD CONSTRAINT num_seats_range CHECK (num_seats >= 1 AND num_seats <= 10);

-- Add comment to document the column
COMMENT ON COLUMN registrations.num_seats IS 'Number of seats being reserved (1-10)';
