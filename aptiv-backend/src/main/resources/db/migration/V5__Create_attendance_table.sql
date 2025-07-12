CREATE TABLE attendance (
                            id BIGSERIAL PRIMARY KEY,
                            attendance_date DATE NOT NULL,
                            check_in_time TIME,
                            check_out_time TIME,
                            status VARCHAR(50) NOT NULL DEFAULT 'PRESENT' CHECK (status IN ('PRESENT', 'ABSENT', 'LATE', 'PARTIAL')),
                            remarks TEXT,
                            intern_id BIGINT NOT NULL,
                            FOREIGN KEY (intern_id) REFERENCES interns(id) ON DELETE CASCADE
);

CREATE INDEX idx_attendance_intern_id ON attendance(intern_id);
CREATE INDEX idx_attendance_date ON attendance(attendance_date);
CREATE UNIQUE INDEX idx_attendance_intern_date ON attendance(intern_id, attendance_date);