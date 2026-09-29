-- V2__seed_main_admin.sql: Seed Initial MAIN_ADMIN user
-- Email: admin@aquatrack.com
-- Password: Admin@12345 (BCrypt hash)

INSERT INTO users (email, password_hash, full_name, role, apartment_id, household_id, created_at)
VALUES (
    'admin@aquatrack.com',
    '$2a$10$7Kg.3Q.E6rVf8tQG6Z6Zk.X6B9yR8eJ1fQ5rU3xP7sA9dC5bE8uGm',
    'Main Administrator',
    'MAIN_ADMIN',
    NULL,
    NULL,
    CURRENT_TIMESTAMP
) ON CONFLICT (email) DO NOTHING;
