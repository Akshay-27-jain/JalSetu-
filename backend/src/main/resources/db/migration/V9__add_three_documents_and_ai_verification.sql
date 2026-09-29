-- V9: Add 3 Mandatory Verification Documents and AI Authenticity Verification to Users and Apartments

-- 1. Upgrade users table for 3 mandatory documents and AI verification audit trail
ALTER TABLE users
    ADD COLUMN IF NOT EXISTS doc1_type VARCHAR(100),
    ADD COLUMN IF NOT EXISTS doc1_file_name VARCHAR(255),
    ADD COLUMN IF NOT EXISTS doc1_url TEXT,
    ADD COLUMN IF NOT EXISTS doc2_type VARCHAR(100),
    ADD COLUMN IF NOT EXISTS doc2_file_name VARCHAR(255),
    ADD COLUMN IF NOT EXISTS doc2_url TEXT,
    ADD COLUMN IF NOT EXISTS doc3_type VARCHAR(100),
    ADD COLUMN IF NOT EXISTS doc3_file_name VARCHAR(255),
    ADD COLUMN IF NOT EXISTS doc3_url TEXT,
    ADD COLUMN IF NOT EXISTS ai_verification_score DOUBLE PRECISION DEFAULT 0.0,
    ADD COLUMN IF NOT EXISTS ai_verification_status VARCHAR(50) DEFAULT 'PENDING_SCAN',
    ADD COLUMN IF NOT EXISTS ai_verification_summary TEXT,
    ADD COLUMN IF NOT EXISTS ai_extracted_data_json TEXT,
    ADD COLUMN IF NOT EXISTS ai_verified_at TIMESTAMP,
    ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMP,
    ADD COLUMN IF NOT EXISTS reviewed_by_admin_id BIGINT,
    ADD COLUMN IF NOT EXISTS verification_notes TEXT;

CREATE INDEX IF NOT EXISTS idx_users_ai_verification_status ON users(ai_verification_status);

-- 2. Upgrade apartments table for 3 mandatory documents and AI verification audit trail
ALTER TABLE apartments
    ADD COLUMN IF NOT EXISTS doc1_type VARCHAR(100),
    ADD COLUMN IF NOT EXISTS doc1_file_name VARCHAR(255),
    ADD COLUMN IF NOT EXISTS doc1_url TEXT,
    ADD COLUMN IF NOT EXISTS doc2_type VARCHAR(100),
    ADD COLUMN IF NOT EXISTS doc2_file_name VARCHAR(255),
    ADD COLUMN IF NOT EXISTS doc2_url TEXT,
    ADD COLUMN IF NOT EXISTS doc3_type VARCHAR(100),
    ADD COLUMN IF NOT EXISTS doc3_file_name VARCHAR(255),
    ADD COLUMN IF NOT EXISTS doc3_url TEXT,
    ADD COLUMN IF NOT EXISTS ai_verification_score DOUBLE PRECISION DEFAULT 0.0,
    ADD COLUMN IF NOT EXISTS ai_verification_status VARCHAR(50) DEFAULT 'PENDING_SCAN',
    ADD COLUMN IF NOT EXISTS ai_verification_summary TEXT,
    ADD COLUMN IF NOT EXISTS ai_extracted_data_json TEXT,
    ADD COLUMN IF NOT EXISTS ai_verified_at TIMESTAMP;

CREATE INDEX IF NOT EXISTS idx_apartments_ai_verification_status ON apartments(ai_verification_status);
