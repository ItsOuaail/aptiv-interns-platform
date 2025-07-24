CREATE TABLE notifications (
                               id BIGSERIAL PRIMARY KEY,
                               title VARCHAR(255) NOT NULL,
                               message TEXT NOT NULL,
                               type VARCHAR(50) NOT NULL CHECK (type IN ('INTERNSHIP_ENDING', 'ABSENCE_ALERT', 'DOCUMENT_UPLOADED', 'ACTIVITY_REMINDER', 'MESSAGE_FROM_HR', 'WELCOME_MESSAGE')),
                               is_read BOOLEAN NOT NULL DEFAULT FALSE,
                               user_id BIGINT NOT NULL,
                               intern_id BIGINT,
                               created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                               FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                               FOREIGN KEY (intern_id) REFERENCES interns(id) ON DELETE SET NULL
);

CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_intern_id ON notifications(intern_id);
CREATE INDEX idx_notifications_type ON notifications(type);
CREATE INDEX idx_notifications_created_at ON notifications(created_at);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);