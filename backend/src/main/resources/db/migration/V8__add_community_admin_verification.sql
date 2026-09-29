-- V8: Add Community Admin Document Verification and Review Columns to Apartments Table

ALTER TABLE apartments
    ADD COLUMN IF NOT EXISTS verification_status VARCHAR(30) NOT NULL DEFAULT 'ACTIVE',
    ADD COLUMN IF NOT EXISTS document_url TEXT,
    ADD COLUMN IF NOT EXISTS document_file_name VARCHAR(255),
    ADD COLUMN IF NOT EXISTS document_type VARCHAR(100),
    ADD COLUMN IF NOT EXISTS verification_notes TEXT,
    ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMP,
    ADD COLUMN IF NOT EXISTS reviewed_by_admin_id BIGINT;

CREATE INDEX IF NOT EXISTS idx_apartments_verification_status ON apartments(verification_status);
