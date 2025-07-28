-- Migration to update the messages table for bidirectional messaging

-- Add new columns to existing messages table
ALTER TABLE messages
    ADD COLUMN message_type VARCHAR(20) NOT NULL DEFAULT 'HR_TO_INTERN',
ADD COLUMN recipient_id BIGINT NULL,
ADD CONSTRAINT fk_messages_recipient FOREIGN KEY (recipient_id) REFERENCES users(id) ON DELETE CASCADE;

-- Create index for recipient_id
CREATE INDEX idx_messages_recipient_id ON messages(recipient_id);

-- Create index for message_type
CREATE INDEX idx_messages_type ON messages(message_type);

-- Create composite index for recipient queries
CREATE INDEX idx_messages_recipient_type_read ON messages(recipient_id, message_type, is_read);

-- Create composite index for intern queries
CREATE INDEX idx_messages_intern_type_read ON messages(intern_id, message_type, is_read);

-- Update existing records to have the correct message_type
UPDATE messages SET message_type = 'HR_TO_INTERN' WHERE message_type IS NULL OR message_type = '';

-- Add check constraint for message_type
ALTER TABLE messages
    ADD CONSTRAINT chk_message_type
        CHECK (message_type IN ('HR_TO_INTERN', 'INTERN_TO_HR'));

-- Optional: Add comment to explain the schema
COMMENT ON COLUMN messages.message_type IS 'Type of message: HR_TO_INTERN or INTERN_TO_HR';
COMMENT ON COLUMN messages.recipient_id IS 'For INTERN_TO_HR messages, this is the HR user receiving the message';

-- Sample query to verify the migration
-- SELECT
--     m.id,
--     m.subject,
--     m.message_type,
--     s.first_name || ' ' || s.last_name as sender_name,
--     i.first_name || ' ' || i.last_name as intern_name,
--     CASE
--         WHEN m.recipient_id IS NOT NULL THEN r.first_name || ' ' || r.last_name
--         ELSE NULL
--     END as recipient_name
-- FROM messages m
-- JOIN users s ON m.sender_id = s.id
-- JOIN interns i ON m.intern_id = i.id
-- LEFT JOIN users r ON m.recipient_id = r.id
-- ORDER BY m.sent_at DESC;