CREATE TABLE interns (
                         id BIGSERIAL PRIMARY KEY,
                         first_name VARCHAR(255) NOT NULL,
                         last_name VARCHAR(255) NOT NULL,
                         email VARCHAR(255) NOT NULL UNIQUE,
                         phone VARCHAR(20) NOT NULL,
                         university VARCHAR(255) NOT NULL,
                         major VARCHAR(255) NOT NULL,
                         start_date DATE NOT NULL,
                         end_date DATE NOT NULL,
                         supervisor VARCHAR(255) NOT NULL,
                         department VARCHAR(255) NOT NULL,
                         status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'COMPLETED', 'TERMINATED')),
                         hr_user_id BIGINT NOT NULL,
                         created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                         updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                         FOREIGN KEY (hr_user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_interns_email ON interns(email);
CREATE INDEX idx_interns_hr_user_id ON interns(hr_user_id);
CREATE INDEX idx_interns_start_date ON interns(start_date);
CREATE INDEX idx_interns_end_date ON interns(end_date);
CREATE INDEX idx_interns_status ON interns(status);