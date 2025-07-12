CREATE TABLE activities (
                            id BIGSERIAL PRIMARY KEY,
                            activity_date DATE NOT NULL,
                            description TEXT NOT NULL,
                            intern_id BIGINT NOT NULL,
                            created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                            FOREIGN KEY (intern_id) REFERENCES interns(id) ON DELETE CASCADE
);

CREATE INDEX idx_activities_intern_id ON activities(intern_id);
CREATE INDEX idx_activities_activity_date ON activities(activity_date);
CREATE UNIQUE INDEX idx_activities_intern_date ON activities(intern_id, activity_date);