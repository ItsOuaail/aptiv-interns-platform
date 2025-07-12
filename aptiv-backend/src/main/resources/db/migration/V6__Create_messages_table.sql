CREATE TABLE messages (
                          id BIGSERIAL PRIMARY KEY,
                          subject VARCHAR(255) NOT NULL,
                          content TEXT NOT NULL,
                          is_read BOOLEAN NOT NULL DEFAULT FALSE,
                          intern_id BIGINT NOT NULL,
                          sender_id BIGINT NOT NULL,
                          sent_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                          FOREIGN KEY (intern_id) REFERENCES interns(id) ON DELETE CASCADE,
                          FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_messages_intern_id ON messages(intern_id);
CREATE INDEX idx_messages_sender_id ON messages(sender_id);
CREATE INDEX idx_messages_sent_at ON messages(sent_at);
CREATE INDEX idx_messages_is_read ON messages(is_read);