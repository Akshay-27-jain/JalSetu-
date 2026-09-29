-- V6: Upgrade support_tickets and announcements for multi-tier escalation and broadcasts

-- 1. Upgrade support_tickets
ALTER TABLE support_tickets
    ADD COLUMN IF NOT EXISTS is_escalated_to_main_admin BOOLEAN NOT NULL DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS escalation_reason TEXT,
    ADD COLUMN IF NOT EXISTS escalated_at TIMESTAMP,
    ADD COLUMN IF NOT EXISTS ticket_scope VARCHAR(50) DEFAULT 'HOUSEHOLD',
    ADD COLUMN IF NOT EXISTS main_admin_notes TEXT,
    ADD COLUMN IF NOT EXISTS resolved_by_role VARCHAR(30);

CREATE INDEX IF NOT EXISTS idx_support_tickets_escalated ON support_tickets(is_escalated_to_main_admin);
CREATE INDEX IF NOT EXISTS idx_support_tickets_scope ON support_tickets(ticket_scope);

-- 2. Upgrade announcements
ALTER TABLE announcements
    ALTER COLUMN apartment_id DROP NOT NULL;

ALTER TABLE announcements
    ADD COLUMN IF NOT EXISTS is_main_admin_broadcast BOOLEAN NOT NULL DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS target_apartment_id BIGINT,
    ADD COLUMN IF NOT EXISTS forwarded_to_residents_by_email BOOLEAN NOT NULL DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS forwarded_at TIMESTAMP,
    ADD COLUMN IF NOT EXISTS forwarded_by_admin_name VARCHAR(100);

CREATE INDEX IF NOT EXISTS idx_announcements_broadcast ON announcements(is_main_admin_broadcast);
CREATE INDEX IF NOT EXISTS idx_announcements_target_apt ON announcements(target_apartment_id);
