-- V3: Billing, Tiered Tariffs, Bulk Tankers and Razorpay Upgrade

-- 1. Upgrade Tariff Plans table
ALTER TABLE tariff_plans 
    ADD COLUMN IF NOT EXISTS base_maintenance_fee DOUBLE PRECISION NOT NULL DEFAULT 150.0,
    ADD COLUMN IF NOT EXISTS mid_rate_per_kl DOUBLE PRECISION NOT NULL DEFAULT 25.0,
    ADD COLUMN IF NOT EXISTS mid_tier_limit_kl DOUBLE PRECISION NOT NULL DEFAULT 25.0,
    ADD COLUMN IF NOT EXISTS apportionment_method VARCHAR(50) NOT NULL DEFAULT 'BY_FLAT_AREA';

-- 2. Upgrade Bulk Purchases table
ALTER TABLE bulk_purchases
    ADD COLUMN IF NOT EXISTS vendor_name VARCHAR(150);

-- 3. Upgrade Invoices table
ALTER TABLE invoices
    DROP CONSTRAINT IF EXISTS invoices_cycle_id_fkey,
    DROP CONSTRAINT IF EXISTS uq_household_cycle;

ALTER TABLE invoices
    ALTER COLUMN cycle_id DROP NOT NULL,
    ADD COLUMN IF NOT EXISTS invoice_number VARCHAR(100),
    ADD COLUMN IF NOT EXISTS billing_month VARCHAR(20),
    ADD COLUMN IF NOT EXISTS meter_reading_start_kl DOUBLE PRECISION DEFAULT 0.0,
    ADD COLUMN IF NOT EXISTS meter_reading_end_kl DOUBLE PRECISION DEFAULT 0.0,
    ADD COLUMN IF NOT EXISTS consumption_kl DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    ADD COLUMN IF NOT EXISTS metered_charge DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    ADD COLUMN IF NOT EXISTS due_date DATE DEFAULT (CURRENT_DATE + INTERVAL '15 days'),
    ADD COLUMN IF NOT EXISTS status VARCHAR(30) NOT NULL DEFAULT 'PENDING',
    ADD COLUMN IF NOT EXISTS payment_method VARCHAR(50),
    ADD COLUMN IF NOT EXISTS razorpay_order_id VARCHAR(100),
    ADD COLUMN IF NOT EXISTS razorpay_payment_id VARCHAR(100),
    ADD COLUMN IF NOT EXISTS razorpay_signature VARCHAR(255),
    ADD COLUMN IF NOT EXISTS paid_at TIMESTAMP;

CREATE UNIQUE INDEX IF NOT EXISTS uq_invoice_number ON invoices(invoice_number);
CREATE UNIQUE INDEX IF NOT EXISTS uq_household_billing_month ON invoices(household_id, billing_month);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);
CREATE INDEX IF NOT EXISTS idx_invoices_billing_month ON invoices(billing_month);
