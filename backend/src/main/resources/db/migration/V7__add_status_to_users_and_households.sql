-- V7: Add status column to users and households tables for account active/inactive/blocked control

-- 1. Add status column to users table
ALTER TABLE users
    ADD COLUMN IF NOT EXISTS status VARCHAR(30) NOT NULL DEFAULT 'ACTIVE';

CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);

-- 2. Add status column to households table
ALTER TABLE households
    ADD COLUMN IF NOT EXISTS status VARCHAR(30) NOT NULL DEFAULT 'ACTIVE';

CREATE INDEX IF NOT EXISTS idx_households_status ON households(status);
