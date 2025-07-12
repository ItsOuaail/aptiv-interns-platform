CREATE TABLE documents (
                           id BIGSERIAL PRIMARY KEY,
                           file_name VARCHAR(255) NOT NULL,
                           original_file_name VARCHAR(255) NOT NULL,
                           mime_type VARCHAR(100) NOT NULL,
                           file_size BIGINT NOT NULL,
                           file_path VARCHAR(500) NOT NULL,
                           type VARCHAR(50) NOT NULL CHECK (type IN ('REPORT', 'CERTIFICATE', 'CV', 'OTHER')),
                           comment TEXT,
                           intern_id BIGINT NOT NULL,
                           uploaded_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                           FOREIGN KEY (intern_id) REFERENCES interns(id) ON DELETE CASCADE
);

CREATE INDEX idx_documents_intern_id ON documents(intern_id);
CREATE INDEX idx_documents_type ON documents(type);
CREATE INDEX idx_documents_uploaded_at ON documents(uploaded_at);