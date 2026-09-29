-- V10: Add initial password column to users table for welcome and approval credential emails
ALTER TABLE users ADD COLUMN IF NOT EXISTS initial_password VARCHAR(100);
